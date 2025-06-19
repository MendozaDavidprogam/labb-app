import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('tareas.db');
  }
  return db;
};

export const crearTablaTareas = async () => {
  const db = await getDb();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tareas (
      IDTarea INTEGER PRIMARY KEY AUTOINCREMENT,
      Titulo TEXT,
      Descripcion TEXT,
      FechaCreacion TEXT,
      FechaVencimiento TEXT,
      Status TEXT
    );
  `);
};

export const insertarTarea = async (
  Titulo: string,
  Descripcion: string,
  FechaCreacion: string,
  FechaVencimiento: string,
  Status: string
) => {
  const db = await getDb();

  await db.runAsync(
    `INSERT INTO tareas (Titulo, Descripcion, FechaCreacion, FechaVencimiento, Status)
     VALUES (?, ?, ?, ?, ?)`,
    [Titulo, Descripcion, FechaCreacion, FechaVencimiento, Status]
  );
};

export const obtenerTareas = async () => {
  const db = await getDb();
  return await db.getAllAsync('SELECT * FROM tareas');
};
