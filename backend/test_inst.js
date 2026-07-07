import { AppDataSource } from "./src/config/configDb.js";
import { obtenerInstalacionesService } from "./src/services/instalacion.service.js";
AppDataSource.initialize().then(async () => {
    const res = await obtenerInstalacionesService();
    console.log(JSON.stringify(res, null, 2));
    process.exit();
}).catch(console.error);
