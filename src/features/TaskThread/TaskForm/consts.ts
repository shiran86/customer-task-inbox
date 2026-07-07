import { PRIORITY_LIST, CATEGORIES, STATUSES, USERS, DEFAULT_CREATE_STATUS } from '../../../config/constants';

export const PRIORITY_OPTIONS = PRIORITY_LIST.map(p => ({ value: p.value, label: p.label }));
export const CATEGORY_OPTIONS = CATEGORIES.map(c => ({ value: c, label: c }));
export const STATUS_OPTIONS = STATUSES.map(s => ({ value: s.value, label: s.value }));
export const USER_OPTIONS = USERS.map(u => ({ value: u, label: u }));

export const SUBJECT_MAX_LENGTH = 52;
export { DEFAULT_CREATE_STATUS };
