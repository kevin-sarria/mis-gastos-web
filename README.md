# Mis Gastos

Aplicación web responsive de gestión de finanzas personales, pensada para personas no técnicas y para uso a largo plazo.

## Stack

- **Frontend:** React + Vite + TypeScript, shadcn/ui + Tailwind CSS, React Router, TanStack Query, React Hook Form + Zod.
- **Backend:** Node.js + Express + TypeScript, Zod.
- **Base de datos:** MySQL/MariaDB + Prisma.

## Estructura

- `frontend/` — SPA organizada por features (Screaming Architecture).
- `backend/` — API MVC modular (routes → controllers → services → repositories).

## Requisitos

- Node.js >= 20
- npm
- XAMPP con MySQL/MariaDB iniciado (Apache no es necesario)

## Puesta en marcha (desarrollo)

```bash
# 1. Instalar dependencias de ambos proyectos
npm run install:all

# 2. Inicia MySQL desde el panel de control de XAMPP (botón "Start" en MySQL)

# 3. Copiar .env.example → .env en backend/ y frontend/ y ajustar valores.
#    DATABASE_URL usa por defecto root sin contraseña de XAMPP.

# 4. Crear/migrar el esquema y sembrar datos base
npm run db:migrate
npm run db:seed

# 5. Arrancar ambos servidores (en dos terminales)
npm run dev:backend
npm run dev:frontend
```

## Fases de desarrollo

1. Scaffolding, tooling, tema claro/oscuro y layout base.
2. Autenticación (email/contraseña, Google OAuth, recuperación).
3. Ingresos y gastos con carga de facturas.
4. Presupuestos, alertas, dashboard e insights.
