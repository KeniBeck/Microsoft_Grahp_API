/**
 * Constantes centralizadas para el módulo de Chat
 * Mentora - Plataforma SaaS de planificación de clases
 */

export const CHAT_CONSTANTS = {
  // Timeouts y Retries
  LAMBDA_TIMEOUT: 30000, // 30 segundos
  MAX_RETRIES: 3,
  RETRY_BASE_DELAY: 1000, // 1 segundo
  
  // Límites de tamaño
  MAX_GESTION_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_RECURSO_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  STREAMING_THRESHOLD: 5 * 1024 * 1024, // 5MB
  
  // Validaciones de pregunta
  MIN_PREGUNTA_LENGTH: 10,
  MAX_PREGUNTA_LENGTH: 500,
  
  // Marcadores de respuesta
  INVALID_RESPONSE_MARKER: 'false',
  
  // Tipos MIME permitidos para recursos
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'video/mp4',
    'image/jpeg',
    'image/png',
    'application/zip',
  ] as const,
  
  // Extensiones permitidas para gestión
  ALLOWED_EXCEL_EXTENSIONS: ['.xlsx', '.xls'] as const,
  
  // Magic numbers para validación de archivos
  EXCEL_MAGIC_NUMBERS: {
    XLSX: [0x50, 0x4B, 0x03, 0x04], // PK (ZIP header)
    XLS: [0xD0, 0xCF, 0x11, 0xE0], // BIFF header
  },
  
  // Regex patterns
  PATTERNS: {
    BASE64: /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/,
    SAFE_FILENAME: /^[a-zA-Z0-9_\-. ]+$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;

export const LAMBDA_ENDPOINTS = {
  PLANIFICACION: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/planificacion',
  PLANIFICADOR: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/planificador',
  ADECUACION: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/adecuacion',
  SEGUIMIENTO: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/seguimiento',
  RECURSOS: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/recursos',
  GESTION: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/gestion',
} as const;

export const ERROR_MESSAGES = {
  PREGUNTA_CORTA: `La pregunta debe tener al menos ${CHAT_CONSTANTS.MIN_PREGUNTA_LENGTH} caracteres`,
  PREGUNTA_LARGA: `La pregunta no debe exceder ${CHAT_CONSTANTS.MAX_PREGUNTA_LENGTH} caracteres`,
  PREGUNTA_VACIA: 'La pregunta no puede estar vacía',
  ARCHIVO_GRANDE_GESTION: `El archivo excede el tamaño máximo de ${CHAT_CONSTANTS.MAX_GESTION_FILE_SIZE / 1024 / 1024}MB`,
  ARCHIVO_GRANDE_RECURSO: `El recurso excede el tamaño máximo de ${CHAT_CONSTANTS.MAX_RECURSO_FILE_SIZE / 1024 / 1024}MB`,
  BASE64_INVALIDO: 'El archivo proporcionado está corrupto o no es válido',
  FORMATO_EXCEL_INVALIDO: 'El archivo no es un formato Excel válido (.xlsx o .xls)',
  MIME_NO_PERMITIDO: 'Tipo de archivo no permitido',
  TIMEOUT: 'La solicitud excedió el tiempo máximo de espera',
  API_ERROR: 'Error al comunicarse con el servicio',
  INTERNAL_ERROR: 'Error interno del servidor',
} as const;
