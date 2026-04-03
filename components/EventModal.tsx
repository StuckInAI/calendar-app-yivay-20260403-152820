'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, EventColor, EVENT_COLORS } from '@/types/calendar';
import { format } from 'date-fns';
import { X, Trash2, Bell, Clock, AlignLeft, Tag } from 'lucide-react';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  editingEvent: CalendarEvent | null;
  selectedDate: Date | null;
}

const REMINDER_OPTIONS = [
  { label: 'No reminder', value: undefined },
  { label: '5 minutes before', value: 5 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '2 hours before', value: 120 },
  { label: '1 day before', value: 1440 },
];

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  editingEvent,
  selectedDate,
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [color, setColor] = useState<EventColor>('blue');
  const [reminder, setReminder] = useState<number | undefined>(undefined);
  const [allDay, setAllDay] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDescription(editingEvent.description || '');
      setDate(format(new Date(editingEvent.date), 'yyyy-MM-dd'));
      setTime(editingEvent.allDay ? '' : format(new Date(editingEvent.date), 'HH:mm'));
      setEndDate(
        editingEvent.endDate
          ? format(new Date(editingEvent.endDate), 'yyyy-MM-dd')
          : ''
      );
      setEndTime(
        editingEvent.endDate && !editingEvent.allDay
          ? format(new Date(editingEvent.endDate), 'HH:mm')
          : ''
      );
      const colorKey = editingEvent.color as EventColor;
      setColor(colorKey in EVENT_COLORS ? colorKey : 'blue');
      setReminder(editingEvent.reminder);
      setAllDay(editingEvent.allDay);
    } else {
      setTitle('');
      setDescription('');
      setDate(
        selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
      );
      setTime(format(new Date(), 'HH:mm'));
      setEndDate('');
      setEndTime('');
      setColor('blue');
      setReminder(undefined);
      setAllDay(false);
    }
    setErrors({});
  }, [editingEvent, selectedDate, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!date) newErrors.date = 'Date is required';
    if (!allDay && !time) newErrors.time = 'Time is required';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const dateObj = allDay
      ? new Date(`${date}T00:00:00`)
      : new Date(`${date}T${time}:00`);

    let endDateObj: Date | undefined;
    if (endDate) {
      endDateObj = allDay
        ? new Date(`${endDate}T23:59:59`)
        : endTime
        ? new Date(`${endDate}T${endTime}:00`)
        : new Date(`${endDate}T23:59:59`);
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      date: dateObj,
      endDate: endDateObj,
      color,
      reminder,
      allDay,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">
            {editingEvent ? 'Edit Event' : 'New Event'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Tag className="w-4 h-4 inline mr-1.5" />
              Event Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title"
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800 placeholder:text-slate-400 ${
                errors.title ? 'border-red-400' : 'border-slate-300'
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <AlignLeft className="w-4 h-4 inline mr-1.5" />
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description"
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* All Day Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAllDay(!allDay)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                allDay ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  allDay ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-sm font-medium text-slate-700">All day</span>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                <Clock className="w-4 h-4 inline mr-1.5" />
                Start Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800 ${
                  errors.date ? 'border-red-400' : 'border-slate-300'
                }`}
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>
            {!allDay && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800 ${
                    errors.time ? 'border-red-400' : 'border-slate-300'
                  }`}
                />
                {errors.time && (
                  <p className="text-red-500 text-xs mt-1">{errors.time}</p>
                )}
              </div>
            )}
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800"
              />
            </div>
            {!allDay && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800"
                />
              </div>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(EVENT_COLORS) as EventColor[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${EVENT_COLORS[c].dot} ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-slate-400 scale-110'
                      : 'hover:scale-105'
                  }`}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Bell className="w-4 h-4 inline mr-1.5" />
              Reminder
            </label>
            <select
              value={reminder ?? ''}
              onChange={(e) =>
                setReminder(
                  e.target.value === '' ? undefined : Number(e.target.value)
                )
              }
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-slate-800 bg-white"
            >
              {REMINDER_OPTIONS.map((opt) => (
                <option key={opt.label} value={opt.value ?? ''}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              {editingEvent ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
