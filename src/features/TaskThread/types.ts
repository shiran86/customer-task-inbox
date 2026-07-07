import type { Task } from '../../types/ui';

export interface TaskThreadProps {
  tasks: Task[];
  customerName: string;
  onEditTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
}

export interface TaskCardProps {
  task: Task;
  onEdit: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}
