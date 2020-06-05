#!/bin/bash
if [[ "$(pwd)" != *setup ]]
then
    cd setup || (echo "The setup directory is missing.  Please ensure that you cloned the simulator properly." && exit 1)
fi
printf "ECE 270 simulator setup\n\n"

declare -A gitlinks=( ["verilator"]="https://github.com/verilator/verilator" ["yosys"]="https://github.com/YosysHQ/yosys" ["cvc64"]="https://github.com/CambridgeHackers/open-src-cvc" )

echo "Setting up folders..."
for folder in analytics logging error_log
do
    mkdir -p ../$folder
done

echo "Checking for dependencies..."
for command in "verilator" "yosys" "cvc64" "node"
do
    if [[ -z "$(which $command)" ]]
    then
        echo "$command does not exist on this system!  Installing $command..."
        if [[ "$EUID" -ne 0 ]]
        then
            echo "This script needs to install dependencies for $command.  Rerun as root."
            exit 1
        fi
        git clone "${gitlinks["$command"]}"
        
        case "$command" in
        "verilator")
            cd verilator
            apt-get install perl python3 make g++ libfl2 libfl-dev zlibc zlib1g zlib1g-dev autoconf flex bison
            git checkout stable
            autoconf
            ./configure
            echo "Verilator will be installed in 5 seconds using all available cores on your system.  If you wish to change the number of cores used, press Ctrl+C twice and change the \$(nproc) argument on the corresponding make command to your preferred number of cores."
            sleep 5
            make -j$(nproc) install || (echo "Compiling verilator failed.  Please post an issue with the output of the command 'uname -a' on the simulator's GitHub page as well as the output produced above." && exit 1)
            cd -
            rm -rf verilator
            ;;
        "yosys")
            cd yosys/
            apt-get install build-essential clang bison flex \
            libreadline-dev gawk tcl-dev libffi-dev git \
            graphviz xdot pkg-config python3 libboost-system-dev \
            libboost-python-dev libboost-filesystem-dev zlib1g-dev
            make config-gcc
            make -j$(nproc) install || (echo "Compiling yosys failed.  Please post an issue with the output of the command 'uname -a' on the simulator's GitHub page as well as the output produced above." && exit 1)
            cd -
            rm -rf yosys
            ;;
        "cvc64")
            cd open-src-cvc/src
            make -f makefile.cvc64 || (echo "Compiling cvc failed.  Please post an issue with the output of the command 'uname -a' on the simulator's GitHub page as well as the output produced above." && exit 1)
            cp cvc64 /usr/bin/cvc64
            cd -
            rm -rf open-src-cvc
            ;;
        "node")
            curl -sL https://deb.nodesource.com/setup_12.x | bash -
            apt install nodejs
            ;;
        *)
            echo "wait... what?  You modified this script, didn't you!?"
            ;;
        esac
    fi
done


echo "Starting node server..."
node index.js > serverlog 2>&1 &
if [ "$(cat serverlog)" == "" ]
then
    echo "The node server with dependencies have been successfully set up!  Visit localhost:4500 to access the simulator hosted on this machine, or configure https://verilog.ecn.purdue.edu/ to use your computer to perform simulations!"
    exit 0
else
    echo "An error has occurred.  Please post the output of 'cat serverlog' in a GitHub issue along with any other errors that may have printed out from this script."
    exit 1
fi