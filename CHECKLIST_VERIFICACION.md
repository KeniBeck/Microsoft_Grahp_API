# ✅ CHECKLIST DE VERIFICACIÓN - Refactorización Chat Modules

## 📋 VERIFICACIÓN PRE-DESPLIEGUE

Usa este checklist antes de desplegar a producción.

---

## 1️⃣ ESTRUCTURA DE ARCHIVOS

### Archivos Nuevos Creados
- [ ] `src/chat/constants/chat.constants.ts` existe
- [ ] `src/chat/interfaces/chat.interfaces.ts` existe
- [ ] `src/chat/utils/chat.utils.ts` existe

### Archivos Modificados
- [ ] `src/chat/chat.service.ts` tiene 571 líneas
- [ ] `src/chat/dto/create-chat.dto.ts` tiene validaciones
- [ ] `src/chat/dto/gestion-archivo.dto.ts` tiene validaciones

### Documentación
- [ ] `REFACTORIZACION_CHAT_MODULES.md` existe
- [ ] `API_USAGE_EXAMPLES.md` existe
- [ ] `TESTS_EXAMPLES.md` existe
- [ ] `RESUMEN_FINAL.md` existe
- [ ] `CHECKLIST_VERIFICACION.md` existe (este archivo)

---

## 2️⃣ COMPILACIÓN Y DEPENDENCIAS

### Dependencias Instaladas
```bash
npm list class-validator class-transformer
```
- [ ] `class-validator@^0.14.x` instalado
- [ ] `class-transformer@^0.5.x` instalado

### Compilación Exitosa
```bash
npm run build
```
- [ ] Compilación sin errores
- [ ] Carpeta `dist/` generada
- [ ] Sin warnings críticos

---

## 3️⃣ VALIDACIÓN DE CÓDIGO

### Imports Correctos
Verificar que estos imports funcionen:

```typescript
// En chat.service.ts
import { CHAT_CONSTANTS, LAMBDA_ENDPOINTS } from './constants/chat.constants';
import { ChatbotResponse, RecursoResponse, GestionResponse } from './interfaces/chat.interfaces';
import { ChatUtils } from './utils/chat.utils';
```

- [ ] Todos los imports resuelven correctamente
- [ ] No hay errores de TypeScript

### Constantes Accesibles
```bash
grep -r "CHAT_CONSTANTS" src/chat/ | wc -l
```
- [ ] Constantes usadas en múltiples archivos
- [ ] Sin magic strings/numbers en service

---

## 4️⃣ FUNCIONALIDAD DE MÓDULOS

### Planificador (consultarChatbot)
- [ ] Acepta 4 tipos: planificacion, planificador, adecuacion, seguimiento
- [ ] Valida pregunta 10-500 caracteres
- [ ] Implementa retry logic (3 intentos)
- [ ] Implementa backoff exponencial (1s, 2s, 4s)
- [ ] Timeout de 30 segundos
- [ ] Logging estructurado con contexto
- [ ] Retorna metadata (intentos, duración, timestamp)

### Recursos (consultarRecursos)
- [ ] Valida whitelist MIME (8 tipos)
- [ ] Valida tamaño máximo 50MB
- [ ] Genera filename con timestamp
- [ ] Genera hash SHA-256
- [ ] Retorna metadata completa
- [ ] Logging detallado

### Gestión (gestionArchivo)
- [ ] Valida base64 corrupto
- [ ] Valida formato Excel (magic numbers)
- [ ] Valida tamaño máximo 10MB
- [ ] Sanitiza filename
- [ ] Genera hash SHA-256
- [ ] Maneja status 200 (éxito)
- [ ] Maneja status 400 (errores de validación)
- [ ] Retorna metadata completa

---

## 5️⃣ UTILIDADES (ChatUtils)

Verificar que todas las 15 funciones existan y funcionen:

- [ ] `sanitizeFilename()` - Remueve caracteres peligrosos
- [ ] `isValidBase64()` - Valida formato base64
- [ ] `isValidExcelFile()` - Verifica magic numbers
- [ ] `generateFileHash()` - Hash SHA-256
- [ ] `validatePregunta()` - Valida longitud
- [ ] `getFileExtension()` - Extrae extensión
- [ ] `isAllowedMimeType()` - Valida whitelist
- [ ] `generateTimestamp()` - Timestamp formateado
- [ ] `validateExcelFile()` - Validación completa
- [ ] `isValidEmail()` - Valida email
- [ ] `getTipoArchivoFromMime()` - MIME a tipo
- [ ] `getExtensionFromMime()` - MIME a extensión
- [ ] `formatFileSize()` - Bytes a legible
- [ ] `sleep()` - Delay async
- [ ] `calculateBackoffDelay()` - Backoff exponencial

---

## 6️⃣ VALIDACIONES DE DTOs

### CreateChatDto
```typescript
{
  usuario: string;    // @IsEmail()
  pregunta: string;   // @Length(10, 500)
}
```
- [ ] Validación de email funciona
- [ ] Validación de longitud funciona
- [ ] Errores 400 se retornan correctamente

### GestionArchivoDto
```typescript
{
  usuario: string;      // @IsEmail()
  filename: string;     // @Matches(/\.(xlsx|xls)$/i)
  file_base64: string;  // @IsNotEmpty()
}
```
- [ ] Validación de email funciona
- [ ] Validación de extensión funciona
- [ ] Validación de base64 no vacío funciona

---

## 7️⃣ ENDPOINTS DEL CONTROLADOR

Verificar que todos los endpoints existan:

### Planificación
- [ ] `POST /chat/consult` (descarga directa)
- [ ] `POST /chat/consult-frontend` (base64)

### Planificador
- [ ] `POST /chat/planificador` (descarga directa)
- [ ] `POST /chat/planificador-frontend` (base64)

### Recursos
- [ ] `POST /chat/recursos` (descarga directa)
- [ ] `POST /chat/recursos-frontend` (base64)

### Adecuación
- [ ] `POST /chat/adecuacion` (descarga directa)
- [ ] `POST /chat/adecuacion-frontend` (base64)

### Seguimiento
- [ ] `POST /chat/seguimiento` (descarga directa)
- [ ] `POST /chat/seguimiento-frontend` (base64)

### Gestión
- [ ] `POST /chat/gestion` (descarga/JSON)
- [ ] `POST /chat/gestion-frontend` (JSON/base64)

**Total:** 12 endpoints

---

## 8️⃣ LOGGING

### Formato Correcto
Ejecutar en desarrollo y verificar logs:

```bash
npm run start:dev
```

Luego hacer requests y verificar:

- [ ] Logs tienen formato `[TIPO][USUARIO] mensaje`
- [ ] Logs muestran intentos en retry
- [ ] Logs muestran duración en ms
- [ ] Logs muestran tamaño de archivos
- [ ] Logs usan emojis: ✅ ❌ ⚠️ 🔄 ⏱️

### Ejemplo Esperado
```
[PLANIFICACION][test@test.com] Iniciando consulta al chatbot
[PLANIFICACION][test@test.com] Intento 1/3 - Consultando Lambda
[PLANIFICACION][test@test.com] ✅ Éxito - Duración: 1234ms - Intentos: 1 - Tamaño: 45.2 KB
```

---

## 9️⃣ SEGURIDAD

### Validaciones de Seguridad
- [ ] Filenames sanitizados (sin `../`, `/`, `\`)
- [ ] Solo tipos MIME permitidos en whitelist
- [ ] Tamaños máximos configurados (10MB gestión, 50MB recursos)
- [ ] Base64 validado antes de decodificar
- [ ] Magic numbers verificados (no solo extensión)
- [ ] Emails validados con regex
- [ ] Input sanitizado (pregunta 10-500 chars)

### Test Manual de Seguridad
- [ ] Intentar filename con `../../etc/passwd` → debe sanitizarse
- [ ] Intentar tipo MIME `application/x-executable` → debe rechazarse
- [ ] Intentar archivo >10MB en gestión → debe rechazarse
- [ ] Intentar base64 inválido → debe rechazarse

---

## 🔟 TESTS

### Ejecutar Suite de Tests
```bash
npm test
```

Si implementaste los tests de `TESTS_EXAMPLES.md`:

- [ ] Tests de ChatUtils pasan (20+)
- [ ] Tests de ChatService pasan (15+)
- [ ] Tests de ChatController pasan (10+)
- [ ] Coverage >80%

---

## 1️⃣1️⃣ PERFORMANCE

### Timeouts y Retries
- [ ] Timeout configurado a 30 segundos
- [ ] Retry logic funciona (3 intentos)
- [ ] Backoff exponencial implementado
- [ ] AbortController cancela requests timeout

### Test de Performance Manual
```bash
# Hacer 10 requests concurrentes
for i in {1..10}; do
  curl -X POST "http://localhost:3000/chat/consult-frontend" \
    -H "Content-Type: application/json" \
    -d '{"usuario":"test@test.com","pregunta":"Test de performance con pregunta valida"}' &
done
```

- [ ] Servidor maneja requests concurrentes
- [ ] Logs no se mezclan
- [ ] Respuestas correctas

---

## 1️⃣2️⃣ DOCUMENTACIÓN

### Leer y Verificar
- [ ] `REFACTORIZACION_CHAT_MODULES.md` - Leído y comprendido
- [ ] `API_USAGE_EXAMPLES.md` - Ejemplos probados
- [ ] `TESTS_EXAMPLES.md` - Tests comprendidos
- [ ] `RESUMEN_FINAL.md` - Revisado

### Ejemplos de API Funcionan
Probar algunos ejemplos de `API_USAGE_EXAMPLES.md`:

- [ ] Ejemplo cURL de planificación funciona
- [ ] Ejemplo cURL de recursos funciona
- [ ] Ejemplo cURL de gestión funciona
- [ ] Código JavaScript funciona en frontend

---

## 1️⃣3️⃣ CONFIGURACIÓN DE PRODUCCIÓN

### Variables de Entorno (Opcional)
Si decides usar env vars, agregar a `.env`:

```env
NODE_ENV=production
PORT=3000
LAMBDA_TIMEOUT=30000
MAX_RETRIES=3
MAX_FILE_SIZE_GESTION=10485760
MAX_FILE_SIZE_RECURSOS=52428800
```

- [ ] Variables de entorno configuradas
- [ ] Valores apropiados para producción

### URLs de Lambda
Verificar en `src/chat/constants/chat.constants.ts`:

```typescript
export const LAMBDA_ENDPOINTS = {
  PLANIFICACION: 'https://2lqqjvlg14.execute-api.us-east-2.amazonaws.com/planificacion',
  // ... etc
}
```

- [ ] URLs correctas para producción
- [ ] Endpoints Lambda accesibles

---

## 1️⃣4️⃣ DESPLIEGUE

### Pre-Deploy
- [ ] Código en rama `main` o `production`
- [ ] Todos los archivos commiteados
- [ ] `.gitignore` incluye `node_modules`, `dist`, `.env`
- [ ] `package.json` tiene scripts correctos

### Build de Producción
```bash
npm run build
npm run start:prod
```

- [ ] Build exitoso sin errores
- [ ] Aplicación arranca correctamente
- [ ] Health check responde (si existe)

### Post-Deploy
- [ ] Aplicación deployada
- [ ] URLs accesibles
- [ ] Logs funcionando en producción
- [ ] Monitoring configurado (opcional)

---

## 1️⃣5️⃣ VERIFICACIÓN FINAL

### Smoke Tests en Producción
Hacer requests reales a cada endpoint:

- [ ] `/chat/consult-frontend` → Retorna Excel en base64
- [ ] `/chat/planificador-frontend` → Retorna Excel en base64
- [ ] `/chat/recursos-frontend` → Retorna recurso en base64
- [ ] `/chat/adecuacion-frontend` → Retorna Excel en base64
- [ ] `/chat/seguimiento-frontend` → Retorna Excel en base64
- [ ] `/chat/gestion-frontend` → Procesa archivo o retorna errores

### Monitoreo
- [ ] Logs llegando correctamente
- [ ] Errores siendo capturados
- [ ] Performance aceptable (<5s por request)
- [ ] No hay memory leaks

---

## ✅ CHECKLIST COMPLETADO

Una vez completado todo el checklist:

- [ ] **TODOS los items marcados con ✓**
- [ ] **Documentación revisada y comprendida**
- [ ] **Tests ejecutados exitosamente**
- [ ] **Aplicación desplegada en producción**
- [ ] **Monitoring configurado**

---

## 🎉 PROYECTO LISTO PARA PRODUCCIÓN

**Fecha de Verificación:** _______________  
**Verificado por:** _______________  
**Firma:** _______________  

---

## 📞 SOPORTE

Si algún item falla:
1. Revisar `REFACTORIZACION_CHAT_MODULES.md` para detalles técnicos
2. Revisar `API_USAGE_EXAMPLES.md` para ejemplos
3. Revisar `TESTS_EXAMPLES.md` para debugging
4. Contactar al equipo de desarrollo

---

**Mentora - Chat Modules Refactorization**  
**Version:** 2.0.0  
**Status:** Production Ready ✅  
**Date:** December 15, 2025
