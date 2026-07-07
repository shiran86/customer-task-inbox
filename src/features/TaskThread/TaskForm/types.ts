import type { Task } from '../../../types/ui';
import type { CreateTaskPayload, UpdateTaskPayload } from '../../../types/api';

export interface TaskFormProps {
  task: Task | null;
  customerCode: string;
  onSubmit: (payload: CreateTaskPayload | UpdateTaskPayload, isEdit: boolean, taskId?: number) => void;
  onCancel: () => void;
}

export interface TaskFormValues {
  subject: string;
  assignedTo: string;
  dueDate: string;
  priority: string;
  category: string;
  status: string;
}
