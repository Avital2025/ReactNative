import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  StatusBar,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TaskItem from "../components/TaskItem";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

const TEXT_DARK = '#333';
const TEXT_LIGHT = '#777';
const BACKGROUND_LIGHT = '#f9f9f9'; 
const PRIMARY_COLOR = '#37474f'; 
const SECONDARY_COLOR = '#aed581';

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const searchInputRef = useRef(null);
  const swipeableRefs = useRef({});

  useFocusEffect(useCallback(() => { loadTasks(); }, []));
  useEffect(() => { applyFiltersAndSort(tasks); }, [tasks, filter, sortBy, searchQuery]);

  const loadTasks = async () => {
    try {
      const stored = await AsyncStorage.getItem("tasks");
      const loaded = stored ? JSON.parse(stored).map(t => typeof t === 'string' ? { text: t, completed: false } : t) : [];
      setTasks(loaded);
      applyFiltersAndSort(loaded);
    } catch (error) {
      console.error("Load failed", error);
      Alert.alert("Error", "Could not load tasks.");
    }
  };

  const applyFiltersAndSort = (taskList) => {
    let result = [...taskList];
    if (searchQuery) result = result.filter(t => (t.text || t).toLowerCase().includes(searchQuery.toLowerCase()));
    if (filter === "active") result = result.filter(t => !t.completed);
    if (filter === "completed") result = result.filter(t => t.completed);
    if (sortBy === "priority") {
      const order = { high: 0, normal: 1, low: 2, undefined: 3 };
      result.sort((a, b) => (order[a.priority] || 3) - (order[b.priority] || 3));
    } else if (sortBy === "date") {
      result.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    setFilteredTasks(result);
  };

  const updateTask = async (index, update) => {
    const taskToUpdate = filteredTasks[index];
    const taskIndex = tasks.findIndex(t => (typeof t === 'string' && t === taskToUpdate) || (typeof t !== 'string' && t.text === taskToUpdate.text && t.createdAt === taskToUpdate.createdAt));
    if (taskIndex !== -1) {
      const updatedTasks = [...tasks];
      updatedTasks[taskIndex] = typeof updatedTasks[taskIndex] === 'string' ? { text: updatedTasks[taskIndex], ...update } : { ...updatedTasks[taskIndex], ...update };
      setTasks(updatedTasks);
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
    }
  };

  const toggleComplete = (index) => updateTask(index, { completed: !filteredTasks[index].completed });
  const deleteTask = (index) => {
    const taskToDelete = filteredTasks[index];
    const updatedTasks = tasks.filter(t => (typeof t === 'string' && t !== taskToDelete) || (typeof t !== 'string' && (t.text !== taskToDelete.text || t.createdAt !== taskToDelete.createdAt)));
    setTasks(updatedTasks);
    AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
  };
  const editTask = (index) => {
    const taskToEdit = filteredTasks[index];
    const originalTask = tasks.find(t => (typeof t === 'string' && t === taskToEdit) || (typeof t !== 'string' && t.text === taskToEdit.text && t.createdAt === taskToEdit.createdAt));
    navigation.navigate("AddTask", { task: originalTask, index: tasks.indexOf(originalTask) });
  };
  const clearCompleted = () => setTasks(tasks.filter(t => typeof t === 'string' || !t.completed), () => AsyncStorage.setItem("tasks", JSON.stringify(tasks.filter(t => typeof t === 'string' || !t.completed))));
  const toggleSearch = () => { setShowSearch(!showSearch); if (!showSearch) setTimeout(() => searchInputRef.current?.focus(), 100); else setSearchQuery(""); };
  const toggleFilters = () => setShowFilters(!showFilters);

  const renderRightActions = ({ index }) => (
    <View style={styles.rightActions}>
      <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => { swipeableRefs.current[index]?.close(); editTask(index); }}>
        <Ionicons name="pencil-outline" size={24} color={TEXT_DARK} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => { swipeableRefs.current[index]?.close(); deleteTask(index); }}>
        <Ionicons name="trash-outline" size={24} color={TEXT_DARK} />
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item, index }) => (
    <Swipeable ref={(ref) => (swipeableRefs.current[index] = ref)} renderRightActions={() => renderRightActions({ index })} rightThreshold={40}>
      <TaskItem
        task={item}
        onComplete={() => toggleComplete(index)}
        completed={typeof item !== "string" && item.completed}
        priority={typeof item !== "string" ? item.priority : null}
        textColor={TEXT_DARK}
        secondaryTextColor={TEXT_LIGHT}
        itemBackgroundColor="#fff" 
        completedItemBackgroundColor="#eee"
        priorityColors={{ high: '#ef5350', normal: '#ffca28', low: '#66bb6a' }}
      />
    </Swipeable>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={BACKGROUND_LIGHT} />
      <View style={styles.header}>
        <Text style={styles.title}>My Tasks</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={toggleSearch} style={styles.iconButton}>
            <Ionicons name={showSearch ? "close-outline" : "search-outline"} size={24} color={TEXT_DARK} />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleFilters} style={styles.iconButton}>
            <Ionicons name="filter-outline" size={24} color={TEXT_DARK} />
          </TouchableOpacity>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={TEXT_LIGHT} style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search tasks..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            placeholderTextColor={TEXT_LIGHT}
            color={TEXT_DARK}
            backgroundColor="#fff"
          />
        </View>
      )}

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterOptions}>
              {["all", "active", "completed"].map(option => (
                <TouchableOpacity
                  key={option}
                  style={[styles.filterOption, filter === option && styles.filterOptionActive]}
                  onPress={() => setFilter(option)}
                >
                  <Text style={[styles.filterText, filter === option && styles.filterTextActive]}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Sort by:</Text>
            <View style={styles.filterOptions}>
              {[{ id: "date", label: "Date", icon: "calendar-outline" }, { id: "priority", label: "Priority", icon: "flag-outline" }].map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.filterOption, sortBy === option.id && styles.filterOptionActive]}
                  onPress={() => setSortBy(option.id)}
                >
                  <Ionicons name={option.icon} size={18} color={sortBy === option.id ? TEXT_DARK : TEXT_LIGHT} style={{ marginRight: 5 }} />
                  <Text style={[styles.filterText, sortBy === option.id && styles.filterTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {filter === "completed" && (
            <TouchableOpacity style={styles.clearButton} onPress={clearCompleted}>
              <Text style={styles.clearButtonText}>Clear completed</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={filteredTasks}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks here yet!</Text>}
      />

      <View style={styles.footer}>
        <Text style={styles.tasksLeft}>{tasks.filter(t => typeof t === 'string' || !t.completed).length} tasks left</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddTask")}>
          <Ionicons name="add-outline" size={30} color={TEXT_DARK} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT,
  },
  header: {
    backgroundColor: BACKGROUND_LIGHT,
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT_DARK,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10,
    color: TEXT_LIGHT,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: TEXT_DARK,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    elevation: 2,
  },
  filterRow: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 5,
  },
  filterOptions: {
    flexDirection: 'row',
  },
  filterOption: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterOptionActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  filterText: {
    color: TEXT_DARK,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 10,
  },
  emptyText: {
    fontSize: 18,
    color: TEXT_LIGHT,
    textAlign: 'center',
    marginTop: 50,
  },
  footer: {
    backgroundColor: BACKGROUND_LIGHT,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  tasksLeft: {
    fontSize: 16,
    color: TEXT_LIGHT,
  },
  addButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  rightActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 60,
    height: '100%',
    
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: PRIMARY_COLOR,
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
});