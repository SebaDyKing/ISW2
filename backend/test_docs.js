import { AppDataSource, connectDB } from "./src/config/configDb.js";

async function run() {
  await connectDB();
  const docs = await AppDataSource.getRepository("Documento").find({ relations: ["cliente"] });
  const contratos = await AppDataSource.getRepository("Contrato").find({ relations: ["cliente"] });
  
  const clientDocs = docs.filter(d => d.cliente !== null);
  const clientContratos = contratos.filter(c => c.cliente !== null);
  
  console.log("Docs con cliente:", clientDocs.length);
  console.log("Contratos con cliente:", clientContratos.length);
  process.exit(0);
}

run();
