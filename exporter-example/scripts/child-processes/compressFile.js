const process = require("node:process");
const zlib = require("node:zlib");
const fs = require("node:fs");

process.on("message", (msg) => {
  const { source, destination } = msg;

  fs.writeFileSync(
    destination,
    zlib.brotliCompressSync(fs.readFileSync(source), {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]:
          zlib.constants.BROTLI_MAX_QUALITY,
        [zlib.constants.BROTLI_PARAM_LGWIN]:
          zlib.constants.BROTLI_MAX_WINDOW_BITS,
        [zlib.constants.BROTLI_PARAM_LGBLOCK]:
          zlib.constants.BROTLI_MAX_INPUT_BLOCK_BITS,
      },
    })
  );

  process.send("complete");

  process.exit();
});
