"use strict";
import { obtenerPlanesService } from "../services/plan.service.js";

export async function obtenerPlanes(req, res) {
  try {
    const planes = await obtenerPlanesService();
    res.status(200).json({ data: planes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}