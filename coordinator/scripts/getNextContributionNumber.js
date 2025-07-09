#!/usr/bin/env node
import { getCurrentContributionNumber } from "./shared.js";

console.log((getCurrentContributionNumber() + 1).toString().padStart(4, "0"));
