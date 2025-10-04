/*
  # CMedicas Database Schema - Medical Appointment System

  ## Summary
  This migration creates the complete database schema for the CMedicas medical appointment management system.
  It establishes three main tables with proper relationships, constraints, and security policies.

  ## New Tables

  ### 1. `usuarios` (Users)
  User accounts for all system roles including patients, doctors, nurses, and administrators.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique user identifier
  - `nombre` (text) - Full name of the user
  - `email` (text, unique) - Email address for login and communication
  - `password_hash` (text) - Hashed password for authentication
  - `fecha_nacimiento` (date) - Date of birth
  - `direccion` (text) - Physical address
  - `telefono` (text) - Primary phone number
  - `telefono_emergencia` (text, optional) - Emergency contact phone
  - `sexo` (text) - Gender: 'masculino', 'femenino', 'otro'
  - `discapacidad` (text, optional) - Disability information if applicable
  - `estado_civil` (text) - Marital status
  - `rol` (text) - User role in the system
  - `departamento` (text, optional) - Department for staff members
  - `activo` (boolean) - Account active status
  - `fecha_registro` (timestamptz) - Registration timestamp

  ### 2. `medicos` (Doctors)
  Extended information for medical professionals in the system.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique doctor identifier
  - `usuario_id` (uuid, foreign key) - References usuarios table
  - `especialidad` (text) - Medical specialty
  - `cedula` (text, unique) - Professional license number
  - `experiencia_anos` (integer) - Years of experience
  - `horario_atencion` (jsonb) - Attention schedule in JSON format
  - `consultorio` (text) - Office or room number
  - `calificacion` (numeric) - Average rating from patients
  - `total_consultas` (integer) - Total number of consultations
  - `activo` (boolean) - Active status
  - `fecha_registro` (timestamptz) - Registration timestamp

  ### 3. `citas` (Appointments)
  Medical appointments scheduled in the system.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique appointment identifier
  - `paciente_id` (uuid, foreign key) - References usuarios table
  - `medico_id` (uuid, foreign key) - References medicos table
  - `fecha` (date) - Appointment date
  - `hora` (time) - Appointment time
  - `especialidad` (text) - Medical specialty for the appointment
  - `estado` (text) - Status: 'programada', 'completada', 'cancelada', 'no_asistio'
  - `motivo` (text) - Reason for the appointment
  - `observaciones` (text, optional) - Additional notes or observations
  - `fecha_creacion` (timestamptz) - Creation timestamp
  - `fecha_actualizacion` (timestamptz) - Last update timestamp

  ## Security (Row Level Security)

  ### RLS Policies for `usuarios`:
  1. Users can view their own profile
  2. Administrators can view all users
  3. Users can update their own profile
  4. Administrators can update any user
  5. New users can be created during registration

  ### RLS Policies for `medicos`:
  1. All authenticated users can view active doctors
  2. Doctors can view their own extended profile
  3. Administrators can view all doctors
  4. Doctors can update their own profile
  5. Administrators can manage all doctor profiles

  ### RLS Policies for `citas`:
  1. Patients can view their own appointments
  2. Doctors can view appointments assigned to them
  3. Administrators can view all appointments
  4. Patients and doctors can create new appointments
  5. Patients and doctors can update their own appointments
  6. Administrators can update any appointment

  ## Indexes
  - Email index on usuarios for fast authentication
  - Usuario_id index on medicos for join optimization
  - Paciente and medico indexes on citas for query performance
  - Date and status indexes on citas for filtering

  ## Important Notes
  1. All tables have RLS enabled for security
  2. Passwords are stored as hashes, never plain text
  3. Foreign key constraints ensure data integrity
  4. Default values are set for booleans and timestamps
  5. JSONB is used for flexible schedule storage
*/

-- Create usuarios table
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  fecha_nacimiento date NOT NULL,
  direccion text NOT NULL,
  telefono text NOT NULL,
  telefono_emergencia text,
  sexo text NOT NULL CHECK (sexo IN ('masculino', 'femenino', 'otro')),
  discapacidad text,
  estado_civil text NOT NULL CHECK (estado_civil IN ('soltero', 'casado', 'divorciado', 'viudo', 'union_libre')),
  rol text NOT NULL CHECK (rol IN ('administrador', 'medico_especialista', 'enfermero', 'auxiliar_enfermeria', 'pasante', 'paramedico', 'paciente', 'seguridad', 'persona_vulnerable')),
  departamento text,
  activo boolean DEFAULT true,
  fecha_registro timestamptz DEFAULT now()
);

-- Create medicos table
CREATE TABLE IF NOT EXISTS medicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  especialidad text NOT NULL,
  cedula text UNIQUE NOT NULL,
  experiencia_anos integer DEFAULT 0,
  horario_atencion jsonb DEFAULT '{}',
  consultorio text,
  calificacion numeric(3,2) DEFAULT 0.00 CHECK (calificacion >= 0 AND calificacion <= 5),
  total_consultas integer DEFAULT 0,
  activo boolean DEFAULT true,
  fecha_registro timestamptz DEFAULT now()
);

-- Create citas table
CREATE TABLE IF NOT EXISTS citas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  medico_id uuid NOT NULL REFERENCES medicos(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  hora time NOT NULL,
  especialidad text NOT NULL,
  estado text NOT NULL DEFAULT 'programada' CHECK (estado IN ('programada', 'completada', 'cancelada', 'no_asistio')),
  motivo text NOT NULL,
  observaciones text,
  fecha_creacion timestamptz DEFAULT now(),
  fecha_actualizacion timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_medicos_usuario_id ON medicos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_medicos_especialidad ON medicos(especialidad);
CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_medico_id ON citas(medico_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);

-- Enable Row Level Security
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usuarios table

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON usuarios FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Administrators can view all users
CREATE POLICY "Administrators can view all users"
  ON usuarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Administrators can update any user
CREATE POLICY "Administrators can update all users"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );

-- Allow user registration (insert)
CREATE POLICY "Allow user registration"
  ON usuarios FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- RLS Policies for medicos table

-- All authenticated users can view active doctors
CREATE POLICY "Authenticated users can view active doctors"
  ON medicos FOR SELECT
  TO authenticated
  USING (activo = true);

-- Doctors can view their own extended profile
CREATE POLICY "Doctors can view own profile"
  ON medicos FOR SELECT
  TO authenticated
  USING (
    usuario_id = auth.uid()
  );

-- Administrators can view all doctors
CREATE POLICY "Administrators can view all doctors"
  ON medicos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );

-- Doctors can update their own profile
CREATE POLICY "Doctors can update own profile"
  ON medicos FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- Administrators can insert new doctors
CREATE POLICY "Administrators can insert doctors"
  ON medicos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );

-- Administrators can update any doctor
CREATE POLICY "Administrators can update all doctors"
  ON medicos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );

-- RLS Policies for citas table

-- Patients can view their own appointments
CREATE POLICY "Patients can view own appointments"
  ON citas FOR SELECT
  TO authenticated
  USING (paciente_id = auth.uid());

-- Doctors can view appointments assigned to them
CREATE POLICY "Doctors can view their appointments"
  ON citas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medicos
      WHERE medicos.id = citas.medico_id
      AND medicos.usuario_id = auth.uid()
    )
  );

-- Administrators can view all appointments
CREATE POLICY "Administrators can view all appointments"
  ON citas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );

-- Authenticated users can create appointments
CREATE POLICY "Authenticated users can create appointments"
  ON citas FOR INSERT
  TO authenticated
  WITH CHECK (
    paciente_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol IN ('administrador', 'medico_especialista', 'enfermero')
    )
  );

-- Patients can update their own appointments
CREATE POLICY "Patients can update own appointments"
  ON citas FOR UPDATE
  TO authenticated
  USING (paciente_id = auth.uid())
  WITH CHECK (paciente_id = auth.uid());

-- Doctors can update their appointments
CREATE POLICY "Doctors can update their appointments"
  ON citas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM medicos
      WHERE medicos.id = citas.medico_id
      AND medicos.usuario_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM medicos
      WHERE medicos.id = citas.medico_id
      AND medicos.usuario_id = auth.uid()
    )
  );

-- Administrators can update all appointments
CREATE POLICY "Administrators can update all appointments"
  ON citas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );

-- Administrators can delete appointments
CREATE POLICY "Administrators can delete appointments"
  ON citas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'administrador'
    )
  );