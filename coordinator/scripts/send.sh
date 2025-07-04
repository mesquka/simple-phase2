#!/usr/bin/env bash

TRANSIT_RELAY="tcp:magic-wormhole-transit.debian.net:4001"

CONTRIBUTION_NUMBER="$(NODE_NO_WARNINGS=1 /scripts/getCurrentContributionNumber.js)"

echo
echo "SEND WORMHOLE CHALLENGE CODE TO CONTRIBUTOR:"
echo

wormhole --transit-helper="$TRANSIT_RELAY" send /workspace/contributions/"$CONTRIBUTION_NUMBER"
