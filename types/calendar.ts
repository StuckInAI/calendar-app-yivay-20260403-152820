export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  endDate?: Date;
  color: string;
  reminder?: number; // minutes before event
  allDay: boolean;
}

export interface Reminder {
  id: string;
  eventId: string;
  eventTitle: string;
  reminderTime: Date;
  dismissed: boolean;
}

export type EventColor =
  | 'blue'
  | 'red'
  | 'green'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'teal';

export const EVENT_COLORS: Record<EventColor, { bg: string; text: string; border: string; dot: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500' },
  red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' },
  green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', dot: 'bg-green-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300', dot: 'bg-purple-500' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-300', dot: 'bg-pink-500' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-300', dot: 'bg-teal-500' },
};
