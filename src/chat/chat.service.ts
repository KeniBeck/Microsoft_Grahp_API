/**
 * Servicio de Chat - Mentora
 * Maneja la comunicación con las APIs Lambda de AWS para:
 * - Planificador (planificacion, planificador, adecuacion, seguimiento)
 * - Recursos (generación de materiales educativos)
 * - Gestión (procesamiento de archivos Excel)
 * 
 * Características de producción:
 * - Retry logic con backoff exponencial
 * - Validaciones exhaustivas
 * - Timeouts configurables
 * - Logging estructurado
 * - Manejo robusto de errores
 */

import { Injectable, Logger } from '@nestjs/common';
import { CHAT_CONSTANTS, LAMBDA_ENDPOINTS, ERROR_MESSAGES } from './constants/chat.constants';
import {
  ChatbotResponse,
  RecursoResponse,
  GestionResponse,
  ResponseMetadata,
  RecursoMetadata,
  GestionMetadata,
} from './interfaces/chat.interfaces';
import { ChatUtils } from './utils/chat.utils';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  /**
   * Consulta el chatbot con retry logic y manejo robusto de errores
   * Soporta 4 tipos: planificacion, planificador, adecuacion, seguimiento
   * 
   * MÓDULO: PLANIFICADOR
   * 
   * Mejoras implementadas:
   * - Retry con backoff exponencial (3 intentos: 1s, 2s, 4s)
   * - Validación de longitud de pregunta (10-500 chars)
   * - Timeout de 30 segundos configurable
   * - Logging estructurado con contexto completo
   * - Manejo específico de errores con códigos claros
   * - Sanitización de nombres de archivo
   * - Metadata detallada de la respuesta
   * 
   * @param usuario Email del docente
   * @param pregunta Consulta del docente
   * @param tipo Tipo de consulta (planificacion, planificador, adecuacion, seguimiento)
   * @returns Respuesta con buffer del archivo o error detallado
   */
  async consultarChatbot(
    usuario: string,
    pregunta: string,
    tipo: 'planificacion' | 'planificador' | 'adecuacion' | 'seguimiento' = 'planificacion',
  ): Promise<ChatbotResponse> {
    const startTime = Date.now();
    const contexto = `[${tipo.toUpperCase()}][${usuario}]`;

    this.logger.log(`${contexto} Iniciando consulta al chatbot`);

    // VALIDACIÓN DE PREGUNTA
    const validacion = ChatUtils.validatePregunta(pregunta);
    if (!validacion.valid) {
      this.logger.warn(`${contexto} Pregunta inválida: ${validacion.error}`);
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: validacion.error,
      };
    }

    // RETRY LOGIC CON BACKOFF EXPONENCIAL
    let lastError: any;
    for (let intento = 1; intento <= CHAT_CONSTANTS.MAX_RETRIES; intento++) {
      try {
        this.logger.log(
          `${contexto} Intento ${intento}/${CHAT_CONSTANTS.MAX_RETRIES} - Consultando Lambda`,
        );

        const url = this.getEndpointUrl(tipo);

        // FETCH CON TIMEOUT CONFIGURABLE
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          CHAT_CONSTANTS.LAMBDA_TIMEOUT,
        );

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario, pregunta }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // MANEJAR STATUS 400, 502 Y OTROS ERRORES - EXTRAER MENSAJE DEL BODY
        if (!response.ok) {
          const errorBody = await response.text();
          let errorMessage = errorBody;

          // Intentar parsear como JSON para extraer el mensaje real
          try {
            const errorJson = JSON.parse(errorBody);
            // Si tiene campo "respuesta", usarlo
            if (errorJson.respuesta) {
              errorMessage = errorJson.respuesta;
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            }
          } catch (e) {
            // Si no es JSON válido, usar el texto tal cual
            errorMessage = errorBody;
          }

          this.logger.warn(
            `${contexto} Lambda retornó status ${response.status} con mensaje: ${errorMessage}`,
          );

          return {
            success: false,
            error: 'API_ERROR',
            message: errorMessage || `Error ${response.status}: Respuesta inesperada del servidor`,
          };
        }

        // PROCESAR RESPUESTA (STATUS 200)
        const filename = this.extractFilename(response, tipo);
        const buffer = await response.arrayBuffer();
        const bufferData = Buffer.from(buffer);

        // VALIDAR RESPUESTA INVÁLIDA (magic string 'false')
        if (this.isInvalidResponse(bufferData)) {
          this.logger.warn(
            `${contexto} Lambda retornó respuesta inválida (marker: '${CHAT_CONSTANTS.INVALID_RESPONSE_MARKER}')`,
          );
          return {
            success: false,
            error: 'INVALID_QUESTION',
            message: `No se pudo generar el documento solicitado. Verifique que la pregunta sea válida para ${tipo}.`,
          };
        }

        const duracion = Date.now() - startTime;
        const tamaño = ChatUtils.formatFileSize(bufferData.length);

        this.logger.log(
          `${contexto} ✅ Éxito - Duración: ${duracion}ms - Intentos: ${intento} - Tamaño: ${tamaño}`,
        );

        return {
          success: true,
          buffer: bufferData,
          contentType:
            response.headers.get('content-type') ||
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          filename,
          metadata: {
            usuario,
            tipo,
            timestamp: new Date(),
            intentos: intento,
            duracion,
          },
        };
      } catch (error) {
        lastError = error;

        if (error.name === 'AbortError') {
          this.logger.error(
            `${contexto} ⏱️  Timeout en intento ${intento} (${CHAT_CONSTANTS.LAMBDA_TIMEOUT}ms)`,
          );
        } else {
          this.logger.error(
            `${contexto} ❌ Error en intento ${intento}: ${error.message}`,
          );
        }

        // SI NO ES EL ÚLTIMO INTENTO, ESPERAR CON BACKOFF EXPONENCIAL
        if (intento < CHAT_CONSTANTS.MAX_RETRIES) {
          const delay = ChatUtils.calculateBackoffDelay(
            intento,
            CHAT_CONSTANTS.RETRY_BASE_DELAY,
          );
          this.logger.log(`${contexto} 🔄 Reintentando en ${delay}ms...`);
          await ChatUtils.sleep(delay);
        }
      }
    }

    // TODOS LOS INTENTOS FALLARON
    const duracion = Date.now() - startTime;
    this.logger.error(
      `${contexto} ❌ Falló después de ${CHAT_CONSTANTS.MAX_RETRIES} intentos - Duración total: ${duracion}ms`,
    );

    return {
      success: false,
      error: lastError.name === 'AbortError' ? 'TIMEOUT_ERROR' : 'API_ERROR',
      message:
        lastError.name === 'AbortError'
          ? ERROR_MESSAGES.TIMEOUT
          : `Error al consultar el servicio de ${tipo} después de ${CHAT_CONSTANTS.MAX_RETRIES} intentos`,
    };
  }

  /**
   * Consulta recursos educativos con validaciones de tipo MIME y tamaño
   * Soporta múltiples formatos: PDF, DOCX, PPTX, XLSX, MP4, imágenes, ZIP
   * 
   * MÓDULO: RECURSOS
   * 
   * Mejoras implementadas:
   * - Whitelist estricta de tipos MIME permitidos
   * - Validación de tamaño máximo (50MB)
   * - Detección y validación de Content-Type
   * - Naming mejorado: recurso_{tipo}_{timestamp}.ext
   * - Generación de hash SHA-256 para integridad
   * - Metadata completa (tamaño, tipo real, hash)
   * - Logging detallado de descarga de recursos
   * - Timeout de 30 segundos
   * 
   * @param usuario Email del docente
   * @param pregunta Descripción del recurso solicitado (incluye grado, área, unidad, tipo)
   * @returns Respuesta con buffer del recurso o error detallado
   */
  async consultarRecursos(
    usuario: string,
    pregunta: string,
  ): Promise<RecursoResponse> {
    const startTime = Date.now();
    const contexto = `[RECURSOS][${usuario}]`;

    this.logger.log(`${contexto} Iniciando consulta de recursos`);

    // VALIDACIÓN DE PREGUNTA
    const validacion = ChatUtils.validatePregunta(pregunta);
    if (!validacion.valid) {
      this.logger.warn(`${contexto} Pregunta inválida: ${validacion.error}`);
      return {
        success: false,
        error: 'VALIDATION_ERROR',
        message: validacion.error,
      };
    }

    try {
      const url = LAMBDA_ENDPOINTS.RECURSOS;

      // FETCH CON TIMEOUT
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        CHAT_CONSTANTS.LAMBDA_TIMEOUT,
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, pregunta }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // MANEJAR STATUS 400, 502 Y OTROS ERRORES - EXTRAER MENSAJE DEL BODY
      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = errorBody;

        // Intentar parsear como JSON para extraer el mensaje real
        try {
          const errorJson = JSON.parse(errorBody);
          // Si tiene campo "respuesta", usarlo
          if (errorJson.respuesta) {
            errorMessage = errorJson.respuesta;
          } else if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch (e) {
          // Si no es JSON válido, usar el texto tal cual
          errorMessage = errorBody;
        }

        this.logger.warn(
          `${contexto} Lambda retornó status ${response.status} con mensaje: ${errorMessage}`,
        );

        return {
          success: false,
          error: 'API_ERROR',
          message: errorMessage || `Error ${response.status}: Respuesta inesperada del servidor`,
        };
      }

      // VALIDAR TIPO MIME CONTRA WHITELIST
      const contentType =
        response.headers.get('content-type') || 'application/octet-stream';
      if (!ChatUtils.isAllowedMimeType(contentType)) {
        this.logger.error(
          `${contexto} ⚠️  Tipo MIME no permitido: ${contentType}`,
        );
        return {
          success: false,
          error: 'INVALID_MIME_TYPE',
          message: `${ERROR_MESSAGES.MIME_NO_PERMITIDO}: ${contentType}`,
        };
      }

      // PROCESAR RESPUESTA (STATUS 200)
      const buffer = await response.arrayBuffer();
      const bufferData = Buffer.from(buffer);

      // VALIDAR TAMAÑO MÁXIMO (50MB)
      if (bufferData.length > CHAT_CONSTANTS.MAX_RECURSO_FILE_SIZE) {
        const tamaño = ChatUtils.formatFileSize(bufferData.length);
        this.logger.error(
          `${contexto} ⚠️  Recurso demasiado grande: ${tamaño}`,
        );
        return {
          success: false,
          error: 'FILE_TOO_LARGE',
          message: ERROR_MESSAGES.ARCHIVO_GRANDE_RECURSO,
        };
      }

      // VALIDAR RESPUESTA INVÁLIDA
      if (this.isInvalidResponse(bufferData)) {
        this.logger.warn(
          `${contexto} Lambda retornó respuesta inválida para recurso`,
        );
        return {
          success: false,
          error: 'INVALID_QUESTION',
          message:
            'No se pudo generar el recurso solicitado. Verifique los datos ingresados (grado, área, unidad, tipo de recurso).',
        };
      }

      // EXTRAER FILENAME DESDE HEADER Content-Disposition DE LA API
      // Si no existe, generar uno genérico como fallback
      let filename: string;
      const contentDisposition = response.headers.get('content-disposition');
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]*)"?/);
        if (match && match[1]) {
          filename = ChatUtils.sanitizeFilename(match[1]);
        } else {
          // Fallback: generar nombre genérico
          const tipoArchivo = ChatUtils.getTipoArchivoFromMime(contentType);
          const timestamp = ChatUtils.generateTimestamp();
          const extension = ChatUtils.getExtensionFromMime(contentType);
          filename = `recurso_${tipoArchivo}_${timestamp}.${extension}`;
        }
      } else {
        // Fallback: generar nombre genérico
        const tipoArchivo = ChatUtils.getTipoArchivoFromMime(contentType);
        const timestamp = ChatUtils.generateTimestamp();
        const extension = ChatUtils.getExtensionFromMime(contentType);
        filename = `recurso_${tipoArchivo}_${timestamp}.${extension}`;
      }

      // GENERAR HASH SHA-256 PARA INTEGRIDAD
      const hash = ChatUtils.generateFileHash(bufferData);

      const duracion = Date.now() - startTime;
      const tamaño = ChatUtils.formatFileSize(bufferData.length);

      this.logger.log(
        `${contexto} ✅ Recurso obtenido - Tipo: ${contentType} - Tamaño: ${tamaño} - Hash: ${hash.substring(0, 8)}... - Duración: ${duracion}ms`,
      );

      return {
        success: true,
        buffer: bufferData,
        contentType,
        filename,
        metadata: {
          usuario,
          tamaño: bufferData.length,
          tipoReal: contentType,
          hash,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      const duracion = Date.now() - startTime;
      this.logger.error(
        `${contexto} ❌ Error al consultar recursos: ${error.message} - Duración: ${duracion}ms`,
      );

      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'TIMEOUT_ERROR',
          message: ERROR_MESSAGES.TIMEOUT,
        };
      }

      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      };
    }
  }

  /**
   * Procesa archivos Excel para gestión con validaciones exhaustivas
   * Valida formato, tamaño, integridad y sanitiza nombres de archivo
   * 
   * MÓDULO: GESTIÓN
   * 
   * Mejoras implementadas:
   * - Validación de formato Excel mediante magic numbers
   * - Límite de tamaño de 10MB
   * - Validación de base64 corrupto
   * - Sanitización de nombres de archivo (previene path traversal)
   * - Generación de hash SHA-256
   * - Metadata completa (archivo original, tamaño, hash, timestamp)
   * - Manejo estructurado de errores de validación (status 400)
   * - Logging detallado de operaciones
   * - Extracción de filename del Content-Disposition
   * 
   * @param usuario Email del docente
   * @param filename Nombre del archivo Excel original
   * @param fileBase64 Contenido del archivo en base64
   * @returns Respuesta con mensaje de éxito o archivo Excel con errores
   */
  async gestionArchivo(
    usuario: string,
    filename: string,
    fileBase64: string,
  ): Promise<GestionResponse> {
    const startTime = Date.now();
    const contexto = `[GESTIÓN][${usuario}]`;

    this.logger.log(
      `${contexto} Iniciando procesamiento de archivo: ${filename}`,
    );

    try {
      // VALIDACIÓN COMPLETA DEL ARCHIVO EXCEL
      const validacion = ChatUtils.validateExcelFile(fileBase64, filename);
      if (!validacion.valid) {
        this.logger.error(`${contexto} ⚠️  Validación falló: ${validacion.error}`);
        return {
          success: false,
          error: this.mapValidationErrorType(validacion.error!),
          message: validacion.error!,
        };
      }

      const buffer = validacion.buffer!;
      const hash = validacion.hash!;
      const tamaño = ChatUtils.formatFileSize(validacion.size!);

      this.logger.log(
        `${contexto} ✅ Archivo validado - Tamaño: ${tamaño} - Hash: ${hash.substring(0, 8)}...`,
      );

      // SANITIZAR FILENAME (previene path traversal y caracteres peligrosos)
      const sanitizedFilename = ChatUtils.sanitizeFilename(filename);

      // ENVIAR A LAMBDA DE GESTIÓN
      const url = LAMBDA_ENDPOINTS.GESTION;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario,
          filename: sanitizedFilename,
          file_base64: fileBase64,
        }),
      });

      const duracion = Date.now() - startTime;

      // MANEJO DE RESPUESTA EXITOSA (STATUS 200)
      if (response.status === 200) {
        const contentType = response.headers.get('content-type') || '';
        
        // CASO 1: La API retorna un archivo Excel con errores de validación
        if (contentType.includes('spreadsheet') || contentType.includes('excel')) {
          const buffer = await response.arrayBuffer();
          const bufferData = Buffer.from(buffer);
          
          // Extraer filename del header Content-Disposition
          let filenameWithErrors = `errores_${sanitizedFilename}`;
          const contentDisposition = response.headers.get('content-disposition');
          if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]*)"?/);
            if (match && match[1]) {
              filenameWithErrors = ChatUtils.sanitizeFilename(match[1]);
            }
          }
          
          this.logger.log(
            `${contexto} ⚠️  Archivo procesado con errores de validación - Retornando Excel con detalles - Duración: ${duracion}ms`,
          );

          return {
            success: true,
            message: 'Se encontraron errores de validación. Descargue el archivo Excel para ver los detalles.',
            buffer: bufferData,
            contentType,
            filename: filenameWithErrors,
            metadata: {
              usuario,
              archivoOriginal: sanitizedFilename,
              tamañoOriginal: validacion.size!,
              hash,
              timestamp: new Date(),
            },
          };
        }
        
        // CASO 2: La API retorna un mensaje JSON de éxito
        const bodyText = await response.text();
        let responseMessage = bodyText;
        
        try {
          const data = JSON.parse(bodyText);
          // Extraer el mensaje del body (priorizar "respuesta" sobre "message")
          if (data.respuesta) {
            responseMessage = data.respuesta;
          } else if (data.message) {
            responseMessage = data.message;
          }
        } catch (e) {
          // Si no es JSON válido, usar el texto tal cual
          responseMessage = bodyText;
        }
        
        this.logger.log(
          `${contexto} ✅ Archivo procesado exitosamente - Duración: ${duracion}ms`,
        );

        return {
          success: true,
          message: responseMessage || 'Archivo procesado exitosamente',
          metadata: {
            usuario,
            archivoOriginal: sanitizedFilename,
            tamañoOriginal: validacion.size!,
            hash,
            timestamp: new Date(),
          },
        };
      }

      // MANEJO DE ERRORES (STATUS 400, 502, ETC.)
      // Extraer mensaje del body (puede ser JSON o texto)
      const errorBody = await response.text();
      let errorMessage = errorBody;

      // Intentar parsear como JSON para extraer el mensaje real
      try {
        const errorJson = JSON.parse(errorBody);
        // Si tiene campo "respuesta", usarlo
        if (errorJson.respuesta) {
          errorMessage = errorJson.respuesta;
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch (e) {
        // Si no es JSON válido, usar el texto tal cual
        errorMessage = errorBody;
      }

      this.logger.warn(
        `${contexto} ⚠️  Lambda retornó status ${response.status} con mensaje: ${errorMessage} - Duración: ${duracion}ms`,
      );

      return {
        success: false,
        error: response.status === 400 ? 'VALIDATION_ERRORS' : 'API_ERROR',
        message: errorMessage || `Error ${response.status}: Respuesta inesperada del servidor`,
      };
    } catch (error) {
      const duracion = Date.now() - startTime;
      this.logger.error(
        `${contexto} ❌ Error interno en gestión: ${error.message} - Duración: ${duracion}ms`,
      );

      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'TIMEOUT_ERROR',
          message: ERROR_MESSAGES.TIMEOUT,
        };
      }

      return {
        success: false,
        error: 'INTERNAL_ERROR',
        message: ERROR_MESSAGES.INTERNAL_ERROR,
      };
    }
  }

  // ===== MÉTODOS PRIVADOS AUXILIARES =====

  /**
   * Obtiene la URL del endpoint Lambda según el tipo de consulta
   * @param tipo Tipo de consulta (planificacion, planificador, adecuacion, seguimiento)
   * @returns URL del endpoint Lambda
   */
  private getEndpointUrl(tipo: string): string {
    const urlMap: Record<string, string> = {
      planificacion: LAMBDA_ENDPOINTS.PLANIFICACION,
      planificador: LAMBDA_ENDPOINTS.PLANIFICADOR,
      adecuacion: LAMBDA_ENDPOINTS.ADECUACION,
      seguimiento: LAMBDA_ENDPOINTS.SEGUIMIENTO,
    };
    return urlMap[tipo];
  }

  /**
   * Extrae el nombre del archivo desde el header Content-Disposition
   * Si no existe, genera uno basado en el tipo y timestamp
   * @param response Respuesta HTTP del Lambda
   * @param tipo Tipo de consulta
   * @returns Nombre del archivo sanitizado
   */
  private extractFilename(response: Response, tipo: string): string {
    let filename = `${tipo}_${ChatUtils.generateTimestamp()}.xlsx`;

    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]*)"?/);
      if (match && match[1]) {
        filename = ChatUtils.sanitizeFilename(match[1]);
      }
    }

    return filename;
  }

  /**
   * Verifica si la respuesta del Lambda es inválida
   * Detecta el magic string 'false' que indica error
   * @param buffer Buffer de la respuesta
   * @returns true si la respuesta es inválida
   */
  private isInvalidResponse(buffer: Buffer): boolean {
    const textContent = buffer.toString('utf8');
    return (
      textContent.includes(CHAT_CONSTANTS.INVALID_RESPONSE_MARKER) ||
      textContent.trim() === CHAT_CONSTANTS.INVALID_RESPONSE_MARKER
    );
  }

  /**
   * Mapea errores de validación a tipos de error específicos
   * @param errorMessage Mensaje de error de validación
   * @returns Tipo de error específico para GestionResponse
   */
  private mapValidationErrorType(errorMessage: string): GestionResponse['error'] {
    if (errorMessage.includes('base64')) {
      return 'CORRUPTED_BASE64';
    }
    if (errorMessage.includes('tamaño') || errorMessage.includes('excede')) {
      return 'FILE_TOO_LARGE';
    }
    if (errorMessage.includes('formato') || errorMessage.includes('Excel')) {
      return 'INVALID_FILE_FORMAT';
    }
    return 'INTERNAL_ERROR';
  }
}
