#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { handoff } = require("./task-runner.cjs");

const ROOT = path.resolve(__dirname, "..", "..");
const VERSION = 1;
const FORBIDDEN = [
  "push-main",
  "merge",
  "deploy-production",
  "production-migration",
  "destructive-production-db",
  "read-secrets",
];

function repoRelative(file) {
  return path.relative(ROOT, file).replace(/\\/g, "/");
}

function buildPacket(stateFile) {
  const route = handoff(stateFile);
  if (route.action !== "dispatch" || !route.worker) {
    return {
      version: VERSION,
      taskId: route.taskId,
      executable: false,
      stopReason: route.action === "human_gate" ? "human-approval-required" : "task-complete",
      route,
    };
  }

  const agentFile = path.join(ROOT, ".ai", "agents", route.worker + ".md");
  if (!fs.existsSync(agentFile)) throw new Error(`Missing agent contract: ${repoRelative(agentFile)}`);

  const contextFiles = [
    ".ai/AGENTS.md",
    ".ai/PROJECT.md",
    ".ai/ARCHITECTURE.md",
    ".ai/QUALITY_BASELINE.md",
    repoRelative(agentFile),
    ...Object.values(route.artifacts || {}),
  ].filter((v, i, a) => typeof v === "string" && a.indexOf(v) === i);

  return {
    version: VERSION,
    taskId: route.taskId,
    executable: true,
    worker: route.worker,
    status: route.status,
    instructions: {
      agentContract: repoRelative(agentFile),
      contextFiles,
    },
    capabilities: {
      repositoryRead: true,
      taskBranchWrite: route.worker === "developer",
      taskArtifactWrite: true,
      runTests: ["developer", "reviewer", "qa", "devops"].includes(route.worker),
      network: false,
      secrets: false,
      production: false,
    },
    forbiddenActions: FORBIDDEN,
    mandatoryRiskContext: route.activeRisks,
    route,
  };
}

function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Usage: node execution-packet.cjs <state.json>");
  process.stdout.write(JSON.stringify(buildPacket(file), null, 2) + "\n");
}

if (require.main === module) main();
module.exports = { buildPacket, FORBIDDEN, VERSION };
