# Start from Ubuntu 24.10 LTS image
FROM ubuntu:24.10

# Install curl
RUN apt-get update && apt-get install -y \
    curl \
 && rm -rf /var/lib/apt/lists/*

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
