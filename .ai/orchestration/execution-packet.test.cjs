const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { buildPacket, FORBIDDEN } = require("./execution-packet.cjs");

const repoRoot = path.resolve(__dirname, "..", "..");
function state(status, owner, risk = {}) {
  const dir = fs.mkdtempSync(path.join(repoRoot, ".tmp-task-"));
  const file = path.join(dir, "state.json");
  fs.writeFileSync(file, JSON.stringify({
    taskId:"TASK-9999", title:"test", status, owner,
    risk:{database:false,destructiveDatabase:false,security:false,payment:false,inventory:false,pricing:false,production:false,...risk},
    artifacts:{requirement:".ai/tasks/TASK-0006/requirement.md"}, history:[]
  }));
  return { file, dir };
}
function withState(status, owner, risk, fn) {
  const s = state(status, owner, risk);
  try { fn(buildPacket(s.file)); } finally { fs.rmSync(s.dir, {recursive:true, force:true}); }
}

withState("development","developer",{inventory:true},p=>{
  assert.equal(p.executable,true);
  assert.equal(p.worker,"developer");
  assert.equal(p.capabilities.taskBranchWrite,true);
  assert.deepEqual(p.mandatoryRiskContext,["inventory"]);
  assert.ok(p.instructions.agentContract.endsWith("developer.md"));
  assert.ok(FORBIDDEN.includes("deploy-production"));
});
withState("review","reviewer",{security:true},p=>{
  assert.equal(p.worker,"reviewer");
  assert.equal(p.capabilities.taskBranchWrite,false);
  assert.deepEqual(p.mandatoryRiskContext,["security"]);
});
withState("human_approval","human",{},p=>{
  assert.equal(p.executable,false);
  assert.equal(p.stopReason,"human-approval-required");
});
withState("done","human",{},p=>{
  assert.equal(p.executable,false);
  assert.equal(p.stopReason,"task-complete");
});
console.log("Execution packet tests passed.");
