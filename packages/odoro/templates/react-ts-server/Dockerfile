# syntax=docker/dockerfile:1

# --- Etape 1 : dependances -----------------------------------------------
# Isolee pour que le cache de couches survive a toute modification du code :
# seule une modification du manifeste relance l'installation.
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

# --- Etape 2 : compilation ------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Etape 3 : dependances de production ----------------------------------
# Reinstallees a part : l'image finale ne doit pas embarquer la chaine de
# compilation, qui pese souvent plus que l'application elle-meme.
FROM node:22-alpine AS runtime-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# --- Etape 4 : image finale -----------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001

# Un processus applicatif n'a aucune raison de tourner en root.
RUN addgroup -S odoro && adduser -S odoro -G odoro

COPY --from=runtime-deps --chown=odoro:odoro /app/node_modules ./node_modules
COPY --from=build --chown=odoro:odoro /app/dist ./dist
COPY --chown=odoro:odoro package.json ./

USER odoro
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3001)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server/main.js"]
