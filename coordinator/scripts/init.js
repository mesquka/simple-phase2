#!/usr/bin/env node
import fs from "node:fs";
import process from "node:process";
import {
  constants,
  verifyCircuit,
  contributionLogFile,
  processParallel,
} from "./shared.js";

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

  const queue = circuits.map((circuit) => async () => {
    return {
      name: circuit,
      verification: await verifyCircuit(circuit, 0),
    };
  });

  const results = await processParallel(queue);

  for (const circuit of results) {
    if (circuit.verification.valid == false) {
      allValid = false;
      console.log(`${circuit.name} failed validation check!`);
    } else {
      console.log(`${circuit.name} is valid`);

      circuit.verification.mpcParams.contributions.map((contribution, i) => {
        if (!contributionLog[i])
          contributionLog[i] = { name: null, number: null, contributions: {} };

        contributionLog[i].contributions[circuit.name] = contribution;
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
