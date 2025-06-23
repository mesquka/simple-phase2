#!/usr/bin/env bash

help() {
  echo
  echo "Syntax: <docker run ....> [command]"
  echo "Commands:"
  echo "help      Print this"
  echo "debug     Noops and leaves container running for debug purposes"
  echo "init      Setup initial ceremony files"
  echo "send      Send files for new ceremony contribution"
  echo "receive   Recieve, verify, and add new ceremony contribution"
  echo "add       Verify and add next contribution from disk (useful if verifying an already performed ceremony)"
  echo
}

init() {
  NODE_NO_WARNINGS=1 /scripts/init.js
}

debug() {
  sleep infinity;
}

send() {
  /scripts/send.sh
}

receive() {
  /scripts/receive.sh
}

add() {
  NODE_NO_WARNINGS=1 /scripts/addContribution.js
}

case $1 in
  debug)
    debug
    exit;;
  init)
    init
    exit;;
  send)
    send
    exit;;
  receive)
    receive
    exit;;
  add)
    add
    exit;;
  *)
    help
    exit;;
esac
