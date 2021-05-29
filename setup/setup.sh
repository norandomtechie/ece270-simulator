#!/bin/bash
if [[ "$(pwd)" != *setup ]]
then
    cd setup || (echo "The setup directory is missing.  Please ensure that you cloned the simulator repository properly, and that you're running it inside the repo folder." && exit 1)
fi
printf "ECE 270 simulator setup\n\n"

declare -A gitlinks=( ["verilator"]="https://github.com/verilator/verilator" ["yosys"]="https://github.com/YosysHQ/yosys" ["iverilog"]="https://github.com/steveicarus/iverilog" )

declare -A foldernames=( ["verilator"]="verilator" ["yosys"]="yosys" ["iverilog"]="iverilog" )

echo "Setting up folders..."
for folder in ../error_log /tmp/tmpcode
do
    mkdir -p $folder && chown $SUDO_USER:$SUDO_USER $folder
done

echo "Checking for dependencies..."
for command in "verilator" "yosys" "cvc64" "iverilog" "node"
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
            git clone "${gitlinks["$command"]}"
        fi
        
        case "$command" in
        "verilator")
            cd verilator
            apt-get -y install perl python3 make g++ libfl2 libfl-dev zlib1g zlib1g-dev autoconf flex bison
            git checkout stable
            autoconf
            ./configure
            echo "Verilator will be installed in 5 seconds using all available cores on your system.  If you wish to change the number of cores used, press Ctrl+C twice and change the \$(nproc) argument on the corresponding make command to your preferred number of cores."
            sleep 5
            make -j$(nproc) || (echo "Compiling verilator failed.  Please post an issue with the output of the command 'uname -a' on the simulator's GitHub page as well as the output produced above." && exit 1)
            make install
            cd -
            ;;
        "yosys")
            cd yosys/
            apt-get -y install build-essential clang bison flex \
            libreadline-dev gawk tcl-dev libffi-dev git \
            graphviz xdot pkg-config python3 libboost-system-dev \
            libboost-python-dev libboost-filesystem-dev zlib1g-dev
            make config-gcc
            echo "yosys will be installed in 5 seconds using all available cores on your system.  If you wish to change the number of cores used, press Ctrl+C twice and change the \$(nproc) argument on the corresponding make command to your preferred number of cores."
            sleep 5
            make -j$(nproc) || (echo "Compiling yosys failed.  Please post an issue with the output of the command 'uname -a' on the simulator's GitHub page as well as the output produced above." && exit 1)
            make install
            cd -
            ;;
        "iverilog")
            cd iverilog
            apt-get install -y gperf
            autoconf
            ./configure
            make -j$(nproc) || (echo "Compiling IcarusVerilog failed.  Please post an issue with the output of the command 'uname -a' on the simulator's GitHub page as well as the output produced above." && exit 1)
            make install
            cd - 
            ;;
        "node")
            wget https://nodejs.org/dist/v14.17.0/node-v14.17.0-linux-x64.tar.xz
            unxz node-v14.17.0-linux-x64.tar.xz
            tar -xf node-v14.17.0-linux-x64.tar
            mv node-v14.17.0-linux-x64 node
            for i in $(/usr/bin/ls $(pwd)/node/bin/*); 
            do 
                ln -s $i /usr/bin/$(basename $i);
            done
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
    /usr/bin/npm config set user 0
    /usr/bin/npm config set unsafe-perm true
fi
/usr/bin/npm i || echo "npm was not installed correctly.  This might be because the node.js installation was not successful.  Install node.js manually and re-run this script."
mkdir -p /tmp/tmpcode
if [ "$INSIDE_DOCKER" != "YES" ]
then
    echo "Starting node server..."
    runuser -l $SUDO_USER -c "node $(pwd)/cluster.js > $(pwd)/serverlog 2>&1 &"
    sleep 3     # give some spin-up time
    if [ "$(cat serverlog)" == "Simulator started and running on port 4500." ]
    then
        echo "The node server with dependencies have been successfully set up!  Visit localhost:4500 to access the simulator hosted on this machine, or configure https://verilog.ecn.purdue.edu/ to use your computer to perform simulations!"
        exit 0
    else
        echo "An error has occurred.  Please post the output of 'cat serverlog' in a GitHub issue along with any other errors that may have printed out from this script."
        exit 1
    fi
fi