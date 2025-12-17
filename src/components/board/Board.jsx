import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Column from "./Column";
import "./Board.css";

export default function Board({ tasks, onTaskClick, onDeleteTask, onCutTask, onCopyTask, onPasteTask, onMoveTask, clipboard }) {
  const columns = ["Очередь", "В работе", "На проверке", "Готово"];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="board">
        {columns.map((col) => (
          <Column 
            key={col} 
            name={col} 
            tasks={tasks.filter(t => t.status === col)} 
            onTaskClick={onTaskClick} 
            onDeleteTask={onDeleteTask} 
            onCutTask={onCutTask} 
            onCopyTask={onCopyTask} 
            onPasteTask={onPasteTask} 
            onMoveTask={onMoveTask} 
            clipboard={clipboard} 
          />
        ))}
      </div>
    </DndProvider>
  );
}