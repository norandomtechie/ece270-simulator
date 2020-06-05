#!/bin/bash
if [[ "$(pwd)" != *setup ]]
then
    cd setup || echo "The setup directory is missing.  Please ensure that you cloned the simulator properly." && return 1
fi
echo "Simulator setup"

declare -A gitlinks=( ["verilator"]="https://github.com/verilator/verilator" ["yosys"]="https://github.com/YosysHQ/yosys" ["cvc64"]="https://github.com/CambridgeHackers/open-src-cvc" )

echo "Setting up folders..."
for folder in analytics logging error_log
do
    mkdir -p $folder
done

echo "Checking for dependencies..."

for command in "verilator" "yosys" "cvc64"
do
    if [[ -z "$(which $command)" ]]
    then
        echo "Running $command failed!  Installing $command..."
    fi
done