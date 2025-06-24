// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {  Alert,  Dimensions,  FlatList,  Modal,  Pressable,  SafeAreaView,  ScrollView,  StyleSheet,  Text,  TextInput,  TouchableOpacity,  View,} from 'react-native';
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
  estatus: string;
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
  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [tareaSeleccionada, setTareaSeleccionada] = useState<Tarea | null>(null);
  const [tareasPorLista, setTareasPorLista] = useState<{ [key: number]: Tarea[] }>({});
  const [tituloEditado, setTituloEditado] = useState('');
  const [descripcionEditada, setDescripcionEditada] = useState('');

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

  const guardarLista = async () => {
    if (!nombreLista.trim()) {
      Alert.alert('Campo requerido', 'Por favor completa el nombre de la lista.');
      return;
    }

    try {
      const fechaActual = new Date().toISOString().split('T')[0];
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

  const abrirModalTarea = async (idLista: number) => {
    setListaSeleccionadaId(idLista);
    setTituloTarea('');
    setDescripcionTarea('');
    await fetchTareasDeLista(idLista);
    setModalTareaVisible(true);
  };

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

      await db.runAsync(
        `INSERT INTO tareas (id_lista, titulo, descripcion, estatus, fecha_creacion, fecha_vencimiento) VALUES (?, ?, ?, ?, ?, ?)`,
        [listaSeleccionadaId, tituloTarea, descripcionTarea, 'pendiente', fechaCreacionStr, fechaVencimientoStr]
      );

      await fetchTareasDeLista(listaSeleccionadaId);
      setTituloTarea('');
      setDescripcionTarea('');
      Alert.alert('Tarea creada', 'La tarea se agregó correctamente.');
    } catch (error) {
      console.error('Error al guardar la tarea:', error);
      Alert.alert('Error', 'No se pudo guardar la tarea.');
    }
  };

  const abrirModalDetalleTarea = (tarea: Tarea) => {
    setTareaSeleccionada(tarea);
    setTituloEditado(tarea.titulo);
    setDescripcionEditada(tarea.descripcion);
    setModalDetalleVisible(true);
  };

  const eliminarTarea = async (id: number) => {
    await db.runAsync('DELETE FROM tareas WHERE id = ?', [id]);
    if (listaSeleccionadaId) await fetchTareasDeLista(listaSeleccionadaId);
    setModalDetalleVisible(false);
  };

  const completarTarea = async (id: number) => {
    const fecha = new Date().toISOString().split('T')[0];
    await db.runAsync('UPDATE tareas SET estatus = ?, fecha_modificacion = ? WHERE id = ?', [
      'realizada',
      fecha,
      id,
    ]);
    if (listaSeleccionadaId) await fetchTareasDeLista(listaSeleccionadaId);
    setModalDetalleVisible(false);
  };

  const editarTarea = async () => {
    if (!tareaSeleccionada) return;

    const fechaModificacion = new Date().toISOString().split('T')[0];

    try {
      await db.runAsync(
        'UPDATE tareas SET titulo = ?, descripcion = ?, fecha_modificacion = ? WHERE id = ?',
        [tituloEditado, descripcionEditada, fechaModificacion, tareaSeleccionada.id]
      );
      if (listaSeleccionadaId) await fetchTareasDeLista(listaSeleccionadaId);
      Alert.alert('Éxito', 'La tarea fue actualizada correctamente.');
      setModalDetalleVisible(false);
    } catch (error) {
      console.error('Error al editar tarea:', error);
      Alert.alert('Error', 'No se pudo editar la tarea.');
    }
  };

  const estadoTarea = (tarea: Tarea) => {
    const hoyStr = new Date().toISOString().split('T')[0];
    if (tarea.estatus === 'realizada') return { color: '#4CAF50', texto: 'Realizada' };
    if (tarea.estatus === 'pendiente' && tarea.fecha_vencimiento && tarea.fecha_vencimiento < hoyStr)
      return { color: '#F44336', texto: 'Vencida' };
    return { color: '#FF9800', texto: 'Pendiente' };
  };

  const esEditable = (tarea: Tarea) => tarea.estatus === 'pendiente';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Mis Listas</Text>
        <TouchableOpacity onPress={() => setModalListaVisible(true)}>
          <Ionicons name="add-circle" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>

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

                {tareas.map((tarea) => {
                  const estado = estadoTarea(tarea);
                  return (
                    <TouchableOpacity key={tarea.id} onPress={() => abrirModalDetalleTarea(tarea)}>
                      <View style={styles.tareaRow}>
                        <View style={[styles.circuloEstado, { backgroundColor: estado.color }]} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.tituloTarea}>{tarea.titulo}</Text>
                          <Text style={styles.descripcionTarea}>{tarea.descripcion}</Text>
                        </View>
                        <Text style={[styles.estadoTexto, { color: estado.color }]}>{estado.texto}</Text>
                      </View>
                    </TouchableOpacity>
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

      {/* Modal nueva lista */}
      <Modal animationType="slide" transparent visible={modalListaVisible}>
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

      {/* Modal nueva tarea */}
      <Modal animationType="slide" transparent visible={modalTareaVisible}>
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
              multiline
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

      {/* Modal detalle / edicion tarea */}
      <Modal visible={modalDetalleVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContainer}>
            {tareaSeleccionada && (
              <>
                <Text style={styles.modalTitle}>
                  {esEditable(tareaSeleccionada) ? 'Editar Tarea' : 'Detalle de Tarea'}
                </Text>

                <TextInput
                  value={tituloEditado}
                  onChangeText={setTituloEditado}
                  style={styles.input}
                  placeholder="Título"
                  editable={esEditable(tareaSeleccionada)}
                />

                <TextInput
                  value={descripcionEditada}
                  onChangeText={setDescripcionEditada}
                  style={[styles.input, { height: 80 }]}
                  placeholder="Descripción"
                  multiline
                  editable={esEditable(tareaSeleccionada)}
                />

                <Text style={{ color: '#777' }}>
                  Creado: {tareaSeleccionada.fecha_creacion}
                </Text>
                <Text style={{ color: '#777' }}>
                  Vence: {tareaSeleccionada.fecha_vencimiento || 'Sin fecha'}
                </Text>
                <Text style={{ color: '#777', marginBottom: 10 }}>
                  Última modificación: {tareaSeleccionada.fecha_modificacion || 'Sin modificaciones'}
                </Text>

                <Pressable
                  onPress={() =>
                    Alert.alert(
                      'Confirmar eliminación',
                      '¿Estás seguro de eliminar esta tarea?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar',
                          style: 'destructive',
                          onPress: () => eliminarTarea(tareaSeleccionada.id),
                        },
                      ]
                    )
                  }
                  style={{ marginBottom: 15 }}
                >
                  <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 16 }}>🗑 Eliminar Tarea</Text>
                </Pressable>

                {esEditable(tareaSeleccionada) && (
                  <>
                    <Pressable onPress={editarTarea} style={{ marginBottom: 10 }}>
                      <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>💾 Guardar Cambios</Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        Alert.alert(
                          'Confirmar',
                          '¿Marcar esta tarea como realizada?',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Confirmar',
                              onPress: () => completarTarea(tareaSeleccionada.id),
                            },
                          ]
                        )
                      }
                      style={{ marginBottom: 10 }}
                    >
                      <Text style={{ color: 'green', fontWeight: 'bold' }}>✅ Marcar como Realizada</Text>
                    </Pressable>
                  </>
                )}

                <Pressable onPress={() => setModalDetalleVisible(false)}>
                  <Text style={{ color: '#000', fontWeight: 'bold' }}>❌ Cerrar</Text>
                </Pressable>
              </>
            )}
          </ScrollView>
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
    maxHeight: '90%',
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
