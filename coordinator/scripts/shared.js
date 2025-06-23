const snarkjs = require("snarkjs");
const fs = require("node:fs");

const WORKSPACE_FOLDER = "/workspace";
const R1CS = `${WORKSPACE_FOLDER}/r1cs`;
const PHASE1_PTAU = `${WORKSPACE_FOLDER}/phase1.ptau`;
const CONTRIBUTIONS_PATH = `${WORKSPACE_FOLDER}/contributions`;
const CONTRIBUTIONS_LOG = `${WORKSPACE_FOLDER}/log.json`;
const FINAL_PATH = `${WORKSPACE_FOLDER}/final`;

function contributionPath(contributionNumber) {
  return `${CONTRIBUTIONS_PATH}/${contributionNumber
    .toString()
    .padStart(4, "0")}`;
}

async function verifyCircuit(circuit, contributionNumber) {
  const mpcParams = await snarkjs.zKey.verifyFromR1cs(
    `${R1CS}/${circuit}.r1cs`,
    `${PHASE1_PTAU}`,
    `${contributionPath(contributionNumber)}/${circuit}.zkey`
  );

  return {
    valid: mpcParams !== false,
    mpcParams,
  };
}

function arrayToHex(array, byteLength) {
  return Buffer.from(array)
    .toString("hex")
    .padStart(byteLength * 2, "0");
}

const contributionLogFile = {
  read: () => {
    return JSON.parse(fs.readFileSync(CONTRIBUTIONS_LOG));
  },
  write: (contributionLog) => {
    fs.writeFileSync(
      CONTRIBUTIONS_LOG,
      `${JSON.stringify(contributionLog, undefined, 2)}\n`
    );
  },
};

function getCurrentContributionNumber() {
  const { contributionLog } = contributionLogFile.read();

  let latestContributionNumber = 0;
  if (contributionLog.length > 0) {
    latestContributionNumber =
      contributionLog[contributionLog.length - 1].number ?? 0;
  }

  return latestContributionNumber;
}

function readTranscript(contributionNumber) {
  return JSON.parse(
    fs.readFileSync(`${contributionPath(contributionNumber)}/transcript.json`)
  );
}

module.exports = {
  constants: {
    WORKSPACE_FOLDER,
    R1CS,
    PHASE1_PTAU,
    CONTRIBUTIONS_PATH,
    CONTRIBUTIONS_LOG,
    FINAL_PATH,
  },
  contributionPath,
  verifyCircuit,
  arrayToHex,
  contributionLogFile,
  getCurrentContributionNumber,
  readTranscript,
};
