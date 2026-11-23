#!/usr/bin/env python3
"""Import permission-reported HTML games from selected upstream repositories.
Run from Arcadia repo root on GitHub Actions. Does not run unknown installers.
"""
import json, os, re, sys, urllib.request
from pathlib import Path

API="https://api.github.com"
ROOT=Path(".").resolve()
GROUP=sys.argv[1] if len(sys.argv)>1 else "talha"
TOKEN=os.environ.get("GITHUB_TOKEN", "")
MAX_FILE=2_000_000
EXTENSIONS={".html",".htm",".js",".css",".png",".svg",".jpg",".jpeg",".webp",".gif",".woff",".woff2",".mp3",".ogg",".json"}
BLOCKED_TERMS={"blackjack","poker","casino","gambling","adult","nsfw","porn","video-hider","weapons"}
CONFIG={
"talha": ("he-is-talha/html-css-javascript-games","main"),
"minteez":("minteez/browser-game-hub","main"),
"poor":("mohandesghorbany809-cmyk/Poor-Man-PlayStation","main"),
"offline":("CoolDude2349/Offline-HTML-Games-Pack","master"),
"carter":("carter3647/cool-game-downlods","main"),
}
POOR_ALLOW={"Awesome Memol.html","Candy Orchard Crush.html","Cheerful Challeng.html","Dart Hero.html","Find The Treasure.html","Find the Right Color.html","Full or Empty.html","Hue Gues.html","Melt the Ice.html","MemoryLoss.html","Ping Pong Funtime.html","Ring Alert.html","Sliding Puzzle.html","Snake game.html","Sudoku Trio.html","Tile Rus🧩.html","Rock_Paper_Scissors.html"}
OFFLINE_ALLOW={"2048.html","coreball.html","agar-io-lite.html","9007199254740992.html"}
CARTER_ALLOW={"dino.html"}
def request(url,binary=False):
    headers={"Accept":"application/vnd.github+json","User-Agent":"ArcadiaGameImporter"}
    if TOKEN and url.startswith(API):headers["Authorization"]="Bearer "+TOKEN
    with urllib.request.urlopen(urllib.request.Request(url,headers=headers),timeout=90) as r:
        data=r.read(MAX_FILE+1 if binary else 7_000_000)
    if binary and len(data)>MAX_FILE:raise ValueError("File exceeds safety limit")
    return data if binary else json.loads(data)
def slug(s):
    return re.sub(r"[^a-z0-9]+","-",s.lower()).strip("-")[:55]
def allowed(name):
    return not any(x in name.lower() for x in BLOCKED_TERMS)
def category(title):
    x=title.lower()
    if any(v in x for v in ["puzzle","maze","sudoku","memory","match","2048","chess","connect","word","tetris","logic","lights","sliding"]):return "Puzzle"
    if any(v in x for v in ["tycoon","idle","simulator"]):return "Strategy"
    return "Arcade"
def transform(data,source):
    if not (data.lstrip().lower().startswith(b"<!doctype html") or b"<html" in data[:2500].lower()):return data
    s=data.decode("utf-8","replace")
    s=re.sub(r'<script\b[^>]*src=["\x27]https://www\.googletagmanager\.com/gtag/js[^"\x27]*["\x27][^>]*>\s*</script>',"",s,flags=re.I)
    s=re.sub(r'<script\b[^>]*>[\s\S]{0,450}?gtag\(["\x27]config["\x27][\s\S]{0,450}?</script>',"",s,flags=re.I)
    note="<!-- Arcadia authorized import; source: https://github.com/"+source+" -->"
    s=re.sub(r"<head(\s[^>]*)?>",lambda m:m.group(0)+"\n"+note,s,count=1,flags=re.I)
    return s.encode("utf-8")
def save_game(name,files,source):
    ident=slug(GROUP+"-"+name)
    out=ROOT/"games"/ident
    if (out/"index.html").exists():return None
    if "index.html" not in files:return None
    for path,data in files.items():
        dest=out/path;dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_bytes(transform(data,source) if path.endswith(".html") else data)
    return {"id":ident,"title":name,"description":"Browser game provided by "+source+".","category":category(name),"emoji":"🎮","accent":"#83cfff","type":"hosted","path":"games/"+ident+"/index.html","featured":False}
def main():
    if GROUP not in CONFIG:raise SystemExit("Unknown source group")
    source,branch=CONFIG[GROUP]
    info=request(API+"/repos/"+source)
    tree=request(API+"/repos/"+source+"/git/trees/"+info["default_branch"]+"?recursive=1")
    files=[x for x in tree["tree"] if x["type"]=="blob" and x.get("size",0)<=MAX_FILE]
    catalog_path=ROOT/"catalog.json";catalog=json.loads(catalog_path.read_text())
    created=[];skipped=[]
    def grab(path):
        from urllib.parse import quote
        return request("https://raw.githubusercontent.com/"+source+"/"+info["default_branch"]+"/"+quote(path,safe="/"),True)
    if GROUP=="talha":
        groups={}
        for f in files:
            path=f["path"];parts=path.split("/")
            if len(parts)>=2 and re.match(r"^\d\d-",parts[0]) and allowed(parts[0]) and Path(path).suffix.lower() in EXTENSIONS:
                groups.setdefault(parts[0],[]).append((path,"/".join(parts[1:])))
        for name,parts in groups.items():
            if not any(target=="index.html" for _,target in parts):continue
            try: item=save_game(name.split("-",1)[1].replace("-"," "),{target:grab(p) for p,target in parts},source)
            except Exception as e:skipped.append([name,str(e)[:180]]);continue
            if item:created.append(item)
    elif GROUP=="minteez":
        for f in files:
            path=f["path"]
            if "/" in path or not path.endswith(".html") or path=="index.html" or not allowed(path):continue
            name=path[:-5].replace("_"," ").title()
            try:item=save_game(name,{"index.html":grab(path)},source)
            except Exception as e:skipped.append([path,str(e)[:180]]);continue
            if item:created.append(item)
    else:
        chosen=POOR_ALLOW if GROUP=="poor" else OFFLINE_ALLOW if GROUP=="offline" else CARTER_ALLOW
        for f in files:
            path=f["path"]
            if GROUP=="offline" and not path.startswith("offline/"):continue
            if Path(path).name not in chosen or not allowed(path):continue
            name=Path(path).stem.replace("-"," ").replace("_"," ").title()
            try:item=save_game(name,{"index.html":grab(path)},source)
            except Exception as e:skipped.append([path,str(e)[:180]]);continue
            if item:created.append(item)
    known={x["id"] for x in catalog}
    new=[x for x in created if x["id"] not in known]
    if new:
        catalog.extend(new)
        catalog_path.write_text(json.dumps(catalog,indent=2,ensure_ascii=False)+"\n")
        credits=ROOT/"games"/"SOURCE-ATTRIBUTION.md"
        old=credits.read_text() if credits.exists() else "# Imported games source and attribution\n\n"
        old+="\n## "+source+"\nUpstream repository: https://github.com/"+source+"\nSource revision: "+tree.get("sha","unknown")+"\nImported games: "+", ".join(x["id"] for x in new)+"\nThe source repository license and the owner's reported permissions apply; review upstream license files and downstream assets before commercial reuse. Some games depend on third-party CDNs.\n"
        credits.write_text(old)
    print(json.dumps({"group":GROUP,"created":len(new),"skipped":skipped[:30],"catalog_count":len(catalog),"names":[x["title"] for x in new]},indent=2))
if __name__=="__main__":main()
