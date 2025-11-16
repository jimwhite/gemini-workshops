# Dev Container Configuration

This directory contains the dev container configuration for the Learning Platform (PAIP & Pytudes).

## What's Included

- **Node.js 20** runtime environment
- **TypeScript** and **ts-node** globally installed
- **VS Code extensions** for React, TypeScript, Tailwind CSS, and ESLint
- **Port forwarding** for Next.js dev server (port 3000)
- **Git** and **GitHub CLI** for version control

## Usage

### Opening in GitHub Codespaces

1. Navigate to the repository on GitHub
2. Click the green "Code" button
3. Select "Codespaces" tab
4. Click "Create codespace on [branch-name]"

The container will automatically:
- Build the development environment
- Install npm dependencies
- Configure VS Code with recommended extensions

### Running the Development Server

After the container is created, run:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Configuration Files

- `devcontainer.json` - Main dev container configuration
- `docker-compose.yml` - Docker Compose service definition
- `Dockerfile.dev` - Development-optimized Dockerfile

## Production Dockerfile

The production Dockerfile (`../Dockerfile`) is used for Cloud Run deployments and is optimized for minimal image size and fast cold starts. The dev container uses a separate development-optimized configuration.
