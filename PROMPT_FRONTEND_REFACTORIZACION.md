# PROMPT PARA REFACTORIZACIÓN DEL FRONTEND - MENTORA

## 📋 CONTEXTO DEL PROYECTO

Eres un desarrollador frontend senior trabajando en **Mentora**, una plataforma SaaS de planificación de clases para profesores. El **backend en NestJS ha sido completamente refactorizado** con mejoras de producción, y ahora necesitas actualizar el frontend para consumir correctamente las nuevas APIs.

**IMPORTANTE:** 
- ❌ **NO CREAR ARCHIVOS NUEVOS CON SUFIJOS COMO `.refactored`, `.backup`, `.new`, ETC.**
- ✅ **MODIFICAR DIRECTAMENTE LOS ARCHIVOS EXISTENTES**
- ✅ **USAR HERRAMIENTAS DE EDICIÓN (replace_string_in_file, insert_edit_into_file)**
- ✅ **NO DOCUMENTACIÓN ADICIONAL, SOLO CÓDIGO**

**Deadline: December 16, 2025**

---

## 🔧 CAMBIOS REALIZADOS EN EL BACKEND

### ENDPOINTS ACTUALIZADOS

#### ❌ ELIMINADO: `/chat/integrador` y `/chat/integrador-frontend`
#### ✅ NUEVO: `/chat/recursos` y `/chat/recursos-frontend`

#### ✅ NUEVO: `/chat/gestion` y `/chat/gestion-frontend`

### ESTRUCTURA DE ENDPOINTS ACTUAL

```
POST /chat/consult                    // Planificación (descarga archivo)
POST /chat/consult-frontend           // Planificación (retorna base64)

POST /chat/planificador               // Planificador (descarga archivo)
POST /chat/planificador-frontend      // Planificador (retorna base64)

POST /chat/recursos                   // Recursos (descarga archivo) ⭐ NUEVO
POST /chat/recursos-frontend          // Recursos (retorna base64) ⭐ NUEVO

POST /chat/adecuacion                 // Adecuación (descarga archivo)
POST /chat/adecuacion-frontend        // Adecuación (retorna base64)

POST /chat/seguimiento                // Seguimiento (descarga archivo)
POST /chat/seguimiento-frontend       // Seguimiento (retorna base64)

POST /chat/gestion                    // Gestión (sube archivo Excel) ⭐ NUEVO
POST /chat/gestion-frontend           // Gestión (sube archivo Excel) ⭐ NUEVO
```

---

## 🎯 MÓDULO 1: RECURSOS (Reemplaza a Integrador)

### CAMBIOS REQUERIDOS EN EL FRONTEND

1. **Buscar y reemplazar todas las referencias de "integrador" por "recursos"**
   - Variables, funciones, componentes, rutas, etc.

2. **Actualizar el endpoint**:
   ```typescript
   // ANTES (ELIMINAR)
   endpoint: '/chat/integrador-frontend'
   
   // DESPUÉS (USAR)
   endpoint: '/chat/recursos-frontend'
   ```

3. **Actualizar el mensaje de ayuda al usuario**:
   ```typescript
   const mensajeAyuda = `Para generar un recurso, necesito que me brindes los siguientes datos:
   • Grado (ej: 12th, kinder)
   • Área (ej: Matemática, Literature & Vocabulary)
   • Unidad (ej: unidad 4, quarter 3)
   • Tipo de recurso: evaluación, hoja de trabajo, presentación.
   • [Opcional] Observaciones adicionales
   
   Ejemplo:
   "Genera una hoja de trabajo para la semana 4 unidad 2 de matemática de 2nd con diez ejercicios de aplicaciones prácticas"`;
   ```

4. **Manejar múltiples tipos de archivo**:
   ```typescript
   // Recursos puede retornar PDF, DOCX, PPTX, XLSX, MP4, JPG, PNG, ZIP
   // El backend retorna el contentType correcto
   
   const tiposPermitidos = [
     'application/pdf',
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
     'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PPTX
     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
     'video/mp4',
     'image/jpeg',
     'image/png',
     'application/zip',
   ];
   ```

### REQUEST BODY (Recursos)
```typescript
{
  "usuario": "diego.morales@ameritec.edu.gt",
  "pregunta": "Genera una evaluación de la unidad 3 de matemática de 5th grade"
}
```

### RESPONSE SUCCESS (Recursos)
```typescript
{
  "success": true,
  "data": "JVBERi0xLjQKJeLjz9MK...",  // Base64 del archivo
  "filename": "recurso_pdf_2025-12-16T10-30-45.pdf",
  "contentType": "application/pdf"
}
```

### RESPONSE ERROR (Recursos)
```typescript
{
  "statusCode": 422,
  "message": "No se pudo generar el recurso solicitado. Verifique los datos ingresados (grado, área, unidad, tipo de recurso)."
}
```

---

## 🎯 MÓDULO 2: GESTIÓN (Carga de Archivos Excel)

### FUNCIONALIDAD COMPLETAMENTE NUEVA

#### Flujo del Usuario:
1. El frontend muestra un **input de tipo file** que acepta `.xlsx` o `.xls`
2. El usuario selecciona un archivo Excel
3. El frontend convierte el archivo a **Base64**
4. Envía al backend: `usuario`, `filename`, `file_base64`
5. El backend procesa y responde:
   - **Status 200**: Archivo procesado exitosamente (retorna JSON con mensaje)
   - **Status 400**: Hay errores de validación (retorna Excel con los errores para descargar)

### REQUEST BODY (Gestión)
```typescript
{
  "usuario": "diego.morales@ameritec.edu.gt",
  "filename": "plan_12th_matematica.xlsx",
  "file_base64": "UEsDBBQABgAIAAAAIQD..."  // Base64 completo del Excel
}
```

### RESPONSE SUCCESS (Status 200)
```typescript
{
  "success": true,
  "message": "Archivo procesado exitosamente"
}
```

### RESPONSE ERROR (Status 400 - Errores de Validación)
```typescript
{
  "success": false,
  "error": "VALIDATION_ERRORS",
  "message": "Error: La columna 'Grado' es requerida en la fila 5"  // Mensaje del body del Lambda
}
```

---

## 📝 TEXTOS ESPECÍFICOS PARA CADA MÓDULO

### PLANIFICADOR - Mensaje de Ayuda

```
Para generar una planificación, necesito que me brindes los siguientes datos:

• Grado (ej: 12th, kinder)
• Área (ej: matematica, literature / vocabulary)
• Unidad (ej: unidad 4, quarter 3)
• Semana (ej: semana 2, week 8)
• [Opcional] Observaciones adicionales

Ejemplo:
"Genera la planificación de la semana 2 unidad 4 para física fundamental de 12th [cerrando con una prueba corta]"
```

### RECURSOS - Mensaje de Ayuda

```
Para generar un recurso, necesito que me brindes los siguientes datos:

• Grado (ej: 12th, kinder)
• Área (ej: Matemática, Literature & Vocabulary)
• Unidad (ej: unidad 4, quarter 3)
• Semana (ej: semana 2, week 8)
• Clase (ej: clase 1, lesson 3)
• Tipo de recurso (ej: evaluacion, quiz, ejercitacion, worksheet, presentacion, lecture)
• [Opcional] Observaciones adicionales

Ejemplo:
"Genera una hoja de trabajo para la clase 1 de semana 4 unidad 2 de matemática de 2nd [con diez ejercicios de aplicaciones prácticas]"
```

### GESTIÓN - Mensaje de Ayuda

```
Para procesar un archivo, asegúrate de cargarlo con el formato de nombre correspondiente:

• Planificación (ej: plan_12th_matematica.xlsx)
• Plantillas de clase (ej: mentora_plantillas_planificacion.xlsx)
• Pénsum (ej: mentora_pensum.xlsx)

Ejemplo:
Carga tu archivo y presiona 'Enviar archivo Excel'.
```

---

## 🔄 LÓGICA DE RESPUESTAS POR MÓDULO (BACKEND YA IMPLEMENTADO)

### PLANIFICADOR

**Status 200:**
- Backend genera archivo Excel desde Base64
- Frontend descarga el archivo

**Status 400:**
- Backend retorna mensaje de error en el body
- Frontend muestra el mensaje de error

### RECURSOS

**Status 200:**
- Backend genera archivo (DOCX, PPTX, XLSX, PDF, ZIP, etc.) desde Base64
- Frontend descarga el archivo con el tipo correcto

**Status 400:**
- Backend retorna mensaje de error en el body
- Frontend muestra el mensaje de error

### GESTIÓN

**Status 200:**
- Backend retorna mensaje de éxito en el body
- Frontend muestra el mensaje de éxito

**Status 400:**
- Backend retorna mensaje de error en el body
- Frontend muestra el mensaje de error

---

## 🔧 VALIDACIONES EN EL FRONTEND

### VALIDACIONES PARA TODOS LOS ENDPOINTS

```typescript
// 1. Validar longitud de pregunta (10-500 caracteres)
const validatePregunta = (pregunta: string): { valid: boolean; error?: string } => {
  if (!pregunta || pregunta.trim().length === 0) {
    return { valid: false, error: 'La pregunta no puede estar vacía' };
  }
  if (pregunta.trim().length < 10) {
    return { valid: false, error: 'La pregunta debe tener al menos 10 caracteres' };
  }
  if (pregunta.trim().length > 500) {
    return { valid: false, error: 'La pregunta no debe exceder 500 caracteres' };
  }
  return { valid: true };
};

// 2. Validar email de usuario
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
```

### VALIDACIONES ESPECÍFICAS PARA GESTIÓN

```typescript
// 1. Validar tamaño de archivo (máximo 10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// 2. Validar extensión de archivo
const ALLOWED_EXTENSIONS = /\.(xlsx|xls)$/i;

// 3. Validar nombre de archivo (longitud máxima 255 caracteres)
const MAX_FILENAME_LENGTH = 255;
```

---

## 🎨 MANEJO DE ERRORES MEJORADO

### CÓDIGOS DE ERROR DEL BACKEND

```typescript
// Tipos de error que puede retornar el backend
type ErrorType = 
  | 'VALIDATION_ERROR'      // Pregunta inválida (longitud, formato)
  | 'INVALID_QUESTION'      // Lambda no pudo generar el documento
  | 'TIMEOUT_ERROR'         // Timeout de 30 segundos excedido
  | 'API_ERROR'             // Error de comunicación con Lambda
  | 'INTERNAL_ERROR'        // Error interno del servidor
  | 'FILE_TOO_LARGE'        // Archivo excede tamaño máximo
  | 'INVALID_MIME_TYPE'     // Tipo de archivo no permitido (solo Recursos)
  | 'CORRUPTED_BASE64'      // Base64 inválido (solo Gestión)
  | 'INVALID_FILE_FORMAT'   // Archivo no es Excel válido (solo Gestión)
  | 'VALIDATION_ERRORS';    // Errores en el Excel (solo Gestión)
```

### MENSAJES DE ERROR AMIGABLES

```typescript
const ERROR_MESSAGES: Record<string, string> = {
  VALIDATION_ERROR: 'Por favor verifica que tu pregunta tenga entre 10 y 500 caracteres.',
  INVALID_QUESTION: 'No se pudo generar el documento. Verifica que incluyas toda la información necesaria.',
  TIMEOUT_ERROR: 'La solicitud está tardando más de lo esperado. Por favor intenta nuevamente.',
  API_ERROR: 'Hubo un problema al comunicarse con el servidor. Intenta nuevamente en unos momentos.',
  INTERNAL_ERROR: 'Ocurrió un error inesperado. Por favor contacta a soporte.',
  FILE_TOO_LARGE: 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB.',
  INVALID_MIME_TYPE: 'El tipo de archivo no está permitido.',
  CORRUPTED_BASE64: 'El archivo está corrupto. Por favor intenta con otro archivo.',
  INVALID_FILE_FORMAT: 'El archivo debe ser un Excel válido (.xlsx o .xls).',
  VALIDATION_ERRORS: 'Se encontraron errores en el archivo. Descarga el reporte para revisarlos.',
};
```

---

## 📦 FUNCIÓN REUTILIZABLE PARA DESCARGAR ARCHIVOS

```typescript
/**
 * Descarga un archivo desde base64
 * Funciona para todos los tipos de archivo (Excel, PDF, DOCX, PPTX, etc.)
 */
const downloadBase64File = (
  base64Data: string,
  filename: string,
  contentType: string
): void => {
  try {
    // Decodificar base64
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    // Crear blob
    const blob = new Blob([byteArray], { type: contentType });
    
    // Crear link de descarga
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('Error al descargar archivo:', error);
    throw new Error('No se pudo descargar el archivo');
  }
};
```

---

## 🔄 REFACTORIZACIÓN PASO A PASO

### PASO 1: Reemplazar referencias de "Integrador" por "Recursos"

```typescript
// Buscar en todo el proyecto:
// - Variables: integradorData, fetchIntegrador, etc.
// - Funciones: handleIntegradorSubmit, consultarIntegrador, etc.
// - Rutas: /integrador, /chat/integrador, etc.
// - Componentes: IntegradorForm, IntegradorPage, etc.
// - Textos UI: "Integrador" → "Recursos"

// REEMPLAZAR TODO POR:
// - recursosData, fetchRecursos
// - handleRecursosSubmit, consultarRecursos
// - /recursos, /chat/recursos
// - RecursosForm, RecursosPage
// - "Recursos"
```

### PASO 2: Actualizar llamadas a la API

```typescript
// ANTES (ELIMINAR)
const response = await fetch('/chat/integrador-frontend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usuario, pregunta }),
});

// DESPUÉS (USAR)
const response = await fetch('/chat/recursos-frontend', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ usuario, pregunta }),
});
```

### PASO 3: Implementar componente de Gestión

```typescript
// Crear o actualizar componente que permita:
// 1. Seleccionar archivo Excel (.xlsx, .xls)
// 2. Validar tamaño (máximo 10MB)
// 3. Convertir a Base64
// 4. Enviar al backend
// 5. Manejar respuesta:
//    - Success: Mostrar mensaje de éxito
//    - Error 400: Descargar Excel con errores
```

### PASO 4: Actualizar mensaje de ayuda para Recursos

```typescript
// Agregar este mensaje cuando el usuario seleccione Recursos
const mensajeRecursos = `📚 Para generar un recurso educativo, proporciona:

• Grado (ej: 12th, kinder, 5th grade)
• Área (ej: Matemática, Literature & Vocabulary, Science)
• Unidad (ej: unidad 4, quarter 3, semana 2)
• Tipo de recurso: evaluación, hoja de trabajo, presentación

Ejemplo:
"Genera una hoja de trabajo para la semana 4 unidad 2 de matemática de 2nd con diez ejercicios de aplicaciones prácticas"`;
```

### PASO 5: Manejar diferentes tipos de archivo en Recursos

```typescript
// Recursos puede retornar diferentes tipos de archivo
// Asegurarse de manejar correctamente el contentType

const handleRecursosResponse = (response: RecursosResponse) => {
  const { success, data, filename, contentType } = response;
  
  if (success) {
    // Descargar archivo con el tipo correcto
    downloadBase64File(data, filename, contentType);
    
    // Mostrar mensaje según el tipo
    const tipoArchivo = getFileTypeFromMime(contentType);
    showSuccess(`${tipoArchivo} generado exitosamente: ${filename}`);
  }
};

const getFileTypeFromMime = (mimeType: string): string => {
  const tipos: Record<string, string> = {
    'application/pdf': 'PDF',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Documento Word',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Presentación PowerPoint',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Hoja de cálculo Excel',
    'video/mp4': 'Video',
    'image/jpeg': 'Imagen',
    'image/png': 'Imagen',
    'application/zip': 'Archivo ZIP',
  };
  return tipos[mimeType] || 'Archivo';
};
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Módulo RECURSOS (reemplaza Integrador)
- [ ] Buscar y reemplazar todas las referencias de "integrador" → "recursos"
- [ ] Actualizar endpoint: `/chat/integrador-frontend` → `/chat/recursos-frontend`
- [ ] Actualizar mensaje de ayuda con el formato requerido
- [ ] Manejar múltiples tipos de archivo (PDF, DOCX, PPTX, XLSX, MP4, imágenes, ZIP)
- [ ] Validar pregunta (10-500 caracteres)
- [ ] Implementar función de descarga para diferentes tipos MIME
- [ ] Actualizar textos UI: "Integrador" → "Recursos"
- [ ] Actualizar rutas de navegación
- [ ] Probar con diferentes tipos de recursos

### Módulo GESTIÓN (nuevo)
- [ ] Crear componente con input de archivo (`<input type="file" accept=".xlsx,.xls">`)
- [ ] Implementar validación de tamaño (máximo 10MB)
- [ ] Implementar validación de extensión (.xlsx, .xls)
- [ ] Implementar conversión de archivo a Base64
- [ ] Implementar llamada al endpoint `/chat/gestion-frontend`
- [ ] Manejar respuesta exitosa (status 200): Mostrar mensaje
- [ ] Manejar respuesta con errores (status 400): Descargar Excel con errores
- [ ] Mostrar loading mientras se procesa el archivo
- [ ] Implementar manejo de errores (archivo corrupto, demasiado grande, etc.)
- [ ] Agregar instrucciones claras para el usuario
- [ ] Probar con archivos válidos e inválidos

### Validaciones Generales
- [ ] Implementar validación de pregunta (10-500 caracteres) en todos los módulos
- [ ] Implementar validación de email de usuario
- [ ] Mostrar mensajes de error amigables según el tipo de error
- [ ] Implementar loading states en todos los endpoints
- [ ] Implementar timeout visual (30 segundos)

### Testing
- [ ] Probar Recursos con diferentes tipos de pregunta
- [ ] Probar Recursos verificando que descargue el tipo de archivo correcto
- [ ] Probar Gestión con archivo Excel válido → debe mostrar éxito
- [ ] Probar Gestión con archivo Excel con errores → debe descargar Excel con errores
- [ ] Probar Gestión con archivo >10MB → debe mostrar error
- [ ] Probar Gestión con archivo no-Excel → debe mostrar error
- [ ] Probar validación de pregunta con <10 caracteres
- [ ] Probar validación de pregunta con >500 caracteres
- [ ] Verificar que todos los módulos existentes sigan funcionando

---

## 🚨 ERRORES COMUNES A EVITAR

1. ❌ **NO crear archivos con sufijos `.refactored`, `.backup`, `.new`**
   - ✅ Modificar directamente los archivos existentes

2. ❌ **NO dejar referencias a "integrador" en ningún lugar**
   - ✅ Buscar globalmente y reemplazar todas las referencias

3. ❌ **NO olvidar manejar el Base64 correctamente en Gestión**
   - ✅ Usar `FileReader` con `readAsDataURL` y remover el prefijo `data:*/*;base64,`

4. ❌ **NO asumir que Recursos siempre retorna Excel**
   - ✅ Manejar múltiples tipos MIME (PDF, DOCX, PPTX, etc.)

5. ❌ **NO olvidar validar el tamaño de archivo antes de enviar**
   - ✅ Validar en el frontend antes de convertir a Base64

6. ❌ **NO mostrar errores técnicos al usuario**
   - ✅ Usar mensajes amigables según el tipo de error

7. ❌ **NO olvidar limpiar el input de archivo después de procesar**
   - ✅ Resetear el input para permitir subir el mismo archivo nuevamente

---

## 📱 EJEMPLO COMPLETO DE COMPONENTE GESTIÓN (React/TypeScript)

```typescript
import React, { useState } from 'react';

interface GestionResponse {
  success: boolean;
  message?: string;
  filename?: string;
  data?: string;
  contentType?: string;
}

export const GestionComponent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userEmail = 'usuario@ameritec.edu.gt'; // Obtener del contexto/auth

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validar extensión
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setError('Solo se permiten archivos Excel (.xlsx o .xls)');
      return;
    }

    // Validar tamaño (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo no debe superar 10MB');
      return;
    }

    // Validar nombre (255 caracteres)
    if (file.name.length > 255) {
      setError('El nombre del archivo es demasiado largo');
      return;
    }

    setLoading(true);

    try {
      // Convertir a Base64
      const base64 = await fileToBase64(file);

      // Enviar al backend
      const response = await fetch('/chat/gestion-frontend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: userEmail,
          filename: file.name,
          file_base64: base64,
        }),
      });

      const data: GestionResponse = await response.json();

      if (data.success) {
        alert(`✅ ${data.message || 'Archivo procesado exitosamente'}`);
        // Limpiar input
        event.target.value = '';
      } else {
        // Descargar Excel con errores
        if (data.data && data.filename) {
          downloadBase64File(data.data, data.filename, data.contentType!);
          alert('⚠️ Se encontraron errores. Descarga el archivo para revisarlos.');
        }
        event.target.value = '';
      }
    } catch (error) {
      setError('Error al procesar el archivo. Intenta nuevamente.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // Remover prefijo
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const downloadBase64File = (base64: string, filename: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="gestion-container">
      <h2>📊 Gestión de Archivos</h2>
      <p>Sube un archivo Excel para procesar:</p>
      
      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        disabled={loading}
        style={{ marginTop: '1rem' }}
      />
      
      {loading && <p>⏳ Procesando archivo...</p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
      
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        <p>📌 Requisitos:</p>
        <ul>
          <li>Formato: .xlsx o .xls</li>
          <li>Tamaño máximo: 10MB</li>
          <li>El archivo será validado y procesado</li>
        </ul>
      </div>
    </div>
  );
};
```

---

## 🎯 RESUMEN EJECUTIVO

### ACCIONES PRINCIPALES

1. **REEMPLAZAR "Integrador" → "Recursos"**
   - Endpoint: `/chat/recursos-frontend`
   - Manejar múltiples tipos de archivo
   - Actualizar mensaje de ayuda

2. **IMPLEMENTAR "Gestión"**
   - Input de archivo Excel
   - Conversión a Base64
   - Endpoint: `/chat/gestion-frontend`
   - Manejar status 200 (éxito) y 400 (errores)

3. **AGREGAR VALIDACIONES**
   - Pregunta: 10-500 caracteres
   - Archivo: máximo 10MB, solo .xlsx/.xls
   - Email: formato válido

4. **MEJORAR UX**
   - Mensajes de error amigables
   - Loading states
   - Instrucciones claras

### ENDPOINTS A USAR

```
✅ /chat/recursos-frontend  (POST)
✅ /chat/gestion-frontend   (POST)
```

### NO OLVIDES

- ❌ NO crear archivos `.refactored` o `.backup`
- ✅ Modificar archivos existentes directamente
- ✅ Buscar y reemplazar TODAS las referencias de "integrador"
- ✅ Probar con archivos reales antes de dar por terminado

---

**Deadline: December 16, 2025 ✅**  
**Prioridad: ALTA 🔴**
