"use strict";
import { Router } from "express";
import {
  getHojasVidaController,
  getHojaVidaByIdController,
  createHojaVidaController,
  updateHojaVidaController,
  deleteHojaVidaController,
} from "../controllers/hojavida.controllers.js";

const router = Router();

router.get("/", getHojasVidaController);
router.get("/:id", getHojaVidaByIdController);
router.post("/", createHojaVidaController);
router.patch("/:id", updateHojaVidaController);
router.delete("/:id", deleteHojaVidaController);

export default router;
