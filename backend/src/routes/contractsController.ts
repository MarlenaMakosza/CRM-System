import { Router } from "oak";
import * as contractService from "../service/contractService.ts";
import { handleError } from "../utils/errorHandler.ts";
import { AuthUser } from "../types/auth.ts";

export const contractsRouter = new Router({ prefix: "/api/contracts" });

// ===== ENDPOINTS =====

// GET /api/contracts – lista umów
// Pracownicy widzą tylko swoje umowy, szef widzi wszystko
contractsRouter.get("/", async (ctx) => {
  try {
    const user = ctx.state.user as AuthUser;

    // Jeśli pracownik - filtruj po przedstawiciel_id
    // Jeśli szef - pokaż wszystko (undefined = brak filtra)
    const przedstawicielId = user.rola === "pracownik" ? user.id : undefined;

    ctx.response.body = await contractService.listContracts(przedstawicielId);
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// GET /api/contracts/:id – szczegóły umowy (wraz z pozycjami)
contractsRouter.get("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    ctx.response.body = await contractService.getContractDetails(id);
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});

// POST /api/contracts – utworzenie umowy
contractsRouter.post("/", async (ctx) => {
  try {
    const body = ctx.request.body({ type: "json" });
    const data = await body.value;

    ctx.response.body = await contractService.createContract(data);
    ctx.response.status = 201;
  } catch (error) {
    handleError(ctx, error);
  }
});

// PUT /api/contracts/:id – aktualizacja umowy (pełna zamiana)
contractsRouter.put("/:id", async (ctx) => {
  try {
    const id = Number(ctx.params.id);
    const body = ctx.request.body({ type: "json" });
    const data = await body.value;

    ctx.response.body = await contractService.updateContract(id, data);
    ctx.response.status = 200;
  } catch (error) {
    handleError(ctx, error);
  }
});
