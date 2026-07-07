export type PriorityValue = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface PriorityConfig {
  value: PriorityValue;
  label: string;
  severity: number;
  bgColor: string;
}

export const PRIORITIES: Record<PriorityValue, PriorityConfig> = {
  LOW: { value: 'LOW', label: 'Low', severity: 1, bgColor: '#E0E0E0' },
  MEDIUM: { value: 'MEDIUM', label: 'Medium', severity: 2, bgColor: '#FFF3CD' },
  HIGH: { value: 'HIGH', label: 'High', severity: 3, bgColor: '#FFCC80' },
  URGENT: { value: 'URGENT', label: 'Urgent', severity: 4, bgColor: '#EF5350' },
};

export const PRIORITY_LIST: PriorityConfig[] = [
  PRIORITIES.LOW,
  PRIORITIES.MEDIUM,
  PRIORITIES.HIGH,
  PRIORITIES.URGENT,
];

export type CategoryValue = 'SUPPORT' | 'SALES' | 'BILLING' | 'GENERAL';

export const CATEGORIES: CategoryValue[] = ['SUPPORT', 'SALES', 'BILLING', 'GENERAL'];

export interface StatusConfig {
  value: string;
  isEditable: boolean;
}

export const STATUSES: StatusConfig[] = [
  { value: 'טיוטא', isEditable: true },
  { value: 'לביצוע', isEditable: true },
  { value: 'בוצעה', isEditable: false },
  { value: 'מבוטלת', isEditable: false },
];

export const EDITABLE_STATUSES = new Set(
  STATUSES.filter(s => s.isEditable).map(s => s.value)
);

export const DEFAULT_CREATE_STATUS = 'לביצוע';

export const USERS: string[] = [
  'tabula',
  'sima',
  'nikita',
  'yuval',
  'master',
  'galit',
  'aviv',
];

export const DATE_DISPLAY_FORMAT = 'dd/MM/yy';

export const NO_OPEN_TASKS_BADGE_COLOR = '#4CAF50';
