const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { handoff, statusToWorker } = require("./task-runner.cjs");

assert.equal(statusToWorker.development, "developer");
assert.equal(statusToWorker.review, "reviewer");
assert.equal(statusToWorker.qa, "qa");
assert.equal(statusToWorker.release_ready, "devops");
assert.equal(statusToWorker.human_approval, null);
assert.equal(statusToWorker.done, null);

function sample(status, owner, risk = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "task-runner-"));
  const file = path.join(dir, "state.json");
  fs.writeFileSync(file, JSON.stringify({
    taskId: "TASK-9999", title: "test", status, owner,
    risk: { database:false, destructiveDatabase:false, security:false, payment:false, inventory:false, pricing:false, production:false, ...risk },
    artifacts: { requirement: "requirement.md" }, history: []
  }));
  return handoff(file);
}

assert.equal(sample("development", "developer").action, "dispatch");
assert.equal(sample("review", "reviewer").worker, "reviewer");
assert.equal(sample("human_approval", "human").action, "human_gate");
assert.equal(sample("human_approval", "human").worker, null);
assert.equal(sample("done", "human").action, "none");
assert.deepEqual(sample("development", "developer", { inventory:true, production:true }).activeRisks, ["inventory","production"]);
console.log("Task runner routing tests passed.");
