#!/usr/bin/env node
const { getCurrentContributionNumber } = require("./shared");

console.log(getCurrentContributionNumber().toString().padStart(4, "0"));
