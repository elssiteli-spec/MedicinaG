import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import database from '../config/database.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'medicitas_secret_key_2024';
const JWT_EXPIRES_IN = '24h';

// POST /api/auth/login - Iniciar sesión
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Validar credenciales
        const user = await User.validatePassword(email, password);
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        if (!user.activo) {
            return res.status(401).json({ error: 'Usuario inactivo' });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                rol: user.rol 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Guardar sesión en la base de datos
        const sessionId = uuidv4();
        const expirationDate = new Date();
        expirationDate.setHours(expirationDate.getHours() + 24);

        await database.run(
            'INSERT INTO sesiones (id, usuario_id, token, fecha_expiracion) VALUES (?, ?, ?, ?)',
            [sessionId, user.id, token, expirationDate.toISOString()]
        );

        res.json({
            message: 'Inicio de sesión exitoso',
            token,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
    try {
        const userData = req.body;

        // Validar campos requeridos
        const requiredFields = ['nombre', 'email', 'password', 'fecha_nacimiento', 'direccion', 'telefono', 'sexo', 'estado_civil', 'rol'];
        for (const field of requiredFields) {
            if (!userData[field]) {
                return res.status(400).json({ error: `El campo ${field} es requerido` });
            }
        }

        // Verificar si el email ya existe
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Crear usuario
        const user = await User.create(userData);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: user.toJSON()
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (token) {
            // Desactivar la sesión en la base de datos
            await database.run(
                'UPDATE sesiones SET activa = 0 WHERE token = ?',
                [token]
            );
        }

        res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/auth/me - Obtener información del usuario actual
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Verificar que la sesión esté activa
        const session = await database.get(
            'SELECT * FROM sesiones WHERE token = ? AND activa = 1 AND fecha_expiracion > ?',
            [token, new Date().toISOString()]
        );

        if (!session) {
            return res.status(401).json({ error: 'Sesión inválida o expirada' });
        }

        // Obtener usuario actual
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(user.toJSON());
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        res.status(500).json({ error: error.message });
    }
});

// POST /api/auth/refresh - Renovar token
router.post('/refresh', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Token no proporcionado' });
        }

        // Verificar token (incluso si está expirado)
        const decoded = jwt.decode(token);
        if (!decoded) {
            return res.status(401).json({ error: 'Token inválido' });
        }

        // Verificar que la sesión exista
        const session = await database.get(
            'SELECT * FROM sesiones WHERE token = ? AND activa = 1',
            [token]
        );

        if (!session) {
            return res.status(401).json({ error: 'Sesión no encontrada' });
        }

        // Obtener usuario
        const user = await User.findById(decoded.id);
        if (!user || !user.activo) {
            return res.status(401).json({ error: 'Usuario no válido' });
        }

        // Generar nuevo token
        const newToken = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                rol: user.rol 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        // Actualizar sesión
        const newExpirationDate = new Date();
        newExpirationDate.setHours(newExpirationDate.getHours() + 24);

        await database.run(
            'UPDATE sesiones SET token = ?, fecha_expiracion = ? WHERE id = ?',
            [newToken, newExpirationDate.toISOString(), session.id]
        );

        res.json({
            message: 'Token renovado exitosamente',
            token: newToken,
            user: user.toJSON()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;