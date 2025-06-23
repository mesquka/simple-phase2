#!/usr/bin/env node
const { getCurrentContributionNumber } = require("./shared");

console.log((getCurrentContributionNumber() + 1).toString().padStart(4, "0"));
