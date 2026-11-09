#!/bin/bash
if [[ "$(pwd)" != *setup ]]
then
    cd setup || (echo "The setup directory is missing.  Please ensure that you cloned the simulator repository properly, and that you're running it inside the repo folder." && exit 1)
fi
JOBS="${JOBS:-$(nproc)}"   # parallel make jobs; override with JOBS=n
printf "ECE 270 simulator setup\n\n"

declare -A gitlinks=( ["verilator"]="https://github.com/verilator/verilator" ["yosys"]="https://github.com/YosysHQ/yosys" ["iverilog"]="https://github.com/steveicarus/iverilog" )
# Release tags (previously pinned to older commits). Verilator 5.x is required for --timing.
declare -A relcommits=( ["verilator"]="v5.054" ["yosys"]="v0.70" ["iverilog"]="v13_0" )
NODE_VERSION="v24.22.2"   # Node.js 24 LTS
declare -A foldernames=( ["verilator"]="verilator" ["yosys"]="yosys" ["iverilog"]="iverilog" )

echo "Setting up folders..."
for folder in ../error_log /var/tmp/tmpcode
do
    mkdir -p $folder && chown "${APP_USER:-${SUDO_USER:-root}}:${APP_USER:-${SUDO_USER:-root}}" $folder
done

echo "Checking for dependencies..."
for command in "verilator" "yosys" "iverilog" "node"
do
    which $command
    if [[ $? == 1 ]]
    then
        echo "$command does not exist on this system!  Installing $command..."
        if [[ "$EUID" -ne 0 ]]
        then
            echo "This script needs to install dependencies for $command.  Rerun as root."
            exit 1
        fi
        apt-get update
        # if repository was already downloaded, 
        # no need to clone again
        if [ ! -d "${foldernames["$command"]}" ]
        then
            git clone --recurse-submodules "${gitlinks["$command"]}"
        fi
        
        case "$command" in
        "verilator")
            cd verilator
            apt-get -y install perl python3 make g++ libfl2 libfl-dev zlib1g zlib1g-dev autoconf flex bison help2man
            git checkout "${relcommits["$command"]}"
            autoconf
            ./configure
            echo "Verilator will be installed in 5 seconds using all available cores on your system.  If you wish to change the number of cores used, press Ctrl+C twice and change the \$(nproc) argument on the corresponding make command to your preferred number of cores."
            sleep 5
            make -j"$JOBS" || { echo "Compiling verilator failed.  Please post an issue with the output of the command 'uname -a' on the simulator's GitHub page as well as the output produced above."; exit 1; }
            make install
            cd -
            ;;
        "yosys")
            cd yosys/
            git checkout "${relcommits["$command"]}"
            git submodule update --init --recursive
            apt-get -y install build-essential clang bison flex \
            libreadline-dev gawk tcl-dev libffi-dev git \
            graphviz xdot pkg-config python3 libboost-system-dev \
            libboost-filesystem-dev zlib1g-dev cmake lld libfl-dev
            # Yosys >= 0.6x builds with CMake (needs CMake >= 3.28)
            cmake -B build -DCMAKE_BUILD_TYPE=Release
            echo "yosys will be installed in 5 seconds using all available cores on your system.  If you wish to change the number of cores used, press Ctrl+C twice and change the \$(nproc) argument on the corresponding make command to your preferred number of cores."
            sleep 5
            cmake --build build -j"$JOBS" || { echo "Compiling yosys failed.  Please post an issue with the output of the command 'uname -a' on the simulator's GitHub page as well as the output produced above."; exit 1; }
            cmake --install build
            cd -
            ;;
        "iverilog")
            cd iverilog
            git checkout "${relcommits["$command"]}"
            apt-get install -y gperf
            autoconf
            ./configure
            make -j"$JOBS" || { echo "Compiling IcarusVerilog failed.  Please post an issue with the output of the command 'uname -a' on the simulator's GitHub page as well as the output produced above."; exit 1; }
            make install
            cd - 
            ;;
        "node")
            NODE_TAR="node-${NODE_VERSION}-linux-$(uname -m | sed 's/x86_64/x64/;s/aarch64/arm64/')"
            wget "https://nodejs.org/dist/${NODE_VERSION}/${NODE_TAR}.tar.xz" "https://nodejs.org/dist/${NODE_VERSION}/SHASUMS256.txt"
            # verify download integrity before installing
            grep " ${NODE_TAR}.tar.xz\$" SHASUMS256.txt | sha256sum -c - || exit 1
            tar -xf "${NODE_TAR}.tar.xz"
            rm -rf /usr/local/node && mv "${NODE_TAR}" /usr/local/node
            for i in /usr/local/node/bin/*
            do
                ln -sf "$i" /usr/local/bin/$(basename "$i")
            done
            rm -f "${NODE_TAR}.tar.xz" SHASUMS256.txt
            ;;
        *)
            echo "wait... what?  You modified this script, didn't you!?"
            ;;
        esac
    fi
done


cd ..
echo "Installing node modules..."
# https://stackoverflow.com/questions/51811564/sh-1-node-permission-denied
if [ "$INSIDE_DOCKER" == "YES" ]
then
    npm config set user 0
    npm config set unsafe-perm true
fi
# reproducible install from the lockfile, skipping dependency lifecycle scripts.
# (devDependencies are NOT omitted: cors and express-sanitizer are required at runtime.)
npm ci --ignore-scripts || echo "npm was not installed correctly.  This might be because the node.js installation was not successful.  Install node.js manually and re-run this script."
#if [ "$INSIDE_DOCKER" != "YES" ]
#then
#    echo "Starting node server..."
#    # runuser -l $SUDO_USER -c "node $(pwd)/cluster.js > $(pwd)/serverlog 2>&1 &"
#    node $(pwd)/cluster.js > $(pwd)/serverlog 2>&1 &
#    sleep 3     # give some spin-up time
#    if [ "$(cat serverlog)" == "Simulator started and running on port 4500." ]
#    then
#        echo "The node server with dependencies have been successfully set up!  Visit localhost:4500 to access the simulator hosted on this machine, or configure https://verilog.ecn.purdue.edu/ to use your computer to perform simulations!"
#        exit 0
#    else
#        echo "An error has occurred.  Please post the output of 'cat serverlog' in a GitHub issue along with any other errors that may have printed out from this script."
#        exit 1
#    fi
#fi
