import { AppDataSource } from './src/config/db.js';

AppDataSource.initialize().then(async () => {
    try {
        const docRepo = AppDataSource.getRepository('Documento');
        const docs = await docRepo.find({ order: { fechaCreacion: 'DESC' }, take: 1 });
        if (docs.length > 0) {
            console.log('Deleting doc:', docs[0]);
            await docRepo.remove(docs[0]);
        }

        const ciRepo = AppDataSource.getRepository('ContratoInstalacion');
        const cis = await ciRepo.find({ order: { idAsignacion: 'DESC' }, take: 1 });
        if (cis.length > 0) {
            console.log('Deleting ci:', cis[0]);
            await ciRepo.remove(cis[0]);
        }
        
        console.log('Done');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
});
