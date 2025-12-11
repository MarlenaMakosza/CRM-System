import { Application, Router } from "oak";
import { clientsRouter } from "./routes/clientsController.ts";
import { healthcheck } from "./routes/health.ts";

const app = new Application();

// Logowanie żądań
app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url.pathname}`);
  await next();
});

const router = new Router();

app.use(router.routes());
app.use(router.allowedMethods());

app.use(clientsRouter.routes());
app.use(clientsRouter.allowedMethods());
app.use(healthcheck.routes());
app.use(healthcheck.allowedMethods());

// Global error handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error("Global error handler caught:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
});

// Event listener dla nieobsłużonych błędów
app.addEventListener("error", (evt) => {
  console.error("Uncaught error:", evt.error);
});

const PORT = Number(Deno.env.get("PORT") ?? "8080");
console.log(`API listening at http://localhost:${PORT}`);
console.log(`Check health there -> http://localhost:${PORT}/api/health`);
console.log(`Check clients there -> http://localhost:${PORT}/api/clients`);
await app.listen({ port: PORT });
