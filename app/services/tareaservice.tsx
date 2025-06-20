import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

const getDb = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('tareas.db');
      console.log('Base de datos conectada');

  }
  return db;
};

export const crearTablaTareas = async () => {
  const db = await getDb();

  await db.execAsync(`

    CREATE TABLE IF NOT EXISTS listas (
      IDLista INTEGER PRIMARY KEY AUTOINCREMENT,
      Nombre TEXT,
      Status TEXT
    );

    }
    CREATE TABLE IF NOT EXISTS tareas (
      IDTarea INTEGER PRIMARY KEY AUTOINCREMENT,
      IDLista INTEGER REFERENCES listas(IDLista),
      Titulo TEXT,
      Descripcion TEXT,
      FechaCreacion TEXT,
      FechaVencimiento TEXT,
      Status TEXT
    );



  `);
};

//agregar una tarea
export const agregarLista = async (
  Nombre: string,
  Status: string
) => {
  const db = await getDb();

  await db.runAsync(
    `INSERT INTO tareas (Nombre, Status)
     VALUES (?, ?)`,
    [Nombre, Status]
  );
};

//agregar una tarea
export const agregarTarea = async (
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

//buscar todas las tareas
export const buscarTareas = async () => {
  const db = await getDb();
  return await db.getAllAsync('SELECT * FROM tareas');
};

//eliminar una tarea
export const eliminarTarea = async (IDTarea: number) => {
  const db = await getDb();
  await db.runAsync('DELETE FROM tareas WHERE IDTarea = ?', [IDTarea]);
};

//completar una tarea (es setear el status)
export const completarTarea = async (IDTarea: number) => {
  const db = await getDb();
  await db.runAsync('UPDATE tareas SET Status = ? WHERE IDTarea = ?', ['Completada', IDTarea]);
};