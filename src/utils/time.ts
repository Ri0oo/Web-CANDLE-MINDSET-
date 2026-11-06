/**
 * Time utilities for CANDLE MINDSET AI SIGNAL
 * Asia/Dhaka timezone (UTC+6)
 * 24-hour format (HH:MM)
 */

export interface DhakaEntryTimeResult {
  formattedTime: string;      // e.g. "17:46"
  m1String: string;           // e.g. "M1 = 17:46"
  entryTimestamp: number;     // exact epoch timestamp
  dhakaNowString: string;     // e.g. "17:45:32"
}

/**
 * Calculates the next minute entry time in Asia/Dhaka (UTC+6)
 *
 * Rules:
 * Signal generation occurs at timestamp T.
 * The next minute boundary is calculated by taking the floor of current minute + 1 minute:
 * - 17:45:00 -> M1 = 17:46
 * - 17:45:30 -> M1 = 17:46
 * - 17:45:59 -> M1 = 17:46
 * - 17:46:00 -> M1 = 17:47
 */
export function calculateDhakaNextMinute(timestamp: number = Date.now()): DhakaEntryTimeResult {
  const currentFloorMinute = Math.floor(timestamp / 60000) * 60000;
  const nextMinuteTimestamp = currentFloorMinute + 60000;
  const nextMinuteDate = new Date(nextMinuteTimestamp);

  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const nowFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedTime = timeFormatter.format(nextMinuteDate);
  const dhakaNowString = nowFormatter.format(new Date(timestamp));

  return {
    formattedTime,
    m1String: `M1 = ${formattedTime}`,
    entryTimestamp: nextMinuteTimestamp,
    dhakaNowString,
  };
}

/**
 * Returns current live time in Asia/Dhaka (HH:MM:SS)
 */
export function getLiveDhakaTime(): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return formatter.format(new Date());
}
