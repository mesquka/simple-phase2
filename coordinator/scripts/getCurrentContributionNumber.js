#!/usr/bin/env node
const { getCurrentContributionNumber } = require("./shared.js");

console.log(getCurrentContributionNumber().toString().padStart(4, "0"));
