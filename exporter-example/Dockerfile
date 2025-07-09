# Start from Ubuntu 24.10 LTS image
FROM ubuntu:24.10

ARG TARGETPLATFORM

# Install curl
RUN apt-get update && apt-get install -y \
    curl \
 && rm -rf /var/lib/apt/lists/*

# Install IPFS Kubo
RUN mkdir /tmp/kubo; cd /tmp/kubo \
  && /bin/bash -exec "if [[ $TARGETPLATFORM == *"arm64"* ]]; then curl https://dist.ipfs.tech/kubo/v0.35.0/kubo_v0.35.0_linux-arm64.tar.gz -o kubo.tar.gz; fi" \
  && /bin/bash -exec "if [[ $TARGETPLATFORM == *"amd64"* ]]; then curl https://dist.ipfs.tech/kubo/v0.35.0/kubo_v0.35.0_linux-amd64.tar.gz -o kubo.tar.gz; fi" \
  && tar -xvzf kubo.tar.gz \
  && cd kubo \
  && bash install.sh \
  && rm -rf /tmp/kubo

# Install nodejs 22.xx LTS
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash \
    && apt-get update \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Copy scripts folder
COPY scripts /scripts

# Install script node modules
RUN cd /scripts && npm clean-install

# Entrypoint
ENTRYPOINT ["/scripts/entrypoint.sh"]
