import { useState, useEffect } from "react";
import Header from "./components/header/Header";
import Board from "./components/board/Board";
import TaskModal from "./components/modal/TaskModal";
import TaskViewModal from "./components/modal/TaskViewModal";
import SettingsModal from "./components/modal/SettingsModal";
import AuthScreen from "./components/auth/AuthScreen";
import { authApi, taskApi } from "./api/api";

export default function App() {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [taskViewOpen, setTaskViewOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [clipboardTask, setClipboardTask] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [operationError, setOperationError] = useState("");

  useEffect(() => {
    authApi.me()
      .then(({ user: currentUser }) => setUser(currentUser))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    setIsLoaded(false);
    taskApi.list()
      .then(({ tasks: loadedTasks }) => setTasks(loadedTasks))
      .catch((error) => setOperationError(error.message))
      .finally(() => setIsLoaded(true));
  }, [user]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      setTasks([]);
      setIsLoaded(false);
    } catch (error) {
      setOperationError(error.message);
    }
  };

  if (authLoading) {
    return <div className="auth-loading">Проверка авторизации...</div>;
  }

  if (!user) {
    return <AuthScreen onAuthenticated={(authenticatedUser) => {
      setUser(authenticatedUser);
      setIsLoaded(false);
    }} />;
  }

  const initializeWithDemoTasks = async () => {
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
    
    try {
      const createdTasks = [];
      for (const task of demoTasks) {
        const { task: createdTask } = await taskApi.create(task);
        createdTasks.push(createdTask);
      }
      setTasks(createdTasks);
    } catch (error) {
      setOperationError(error.message);
    }
  };

  const addTask = async (task) => {
    try {
      const { task: createdTask } = await taskApi.create(task);
      setTasks(prev => [...prev, createdTask]);
      setTaskModalOpen(false);
    } catch (error) {
      setOperationError(error.message);
      throw error;
    }
  };

  const updateTask = async (updatedTask) => {
    try {
      const { task: savedTask } = await taskApi.update(updatedTask.id, updatedTask);
      setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t));
    } catch (error) {
      setOperationError(error.message);
      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      await taskApi.remove(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      setOperationError(error.message);
    }
  };

  const moveTask = async (id, newStatus) => {
    try {
      const { task: savedTask } = await taskApi.update(id, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t));
    } catch (error) {
      setOperationError(error.message);
    }
  };

  const openTaskView = (task) => {
    setSelectedTask(task);
    setTaskViewOpen(true);
  };

  const cutTask = (task) => {
    setClipboardTask(task);
    deleteTask(task.id);
  };

  const copyTask = (task) => {
    setClipboardTask(task);
  };

  const pasteTask = (column) => {
    if (clipboardTask) {
      taskApi.create({ ...clipboardTask, status: column })
        .then(({ task: createdTask }) => setTasks(prev => [...prev, createdTask]))
        .catch((error) => setOperationError(error.message));
      setClipboardTask(null);
    }
  };

  const clearAllTasks = () => {
    if (window.confirm("Вы уверены, что хотите удалить ВСЕ задачи?")) {
      taskApi.removeAll()
        .then(() => setTasks([]))
        .catch((error) => setOperationError(error.message));
    }
  };

  const showDemoButton = tasks.length === 0 && isLoaded;

  const handleCreateTask = () => {
    setTaskModalOpen(true);
  };

  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  return (
    <>
      <Header 
        onOpenSettings={handleOpenSettings} 
        onCreateTask={handleCreateTask} 
        user={user}
        onLogout={handleLogout}
      />

      {operationError && (
        <div className="operation-error" role="alert">
          <span>{operationError}</span>
          <button type="button" onClick={() => setOperationError("")}>Закрыть</button>
        </div>
      )}
      
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