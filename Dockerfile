# Étape 1 : Build de l'application
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Étape 2 : Exécution de l'application
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
# Installe uniquement les dépendances de production
RUN npm ci --only=production

# Copie les fichiers générés à l'étape précédente
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]
