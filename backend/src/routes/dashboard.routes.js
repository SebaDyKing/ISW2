"use strict";
import { Router } from "express";
import { authMiddleware, autorizeEntities } from "../middleware/authentication.js";
import { getDashboard } from "../controllers/dashboard.controller.js";

const router = Router();

// Solo el administrador puede ver el dashboard
router.get("/", authMiddleware, autorizeEntities("admin"), getDashboard);

export default router;