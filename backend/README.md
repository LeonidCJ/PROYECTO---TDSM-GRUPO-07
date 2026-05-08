# Backend

Backend del proyecto **"Diseño y evaluación de una aplicación móvil con deep learning para el apoyo a la detección y clasificación de lesiones asociadas al cáncer de vejiga en imágenes endoscópicas"**.

Este backend está montado con:

- Django 5.2 LTS
- Django REST Framework
- PostgreSQL
- Docker y Docker Compose
- Arquitectura monolítica modular

## Estructura general

- `src/config`: configuración principal del proyecto Django
- `src/apps/authentication`: módulo de autenticación

## Requisitos

Para trabajar con este backend necesitas:

- Docker
- Docker Compose

No es necesario crear un entorno virtual local si vas a usar solo Docker.

## Configuración inicial

1. Entra a la carpeta `backend`.
2. Copia el archivo de ejemplo de variables de entorno:

```bash
cp .env.example .env
```

3. Si necesitas cambiar credenciales o nombre de base de datos, edita el archivo `.env`.

## Levantar el backend

Para construir las imágenes y levantar los servicios:

```bash
docker compose up --build
```

La API quedará disponible en:

```bash
http://localhost:8000
```

## Migraciones

En este proyecto el contenedor del backend ejecuta las migraciones al iniciar, pero si creas o modificas modelos debes generar y aplicar las migraciones manualmente. Asegúrate de tener los contenedores levantados (`docker compose up -d`).

Crear archivos de migración:

```bash
docker compose exec backend python manage.py makemigrations
```

Aplicar migraciones:

```bash
docker compose exec backend python manage.py migrate
```

## Crear superusuario

Si necesitas entrar al panel de administración:

```bash
docker compose run --rm backend python manage.py createsuperuser
```

## Panel de administración

Una vez levantado el backend, puedes entrar a:

```bash
http://localhost:8000/admin/
```

## Comandos útiles

Detener los servicios:

```bash
docker compose down
```

Detener servicios y borrar el volumen de Postgres:

```bash
docker compose down -v
```

Ver logs:

```bash
docker compose logs -f
```

## Observaciones

- Las imágenes médicas grandes no deben guardarse directamente en Postgres; es mejor guardar rutas y metadatos.
- Este primer paso deja listo el proyecto base para ir agregando más módulos como pacientes, inferencia y reportes.
