import process from "node:process";
import { zKey } from "snarkjs";
import { arrayToHex } from "../shared.js";

process.on("message", async (msg) => {
  const { source, destination, beacon } = msg;

  const beaconContribution = await zKey.beacon(
    source,
    destination,
    "Beacon",
    beacon,
    10
  );

  process.send(arrayToHex(beaconContribution, 32));

  process.exit();
});
