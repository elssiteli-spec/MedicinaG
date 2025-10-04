import { v4 as uuidv4 } from 'uuid';
import database from '../config/database.js';

class Appointment {
    constructor(data) {
        this.id = data.id;
        this.paciente_id = data.paciente_id;
        this.medico_id = data.medico_id;
        this.especialidad_id = data.especialidad_id;
        this.fecha = data.fecha;
        this.hora = data.hora;
        this.estado = data.estado;
        this.motivo = data.motivo;
        this.observaciones = data.observaciones;
        this.fecha_creacion = data.fecha_creacion;
        this.fecha_actualizacion = data.fecha_actualizacion;
        
        // Datos relacionados (si están disponibles)
        this.paciente_nombre = data.paciente_nombre;
        this.medico_nombre = data.medico_nombre;
        this.especialidad_nombre = data.especialidad_nombre;
    }

    static async create(appointmentData) {
        try {
            const id = uuidv4();
            
            const sql = `
                INSERT INTO citas (
                    id, paciente_id, medico_id, especialidad_id, fecha, hora, 
                    estado, motivo, observaciones
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                id, appointmentData.paciente_id, appointmentData.medico_id,
                appointmentData.especialidad_id, appointmentData.fecha, appointmentData.hora,
                appointmentData.estado || 'programada', appointmentData.motivo,
                appointmentData.observaciones
            ];

            await database.run(sql, params);
            return await Appointment.findById(id);
        } catch (error) {
            throw new Error(`Error al crear cita: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const sql = `
                SELECT 
                    c.*,
                    p.nombre as paciente_nombre,
                    m.nombre as medico_nombre,
                    e.nombre as especialidad_nombre
                FROM citas c
                JOIN usuarios p ON c.paciente_id = p.id
                JOIN usuarios m ON c.medico_id = m.id
                JOIN especialidades e ON c.especialidad_id = e.id
                WHERE c.id = ?
            `;
            const row = await database.get(sql, [id]);
            return row ? new Appointment(row) : null;
        } catch (error) {
            throw new Error(`Error al buscar cita: ${error.message}`);
        }
    }

    static async findAll(filters = {}) {
        try {
            let sql = `
                SELECT 
                    c.*,
                    p.nombre as paciente_nombre,
                    m.nombre as medico_nombre,
                    e.nombre as especialidad_nombre
                FROM citas c
                JOIN usuarios p ON c.paciente_id = p.id
                JOIN usuarios m ON c.medico_id = m.id
                JOIN especialidades e ON c.especialidad_id = e.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.paciente_id) {
                sql += ' AND c.paciente_id = ?';
                params.push(filters.paciente_id);
            }

            if (filters.medico_id) {
                sql += ' AND c.medico_id = ?';
                params.push(filters.medico_id);
            }

            if (filters.estado) {
                sql += ' AND c.estado = ?';
                params.push(filters.estado);
            }

            if (filters.fecha_desde) {
                sql += ' AND c.fecha >= ?';
                params.push(filters.fecha_desde);
            }

            if (filters.fecha_hasta) {
                sql += ' AND c.fecha <= ?';
                params.push(filters.fecha_hasta);
            }

            if (filters.search) {
                sql += ' AND (p.nombre LIKE ? OR m.nombre LIKE ? OR e.nombre LIKE ? OR c.motivo LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            sql += ' ORDER BY c.fecha DESC, c.hora DESC';

            if (filters.limit) {
                sql += ' LIMIT ?';
                params.push(filters.limit);
            }

            const rows = await database.all(sql, params);
            return rows.map(row => new Appointment(row));
        } catch (error) {
            throw new Error(`Error al obtener citas: ${error.message}`);
        }
    }

    static async update(id, appointmentData) {
        try {
            const fields = [];
            const params = [];

            Object.keys(appointmentData).forEach(key => {
                if (key !== 'id' && appointmentData[key] !== undefined) {
                    fields.push(`${key} = ?`);
                    params.push(appointmentData[key]);
                }
            });

            if (fields.length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            params.push(id);
            const sql = `UPDATE citas SET ${fields.join(', ')} WHERE id = ?`;
            
            const result = await database.run(sql, params);
            
            if (result.changes === 0) {
                throw new Error('Cita no encontrada');
            }

            return await Appointment.findById(id);
        } catch (error) {
            throw new Error(`Error al actualizar cita: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM citas WHERE id = ?';
            const result = await database.run(sql, [id]);
            
            if (result.changes === 0) {
                throw new Error('Cita no encontrada');
            }

            return true;
        } catch (error) {
            throw new Error(`Error al eliminar cita: ${error.message}`);
        }
    }

    static async getByDateRange(fechaInicio, fechaFin) {
        try {
            const sql = `
                SELECT 
                    c.*,
                    p.nombre as paciente_nombre,
                    m.nombre as medico_nombre,
                    e.nombre as especialidad_nombre
                FROM citas c
                JOIN usuarios p ON c.paciente_id = p.id
                JOIN usuarios m ON c.medico_id = m.id
                JOIN especialidades e ON c.especialidad_id = e.id
                WHERE c.fecha BETWEEN ? AND ?
                ORDER BY c.fecha, c.hora
            `;
            const rows = await database.all(sql, [fechaInicio, fechaFin]);
            return rows.map(row => new Appointment(row));
        } catch (error) {
            throw new Error(`Error al obtener citas por rango de fechas: ${error.message}`);
        }
    }

    static async checkAvailability(medicoId, fecha, hora, excludeId = null) {
        try {
            let sql = `
                SELECT COUNT(*) as count 
                FROM citas 
                WHERE medico_id = ? AND fecha = ? AND hora = ? AND estado != 'cancelada'
            `;
            const params = [medicoId, fecha, hora];

            if (excludeId) {
                sql += ' AND id != ?';
                params.push(excludeId);
            }

            const result = await database.get(sql, params);
            return result.count === 0;
        } catch (error) {
            throw new Error(`Error al verificar disponibilidad: ${error.message}`);
        }
    }
}

export default Appointment;