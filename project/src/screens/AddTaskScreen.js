import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const PRIMARY_DARK_BLUE_GRAY = '#37474f';
const BACKGROUND_LIGHT_CREAM = '#f9f9f9'; 
const TEXT_DARK = '#333';
const TEXT_LIGHT_GRAY = '#555';
const BORDER_GRAY = '#ddd';
const INPUT_BACKGROUND_WHITE = '#fff';
const PRIORITY_LOW_COLOR = '#2ecc71';
const PRIORITY_NORMAL_COLOR = '#f39c12';
const PRIORITY_HIGH_COLOR = '#e74c3c';
const PRIORITY_ACTIVE_BACKGROUND_LOW = '#2ecc7122';
const PRIORITY_ACTIVE_BACKGROUND_NORMAL = '#f39c1222';
const PRIORITY_ACTIVE_BACKGROUND_HIGH = '#e74c3c22';
const CATEGORY_BUTTON_BACKGROUND = '#f0f0f0';
const CATEGORY_BUTTON_ACTIVE_BACKGROUND = PRIMARY_DARK_BLUE_GRAY;
const BUTTON_CANCEL_BACKGROUND = '#f0f0f0';
const BUTTON_SAVE_BACKGROUND = PRIMARY_DARK_BLUE_GRAY;
const BUTTON_TEXT_COLOR = TEXT_LIGHT_GRAY;
const BUTTON_SAVE_TEXT_COLOR = '#fff';

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
            placeholderTextColor={TEXT_LIGHT_GRAY}
            color={TEXT_DARK}
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
            <Ionicons name="calendar-outline" size={20} color={TEXT_LIGHT_GRAY} />
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
            placeholderTextColor={TEXT_LIGHT_GRAY}
            color={TEXT_DARK}
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
    backgroundColor: BACKGROUND_LIGHT_CREAM,
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
    color: TEXT_DARK,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: INPUT_BACKGROUND_WHITE,
    fontSize: 16,
    color: TEXT_DARK,
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
    borderColor: BORDER_GRAY,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: INPUT_BACKGROUND_WHITE,
  },
  priorityButtonActive: {
    borderColor: PRIMARY_DARK_BLUE_GRAY,
  },
  priorityLow: {
    borderLeftColor: PRIORITY_LOW_COLOR,
    borderLeftWidth: 4,
  },
  priorityNormal: {
    borderLeftColor: PRIORITY_NORMAL_COLOR,
    borderLeftWidth: 4,
  },
  priorityHigh: {
    borderLeftColor: PRIORITY_HIGH_COLOR,
    borderLeftWidth: 4,
  },
  priorityLowActive: {
    backgroundColor: PRIORITY_ACTIVE_BACKGROUND_LOW,
  },
  priorityNormalActive: {
    backgroundColor: PRIORITY_ACTIVE_BACKGROUND_NORMAL,
  },
  priorityHighActive: {
    backgroundColor: PRIORITY_ACTIVE_BACKGROUND_HIGH,
  },
  priorityText: {
    color: TEXT_LIGHT_GRAY,
  },
  priorityTextActive: {
    color: PRIMARY_DARK_BLUE_GRAY,
    fontWeight: '600',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: CATEGORY_BUTTON_BACKGROUND,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: CATEGORY_BUTTON_ACTIVE_BACKGROUND,
  },
  categoryText: {
    color: TEXT_LIGHT_GRAY,
  },
  categoryTextActive: {
    color: '#fff',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER_GRAY,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: INPUT_BACKGROUND_WHITE,
  },
  dateButtonText: {
    marginLeft: 8,
    color: TEXT_LIGHT_GRAY,
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
    backgroundColor: BUTTON_CANCEL_BACKGROUND,
  },
  saveButton: {
    backgroundColor: BUTTON_SAVE_BACKGROUND,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: BUTTON_TEXT_COLOR,
  },
  saveButtonText: {
    color: BUTTON_SAVE_TEXT_COLOR,
  },
});