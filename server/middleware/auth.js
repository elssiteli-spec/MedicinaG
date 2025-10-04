import jwt from 'jsonwebtoken';
import database from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medicitas_secret_key_2024';

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Token de acceso requerido' });
        }

        // Verificar token JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Verificar que la sesión esté activa en la base de datos
        const session = await database.get(
            'SELECT * FROM sesiones WHERE token = ? AND activa = 1 AND fecha_expiracion > ?',
            [token, new Date().toISOString()]
        );

        if (!session) {
            return res.status(401).json({ error: 'Sesión inválida o expirada' });
        }

        // Agregar información del usuario a la request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            rol: decoded.rol
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        return res.status(500).json({ error: 'Error de autenticación' });
    }
};

export default auth;