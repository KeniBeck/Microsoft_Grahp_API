import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  
  async consultarChatbot(usuario: string, pregunta: string) {
    try {
      const response = await fetch('https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/planificacion', {
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
          message: 'Error al consultar el chatbot'
        };
      }

      const buffer = await response.arrayBuffer();
      const bufferData = Buffer.from(buffer);
      
      // Verificar si el contenido es "false"
      const textContent = bufferData.toString('utf8');
      if (textContent.includes('false') || textContent.trim() === 'false') {
        return {
          success: false,
          error: 'INVALID_QUESTION',
          message: 'No se pudo generar la planificación solicitada. Verifique que la pregunta sea válida.'
        };
      }

      return {
        success: true,
        buffer: bufferData,
        contentType: response.headers.get('content-type') || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `planificacion_${Date.now()}.xlsx`
      };
    } catch (error) {
      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: 'Error interno al consultar el chatbot'
      };
    }
  }
}