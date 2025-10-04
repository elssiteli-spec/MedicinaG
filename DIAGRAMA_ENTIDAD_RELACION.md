# Diagrama Entidad-Relación - CMedicas

## Modelo Entidad-Relación Completo

### Diagrama Visual Detallado

```
╔══════════════════════════════════════════════════════════════╗
║                        USUARIOS                               ║
╠══════════════════════════════════════════════════════════════╣
║ 🔑 id: uuid (PK)                                             ║
║ 📧 email: text (UNIQUE, NOT NULL)                           ║
║ 👤 nombre: text (NOT NULL)                                   ║
║ 🔒 password_hash: text (NOT NULL)                           ║
║ 📅 fecha_nacimiento: date (NOT NULL)                        ║
║ 📍 direccion: text (NOT NULL)                               ║
║ 📞 telefono: text (NOT NULL)                                ║
║ 🆘 telefono_emergencia: text                                ║
║ ⚧  sexo: text (masculino|femenino|otro)                     ║
║ ♿ discapacidad: text                                        ║
║ 💑 estado_civil: text                                        ║
║ 👔 rol: text (NOT NULL)                                      ║
║    • administrador                                            ║
║    • medico_especialista                                      ║
║    • enfermero                                                ║
║    • auxiliar_enfermeria                                      ║
║    • pasante                                                  ║
║    • paramedico                                               ║
║    • paciente                                                 ║
║    • seguridad                                                ║
║    • persona_vulnerable                                       ║
║ 🏢 departamento: text                                        ║
║ ✅ activo: boolean (DEFAULT true)                           ║
║ 📆 fecha_registro: timestamptz (DEFAULT now())              ║
╚══════════════════════════════════════════════════════════════╝
                          │
                          │
                          │ Relación 1:1
                          │ ON DELETE CASCADE
                          ▼
╔══════════════════════════════════════════════════════════════╗
║                         MEDICOS                               ║
╠══════════════════════════════════════════════════════════════╣
║ 🔑 id: uuid (PK)                                             ║
║ 🔗 usuario_id: uuid (FK → usuarios.id, UNIQUE)              ║
║ 🏥 especialidad: text (NOT NULL)                            ║
║ 🎓 cedula: text (UNIQUE, NOT NULL)                          ║
║ 📊 experiencia_anos: integer (DEFAULT 0)                    ║
║ 🕐 horario_atencion: jsonb                                  ║
║    Formato JSON:                                              ║
║    {                                                          ║
║      "lunes": {"inicio": "08:00", "fin": "16:00"},          ║
║      "martes": {"inicio": "08:00", "fin": "16:00"},         ║
║      ...                                                      ║
║    }                                                          ║
║ 🚪 consultorio: text                                         ║
║ ⭐ calificacion: numeric(3,2) (0.00-5.00)                   ║
║ 📈 total_consultas: integer (DEFAULT 0)                     ║
║ ✅ activo: boolean (DEFAULT true)                           ║
║ 📆 fecha_registro: timestamptz (DEFAULT now())              ║
╚══════════════════════════════════════════════════════════════╝
                          │
                          │
                          │ Relación 1:N
                          │ ON DELETE CASCADE
                          ▼
╔══════════════════════════════════════════════════════════════╗
║                          CITAS                                ║
╠══════════════════════════════════════════════════════════════╣
║ 🔑 id: uuid (PK)                                             ║
║ 🔗 paciente_id: uuid (FK → usuarios.id)                     ║
║ 🔗 medico_id: uuid (FK → medicos.id)                        ║
║ 📅 fecha: date (NOT NULL)                                    ║
║ 🕐 hora: time (NOT NULL)                                     ║
║ 🏥 especialidad: text (NOT NULL)                            ║
║ 📊 estado: text (DEFAULT 'programada')                      ║
║    • programada                                               ║
║    • completada                                               ║
║    • cancelada                                                ║
║    • no_asistio                                               ║
║ 📝 motivo: text (NOT NULL)                                   ║
║ 💬 observaciones: text                                       ║
║ 📆 fecha_creacion: timestamptz (DEFAULT now())              ║
║ 🔄 fecha_actualizacion: timestamptz (DEFAULT now())         ║
╚══════════════════════════════════════════════════════════════╝
         ▲
         │
         │ Relación N:1
         │ ON DELETE CASCADE
         │
╔══════════════════════════════════════════════════════════════╗
║                      USUARIOS (Pacientes)                     ║
║                    (referencia a tabla usuarios)              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## Relaciones Detalladas

### 1. USUARIOS → MEDICOS (Uno a Uno)

**Tipo:** Relación de Extensión (Herencia Parcial)

**Cardinalidad:** 1:1 (opcional)

**Descripción:**
- Un usuario puede ser médico (si rol = 'medico_especialista')
- Un médico es siempre un usuario
- La tabla medicos extiende la información de usuarios para profesionales médicos

**Implementación SQL:**
```sql
FOREIGN KEY (usuario_id)
  REFERENCES usuarios(id)
  ON DELETE CASCADE

UNIQUE CONSTRAINT ON usuario_id
```

**Diagrama de Cardinalidad:**
```
USUARIOS (1) ──────────── (0,1) MEDICOS
    "es"                "puede ser"
```

**Reglas de Negocio:**
1. Solo usuarios con rol 'medico_especialista' tienen registro en medicos
2. Si se elimina el usuario, se elimina automáticamente el perfil de médico
3. Un usuario solo puede tener un perfil de médico
4. Un médico debe tener exactamente un usuario asociado

---

### 2. USUARIOS (Pacientes) → CITAS (Uno a Muchos)

**Tipo:** Relación de Asociación

**Cardinalidad:** 1:N

**Descripción:**
- Un paciente puede tener múltiples citas
- Una cita pertenece a un único paciente
- Pacientes son usuarios con rol 'paciente'

**Implementación SQL:**
```sql
FOREIGN KEY (paciente_id)
  REFERENCES usuarios(id)
  ON DELETE CASCADE
```

**Diagrama de Cardinalidad:**
```
USUARIOS (1) ──────────── (0,N) CITAS
  (paciente)    "agenda"        "es agendada por"
```

**Reglas de Negocio:**
1. Un paciente puede tener 0 o más citas
2. Una cita debe pertenecer a exactamente un paciente
3. Si se elimina el paciente, se eliminan todas sus citas
4. Solo usuarios con acceso de paciente pueden agendar citas

---

### 3. MEDICOS → CITAS (Uno a Muchos)

**Tipo:** Relación de Asignación

**Cardinalidad:** 1:N

**Descripción:**
- Un médico puede atender múltiples citas
- Una cita es atendida por un único médico
- Médicos deben estar activos para recibir citas

**Implementación SQL:**
```sql
FOREIGN KEY (medico_id)
  REFERENCES medicos(id)
  ON DELETE CASCADE
```

**Diagrama de Cardinalidad:**
```
MEDICOS (1) ──────────── (0,N) CITAS
        "atiende"        "es atendida por"
```

**Reglas de Negocio:**
1. Un médico puede tener 0 o más citas asignadas
2. Una cita debe ser atendida por exactamente un médico
3. Si se elimina el médico, se eliminan todas sus citas
4. La especialidad de la cita debe coincidir con la del médico

---

## Modelo Relacional Completo

```
┌─────────────┐
│  USUARIOS   │
│   (10 reg)  │
└──────┬──────┘
       │
       │ rol = 'medico_especialista'
       │
       ├─────────────► ┌──────────────┐
       │                │   MEDICOS    │
       │                │   (5 reg)    │
       │                └──────┬───────┘
       │                       │
       │                       │ 1:N
       │                       │
       │ rol = 'paciente'      │
       │                       ▼
       └─────────────► ┌──────────────┐
                       │    CITAS     │
                       │   (5 reg)    │
                       └──────────────┘
```

---

## Índices para Optimización

### Tabla: usuarios

```sql
-- Búsqueda rápida por email (login)
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Filtrado por rol
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
```

**Uso:** Acelera consultas de autenticación y filtrado por tipo de usuario

### Tabla: medicos

```sql
-- Join con usuarios
CREATE INDEX idx_medicos_usuario_id ON medicos(usuario_id);

-- Búsqueda por especialidad
CREATE INDEX idx_medicos_especialidad ON medicos(especialidad);
```

**Uso:** Optimiza joins y búsqueda de médicos por especialidad

### Tabla: citas

```sql
-- Búsqueda de citas de un paciente
CREATE INDEX idx_citas_paciente_id ON citas(paciente_id);

-- Búsqueda de citas de un médico
CREATE INDEX idx_citas_medico_id ON citas(medico_id);

-- Filtrado por fecha
CREATE INDEX idx_citas_fecha ON citas(fecha);

-- Filtrado por estado
CREATE INDEX idx_citas_estado ON citas(estado);
```

**Uso:** Acelera búsquedas de citas por paciente, médico, fecha y estado

---

## Constraints de Integridad

### Check Constraints

```sql
-- USUARIOS
CHECK (sexo IN ('masculino', 'femenino', 'otro'))
CHECK (estado_civil IN ('soltero', 'casado', 'divorciado', 'viudo', 'union_libre'))
CHECK (rol IN ('administrador', 'medico_especialista', ...))

-- MEDICOS
CHECK (calificacion >= 0 AND calificacion <= 5)

-- CITAS
CHECK (estado IN ('programada', 'completada', 'cancelada', 'no_asistio'))
```

### Unique Constraints

```sql
-- USUARIOS
UNIQUE (email)

-- MEDICOS
UNIQUE (usuario_id)
UNIQUE (cedula)
```

### Foreign Key Constraints

```sql
-- MEDICOS
FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE

-- CITAS
FOREIGN KEY (paciente_id) REFERENCES usuarios(id) ON DELETE CASCADE
FOREIGN KEY (medico_id) REFERENCES medicos(id) ON DELETE CASCADE
```

---

## Ejemplo de Consulta con Joins

### Obtener todas las citas con información completa

```sql
SELECT
  c.id,
  c.fecha,
  c.hora,
  c.especialidad,
  c.estado,
  c.motivo,
  c.observaciones,

  -- Información del paciente
  p.id as paciente_id,
  p.nombre as paciente_nombre,
  p.email as paciente_email,
  p.telefono as paciente_telefono,

  -- Información del médico
  d.id as medico_id,
  d.nombre as medico_nombre,
  m.especialidad as medico_especialidad,
  m.cedula as medico_cedula,
  m.consultorio,
  m.calificacion as medico_calificacion

FROM citas c

-- Join con paciente (usuarios)
INNER JOIN usuarios p
  ON c.paciente_id = p.id

-- Join con médico (medicos → usuarios)
INNER JOIN medicos m
  ON c.medico_id = m.id
INNER JOIN usuarios d
  ON m.usuario_id = d.id

ORDER BY c.fecha, c.hora;
```

---

## Diagrama de Flujo de Datos

```
┌──────────────┐
│   REGISTRO   │
│  DE USUARIO  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   USUARIOS   │
│   (INSERT)   │
└──────┬───────┘
       │
       ├─────────────────────────┐
       │                         │
       │ Si es médico            │ Si es paciente
       │                         │
       ▼                         ▼
┌──────────────┐          ┌─────────────┐
│   MEDICOS    │          │    Puede    │
│   (INSERT)   │          │   agendar   │
└──────┬───────┘          └──────┬──────┘
       │                         │
       └───────────┬─────────────┘
                   │
                   ▼
            ┌──────────────┐
            │    CITAS     │
            │   (INSERT)   │
            └──────────────┘
```

---

## Estadísticas de Datos Actuales

| Tabla | Registros | Descripción |
|-------|-----------|-------------|
| usuarios | 10 | 5 médicos + 5 pacientes |
| medicos | 5 | Perfiles de médicos especialistas |
| citas | 5 | 2 completadas + 3 programadas |

### Distribución por Rol (usuarios)

```
┌─────────────────────┬──────┐
│ Rol                 │ Cant │
├─────────────────────┼──────┤
│ medico_especialista │  5   │
│ paciente            │  5   │
│ administrador       │  0   │
│ enfermero           │  0   │
│ otros               │  0   │
└─────────────────────┴──────┘
```

### Distribución por Especialidad (medicos)

```
┌─────────────────┬──────┐
│ Especialidad    │ Cant │
├─────────────────┼──────┤
│ Cardiología     │  1   │
│ Neurología      │  1   │
│ Pediatría       │  1   │
│ Dermatología    │  1   │
│ Traumatología   │  1   │
└─────────────────┴──────┘
```

### Distribución por Estado (citas)

```
┌─────────────┬──────┐
│ Estado      │ Cant │
├─────────────┼──────┤
│ programada  │  3   │
│ completada  │  2   │
│ cancelada   │  0   │
│ no_asistio  │  0   │
└─────────────┴──────┘
```

---

**Fecha de Diagrama:** 2 de Octubre, 2025
**Versión:** 1.0.0
