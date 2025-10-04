import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/users - Obtener todos los usuarios
router.get('/', auth, async (req, res) => {
    try {
        const filters = {
            rol: req.query.rol,
            activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
            search: req.query.search,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined
        };

        const users = await User.findAll(filters);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/users - Crear nuevo usuario
router.post('/', auth, async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/users/:id - Actualizar usuario
router.put('/:id', auth, async (req, res) => {
    try {
        const user = await User.update(req.params.id, req.body);
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/users/:id - Eliminar usuario
router.delete('/:id', auth, async (req, res) => {
    try {
        await User.delete(req.params.id);
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/users/medicos/:especialidad - Obtener médicos por especialidad
router.get('/medicos/:especialidad', auth, async (req, res) => {
    try {
        const medicos = await User.getMedicosByEspecialidad(req.params.especialidad);
        res.json(medicos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/users/role/pacientes - Obtener todos los pacientes
router.get('/role/pacientes', auth, async (req, res) => {
    try {
        const pacientes = await User.getPacientes();
        res.json(pacientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;