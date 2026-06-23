import multer from "multer"
import path from "path"

const storage = multer.diskStorage({ // DiskStorage -> Almacenamiento local

  destination: function(req,file,callback){
    callback(null,"uploads/") // callback siempre recibe 2 argumentos error y carpeta
  },

  filename : function(req,file,callback){
    //Agregamos un prefijo unico con la fecha actual para evitar 2 archivos se sobreescribanm
    const prefixUnic = Date.now() + '-' + Math.round(Math.random()  * 100) 
    const extension = path.extname(file.originalname)// Extrae .jpg .pdf etc
    callback(null,file.fieldname + '-' + prefixUnic + extension)
  }
})

const filter = (req,file,callback) => {
  const allowTypes = ['application/pdf']

  if(allowTypes.includes(file.mimetype)) {
    return callback(null,true)
  }
  callback(new Error('Formato no válido. Solo se permiten archivos PDF'), false)
}


const uploadMiddleware = multer({
  storage:storage,
  limits: {
     fileSize: 10 * 1024 * 1024 //10 Megas
  },
  fileFilter: filter
})

export default uploadMiddleware