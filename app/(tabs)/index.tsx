import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {Alert, Dimensions, FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import db, { initDatabase } from '../../scripts/db';

interface Lista {
  id: number;
  nombre: string;
  fecha_creacion: string;
}

interface Tarea {
  id: number;
  id_lista: number;
  titulo: string;
  descripcion: string;
  estatus: string; // 'pendiente' | 'realizada'
  fecha_creacion: string;
  fecha_vencimiento: string | null;
  fecha_modificacion: string | null;
}

export default function Home() {
  const [listas, setListas] = useState<Lista[]>([]);
  const [modalListaVisible, setModalListaVisible] = useState(false);
  const [nombreLista, setNombreLista] = useState('');

  // Modal y estados tarea
  const [modalTareaVisible, setModalTareaVisible] = useState(false);
  const [listaSeleccionadaId, setListaSeleccionadaId] = useState<number | null>(null);
  const [tituloTarea, setTituloTarea] = useState('');
  const [descripcionTarea, setDescripcionTarea] = useState('');

  // Estado para tareas por lista
  const [tareasPorLista, setTareasPorLista] = useState<{ [key: number]: Tarea[] }>({});

  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      await fetchListas();
    };
    setup();
  }, []);

  const fetchListas = async () => {
    try {
      const result = await db.getAllAsync<Lista>('SELECT * FROM listas');
      setListas(result);
    } catch (error) {
      console.error('Error al obtener listas:', error);
    }
  };

  const fetchTareasDeLista = async (idLista: number) => {
    try {
      const tareas = await db.getAllAsync<Tarea>(
        'SELECT * FROM tareas WHERE id_lista = ? ORDER BY fecha_vencimiento ASC',
        [idLista]
      );
      setTareasPorLista((prev) => ({ ...prev, [idLista]: tareas }));
    } catch (error) {
      console.error('Error al obtener tareas:', error);
    }
  };

  // Guardar nueva lista
  const guardarLista = async () => {
    if (!nombreLista.trim()) {
      Alert.alert('Campo requerido', 'Por favor completa el nombre de la lista.');
      return;
    }

    try {
      const fechaActual = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      await db.runAsync('INSERT INTO listas (nombre, fecha_creacion) VALUES (?, ?)', [
        nombreLista,
        fechaActual,
      ]);

      setModalListaVisible(false);
      setNombreLista('');
      await fetchListas();
    } catch (error) {
      console.error('Error al guardar en la base de datos:', error);
    }
  };

  // Abrir modal para agregar tarea nueva y cargar tareas existentes
  const abrirModalTarea = async (idLista: number) => {
    setListaSeleccionadaId(idLista);
    setTituloTarea('');
    setDescripcionTarea('');
    await fetchTareasDeLista(idLista);
    setModalTareaVisible(true);
  };

  // Guardar tarea nueva
  const guardarTareaNueva = async () => {
    if (!tituloTarea.trim() || !descripcionTarea.trim()) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos.');
      return;
    }

    if (listaSeleccionadaId === null) {
      Alert.alert('Error', 'No se seleccionó ninguna lista.');
      return;
    }

    try {
      const fechaCreacion = new Date();
      const fechaCreacionStr = fechaCreacion.toISOString().split('T')[0];

      const fechaVencimiento = new Date(fechaCreacion);
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 7);
      const fechaVencimientoStr = fechaVencimiento.toISOString().split('T')[0];

      const estatusInicial = 'pendiente';

      await db.runAsync(
        `INSERT INTO tareas (id_lista, titulo, descripcion, estatus, fecha_creacion, fecha_vencimiento) VALUES (?, ?, ?, ?, ?, ?)`,
        [listaSeleccionadaId, tituloTarea, descripcionTarea, estatusInicial, fechaCreacionStr, fechaVencimientoStr]
      );

      // Recargar tareas de la lista
      await fetchTareasDeLista(listaSeleccionadaId);

      setTituloTarea('');
      setDescripcionTarea('');
      Alert.alert('Tarea creada', 'La tarea se agregó correctamente.');
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
      Alert.alert('Error', 'No se pudo guardar la tarea.');
    }
  };

  // Función para determinar estado y color de tarea
  const estadoTarea = (tarea: Tarea) => {
    const hoyStr = new Date().toISOString().split('T')[0];
    if (tarea.estatus === 'realizada') return { color: '#4CAF50', texto: 'Realizada' }; 
    if (tarea.estatus === 'pendiente' && tarea.fecha_vencimiento && tarea.fecha_vencimiento < hoyStr)
      return { color: '#F44336', texto: 'Vencida' }; 
    return { color: '#FF9800', texto: 'Pendiente' }; 
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>📋 Mis Listas</Text>
        <TouchableOpacity onPress={() => setModalListaVisible(true)}>
          <Ionicons name="add-circle" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Lista de listas */}
      <FlatList
        data={listas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const tareas = tareasPorLista[item.id] || [];
          return (
            <TouchableOpacity onPress={() => abrirModalTarea(item.id)}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.nombre}</Text>
                </View>
                <View style={styles.taskRow}>
                  <Ionicons name="time-outline" size={16} color="#BDBDBD" />
                  <Text style={styles.taskText}>Creado el {item.fecha_creacion}</Text>
                </View>

                {/* Mostrar tareas */}
                {tareas.map((tarea) => {
                  const estado = estadoTarea(tarea);
                  return (
                    <View key={tarea.id} style={styles.tareaRow}>
                      <View style={[styles.circuloEstado, { backgroundColor: estado.color }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tituloTarea}>{tarea.titulo}</Text>
                        <Text style={styles.descripcionTarea}>{tarea.descripcion}</Text>
                      </View>
                      <Text style={[styles.estadoTexto, { color: estado.color }]}>{estado.texto}</Text>
                    </View>
                  );
                })}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
            No hay listas todavía.
          </Text>
        }
      />

      {/* Modal para crear nueva lista */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalListaVisible}
        onRequestClose={() => setModalListaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nueva Lista</Text>

            <TextInput
              placeholder="Nombre de la lista"
              value={nombreLista}
              onChangeText={setNombreLista}
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setModalListaVisible(false)} style={{ marginRight: 10 }}>
                <Text style={{ color: 'red' }}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={guardarLista}>
                <Text style={{ color: 'green', fontWeight: 'bold' }}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para agregar nueva tarea */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalTareaVisible}
        onRequestClose={() => setModalTareaVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Nueva Tarea</Text>

            <TextInput
              placeholder="Título"
              value={tituloTarea}
              onChangeText={setTituloTarea}
              style={styles.input}
            />

            <TextInput
              placeholder="Descripción"
              value={descripcionTarea}
              onChangeText={setDescripcionTarea}
              style={[styles.input, { height: 80 }]}
              multiline={true}
            />

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setModalTareaVisible(false)} style={{ marginRight: 10 }}>
                <Text style={{ color: 'red' }}>Cancelar</Text>
              </Pressable>
              <Pressable onPress={guardarTareaNueva}>
                <Text style={{ color: 'green', fontWeight: 'bold' }}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#212121',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: screenWidth - 32,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#424242',
  },
  tareaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  circuloEstado: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 10,
  },
  tituloTarea: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  descripcionTarea: {
    fontSize: 13,
    color: '#666',
  },
  estadoTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 6,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
