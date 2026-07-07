import type { CustnotesaResponse } from '../../types/api';
import type { Task, CustomerInbox } from '../../types/ui';
import { EDITABLE_STATUSES, PRIORITIES, type PriorityValue } from '../../config/constants';
import { isAfter, startOfDay, parse } from 'date-fns';

function parseApiDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parsed = parse(dateStr, 'yyyy-MM-dd', new Date());
  return isNaN(parsed.getTime()) ? null : parsed;
}

function isTaskOverdue(dueDate: string, status: string): boolean {
  if (!dueDate || !EDITABLE_STATUSES.has(status)) return false;
  const parsed = parseApiDate(dueDate);
  if (!parsed) return false;
  return isAfter(startOfDay(new Date()), parsed);
}

function mapToTask(raw: CustnotesaResponse): Task {
  return {
    id: raw.CUSTNOTE,
    customerCode: raw.CUSTNAME,
    customerName: raw.CUSTDES || raw.CUSTNAME,
    subject: raw.SUBJECT || '',
    assignedTo: raw.USERLOGIN || '',
    startDate: raw.CURDATE || '',
    startTime: raw.STIME || '',
    dueDate: raw.TILLDATE || '',
    dueTime: raw.ETIME || '',
    status: raw.STATDES || '',
    priority: raw.GAL_PRIORITY || '',
    category: raw.GAL_CATEGORY || '',
    isEditable: EDITABLE_STATUSES.has(raw.STATDES),
    isOverdue: isTaskOverdue(raw.TILLDATE, raw.STATDES),
  };
}

function getHighestPriority(tasks: Task[]): PriorityValue | null {
  let highest: PriorityValue | null = null;
  let highestSeverity = 0;

  for (const task of tasks) {
    if (!task.isEditable) continue;
    const config = PRIORITIES[task.priority as PriorityValue];
    if (config && config.severity > highestSeverity) {
      highestSeverity = config.severity;
      highest = config.value;
    }
  }

  return highest;
}

export function transformToCustomerInbox(rawTasks: CustnotesaResponse[]): CustomerInbox[] {
  const grouped = new Map<string, CustnotesaResponse[]>();

  for (const task of rawTasks) {
    const key = task.CUSTNAME;
    const existing = grouped.get(key);
    if (existing) {
      existing.push(task);
    } else {
      grouped.set(key, [task]);
    }
  }

  const result: CustomerInbox[] = [];

  for (const [customerCode, rawGroup] of grouped) {
    const tasks = rawGroup.map(mapToTask);
    const openTasks = tasks.filter(t => t.isEditable);
    const customerName = rawGroup[0].CUSTDES || rawGroup[0].CUSTNAME;

    tasks.sort((a, b) => a.startDate.localeCompare(b.startDate));

    result.push({
      customerCode,
      customerName,
      openTaskCount: openTasks.length,
      highestPriority: getHighestPriority(tasks),
      tasks,
    });
  }

  result.sort((a, b) => {
    const aSeverity = a.highestPriority ? PRIORITIES[a.highestPriority].severity : 0;
    const bSeverity = b.highestPriority ? PRIORITIES[b.highestPriority].severity : 0;

    if (bSeverity !== aSeverity) return bSeverity - aSeverity;
    return a.customerName.localeCompare(b.customerName);
  });

  return result;
}
