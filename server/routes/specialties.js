import express from 'express';
import database from '../config/database.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/specialties - Obtener todas las especialidades
router.get('/', auth, async (req, res) => {
    try {
        const sql = 'SELECT * FROM especialidades WHERE activa = 1 ORDER BY nombre';
        const specialties = await database.all(sql);
        res.json(specialties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/specialties/:id - Obtener especialidad por ID
router.get('/:id', auth, async (req, res) => {
    try {
        const sql = 'SELECT * FROM especialidades WHERE id = ?';
        const specialty = await database.get(sql, [req.params.id]);
        
        if (!specialty) {
            return res.status(404).json({ error: 'Especialidad no encontrada' });
        }
        
        res.json(specialty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/specialties - Crear nueva especialidad
router.post('/', auth, async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        
        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const sql = 'INSERT INTO especialidades (nombre, descripcion) VALUES (?, ?)';
        const result = await database.run(sql, [nombre, descripcion]);
        
        const newSpecialty = await database.get(
            'SELECT * FROM especialidades WHERE id = ?',
            [result.id]
        );
        
        res.status(201).json(newSpecialty);
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'La especialidad ya existe' });
        }
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/specialties/:id - Actualizar especialidad
router.put('/:id', auth, async (req, res) => {
    try {
        const { nombre, descripcion, activa } = req.body;
        
        const sql = 'UPDATE especialidades SET nombre = ?, descripcion = ?, activa = ? WHERE id = ?';
        const result = await database.run(sql, [nombre, descripcion, activa, req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Especialidad no encontrada' });
        }
        
        const updatedSpecialty = await database.get(
            'SELECT * FROM especialidades WHERE id = ?',
            [req.params.id]
        );
        
        res.json(updatedSpecialty);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/specialties/:id - Eliminar especialidad
router.delete('/:id', auth, async (req, res) => {
    try {
        // Verificar si hay citas asociadas a esta especialidad
        const citasCount = await database.get(
            'SELECT COUNT(*) as count FROM citas WHERE especialidad_id = ?',
            [req.params.id]
        );
        
        if (citasCount.count > 0) {
            return res.status(400).json({ 
                error: 'No se puede eliminar la especialidad porque tiene citas asociadas' 
            });
        }
        
        const sql = 'DELETE FROM especialidades WHERE id = ?';
        const result = await database.run(sql, [req.params.id]);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Especialidad no encontrada' });
        }
        
        res.json({ message: 'Especialidad eliminada correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;