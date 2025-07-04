#!/usr/bin/env bash

TRANSIT_RELAY="tcp:magic-wormhole-transit.debian.net:4001"

echo "Enter challenge code:"
read CHALLENGE_CODE

mkdir -p /workspace/response

wormhole --transit-helper="$TRANSIT_RELAY" receive --output-file /workspace/challenge --accept-file "$CHALLENGE_CODE"

NODE_NO_WARNINGS=1 /scripts/contribute.js

echo "Transcript hash, SAVE THIS VALUE:"
shasum --algorithm 256 /workspace/response/transcript.json
echo "You can share or publish this value for people to verify your contribution to the ceremony"

echo
echo "SEND WORMHOLE RESPONSE CODE TO COORDINATOR"
echo

wormhole --transit-helper="$TRANSIT_RELAY" send /workspace/response
