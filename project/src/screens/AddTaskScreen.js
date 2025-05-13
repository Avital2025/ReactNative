import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Button, 
  StyleSheet, 
  Alert, 
  Text, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddTaskScreen({ navigation, route }) {
  const editTask = route.params?.task;
  const editIndex = route.params?.index;
  const isEditing = !!editTask;

  const [task, setTask] = useState(isEditing ? (typeof editTask === 'string' ? editTask : editTask.text) : '');
  const [priority, setPriority] = useState(isEditing && editTask.priority ? editTask.priority : 'normal');
  const [category, setCategory] = useState(isEditing && editTask.category ? editTask.category : '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueDate, setDueDate] = useState(isEditing && editTask.dueDate ? new Date(editTask.dueDate) : null);
  const [notes, setNotes] = useState(isEditing && editTask.notes ? editTask.notes : '');

  const categories = ['Personal', 'Work', 'Shopping', 'Health', 'Other'];

  const saveTask = async () => {
    if (!task.trim()) {
      Alert.alert('Error', 'Please enter a task.');
      return;
    }

    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      
      const taskObj = {
        text: task,
        completed: isEditing && editTask.completed ? editTask.completed : false,
        priority,
        category: category || null,
        dueDate: dueDate ? dueDate.toDateString() : null,
        notes: notes || null,
        createdAt: isEditing && editTask.createdAt ? editTask.createdAt : new Date().toISOString(),
      };

      if (isEditing) {
        tasks[editIndex] = taskObj;
      } else {
        tasks.push(taskObj);
      }

      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save task');
      console.error(error);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>Task</Text>
          <TextInput
            placeholder="Enter a task"
            value={task}
            onChangeText={setTask}
            style={styles.input}
          />

          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            {['low', 'normal', 'high'].map((p) => (
              <TouchableOpacity 
                key={p} 
                style={[
                  styles.priorityButton, 
                  priority === p && styles.priorityButtonActive,
                  p === 'low' && styles.priorityLow,
                  p === 'normal' && styles.priorityNormal,
                  p === 'high' && styles.priorityHigh,
                  priority === p && p === 'low' && styles.priorityLowActive,
                  priority === p && p === 'normal' && styles.priorityNormalActive,
                  priority === p && p === 'high' && styles.priorityHighActive,
                ]}
                onPress={() => setPriority(p)}
              >
                <Text style={[
                  styles.priorityText,
                  priority === p && styles.priorityTextActive
                ]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity 
                  key={cat} 
                  style={[
                    styles.categoryButton, 
                    category === cat && styles.categoryButtonActive
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[
                    styles.categoryText,
                    category === cat && styles.categoryTextActive
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#555" />
            <Text style={styles.dateButtonText}>
              {dueDate ? dueDate.toDateString() : 'Set due date'}
            </Text>
          </TouchableOpacity>
          
          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          <Text style={styles.label}>Notes</Text>
          <TextInput
            placeholder="Add notes (optional)"
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, styles.notesInput]}
            multiline
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={saveTask}
            >
              <Text style={[styles.buttonText, styles.saveButtonText]}>
                {isEditing ? 'Update Task' : 'Save Task'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  priorityButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  priorityButtonActive: {
    borderColor: '#3498db',
  },
  priorityLow: {
    borderLeftColor: '#2ecc71',
    borderLeftWidth: 4,
  },
  priorityNormal: {
    borderLeftColor: '#f39c12',
    borderLeftWidth: 4,
  },
  priorityHigh: {
    borderLeftColor: '#e74c3c',
    borderLeftWidth: 4,
  },
  priorityLowActive: {
    backgroundColor: '#2ecc7122',
  },
  priorityNormalActive: {
    backgroundColor: '#f39c1222',
  },
  priorityHighActive: {
    backgroundColor: '#e74c3c22',
  },
  priorityText: {
    color: '#555',
  },
  priorityTextActive: {
    color: '#3498db',
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#3498db',
  },
  categoryText: {
    color: '#555',
  },
  categoryTextActive: {
    color: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    marginLeft: 8,
    color: '#555',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
  },
  saveButtonText: {
    color: '#fff',
  },
});