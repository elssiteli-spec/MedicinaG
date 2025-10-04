import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import database from '../config/database.js';

class User {
    constructor(data) {
        this.id = data.id;
        this.nombre = data.nombre;
        this.email = data.email;
        this.fecha_nacimiento = data.fecha_nacimiento;
        this.direccion = data.direccion;
        this.telefono = data.telefono;
        this.telefono_emergencia = data.telefono_emergencia;
        this.sexo = data.sexo;
        this.discapacidad = data.discapacidad;
        this.estado_civil = data.estado_civil;
        this.rol = data.rol;
        this.departamento = data.departamento;
        this.especialidad = data.especialidad;
        this.cedula = data.cedula;
        this.activo = data.activo;
        this.fecha_registro = data.fecha_registro;
        this.fecha_actualizacion = data.fecha_actualizacion;
    }

    static async create(userData) {
        try {
            const id = uuidv4();
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            
            const sql = `
                INSERT INTO usuarios (
                    id, nombre, email, password_hash, fecha_nacimiento, direccion, 
                    telefono, telefono_emergencia, sexo, discapacidad, estado_civil, 
                    rol, departamento, especialidad, cedula, activo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                id, userData.nombre, userData.email, hashedPassword,
                userData.fecha_nacimiento, userData.direccion, userData.telefono,
                userData.telefono_emergencia, userData.sexo, userData.discapacidad,
                userData.estado_civil, userData.rol, userData.departamento,
                userData.especialidad, userData.cedula, userData.activo !== false ? 1 : 0
            ];

            await database.run(sql, params);
            
            // Crear configuración de accesibilidad por defecto
            await database.run(
                'INSERT INTO configuraciones_accesibilidad (usuario_id) VALUES (?)',
                [id]
            );

            return await User.findById(id);
        } catch (error) {
            throw new Error(`Error al crear usuario: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const sql = 'SELECT * FROM usuarios WHERE id = ?';
            const row = await database.get(sql, [id]);
            return row ? new User(row) : null;
        } catch (error) {
            throw new Error(`Error al buscar usuario: ${error.message}`);
        }
    }

    static async findByEmail(email) {
        try {
            const sql = 'SELECT * FROM usuarios WHERE email = ?';
            const row = await database.get(sql, [email]);
            return row ? new User(row) : null;
        } catch (error) {
            throw new Error(`Error al buscar usuario por email: ${error.message}`);
        }
    }

    static async findAll(filters = {}) {
        try {
            let sql = 'SELECT * FROM usuarios WHERE 1=1';
            const params = [];

            if (filters.rol) {
                sql += ' AND rol = ?';
                params.push(filters.rol);
            }

            if (filters.activo !== undefined) {
                sql += ' AND activo = ?';
                params.push(filters.activo ? 1 : 0);
            }

            if (filters.search) {
                sql += ' AND (nombre LIKE ? OR email LIKE ? OR cedula LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            sql += ' ORDER BY fecha_registro DESC';

            if (filters.limit) {
                sql += ' LIMIT ?';
                params.push(filters.limit);
            }

            const rows = await database.all(sql, params);
            return rows.map(row => new User(row));
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    static async update(id, userData) {
        try {
            const fields = [];
            const params = [];

            Object.keys(userData).forEach(key => {
                if (key !== 'id' && key !== 'password' && userData[key] !== undefined) {
                    fields.push(`${key} = ?`);
                    params.push(userData[key]);
                }
            });

            if (userData.password) {
                const hashedPassword = await bcrypt.hash(userData.password, 10);
                fields.push('password_hash = ?');
                params.push(hashedPassword);
            }

            if (fields.length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            params.push(id);
            const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`;
            
            const result = await database.run(sql, params);
            
            if (result.changes === 0) {
                throw new Error('Usuario no encontrado');
            }

            return await User.findById(id);
        } catch (error) {
            throw new Error(`Error al actualizar usuario: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM usuarios WHERE id = ?';
            const result = await database.run(sql, [id]);
            
            if (result.changes === 0) {
                throw new Error('Usuario no encontrado');
            }

            return true;
        } catch (error) {
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }

    static async validatePassword(email, password) {
        try {
            const sql = 'SELECT * FROM usuarios WHERE email = ?';
            const row = await database.get(sql, [email]);
            
            if (!row) {
                return null;
            }

            const isValid = await bcrypt.compare(password, row.password_hash);
            return isValid ? new User(row) : null;
        } catch (error) {
            throw new Error(`Error al validar contraseña: ${error.message}`);
        }
    }

    static async getMedicosByEspecialidad(especialidad) {
        try {
            const sql = `
                SELECT * FROM usuarios 
                WHERE rol = 'medico_especialista' 
                AND especialidad = ? 
                AND activo = 1
                ORDER BY nombre
            `;
            const rows = await database.all(sql, [especialidad]);
            return rows.map(row => new User(row));
        } catch (error) {
            throw new Error(`Error al obtener médicos: ${error.message}`);
        }
    }

    static async getPacientes() {
        try {
            const sql = `
                SELECT * FROM usuarios 
                WHERE rol = 'paciente' 
                AND activo = 1
                ORDER BY nombre
            `;
            const rows = await database.all(sql);
            return rows.map(row => new User(row));
        } catch (error) {
            throw new Error(`Error al obtener pacientes: ${error.message}`);
        }
    }

    toJSON() {
        const user = { ...this };
        delete user.password_hash;
        return user;
    }
}

export default User;