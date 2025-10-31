import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  
  async consultarChatbot(usuario: string, pregunta: string, tipo: 'planificacion' | 'planificador' | 'adecuacion' | 'seguimiento' = 'planificacion') {
    try {
      // Mapeo de tipos a URLs
      const urlMap = {
        planificacion: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/planificacion',
        planificador: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/planificador',
        adecuacion: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/adecuacion',
        seguimiento: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/seguimiento'
      };

      const url = urlMap[tipo];
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario,
          pregunta,
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'API_ERROR',
          message: `Error al consultar el servicio de ${tipo}`
        };
      }

      // Obtener el nombre del archivo desde el Content-Disposition si existe
      let filename = `${tipo}_${Date.now()}.xlsx`;
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const buffer = await response.arrayBuffer();
      const bufferData = Buffer.from(buffer);
      
      // Verificar si el contenido es "false"
      const textContent = bufferData.toString('utf8');
      if (textContent.includes('false') || textContent.trim() === 'false') {
        return {
          success: false,
          error: 'INVALID_QUESTION',
          message: `No se pudo generar el documento solicitado. Verifique que la pregunta sea válida para ${tipo}.`
        };
      }

      return {
        success: true,
        buffer: bufferData,
        contentType: response.headers.get('content-type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: filename
      };
    } catch (error) {
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno al consultar el servicio'
      };
    }
  }

  async consultarRecursos(usuario: string, pregunta: string) {
    try {
      const url = 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/recursos';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, pregunta }),
      });
      console.log(usuario, pregunta);
      console.log(response);

      if (!response.ok) {
        return {
          success: false,
          error: 'API_ERROR',
          message: 'Error al consultar el servicio de recursos',
        };
      }

      // Detectar tipo de archivo por Content-Type
      let filename = `recurso_${Date.now()}`;
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^\"]*)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const buffer = await response.arrayBuffer();
      const bufferData = Buffer.from(buffer);

      // Verificar si el contenido es "false"
      const textContent = bufferData.toString('utf8');
      if (textContent.includes('false') || textContent.trim() === 'false') {
        return {
          success: false,
          error: 'INVALID_QUESTION',
          message: 'No se pudo generar el recurso solicitado. Verifique los datos ingresados.'
        };
      }

      return {
        success: true,
        buffer: bufferData,
        contentType,
        filename,
      };
    } catch (error) {
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno al consultar el servicio de recursos',
      };
    }
  }

  /**
   * Procesa un archivo Excel en base64 y lo envía al endpoint de gestión.
   * @param usuario Email del usuario
   * @param filename Nombre del archivo Excel
   * @param fileBase64 Archivo Excel en base64
   * @returns Mensaje de éxito o archivo de errores
   */
  async gestionArchivo(usuario: string, filename: string, fileBase64: string) {
    try {
      const url = 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/gestion';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, filename, file_base64: fileBase64 }),
      });

      if (response.status === 200) {
        // Mensaje de éxito en el body
        const data = await response.json();
        return {
          success: true,
          message: data.message || 'Archivo procesado exitosamente',
        };
      } else if (response.status === 400) {
        // Devuelve un Excel con los errores encontrados
        let errorFilename = `errores_${Date.now()}.xlsx`;
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?([^\"]*)"?/);
          if (filenameMatch && filenameMatch[1]) {
            errorFilename = filenameMatch[1];
          }
        }
        const buffer = await response.arrayBuffer();
        const bufferData = Buffer.from(buffer);
        return {
          success: false,
          error: 'VALIDATION_ERRORS',
          filename: errorFilename,
          buffer: bufferData,
          contentType: response.headers.get('content-type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        };
      } else {
        return {
          success: false,
          error: 'API_ERROR',
          message: `Error inesperado al consultar el servicio de gestión (status: ${response.status})`,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno al consultar el servicio de gestión',
      };
    }
  }
}