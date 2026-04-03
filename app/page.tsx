'use client';

import { useState, useEffect } from 'react';
import CalendarGrid from '@/components/CalendarGrid';
import EventModal from '@/components/EventModal';
import EventList from '@/components/EventList';
import ReminderNotification from '@/components/ReminderNotification';
import { CalendarEvent, Reminder } from '@/types/calendar';
import { v4 as uuidv4 } from 'uuid';
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Bell, Calendar } from 'lucide-react';

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [activeReminders, setActiveReminders] = useState<Reminder[]>([]);
  const [view, setView] = useState<'month' | 'list'>('month');

  useEffect(() => {
    const stored = localStorage.getItem('calendar-events');
    if (stored) {
      const parsed = JSON.parse(stored) as Array<{
        id: string;
        title: string;
        description?: string;
        date: string;
        endDate?: string;
        color: string;
        reminder?: number;
        allDay: boolean;
      }>;
      setEvents(
        parsed.map((e) => ({
          ...e,
          date: new Date(e.date),
          endDate: e.endDate ? new Date(e.endDate) : undefined,
        }))
      );
    }
    const storedReminders = localStorage.getItem('calendar-reminders');
    if (storedReminders) {
      const parsed = JSON.parse(storedReminders) as Array<{
        id: string;
        eventId: string;
        eventTitle: string;
        reminderTime: string;
        dismissed: boolean;
      }>;
      setReminders(
        parsed.map((r) => ({
          ...r,
          reminderTime: new Date(r.reminderTime),
        }))
      );
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendar-events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('calendar-reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const due = reminders.filter(
        (r) => !r.dismissed && new Date(r.reminderTime) <= now
      );
      if (due.length > 0) {
        setActiveReminders(due);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [reminders]);

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (editingEvent) {
      const updatedEvent: CalendarEvent = { ...eventData, id: editingEvent.id };
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? updatedEvent : e))
      );
      if (eventData.reminder !== undefined) {
        const reminderTime = new Date(
          eventData.date.getTime() - eventData.reminder * 60000
        );
        setReminders((prev) => [
          ...prev.filter((r) => r.eventId !== editingEvent.id),
          {
            id: uuidv4(),
            eventId: editingEvent.id,
            eventTitle: eventData.title,
            reminderTime,
            dismissed: false,
          },
        ]);
      } else {
        setReminders((prev) =>
          prev.filter((r) => r.eventId !== editingEvent.id)
        );
      }
    } else {
      const newEvent: CalendarEvent = { ...eventData, id: uuidv4() };
      setEvents((prev) => [...prev, newEvent]);
      if (eventData.reminder !== undefined) {
        const reminderTime = new Date(
          eventData.date.getTime() - eventData.reminder * 60000
        );
        setReminders((prev) => [
          ...prev,
          {
            id: uuidv4(),
            eventId: newEvent.id,
            eventTitle: eventData.title,
            reminderTime,
            dismissed: false,
          },
        ]);
      }
    }
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setReminders((prev) => prev.filter((r) => r.eventId !== id));
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDismissReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, dismissed: true } : r))
    );
    setActiveReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleOpenModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const eventsThisMonth = events.filter((e) => {
    const d = new Date(e.date);
    return d >= monthStart && d <= monthEnd;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-xl p-2">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">CalendarPro</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === 'month'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  view === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                List
              </button>
            </div>
            <div className="relative">
              <button className="relative p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {reminders.filter((r) => !r.dismissed).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {reminders.filter((r) => !r.dismissed).length}
                  </span>
                )}
              </button>
            </div>
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600 hover:text-slate-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-slate-800 min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600 hover:text-slate-800"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        {view === 'month' ? (
          <CalendarGrid
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            onSelectDate={setSelectedDate}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
            onAddEvent={() => {
              setEditingEvent(null);
              setIsModalOpen(true);
            }}
          />
        ) : (
          <EventList
            events={eventsThisMonth}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        )}

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Total Events</p>
            <p className="text-2xl font-bold text-slate-800">{events.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">This Month</p>
            <p className="text-2xl font-bold text-blue-600">
              {eventsThisMonth.length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">Active Reminders</p>
            <p className="text-2xl font-bold text-amber-500">
              {reminders.filter((r) => !r.dismissed).length}
            </p>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEvent(null);
          }}
          onSave={handleSaveEvent}
          editingEvent={editingEvent}
          selectedDate={selectedDate}
        />
      )}

      {activeReminders.map((reminder) => (
        <ReminderNotification
          key={reminder.id}
          reminder={reminder}
          onDismiss={handleDismissReminder}
        />
      ))}
    </div>
  );
}
