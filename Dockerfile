FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy monorepo files
COPY package.json pnpm-lock.yaml turbo.json ./
COPY apps/web ./apps/web
COPY packages/db ./packages/db
COPY packages/api ./packages/api

# Install dependencies
RUN pnpm install

# Build
RUN pnpm build

# Start web app
WORKDIR /app/apps/web
EXPOSE 3000

CMD ["pnpm", "start"]
