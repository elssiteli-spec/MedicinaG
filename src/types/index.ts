export interface User {
  id: string;
  nombre: string;
  fechaNacimiento: string;
  direccion: string;
  telefono: string;
  telefonoEmergencia?: string;
  sexo: 'masculino' | 'femenino' | 'otro';
  discapacidad?: string;
  estadoCivil: 'soltero' | 'casado' | 'divorciado' | 'viudo' | 'union_libre';
  email: string;
  rol: UserRole;
  departamento?: string;
  especialidad?: string;
  cedula?: string;
  activo: boolean;
  fechaRegistro: string;
}

export type UserRole = 
  | 'administrador' 
  | 'medico_especialista' 
  | 'enfermero' 
  | 'auxiliar_enfermeria' 
  | 'pasante' 
  | 'paramedico' 
  | 'paciente' 
  | 'seguridad' 
  | 'persona_vulnerable';

export interface Cita {
  id: string;
  pacienteId: string;
  medicoId: string;
  pacienteNombre: string;
  medicoNombre: string;
  fecha: string;
  hora: string;
  especialidad: string;
  estado: 'programada' | 'completada' | 'cancelada' | 'no_asistio';
  motivo: string;
  observaciones?: string;
  fechaCreacion: string;
}

export interface Especialidad {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
  activa: boolean;
}

export interface HighFidelityPrototype {
  id: string;
  title: string;
  description: string;
  category: 'dashboard' | 'forms' | 'lists' | 'modals';
  device: 'desktop' | 'mobile' | 'tablet';
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}