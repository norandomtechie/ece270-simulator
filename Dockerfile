# build stage
FROM ubuntu:26.04 AS builder
ARG DEBIAN_FRONTEND=noninteractive
ARG INSIDE_DOCKER=YES
ARG JOBS
RUN apt-get update -y && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends ca-certificates git wget xz-utils \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /opt/ece270-simulator
COPY . .
RUN JOBS="${JOBS:-$(nproc)}" bash setup/setup.sh

# runtime stage: no compilers, no build trees
FROM ubuntu:26.04
LABEL maintainer="niraj@purdue.edu"
LABEL version="3.0"
LABEL description="Docker container \
for hosting the ECE 270 simulator developed for Purdue University"
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get update -y && apt-get upgrade -y \
    && apt-get install -y --no-install-recommends ca-certificates perl libfl2 zlib1g \
       libreadline8t64 libffi8 tcl libstdc++6 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local /usr/local
RUN useradd --system --create-home --uid 10001 simulator \
    && mkdir -p /var/tmp/tmpcode /opt/ece270-simulator/error_log \
    && chown simulator:simulator /var/tmp/tmpcode /opt/ece270-simulator/error_log
WORKDIR /opt/ece270-simulator
COPY --chown=simulator:simulator . .
COPY --from=builder --chown=simulator:simulator /opt/ece270-simulator/node_modules ./node_modules
USER simulator
EXPOSE 4500
CMD ["node", "cluster.js"]
