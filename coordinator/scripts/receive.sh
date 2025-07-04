#!/usr/bin/env bash

CONTRIBUTION_NUMBER="$(NODE_NO_WARNINGS=1 /scripts/getNextContributionNumber.js)"

echo "Enter response code:"
read RESPONSE_CODE

wormhole receive --output-file /workspace/contributions/"$CONTRIBUTION_NUMBER" --accept-file "$RESPONSE_CODE"

echo "Transcript hash:"
shasum --algorithm 256 /workspace/contributions/"$CONTRIBUTION_NUMBER"/transcript.json

NODE_NO_WARNINGS=1 /scripts/addContribution.js
