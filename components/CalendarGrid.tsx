'use client';

import { useMemo, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from 'date-fns';
import { CalendarEvent, EVENT_COLORS, EventColor } from '@/types/calendar';
import { Plus, ChevronDown } from 'lucide-react';

interface CalendarGridProps {
  currentDate: Date;
  selectedDate: Date | null;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
  onAddEvent: () => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarGrid({
  currentDate,
  selectedDate,
  events,
  onSelectDate,
  onEditEvent,
  onDeleteEvent,
  onAddEvent,
}: CalendarGridProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(new Date(e.date), day));

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isTodayDate = isToday(day);
          const dayKey = format(day, 'yyyy-MM-dd');
          const isExpanded = expandedDay === dayKey;
          const visibleEvents = isExpanded ? dayEvents : dayEvents.slice(0, 3);
          const hasMore = dayEvents.length > 3 && !isExpanded;

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(day)}
              className={`min-h-[120px] p-2 border-b border-r border-slate-100 cursor-pointer transition-colors hover:bg-slate-50 ${
                !isCurrentMonth ? 'bg-slate-50/50' : ''
              } ${
                isSelected && isCurrentMonth ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
                    isTodayDate
                      ? 'bg-blue-600 text-white'
                      : isCurrentMonth
                      ? 'text-slate-700 hover:bg-slate-200'
                      : 'text-slate-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                {isCurrentMonth && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDate(day);
                      onAddEvent();
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-0.5 hover:bg-blue-100 rounded transition-all text-slate-400 hover:text-blue-600"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-0.5">
                {visibleEvents.map((event) => {
                  const colorKey = (event.color as EventColor) in EVENT_COLORS
                    ? (event.color as EventColor)
                    : 'blue';
                  const colors = EVENT_COLORS[colorKey];
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEvent(event);
                      }}
                      className={`text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${colors.bg} ${colors.text} border ${colors.border}`}
                      title={event.title}
                    >
                      {!event.allDay && (
                        <span className="opacity-70 mr-1">
                          {format(new Date(event.date), 'HH:mm')}
                        </span>
                      )}
                      {event.title}
                    </div>
                  );
                })}
                {hasMore && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedDay(dayKey);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-0.5 px-1"
                  >
                    <ChevronDown className="w-3 h-3" />
                    +{dayEvents.length - 3} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
