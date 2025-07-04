const process = require("node:process");
const snarkjs = require("snarkjs");
const { arrayToHex } = require("../shared.js");

process.on("message", async (msg) => {
  const { source, destination, beacon } = msg;

  const beaconContribution = await snarkjs.zKey.beacon(
    source,
    destination,
    "Beacon",
    beacon,
    10
  );

  process.send(arrayToHex(beaconContribution, 32));

  process.exit();
});
