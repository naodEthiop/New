// Date utility functions for the Bingo game

export interface FormattedDate {
  date: string;
  time: string;
  full: string;
  relative: string;
  isValid: boolean;
}

/**
 * Format a date for display in Ethiopian timezone
 */
export const formatGameDate = (date: Date | any): FormattedDate => {
  try {
    // Handle Firestore Timestamp
    let dateObj: Date;
    if (date && typeof date === 'object' && date.toDate) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (date && typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return {
        date: 'Invalid Date',
        time: 'Invalid Time',
        full: 'Invalid Date',
        relative: 'Invalid Date',
        isValid: false
      };
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return {
        date: 'Invalid Date',
        time: 'Invalid Time',
        full: 'Invalid Date',
        relative: 'Invalid Date',
        isValid: false
      };
    }

    // Format for Ethiopian timezone (UTC+3)
    const ethiopianDate = new Date(dateObj.getTime() + (3 * 60 * 60 * 1000));

    const dateStr = ethiopianDate.toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const timeStr = ethiopianDate.toLocaleTimeString('en-ET', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const fullStr = `${dateStr} at ${timeStr}`;

    // Calculate relative time
    const now = new Date();
    const diffInMs = now.getTime() - dateObj.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    let relativeStr = '';
    if (diffInMs < 0) {
      // Future date
      const absDiffInMinutes = Math.abs(diffInMinutes);
      const absDiffInHours = Math.abs(diffInHours);
      const absDiffInDays = Math.abs(diffInDays);

      if (absDiffInMinutes < 60) {
        relativeStr = `in ${absDiffInMinutes} minute${absDiffInMinutes !== 1 ? 's' : ''}`;
      } else if (absDiffInHours < 24) {
        relativeStr = `in ${absDiffInHours} hour${absDiffInHours !== 1 ? 's' : ''}`;
      } else {
        relativeStr = `in ${absDiffInDays} day${absDiffInDays !== 1 ? 's' : ''}`;
      }
    } else {
      // Past date
      if (diffInMinutes < 60) {
        relativeStr = `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      } else if (diffInHours < 24) {
        relativeStr = `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
      } else {
        relativeStr = `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
      }
    }

    return {
      date: dateStr,
      time: timeStr,
      full: fullStr,
      relative: relativeStr,
      isValid: true
    };
  } catch (error) {
    console.error('Error formatting date:', error);
    return {
      date: 'Invalid Date',
      time: 'Invalid Time',
      full: 'Invalid Date',
      relative: 'Invalid Date',
      isValid: false
    };
  }
};

/**
 * Validate if a date is in the future
 */
export const isFutureDate = (date: Date | any): boolean => {
  try {
    let dateObj: Date;
    if (date && typeof date === 'object' && date.toDate) {
      dateObj = date.toDate();
    } else if (date instanceof Date) {
      dateObj = date;
    } else if (date && typeof date === 'string') {
      dateObj = new Date(date);
    } else {
      return false;
    }

    return dateObj.getTime() > new Date().getTime();
  } catch (error) {
    return false;
  }
};

/**
 * Get the time until a scheduled game starts
 */
export const getTimeUntilGame = (scheduledTime: Date | any): string => {
  try {
    let dateObj: Date;
    if (scheduledTime && typeof scheduledTime === 'object' && scheduledTime.toDate) {
      dateObj = scheduledTime.toDate();
    } else if (scheduledTime instanceof Date) {
      dateObj = scheduledTime;
    } else if (scheduledTime && typeof scheduledTime === 'string') {
      dateObj = new Date(scheduledTime);
    } else {
      return 'Invalid time';
    }

    const now = new Date();
    const diffInMs = dateObj.getTime() - now.getTime();

    if (diffInMs <= 0) {
      return 'Game should start now';
    }

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''}`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
    }
  } catch (error) {
    return 'Invalid time';
  }
};

/**
 * Format current time for display
 */
export const getCurrentTimeFormatted = (): string => {
  const now = new Date();
  const ethiopianTime = new Date(now.getTime() + (3 * 60 * 60 * 1000));
  
  return ethiopianTime.toLocaleString('en-ET', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get minimum datetime for scheduling (current time + 5 minutes)
 */
export const getMinDateTime = (): string => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 5);
  return now.toISOString().slice(0, 16);
};

/**
 * Validate scheduled time
 */
export const validateScheduledTime = (scheduledTime: string): { isValid: boolean; error?: string } => {
  if (!scheduledTime) {
    return { isValid: true }; // Empty is valid (immediate start)
  }

  try {
    const scheduledDate = new Date(scheduledTime);
    const now = new Date();

    if (isNaN(scheduledDate.getTime())) {
      return { isValid: false, error: 'Invalid date format' };
    }

    if (scheduledDate <= now) {
      return { isValid: false, error: 'Scheduled time must be in the future' };
    }

    // Check if it's at least 5 minutes in the future
    const minTime = new Date(now.getTime() + (5 * 60 * 1000));
    if (scheduledDate < minTime) {
      return { isValid: false, error: 'Scheduled time must be at least 5 minutes from now' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid date' };
  }
}; 