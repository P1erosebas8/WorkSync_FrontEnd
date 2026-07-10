const fs = require('fs');
const path = require('path');

const directory = 'c:\\Users\\USER\\Desktop\\WorkSync_Limpio\\WorkSync-App\\WorkSync_FrontEnd\\src';

const replacements = {
    // IDs
    '\\bidProyecto\\b': 'projectId',
    '\\bidTarea\\b': 'taskId',
    '\\bidUsuario\\b': 'userId',
    '\\bidAsignacion\\b': 'assignmentId',
    '\\bidComentario\\b': 'commentId',
    '\\bidEvidencia\\b': 'evidenceId',

    // Proyecto properties
    '\\.nombre\\b': '.name', 
    '\\.descripcion\\b': '.description',
    '\\.fechaInicio\\b': '.startDate',
    '\\.fechaFin\\b': '.endDate',
    '\\.fechaLimite\\b': '.deadline',
    '\\.estado\\b': '.status',
    '\\.fechaCreacion\\b': '.creationDate',
    'estado:': 'status:', 

    // Tarea properties
    '\\.titulo\\b': '.title',
    '\\.prioridad\\b': '.priority',
    '\\.fechaVencimiento\\b': '.dueDate',
    '\\.porcentajeAvance\\b': '.progressPercentage',
    '\\.idResponsable\\b': '.assigneeId',
    '\\.nombreResponsable\\b': '.assigneeName',
    'titulo:': 'title:',
    'descripcion:': 'description:',
    'prioridad:': 'priority:',
    'fechaVencimiento:': 'dueDate:',
    
    // Comentario y Evidencia
    '\\.contenido\\b': '.content',
    '\\.nombreArchivo\\b': '.fileName',
    '\\.tipoMime\\b': '.mimeType',
    '\\.urlDescarga\\b': '.downloadUrl',
    '\\.fechaSubida\\b': '.uploadDate',
    
    // Usuario
    '\\.correoElectronico\\b': '.email',
    '\\.contrasena\\b': '.password',
    '\\.rol\\b': '.role',
};

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;
            
            for (const [oldVal, newVal] of Object.entries(replacements)) {
                const regex = new RegExp(oldVal, 'g');
                newContent = newContent.replace(regex, newVal);
            }
            
            if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

walkDir(directory);
