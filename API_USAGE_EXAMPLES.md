# Ejemplos de Uso de la API - Mentora Chat Modules

## 📋 Información General

Base URL: `http://localhost:3000` (desarrollo)  
Content-Type: `application/json`

---

## 1️⃣ MÓDULO PLANIFICADOR

### Endpoints Disponibles

#### 1.1 Planificación (Descarga directa)
```bash
POST /chat/consult
```

**Body:**
```json
{
  "usuario": "diego.morales@ameritec.edu.gt",
  "pregunta": "Genera un plan semanal para matemáticas de 10th grado, unidad 3 sobre funciones cuadráticas"
}
```

**Response:** Buffer binario (archivo Excel)

**cURL:**
```bash
curl -X POST "http://localhost:3000/chat/consult" \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "diego.morales@ameritec.edu.gt",
    "pregunta": "Genera un plan semanal para matemáticas de 10th grado, unidad 3"
  }' \
  -o planificacion.xlsx
```

---

#### 1.2 Planificación (Frontend - Base64)
```bash
POST /chat/consult-frontend
```

**Body:**
```json
{
  "usuario": "diego.morales@ameritec.edu.gt",
  "pregunta": "Genera un plan semanal para matemáticas de 10th grado, unidad 3 sobre funciones cuadráticas"
}
```

**Response Exitosa:**
```json
{
  "success": true,
  "data": "UEsDBBQACAgIAH...", // base64
  "filename": "planificacion_2025-12-15T10-30-45.xlsx",
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}
```

**Response Error (Pregunta corta):**
```json
{
  "statusCode": 400,
  "message": ["La pregunta debe tener entre 10 y 500 caracteres"],
  "error": "Bad Request"
}
```

**Response Error (Pregunta inválida):**
```json
{
  "statusCode": 422,
  "message": "No se pudo generar el documento solicitado. Verifique que la pregunta sea válida para planificacion.",
  "error": "Unprocessable Entity"
}
```

**cURL:**
```bash
curl -X POST "http://localhost:3000/chat/consult-frontend" \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "diego.morales@ameritec.edu.gt",
    "pregunta": "Genera un plan semanal para matemáticas de 10th grado, unidad 3"
  }'
```

---

#### 1.3 Planificador (Descarga directa)
```bash
POST /chat/planificador
```

**Body:**
```json
{
  "usuario": "maria.garcia@ameritec.edu.gt",
  "pregunta": "Crea una planificación anual de Ciencias Naturales para 8th grado"
}
```

**Response:** Buffer binario (archivo Excel)

---

#### 1.4 Planificador (Frontend - Base64)
```bash
POST /chat/planificador-frontend
```

**Body:**
```json
{
  "usuario": "maria.garcia@ameritec.edu.gt",
  "pregunta": "Crea una planificación anual de Ciencias Naturales para 8th grado"
}
```

**Response Exitosa:**
```json
{
  "success": true,
  "data": "UEsDBBQACAgIAH...",
  "filename": "planificador_2025-12-15T10-30-45.xlsx",
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
}
```

---

#### 1.5 Adecuación (Frontend - Base64)
```bash
POST /chat/adecuacion-frontend
```

**Body:**
```json
{
  "usuario": "pedro.lopez@ameritec.edu.gt",
  "pregunta": "Adapta el plan de matemáticas de 5th grado para estudiantes con dislexia"
}
```

---

#### 1.6 Seguimiento (Frontend - Base64)
```bash
POST /chat/seguimiento-frontend
```

**Body:**
```json
{
  "usuario": "ana.martinez@ameritec.edu.gt",
  "pregunta": "Genera un reporte de seguimiento del trimestre 2 para Literatura de 11th grado"
}
```

---

## 2️⃣ MÓDULO RECURSOS

### Endpoints Disponibles

#### 2.1 Recursos (Descarga directa)
```bash
POST /chat/recursos
```

**Body:**
```json
{
  "usuario": "diego.morales@ameritec.edu.gt",
  "pregunta": "Genera una hoja de trabajo para la semana 4 unidad 2 de matemática de 2nd con diez ejercicios de aplicaciones prácticas"
}
```

**Response:** Buffer binario (puede ser PDF, DOCX, PPTX, XLSX, MP4, JPG, PNG, ZIP)

**cURL:**
```bash
curl -X POST "http://localhost:3000/chat/recursos" \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "diego.morales@ameritec.edu.gt",
    "pregunta": "Genera una hoja de trabajo para matemática de 2nd"
  }' \
  -OJ
```

---

#### 2.2 Recursos (Frontend - Base64)
```bash
POST /chat/recursos-frontend
```

**Body:**
```json
{
  "usuario": "diego.morales@ameritec.edu.gt",
  "pregunta": "Genera una presentación de PowerPoint sobre el sistema solar para Ciencias de 5th grado, unidad 1"
}
```

**Response Exitosa (PDF):**
```json
{
  "success": true,
  "data": "JVBERi0xLjQKJ...", // base64
  "filename": "recurso_pdf_2025-12-15T10-30-45.pdf",
  "contentType": "application/pdf"
}
```

**Response Exitosa (PPTX):**
```json
{
  "success": true,
  "data": "UEsDBBQACAgIAH...",
  "filename": "recurso_pptx_2025-12-15T10-30-45.pptx",
  "contentType": "application/vnd.openxmlformats-officedocument.presentationml.presentation"
}
```

**Response Error (Tipo MIME no permitido):**
```json
{
  "statusCode": 502,
  "message": "Tipo de archivo no permitido: application/x-unknown",
  "error": "Bad Gateway"
}
```

**Response Error (Archivo muy grande):**
```json
{
  "statusCode": 502,
  "message": "El recurso excede el tamaño máximo permitido (50MB)",
  "error": "Bad Gateway"
}
```

**Mensaje de Ayuda para el Usuario:**
```
Para generar un recurso, necesito que me brindes los siguientes datos:
• Grado (ej: 12th, kinder)
• Área (ej: Matemática, Literature & Vocabulary)
• Unidad (ej: unidad 4, quarter 3)
• Tipo de recurso: evaluación, hoja de trabajo, presentación.
• [Opcional] Observaciones adicionales
```

**Ejemplos de Preguntas Válidas:**
- "Genera una hoja de trabajo para la semana 4 unidad 2 de matemática de 2nd con diez ejercicios de aplicaciones prácticas"
- "Crea una evaluación de la unidad 3 de Historia para 9th grado"
- "Genera una presentación de PowerPoint sobre verbos irregulares para English de 7th grado"

---

## 3️⃣ MÓDULO GESTIÓN

### Endpoints Disponibles

#### 3.1 Gestión (Descarga archivo de errores si hay)
```bash
POST /chat/gestion
```

**Body:**
```json
{
  "usuario": "diego.morales@ameritec.edu.gt",
  "filename": "plan_12th_matematica.xlsx",
  "file_base64": "UEsDBBQACAgIAH..."
}
```

**Response Exitosa (Status 200):**
```json
{
  "success": true,
  "message": "Archivo procesado exitosamente"
}
```

**Response con Errores (Status 200):**
Buffer binario (archivo Excel con errores encontrados)

**cURL:**
```bash
curl -X POST "http://localhost:3000/chat/gestion" \
  -H "Content-Type: application/json" \
  -d '{
    "usuario": "diego.morales@ameritec.edu.gt",
    "filename": "plan_12th_matematica.xlsx",
    "file_base64": "UEsDBBQACAgIAH..."
  }' \
  -OJ
```

---

#### 3.2 Gestión (Frontend - Base64)
```bash
POST /chat/gestion-frontend
```

**Body:**
```json
{
  "usuario": "diego.morales@ameritec.edu.gt",
  "filename": "plan_12th_matematica.xlsx",
  "file_base64": "UEsDBBQACAgIAH..."
}
```

**Response Exitosa:**
```json
{
  "success": true,
  "message": "Archivo procesado exitosamente"
}
```

**Response con Errores de Validación:**
```json
{
  "success": false,
  "filename": "errores_2025-12-15T10-30-45.xlsx",
  "contentType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "data": "UEsDBBQACAgIAH..." // Excel con errores en base64
}
```

**Response Error (Base64 inválido):**
```json
{
  "statusCode": 502,
  "message": "El archivo proporcionado está corrupto o no es válido",
  "error": "Bad Gateway"
}
```

**Response Error (Formato no Excel):**
```json
{
  "statusCode": 502,
  "message": "El archivo no es un formato Excel válido (.xlsx o .xls)",
  "error": "Bad Gateway"
}
```

**Response Error (Archivo muy grande):**
```json
{
  "statusCode": 502,
  "message": "El archivo excede el tamaño máximo permitido (10MB)",
  "error": "Bad Gateway"
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Cuándo se retorna |
|--------|-------------|-------------------|
| 200 | OK | Operación exitosa |
| 400 | Bad Request | Validación de DTO falló (email inválido, pregunta muy corta/larga, etc.) |
| 422 | Unprocessable Entity | Lambda retornó respuesta inválida ('false') |
| 502 | Bad Gateway | Error del Lambda o error interno del servidor |

---

## 🔒 Validaciones Automáticas (DTOs)

### CreateChatDto
```typescript
{
  usuario: string;    // Debe ser email válido
  pregunta: string;   // Entre 10 y 500 caracteres
}
```

**Errores de Validación:**
```json
{
  "statusCode": 400,
  "message": [
    "El usuario debe ser un email válido",
    "La pregunta debe tener entre 10 y 500 caracteres"
  ],
  "error": "Bad Request"
}
```

### GestionArchivoDto
```typescript
{
  usuario: string;      // Debe ser email válido
  filename: string;     // Debe terminar en .xlsx o .xls, max 255 chars
  file_base64: string;  // No vacío
}
```

**Errores de Validación:**
```json
{
  "statusCode": 400,
  "message": [
    "El usuario debe ser un email válido",
    "El archivo debe ser Excel (.xlsx o .xls)",
    "El nombre del archivo es demasiado largo"
  ],
  "error": "Bad Request"
}
```

---

## 🧪 Testing con JavaScript/TypeScript

### Ejemplo con Fetch API (Frontend)

```typescript
// PLANIFICACIÓN - Frontend
async function consultarPlanificacion(usuario: string, pregunta: string) {
  const response = await fetch('http://localhost:3000/chat/consult-frontend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, pregunta }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();
  
  // Descargar archivo desde base64
  const buffer = Uint8Array.from(atob(data.data), c => c.charCodeAt(0));
  const blob = new Blob([buffer], { type: data.contentType });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = data.filename;
  a.click();
}
```

```typescript
// RECURSOS - Frontend
async function consultarRecursos(usuario: string, pregunta: string) {
  const response = await fetch('http://localhost:3000/chat/recursos-frontend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, pregunta }),
  });

  const data = await response.json();
  
  if (!data.success) {
    throw new Error('Error al obtener recurso');
  }

  // Descargar archivo desde base64
  const buffer = Uint8Array.from(atob(data.data), c => c.charCodeAt(0));
  const blob = new Blob([buffer], { type: data.contentType });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = data.filename;
  a.click();
}
```

```typescript
// GESTIÓN - Frontend
async function gestionarArchivo(usuario: string, file: File) {
  // Leer archivo como base64
  const reader = new FileReader();
  const fileBase64 = await new Promise<string>((resolve) => {
    reader.onload = () => {
      const base64 = reader.result as string;
      resolve(base64.split(',')[1]); // Remover "data:application/...;base64,"
    };
    reader.readAsDataURL(file);
  });

  const response = await fetch('http://localhost:3000/chat/gestion-frontend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario,
      filename: file.name,
      file_base64: fileBase64,
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    alert('Archivo procesado exitosamente');
  } else {
    // Descargar archivo de errores
    const buffer = Uint8Array.from(atob(data.data), c => c.charCodeAt(0));
    const blob = new Blob([buffer], { type: data.contentType });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = data.filename;
    a.click();
  }
}
```

---

## 📝 Notas Importantes

1. **Timeouts**: Todos los endpoints tienen un timeout de 30 segundos
2. **Retries**: El módulo Planificador reintenta 3 veces con backoff exponencial (1s, 2s, 4s)
3. **Tamaños Máximos**:
   - Gestión: 10MB por archivo Excel
   - Recursos: 50MB por recurso educativo
4. **Tipos MIME Permitidos** (Recursos):
   - PDF, DOCX, PPTX, XLSX
   - MP4, JPG, PNG, ZIP
5. **Validaciones**: Todos los DTOs tienen validaciones automáticas con `class-validator`
6. **Logging**: Todos los endpoints tienen logging estructurado en el servidor

---

## 🐛 Debugging

### Ver Logs del Servidor
```bash
npm run start:dev
```

Los logs mostrarán:
- `[PLANIFICACION][usuario@email.com]` - Logs de planificación
- `[RECURSOS][usuario@email.com]` - Logs de recursos
- `[GESTIÓN][usuario@email.com]` - Logs de gestión

### Ejemplo de Log Exitoso
```
[PLANIFICACION][diego.morales@ameritec.edu.gt] Iniciando consulta al chatbot
[PLANIFICACION][diego.morales@ameritec.edu.gt] Intento 1/3 - Consultando Lambda
[PLANIFICACION][diego.morales@ameritec.edu.gt] ✅ Éxito - Duración: 1234ms - Intentos: 1 - Tamaño: 45.2 KB
```

### Ejemplo de Log con Retry
```
[PLANIFICACION][diego.morales@ameritec.edu.gt] Intento 1/3 - Consultando Lambda
[PLANIFICACION][diego.morales@ameritec.edu.gt] ❌ Error en intento 1: fetch failed
[PLANIFICACION][diego.morales@ameritec.edu.gt] 🔄 Reintentando en 1000ms...
[PLANIFICACION][diego.morales@ameritec.edu.gt] Intento 2/3 - Consultando Lambda
[PLANIFICACION][diego.morales@ameritec.edu.gt] ✅ Éxito - Duración: 3456ms - Intentos: 2 - Tamaño: 45.2 KB
```

---

## 🚀 Despliegue en Producción

Cambiar URLs de Lambda en `src/chat/constants/chat.constants.ts` si es necesario.

Variables de entorno recomendadas:
```env
NODE_ENV=production
PORT=3000
LAMBDA_TIMEOUT=30000
MAX_RETRIES=3
MAX_FILE_SIZE_GESTION=10485760
MAX_FILE_SIZE_RECURSOS=52428800
```
