#!/usr/bin/env node
const { buildPacket } = require("./execution-packet.cjs");
const { createRequest } = require("./runtime-adapter.cjs");

const VERSION = 1;
const ACTION_CAPABILITY = {
  "read-repository": "repositoryRead",
  "write-task-branch": "taskBranchWrite",
  "write-task-artifact": "taskArtifactWrite",
  "run-tests": "runTests",
};

function providerEnvelope(request) {
  return {
    version: VERSION,
    taskId: request.taskId,
    worker: request.worker,
    policy: {
      advisoryOnly: true,
      outputFormat: "json",
      forbiddenActions: request.forbiddenActions,
      capabilities: request.capabilities,
      mandatoryRiskContext: request.mandatoryRiskContext,
    },
    context: request.context,
    expectedOutput: {
      summary: "string",
      proposedActions: ["string"],
      artifacts: [{ path: "string", content: "string" }],
    },
  };
}

function validateResult(raw, request) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Provider result must be an object");
  if (typeof raw.summary !== "string") throw new Error("Provider result summary must be a string");
  if (!Array.isArray(raw.proposedActions) || !raw.proposedActions.every(x => typeof x === "string")) throw new Error("Provider proposedActions must be strings");
  if (!Array.isArray(raw.artifacts)) throw new Error("Provider artifacts must be an array");
  for (const artifact of raw.artifacts) {
    if (!artifact || typeof artifact.path !== "string" || typeof artifact.content !== "string") throw new Error("Invalid provider artifact");
    if (artifact.path.startsWith("/") || artifact.path.split("/").includes("..")) throw new Error("Artifact path escapes repository policy");
  }
  for (const action of raw.proposedActions) {
    if (request.forbiddenActions.includes(action)) throw new Error(`Provider requested forbidden action: ${action}`);
    const capability = ACTION_CAPABILITY[action];
    if (!capability) throw new Error(`Provider requested unknown action: ${action}`);
    if (!request.capabilities[capability]) throw new Error(`Provider lacks capability for action: ${action}`);
  }
  return {
    version: VERSION,
    status: "accepted-advisory",
    taskId: request.taskId,
    worker: request.worker,
    summary: raw.summary,
    proposedActions: raw.proposedActions,
    artifacts: raw.artifacts,
    mandatoryRiskContext: request.mandatoryRiskContext,
  };
}

function mockProvider(envelope) {
  return {
    summary: `Mock external reasoning for ${envelope.taskId} as ${envelope.worker}`,
    proposedActions: [],
    artifacts: [],
  };
}

function executeExternal(packet, provider = mockProvider) {
  const request = createRequest(packet);
  const envelope = providerEnvelope(request);
  const raw = provider(envelope);
  return validateResult(raw, request);
}

function main() {
  const stateFile = process.argv[2];
  if (!stateFile) throw new Error("Usage: node external-runtime.cjs <state.json>");
  const packet = buildPacket(stateFile);
  process.stdout.write(JSON.stringify(executeExternal(packet), null, 2) + "\n");
}

if (require.main === module) main();
module.exports = { providerEnvelope, validateResult, mockProvider, executeExternal, ACTION_CAPABILITY, VERSION };
