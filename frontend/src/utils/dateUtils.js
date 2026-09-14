/**
 * Utility functions for calculating project deadlines, formatting dates,
 * and validating task timelines across FreeMatch AI Client & Freelancer workspaces.
 */

/**
 * Formats a Date object into "MMM D, YYYY" format (e.g., "Oct 8, 2026").
 *
 * @param {Date|string|number} dateObj 
 * @returns {string}
 */
export function formatFormattedDate(dateObj) {
  if (!dateObj) return '';
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthStr = months[d.getMonth()];
  const dayStr = d.getDate();
  const yearStr = d.getFullYear();
  return `${monthStr} ${dayStr}, ${yearStr}`;
}

/**
 * Calculates a project or contract deadline based on its start/posted date and duration.
 *
 * @param {string|Date} startDateInput - Posted date or start date (e.g., "Sep 8, 2026", "2026-09-08", ISO string, or Date)
 * @param {string} durationStr - Duration string (e.g., "1 Month", "2 Months", "3 Weeks", "10 Days")
 * @returns {string} - Formatted deadline string (e.g., "Oct 8, 2026")
 */
export function calculateProjectDeadline(startDateInput, durationStr) {
  let startDate;

  if (startDateInput) {
    if (startDateInput instanceof Date) {
      startDate = new Date(startDateInput);
    } else if (typeof startDateInput === 'string') {
      const cleanStr = startDateInput.trim();
      if (cleanStr.toLowerCase() === 'just now' || cleanStr.toLowerCase() === 'today') {
        startDate = new Date();
      } else {
        const parsed = new Date(cleanStr);
        if (!isNaN(parsed.getTime())) {
          startDate = parsed;
        } else {
          startDate = new Date();
        }
      }
    } else {
      startDate = new Date();
    }
  } else {
    startDate = new Date();
  }

  if (isNaN(startDate.getTime())) {
    startDate = new Date();
  }

  const dur = (durationStr && typeof durationStr === 'string' && durationStr.trim()) ? durationStr.trim() : '1 Month';
  const match = dur.match(/(\d+)\s*(month|week|day)s?/i);

  let targetDate = new Date(startDate.getTime());

  if (match) {
    const num = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    if (unit === 'month') {
      const startDay = targetDate.getDate();
      targetDate.setMonth(targetDate.getMonth() + num);
      // Prevent month day overflow (e.g., Jan 31 + 1 month -> Feb 28/29)
      if (targetDate.getDate() !== startDay) {
        targetDate.setDate(0);
      }
    } else if (unit === 'week') {
      targetDate.setDate(targetDate.getDate() + num * 7);
    } else if (unit === 'day') {
      targetDate.setDate(targetDate.getDate() + num);
    }
  } else {
    // Default fallback: 1 Month
    const startDay = targetDate.getDate();
    targetDate.setMonth(targetDate.getMonth() + 1);
    if (targetDate.getDate() !== startDay) {
      targetDate.setDate(0);
    }
  }

  return formatFormattedDate(targetDate);
}

/**
 * Validates and derives a task deadline ensuring it is logically within the project timeline.
 * If task.deadline is missing, invalid, or earlier than the project start date (e.g., Aug 30, 2026),
 * it recalculates it to be within the project timeline.
 *
 * @param {string} taskDeadlineInput 
 * @param {string|Date} projectStartDateInput 
 * @param {string} projectDurationInput 
 * @returns {string} - Formatted task deadline (e.g., "Oct 8, 2026")
 */
export function getValidTaskDeadline(taskDeadlineInput, projectStartDateInput, projectDurationInput) {
  const projectDeadlineStr = calculateProjectDeadline(projectStartDateInput, projectDurationInput);
  
  let projectStartDate = projectStartDateInput ? new Date(projectStartDateInput) : new Date();
  if (isNaN(projectStartDate.getTime())) {
    projectStartDate = new Date();
  }

  if (!taskDeadlineInput || typeof taskDeadlineInput !== 'string' || !taskDeadlineInput.trim()) {
    return projectDeadlineStr;
  }

  const taskDate = new Date(taskDeadlineInput.trim());
  if (isNaN(taskDate.getTime())) {
    return projectDeadlineStr;
  }

  // If task date is before project start date (e.g., Aug 30, 2026 before Sep 8, 2026)
  if (taskDate < projectStartDate) {
    return projectDeadlineStr;
  }

  return formatFormattedDate(taskDate);
}
