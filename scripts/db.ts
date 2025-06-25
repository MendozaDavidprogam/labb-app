import * as SQLite from 'expo-sqlite';

let db = SQLite.openDatabaseSync('tasks.db');


export const initDatabase = async () => {
  try {
    await db.execAsync(`
      BEGIN;

      CREATE TABLE IF NOT EXISTS listas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        fecha_creacion TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_lista INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        estatus TEXT NOT NULL,
        fecha_creacion TEXT NOT NULL,
        fecha_vencimiento TEXT,
        fecha_modificacion TEXT,
        FOREIGN KEY(id_lista) REFERENCES listas(id)
      );

      COMMIT;
    `);

    console.log('Base de datos inicializada correctamente.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
};

export default db;