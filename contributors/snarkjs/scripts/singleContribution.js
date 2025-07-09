import process from "node:process";
import { zKey } from "snarkjs";

function arrayToHex(array, byteLength) {
  return Buffer.from(array)
    .toString("hex")
    .padStart(byteLength * 2, "0");
}

process.on("message", async (msg) => {
  const { circuit, name, entropy } = msg;

  const contributionHash = await zKey.contribute(
    `/workspace/challenge/${circuit}.zkey`,
    `/workspace/response/${circuit}.zkey`,
    name,
    entropy
  );

  process.send(arrayToHex(contributionHash, 32));

  process.exit();
});
