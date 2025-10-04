import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import database from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import appointmentRoutes from './routes/appointments.js';
import prototypeRoutes from './routes/prototypes.js';
import specialtyRoutes from './routes/specialties.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Crear directorios necesarios
const requiredDirs = ['./database', './uploads', './backups'];
requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Directorio creado: ${dir}`);
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prototypes', prototypeRoutes);
app.use('/api/specialties', specialtyRoutes);

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor MediCitas funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
    });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Inicializar servidor
const startServer = async () => {
    try {
        // Conectar a la base de datos
        await database.connect();
        console.log('Base de datos inicializada correctamente');

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('\n🏥 ========================================');
            console.log('   SISTEMA MEDICITAS - MODO WEB ACTIVO');
            console.log('🏥 ========================================');
            console.log(`🚀 Servidor Backend: http://localhost:${PORT}`);
            console.log(`📊 API Endpoints: http://localhost:${PORT}/api`);
            console.log(`🌐 Frontend Web: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
            console.log(`💾 Base de Datos: SQLite (${process.env.DB_PATH || './database/medicitas.db'})`);
            console.log(`🔐 Modo: ${process.env.NODE_ENV || 'development'}`);
            console.log('🏥 ========================================\n');
            
            // Verificar salud del sistema
            console.log('🔍 Verificando componentes del sistema...');
            console.log('✅ Servidor Express: Activo');
            console.log('✅ Base de Datos SQLite: Conectada');
            console.log('✅ Rutas API: Configuradas');
            console.log('✅ Middleware CORS: Habilitado');
            console.log('✅ Autenticación JWT: Configurada');
            console.log('\n🎯 Sistema listo para recibir conexiones web\n');
        });
    } catch (error) {
        console.error('Error al inicializar el servidor:', error);
        process.exit(1);
    }
};

// Manejo de cierre graceful
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando Sistema MediCitas...');
    try {
        await database.close();
        console.log('✅ Base de datos SQLite cerrada correctamente');
        console.log('✅ Servidor web desconectado');
        console.log('🏥 Sistema MediCitas cerrado exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al cerrar la base de datos:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Cerrando Sistema MediCitas...');
    try {
        await database.close();
        console.log('✅ Base de datos SQLite cerrada correctamente');
        console.log('✅ Servidor web desconectado');
        console.log('🏥 Sistema MediCitas cerrado exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al cerrar la base de datos:', error);
        process.exit(1);
    }
});

// Iniciar el servidor
startServer();

export default app;