import { useState, useEffect } from "react";
import Modal from "./Modal";
import "./modals.css";

export default function TaskViewModal({ open, onClose, task, onUpdateTask }) {
  console.log("TaskViewModal:", { open, task: task?.id });

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("низкий");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDesc(task.desc || "");
      setPriority(task.priority || "низкий");
    }
  }, [task]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("TaskViewModal: Обновление задачи", { id: task?.id, title, desc, priority });
    onUpdateTask({ ...task, title, desc, priority });
    onClose();
  };

  if (!open || !task) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header">
        <h3>Редактировать задачу</h3>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label>Название задачи</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
          />
        </div>
        <div className="form-group">
          <label>Описание</label>
          <textarea 
            value={desc} 
            onChange={e => setDesc(e.target.value)} 
            rows="4"
          />
        </div>
        <div className="form-group">
          <label>Приоритет</label>
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="низкий">Низкий</option>
            <option value="средний">Средний</option>
            <option value="высокий">Высокий</option>
          </select>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" className="btn-primary">
            Сохранить
          </button>
        </div>
      </form>
    </Modal>
  );
}