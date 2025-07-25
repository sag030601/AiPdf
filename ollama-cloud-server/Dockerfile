# Start from Ubuntu base
FROM ubuntu:22.04

# Prevent interactive prompts during install
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y \
  curl \
  gnupg \
  unzip \
  software-properties-common

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Expose Ollama API port
EXPOSE 11434

# Start Ollama and pull llama2
CMD /bin/bash -c "ollama serve & sleep 5 && ollama pull llama2 && tail -f /dev/null"
