import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TaskItem({ task, onComplete, onDelete, completed, priority }) {
  // Keep original functionality
  return (
    <View style={[
      styles.item, 
      completed && styles.completedItem,
      priority === 'high' && styles.highPriority,
      priority === 'medium' && styles.mediumPriority,
      priority === 'low' && styles.lowPriority,
    ]}>
      <TouchableOpacity style={styles.checkbox} onPress={onComplete}>
        <View style={[styles.checkboxInner, completed && styles.checkboxChecked]}>
          {completed && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={[styles.taskText, completed && styles.completedText]}>{task.text || task}</Text>
        {task.dueDate && (
          <Text style={styles.dueDate}>
            <Ionicons name="calendar-outline" size={12} color="#666" /> {task.dueDate}
          </Text>
        )}
        {task.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{task.category}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  completedItem: {
    backgroundColor: '#f8f8f8',
    opacity: 0.8,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3498db',
  },
  textContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
  dueDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  highPriority: {
    borderLeftWidth: 5,
    borderLeftColor: '#e74c3c',
  },
  mediumPriority: {
    borderLeftWidth: 5,
    borderLeftColor: '#f39c12',
  },
  lowPriority: {
    borderLeftWidth: 5,
    borderLeftColor: '#2ecc71',
  },
  categoryBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 10,
    color: '#555',
  },
});