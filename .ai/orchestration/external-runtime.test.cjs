const assert=require("node:assert/strict");
const fs=require("node:fs"), path=require("node:path");
const {buildPacket}=require("./execution-packet.cjs");
const {createRequest}=require("./runtime-adapter.cjs");
const {executeExternal,validateResult}=require("./external-runtime.cjs");
const root=path.resolve(__dirname,"..","..");
function make(status="development",owner="developer"){
 const dir=fs.mkdtempSync(path.join(root,".tmp-ext-")),file=path.join(dir,"state.json");
 fs.writeFileSync(file,JSON.stringify({taskId:"TASK-9999",title:"ext",status,owner,risk:{database:false,destructiveDatabase:false,security:true,payment:false,inventory:false,pricing:false,production:false},artifacts:{requirement:".ai/tasks/TASK-0008/requirement.md"},history:[]}));
 return {dir,file};
}
let s=make();
try{
 const packet=buildPacket(s.file), request=createRequest(packet);
 const ok=executeExternal(packet);
 assert.equal(ok.status,"accepted-advisory");
 assert.deepEqual(ok.mandatoryRiskContext,["security"]);
 assert.throws(()=>validateResult({summary:"x",proposedActions:["merge"],artifacts:[]},request),/forbidden action/);
 assert.throws(()=>validateResult({summary:"x",proposedActions:["deploy-moon"],artifacts:[]},request),/unknown action/);
 assert.throws(()=>validateResult({summary:"x",proposedActions:[],artifacts:[{path:"../escape",content:"x"}]},request),/escapes repository policy/);
 assert.throws(()=>validateResult({summary:7,proposedActions:[],artifacts:[]},request),/summary/);
}finally{fs.rmSync(s.dir,{recursive:true,force:true});}
s=make("human_approval","human");
try{assert.throws(()=>executeExternal(buildPacket(s.file)),/not executable/);}
finally{fs.rmSync(s.dir,{recursive:true,force:true});}
console.log("External runtime policy tests passed.");
