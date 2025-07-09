#!/usr/bin/env node
import os from "os";
import fs from "node:fs";
import readline from "node:readline";
import process from "node:process";
import { fork } from "node:child_process";

function processParallel(tasks, concurrency = os.availableParallelism()) {
  return new Promise((res) => {
    const localTasks = [...tasks];
    const results = [];

    let resolved = false;

    const runNext = async () => {
      if (localTasks.length > 0) {
        const task = localTasks.shift()();
        results.push(task);
        await task;
        runNext();
      } else if (!resolved) {
        resolved = true;
        res(Promise.all(results));
      }
    };

    for (let i = 1; i < concurrency; i += 1) runNext();
  });
}

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

function getAllCircuits() {
  return fs
    .readdirSync("/workspace/challenge")
    .filter((file) => file.endsWith(".zkey"))
    .map((file) => file.slice(0, -5));
}

function contribute(circuit, name, entropy) {
  return new Promise((res) => {
    const forked = fork("/scripts/singleContribution.js");

    forked.on("message", (contributionHash) => {
      res(contributionHash);
    });

    forked.send({
      circuit,
      name,
      entropy,
    });
  });
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

  const queue = [];

  for (const circuit of circuits) {
    queue.push(async () => {
      console.log(`Contributing to circuit ${circuit}`);
      return {
        circuit,
        hash: await contribute(circuit, name, entropy),
      };
    });
  }
  const result = await processParallel(queue);

  result.forEach((contribution) => {
    transcript.contributions[contribution.circuit] = contribution.hash;
  });

  console.log("\nCONTRIBUTION COMPLETE");

  console.log("\nWRITING TRANSCRIPT\n");
  fs.writeFileSync(
    "/workspace/response/transcript.json",
    `${JSON.stringify(transcript, undefined, 2)}\n`
  );

  process.exit();
}

void main();
