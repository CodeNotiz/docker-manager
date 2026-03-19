# Phase 1: Dependencies
FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Phase 2: Builder
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable Next.js telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Phase 3: Runner
FROM node:24-alpine AS runner

LABEL org.opencontainers.image.source=https://github.com/CodeNotiz/docker-manager
LABEL org.opencontainers.image.description="A modern, web-based Docker management dashboard featuring an interactive terminal, live logs, container lifecycle controls, image and network management."
LABEL org.opencontainers.image.licenses=GPL-3.0

WORKDIR /app

ENV NODE_ENV=production

# Install Docker CLI & Compose in the container 
# (so that the Docker Manager can execute commands via socket-mounting)
RUN apk add --no-cache docker-cli docker-cli-compose

# Install only production dependencies (important for socket.io & dockerode in the custom server)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built Next.js application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/server.mjs ./

# Copy the entrypoint script and make it executable
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.mjs"]
