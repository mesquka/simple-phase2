#!/usr/bin/env node
const fs = require("node:fs");
const {
  constants,
  verifyCircuit,
  arrayToHex,
  contributionLogFile,
} = require("./shared.js");

function getAllCircuits() {
  const files = fs.readdirSync(constants.R1CS);

  for (const file of files) {
    if (!file.endsWith(".r1cs")) {
      console.log(`UNEXPECTED FILE: ${file}`);
      process.exit(1);
    }
  }

  const circuits = files.map((file) => file.slice(0, -5));
  return circuits;
}

async function verifyAndLog(circuits) {
  let allValid = true;
  const contributionLog = [];

  for (const circuit of circuits) {
    const verification = await verifyCircuit(circuit, 0);

    if (verification.valid == false) {
      allValid = false;
      console.log(`${circuit} failed validation check!`);
    } else {
      console.log(`${circuit} is valid`);

      verification.mpcParams.contributions.map((contribution, i) => {
        if (!contributionLog[i])
          contributionLog[i] = { name: null, number: null, contributions: {} };

        contributionLog[i].contributions[circuit] = arrayToHex(
          contribution.contributionHash,
          32
        );
      });
    }
  }

  return { allValid, contributionLog };
}

async function main() {
  console.log("\nLISTING CIRCUITS\n");
  const circuits = getAllCircuits();
  console.log("Circuits found:", JSON.stringify(circuits, undefined, 2));

  console.log("\nVERIFYING CIRCUITS\n");
  const { allValid, contributionLog } = await verifyAndLog(circuits);
  if (!allValid) process.exit(1);
  console.log("\nCIRCUITS VERIFIED");

  console.log("\nWRITING INITIAL CONTRIBUTION LOG\n");
  contributionLogFile.write({
    circuits,
    contributionLog,
  });

  process.exit();
}

void main();
