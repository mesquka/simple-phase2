#!/usr/bin/env bash

case $1 in
debug)
  sleep infinity
  exit
  ;;
export)
  NODE_NO_WARNINGS=1 /scripts/export.js
  exit
  ;;
ipfs)
  NODE_NO_WARNINGS=1 /scripts/ipfs.js
  exit
  ;;
*)
  echo
  echo "Syntax: <docker run ....> [command]"
  echo "Commands:"
  echo "help      Print this"
  echo "export    Exports ceremony output into directory structure"
  echo "ipfs      Calculates IPFS hashes for ceremony artifacts"
  echo
  exit
  ;;
esac
