import { supabase } from '../lib/supabase';
import { usuariosService, medicosService, citasService } from '../services/database';

export async function testDatabaseConnection() {
  try {
    console.log('Testing Supabase connection...');

    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('count');

    if (usuariosError) {
      console.error('Error connecting to usuarios table:', usuariosError);
      return { success: false, error: usuariosError };
    }

    const { data: medicos, error: medicosError } = await supabase
      .from('medicos')
      .select('count');

    if (medicosError) {
      console.error('Error connecting to medicos table:', medicosError);
      return { success: false, error: medicosError };
    }

    const { data: citas, error: citasError } = await supabase
      .from('citas')
      .select('count');

    if (citasError) {
      console.error('Error connecting to citas table:', citasError);
      return { success: false, error: citasError };
    }

    console.log('Database connection successful!');
    console.log('Tables verified:', { usuarios, medicos, citas });

    return {
      success: true,
      tables: {
        usuarios: true,
        medicos: true,
        citas: true
      }
    };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { success: false, error };
  }
}

export async function insertSampleData() {
  try {
    console.log('Inserting sample data...');

    const adminUsuario = {
      nombre: 'Administrador Sistema',
      email: 'admin@cmedicas.com',
      password_hash: '$2a$10$example.hash.for.testing',
      fecha_nacimiento: '1985-05-15',
      direccion: 'Calle Principal 123, Ciudad',
      telefono: '+1234567890',
      sexo: 'masculino' as const,
      estado_civil: 'casado' as const,
      rol: 'administrador' as const,
      activo: true
    };

    const pacienteUsuario = {
      nombre: 'María González',
      email: 'maria.gonzalez@example.com',
      password_hash: '$2a$10$example.hash.for.testing',
      fecha_nacimiento: '1990-08-22',
      direccion: 'Avenida Central 456, Ciudad',
      telefono: '+1234567891',
      sexo: 'femenino' as const,
      estado_civil: 'soltera' as const,
      rol: 'paciente' as const,
      activo: true
    };

    const medicoUsuario = {
      nombre: 'Dr. Carlos Pérez',
      email: 'carlos.perez@cmedicas.com',
      password_hash: '$2a$10$example.hash.for.testing',
      fecha_nacimiento: '1980-03-10',
      direccion: 'Boulevard Médico 789, Ciudad',
      telefono: '+1234567892',
      sexo: 'masculino' as const,
      estado_civil: 'casado' as const,
      rol: 'medico_especialista' as const,
      departamento: 'Cardiología',
      activo: true
    };

    const admin = await usuariosService.create(adminUsuario);
    console.log('Admin created:', admin.id);

    const paciente = await usuariosService.create(pacienteUsuario);
    console.log('Patient created:', paciente.id);

    const doctorUser = await usuariosService.create(medicoUsuario);
    console.log('Doctor user created:', doctorUser.id);

    const medico = await medicosService.create({
      usuario_id: doctorUser.id,
      especialidad: 'Cardiología',
      cedula: 'MED-12345',
      experiencia_anos: 15,
      horario_atencion: {
        lunes: { inicio: '08:00', fin: '16:00' },
        martes: { inicio: '08:00', fin: '16:00' },
        miercoles: { inicio: '08:00', fin: '16:00' },
        jueves: { inicio: '08:00', fin: '16:00' },
        viernes: { inicio: '08:00', fin: '14:00' }
      },
      consultorio: 'Consultorio 201',
      calificacion: 4.5,
      total_consultas: 0,
      activo: true
    });
    console.log('Doctor profile created:', medico.id);

    const cita = await citasService.create({
      paciente_id: paciente.id,
      medico_id: medico.id,
      fecha: '2025-10-15',
      hora: '10:00:00',
      especialidad: 'Cardiología',
      estado: 'programada',
      motivo: 'Consulta de control cardiológico',
      observaciones: 'Primera consulta'
    });
    console.log('Appointment created:', cita.id);

    return {
      success: true,
      data: { admin, paciente, doctorUser, medico, cita }
    };
  } catch (error) {
    console.error('Error inserting sample data:', error);
    return { success: false, error };
  }
}
