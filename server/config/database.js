import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Database {
    constructor() {
        this.db = null;
        this.dbPath = path.join(__dirname, '../database/medicitas.db');
    }

    async connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error al conectar con la base de datos:', err.message);
                    reject(err);
                } else {
                    console.log('Conectado a la base de datos SQLite');
                    this.initializeDatabase().then(resolve).catch(reject);
                }
            });
        });
    }

    async initializeDatabase() {
        try {
            // Leer y ejecutar el schema
            const schemaPath = path.join(__dirname, '../database/schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            
            await this.exec(schema);
            console.log('Schema de base de datos inicializado');

            // Leer y ejecutar los datos iniciales
            const seedPath = path.join(__dirname, '../database/seedData.sql');
            const seedData = fs.readFileSync(seedPath, 'utf8');
            
            await this.exec(seedData);
            console.log('Datos iniciales cargados');

        } catch (error) {
            console.error('Error al inicializar la base de datos:', error);
            throw error;
        }
    }

    async exec(sql) {
        return new Promise((resolve, reject) => {
            this.db.exec(sql, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async close() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Conexión a la base de datos cerrada');
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    getDb() {
        return this.db;
    }
}

export default new Database();