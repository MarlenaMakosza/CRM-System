# Frontend Dockerfile - SvelteKit + Nginx
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Kopiuj package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Kopiuj źródła
COPY . .

# API URL dla produkcji (nginx proxy)
ENV VITE_API_URL=/api

# Build
RUN npm run build

# Stage 2: Production - nginx
FROM nginx:alpine

# Kopiuj zbudowane pliki
COPY --from=builder /app/build /usr/share/nginx/html

# Kopiuj konfigurację nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
