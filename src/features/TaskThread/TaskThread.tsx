import { useMemo } from 'react';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import type { TaskThreadProps } from './types';
import styles from './TaskThread.module.scss';

export function TaskThread({
  tasks,
  customerCode,
  editingTaskId,
  isCreating,
  onEditTask,
  onDeleteTask,
  onFormSubmit,
  onFormCancel,
  onCreateClick,
}: TaskThreadProps) {
  const editingTask = useMemo(
    () => (editingTaskId !== null ? tasks.find(t => t.id === editingTaskId) ?? null : null),
    [tasks, editingTaskId]
  );

  const isFormOpen = editingTaskId !== null || isCreating;

  return (
    <div className={styles.threadPanel}>
      <div className={styles.taskList}>
        {tasks.map(task =>
          editingTaskId === task.id ? (
            <TaskForm
              key={`edit-${task.id}`}
              task={editingTask}
              customerCode={customerCode}
              onSubmit={onFormSubmit}
              onCancel={onFormCancel}
            />
          ) : (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          )
        )}

        {isCreating && (
          <TaskForm
            task={null}
            customerCode={customerCode}
            onSubmit={onFormSubmit}
            onCancel={onFormCancel}
          />
        )}
      </div>

      {!isFormOpen && (
        <button className={styles.addButton} onClick={onCreateClick} type="button">
          + Add Task
        </button>
      )}
    </div>
  );
}
