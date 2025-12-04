FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy all files
COPY . .

# Install dependencies (including devDependencies for building)
RUN npm install

# Build packages first
RUN npm run build:packages

# Build web app
RUN npm run build:web

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from deps stage
# We copy the built app from apps/web/.next/standalone
# Note: You need to ensure "output": "standalone" is in next.config.js

# Copy public folder
COPY --from=deps /app/apps/web/public ./public

# Copy standalone build
# Next.js standalone build includes node_modules and server.js
COPY --from=deps --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=deps --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 8080

ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
