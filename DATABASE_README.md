# CMedicas Database Documentation

## Overview

The CMedicas application uses Supabase as its PostgreSQL database backend. The database schema consists of three main tables that manage users, doctors, and medical appointments.

## Database Connection

The application is configured to connect to Supabase using environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

These are already configured in the `.env` file.

## Database Schema

### 1. Usuarios (Users)

Stores all user accounts in the system including patients, doctors, nurses, and administrators.

**Columns:**
- `id` (uuid) - Primary key, auto-generated
- `nombre` (text) - User's full name
- `email` (text) - Unique email address
- `password_hash` (text) - Hashed password
- `fecha_nacimiento` (date) - Date of birth
- `direccion` (text) - Physical address
- `telefono` (text) - Primary phone number
- `telefono_emergencia` (text, optional) - Emergency contact
- `sexo` (text) - Gender: 'masculino', 'femenino', 'otro'
- `discapacidad` (text, optional) - Disability information
- `estado_civil` (text) - Marital status
- `rol` (text) - User role in the system
- `departamento` (text, optional) - Department (for staff)
- `activo` (boolean) - Account status
- `fecha_registro` (timestamptz) - Registration date

**Available Roles:**
- administrador
- medico_especialista
- enfermero
- auxiliar_enfermeria
- pasante
- paramedico
- paciente
- seguridad
- persona_vulnerable

### 2. Médicos (Doctors)

Extended profile information for medical professionals.

**Columns:**
- `id` (uuid) - Primary key, auto-generated
- `usuario_id` (uuid) - Foreign key to usuarios table
- `especialidad` (text) - Medical specialty
- `cedula` (text) - Unique professional license number
- `experiencia_anos` (integer) - Years of experience
- `horario_atencion` (jsonb) - Work schedule in JSON format
- `consultorio` (text) - Office/room number
- `calificacion` (numeric) - Average rating (0-5)
- `total_consultas` (integer) - Total consultations count
- `activo` (boolean) - Active status
- `fecha_registro` (timestamptz) - Registration date

### 3. Citas (Appointments)

Medical appointments scheduled in the system.

**Columns:**
- `id` (uuid) - Primary key, auto-generated
- `paciente_id` (uuid) - Foreign key to usuarios table
- `medico_id` (uuid) - Foreign key to medicos table
- `fecha` (date) - Appointment date
- `hora` (time) - Appointment time
- `especialidad` (text) - Medical specialty
- `estado` (text) - Status: 'programada', 'completada', 'cancelada', 'no_asistio'
- `motivo` (text) - Reason for appointment
- `observaciones` (text, optional) - Additional notes
- `fecha_creacion` (timestamptz) - Created date
- `fecha_actualizacion` (timestamptz) - Last updated date

## Relationships

- `medicos.usuario_id` → `usuarios.id` (One-to-One)
- `citas.paciente_id` → `usuarios.id` (Many-to-One)
- `citas.medico_id` → `medicos.id` (Many-to-One)

## Security

All tables have Row Level Security (RLS) enabled with comprehensive policies:

### Usuarios Table Policies:
- Users can view and update their own profile
- Administrators can view and update all users
- Public registration is allowed (insert)

### Médicos Table Policies:
- Authenticated users can view active doctors
- Doctors can view and update their own profile
- Administrators have full access

### Citas Table Policies:
- Patients can view their own appointments
- Doctors can view appointments assigned to them
- Administrators can view all appointments
- Patients and staff can create appointments
- Only authorized users can update/delete appointments

## Usage

### Importing Services

```typescript
import { usuariosService, medicosService, citasService, estadisticasService } from './services/database';
```

### Example: Get All Users

```typescript
const usuarios = await usuariosService.getAll();
```

### Example: Create a Doctor

```typescript
// First create the user
const usuario = await usuariosService.create({
  nombre: 'Dr. Juan Pérez',
  email: 'juan.perez@example.com',
  password_hash: hashedPassword,
  rol: 'medico_especialista',
  // ... other fields
});

// Then create the doctor profile
const medico = await medicosService.create({
  usuario_id: usuario.id,
  especialidad: 'Cardiología',
  cedula: 'MED-12345',
  experiencia_anos: 10,
  // ... other fields
});
```

### Example: Create an Appointment

```typescript
const cita = await citasService.create({
  paciente_id: pacienteId,
  medico_id: medicoId,
  fecha: '2025-10-15',
  hora: '10:00:00',
  especialidad: 'Cardiología',
  estado: 'programada',
  motivo: 'Consulta de rutina'
});
```

## Database Status Indicator

The application includes a DatabaseStatus component that displays real-time connection status in the bottom-right corner of the screen. It shows:

- Overall Supabase connection status
- Individual table accessibility
- Manual connection refresh button

## Testing Connection

You can test the database connection using the utility functions:

```typescript
import { testDatabaseConnection, insertSampleData } from './utils/testConnection';

// Test connection
const result = await testDatabaseConnection();

// Insert sample data (for testing only)
const data = await insertSampleData();
```

## Indexes

The following indexes are created for optimal query performance:

- `idx_usuarios_email` - Fast user lookup by email
- `idx_usuarios_rol` - Filter users by role
- `idx_medicos_usuario_id` - Join optimization
- `idx_medicos_especialidad` - Filter doctors by specialty
- `idx_citas_paciente_id` - Patient's appointments
- `idx_citas_medico_id` - Doctor's appointments
- `idx_citas_fecha` - Appointments by date
- `idx_citas_estado` - Filter by appointment status

## Best Practices

1. **Always hash passwords** before storing in password_hash field
2. **Use transactions** for operations that modify multiple tables
3. **Check RLS policies** if queries return unexpected results
4. **Use the service layer** instead of direct Supabase queries
5. **Handle errors gracefully** - all service methods can throw errors
6. **Validate data** before insertion to respect constraints

## Troubleshooting

If you see connection errors:

1. Verify environment variables are set correctly
2. Check that your IP is allowed in Supabase dashboard
3. Confirm RLS policies allow your operation
4. Check the DatabaseStatus component for detailed table status

## Migration

The database was created with the migration file: `create_cmedicas_schema`

To view all migrations:
```bash
supabase migrations list
```
