#!/usr/bin/env bash

CONTRIBUTION_NUMBER="$(NODE_NO_WARNINGS=1 /scripts/getCurrentContributionNumber.js)"

echo
echo "SEND WORMHOLE CHALLENGE CODE TO CONTRIBUTOR:"
echo

wormhole send /workspace/contributions/"$CONTRIBUTION_NUMBER"
