"use client"

import React, { useState, useCallback, useRef } from "react"
import {
  FlatList,
  View,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Text,
  Animated,
  TextInput,
  Alert,
  StatusBar,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import TaskItem from "../components/TaskItem"
import { useFocusEffect } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import { Swipeable } from "react-native-gesture-handler"

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState("all") 
  const [sortBy, setSortBy] = useState("date") 
  const [showSearch, setShowSearch] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const searchInputRef = useRef(null)
  const swipeableRefs = useRef({})

  useFocusEffect(
    useCallback(() => {
      loadTasks()
    }, []),
  )

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks")
      let loadedTasks = storedTasks ? JSON.parse(storedTasks) : []

      // Convert simple string tasks to object format
      loadedTasks = loadedTasks.map((task) => (typeof task === "string" ? { text: task, completed: false } : task))

      setTasks(loadedTasks)
      applyFiltersAndSort(loadedTasks)
    } catch (error) {
      console.error("Failed to load tasks", error)
      Alert.alert("Error", "Failed to load tasks")
    }
  }

  const applyFiltersAndSort = (taskList) => {
    let result = [...taskList]

    // Apply search filter
    if (searchQuery) {
      result = result.filter((task) => (task.text || task).toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Apply status filter
    if (filter === "active") {
      result = result.filter((task) => !task.completed)
    } else if (filter === "completed") {
      result = result.filter((task) => task.completed)
    }

    // Apply sorting
    if (sortBy === "priority") {
      const priorityOrder = { high: 0, normal: 1, low: 2, undefined: 3 }
      result.sort((a, b) => {
        return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3)
      })
    } else if (sortBy === "date") {
      result.sort((a, b) => {
        if (!a.createdAt) return 1
        if (!b.createdAt) return -1
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    }

    setFilteredTasks(result)
  }

  // Watch for changes in tasks, filter, sortBy, and searchQuery
  React.useEffect(() => {
    applyFiltersAndSort(tasks)
  }, [tasks, filter, sortBy, searchQuery])

  const toggleTaskCompletion = async (index) => {
    try {
      // Get the actual task from filteredTasks
      const taskToToggle = filteredTasks[index]

      // Find this exact task object in the original tasks array
      const taskIndex = tasks.findIndex(
        (task) =>
          (typeof task === "string" && typeof taskToToggle === "string" && task === taskToToggle) ||
          (typeof task !== "string" &&
            typeof taskToToggle !== "string" &&
            task.text === taskToToggle.text &&
            task.createdAt === taskToToggle.createdAt),
      )

      if (taskIndex !== -1) {
        const updatedTasks = [...tasks]
        const task = updatedTasks[taskIndex]

        if (typeof task === "string") {
          // Convert string task to object
          updatedTasks[taskIndex] = { text: task, completed: true }
        } else {
          // Toggle completion on object task
          updatedTasks[taskIndex] = {
            ...task,
            completed: !task.completed,
          }
        }

        setTasks(updatedTasks)
        await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks))
      }
    } catch (error) {
      console.error("Failed to update task", error)
      Alert.alert("Error", "Failed to update task")
    }
  }

  const deleteTask = async (index) => {
    try {
      // Get the actual task from filteredTasks
      const taskToDelete = filteredTasks[index]

      // Find this exact task object in the original tasks array
      const taskIndex = tasks.findIndex(
        (task) =>
          (typeof task === "string" && typeof taskToDelete === "string" && task === taskToDelete) ||
          (typeof task !== "string" &&
            typeof taskToDelete !== "string" &&
            task.text === taskToDelete.text &&
            task.createdAt === taskToDelete.createdAt),
      )

      if (taskIndex !== -1) {
        const updatedTasks = [...tasks]
        updatedTasks.splice(taskIndex, 1)
        setTasks(updatedTasks)
        await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks))
      }
    } catch (error) {
      console.error("Failed to delete task", error)
      Alert.alert("Error", "Failed to delete task")
    }
  }

  const editTask = (index) => {
    // Get the actual task from filteredTasks
    const taskToEdit = filteredTasks[index]

    // Find this exact task object in the original tasks array
    const taskIndex = tasks.findIndex(
      (task) =>
        (typeof task === "string" && typeof taskToEdit === "string" && task === taskToEdit) ||
        (typeof task !== "string" &&
          typeof taskToEdit !== "string" &&
          task.text === taskToEdit.text &&
          task.createdAt === taskToEdit.createdAt),
    )

    if (taskIndex !== -1) {
      navigation.navigate("AddTask", {
        task: tasks[taskIndex],
        index: taskIndex,
      })
    }
  }

  const clearCompletedTasks = async () => {
    try {
      const updatedTasks = tasks.filter((task) => typeof task === "string" || !task.completed)
      setTasks(updatedTasks)
      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks))
    } catch (error) {
      console.error("Failed to clear completed tasks", error)
      Alert.alert("Error", "Failed to clear completed tasks")
    }
  }

  const toggleSearch = () => {
    setShowSearch(!showSearch)
    if (!showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery("")
    }
  }

  const renderSwipeableTask = ({ item, index }) => {
    const renderRightActions = (progress, dragX) => {
      const trans = dragX.interpolate({
        inputRange: [-100, 0],
        outputRange: [0, 100],
        extrapolate: "clamp",
      })

      return (
        <View style={styles.rightActions}>
          <Animated.View
            style={[
              styles.actionButton,
              styles.editButton,
              {
                transform: [{ translateX: trans }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                swipeableRefs.current[index]?.close()
                editTask(index)
              }}
            >
              <Ionicons name="pencil" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
          <Animated.View
            style={[
              styles.actionButton,
              styles.deleteButton,
              {
                transform: [{ translateX: trans }],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                swipeableRefs.current[index]?.close()
                deleteTask(index)
              }}
            >
              <Ionicons name="trash" size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )
    }

    return (
      <Swipeable
        ref={(ref) => (swipeableRefs.current[index] = ref)}
        renderRightActions={renderRightActions}
        rightThreshold={40}
      >
        <TaskItem
          task={item}
          onComplete={() => toggleTaskCompletion(index)}
          onDelete={() => deleteTask(index)}
          completed={typeof item !== "string" && item.completed}
          priority={typeof item !== "string" ? item.priority : null}
        />
      </Swipeable>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../assets/marissa-grootes-ck0i9Dnjtj0-unsplash.jpg")}
        style={styles.background}
      >
        <View style={styles.header}>
          <Text style={styles.title}>My Tasks</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleSearch}>
              <Ionicons name={showSearch ? "close" : "search"} size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowFilters(!showFilters)}>
              <Ionicons name="filter" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {showSearch && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}

        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Status:</Text>
              <View style={styles.filterOptions}>
                {["all", "active", "completed"].map((option) => (
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

            <View style={styles.filterGroup}>
              <Text style={styles.filterLabel}>Sort by:</Text>
              <View style={styles.filterOptions}>
                {[
                  { id: "date", icon: "calendar" },
                  { id: "priority", icon: "alert-circle" },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.filterOption, sortBy === option.id && styles.filterOptionActive]}
                    onPress={() => setSortBy(option.id)}
                  >
                    <Ionicons name={option.icon} size={16} color={sortBy === option.id ? "#fff" : "#555"} />
                    <Text style={[styles.filterText, sortBy === option.id && styles.filterTextActive]}>
                      {option.id.charAt(0).toUpperCase() + option.id.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {filter === "completed" && (
              <TouchableOpacity style={styles.clearButton} onPress={clearCompletedTasks}>
                <Text style={styles.clearButtonText}>Clear completed</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <FlatList
          data={filteredTasks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderSwipeableTask}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle" size={60} color="#3498db" />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "No tasks match your search"
                  : filter === "completed"
                    ? "No completed tasks yet"
                    : "No tasks yet. Add one!"}
              </Text>
            </View>
          }
        />

        <View style={styles.footer}>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {tasks.filter((task) => typeof task === "string" || !task.completed).length} tasks left
            </Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("AddTask")}>
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerButtons: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  filtersContainer: {
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 8,
    padding: 10,
  },
  filterGroup: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
    color: "#555",
  },
  filterOptions: {
    flexDirection: "row",
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  filterOptionActive: {
    backgroundColor: "#3498db",
  },
  filterText: {
    color: "#555",
    marginLeft: 4,
  },
  filterTextActive: {
    color: "#fff",
  },
  clearButton: {
    backgroundColor: "#ff6b6b",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 5,
  },
  clearButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 12,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  statsContainer: {
    flex: 1,
  },
  statsText: {
    fontSize: 16,
    color: "#555",
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  rightActions: {
    flexDirection: "row",
    width: 120,
    height: "100%",
  },
  actionButton: {
    width: 60,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#3498db",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
})
