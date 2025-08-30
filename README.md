# 🚀 Voting & Polls API

Un backend donde los usuarios pueden crear encuestas, votar en ellas y ver los resultados en tiempo real.

## 📌 Funcionalidades principales

### Autenticación de usuarios

- Registro, login y JWT para sesiones seguras
- Roles: user y admin (admin puede eliminar encuestas, moderar)

### Gestión de encuestas

- Crear encuestas con múltiples opciones de respuesta
- Definir fecha de inicio y fin de la votación
- Estado: activa / cerrada

### Votaciones

- Cada usuario puede votar solo una vez por encuesta
- Validación para evitar votos duplicados

### Resultados

- Consultar resultados en tiempo real (total de votos por opción)
- Porcentaje de cada opción

### Administración

- El admin puede cerrar encuestas antes de tiempo
- El admin puede eliminar encuestas

## ⚙️ Stack Tecnológico

- **Backend**: Node.js + Express + TypeScript
- **Base de datos**: MongoDB (con Mongoose)
- **Autenticación**: JWT + bcrypt para password hashing
- **Testing**: Jest + Supertest
- **Documentación**: Swagger o Redoc
- **Extras**: WebSockets para resultados en tiempo real 🚀

## 🚀 Instalación y uso

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Construir proyecto
npm run build

# Ejecutar en producción
npm start

# Ejecutar tests
npm test
```

## 📁 Estructura del proyecto

```
polls-api/
├── src/
│   ├── controllers/     # Controladores de rutas
│   ├── models/         # Modelos de MongoDB
│   ├── routes/         # Definición de rutas
│   ├── middlewares/    # Middlewares personalizados
│   ├── services/       # Lógica de negocio
│   ├── utils/          # Utilidades
│   ├── app.ts          # Configuración de Express
│   └── server.ts       # Punto de entrada
├── tests/              # Tests
├── package.json
├── tsconfig.json
└── README.md
```
