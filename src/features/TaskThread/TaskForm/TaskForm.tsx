import { useState, useCallback } from 'react';
import { format, parseISO } from 'date-fns';
import { DATE_DISPLAY_FORMAT } from '../../../config/constants';
import {
  PRIORITY_OPTIONS,
  CATEGORY_OPTIONS,
  STATUS_OPTIONS,
  USER_OPTIONS,
  SUBJECT_MAX_LENGTH,
  DEFAULT_CREATE_STATUS,
} from './consts';
import type { TaskFormProps, TaskFormValues } from './types';
import type { CreateTaskPayload, UpdateTaskPayload } from '../../../types/api';
import styles from './TaskForm.module.scss';

function isoToInputDate(iso: string): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), DATE_DISPLAY_FORMAT);
  } catch {
    return iso;
  }
}

function inputDateToIso(dateStr: string): string {
  if (!dateStr) return '';
  return `${dateStr}T00:00:00Z`;
}

export function TaskForm({ task, customerCode, onSubmit, onCancel }: TaskFormProps) {
  const isEditMode = task !== null;

  const [values, setValues] = useState<TaskFormValues>(() => {
    if (task) {
      return {
        subject: task.subject,
        assignedTo: task.assignedTo,
        dueDate: isoToInputDate(task.dueDate),
        priority: task.priority,
        category: task.category,
        status: task.status,
      };
    }
    return {
      subject: '',
      assignedTo: '',
      dueDate: '',
      priority: '',
      category: '',
      status: DEFAULT_CREATE_STATUS,
    };
  });

  const handleChange = useCallback((field: keyof TaskFormValues, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const isValid =
    values.subject.trim() !== '' &&
    values.assignedTo !== '' &&
    values.dueDate !== '' &&
    values.priority !== '' &&
    values.category !== '';

  const handleSubmit = useCallback(() => {
    if (!isValid) return;

    const tillDate = inputDateToIso(values.dueDate);

    if (isEditMode && task) {
      const payload: UpdateTaskPayload = {
        SUBJECT: values.subject.trim(),
        USERLOGIN: values.assignedTo,
        TILLDATE: tillDate,
        GAL_PRIORITY: values.priority,
        GAL_CATEGORY: values.category,
        STATDES: values.status,
      };
      onSubmit(payload, true, task.id);
    } else {
      const payload: CreateTaskPayload = {
        CUSTNAME: customerCode,
        SUBJECT: values.subject.trim(),
        USERLOGIN: values.assignedTo,
        TILLDATE: tillDate,
        GAL_PRIORITY: values.priority,
        GAL_CATEGORY: values.category,
        STATDES: values.status,
      };
      onSubmit(payload, false);
    }
  }, [isValid, values, isEditMode, task, customerCode, onSubmit]);

  return (
    <div className={styles.formContainer}>
      {isEditMode && task && (
        <div className={styles.readOnlyField}>
          <span className={styles.fieldLabel}>Start date:</span>
          <span className={styles.fieldValue}>{formatDisplayDate(task.startDate)}</span>
        </div>
      )}

      <div className={styles.formField}>
        <label className={styles.fieldLabel} htmlFor="task-subject">Subject <span className={styles.required}>*</span></label>
        <input
          id="task-subject"
          type="text"
          className={styles.textInput}
          value={values.subject}
          onChange={e => handleChange('subject', e.target.value)}
          maxLength={SUBJECT_MAX_LENGTH}
          placeholder="Task subject"
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.fieldLabel} htmlFor="task-assigned">Assigned to <span className={styles.required}>*</span></label>
        <select
          id="task-assigned"
          className={styles.selectInput}
          value={values.assignedTo}
          onChange={e => handleChange('assignedTo', e.target.value)}
        >
          <option value="">Select user</option>
          {USER_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.formField}>
        <label className={styles.fieldLabel} htmlFor="task-duedate">Due date <span className={styles.required}>*</span></label>
        <input
          id="task-duedate"
          type="date"
          className={styles.textInput}
          value={values.dueDate}
          onChange={e => handleChange('dueDate', e.target.value)}
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.fieldLabel} htmlFor="task-priority">Priority <span className={styles.required}>*</span></label>
        <select
          id="task-priority"
          className={styles.selectInput}
          value={values.priority}
          onChange={e => handleChange('priority', e.target.value)}
        >
          <option value="">Select priority</option>
          {PRIORITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.formField}>
        <label className={styles.fieldLabel} htmlFor="task-category">Category <span className={styles.required}>*</span></label>
        <select
          id="task-category"
          className={styles.selectInput}
          value={values.category}
          onChange={e => handleChange('category', e.target.value)}
        >
          <option value="">Select category</option>
          {CATEGORY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {isEditMode && (
        <div className={styles.formField}>
          <label className={styles.fieldLabel} htmlFor="task-status">Status</label>
          <select
            id="task-status"
            className={styles.selectInput}
            value={values.status}
            onChange={e => handleChange('status', e.target.value)}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.formActions}>
        <button onClick={onCancel} className={styles.cancelButton} type="button">Cancel</button>
        <button onClick={handleSubmit} className={styles.submitButton} disabled={!isValid} type="button">
          {isEditMode ? 'Save' : 'Create'}
        </button>
      </div>
    </div>
  );
}
