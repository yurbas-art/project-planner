import { useEffect, useState } from "react";
import "./Header.css";

export default function Header({ onOpenSettings, onCreateTask }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateClick = () => {
    console.log("Header: Кнопка 'Создать' нажата");
    if (onCreateTask && typeof onCreateTask === 'function') {
      onCreateTask();
    } else {
      console.error("Header: onCreateTask не является функцией");
    }
  };

  const handleSettingsClick = () => {
    console.log("Header: Кнопка 'Настройки' нажата");
    if (onOpenSettings && typeof onOpenSettings === 'function') {
      onOpenSettings();
    } else {
      console.error("Header: onOpenSettings не является функцией");
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <span className="logo">📋</span>
        <h1 className="project-title">Project Planner</h1>
        <button 
          className="create-btn" 
          onClick={handleCreateClick}
        >
          Создать
        </button>
      </div>
      <div className="header-center">{time}</div>
      <div className="header-right">
        <button 
          className="settings-btn" 
          onClick={handleSettingsClick}
        >
          ⚙
        </button>
        <span className="username">Username</span>
      </div>
    </header>
  );
}