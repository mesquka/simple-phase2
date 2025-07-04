#!/usr/bin/env bash

case $1 in
debug)
  sleep infinity
  exit
  ;;
init)
  NODE_NO_WARNINGS=1 /scripts/init.js
  exit
  ;;
send)
  /scripts/send.sh
  exit
  ;;
receive)
  /scripts/receive.sh
  exit
  ;;
add)
  NODE_NO_WARNINGS=1 /scripts/addContribution.js
  exit
  ;;
export)
  NODE_NO_WARNINGS=1 /scripts/export.js
  exit
  ;;
*)
  echo
  echo "Syntax: <docker run ....> [command]"
  echo "Commands:"
  echo "help      Print this"
  echo "debug     Noops and leaves container running for debug purposes"
  echo "init      Setup initial ceremony files"
  echo "send      Send files for new ceremony contribution"
  echo "receive   Recieve, verify, and add new ceremony contribution"
  echo "add       Verify and add next contribution from disk (useful if verifying an already performed ceremony)"
  echo "export    Export ceremony"
  echo
  exit
  ;;
esac
