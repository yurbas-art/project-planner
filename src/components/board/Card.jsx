import { useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import ContextMenu from "../ContextMenu/ContextMenu";

const ItemTypes = { TASK: "task" };

export default function Card({ task, onTaskClick, onDeleteTask, onCutTask, onCopyTask, onPasteTask, onMoveTask, clipboard }) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TASK,
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item) => { 
      if (item.id !== task.id) onMoveTask(item.id, task.status); 
    },
  });

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowMenu(true);
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  const closeMenu = () => setShowMenu(false);

  const menuItems = [
    { label: "Открыть", onClick: () => { onTaskClick(task); closeMenu(); } },
    { label: "Вырезать", onClick: () => { onCutTask(task); closeMenu(); } },
    { label: "Копировать", onClick: () => { onCopyTask(task); closeMenu(); } },
    { 
      label: "Вставить", 
      onClick: () => { onPasteTask(task.status); closeMenu(); },
      disabled: !clipboard 
    },
    { 
      label: "Удалить", 
      onClick: () => { onDeleteTask(task.id); closeMenu(); },
      danger: true 
    },
  ];

  return (
    <>
      <div 
        ref={(node) => drag(drop(node))} 
        className="card" 
        onContextMenu={handleContextMenu} 
        style={{ opacity: isDragging ? 0.5 : 1 }}
        onClick={() => onTaskClick(task)}
      >
        <div className="card-header">
          <span className="task-title">{task.title}</span>
          <button 
            className="delete-btn" 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
          >
            ✖
          </button>
        </div>
        {task.desc && (
          <p className="task-desc">{task.desc}</p>
        )}
        <span className={`priority priority-${task.priority}`}>
          {task.priority}
        </span>
      </div>

      {showMenu && (
        <ContextMenu 
          x={menuPos.x} 
          y={menuPos.y} 
          items={menuItems} 
          onClose={closeMenu}
        />
      )}
    </>
  );
}