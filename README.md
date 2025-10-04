# CMedicas - Sistema de Gestión de Citas Médicas

Sistema integral de gestión de citas médicas desarrollado con React, TypeScript y Supabase, aplicando principios de HCI (Human-Computer Interaction) y diseño centrado en el usuario.

## 🏥 Características Principales

### ✨ Funcionalidades Core
- **Registro de Pacientes**: Sistema completo para registrar y gestionar pacientes
- **Gestión de Médicos**: Administración de perfiles médicos con especialidades
- **Gestión de Citas**: Sistema de agendamiento con validación de disponibilidad
- **Dashboard Inteligente**: Métricas y estadísticas en tiempo real
- **Reportes Avanzados**: Visualizaciones con gráficos de barras y circulares
- **Base de Datos en la Nube**: Supabase (PostgreSQL) con Row Level Security

### ♿ Accesibilidad y Usabilidad
- **Panel de Accesibilidad**: Configuraciones personalizables (contraste, tamaño de fuente, movimiento)
- **Navegación por Teclado**: Soporte completo para usuarios con discapacidades motoras
- **Lectores de Pantalla**: Optimizado para NVDA, JAWS y VoiceOver
- **Diseño Responsive**: Adaptación completa a móviles, tablets y desktop
- **Cumplimiento WCAG 2.1 AA**: Estándares internacionales de accesibilidad

### 🎨 Principios de HCI Aplicados
- **Visibilidad del Estado**: Feedback constante al usuario
- **Correspondencia con el Mundo Real**: Terminología médica familiar
- **Control del Usuario**: Navegación reversible y cancelación de acciones
- **Consistencia**: Patrones de diseño uniformes
- **Prevención de Errores**: Validaciones y confirmaciones

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **Lucide React** para iconografía
- **Vite** como bundler
- **Context API** para gestión de estado

### Backend
- **Supabase** (PostgreSQL en la nube)
- **Row Level Security (RLS)** para control de acceso
- **@supabase/supabase-js** cliente oficial
- **Edge Functions** para lógica del lado del servidor (opcional)

### Base de Datos
- **PostgreSQL** a través de Supabase
- **3 Tablas Principales**: usuarios, médicos, citas
- **15 Políticas RLS** para seguridad
- **8 Índices** para optimización de consultas

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Cuenta de Supabase (gratuita)

### Instalación

```bash
# Clonar el repositorio
git clone [repository-url]
cd cmedicas

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env en la raíz con:
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Configuración de Supabase

1. **Crear Proyecto en Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Copia la URL y la clave anónima

2. **Ejecutar Migración**
   - La migración se encuentra en `supabase/migrations/`
   - La base de datos se crea automáticamente al iniciar la app
   - Incluye 3 tablas, RLS y políticas de seguridad

3. **Datos de Ejemplo**
   - 10 usuarios: 5 médicos + 5 pacientes
   - 5 perfiles de médicos con especialidades
   - 5 citas de ejemplo (programadas y completadas)

### Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev

# La aplicación se abrirá en http://localhost:5173
```

### Producción

```bash
# Construir aplicación
npm run build

# Preview de producción
npm run preview
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

#### 1. Tabla `usuarios`
Almacena todos los usuarios del sistema (pacientes, médicos, personal administrativo).

**Campos:**
- `id` (uuid, PK): Identificador único
- `nombre` (text): Nombre completo
- `email` (text, UNIQUE): Correo electrónico
- `password_hash` (text): Contraseña hasheada
- `fecha_nacimiento` (date): Fecha de nacimiento
- `direccion` (text): Dirección física
- `telefono` (text): Teléfono principal
- `telefono_emergencia` (text): Contacto de emergencia
- `sexo` (text): masculino, femenino, otro
- `discapacidad` (text): Información de discapacidad
- `estado_civil` (text): soltero, casado, divorciado, viudo, union_libre
- `rol` (text): administrador, medico_especialista, enfermero, paciente, etc.
- `departamento` (text): Departamento de trabajo
- `activo` (boolean): Estado de cuenta
- `fecha_registro` (timestamptz): Fecha de registro

**Roles Disponibles:**
- administrador
- medico_especialista
- enfermero
- auxiliar_enfermeria
- pasante
- paramedico
- paciente
- seguridad
- persona_vulnerable

#### 2. Tabla `medicos`
Perfil extendido para profesionales médicos.

**Campos:**
- `id` (uuid, PK): Identificador único
- `usuario_id` (uuid, FK): Referencia a usuarios
- `especialidad` (text): Especialidad médica
- `cedula` (text, UNIQUE): Cédula profesional
- `experiencia_anos` (integer): Años de experiencia
- `horario_atencion` (jsonb): Horario en formato JSON
- `consultorio` (text): Número de consultorio
- `calificacion` (numeric): Calificación 0-5
- `total_consultas` (integer): Total de consultas
- `activo` (boolean): Estado activo
- `fecha_registro` (timestamptz): Fecha de registro

**Especialidades:**
- Cardiología, Neurología, Pediatría, Dermatología
- Traumatología, Oftalmología, Psiquiatría
- Ginecología, Endocrinología, Urología, Oncología

#### 3. Tabla `citas`
Gestión de citas médicas.

**Campos:**
- `id` (uuid, PK): Identificador único
- `paciente_id` (uuid, FK): ID del paciente
- `medico_id` (uuid, FK): ID del médico
- `fecha` (date): Fecha de la cita
- `hora` (time): Hora de la cita
- `especialidad` (text): Especialidad médica
- `estado` (text): programada, completada, cancelada, no_asistio
- `motivo` (text): Motivo de consulta
- `observaciones` (text): Notas adicionales
- `fecha_creacion` (timestamptz): Fecha de creación
- `fecha_actualizacion` (timestamptz): Última actualización

### Relaciones

```
usuarios (1) ←──── (1) medicos
    ↓
    └─→ (N) citas ←──── medicos (1)
```

**Relación 1:** usuarios → medicos (1:1)
- Cada médico es un usuario
- ON DELETE CASCADE

**Relación 2:** usuarios → citas (1:N)
- Un paciente puede tener múltiples citas
- ON DELETE CASCADE

**Relación 3:** medicos → citas (1:N)
- Un médico puede tener múltiples citas
- ON DELETE CASCADE

### Seguridad: Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas específicas:

**Usuarios:**
- Los usuarios pueden ver su propio perfil
- Los administradores ven todos los usuarios
- Registro público permitido

**Médicos:**
- Usuarios autenticados ven médicos activos
- Médicos ven su propio perfil
- Administradores tienen acceso completo

**Citas:**
- Pacientes ven sus propias citas
- Médicos ven citas asignadas a ellos
- Administradores ven todas las citas
- Solo administradores pueden eliminar citas

## 🎯 Servicios de Base de Datos

### `usuariosService`
```typescript
- getAll(): Promise<Usuario[]>
- getById(id): Promise<Usuario | null>
- getByEmail(email): Promise<Usuario | null>
- getByRole(rol): Promise<Usuario[]>
- create(usuario): Promise<Usuario>
- update(id, updates): Promise<Usuario>
- delete(id): Promise<void>
```

### `medicosService`
```typescript
- getAll(): Promise<MedicoConUsuario[]>
- getById(id): Promise<MedicoConUsuario | null>
- getByUsuarioId(usuarioId): Promise<MedicoConUsuario | null>
- getByEspecialidad(especialidad): Promise<MedicoConUsuario[]>
- create(medico): Promise<MedicoConUsuario>
- update(id, updates): Promise<MedicoConUsuario>
- delete(id): Promise<void>
```

### `citasService`
```typescript
- getAll(): Promise<CitaDetallada[]>
- getById(id): Promise<CitaDetallada | null>
- getByPaciente(pacienteId): Promise<CitaDetallada[]>
- getByMedico(medicoId): Promise<CitaDetallada[]>
- getByFecha(fecha): Promise<CitaDetallada[]>
- getByEstado(estado): Promise<CitaDetallada[]>
- create(cita): Promise<CitaDetallada>
- update(id, updates): Promise<CitaDetallada>
- delete(id): Promise<void>
```

### `estadisticasService`
```typescript
- getCitasPorEspecialidad(): Promise<Array>
- getCitasPorEstado(): Promise<Record>
- getTotalPacientesActivos(): Promise<number>
- getTotalCitas(): Promise<number>
```

## 🎨 Características de Diseño

### Sistema de Colores
- **Primario**: Azul médico (#3B82F6)
- **Secundario**: Verde salud (#10B981)
- **Acentos**: Naranja (#F59E0B), Rojo (#EF4444)
- **Neutros**: Escala de grises completa
- **Alto Contraste**: Modo alternativo para accesibilidad

### Tipografía
- **Fuente**: System fonts (Inter, SF Pro, Segoe UI)
- **Escalas**: 4 tamaños configurables
- **Pesos**: Regular (400), Medium (500), Semibold (600), Bold (700)
- **Line Height**: 150% para cuerpo, 120% para títulos

### Componentes
- **Botones**: Estados hover, focus, disabled
- **Formularios**: Validación en tiempo real
- **Modales**: Responsive con escape key
- **Tablas**: Scrollables con sticky headers
- **Cards**: Sombras sutiles y hover effects

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Adaptaciones
- **Sidebar**: Colapsible en móvil
- **Tablas**: Scroll horizontal
- **Formularios**: Stack vertical en móvil
- **Modales**: Full screen en móvil

## 🧪 Testing y Calidad

### Validaciones Implementadas
- **Formularios**: Validación client-side y server-side
- **Fechas**: Validación de rangos y disponibilidad
- **Emails**: Formato y unicidad
- **Datos**: Check constraints en base de datos

### Manejo de Errores
- **Frontend**: Mensajes claros y estados de error
- **Backend**: RLS automático y respuestas consistentes
- **Base de Datos**: Constraints y validaciones

## 🔧 Estructura del Proyecto

```
cmedicas/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Accessibility/   # Panel de accesibilidad
│   │   ├── AppointmentManagement/
│   │   ├── Auth/           # Login y registro
│   │   ├── Dashboard/      # Panel principal
│   │   ├── DatabaseStatus/ # Estado de conexión
│   │   ├── DoctorManagement/
│   │   ├── Layout/         # Header y Sidebar
│   │   ├── Reports/        # Reportes y gráficos
│   │   └── UserManagement/ # Registro de pacientes
│   ├── contexts/           # Context providers
│   │   └── AuthContext.tsx
│   ├── lib/                # Configuración
│   │   └── supabase.ts     # Cliente Supabase
│   ├── services/           # Servicios de datos
│   │   └── database.ts     # CRUD completo
│   ├── types/              # Definiciones TypeScript
│   │   └── index.ts
│   └── utils/              # Utilidades
├── supabase/
│   └── migrations/         # Migraciones SQL
│       └── create_cmedicas_schema.sql
├── docs/                   # Documentación
│   ├── INFORME_PROYECTO_CMEDICAS.md
│   ├── DIAGRAMA_ENTIDAD_RELACION.md
│   ├── analisis-usuario.md
│   ├── diseno-interfaces.md
│   └── tipos-diseno.md
└── dist/                   # Build de producción
```

## 📈 Métricas y Dashboard

### Tarjetas Estadísticas
- **Total de Citas**: Con tendencia de crecimiento
- **Pacientes Activos**: Contador en tiempo real
- **Tasa de Asistencia**: Porcentaje de citas completadas
- **Tiempo Promedio**: Duración de consultas

### Visualizaciones
1. **Gráfico de Barras**: Citas por especialidad
2. **Gráfico Circular**: Distribución por estado
3. **Tendencia Mensual**: Evolución de citas
4. **Top Médicos**: Ranking de más solicitados
5. **Actividad Reciente**: Feed de eventos en tiempo real

## 🔐 Seguridad

### Medidas Implementadas
1. **Row Level Security (RLS)**: Control de acceso a nivel de fila
2. **Políticas Granulares**: 15 políticas específicas por operación
3. **Índices Optimizados**: 8 índices para rendimiento
4. **Foreign Keys**: Integridad referencial garantizada
5. **Check Constraints**: Validación de datos en BD
6. **Hash de Contraseñas**: Nunca se almacenan en texto plano

### Mejores Prácticas
- Usar siempre los servicios proporcionados
- Validar datos en frontend antes de enviar
- Manejar errores apropiadamente
- Verificar permisos antes de operaciones sensibles
- Usar `maybeSingle()` en lugar de `single()`

## 📄 Documentación Adicional

### Archivos Incluidos
- **INFORME_PROYECTO_CMEDICAS.md**: Informe completo del proyecto
- **DIAGRAMA_ENTIDAD_RELACION.md**: Diagrama ER visual detallado
- **DATABASE_README.md**: Guía de base de datos (si existe)
- **analisis-usuario.md**: Análisis de usuarios
- **diseno-interfaces.md**: Especificaciones de diseño
- **tipos-diseno.md**: Tipos de diseño aplicados

### Scripts SQL Útiles

**Verificar Totales:**
```sql
SELECT
  (SELECT COUNT(*) FROM usuarios) as total_usuarios,
  (SELECT COUNT(*) FROM medicos) as total_medicos,
  (SELECT COUNT(*) FROM citas) as total_citas;
```

**Listar Citas Completas:**
```sql
SELECT
  c.fecha, c.hora,
  p.nombre as paciente,
  d.nombre as doctor,
  c.especialidad, c.estado, c.motivo
FROM citas c
JOIN usuarios p ON c.paciente_id = p.id
JOIN medicos m ON c.medico_id = m.id
JOIN usuarios d ON m.usuario_id = d.id
ORDER BY c.fecha, c.hora;
```

## 🚀 Despliegue

### Build de Producción
```bash
npm run build
```

### Deploy a Netlify/Vercel
1. Conectar repositorio
2. Configurar variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Build command: `npm run build`
4. Publish directory: `dist`

## 🤝 Contribución

### Estándares de Código
- **ESLint**: Configuración estricta
- **TypeScript**: Tipado fuerte
- **Prettier**: Formateo automático (si configurado)
- **Commits**: Descriptivos y claros

## 📞 Soporte y Contacto

Para preguntas, sugerencias o reportar problemas:
- Crear un issue en el repositorio
- Consultar la documentación en `/docs`

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Créditos

Desarrollado como proyecto académico aplicando principios de HCI, diseño centrado en el usuario y mejores prácticas de desarrollo web para sistemas de salud.

---

**CMedicas** - Sistema de Gestión Médica con Enfoque en Accesibilidad, Seguridad y Usabilidad

**Versión:** 1.0.0
**Última Actualización:** Octubre 2025
**Base de Datos:** Supabase (PostgreSQL)
**Frontend:** React 18 + TypeScript + Vite
**Estilos:** Tailwind CSS
