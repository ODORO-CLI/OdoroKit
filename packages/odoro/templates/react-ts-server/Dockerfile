# syntax=docker/dockerfile:1

# --- Stage 1: dependencies -----------------------------------------------
# Isolated so that the layer cache survives any change to the code: only a
# change to the manifest re-runs the install.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN if [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm install --frozen-lockfile; \
    elif [ -f yarn.lock ]; then \
      corepack enable && yarn install --immutable; \
    else \
      npm ci; \
    fi

# --- Stage 2: build -------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Stage 3: production dependencies -------------------------------------
# Reinstalled separately: the final image must not carry the build chain,
# which often weighs more than the application itself.
FROM node:22-alpine AS runtime-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# --- Stage 4: final image -------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# An application process has no reason to run as root.
RUN addgroup -S odoro && adduser -S odoro -G odoro

COPY --from=runtime-deps --chown=odoro:odoro /app/node_modules ./node_modules
COPY --from=build --chown=odoro:odoro /app/dist ./dist
COPY --chown=odoro:odoro package.json ./

USER odoro
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server/main.js"]
