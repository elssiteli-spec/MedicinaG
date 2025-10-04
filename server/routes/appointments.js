import express from 'express';
import Appointment from '../models/Appointment.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// GET /api/appointments - Obtener todas las citas
router.get('/', auth, async (req, res) => {
    try {
        const filters = {
            paciente_id: req.query.paciente_id,
            medico_id: req.query.medico_id,
            estado: req.query.estado,
            fecha_desde: req.query.fecha_desde,
            fecha_hasta: req.query.fecha_hasta,
            search: req.query.search,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined
        };

        const appointments = await Appointment.findAll(filters);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/appointments/:id - Obtener cita por ID
router.get('/:id', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/appointments - Crear nueva cita
router.post('/', auth, async (req, res) => {
    try {
        // Verificar disponibilidad del médico
        const isAvailable = await Appointment.checkAvailability(
            req.body.medico_id,
            req.body.fecha,
            req.body.hora
        );

        if (!isAvailable) {
            return res.status(400).json({ 
                error: 'El médico no está disponible en esa fecha y hora' 
            });
        }

        const appointment = await Appointment.create(req.body);
        res.status(201).json(appointment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PUT /api/appointments/:id - Actualizar cita
router.put('/:id', auth, async (req, res) => {
    try {
        // Si se está cambiando fecha/hora, verificar disponibilidad
        if (req.body.fecha || req.body.hora) {
            const currentAppointment = await Appointment.findById(req.params.id);
            if (!currentAppointment) {
                return res.status(404).json({ error: 'Cita no encontrada' });
            }

            const isAvailable = await Appointment.checkAvailability(
                req.body.medico_id || currentAppointment.medico_id,
                req.body.fecha || currentAppointment.fecha,
                req.body.hora || currentAppointment.hora,
                req.params.id
            );

            if (!isAvailable) {
                return res.status(400).json({ 
                    error: 'El médico no está disponible en esa fecha y hora' 
                });
            }
        }

        const appointment = await Appointment.update(req.params.id, req.body);
        res.json(appointment);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/appointments/:id - Eliminar cita
router.delete('/:id', auth, async (req, res) => {
    try {
        await Appointment.delete(req.params.id);
        res.json({ message: 'Cita eliminada correctamente' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /api/appointments/range/:fechaInicio/:fechaFin - Obtener citas por rango de fechas
router.get('/range/:fechaInicio/:fechaFin', auth, async (req, res) => {
    try {
        const appointments = await Appointment.getByDateRange(
            req.params.fechaInicio,
            req.params.fechaFin
        );
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/appointments/check-availability - Verificar disponibilidad
router.post('/check-availability', auth, async (req, res) => {
    try {
        const { medico_id, fecha, hora, exclude_id } = req.body;
        const isAvailable = await Appointment.checkAvailability(
            medico_id, fecha, hora, exclude_id
        );
        res.json({ available: isAvailable });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;