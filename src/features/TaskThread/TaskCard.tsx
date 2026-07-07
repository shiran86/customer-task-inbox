import { useCallback } from 'react';
import { Text } from '@priority-software/priority-style-react';
import { PRIORITIES, type PriorityValue, DATE_DISPLAY_FORMAT } from '../../config/constants';
import { OVERDUE_COLOR } from './consts';
import { format, parseISO } from 'date-fns';
import type { TaskCardProps } from './types';
import styles from './TaskThread.module.scss';

function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  try {
    return format(parseISO(isoDate), DATE_DISPLAY_FORMAT);
  } catch {
    return isoDate;
  }
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const handleEdit = useCallback(() => {
    onEdit(task.id);
  }, [onEdit, task.id]);

  const handleDelete = useCallback(() => {
    onDelete(task.id);
  }, [onDelete, task.id]);

  const priorityConfig = task.priority ? PRIORITIES[task.priority as PriorityValue] : null;

  return (
    <div className={styles.taskCard}>
      <div className={styles.taskHeader}>
        <Text skin="subtitle-2" componentClasses={styles.taskSubject}>
          {task.subject || '(No subject)'}
        </Text>
        {task.isEditable && (
          <div className={styles.taskActions}>
            <button
              className={styles.iconButton}
              onClick={handleEdit}
              aria-label="Edit task"
              title="Edit"
            >
              ✏️
            </button>
            <button
              className={styles.iconButton}
              onClick={handleDelete}
              aria-label="Delete task"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className={styles.taskBody}>
        <div className={styles.taskField}>
          <span className={styles.fieldLabel}>Assigned to:</span>
          <span className={styles.fieldValue}>{task.assignedTo}</span>
        </div>

        <div className={styles.taskField}>
          <span className={styles.fieldLabel}>Start date:</span>
          <span className={styles.fieldValue}>{formatDate(task.startDate)}</span>
        </div>

        <div className={styles.taskField}>
          <span className={styles.fieldLabel}>Due date:</span>
          <span
            className={styles.fieldValue}
            style={task.isOverdue ? { color: OVERDUE_COLOR, fontWeight: 'bold' } : undefined}
          >
            {formatDate(task.dueDate)}
            {task.isOverdue && ' (Overdue)'}
          </span>
        </div>

        <div className={styles.taskField}>
          <span className={styles.fieldLabel}>Status:</span>
          <span className={styles.fieldValue}>{task.status}</span>
        </div>

        <div className={styles.taskBadges}>
          {priorityConfig && (
            <span
              className={styles.priorityBadge}
              style={{ backgroundColor: priorityConfig.bgColor }}
            >
              {priorityConfig.label}
            </span>
          )}
          {task.category && (
            <span className={styles.categoryBadge}>
              {task.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
