"use strict";
import { AppDataSource } from "../config/configDb.js";
import { Plan } from "../models/Plan.js";

export async function obtenerPlanesService() {
  const planRepo = AppDataSource.getRepository(Plan);
  return await planRepo.find({ order: { idPlan: "ASC" } });
}