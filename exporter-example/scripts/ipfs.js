#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { contributionLogFile } from "./shared.js";

async function ipfsHashDir(directory) {
  return spawnSync(
    "ipfs",
    ["add", "--only-hash", "--recursive", "--quieter", directory],
    { encoding: "utf8" }
  ).stdout.replace("\n", "");
}

async function main() {
  spawnSync("ipfs", ["init"]);

  const log = contributionLogFile.read();

  const hashes = {};

  console.log("CALCULATING IPFS HASHES");
  for (const circuit of log.circuits) {
    console.log(`Calculating IPFS hash for ${circuit}`);
    hashes[circuit] = await ipfsHashDir(
      `/workspace/export/circuits/${circuit}`
    );
  }

  console.log(JSON.stringify(hashes, undefined, 2));
}

void main();
