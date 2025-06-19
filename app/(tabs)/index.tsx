// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { initDatabase } from '../../scripts/db';
import db from '../../scripts/db';

interface Lista {
  id: number;
  nombre: string;
  fecha_creacion: string;
}

export default function Home() {
  const [listas, setListas] = useState<Lista[]>([]);

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Mis Listas</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons name="add-circle" size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={listas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>Ver todo</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.taskRow}>
              <Ionicons name="time-outline" size={16} color="#BDBDBD" />
              <Text style={styles.taskText}>Creado el {item.fecha_creacion}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>
            No hay listas todavía.
          </Text>
        }
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
