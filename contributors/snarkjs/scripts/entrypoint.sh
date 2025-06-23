#!/usr/bin/env bash

echo "Enter challenge code:"
read CHALLENGE_CODE

mkdir -p /workspace/response

wormhole receive --output-file /workspace/challenge --accept-file "$CHALLENGE_CODE"

rm /workspace/challenge/transcript.json

NODE_NO_WARNINGS=1 /scripts/contribute.js

echo "Transcript hash, SAVE THIS VALUE:"
shasum --algorithm 256 /workspace/response/transcript.json
echo "You can share or publish this value for people to verify your contribution to the ceremony"

echo
echo "SEND WORMHOLE RESPONSE CODE TO COORDINATOR"
echo

wormhole send /workspace/response
