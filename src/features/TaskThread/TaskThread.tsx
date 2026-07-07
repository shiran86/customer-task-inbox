import { TaskCard } from './TaskCard';
import type { TaskThreadProps } from './types';
import styles from './TaskThread.module.scss';

export function TaskThread({ tasks, onEditTask, onDeleteTask }: TaskThreadProps) {
  return (
    <div className={styles.threadPanel}>
      <div className={styles.taskList}>
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
