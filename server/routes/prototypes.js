import express from 'express';
import Prototype from '../models/Prototype.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/prototypes - Obtener todos los prototipos
router.get('/', auth, async (req, res) => {
    try {
        const filters = {
            categoria: req.query.categoria,
            dispositivo: req.query.dispositivo,
            creado_por: req.query.creado_por,
            search: req.query.search,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined
        };

        const prototypes = await Prototype.findAll(filters);
        res.json(prototypes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/prototypes/:id - Obtener prototipo por ID
router.get('/:id', auth, async (req, res) => {
    try {
        const prototype = await Prototype.findById(req.params.id);
        if (!prototype) {
            return res.status(404).json({ error: 'Prototipo no encontrado' });
        }
        res.json(prototype);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/prototypes - Crear nuevo prototipo
router.post('/', auth, async (req, res) => {
    try {
        const prototypeData = {
            ...req.body,
            creado_por: req.user.id
        };
        const prototype = await Prototype.create(prototypeData);
        res.status(201).json(prototype);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/prototypes/:id - Actualizar prototipo
router.put('/:id', auth, async (req, res) => {
    try {
        const prototype = await Prototype.update(req.params.id, req.body);
        res.json(prototype);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/prototypes/:id - Eliminar prototipo
router.delete('/:id', auth, async (req, res) => {
    try {
        await Prototype.delete(req.params.id);
        res.json({ message: 'Prototipo eliminado correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/prototypes/category/:categoria - Obtener prototipos por categoría
router.get('/category/:categoria', auth, async (req, res) => {
    try {
        const prototypes = await Prototype.getByCategory(req.params.categoria);
        res.json(prototypes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/prototypes/device/:dispositivo - Obtener prototipos por dispositivo
router.get('/device/:dispositivo', auth, async (req, res) => {
    try {
        const prototypes = await Prototype.getByDevice(req.params.dispositivo);
        res.json(prototypes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;