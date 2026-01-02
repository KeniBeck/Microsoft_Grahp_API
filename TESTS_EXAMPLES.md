# Suite de Tests - Chat Modules

Este archivo contiene ejemplos de tests unitarios y de integración para los módulos refactorizados.

## 🧪 Configuración de Jest

Asegúrate de tener Jest configurado en `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  }
}
```

---

## 1️⃣ Tests de Utilidades (ChatUtils)

### `chat.utils.spec.ts`

```typescript
import { ChatUtils } from './utils/chat.utils';
import { CHAT_CONSTANTS } from './constants/chat.constants';

describe('ChatUtils', () => {
  describe('sanitizeFilename', () => {
    it('debería remover caracteres peligrosos', () => {
      const input = '../../etc/passwd';
      const result = ChatUtils.sanitizeFilename(input);
      expect(result).not.toContain('..');
      expect(result).not.toContain('/');
    });

    it('debería mantener nombres válidos sin cambios', () => {
      const input = 'plan_matematica_2023.xlsx';
      const result = ChatUtils.sanitizeFilename(input);
      expect(result).toBe(input);
    });

    it('debería generar nombre genérico si el input está vacío', () => {
      const result = ChatUtils.sanitizeFilename('');
      expect(result).toContain('archivo_');
    });

    it('debería limitar longitud a 255 caracteres', () => {
      const input = 'a'.repeat(300) + '.xlsx';
      const result = ChatUtils.sanitizeFilename(input);
      expect(result.length).toBeLessThanOrEqual(255);
    });
  });

  describe('isValidBase64', () => {
    it('debería validar base64 correcto', () => {
      const validBase64 = Buffer.from('test').toString('base64');
      expect(ChatUtils.isValidBase64(validBase64)).toBe(true);
    });

    it('debería rechazar base64 inválido', () => {
      expect(ChatUtils.isValidBase64('not-base64!@#')).toBe(false);
    });

    it('debería rechazar strings vacíos', () => {
      expect(ChatUtils.isValidBase64('')).toBe(false);
    });

    it('debería rechazar null/undefined', () => {
      expect(ChatUtils.isValidBase64(null as any)).toBe(false);
      expect(ChatUtils.isValidBase64(undefined as any)).toBe(false);
    });
  });

  describe('isValidExcelFile', () => {
    it('debería validar archivo XLSX (magic numbers)', () => {
      const xlsxBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00]);
      expect(ChatUtils.isValidExcelFile(xlsxBuffer)).toBe(true);
    });

    it('debería validar archivo XLS (magic numbers)', () => {
      const xlsBuffer = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0x00, 0x00]);
      expect(ChatUtils.isValidExcelFile(xlsBuffer)).toBe(true);
    });

    it('debería rechazar archivos no Excel', () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46]); // PDF magic
      expect(ChatUtils.isValidExcelFile(pdfBuffer)).toBe(false);
    });

    it('debería rechazar buffers muy pequeños', () => {
      const tinyBuffer = Buffer.from([0x00, 0x01]);
      expect(ChatUtils.isValidExcelFile(tinyBuffer)).toBe(false);
    });
  });

  describe('validatePregunta', () => {
    it('debería validar pregunta correcta', () => {
      const pregunta = 'Genera un plan para matemáticas de 10th grado';
      const result = ChatUtils.validatePregunta(pregunta);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('debería rechazar pregunta muy corta', () => {
      const pregunta = 'Hola';
      const result = ChatUtils.validatePregunta(pregunta);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('10 caracteres');
    });

    it('debería rechazar pregunta muy larga', () => {
      const pregunta = 'a'.repeat(501);
      const result = ChatUtils.validatePregunta(pregunta);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('500 caracteres');
    });

    it('debería rechazar pregunta vacía', () => {
      const result = ChatUtils.validatePregunta('');
      expect(result.valid).toBe(false);
    });

    it('debería rechazar null/undefined', () => {
      const result = ChatUtils.validatePregunta(null as any);
      expect(result.valid).toBe(false);
    });
  });

  describe('generateFileHash', () => {
    it('debería generar hash SHA-256 consistente', () => {
      const buffer = Buffer.from('test content');
      const hash1 = ChatUtils.generateFileHash(buffer);
      const hash2 = ChatUtils.generateFileHash(buffer);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 = 64 chars hex
    });

    it('debería generar hashes diferentes para contenidos diferentes', () => {
      const buffer1 = Buffer.from('content A');
      const buffer2 = Buffer.from('content B');
      const hash1 = ChatUtils.generateFileHash(buffer1);
      const hash2 = ChatUtils.generateFileHash(buffer2);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('isAllowedMimeType', () => {
    it('debería permitir tipos MIME en whitelist', () => {
      expect(ChatUtils.isAllowedMimeType('application/pdf')).toBe(true);
      expect(ChatUtils.isAllowedMimeType('video/mp4')).toBe(true);
      expect(ChatUtils.isAllowedMimeType('image/png')).toBe(true);
    });

    it('debería rechazar tipos MIME no permitidos', () => {
      expect(ChatUtils.isAllowedMimeType('application/x-executable')).toBe(false);
      expect(ChatUtils.isAllowedMimeType('text/html')).toBe(false);
    });

    it('debería manejar case-insensitive', () => {
      expect(ChatUtils.isAllowedMimeType('APPLICATION/PDF')).toBe(true);
    });
  });

  describe('validateExcelFile', () => {
    it('debería validar archivo Excel completo', () => {
      const validXlsx = Buffer.from([0x50, 0x4B, 0x03, 0x04, ...Array(100).fill(0)]);
      const base64 = validXlsx.toString('base64');
      
      const result = ChatUtils.validateExcelFile(base64, 'plan.xlsx');
      
      expect(result.valid).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.size).toBeGreaterThan(0);
      expect(result.hash).toHaveLength(64);
    });

    it('debería rechazar base64 inválido', () => {
      const result = ChatUtils.validateExcelFile('invalid!@#', 'plan.xlsx');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('corrupto');
    });

    it('debería rechazar extensión no Excel', () => {
      const validXlsx = Buffer.from([0x50, 0x4B, 0x03, 0x04, ...Array(100).fill(0)]);
      const base64 = validXlsx.toString('base64');
      
      const result = ChatUtils.validateExcelFile(base64, 'documento.pdf');
      expect(result.valid).toBe(false);
    });

    it('debería rechazar archivos muy grandes', () => {
      const hugeBuffer = Buffer.alloc(CHAT_CONSTANTS.MAX_GESTION_FILE_SIZE + 1);
      hugeBuffer[0] = 0x50; hugeBuffer[1] = 0x4B; hugeBuffer[2] = 0x03; hugeBuffer[3] = 0x04;
      const base64 = hugeBuffer.toString('base64');
      
      const result = ChatUtils.validateExcelFile(base64, 'huge.xlsx');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('excede');
    });
  });

  describe('calculateBackoffDelay', () => {
    it('debería calcular delay con backoff exponencial', () => {
      expect(ChatUtils.calculateBackoffDelay(1, 1000)).toBe(1000); // 2^0
      expect(ChatUtils.calculateBackoffDelay(2, 1000)).toBe(2000); // 2^1
      expect(ChatUtils.calculateBackoffDelay(3, 1000)).toBe(4000); // 2^2
    });
  });
});
```

---

## 2️⃣ Tests del Servicio (ChatService)

### `chat.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { CHAT_CONSTANTS, LAMBDA_ENDPOINTS } from './constants/chat.constants';

// Mock global fetch
global.fetch = jest.fn();

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatService],
    }).compile();

    service = module.get<ChatService>(ChatService);
    jest.clearAllMocks();
  });

  describe('consultarChatbot', () => {
    it('debería retornar éxito con buffer válido', async () => {
      const mockBuffer = Buffer.from('Excel content');
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            if (header === 'content-disposition') return 'attachment; filename="plan.xlsx"';
            return null;
          }),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockBuffer.buffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.consultarChatbot(
        'test@test.com',
        'Genera un plan de matemáticas',
        'planificacion'
      );

      expect(result.success).toBe(true);
      expect(result.buffer).toBeDefined();
      expect(result.filename).toBe('plan.xlsx');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.intentos).toBe(1);
    });

    it('debería rechazar pregunta inválida', async () => {
      const result = await service.consultarChatbot(
        'test@test.com',
        'Corto', // Menos de 10 caracteres
        'planificacion'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('VALIDATION_ERROR');
    });

    it('debería detectar respuesta inválida (false)', async () => {
      const mockBuffer = Buffer.from('false');
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn(() => null),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockBuffer.buffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.consultarChatbot(
        'test@test.com',
        'Pregunta válida de al menos 10 caracteres',
        'planificacion'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_QUESTION');
    });

    it('debería reintentar con backoff exponencial en caso de error', async () => {
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          headers: { get: jest.fn(() => null) },
          arrayBuffer: jest.fn().mockResolvedValue(Buffer.from('Excel').buffer),
        });

      const result = await service.consultarChatbot(
        'test@test.com',
        'Pregunta válida de al menos 10 caracteres',
        'planificacion'
      );

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
      expect(result.metadata?.intentos).toBe(3);
    }, 10000); // Timeout de 10s para el test con retries

    it('debería fallar después de MAX_RETRIES intentos', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await service.consultarChatbot(
        'test@test.com',
        'Pregunta válida de al menos 10 caracteres',
        'planificacion'
      );

      expect(global.fetch).toHaveBeenCalledTimes(CHAT_CONSTANTS.MAX_RETRIES);
      expect(result.success).toBe(false);
      expect(result.error).toBe('API_ERROR');
    }, 15000);
  });

  describe('consultarRecursos', () => {
    it('debería retornar recurso PDF válido', async () => {
      const mockBuffer = Buffer.from('PDF content');
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'application/pdf';
            return null;
          }),
        },
        arrayBuffer: jest.fn().mockResolvedValue(mockBuffer.buffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.consultarRecursos(
        'test@test.com',
        'Genera una hoja de trabajo para matemática de 2nd'
      );

      expect(result.success).toBe(true);
      expect(result.contentType).toBe('application/pdf');
      expect(result.filename).toContain('recurso_pdf_');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.hash).toHaveLength(64);
    });

    it('debería rechazar tipo MIME no permitido', async () => {
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-type') return 'application/x-executable';
            return null;
          }),
        },
        arrayBuffer: jest.fn(),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.consultarRecursos(
        'test@test.com',
        'Pregunta válida de al menos 10 caracteres'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_MIME_TYPE');
    });

    it('debería rechazar archivo muy grande', async () => {
      const hugeBuffer = Buffer.alloc(CHAT_CONSTANTS.MAX_RECURSO_FILE_SIZE + 1);
      const mockResponse = {
        ok: true,
        headers: {
          get: jest.fn(() => 'application/pdf'),
        },
        arrayBuffer: jest.fn().mockResolvedValue(hugeBuffer.buffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.consultarRecursos(
        'test@test.com',
        'Pregunta válida de al menos 10 caracteres'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('FILE_TOO_LARGE');
    });
  });

  describe('gestionArchivo', () => {
    it('debería procesar archivo Excel exitosamente', async () => {
      const validXlsx = Buffer.from([0x50, 0x4B, 0x03, 0x04, ...Array(100).fill(0)]);
      const base64 = validXlsx.toString('base64');

      const mockResponse = {
        status: 200,
        json: jest.fn().mockResolvedValue({ message: 'Éxito' }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.gestionArchivo(
        'test@test.com',
        'plan.xlsx',
        base64
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Éxito');
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.hash).toHaveLength(64);
    });

    it('debería retornar archivo de errores en status 400', async () => {
      const validXlsx = Buffer.from([0x50, 0x4B, 0x03, 0x04, ...Array(100).fill(0)]);
      const base64 = validXlsx.toString('base64');
      const errorBuffer = Buffer.from('Error details');

      const mockResponse = {
        status: 400,
        headers: {
          get: jest.fn((header) => {
            if (header === 'content-disposition') return 'attachment; filename="errores.xlsx"';
            return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          }),
        },
        arrayBuffer: jest.fn().mockResolvedValue(errorBuffer.buffer),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.gestionArchivo(
        'test@test.com',
        'plan.xlsx',
        base64
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('VALIDATION_ERRORS');
      expect(result.filename).toBe('errores.xlsx');
      expect(result.buffer).toBeDefined();
    });

    it('debería rechazar base64 inválido', async () => {
      const result = await service.gestionArchivo(
        'test@test.com',
        'plan.xlsx',
        'invalid-base64!@#'
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('CORRUPTED_BASE64');
    });

    it('debería rechazar archivo no Excel', async () => {
      const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, ...Array(100).fill(0)]);
      const base64 = pdfBuffer.toString('base64');

      const result = await service.gestionArchivo(
        'test@test.com',
        'documento.xlsx',
        base64
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_FILE_FORMAT');
    });
  });
});
```

---

## 3️⃣ Tests del Controlador (ChatController)

### `chat.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { Response } from 'express';

describe('ChatController', () => {
  let controller: ChatController;
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            consultarChatbot: jest.fn(),
            consultarRecursos: jest.fn(),
            gestionArchivo: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
    service = module.get<ChatService>(ChatService);
  });

  describe('consultarChatbotFrontend', () => {
    it('debería retornar datos en base64', async () => {
      const mockBuffer = Buffer.from('Excel content');
      jest.spyOn(service, 'consultarChatbot').mockResolvedValue({
        success: true,
        buffer: mockBuffer,
        filename: 'plan.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const result = await controller.consultarChatbotFrontend({
        usuario: 'test@test.com',
        pregunta: 'Genera un plan de matemáticas',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockBuffer.toString('base64'));
      expect(result.filename).toBe('plan.xlsx');
    });

    it('debería lanzar excepción si falta usuario', async () => {
      await expect(
        controller.consultarChatbotFrontend({
          usuario: '',
          pregunta: 'Pregunta',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('debería lanzar UnprocessableEntityException si pregunta inválida', async () => {
      jest.spyOn(service, 'consultarChatbot').mockResolvedValue({
        success: false,
        error: 'INVALID_QUESTION',
        message: 'Pregunta inválida',
      });

      await expect(
        controller.consultarChatbotFrontend({
          usuario: 'test@test.com',
          pregunta: 'Pregunta válida',
        })
      ).rejects.toThrow(UnprocessableEntityException);
    });
  });

  describe('consultarRecursosFrontend', () => {
    it('debería retornar recurso en base64', async () => {
      const mockBuffer = Buffer.from('PDF content');
      jest.spyOn(service, 'consultarRecursos').mockResolvedValue({
        success: true,
        buffer: mockBuffer,
        filename: 'recurso.pdf',
        contentType: 'application/pdf',
      });

      const result = await controller.consultarRecursosFrontend({
        usuario: 'test@test.com',
        pregunta: 'Genera una hoja de trabajo',
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe(mockBuffer.toString('base64'));
      expect(result.contentType).toBe('application/pdf');
    });
  });

  describe('gestionArchivoFrontend', () => {
    it('debería retornar éxito al procesar archivo', async () => {
      jest.spyOn(service, 'gestionArchivo').mockResolvedValue({
        success: true,
        message: 'Archivo procesado',
      });

      const result = await controller.gestionArchivoFrontend({
        usuario: 'test@test.com',
        filename: 'plan.xlsx',
        file_base64: 'validbase64==',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Archivo procesado');
    });

    it('debería retornar errores de validación', async () => {
      const errorBuffer = Buffer.from('Error details');
      jest.spyOn(service, 'gestionArchivo').mockResolvedValue({
        success: false,
        error: 'VALIDATION_ERRORS',
        filename: 'errores.xlsx',
        buffer: errorBuffer,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const result = await controller.gestionArchivoFrontend({
        usuario: 'test@test.com',
        filename: 'plan.xlsx',
        file_base64: 'validbase64==',
      });

      expect(result.success).toBe(false);
      expect(result.data).toBe(errorBuffer.toString('base64'));
      expect(result.filename).toBe('errores.xlsx');
    });
  });
});
```

---

## 🚀 Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar con coverage
npm run test:cov

# Ejecutar en modo watch
npm run test:watch

# Ejecutar solo tests de utilidades
npm test -- chat.utils.spec

# Ejecutar solo tests del servicio
npm test -- chat.service.spec
```

---

## 📊 Coverage Esperado

Después de implementar estos tests, deberías tener:

- ✅ **ChatUtils**: >95% coverage
- ✅ **ChatService**: >85% coverage
- ✅ **ChatController**: >80% coverage

---

## 📝 Notas

1. Los tests asumen que `global.fetch` está mockeado
2. Los timeouts largos (10-15s) son para tests con retries
3. Los tests de validación verifican todos los edge cases
4. Los tests de servicio verifican retry logic y manejo de errores
5. Los tests de controlador verifican integración con el servicio

---

## 🔧 Próximos Pasos

1. Implementar tests E2E con Supertest
2. Agregar tests de performance
3. Implementar tests de carga
4. Configurar CI/CD con estos tests
