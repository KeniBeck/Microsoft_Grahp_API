import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  
  async consultarChatbot(usuario: string, pregunta: string, tipo: 'planificacion' | 'planificador' | 'integrador' | 'adecuacion' | 'seguimiento' = 'planificacion') {
    try {
      // Mapeo de tipos a URLs
      const urlMap = {
        planificacion: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/planificacion',
        planificador: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/planificador',
        integrador: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/integrador',
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
}