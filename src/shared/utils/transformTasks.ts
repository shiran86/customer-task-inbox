import type { CustnotesaResponse } from '../../types/api';
import type { Task, CustomerInbox } from '../../types/ui';
import { EDITABLE_STATUSES, PRIORITIES, type PriorityValue } from '../../config/constants';
import { isAfter, startOfDay, parseISO } from 'date-fns';

function parseApiDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const parsed = parseISO(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function isTaskOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || !EDITABLE_STATUSES.has(status)) return false;
  const parsed = parseApiDate(dueDate);
  if (!parsed) return false;
  return isAfter(startOfDay(new Date()), parsed);
}

function mapToTask(raw: CustnotesaResponse): Task {
  const status = raw.STATDES ?? '';
  return {
    id: raw.CUSTNOTE,
    customerCode: raw.CUSTNAME ?? '',
    customerName: raw.CUSTDES ?? raw.CUSTNAME ?? '',
    subject: raw.SUBJECT ?? '',
    assignedTo: raw.USERLOGIN ?? '',
    startDate: raw.OUDATE ?? '',
    startTime: raw.STIME ?? '',
    dueDate: raw.TILLDATE ?? '',
    dueTime: raw.ETIME ?? '',
    status,
    priority: raw.GAL_PRIORITY ?? '',
    category: raw.GAL_CATEGORY ?? '',
    isEditable: EDITABLE_STATUSES.has(status),
    isOverdue: isTaskOverdue(raw.TILLDATE, status),
  };
}

function getHighestPriority(tasks: Task[]): PriorityValue | null {
  let highest: PriorityValue | null = null;
  let highestSeverity = 0;

  for (const task of tasks) {
    if (!task.isEditable || !task.priority) continue;
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
    const key = task.CUSTNAME || '';
    if (!key) continue;
    const existing = grouped.get(key);
    if (existing) {
      existing.push(task);
    } else {
      grouped.set(key, [task]);
    }
  }

  const result: CustomerInbox[] = [];

  for (const [customerCode, rawGroup] of grouped) {
    rawGroup.sort((a, b) => (a.OUDATE ?? '').localeCompare(b.OUDATE ?? ''));
    const tasks = rawGroup.map(mapToTask);
    const openTasks = tasks.filter(t => t.isEditable);
    const customerName = rawGroup[0].CUSTDES || rawGroup[0].CUSTNAME || customerCode;

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
