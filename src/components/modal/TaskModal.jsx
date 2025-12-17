import { useState } from "react";
import Modal from "./Modal";
import "./modals.css";

export default function TaskModal({ open, onClose, onAddTask }) {
  console.log("TaskModal:", { open });

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("низкий");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("TaskModal: Создание задачи", { title, desc, priority });
    onAddTask({ title, desc, priority, status: "Очередь" });
    setTitle("");
    setDesc("");
    setPriority("низкий");
    onClose();
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="modal-header">
        <h3>Создать задачу</h3>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
      <form onSubmit={handleSubmit} className="modal-form">
        <div className="form-group">
          <label>Название задачи</label>
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Введите название" 
            required 
          />
        </div>
        <div className="form-group">
          <label>Описание</label>
          <textarea 
            value={desc} 
            onChange={e => setDesc(e.target.value)} 
            placeholder="Введите описание" 
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
            Создать
          </button>
        </div>
      </form>
    </Modal>
  );
}