FROM ubuntu:20.04
LABEL maintainer="menon18@purdue.edu"
LABEL version="1.0"
LABEL description="Custom Docker container \
for hosting the ECE 270 simulator developed for Purdue University"
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update
# Install verilator and yosys packages
RUN apt-get install -y curl
RUN sh -c 'curl -sL https://deb.nodesource.com/setup_14.x | bash -'
RUN apt-get install -y verilator yosys git curl build-essential nodejs zlib1g-dev
# Install CVC from cambridgehackers GitHub
RUN git clone https://github.com/cambridgehackers/open-src-cvc $HOME/open-src-cvc
RUN sh -c 'cd $HOME/open-src-cvc/src && make -f makefile.cvc64'
RUN ln -s $HOME/open-src-cvc/src/cvc64 /usr/bin/cvc64
# Download simulator codebase
RUN git clone https://github.com/norandomtechie/ece270-simulator $HOME/ece270-simulator
RUN rm -f $HOME/ece270-simulator/package-lock.json
# Install node_modules/
RUN sh -c 'cd $HOME/ece270-simulator && npm i'
# Allow connections from outside the container
RUN sh -c "sed -i 's/127.0.0.1/0.0.0.0/g' $HOME/ece270-simulator/cluster.js"
# /tmp/tmpcode is used to hold files during synthesis/simulation
RUN mkdir /tmp/tmpcode
# Start server
CMD node $HOME/ece270-simulator/cluster.js
