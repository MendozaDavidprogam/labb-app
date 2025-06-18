import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const dummyData = [
  {
    id: '1',
    title: 'Trabajo',
    tasks: ['Enviar reporte', 'Revisar correos', 'Reunión con equipo'],
  },
  {
    id: '2',
    title: 'Casa',
    tasks: ['Lavar ropa', 'Comprar víveres', 'Sacar basura'],
  },
];

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Mis Listas</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="add-circle" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={dummyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            {item.tasks.map((task, index) => (
              <View style={styles.taskRow} key={index}>
                <Ionicons name="ellipse-outline" size={16} color="#BDBDBD" />
                <Text style={styles.taskText}>{task}</Text>
              </View>
            ))}
          </View>
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
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
  viewAll: {
    color: '#1E88E5',
    fontSize: 14,
    fontWeight: '500',
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
});
