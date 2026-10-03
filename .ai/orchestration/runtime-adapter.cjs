#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { buildPacket } = require("./execution-packet.cjs");

const ROOT = path.resolve(__dirname, "..", "..");
const RUNTIME_VERSION = 1;

function safeRepoPath(relativePath) {
  if (typeof relativePath !== "string" || !relativePath) throw new Error("Invalid context path");
  const resolved = path.resolve(ROOT, relativePath);
  const rel = path.relative(ROOT, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) throw new Error(`Context path escapes repository: ${relativePath}`);
  return resolved;
}

function loadContext(packet) {
  return packet.instructions.contextFiles.map((relativePath) => {
    const file = safeRepoPath(relativePath);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error(`Missing context file: ${relativePath}`);
    return { path: relativePath, content: fs.readFileSync(file, "utf8") };
  });
}

function createRequest(packet) {
  if (!packet.executable) throw new Error(`Packet is not executable: ${packet.stopReason || "blocked"}`);
  return {
    version: RUNTIME_VERSION,
    taskId: packet.taskId,
    worker: packet.worker,
    capabilities: packet.capabilities,
    forbiddenActions: packet.forbiddenActions,
    mandatoryRiskContext: packet.mandatoryRiskContext,
    context: loadContext(packet),
  };
}

function executeLocal(request) {
  return {
    version: RUNTIME_VERSION,
    adapter: "local",
    status: "ready",
    taskId: request.taskId,
    worker: request.worker,
    contextFilesLoaded: request.context.map((x) => x.path),
    mandatoryRiskContext: request.mandatoryRiskContext,
    capabilities: request.capabilities,
    note: "Deterministic local adapter only; no external model or mutation executed.",
  };
}

function execute(packet, adapter = "local") {
  const request = createRequest(packet);
  if (adapter !== "local") throw new Error(`Unsupported runtime adapter: ${adapter}`);
  return executeLocal(request);
}

function main() {
  const stateFile = process.argv[2];
  const adapter = process.argv[3] || "local";
  if (!stateFile) throw new Error("Usage: node runtime-adapter.cjs <state.json> [local]");
  const packet = buildPacket(stateFile);
  process.stdout.write(JSON.stringify(execute(packet, adapter), null, 2) + "\n");
}

if (require.main === module) main();
module.exports = { safeRepoPath, loadContext, createRequest, executeLocal, execute, RUNTIME_VERSION };
