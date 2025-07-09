import process from "node:process";
import { zKey } from "snarkjs";
import { constants, contributionPath, arrayToHex } from "../shared.js";

process.on("message", async (msg) => {
  const { circuit, contributionNumber } = msg;

  const mpcParams = await zKey.verifyFromR1cs(
    `${constants.R1CS}/${circuit}.r1cs`,
    `${constants.PHASE1_PTAU}`,
    `${contributionPath(contributionNumber)}/${circuit}.zkey`
  );

  const mpcParamsFormatted = {
    contributions: mpcParams.contributions.map((contribution) =>
      arrayToHex(contribution.contributionHash, 32)
    ),
    csHash: arrayToHex(mpcParams.csHash, 32),
  };

  process.send({
    valid: mpcParams !== false,
    mpcParams: mpcParamsFormatted,
  });

  process.exit();
});
