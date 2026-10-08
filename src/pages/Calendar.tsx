import { useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Video, User } from 'lucide-react';
import { useAutomationStore } from '../store/automationStore';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';

export default function Calendar() {
  const { appointments, contacts } = useAutomationStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const today = () => setCurrentDate(new Date());

  const getAppointmentsForDay = (date: Date) => {
    return Object.values(appointments).filter(apt => 
      isSameDay(new Date(apt.date), date)
    ).sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Calendar</h1>
          <p className="text-gray-500 mt-1">Manage your automated bookings and scheduled demos.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={today} className="px-4 py-2 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">
            Today
          </button>
          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={prevWeek} className="p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-2 text-sm font-medium border-x border-gray-200 min-w-[140px] text-center">
              {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d, yyyy')}
            </div>
            <button onClick={nextWeek} className="p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-[var(--color-border)] bg-gray-50/50">
          {weekDays.map((day, i) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div key={i} className="py-4 text-center border-r border-[var(--color-border)] last:border-0">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  {format(day, 'EEE')}
                </div>
                <div className={`text-lg font-semibold mx-auto w-8 h-8 flex items-center justify-center rounded-full ${
                  isToday ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-7 overflow-y-auto min-h-[500px]">
          {weekDays.map((day, i) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={i} 
                className={`border-r border-[var(--color-border)] p-2 space-y-2 ${
                  isToday ? 'bg-indigo-50/10' : ''
                } last:border-0 relative min-h-full`}
              >
                {dayAppointments.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 group">
                    <button className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      +
                    </button>
                  </div>
                )}
                
                {dayAppointments.map(apt => {
                  const contact = contacts[apt.contactId];
                  return (
                    <div 
                      key={apt.id}
                      className="bg-white border border-indigo-100 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                      
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 mb-2">
                        <Clock className="w-3 h-3" />
                        {apt.time}
                      </div>
                      
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">{apt.topic}</h4>
                      
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                        <User className="w-3 h-3" />
                        <span className="truncate">{contact?.name || 'Unknown'}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md w-max border border-gray-100">
                        <Video className="w-3 h-3 text-gray-400" />
                        Google Meet
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
