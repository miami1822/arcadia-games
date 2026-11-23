/* Arcadia Creator review intake. Disabled unless DATABASE_URL, IP_HASH_SECRET and TURNSTILE_SECRET_KEY are configured. */
import express from 'express';
import helmet from 'helmet';
import multer from 'multer';
import pg from 'pg';
import yauzl from 'yauzl';
import {readFile} from 'node:fs/promises';
import {createHash,createHmac,randomUUID,randomBytes,timingSafeEqual} from 'node:crypto';
const app=express(),MAX_ZIP=2*1024*1024;
const pool=process.env.DATABASE_URL?new pg.Pool({connectionString:process.env.DATABASE_URL,max:4}):null;
const ready=!!(pool&&process.env.IP_HASH_SECRET&&process.env.TURNSTILE_SECRET_KEY);
const allowed=new Set((process.env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean));
const genres=new Set(['Arcade','Platformer','Puzzle','Strategy','Casual','Adventure']);
const decisions=new Set(['approved_pending_release','changes_requested','rejected','published']);
const zipFileAllowed=/\.(html?|css|js|json|txt|png|jpe?g|gif|webp|svg|ogg|mp3|wav|wasm|woff2?|ttf|bin|gltf|glb)$/i;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const hash=x=>createHash('sha256').update(x).digest('hex');
const ipHash=req=>createHmac('sha256',process.env.IP_HASH_SECRET).update(req.ip||'unknown').digest('hex');
app.disable('x-powered-by');app.set('trust proxy',1);app.use(helmet({contentSecurityPolicy:false}));
app.use((req,res,next)=>{
 res.set('Cache-Control','no-store');
 const origin=req.get('origin');
 if(origin){if(!allowed.has(origin))return res.status(403).json({error:'Origin not allowed'});res.set('Access-Control-Allow-Origin',origin);res.set('Vary','Origin');res.set('Access-Control-Allow-Headers','Content-Type,Authorization,X-Arcadia-Receipt');res.set('Access-Control-Allow-Methods','GET,POST,OPTIONS')}
 if(req.method==='OPTIONS')return res.status(204).end();next();
});
function needsSetup(req,res,next){if(!ready)return res.status(503).json({error:'Publishing review API not configured'});next()}
function needsAdmin(req,res,next){
 const key=process.env.ADMIN_REVIEW_TOKEN;
 if(!key)return res.status(503).json({error:'Moderation credentials not configured'});
 const given=(req.get('authorization')||'').replace(/^Bearer /i,'');
 if(!timingSafeEqual(createHash('sha256').update(given).digest(),createHash('sha256').update(key).digest()))return res.status(403).json({error:'Forbidden'});
 next();
}
async function captcha(token,ip){
 if(!process.env.TURNSTILE_SECRET_KEY||typeof token!=='string'||token.length<20||token.length>4096)return false;
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),7000);
 try{
  const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:process.env.TURNSTILE_SECRET_KEY,response:token,remoteip:ip||''}),signal:controller.signal});
  if(!r.ok)return false;const outcome=await r.json();const host=String(outcome.hostname||'');const allowedHosts=[...allowed].map(x=>{try{return new URL(x).hostname}catch{return ''}});return outcome.success===true&&outcome.action==='arcadia-submit'&&allowedHosts.includes(host);
 }catch{return false}finally{clearTimeout(timeout)}
}
function validateZip(bytes){
 return new Promise((resolve,reject)=>{
  yauzl.fromBuffer(bytes,{lazyEntries:true,autoClose:true,validateEntrySizes:true},(error,z)=>{
   if(error||!z)return reject(Error('Invalid ZIP package'));
   let count=0,total=0,found=false,finished=false;
   const fail=message=>{if(finished)return;finished=true;z.close();reject(Error(message))};
   z.on('error',()=>fail('Corrupt ZIP package'));
   z.on('entry',entry=>{
    if(finished)return;
    const name=entry.fileName.replace(/\\/g,'/');
    if(name.endsWith('/')){z.readEntry();return}
    count++;total+=entry.uncompressedSize;
    const mode=entry.externalFileAttributes>>>16;
    if(count>250||total>16*1024*1024||name.startsWith('/')||name.split('/').includes('..')||name.includes('\0')||!zipFileAllowed.test(name)||(mode&0o170000)===0o120000)return fail('Unsupported or oversized ZIP contents');
    if(name==='index.html')found=true;
    z.readEntry();
   });
   z.on('end',()=>{if(finished)return;finished=true;if(!found)return reject(Error('ZIP requires root index.html'));resolve({fileCount:count,uncompressedBytes:total})});
   z.readEntry();
  });
 });
}
app.get('/health',async(req,res)=>{
 let db=false;if(pool){try{await pool.query('SELECT 1');db=true}catch{}}
 res.status(db?200:503).json({service:'arcadia-creator-review',database:db,submissionsEnabled:db&&ready,identityEnabled:false});
});
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:MAX_ZIP,files:1,fields:12,fieldSize:16000}}).single('game');
app.post('/api/v1/creator/submissions',needsSetup,(req,res,next)=>upload(req,res,err=>err?res.status(413).json({error:'Upload exceeds limits'}):next()),async(req,res,next)=>{
 try{
  if(!req.file?.buffer||!req.file.originalname.toLowerCase().endsWith('.zip'))return res.status(400).json({error:'A game ZIP is required'});
  const title=String(req.body.title||'').trim(),description=String(req.body.description||'').trim(),genre=String(req.body.genre||'Arcade');
  if(title.length<2||title.length>80||description.length<10||description.length>500||!genres.has(genre)||req.body.rights_confirmed!=='true')return res.status(400).json({error:'Complete game details and confirm distribution rights'});
  if(!await captcha(req.body.turnstile_token,req.ip))return res.status(403).json({error:'Verification failed'});
  const inspected=await validateZip(req.file.buffer);
  let assets;try{assets=JSON.parse(String(req.body.asset_manifest||'{}'))}catch{return res.status(400).json({error:'Invalid asset metadata'})}
  if(!assets||typeof assets!=='object'||Array.isArray(assets)||Object.keys(assets).length>40)return res.status(400).json({error:'Too much asset metadata'});
  const id=randomUUID(),receipt=randomBytes(32).toString('base64url'),ip=ipHash(req);
  const client=await pool.connect();
  try{
   await client.query('BEGIN');
   await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[ip]);
   const last=await client.query("SELECT count(*)::int AS n FROM arcadia_creator_submissions WHERE ip_hash=$1 AND created_at>now()-interval '24 hours'",[ip]);
   if(last.rows[0].n>=3){await client.query('ROLLBACK');return res.status(429).json({error:'Daily submission limit reached'})}
   const queue=await client.query("SELECT count(*)::int AS n FROM arcadia_creator_submissions WHERE status='pending'");
   if(queue.rows[0].n>=250){await client.query('ROLLBACK');return res.status(503).json({error:'Review queue is full'})}
   await client.query('INSERT INTO arcadia_creator_submissions (id,receipt_hash,ip_hash,title,description,genre,school_requested,asset_manifest,rights_confirmed,file_sha256,file_size,zip_file) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',[id,hash(receipt),ip,title,description,genre,req.body.school_requested==='true',assets,true,hash(req.file.buffer),req.file.buffer.length,req.file.buffer]);
   await client.query('COMMIT');
  }catch(e){await client.query('ROLLBACK').catch(()=>{});throw e}finally{client.release()}
  res.status(202).json({id,receipt,status:'pending',files:inspected.fileCount,message:'Received for review; not publicly published'});
 }catch(e){if(/ZIP|zip/.test(e.message))return res.status(400).json({error:e.message});next(e)}
});
app.get('/api/v1/creator/submissions/:id/status',needsSetup,async(req,res,next)=>{
 try{
  if(!uuid.test(req.params.id))return res.sendStatus(404);
  const receipt=req.get('X-Arcadia-Receipt')||'';
  if(receipt.length<24||receipt.length>100)return res.status(403).json({error:'Receipt required'});
  const result=await pool.query('SELECT title,receipt_hash,status,review_note,published_url FROM arcadia_creator_submissions WHERE id=$1',[req.params.id]);
  if(!result.rowCount||result.rows[0].receipt_hash.trim()!==hash(receipt))return res.sendStatus(404);
  const row=result.rows[0];res.json({id:req.params.id,title:row.title,status:row.status,reviewNote:row.review_note||null,publishedUrl:row.status==='published'?row.published_url:null});
 }catch(e){next(e)}
});
app.get('/api/v1/admin/submissions',needsAdmin,async(req,res,next)=>{
 try{const r=await pool.query('SELECT id,title,description,genre,school_requested,file_size,file_sha256,status,created_at FROM arcadia_creator_submissions ORDER BY created_at DESC LIMIT 75');res.json(r.rows)}catch(e){next(e)}
});
app.get('/api/v1/admin/submissions/:id/download',needsAdmin,async(req,res,next)=>{
 try{
  if(!uuid.test(req.params.id))return res.sendStatus(404);
  const r=await pool.query('SELECT zip_file FROM arcadia_creator_submissions WHERE id=$1',[req.params.id]);
  if(!r.rowCount)return res.sendStatus(404);
  res.set('Content-Type','application/zip');res.set('Content-Disposition','attachment; filename="arcadia-review-'+req.params.id+'.zip"');res.send(r.rows[0].zip_file);
 }catch(e){next(e)}
});
app.post('/api/v1/admin/submissions/:id/decision',needsAdmin,express.json({limit:'4kb'}),async(req,res,next)=>{
 try{
  if(!uuid.test(req.params.id))return res.sendStatus(404);
  const status=String(req.body.status||''),note=String(req.body.reviewNote||'').trim().slice(0,1000),url=String(req.body.publishedUrl||'');
  if(!decisions.has(status)||!note)return res.status(400).json({error:'Valid decision and review reason required'});
  if(status==='published'&&(!/^https:\/\//.test(url)||url.length>500))return res.status(400).json({error:'Verified HTTPS release URL required'});
  const r=await pool.query('UPDATE arcadia_creator_submissions SET status=$2,review_note=$3,published_url=$4,updated_at=now() WHERE id=$1 RETURNING id,status',[req.params.id,status,note,status==='published'?url:null]);
  if(!r.rowCount)return res.sendStatus(404);res.json(r.rows[0]);
 }catch(e){next(e)}
});
app.use((err,req,res,next)=>{console.error('Arcadia review intake failed:',err.message);res.status(500).json({error:'Request failed'})});
async function start(){
 if(!pool){console.error('Missing DATABASE_URL: refusing to start');process.exitCode=1;return}
 try{await pool.query(await readFile(new URL('./schema.sql',import.meta.url),'utf8'))}catch(err){console.error('Could not initialize private schema:',err.message);process.exitCode=1;return}
 app.listen(Number(process.env.PORT)||10000,()=>console.log('Arcadia review API listening; public submissions '+(ready?'enabled':'disabled')));
}
start();
