import {AppDataSource} from '../config/configDb.js';
import {HojaVida} from '../models/HojaVida.js';
import { Empleado } from '../models/Empleado.js';
import { Administrador } from '../models/Administrador.js';



export async function getHojaVidaServices() {
  try{
    const hojavidaRepository = AppDataSource.getRepository(HojaVida)
    return await hojavidaRepository.find({
      relations : ["empleado","administrador","reporte"]
    })

  }catch(error){
    throw new Error(`Error al obtener la hoja de vida ${error.message}`)
  }
}

export async function getHojaVidaServicesByID(id) {
  try{
    const hojavidaRepository = AppDataSource.getRepository(HojaVida)
    return await hojavidaRepository.findOne({
      where : {idRegistro : id},
      relations : ["empleado","administrador","reporte"]
    })
  }catch(error){
    throw new Error(`Error al obtener la hoja de vida ${error.message}`)
  }
}

export async function createHojaVidaServices(data) {
  try{
    // Se extraen los modelos
    const empleadoRepository = AppDataSource.getRepository(Empleado)
    const administradorRepository = AppDataSource.getRepository(Administrador)
    
    //Se verifica que empleado y administrador existan
    const empleado = await empleadoRepository.findOne({
      where : {idEmpleado : data.idEmpleado}
    })
    if(!empleado) throw new Error("Empleado no encontrado")
      
      const administrador = await administradorRepository.findOne({
        where : {idAdmin : data.idAdmin}
      })
      if(!administrador) throw new Error("Administrador no encontrado")
    // Se crean y guardan en la bd 
      const hojavidaRepository = AppDataSource.getRepository(HojaVida)
      const newHojaVida = hojavidaRepository.create({
        tipo: data.tipo,
        descripcion: data.descripcion,
        fecha: data.fecha,
        empleado,
        administrador,
       })
      return await hojavidaRepository.save(newHojaVida)
    
  }catch(error){
    throw new Error(`Error al crear la hoja de vida ${error.message}`)
  }
}

export async function updateHojaVidaServices(id,data){
  try{
    const hojavidaRepository = AppDataSource.getRepository(HojaVida)
    const hojavida = await hojavidaRepository.findOneBy({idRegistro: id})

    if(!hojavida) throw new Error("Hoja de vida no encontrada")
    // aplica cambio solo a los campos permitidos
    hojavidaRepository.merge(hojavida, {
      tipo: data.tipo,
      descripcion: data.descripcion,
    })
    return await hojavidaRepository.save(hojavida)
  }catch(error){
    throw new Error(`Error al actualizar la hoja de vida ${error.message}`)
  }
}

export async function deleteHojaVidaServices(id){
  try{
    const hojavidaRepository = AppDataSource.getRepository(HojaVida)
    const resultado = await hojavidaRepository.delete(id)

    if(resultado.affected === 0){
      throw new Error("Hoja de vida no encontrada")
    }

    return { id, message: "Hoja de vida eliminada" }
  }catch(error){
    throw new Error(`Error al eliminar la hoja de vida ${error.message}`)
  }
}



