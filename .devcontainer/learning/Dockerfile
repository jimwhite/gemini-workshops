# Copyright 2025 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Development container for VS Code devcontainers
FROM node:25-slim

# Set working directory
WORKDIR /workspaces/learning

# Install git and other useful development tools
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY . .
# Note: The actual source code will be mounted from the host
COPY package.json package-lock.json ./

RUN npm install

ENV ESLINT_IGNORE_DURING_BUILDS=1
RUN npm run build

# Keep container running for devcontainer
CMD ["node", "server.js"]
