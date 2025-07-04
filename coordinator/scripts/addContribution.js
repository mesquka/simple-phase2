#!/usr/bin/env node
const fs = require("node:fs");
const process = require("node:process");
const {
  contributionLogFile,
  getCurrentContributionNumber,
  verifyCircuit,
  readTranscript,
  contributionPath,
  promiseQueue,
} = require("./shared.js");

async function verifyCircuitContributions(
  circuit,
  contributionLog,
  nextContributionNumber
) {
  const verification = await verifyCircuit(circuit, nextContributionNumber);

  const newFileContributions = verification.mpcParams.contributions;

  let valid = true;

  // Keep track of index seperately because some circuits might be missing from contributions
  let nextNewFileContributionsIndex = 0;

  for (
    let contributionIndex = 0;
    contributionIndex < contributionLog.length;
    contributionIndex += 1
  ) {
    if (!contributionLog[contributionIndex].contributions[circuit]) continue;

    if (
      contributionLog[contributionIndex].contributions[circuit] !==
      newFileContributions[nextNewFileContributionsIndex]
    ) {
      console.log(`${circuit} HAS INVALID CONTRIBUTION`);
      valid = false;
    }

    nextNewFileContributionsIndex += 1;
  }

  if (newFileContributions.length !== nextNewFileContributionsIndex) {
    console.log(`${circuit} CONTRIBUTION LENGTHS DON'T MATCH`);
    valid = false;
  }

  return valid;
}

async function main() {
  const { circuits, contributionLog } = contributionLogFile.read();
  const nextContributionNumber = getCurrentContributionNumber() + 1;

  const files = fs.readdirSync(contributionPath(nextContributionNumber));
  const expectedFiles = circuits.map((circuit) => `${circuit}.zkey`);
  expectedFiles.push("transcript.json");

  for (const file of files) {
    if (!expectedFiles.includes(file)) {
      console.log(`UNEXPECTED FILE: ${file}`);
      process.exit(1);
    }
  }

  for (const file of expectedFiles) {
    if (!files.includes(file)) {
      console.log(`MISSING FILE: ${file}`);
      process.exit(1);
    }
  }

  const transcript = readTranscript(nextContributionNumber);

  contributionLog.push({
    name: transcript.name,
    number: nextContributionNumber,
    contributions: transcript.contributions,
  });

  let allValid = true;

  const queue = circuits.map((circuit) => async () => {
    return {
      name: circuit,
      verification: await verifyCircuitContributions(circuit, contributionLog, nextContributionNumber),
    };
  });

  const results = await promiseQueue(queue);

  for (const circuit of results) {
    allValid = allValid && circuit.verification;
    console.log(
      circuit.verification
        ? `${circuit.name} contributions valid`
        : `${circuit.name} contributions invalid`
    );
  }

  if (allValid) {
    console.log("\nALL CONTRIBUTIONS VALID");
    console.log("\nUPDATING CONTRIBUTION LOG");
    contributionLogFile.write({
      circuits,
      contributionLog,
    });
  } else {
    console.log(
      "\nINVALID CONTRIBUTIONS FOUND, NOT WRITING TO CONTRIBUTION LOG"
    );
    console.log(`Manually clean or delete ${nextContributionNumber} folder`);
  }

  process.exit();
}

void main();
