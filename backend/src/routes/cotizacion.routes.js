"use strict";
import { Router } from "express";
import {
    crearSolicitud,
    obtenerCotizaciones, //para el admin
    obtenerMisCotizaciones, //para el cliente
    actualizarEstado,
    reactivarSolicitud
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
    autorizeEntities("administrador"),      
    obtenerCotizaciones            
);

router.patch("/:id/estado",
    authMiddleware,
    autorizeEntities("administrador"),
    actualizarEstado
);

router.put("/:id/reactivar",
    authMiddleware,
    autorizeEntities("administrador"),
    reactivarSolicitud
);

export default router;