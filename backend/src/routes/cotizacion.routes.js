"use strict";
import { Router } from "express";
import {
    crearSolicitud,
    obtenerCotizaciones, //para el admin
    obtenerMisCotizaciones //para el cliente
} from "../controllers/cotizacion.controller.js";
import { authMiddleware, autorizeEntities } from "../middleware/authentication.js";

const router = Router();

router.post("/solicitar",
    authMiddleware,                 
    autorizeEntities("cliente"),    
    crearSolicitud                  
);

router.get("/mis-cotizaciones",
    authMiddleware,
    autorizeEntities("cliente"),
    obtenerMisCotizaciones
);

router.get("/", 
    authMiddleware,                
    autorizeEntities("admin"),      
    obtenerCotizaciones            
);

export default router;