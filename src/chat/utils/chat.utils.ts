/**
 * Utilidades para validación, sanitización y procesamiento de archivos
 * Mentora - Plataforma SaaS de planificación de clases
 */

import * as crypto from 'crypto';
import { CHAT_CONSTANTS, ERROR_MESSAGES } from '../constants/chat.constants';
import { ValidationResult, FileValidationResult } from '../interfaces/chat.interfaces';

export class ChatUtils {
  /**
   * Sanitiza el nombre de un archivo removiendo caracteres peligrosos
   * Previene path traversal y caracteres especiales
   * @param filename Nombre del archivo a sanitizar
   * @returns Nombre de archivo seguro
   */
  static sanitizeFilename(filename: string): string {
    if (!filename || filename.trim().length === 0) {
      return `archivo_${this.generateTimestamp()}`;
    }

    // Remover path separators y caracteres peligrosos
    let sanitized = filename
      .replace(/\.\./g, '') // Remover ..
      .replace(/[\/\\]/g, '') // Remover / y \
      .replace(/[\x00-\x1f\x80-\x9f]/g, '') // Remover caracteres de control
      .replace(/[<>:"|?*]/g, '') // Remover caracteres no permitidos en Windows
      .trim();

    // Si después de sanitizar está vacío, generar nombre genérico
    if (sanitized.length === 0) {
      return `archivo_${this.generateTimestamp()}`;
    }

    // Limitar longitud máxima
    if (sanitized.length > 255) {
      const extension = this.getFileExtension(sanitized);
      const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'));
      sanitized = nameWithoutExt.substring(0, 250) + extension;
    }

    return sanitized;
  }

  /**
   * Valida si un string base64 es válido
   * @param base64 String en formato base64
   * @returns true si es base64 válido
   */
  static isValidBase64(base64: string): boolean {
    if (!base64 || typeof base64 !== 'string') {
      return false;
    }

    // Remover espacios en blanco
    const cleaned = base64.trim().replace(/\s/g, '');

    // Verificar longitud (debe ser múltiplo de 4)
    if (cleaned.length === 0 || cleaned.length % 4 !== 0) {
      return false;
    }

    // Validar con regex
    if (!CHAT_CONSTANTS.PATTERNS.BASE64.test(cleaned)) {
      return false;
    }

    // Intentar decodificar para verificar que sea válido
    try {
      const buffer = Buffer.from(cleaned, 'base64');
      const encoded = buffer.toString('base64');
      return encoded === cleaned;
    } catch (error) {
      return false;
    }
  }

  /**
   * Valida magic numbers de un archivo Excel
   * Verifica que los primeros bytes correspondan a un formato Excel válido
   * @param buffer Buffer del archivo
   * @returns true si es un archivo Excel válido
   */
  static isValidExcelFile(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 4) {
      return false;
    }

    // Verificar magic numbers para XLSX (ZIP header: PK)
    const xlsxMagic = CHAT_CONSTANTS.EXCEL_MAGIC_NUMBERS.XLSX;
    const isXlsx = xlsxMagic.every((byte, index) => buffer[index] === byte);

    // Verificar magic numbers para XLS (BIFF header)
    const xlsMagic = CHAT_CONSTANTS.EXCEL_MAGIC_NUMBERS.XLS;
    const isXls = xlsMagic.every((byte, index) => buffer[index] === byte);

    return isXlsx || isXls;
  }

  /**
   * Genera hash SHA-256 de un buffer
   * Útil para verificar integridad de archivos
   * @param buffer Buffer del archivo
   * @returns Hash SHA-256 en formato hexadecimal
   */
  static generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Valida longitud y contenido de una pregunta
   * @param pregunta Texto de la pregunta
   * @returns Objeto con resultado de validación y error si aplica
   */
  static validatePregunta(pregunta: string): ValidationResult {
    // Verificar que no sea null o undefined
    if (!pregunta || pregunta === null || pregunta === undefined) {
      return {
        valid: false,
        error: ERROR_MESSAGES.PREGUNTA_VACIA,
      };
    }

    // Convertir a string y limpiar espacios
    const preguntaStr = String(pregunta).trim();

    // Verificar que no esté vacía después de limpiar
    if (preguntaStr.length === 0) {
      return {
        valid: false,
        error: ERROR_MESSAGES.PREGUNTA_VACIA,
      };
    }

    // Verificar longitud mínima
    if (preguntaStr.length < CHAT_CONSTANTS.MIN_PREGUNTA_LENGTH) {
      return {
        valid: false,
        error: ERROR_MESSAGES.PREGUNTA_CORTA,
      };
    }

    // Verificar longitud máxima
    if (preguntaStr.length > CHAT_CONSTANTS.MAX_PREGUNTA_LENGTH) {
      return {
        valid: false,
        error: ERROR_MESSAGES.PREGUNTA_LARGA,
      };
    }

    return { valid: true };
  }

  /**
   * Extrae la extensión de un filename
   * @param filename Nombre del archivo
   * @returns Extensión con punto (ej: .xlsx) o string vacío
   */
  static getFileExtension(filename: string): string {
    if (!filename || filename.indexOf('.') === -1) {
      return '';
    }

    const parts = filename.split('.');
    return '.' + parts[parts.length - 1].toLowerCase();
  }

  /**
   * Valida si un tipo MIME está en la whitelist permitida
   * @param mimeType Tipo MIME a validar
   * @returns true si el tipo MIME está permitido
   */
  static isAllowedMimeType(mimeType: string): boolean {
    if (!mimeType || typeof mimeType !== 'string') {
      return false;
    }

    const normalized = mimeType.toLowerCase().trim();
    return CHAT_CONSTANTS.ALLOWED_MIME_TYPES.some(
      (allowed) => allowed.toLowerCase() === normalized
    );
  }

  /**
   * Genera timestamp formateado para nombres de archivo
   * Formato: YYYY-MM-DDTHH-mm-ss
   * @returns String con timestamp
   */
  static generateTimestamp(): string {
    return new Date()
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-')
      .slice(0, 19);
  }

  /**
   * Valida y procesa un archivo Excel en base64
   * Realiza todas las validaciones necesarias
   * @param fileBase64 Archivo en base64
   * @param filename Nombre del archivo
   * @returns Resultado de validación con buffer y metadata
   */
  static validateExcelFile(
    fileBase64: string,
    filename: string
  ): FileValidationResult {
    // Validar base64
    if (!this.isValidBase64(fileBase64)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.BASE64_INVALIDO,
      };
    }

    // Decodificar
    const buffer = Buffer.from(fileBase64, 'base64');

    // Validar tamaño
    if (buffer.length > CHAT_CONSTANTS.MAX_GESTION_FILE_SIZE) {
      return {
        valid: false,
        error: ERROR_MESSAGES.ARCHIVO_GRANDE_GESTION,
      };
    }

    // Validar formato Excel
    if (!this.isValidExcelFile(buffer)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.FORMATO_EXCEL_INVALIDO,
      };
    }

    // Validar extensión del filename
    const extension = this.getFileExtension(filename);
    if (!CHAT_CONSTANTS.ALLOWED_EXCEL_EXTENSIONS.includes(extension as any)) {
      return {
        valid: false,
        error: ERROR_MESSAGES.FORMATO_EXCEL_INVALIDO,
      };
    }

    // Generar hash
    const hash = this.generateFileHash(buffer);

    return {
      valid: true,
      buffer,
      size: buffer.length,
      hash,
    };
  }

  /**
   * Valida el formato de un email
   * @param email Email a validar
   * @returns true si el email es válido
   */
  static isValidEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }

    return CHAT_CONSTANTS.PATTERNS.EMAIL.test(email.trim());
  }

  /**
   * Obtiene el tipo de archivo legible desde un MIME type
   * @param mimeType Tipo MIME
   * @returns Nombre legible del tipo de archivo
   */
  static getTipoArchivoFromMime(mimeType: string): string {
    const tipoMap: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'video/mp4': 'video',
      'image/jpeg': 'imagen',
      'image/png': 'imagen',
      'application/zip': 'zip',
    };

    const normalized = mimeType.toLowerCase().trim();
    return tipoMap[normalized] || 'archivo';
  }

  /**
   * Obtiene la extensión de archivo desde un MIME type
   * @param mimeType Tipo MIME
   * @returns Extensión del archivo
   */
  static getExtensionFromMime(mimeType: string): string {
    const extMap: Record<string, string> = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'video/mp4': 'mp4',
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'application/zip': 'zip',
    };

    const normalized = mimeType.toLowerCase().trim();
    return extMap[normalized] || 'bin';
  }

  /**
   * Formatea un tamaño de archivo en bytes a formato legible
   * @param bytes Tamaño en bytes
   * @returns String formateado (ej: "2.5 MB")
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Sleep utility para delays
   * @param ms Milisegundos a esperar
   * @returns Promise que resuelve después del delay
   */
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calcula el delay para retry con backoff exponencial
   * @param attemptNumber Número de intento (1-based)
   * @param baseDelay Delay base en milisegundos
   * @returns Delay calculado en milisegundos
   */
  static calculateBackoffDelay(attemptNumber: number, baseDelay: number): number {
    return baseDelay * Math.pow(2, attemptNumber - 1);
  }
}
