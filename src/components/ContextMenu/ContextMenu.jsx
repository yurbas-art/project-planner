import { useEffect } from "react";
import "./ContextMenu.css";

export default function ContextMenu({ x, y, items, onClose }) {
  useEffect(() => {
    const handleClick = () => onClose();
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [onClose]);

  return (
    <div 
      className="context-menu" 
      style={{ top: y, left: x }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => (
        <button
          key={index}
          className={`context-menu-item ${item.danger ? 'danger' : ''}`}
          onClick={item.onClick}
          disabled={item.disabled}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}