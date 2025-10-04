# Tipos de Diseño - Sistema CitasMedicas

## 1. Modelado del Usuario

### **Estructura de Usuario Completa**
```typescript
interface Usuario {
  // Información Personal
  nombre: string;
  fechaNacimiento: Date;
  direccion: string;
  telefono: string;
  telefonoEmergencia?: string;
  sexo: 'masculino' | 'femenino' | 'otro';
  discapacidad?: string;
  estadoCivil: 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'union_libre';
  email: string;
  
  // Información del Sistema
  id: string;
  rol: UserRole;
  activo: boolean;
  fechaRegistro: Date;
  
  // Información Profesional (para personal médico)
  departamento?: string;
  especialidad?: string;
  cedula?: string;
}
```

### **Roles de Usuario**
- `administrador`: Control total del sistema
- `medico_especialista`: Atención médica especializada
- `enfermero`: Cuidados de enfermería
- `auxiliar_enfermeria`: Apoyo en cuidados básicos
- `pasante`: Estudiante en práctica
- `paramedico`: Atención pre-hospitalaria
- `paciente`: Usuario final del servicio médico
- `seguridad`: Personal de seguridad hospitalaria
- `persona_vulnerable`: Paciente con necesidades especiales

## 2. Diseño Conceptual

### **Iconografía de Salud**
- **Estetoscopio** (🩺): Representa médicos y consultas
- **Corazón** (❤️): Simboliza salud y bienestar
- **Cruz Médica** (⚕️): Identifica servicios de salud
- **Calendario** (📅): Gestión de citas y horarios
- **Usuario** (👤): Pacientes y personal
- **Escudo** (🛡️): Seguridad y protección de datos

### **Tarjetas de Información**
```css
.medical-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-left: 4px solid #3b82f6;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
```

### **Menús Desplegables**
- **Especialidades Médicas**: Lista organizada alfabéticamente
- **Estados de Citas**: Programada, Completada, Cancelada, No Asistió
- **Filtros de Búsqueda**: Múltiples criterios de filtrado
- **Configuraciones**: Opciones de personalización

## 3. Diseño de Contenidos

### **Información sobre Especialidades Médicas**

#### **Cardiología**
- **Descripción**: Diagnóstico y tratamiento de enfermedades del corazón
- **Procedimientos**: Electrocardiograma, Ecocardiograma, Cateterismo
- **Condiciones**: Hipertensión, Arritmias, Insuficiencia Cardíaca

#### **Neurología**
- **Descripción**: Atención de trastornos del sistema nervioso
- **Procedimientos**: Electroencefalograma, Resonancia Magnética
- **Condiciones**: Epilepsia, Migraña, Esclerosis Múltiple

#### **Pediatría**
- **Descripción**: Atención médica integral para niños y adolescentes
- **Procedimientos**: Vacunación, Control de Crecimiento
- **Condiciones**: Asma Infantil, Alergias, Trastornos del Desarrollo

### **Información de Salud Preventiva**

#### **Alimentación Saludable**
- **Pirámide Nutricional**: Guía visual de grupos alimentarios
- **Porciones Recomendadas**: Cantidades apropiadas por edad
- **Hidratación**: Importancia del consumo adecuado de agua
- **Restricciones**: Dietas especiales por condiciones médicas

#### **Ejercicio Físico**
- **Rutinas por Edad**: Ejercicios apropiados según grupo etario
- **Frecuencia Recomendada**: 150 minutos semanales de actividad moderada
- **Beneficios**: Mejora cardiovascular, fortalecimiento muscular
- **Precauciones**: Consideraciones para personas con limitaciones

### **Recursos Educativos**
- **Videos Informativos**: Contenido audiovisual sobre prevención
- **Infografías**: Información visual fácil de entender
- **Artículos**: Contenido detallado sobre temas de salud
- **Calculadoras**: IMC, dosis de medicamentos, fechas de vacunación

## 4. Diseño Visual

### **Tipografía**
```css
/* Fuente Principal */
font-family: 'Inter', 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;

/* Jerarquía Tipográfica */
.heading-1 { font-size: 2.5rem; font-weight: 700; line-height: 1.2; }
.heading-2 { font-size: 2rem; font-weight: 600; line-height: 1.3; }
.heading-3 { font-size: 1.5rem; font-weight: 600; line-height: 1.4; }
.body-large { font-size: 1.125rem; font-weight: 400; line-height: 1.6; }
.body-regular { font-size: 1rem; font-weight: 400; line-height: 1.5; }
.body-small { font-size: 0.875rem; font-weight: 400; line-height: 1.4; }
```

### **Paleta de Colores**
```css
/* Colores Primarios */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Colores Semánticos */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #06b6d4;

/* Colores Neutros */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-500: #6b7280;
--gray-900: #111827;
```

### **Degradados**
```css
/* Degradado Principal */
.gradient-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

/* Degradado de Fondo */
.gradient-background {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%);
}

/* Degradado de Tarjetas */
.gradient-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
}
```

### **Sombras y Elevación**
```css
/* Sombras por Niveles */
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
```

### **Espaciado y Layout**
```css
/* Sistema de Espaciado (8px base) */
.space-1 { margin: 0.25rem; }  /* 4px */
.space-2 { margin: 0.5rem; }   /* 8px */
.space-3 { margin: 0.75rem; }  /* 12px */
.space-4 { margin: 1rem; }     /* 16px */
.space-6 { margin: 1.5rem; }   /* 24px */
.space-8 { margin: 2rem; }     /* 32px */

/* Grid System */
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
```

## 5. Enfoque de Organización

### **Lógica de Información**
- **Jerarquía Clara**: Información más importante primero
- **Agrupación Lógica**: Elementos relacionados juntos
- **Flujo Natural**: Seguimiento del proceso mental del usuario
- **Consistencia**: Patrones repetibles en toda la aplicación

### **Organización de Contenido**
- **Categorización**: Agrupación por tipo de contenido
- **Priorización**: Elementos críticos más visibles
- **Contextualización**: Información relevante al momento
- **Personalización**: Adaptación según rol de usuario