#!/usr/bin/env node
const fs = require("node:fs");
const readline = require("node:readline");
const snarkjs = require("snarkjs");

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

function arrayToHex(array, byteLength) {
  return Buffer.from(array)
    .toString("hex")
    .padStart(byteLength * 2, "0");
}

function getAllCircuits() {
  return fs
    .readdirSync("/workspace/challenge")
    .filter((file) => file.endsWith(".zkey"))
    .map((file) => file.slice(0, -5));
}

async function contribute(circuit, name, entropy) {
  const contributionHash = await snarkjs.zKey.contribute(
    `/workspace/challenge/${circuit}.zkey`,
    `/workspace/response/${circuit}.zkey`,
    name,
    entropy
  );

  return arrayToHex(contributionHash, 32);
}

async function main() {
  console.log("\nLISTING CIRCUITS\n");
  const circuits = getAllCircuits();
  console.log("Circuits found:", JSON.stringify(circuits, undefined, 2));

  console.log("CONTRIBUTING TO CIRCUITS\n");
  const name = await askQuestion("Enter your name or alias: ");
  const entropy = await askQuestion("Enter some random text: ");

  const transcript = {
    name,
    contributions: {},
  };

  for (const circuit in circuits) {
    console.log(`Contributing to circuit ${circuit}`);
    transcript.contributions[circuit] = await contribute(
      circuit,
      name,
      entropy
    );
  }
  console.log("\nCONTRIBUTION COMPLETE");

  console.log("\nWRITING TRANSCRIPT\n");
  fs.writeFileSync(
    "/workspace/response/transcript.json",
    `${JSON.stringify(transcript, undefined, 2)}\n`
  );

  process.exit();
}

void main();
