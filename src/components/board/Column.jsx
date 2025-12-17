import { useDrop } from "react-dnd";
import Card from "./Card";

const ItemTypes = { TASK: "task" };

export default function Column({ name, tasks, onTaskClick, onDeleteTask, onCutTask, onCopyTask, onPasteTask, onMoveTask, clipboard }) {
  const [, drop] = useDrop({
    accept: ItemTypes.TASK,
    drop: (item) => { 
      if (item.status !== name) onMoveTask(item.id, name); 
    },
  });

  return (
    <div ref={drop} className="column">
      <div className="column-header">
        <h3>{name}</h3>
        <span className="task-count">{tasks.length}</span>
      </div>
      <div className="cards-container">
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            task={task} 
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
    </div>
  );
}