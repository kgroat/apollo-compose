#!/usr/bin/env sh

function runPipeline {
    NORMAL=$(tput sgr0)
    GREEN=$(tput setaf 2)
    BOLD=$(tput bold)
    RED=$(tput setaf 1)

    trap "set +x; echo \"${RED}${BOLD}Pipeline FAILED!${NORMAL}\";trap - SIGINT SIGQUIT SIGTSTP EXIT" SIGINT SIGQUIT SIGTSTP EXIT

    echo "${BOLD}Running Pipeline...${NORMAL}"
    set -eux

    # security
    npm audit

    # static analysis
    npm run lint

    # test
    npm test

    set +x
    trap - SIGINT SIGQUIT SIGTSTP EXIT
    echo "${GREEN}${BOLD}Pipeline Passed!${NORMAL}"
}

alias pipeline="runPipeline"
