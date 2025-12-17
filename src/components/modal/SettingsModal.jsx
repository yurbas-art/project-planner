import Modal from "./Modal";
import "./modals.css";

export default function SettingsModal({ open, onClose, onClearTasks }) {
  console.log("SettingsModal: открыта?", open, "onClearTasks:", typeof onClearTasks);

  if (!open) return null;

  const handleClearAllTasks = () => {
    console.log("SettingsModal: Удалить все задачи");
    if (window.confirm("Вы уверены, что хотите удалить ВСЕ задачи? Это действие нельзя отменить.")) {
      if (onClearTasks && typeof onClearTasks === 'function') {
        onClearTasks();
      } else {
        console.error("SettingsModal: onClearTasks не доступна");
        alert("Ошибка: функция очистки задач не доступна");
      }
      onClose();
    }
  };

  const handleClearLocalStorage = () => {
    console.log("SettingsModal: Очистить localStorage");
    if (window.confirm("Очистить ВСЕ сохраненные данные и перезагрузить страницу?")) {
      localStorage.removeItem("project-planner-tasks");
      window.location.reload();
    }
  };

  const handleExportTasks = () => {
    console.log("SettingsModal: Экспорт задач");
    const tasks = JSON.parse(localStorage.getItem("project-planner-tasks") || "[]");
    if (tasks.length === 0) {
      alert("Нет задач для экспорта");
      return;
    }
    
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `project-planner-tasks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`Задачи (${tasks.length} шт.) экспортированы в файл!`);
  };

  const handleImportTasks = () => {
    console.log("SettingsModal: Импорт задач");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const tasks = JSON.parse(event.target.result);
          if (Array.isArray(tasks)) {
            if (window.confirm(`Импортировать ${tasks.length} задач? Существующие задачи будут заменены.`)) {
              localStorage.setItem("project-planner-tasks", JSON.stringify(tasks));
              window.location.reload();
            }
          } else {
            alert("Файл не содержит корректный массив задач");
          }
        } catch (error) {
          alert("Ошибка при чтении файла: " + error.message);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const tasksCount = JSON.parse(localStorage.getItem("project-planner-tasks") || "[]").length;
  const dataSize = Math.round((localStorage.getItem("project-planner-tasks") || "").length / 1024 * 100) / 100;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header">
        <h3>Настройки Project Planner</h3>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
      <div className="modal-form">
        <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="checkbox-label">
            <input type="checkbox" /> 
            Привязать TG-аккаунт
          </label>
          <button 
            className="logout-btn"
            onClick={() => alert("Функция выхода из аккаунта будет реализована позже")}
            style={{ marginLeft: '20px' }}
          >
            👤 Выйти из аккаунта
          </button>
        </div>
        
        <div className="settings-section">
          <h4>Управление задачами</h4>
          
          <div className="settings-buttons-grid">
            <button 
              className="btn-danger" 
              onClick={handleClearAllTasks}
              title="Удалить все задачи с доски"
              disabled={tasksCount === 0}
            >
              🗑️ Удалить все задачи
            </button>
            
            <button 
              className="btn-warning"
              onClick={handleClearLocalStorage}
              title="Полностью очистить сохраненные данные"
            >
              🧹 Очистить localStorage
            </button>
            
            <button 
              className="btn-success"
              onClick={handleExportTasks}
              title="Сохранить задачи в файл"
              disabled={tasksCount === 0}
            >
              📥 Экспорт задач
            </button>
            
            <button 
              className="btn-info"
              onClick={handleImportTasks}
              title="Загрузить задачи из файла"
            >
              📤 Импорт задач
            </button>
          </div>
        </div>
        
        <div className="settings-info">
          <p><strong>Статистика Project Planner:</strong></p>
          <p>Всего задач: {tasksCount}</p>
          <p>Размер данных: {dataSize} KB</p>
          <p>Версия: 1.0.0</p>
        </div>
      </div>
    </Modal>
  );
}