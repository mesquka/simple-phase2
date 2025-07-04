const fs = require("node:fs");
const os = require("node:os");
const readline = require("node:readline");
const { fork } = require("node:child_process");

const WORKSPACE_FOLDER = "/workspace";
const R1CS = `${WORKSPACE_FOLDER}/r1cs`;
const PHASE1_PTAU = `${WORKSPACE_FOLDER}/phase1.ptau`;
const CONTRIBUTIONS_PATH = `${WORKSPACE_FOLDER}/contributions`;
const CONTRIBUTIONS_LOG = `${WORKSPACE_FOLDER}/log.json`;
const FINAL_PATH = `${WORKSPACE_FOLDER}/final`;

function promiseQueue (
  promises = [],
  concurrency = os.availableParallelism()
) {
  return new Promise((res) => {
    const tasks = [...promises];
    const results = [];

    let resolved = false;

    const runNext = () => {
      if (tasks.length > 0) {
        const task = tasks.shift()();
        results.push(task);
        task.finally(runNext);
      } else if (!resolved) {
        resolved = true;
        res(Promise.all(results));
      }
    };

    for (let i = 1; i < concurrency; i += 1) runNext();
  });
};

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

function contributionPath(contributionNumber) {
  return `${CONTRIBUTIONS_PATH}/${contributionNumber
    .toString()
    .padStart(4, "0")}`;
}

async function verifyCircuit(circuit, contributionNumber) {
  return new Promise((res) => {
    console.log(`Verifying ${circuit}`);

    const forked = fork("/scripts/child-processes/verifySingleCircuit.js");

    forked.on("message", (mpcParams) => {
      res(mpcParams);
    });

    forked.send({
      circuit,
      contributionNumber,
    });
  });
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
  promiseQueue,
  askQuestion,
  contributionPath,
  verifyCircuit,
  arrayToHex,
  contributionLogFile,
  getCurrentContributionNumber,
  readTranscript,
};
