#!/usr/bin/env node
const fs = require("node:fs");
const snarkjs = require("snarkjs");
const { fork } = require("node:child_process");
const {
  contributionLogFile,
  getCurrentContributionNumber,
  contributionPath,
  constants,
  askQuestion,
} = require("./shared");

const exportFolder = `${constants.WORKSPACE_FOLDER}/export`;
const tmp = `${exportFolder}/tmp`;
const exportTranscriptsFolder = `${exportFolder}/transcripts`;
const exportCircuitsFolder = `${exportFolder}/circuits`;

async function addBeacon(latestContributionNumber, circuit, beacon) {
  return new Promise((res) => {
    console.log(`Applying beacon to ${circuit}`);

    const source = `${contributionPath(
      latestContributionNumber
    )}/${circuit}.zkey`;
    const destination = `${tmp}/${circuit}.zkey`;

    const forked = fork("/scripts/child-processes/beacon.js");

    forked.on("message", (msg) => {
      res(msg);
    });

    forked.send({
      source,
      destination,
      beacon,
    });
  });
}

function compressFile(source, destination) {
  return new Promise((res) => {
    console.log(`Compressing file ${source} to ${destination}`);

    const forked = fork("/scripts/child-processes/compressFile.js");

    forked.on("message", (msg) => {
      if (msg === "complete") res();
    });

    forked.send({
      source,
      destination,
    });
  });
}

async function main() {
  const log = contributionLogFile.read();
  const latestContributionNumber = getCurrentContributionNumber();

  const beacon = await askQuestion("Enter beacon hash:");

  console.log("\nCREATING EXPORT FOLDERS");

  if (fs.existsSync(exportFolder))
    fs.rmSync(exportFolder, { recursive: true, force: true });
  fs.mkdirSync(exportFolder);
  fs.mkdirSync(tmp);
  fs.mkdirSync(exportTranscriptsFolder);
  fs.mkdirSync(exportCircuitsFolder);

  const beaconQueue = [];
  const compressionQueue = [];

  for (const circuit of log.circuits) {
    const circuitExport = `${exportCircuitsFolder}/${circuit}`;

    fs.mkdirSync(circuitExport);

    beaconQueue.push(async () => {
      await addBeacon(latestContributionNumber, circuit, beacon);
    });

    compressionQueue.push(async () => {
      await compressFile(
        `${constants.R1CS}/${circuit}.r1cs`,
        `${circuitExport}/r1cs.br`
      );
    });

    compressionQueue.push(async () => {
      await compressFile(`${tmp}/${circuit}.zkey`, `${circuitExport}/zkey.br`);
    });
  }

  console.log("\nEXPORTING CIRCUITS");
  const beaconContributions = await Promise.queue(beaconQueue);
  for (const circuit of log.circuits) {
    const vkey = await snarkjs.zKey.exportVerificationKey(
      `${tmp}/${circuit}.zkey`
    );

    fs.writeFileSync(
      `${exportCircuitsFolder}/${circuit}/vkey.json`,
      `${JSON.stringify(vkey)}\n`
    );
  }

  console.log("\nCOMPRESSING ARTIFACTS");
  await Promise.queue(compressionQueue);

  console.log("\nEXPORTING TRANSCRIPTS");

  fs.writeFileSync(
    `${exportTranscriptsFolder}/log.json`,
    `${JSON.stringify({
      beacon: beaconContributions,
      ...log,
    })}\n`
  );

  for (
    let contributionNumber = 0;
    contributionNumber <= latestContributionNumber;
    contributionNumber += 1
  ) {
    fs.copyFileSync(
      `${contributionPath(contributionNumber)}/transcript.json`,
      `${exportTranscriptsFolder}/${contributionNumber
        .toString()
        .padStart(4, "0")}.json`
    );
  }

  console.log("\nCLEANING TMP FILES");
  fs.rmSync(tmp, { recursive: true, force: true });

  process.exit();
}

void main();
