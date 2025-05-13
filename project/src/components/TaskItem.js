import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY_DARK_BLUE_GRAY = '#37474f'; 
const BACKGROUND_LIGHT_CREAM = '#f9f9f9'; 
const TEXT_DARK = '#212121';
const TEXT_LIGHT = '#757575';
const ACCENT_COLOR = PRIMARY_DARK_BLUE_GRAY; 

export default function TaskItem({ task, onComplete, onDelete, completed, priority, textColor, secondaryTextColor, itemBackgroundColor, completedItemBackgroundColor, priorityColors }) {
  const animation = new Animated.Value(completed ? 1 : 0);

  const checkboxStyle = {
    backgroundColor: animation.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', ACCENT_COLOR]
    }),
    borderColor: ACCENT_COLOR,
  };

  const checkmarkStyle = {
    opacity: animation,
    transform: [{
      scale: animation,
    }]
  };

  Animated.timing(animation, {
    toValue: completed ? 1 : 0,
    duration: 200,
    useNativeDriver: true,
  }).start();

  const priorityIndicatorStyle = {
    height: '100%',
    width: 5,
    position: 'absolute',
    left: 0,
    backgroundColor: priorityColors?.[priority] || 'transparent',
    borderRadius: 3,
  };

  return (
    <View style={[styles.item, { backgroundColor: itemBackgroundColor || BACKGROUND_LIGHT_CREAM }, completed && { backgroundColor: completedItemBackgroundColor || '#e0e0e0', opacity: 0.7 }]}>
      <View style={priorityIndicatorStyle} />
      <TouchableOpacity style={styles.checkbox} onPress={onComplete}>
        <Animated.View style={[styles.checkboxInner, checkboxStyle]}>
          {completed && <Animated.View style={checkmarkStyle}><Ionicons name="checkmark-sharp" size={20} color="#fff" /></Animated.View>}
        </Animated.View>
      </TouchableOpacity>
      <View style={styles.textContainer}>
        <Text style={[styles.taskText, { color: textColor || TEXT_DARK }, completed && styles.completedText]}>{task.text || task}</Text>
        {task.dueDate && (
          <Text style={[styles.dueDate, { color: secondaryTextColor || TEXT_LIGHT }]}>
            <Ionicons name="calendar-outline" size={14} color={secondaryTextColor || TEXT_LIGHT} /> {task.dueDate}
          </Text>
        )}
        {task.category && (
          <View style={[styles.categoryBadge, { backgroundColor: ACCENT_COLOR }]}>
            <Text style={styles.categoryText}>{task.category}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Ionicons name="close-circle-outline" size={24} color="#f44336" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 18,
    borderRadius: 8,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  completedItem: {
    opacity: 0.7,
  },
  checkbox: {
    marginRight: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: TEXT_LIGHT,
  },
  dueDate: {
    fontSize: 13,
    marginTop: 5,
  },
  deleteButton: {
    padding: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
    marginTop: 5,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: '#fff',
  },
});