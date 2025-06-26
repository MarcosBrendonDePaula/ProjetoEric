# Backend Dockerfile
FROM oven/bun:1 as base

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim as production

WORKDIR /app

# Install production dependencies only
COPY package.json bun.lockb* ./
RUN bun install --production --frozen-lockfile

# Copy built application
COPY --from=base /app/dist ./dist
COPY --from=base /app/src ./src

# Add healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start the application
CMD ["bun", "run", "src/index.ts"]