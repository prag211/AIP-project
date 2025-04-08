// src/App.js
import React, { useEffect, useState } from "react";
import AddTask from "./components/AddTask";
import TaskList from "./components/TaskList";
import FilterTasks from "./components/FilterTasks";
import DarkModeToggle from "./components/DarkModeToggle";
import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [editTask, setEditTask] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // ✅ Fetch tasks from backend
  useEffect(() => {
    refreshTasks();
  }, []);

  const refreshTasks = () => {
    axios.get("http://localhost:5000/tasks")
      .then((res) => {
        // map database fields to frontend expected format
        const formattedTasks = res.data.map(task => ({
          id: task.id,
          text: task.name,
          dueDate: task.due_date,
          priority: task.priority,
          completed: !!task.completed
        }));
        setTasks(formattedTasks);
      })
      .catch((err) => console.error("Error fetching tasks:", err));
  };

  // ✅ Add or update task
  const handleAdd = (task) => {
    const backendTask = {
      name: task.text,
      due_date: task.dueDate,
      priority: task.priority,
      completed: task.completed,
    };

    if (editTask) {
      axios.put(`http://localhost:5000/tasks/${editTask.id}`, backendTask)
        .then(() => {
          setEditTask(null);
          refreshTasks();
        })
        .catch((err) => console.error("Update error:", err));
    } else {
      axios.post("http://localhost:5000/tasks", backendTask)
        .then(() => refreshTasks())
        .catch((err) => console.error("Add error:", err));
    }
  };

  // ❌ Delete task
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/tasks/${id}`)
      .then(() => refreshTasks())
      .catch((err) => console.error("Delete error:", err));
  };

  // 🔁 Toggle completion
  const handleToggle = (id) => {
    const taskToToggle = tasks.find((task) => task.id === id);
    if (taskToToggle) {
      const updatedTask = {
        name: taskToToggle.text,
        due_date: taskToToggle.dueDate,
        priority: taskToToggle.priority,
        completed: !taskToToggle.completed
      };

      axios.put(`http://localhost:5000/tasks/${id}`, updatedTask)
        .then(() => refreshTasks())
        .catch((err) => console.error("Toggle error:", err));
    }
  };

  // ✏️ Edit task
  const handleEdit = (task) => {
    setEditTask(task);
  };

  // 🌗 Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // 📂 Filter tasks
  const filteredTasks =
    filter === "All"
      ? tasks
      : filter === "Completed"
      ? tasks.filter((task) => task.completed)
      : tasks.filter((task) => !task.completed);

  return (
    <div className={darkMode ? "app dark-mode container py-4" : "app container py-4"}>
      <h1 className="text-center mb-4">📝 Task Manager</h1>
      <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      <AddTask onAdd={handleAdd} editTask={editTask} />
      <FilterTasks filter={filter} setFilter={setFilter} />
      <TaskList tasks={filteredTasks} onDelete={handleDelete} onToggle={handleToggle} onEdit={handleEdit} />
    </div>
  );
}

export default App;
