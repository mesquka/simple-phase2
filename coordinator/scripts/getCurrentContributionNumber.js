#!/usr/bin/env node
import { getCurrentContributionNumber } from "./shared.js";

console.log(getCurrentContributionNumber().toString().padStart(4, "0"));
