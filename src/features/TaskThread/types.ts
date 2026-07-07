import type { Task } from '../../types/ui';
import type { CreateTaskPayload, UpdateTaskPayload } from '../../types/api';

export interface TaskThreadProps {
  tasks: Task[];
  customerCode: string;
  customerName: string;
  editingTaskId: number | null;
  isCreating: boolean;
  onEditTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
  onFormSubmit: (payload: CreateTaskPayload | UpdateTaskPayload, isEdit: boolean, taskId?: number) => void;
  onFormCancel: () => void;
  onCreateClick: () => void;
}

export interface TaskCardProps {
  task: Task;
  onEdit: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}
