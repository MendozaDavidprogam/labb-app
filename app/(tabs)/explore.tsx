import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

// Lista simulada de tareas
const tasks = [
  { id: '1', title: 'Estudiar matemáticas', description: 'Resolver ejercicios del capítulo 4' },
  { id: '2', title: 'Proyecto de ciencia', description: 'Construir el modelo del sistema solar' },
  { id: '3', title: 'Leer historia', description: 'Capítulos 5 y 6 del libro de texto' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.title}>HomeworkManager</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Agregar tarea</Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.taskList}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  taskList: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#475569',
  },
});
