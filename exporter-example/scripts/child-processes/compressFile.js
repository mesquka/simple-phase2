import process from "node:process";
import zlib from "node:zlib";
import { writeFileSync, readFileSync } from "node:fs";

process.on("message", (msg) => {
  const { source, destination } = msg;

  writeFileSync(
    destination,
    zlib.brotliCompressSync(readFileSync(source), {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
        [zlib.constants.BROTLI_PARAM_LGWIN]: zlib.constants.BROTLI_MAX_WINDOW_BITS,
        [zlib.constants.BROTLI_PARAM_LGBLOCK]: zlib.constants.BROTLI_MAX_INPUT_BLOCK_BITS,
      },
    })
  );

  process.send("complete");

  process.exit();
});
