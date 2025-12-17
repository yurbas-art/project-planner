import { useState, useEffect } from "react";
import Header from "./components/header/Header";
import Board from "./components/board/Board";
import TaskModal from "./components/modal/TaskModal";
import TaskViewModal from "./components/modal/TaskViewModal";
import SettingsModal from "./components/modal/SettingsModal";

export default function App() {
  console.log("=== PROJECT PLANNER APP RENDER ===");
  
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [taskViewOpen, setTaskViewOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [clipboardTask, setClipboardTask] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log("Загружаем задачи из localStorage...");
    const savedTasks = localStorage.getItem("project-planner-tasks");
    
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        console.log("Задачи загружены:", parsedTasks.length);
        setTasks(parsedTasks);
      } catch (error) {
        console.error("Ошибка при загрузке задач:", error);
        setTasks([]);
      }
    } else {
      console.log("Сохраненных задач не найдено");
      setTasks([]);
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      console.log("Сохраняем задачи:", tasks.length);
      localStorage.setItem("project-planner-tasks", JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  const initializeWithDemoTasks = () => {
    console.log("Инициализация демо-задач");
    const demoTasks = [
      {
        id: Date.now(),
        title: "Добро пожаловать в Project Planner!",
        desc: "Это демо-задача. Вы можете создавать, редактировать и перемещать задачи.",
        priority: "средний",
        status: "Очередь",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 1,
        title: "Попробуйте перетащить задачу",
        desc: "Зажмите и перетащите задачу в другую колонку",
        priority: "низкий",
        status: "Очередь",
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 2,
        title: "Нажмите правой кнопкой",
        desc: "Правый клик по задаче откроет контекстное меню",
        priority: "высокий",
        status: "В работе",
        createdAt: new Date().toISOString()
      }
    ];
    
    setTasks(demoTasks);
  };

  const addTask = (task) => {
    console.log("Добавляем задачу:", task.title);
    const newTask = {
      id: Date.now(),
      ...task,
      createdAt: new Date().toISOString()
    };
    setTasks(prev => [...prev, newTask]);
    setTaskModalOpen(false);
  };

  const updateTask = (updatedTask) => {
    console.log("Обновляем задачу:", updatedTask.id);
    setTasks(prev => prev.map(t => 
      t.id === updatedTask.id ? { ...t, ...updatedTask } : t
    ));
  };

  const deleteTask = (id) => {
    console.log("Удаляем задачу:", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const moveTask = (id, newStatus) => {
    console.log("Перемещаем задачу:", id, "→", newStatus);
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, status: newStatus } : t
    ));
  };

  const openTaskView = (task) => {
    console.log("Открываем просмотр задачи:", task.id);
    setSelectedTask(task);
    setTaskViewOpen(true);
  };

  const cutTask = (task) => {
    console.log("Вырезаем задачу:", task.id);
    setClipboardTask(task);
    deleteTask(task.id);
  };

  const copyTask = (task) => {
    console.log("Копируем задачу:", task.id);
    setClipboardTask(task);
  };

  const pasteTask = (column) => {
    if (clipboardTask) {
      console.log("Вставляем задачу в колонку:", column);
      const newTask = {
        ...clipboardTask,
        id: Date.now(),
        status: column,
        createdAt: new Date().toISOString()
      };
      setTasks(prev => [...prev, newTask]);
      setClipboardTask(null);
    }
  };

  const clearAllTasks = () => {
    console.log("Очищаем все задачи");
    if (window.confirm("Вы уверены, что хотите удалить ВСЕ задачи?")) {
      setTasks([]);
    }
  };

  const showDemoButton = tasks.length === 0 && isLoaded;

  const handleCreateTask = () => {
    console.log("Создать задачу - кнопка нажата");
    setTaskModalOpen(true);
  };

  const handleOpenSettings = () => {
    console.log("Настройки - кнопка нажата");
    setSettingsOpen(true);
  };

  return (
    <>
      <Header 
        onOpenSettings={handleOpenSettings} 
        onCreateTask={handleCreateTask} 
      />
      
      {showDemoButton && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#007bff',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)'
        }}>
          <span>Нет задач? Создать демо-доску</span>
          <button 
            onClick={initializeWithDemoTasks}
            style={{
              background: 'white',
              color: '#007bff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Создать
          </button>
        </div>
      )}
      
      <Board
        tasks={tasks}
        onTaskClick={openTaskView}
        onDeleteTask={deleteTask}
        onMoveTask={moveTask}
        onCutTask={cutTask}
        onCopyTask={copyTask}
        onPasteTask={pasteTask}
        clipboard={clipboardTask}
      />
      
      <TaskModal 
        open={taskModalOpen} 
        onClose={() => setTaskModalOpen(false)} 
        onAddTask={addTask} 
      />
      
      <TaskViewModal 
        open={taskViewOpen} 
        onClose={() => setTaskViewOpen(false)} 
        task={selectedTask} 
        onUpdateTask={updateTask} 
      />
      
      <SettingsModal 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        onClearTasks={clearAllTasks}
      />
    </>
  );
}