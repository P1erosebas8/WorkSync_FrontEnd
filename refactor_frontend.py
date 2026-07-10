import os
import re

directory = r"c:\Users\USER\Desktop\WorkSync_Limpio\WorkSync-App\WorkSync_FrontEnd\src"

replacements = {
    # IDs
    r'\bidProyecto\b': 'projectId',
    r'\bidTarea\b': 'taskId',
    r'\bidUsuario\b': 'userId',
    r'\bidAsignacion\b': 'assignmentId',
    r'\bidComentario\b': 'commentId',
    r'\bidEvidencia\b': 'evidenceId',

    # Proyecto properties
    r'\.nombre\b': '.name', # Only replacing .nombre to avoid changing HTML text
    r'\.descripcion\b': '.description',
    r'\.fechaInicio\b': '.startDate',
    r'\.fechaFin\b': '.endDate',
    r'\.fechaLimite\b': '.deadline',
    r'\.estado\b': '.status',
    r'\.fechaCreacion\b': '.creationDate',
    r'estado:': 'status:', # for body JSON

    # Tarea properties
    r'\.titulo\b': '.title',
    r'\.prioridad\b': '.priority',
    r'\.fechaVencimiento\b': '.dueDate',
    r'\.porcentajeAvance\b': '.progressPercentage',
    r'\.idResponsable\b': '.assigneeId',
    r'\.nombreResponsable\b': '.assigneeName',
    r'titulo:': 'title:',
    r'descripcion:': 'description:',
    r'prioridad:': 'priority:',
    r'fechaVencimiento:': 'dueDate:',
    
    # Comentario y Evidencia
    r'\.contenido\b': '.content',
    r'\.nombreArchivo\b': '.fileName',
    r'\.tipoMime\b': '.mimeType',
    r'\.urlDescarga\b': '.downloadUrl',
    r'\.fechaSubida\b': '.uploadDate',
    
    # Usuario
    r'\.correoElectronico\b': '.email',
    r'\.contrasena\b': '.password',
    r'\.rol\b': '.role',
}

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.js') or file.endswith('.jsx'):
            file_path = os.path.join(root, file)
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content
            for old, new in replacements.items():
                new_content = re.sub(old, new, new_content)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated {file_path}")
