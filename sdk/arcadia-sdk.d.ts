/* Ambient browser-global types for <script src="arcadia-sdk.js">. */
interface ArcadiaEnvironment { gameId:string; version:string; protocol:number; connected:boolean; capabilities: { storage:'local'|'cloud'; scores:'local'|'cloud'; achievements:'local'|'cloud'; accounts:boolean } }
interface ArcadiaScore { score:number; mode:string; metadata:Record<string,unknown>; createdAt:string; id:string }
interface ArcadiaSDKOptions { gameId:string; version?:string; allowedParentOrigins?:string[] }
declare class ArcadiaSDK {
 static version:string;
 constructor(options:ArcadiaSDKOptions);
 gameId:string;
 connected:boolean;
 capabilities:ArcadiaEnvironment['capabilities'];
 ready(manifest?:{title?:string;features?:string[]}):this;
 storage:{save(slot:string,value:unknown):Promise<{slot:string;updatedAt:string;storage:'local'|'cloud'}>;load<T=unknown>(slot:string):Promise<T|null>;remove(slot:string):Promise<boolean>;list():Promise<string[]>};
 scores:{submit(score:number,options?:{mode?:string;metadata?:Record<string,unknown>}):Promise<{record:ArcadiaScore;rank:number;storage:string}>;top(limit?:number):Promise<ArcadiaScore[]>};
 achievements:{unlock(id:string,metadata?:Record<string,unknown>):Promise<{id:string;unlockedAt:string}>;list():Promise<Array<{id:string;unlockedAt:string}>>};
 session:{start():boolean;pause():boolean;resume():boolean;end(details?:Record<string,unknown>):boolean};
 ui:{fullscreen():Promise<unknown>;exitFullscreen():Promise<unknown>};
 on(event:string,handler:(data:unknown)=>void):()=>void;
 off(event:string,handler:(data:unknown)=>void):void;
 emit(name:string,data?:Record<string,unknown>):void;
 getEnvironment():ArcadiaEnvironment;
 destroy():void;
}
