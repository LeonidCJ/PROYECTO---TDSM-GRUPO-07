# API — Servidor de Inferencia (Detección de Cáncer en Tomografías)

Referencia de la API para integrar el servidor de inferencia desde el backend.

El servicio recibe una imagen de tomografía y la clasifica en **una de cuatro
categorías clínicas** con un modelo ONNX. Devuelve la clase detectada, la
confianza del modelo y un indicador de si esa clase corresponde a cáncer.

Las cuatro categorías son:

| `label` | Nombre                                    | ¿Es cáncer? |
| ------- | ----------------------------------------- | ----------- |
| `HGC`   | High Grade Cancer (cáncer de alto grado)  | Sí          |
| `LGC`   | Low Grade Cancer (cáncer de bajo grado)   | Sí          |
| `NTL`   | Non-Tumor Lesion (lesión no tumoral)      | No          |
| `NST`   | Normal Surrounding Tissue (tejido normal) | No          |

---

## Base URL

| Entorno | URL |
| ------- | --- |
| **Producción (Render)** | `https://servidor-inferencia.onrender.com` |
| Local | `http://127.0.0.1:8000` |

> **CORS abierto** (`Access-Control-Allow-Origin: *`): el backend puede llamar a
> la API desde cualquier origen sin configuración adicional.

---

## Endpoints

### `GET /` — Healthcheck

Verifica que el servidor esté vivo (útil para monitoreo).

**Respuesta `200`:**

```json
{ "status": "ok", "message": "Inference server running" }
```

---

### `POST /predict` — Predicción

Endpoint principal. Recibe una imagen y devuelve la predicción del modelo.

- **Content-Type:** `multipart/form-data`
- **Campo requerido:** `file` → archivo de imagen (PNG, JPG, etc.).

Se envía la imagen **tal cual**; el servidor la redimensiona a 224×224 y la
normaliza internamente. **No** hay que preprocesar nada del lado del backend.

**Respuesta `200` (éxito):**

```json
{
  "has_cancer": false,
  "confidence": 0.7454,
  "label": "NTL"
}
```

| Campo        | Tipo     | Descripción                                                              |
| ------------ | -------- | ----------------------------------------------------------------------- |
| `label`      | `string` | Clase predicha: una de `"HGC"`, `"LGC"`, `"NTL"` o `"NST"`.              |
| `has_cancer` | `bool`   | `true` si `label` es `"HGC"` o `"LGC"`; `false` para `"NTL"` y `"NST"`.  |
| `confidence` | `float`  | Confianza de la **clase predicha** (softmax), redondeada a 4 decimales. |

> ⚠️ **Importante para la integración:** `confidence` es la confianza de la clase
> predicha (`label`), **no** la probabilidad de cáncer. En el ejemplo de arriba el
> modelo predice `NTL` con 74.5% de confianza, por eso `has_cancer` es `false`
> aunque la confianza sea ≥ 0.5. No deduzcas `has_cancer` desde `confidence`: usa
> siempre el campo `has_cancer` (o el `label`) que devuelve la API.

---

## Errores

| Código | Significado                                                  | Formato de `detail`                       |
| ------ | ----------------------------------------------------------- | ----------------------------------------- |
| `400`  | La imagen es inválida o está corrupta                       | `string` — `{ "detail": "<mensaje>" }`    |
| `422`  | Falta el campo `file` o el `multipart/form-data` es inválido | `array` — ver abajo                        |
| `503`  | El modelo ONNX no está cargado en el servidor               | `string` — `{ "detail": "<mensaje>" }`    |
| `500`  | Error al ejecutar la inferencia o al interpretar la salida  | `string` — `{ "detail": "<mensaje>" }`    |

> **Ojo con el `422` (validación de FastAPI):** a diferencia de los demás errores,
> su `detail` es un **array** de objetos, no un string. El backend debe manejar
> ambos formatos:

```json
// 400 / 500 / 503 → detail es string
{ "detail": "La imagen no es válida o está corrupta: ..." }

// 422 → detail es array
{ "detail": [ { "type": "missing", "loc": ["body", "file"], "msg": "Field required", "input": null } ] }
```

---

## Ejemplos de consumo

### Node.js (18+) — `fetch` + `FormData`

```js
const fd = new FormData();
fd.append("file", fileBlob, "tomografia.png"); // Blob/File (o Buffer en Node)

const res = await fetch("https://servidor-inferencia.onrender.com/predict", {
  method: "POST",
  body: fd,
});

if (!res.ok) {
  const { detail } = await res.json();
  throw new Error(`Error ${res.status}: ${detail}`);
}

const data = await res.json(); // { has_cancer, confidence, label }
console.log(data);
```

### Python — `requests`

```python
import requests

with open("tomografia.png", "rb") as f:
    res = requests.post(
        "https://servidor-inferencia.onrender.com/predict",
        files={"file": f},
    )

res.raise_for_status()
print(res.json())  # { 'has_cancer': ..., 'confidence': ..., 'label': ... }
```

### curl

```bash
curl -X POST "https://servidor-inferencia.onrender.com/predict" \
  -F "file=@tomografia.png"
```

---

## Documentación auto-generada

FastAPI expone la especificación automáticamente:

- **Swagger UI (interactivo):** <https://servidor-inferencia.onrender.com/docs>
  — permite probar `/predict` subiendo imágenes desde el navegador.
- **OpenAPI JSON:** <https://servidor-inferencia.onrender.com/openapi.json>
  — importable en Postman / Insomnia o para generar un cliente automáticamente.

---

## Estado actual

El servidor está **online y el modelo ONNX está cargado**: `POST /predict`
devuelve predicciones reales (`200`). El healthcheck `GET /` responde `200`.

> Nota: Render puede suspender el servicio por inactividad en el plan gratuito; la
> primera petición tras un periodo de inactividad puede tardar varios segundos
> (cold start). Conviene usar timeouts holgados en el backend.

---

## Nota sobre el preprocesamiento

El servidor asume el siguiente preprocesamiento: conversión a RGB, redimensionado
a **224×224**, normalización dividiendo entre **255.0**, orden de canales **CHW**
y dimensión de batch `(1, 3, 224, 224)`. La salida se interpreta como **softmax
de 4 clases** (`HGC`, `LGC`, `NTL`, `NST`); se devuelve la clase de mayor
probabilidad como `label` y su probabilidad como `confidence`.
