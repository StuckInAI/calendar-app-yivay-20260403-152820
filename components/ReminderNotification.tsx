'use client';

import { Reminder } from '@/types/calendar';
import { Bell, X } from 'lucide-react';
import { format } from 'date-fns';

interface ReminderNotificationProps {
  reminder: Reminder;
  onDismiss: (id: string) => void;
}

export default function ReminderNotification({
  reminder,
  onDismiss,
}: ReminderNotificationProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-white border border-amber-200 rounded-xl shadow-lg p-4 flex items-start gap-3 max-w-sm">
        <div className="bg-amber-100 rounded-lg p-2 flex-shrink-0">
          <Bell className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm">Reminder</p>
          <p className="text-slate-700 font-medium truncate">{reminder.eventTitle}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {format(new Date(reminder.reminderTime), 'MMM d · HH:mm')}
          </p>
        </div>
        <button
          onClick={() => onDismiss(reminder.id)}
          className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
