const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { buildPacket } = require("./execution-packet.cjs");
const { execute, safeRepoPath } = require("./runtime-adapter.cjs");

const repoRoot = path.resolve(__dirname, "..", "..");
function makeState(status, owner, risk={}) {
  const dir=fs.mkdtempSync(path.join(repoRoot,".tmp-runtime-"));
  const file=path.join(dir,"state.json");
  fs.writeFileSync(file,JSON.stringify({taskId:"TASK-9999",title:"runtime test",status,owner,risk:{database:false,destructiveDatabase:false,security:false,payment:false,inventory:false,pricing:false,production:false,...risk},artifacts:{requirement:".ai/tasks/TASK-0007/requirement.md"},history:[]}));
  return {dir,file};
}
let s=makeState("development","developer",{security:true});
try {
  const result=execute(buildPacket(s.file));
  assert.equal(result.adapter,"local");
  assert.equal(result.status,"ready");
  assert.equal(result.worker,"developer");
  assert.deepEqual(result.mandatoryRiskContext,["security"]);
  assert.ok(result.contextFilesLoaded.includes(".ai/agents/developer.md"));
  assert.equal(result.capabilities.production,false);
} finally { fs.rmSync(s.dir,{recursive:true,force:true}); }

s=makeState("human_approval","human");
try { assert.throws(()=>execute(buildPacket(s.file)),/not executable/); }
finally { fs.rmSync(s.dir,{recursive:true,force:true}); }

assert.throws(()=>safeRepoPath("../outside"),/escapes repository/);
assert.throws(()=>execute({executable:true,instructions:{contextFiles:[]}},"external"),/Unsupported runtime adapter/);
console.log("Runtime adapter tests passed.");
