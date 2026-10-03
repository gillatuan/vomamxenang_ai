#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const statusToWorker = {
  requirement: "planner",
  planning: "planner",
  architecture: "architect",
  development: "developer",
  review: "reviewer",
  qa: "qa",
  release_ready: "devops",
  human_approval: null,
  done: null,
};

function loadState(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function handoff(file) {
  const state = loadState(file);
  const activeRisks = Object.entries(state.risk || {}).filter(([, value]) => value === true).map(([key]) => key);
  const worker = statusToWorker[state.status];
  return {
    taskId: state.taskId,
    title: state.title,
    status: state.status,
    owner: state.owner,
    action: worker ? "dispatch" : state.status === "done" ? "none" : "human_gate",
    worker,
    activeRisks,
    artifacts: state.artifacts || {},
    stateFile: file.replace(/\\/g, "/"),
  };
}

function validate(files) {
  const validator = path.join(__dirname, "validate-state.cjs");
  const result = spawnSync(process.execPath, [validator, ...files], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}

function main() {
  const args = process.argv.slice(2);
  const tasksDir = path.join(__dirname, "..", "tasks");
  const files = args.length ? args : fs.readdirSync(tasksDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^TASK-\d{4}$/.test(e.name))
    .map((e) => path.join(tasksDir, e.name, "state.json"))
    .filter(fs.existsSync);
  if (!files.length) throw new Error("No task state files found");
  validate(files);
  process.stdout.write(JSON.stringify(files.map(handoff), null, 2) + "\n");
}

if (require.main === module) main();
module.exports = { handoff, statusToWorker };
