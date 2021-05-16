FROM ubuntu:20.04
LABEL maintainer="menon18@purdue.edu"
LABEL version="1.0"
LABEL description="Custom Docker container \
for hosting the ECE 270 simulator developed for Purdue University"
# Update container
ARG DEBIAN_FRONTEND=noninteractive
ARG INSIDE_DOCKER=yes
RUN apt-get update
RUN apt-get upgrade
# Install git
RUN apt-get install -y git
# Download simulator codebase
RUN git clone https://github.com/norandomtechie/ece270-simulator $HOME/ece270-simulator
# Allow connections from outside the container
RUN sh -c "sed -i 's/127.0.0.1/0.0.0.0/g' $HOME/ece270-simulator/cluster.js"
# Install node_modules/
RUN sh -c 'cd $HOME/ece270-simulator && ./setup/setup.sh'
