/**
 * Interfaces TypeScript para el módulo de Chat
 * Mentora - Plataforma SaaS de planificación de clases
 */

export interface ChatbotResponse {
  success: boolean;
  buffer?: Buffer;
  contentType?: string;
  filename?: string;
  error?: ChatbotErrorType;
  message?: string;
  metadata?: ResponseMetadata;
}

export interface RecursoResponse {
  success: boolean;
  buffer?: Buffer;
  contentType?: string;
  filename?: string;
  error?: RecursoErrorType;
  message?: string;
  metadata?: RecursoMetadata;
}

export interface GestionResponse {
  success: boolean;
  message?: string;
  error?: GestionErrorType;
  filename?: string;
  buffer?: Buffer;
  contentType?: string;
  metadata?: GestionMetadata;
}

export interface ResponseMetadata {
  usuario: string;
  tipo: string;
  timestamp: Date;
  intentos?: number;
  duracion?: number; // en ms
}

export interface RecursoMetadata {
  usuario: string;
  tamaño: number; // en bytes
  tipoReal: string;
  hash?: string; // SHA-256
  timestamp: Date;
}

export interface GestionMetadata {
  usuario: string;
  archivoOriginal: string;
  tamañoOriginal: number;
  hash: string;
  timestamp: Date;
}

export type ChatbotErrorType = 
  | 'API_ERROR' 
  | 'INVALID_QUESTION' 
  | 'INTERNAL_ERROR' 
  | 'TIMEOUT_ERROR'
  | 'VALIDATION_ERROR';

export type RecursoErrorType = 
  | 'API_ERROR' 
  | 'INVALID_QUESTION' 
  | 'INTERNAL_ERROR' 
  | 'INVALID_MIME_TYPE'
  | 'FILE_TOO_LARGE'
  | 'TIMEOUT_ERROR'
  | 'VALIDATION_ERROR';

export type GestionErrorType = 
  | 'API_ERROR' 
  | 'VALIDATION_ERRORS' 
  | 'INTERNAL_ERROR'
  | 'INVALID_FILE_FORMAT'
  | 'FILE_TOO_LARGE'
  | 'CORRUPTED_BASE64'
  | 'TIMEOUT_ERROR';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FileValidationResult extends ValidationResult {
  buffer?: Buffer;
  size?: number;
  hash?: string;
}
