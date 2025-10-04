import { v4 as uuidv4 } from 'uuid';
import database from '../config/database.js';

class Prototype {
    constructor(data) {
        this.id = data.id;
        this.titulo = data.titulo;
        this.descripcion = data.descripcion;
        this.categoria = data.categoria;
        this.dispositivo = data.dispositivo;
        this.imagen_url = data.imagen_url;
        this.creado_por = data.creado_por;
        this.fecha_creacion = data.fecha_creacion;
        this.fecha_actualizacion = data.fecha_actualizacion;
        
        // Datos relacionados
        this.creador_nombre = data.creador_nombre;
    }

    static async create(prototypeData) {
        try {
            const id = uuidv4();
            
            const sql = `
                INSERT INTO prototipos_alta_fidelidad (
                    id, titulo, descripcion, categoria, dispositivo, imagen_url, creado_por
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                id, prototypeData.titulo, prototypeData.descripcion,
                prototypeData.categoria, prototypeData.dispositivo,
                prototypeData.imagen_url, prototypeData.creado_por
            ];

            await database.run(sql, params);
            return await Prototype.findById(id);
        } catch (error) {
            throw new Error(`Error al crear prototipo: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const sql = `
                SELECT 
                    p.*,
                    u.nombre as creador_nombre
                FROM prototipos_alta_fidelidad p
                JOIN usuarios u ON p.creado_por = u.id
                WHERE p.id = ?
            `;
            const row = await database.get(sql, [id]);
            return row ? new Prototype(row) : null;
        } catch (error) {
            throw new Error(`Error al buscar prototipo: ${error.message}`);
        }
    }

    static async findAll(filters = {}) {
        try {
            let sql = `
                SELECT 
                    p.*,
                    u.nombre as creador_nombre
                FROM prototipos_alta_fidelidad p
                JOIN usuarios u ON p.creado_por = u.id
                WHERE 1=1
            `;
            const params = [];

            if (filters.categoria) {
                sql += ' AND p.categoria = ?';
                params.push(filters.categoria);
            }

            if (filters.dispositivo) {
                sql += ' AND p.dispositivo = ?';
                params.push(filters.dispositivo);
            }

            if (filters.creado_por) {
                sql += ' AND p.creado_por = ?';
                params.push(filters.creado_por);
            }

            if (filters.search) {
                sql += ' AND (p.titulo LIKE ? OR p.descripcion LIKE ?)';
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm);
            }

            sql += ' ORDER BY p.fecha_actualizacion DESC';

            if (filters.limit) {
                sql += ' LIMIT ?';
                params.push(filters.limit);
            }

            const rows = await database.all(sql, params);
            return rows.map(row => new Prototype(row));
        } catch (error) {
            throw new Error(`Error al obtener prototipos: ${error.message}`);
        }
    }

    static async update(id, prototypeData) {
        try {
            const fields = [];
            const params = [];

            Object.keys(prototypeData).forEach(key => {
                if (key !== 'id' && key !== 'creado_por' && prototypeData[key] !== undefined) {
                    fields.push(`${key} = ?`);
                    params.push(prototypeData[key]);
                }
            });

            if (fields.length === 0) {
                throw new Error('No hay campos para actualizar');
            }

            params.push(id);
            const sql = `UPDATE prototipos_alta_fidelidad SET ${fields.join(', ')} WHERE id = ?`;
            
            const result = await database.run(sql, params);
            
            if (result.changes === 0) {
                throw new Error('Prototipo no encontrado');
            }

            return await Prototype.findById(id);
        } catch (error) {
            throw new Error(`Error al actualizar prototipo: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const sql = 'DELETE FROM prototipos_alta_fidelidad WHERE id = ?';
            const result = await database.run(sql, [id]);
            
            if (result.changes === 0) {
                throw new Error('Prototipo no encontrado');
            }

            return true;
        } catch (error) {
            throw new Error(`Error al eliminar prototipo: ${error.message}`);
        }
    }

    static async getByCategory(categoria) {
        try {
            const sql = `
                SELECT 
                    p.*,
                    u.nombre as creador_nombre
                FROM prototipos_alta_fidelidad p
                JOIN usuarios u ON p.creado_por = u.id
                WHERE p.categoria = ?
                ORDER BY p.fecha_actualizacion DESC
            `;
            const rows = await database.all(sql, [categoria]);
            return rows.map(row => new Prototype(row));
        } catch (error) {
            throw new Error(`Error al obtener prototipos por categoría: ${error.message}`);
        }
    }

    static async getByDevice(dispositivo) {
        try {
            const sql = `
                SELECT 
                    p.*,
                    u.nombre as creador_nombre
                FROM prototipos_alta_fidelidad p
                JOIN usuarios u ON p.creado_por = u.id
                WHERE p.dispositivo = ?
                ORDER BY p.fecha_actualizacion DESC
            `;
            const rows = await database.all(sql, [dispositivo]);
            return rows.map(row => new Prototype(row));
        } catch (error) {
            throw new Error(`Error al obtener prototipos por dispositivo: ${error.message}`);
        }
    }
}

export default Prototype;