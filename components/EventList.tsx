'use client';

import { CalendarEvent, EVENT_COLORS, EventColor } from '@/types/calendar';
import { format } from 'date-fns';
import { Clock, Bell, Edit2, Trash2, CalendarDays } from 'lucide-react';

interface EventListProps {
  events: CalendarEvent[];
  onEdit: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

export default function EventList({ events, onEdit, onDelete }: EventListProps) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No events this month</p>
        <p className="text-slate-400 text-sm mt-1">Click &quot;Add Event&quot; to create one</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="divide-y divide-slate-100">
        {sorted.map((event) => {
          const colorKey =
            (event.color as EventColor) in EVENT_COLORS
              ? (event.color as EventColor)
              : 'blue';
          const colors = EVENT_COLORS[colorKey];
          return (
            <div
              key={event.id}
              className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors group"
            >
              <div
                className={`w-1 self-stretch rounded-full flex-shrink-0 ${colors.dot}`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 truncate">
                      {event.title}
                    </h3>
                    {event.description && (
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <button
                      onClick={() => onEdit(event)}
                      className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-slate-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(event.id)}
                      className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {event.allDay
                      ? format(new Date(event.date), 'MMM d, yyyy') + ' (All day)'
                      : format(new Date(event.date), 'MMM d, yyyy · HH:mm')}
                  </span>
                  {event.reminder !== undefined && (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Bell className="w-3.5 h-3.5" />
                      Reminder set
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
