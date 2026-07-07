import type { PriorityValue } from '../config/constants';

export interface Task {
  id: number;
  customerCode: string;
  customerName: string;
  subject: string;
  assignedTo: string;
  startDate: string;
  startTime: string;
  dueDate: string;
  dueTime: string;
  status: string;
  priority: string;
  category: string;
  isEditable: boolean;
  isOverdue: boolean;
}

export interface CustomerInbox {
  customerCode: string;
  customerName: string;
  openTaskCount: number;
  highestPriority: PriorityValue | null;
  tasks: Task[];
}
