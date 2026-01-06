# Backend Dockerfile - Deno API
FROM denoland/deno:2.1.4

WORKDIR /app

# Kopiuj pliki konfiguracyjne
COPY deno.json .
COPY db/ ./db/
COPY backend/ ./backend/

# Cache dependencies
RUN deno cache backend/src/main.ts

# Expose port
EXPOSE 8080

# Run
CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "backend/src/main.ts"]
