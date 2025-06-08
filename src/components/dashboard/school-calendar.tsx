'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEventsStore } from '@/store/events-store';
import { Event } from '@/types';

export function SchoolCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date()); // Current month based on local time
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isTooltipHovered, setIsTooltipHovered] = useState(false);
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const { events, fetchEvents, getEventsByDate } = useEventsStore();

  // Helper function to create date string without timezone issues
  const createDateString = (year: number, month: number, day: number): string => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Helper function to parse date string and create local date
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  // Helper function to format date for Philippine Time display
  const formatDateForPHT = (dateString: string): string => {
    const localDate = parseLocalDate(dateString);
    return localDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load events on component mount
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Comprehensive cleanup function
  const clearAllTimeouts = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
      setDebounceTimeout(null);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [hideTimeout, debounceTimeout]);

  // Reset tooltip state when switching between different dates
  useEffect(() => {
    if (pendingDate && pendingDate !== hoveredDate) {
      clearAllTimeouts();
      setHoveredDate(pendingDate);
      setPendingDate(null);
    }
  }, [pendingDate, hoveredDate]);

  // Get calendar data
  const getCalendarData = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and how many days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Get days from previous month to fill the grid
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    const calendarDays: Array<{ day: number; isCurrentMonth: boolean; isToday: boolean }> = [];

    // Add days from previous month
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      calendarDays.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Add days from current month
    const today = new Date(); // Current local date
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getFullYear() === year &&
                     today.getMonth() === month &&
                     today.getDate() === day;
      calendarDays.push({
        day,
        isCurrentMonth: true,
        isToday
      });
    }

    // Add days from next month to complete the grid (42 days total - 6 weeks)
    const remainingDays = 42 - calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      calendarDays.push({
        day,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return calendarDays;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const calendarDays = getCalendarData();

  // Handle mouse enter for tooltip - improved race condition handling
  const handleMouseEnter = (dateString: string, event: React.MouseEvent) => {
    // Always clear any existing timeouts first
    clearAllTimeouts();

    const dayEvents = getEventsByDate(dateString);
    if (dayEvents.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });

      // If we're switching to a different date, handle it with debouncing for rapid movements
      if (dateString !== hoveredDate) {
        if (hoveredDate && !isTooltipHovered) {
          // Switching between calendar days - use debouncing for rapid movements
          const timeout = setTimeout(() => {
            setHoveredDate(dateString);
          }, 50); // Small debounce to prevent rapid flickering
          setDebounceTimeout(timeout);
        } else if (hoveredDate && isTooltipHovered) {
          // User is on tooltip but hovering a different day - queue the change
          setPendingDate(dateString);
        } else {
          // No current tooltip - show immediately
          setHoveredDate(dateString);
        }
      }
    } else {
      // Day has no events - hide tooltip if not currently hovering tooltip
      if (hoveredDate && !isTooltipHovered) {
        const timeout = setTimeout(() => {
          setHoveredDate(null);
          setPendingDate(null);
        }, 100);
        setHideTimeout(timeout);
      }
    }
  };

  // Handle mouse leave for tooltip with improved logic
  const handleMouseLeave = () => {
    // Only start hide timer if user is not hovering the tooltip
    if (!isTooltipHovered) {
      clearAllTimeouts();
      const timeout = setTimeout(() => {
        if (!isTooltipHovered) { // Double-check before hiding
          setHoveredDate(null);
          setPendingDate(null);
        }
      }, 200); // Reduced delay for better responsiveness
      setHideTimeout(timeout);
    }
  };

  // Handle tooltip mouse enter (keep tooltip visible)
  const handleTooltipMouseEnter = () => {
    setIsTooltipHovered(true);
    clearAllTimeouts();

    // If there's a pending date change, apply it now
    if (pendingDate && pendingDate !== hoveredDate) {
      setHoveredDate(pendingDate);
      setPendingDate(null);
    }
  };

  // Handle tooltip mouse leave (hide tooltip)
  const handleTooltipMouseLeave = () => {
    setIsTooltipHovered(false);
    clearAllTimeouts();

    const timeout = setTimeout(() => {
      setHoveredDate(null);
      setPendingDate(null);
    }, 100); // Quick hide when leaving tooltip
    setHideTimeout(timeout);
  };

  // Handle scroll within tooltip (keep tooltip visible)
  const handleTooltipScroll = (e: React.UIEvent) => {
    // Prevent scroll events from bubbling up and triggering mouse leave
    e.stopPropagation();

    // Ensure tooltip stays visible during scrolling
    setIsTooltipHovered(true);
    clearAllTimeouts();
  };

  // Handle mouse events within scrollable content (keep tooltip visible)
  const handleScrollAreaMouseMove = (e: React.MouseEvent) => {
    // Prevent mouse move events from bubbling up during scroll interactions
    e.stopPropagation();

    // Ensure tooltip stays visible during interaction
    setIsTooltipHovered(true);
    clearAllTimeouts();
  };

  // Get event type color for tooltip
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'orientation': return 'text-green-600 bg-green-50';
      case 'assessment': return 'text-amber-600 bg-amber-50';
      case 'workshop': return 'text-purple-600 bg-purple-50';
      case 'lesson': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="calendar-container bg-white dark:bg-slate-800 rounded-lg shadow-lg border-4 border-green-500 dark:border-green-400 h-full flex flex-col overflow-hidden">
      {/* Calendar Header */}
      <div className="bg-green-500 dark:bg-green-600 text-white p-3 sm:p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="text-white hover:bg-green-600 dark:hover:bg-green-700 p-1"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold">{currentDate.getFullYear()}</div>
            <div className="text-xs sm:text-sm font-medium">SCHOOL CALENDAR</div>
            <div className="text-xs hidden sm:block">{new Date().toLocaleTimeString('en-US', {
              hour12: true,
              hour: 'numeric',
              minute: '2-digit',
              second: '2-digit'
            })} PHT</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="text-white hover:bg-green-600 dark:hover:bg-green-700 p-1"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-center">
          <div className="text-base sm:text-lg font-bold">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 flex-shrink-0">
          {dayNames.map((day, index) => (
            <div key={index} className="text-center font-bold text-gray-700 dark:text-gray-300 py-1 sm:py-2 text-xs sm:text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 grid-rows-6 gap-0.5 sm:gap-1 flex-1 min-h-0">
          {calendarDays.map((dayData, index) => {
            // Get events for this day - create date string directly to avoid timezone issues
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const day = dayData.day;

            // Create date string in YYYY-MM-DD format without timezone conversion
            const dateString = dayData.isCurrentMonth
              ? createDateString(year, month, day)
              : '';

            const dayEvents = dayData.isCurrentMonth ? getEventsByDate(dateString) : [];
            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={index}
                className={`
                  calendar-day flex flex-col items-center justify-start text-xs sm:text-sm border border-gray-200 dark:border-gray-600 relative p-0.5 sm:p-1 min-h-0 cursor-pointer
                  ${dayData.isCurrentMonth
                    ? dayData.isToday
                      ? 'bg-blue-500 text-white font-bold'
                      : hasEvents
                        ? 'text-gray-900 dark:text-white hover:bg-green-50 dark:hover:bg-green-900/30 hover:border-green-300 dark:hover:border-green-400 hover:shadow-sm'
                        : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                    : 'text-gray-400 dark:text-gray-500'
                  }
                `}
                onMouseEnter={(e) => dayData.isCurrentMonth && handleMouseEnter(dateString, e)}
                onMouseLeave={handleMouseLeave}
              >
                <span>{dayData.day}</span>
                {hasEvents && dayData.isCurrentMonth && (
                  <div className="flex space-x-1 mt-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`w-1.5 h-1.5 rounded-full ${
                          event.type === 'orientation' ? 'bg-green-500' :
                          event.type === 'assessment' ? 'bg-amber-500' :
                          event.type === 'workshop' ? 'bg-purple-500' :
                          'bg-blue-500'
                        }`}
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500">+{dayEvents.length - 3}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDate && (
        <div
          className="calendar-tooltip fixed z-50"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            // Add padding to increase interaction area
            padding: '4px'
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="bg-white dark:bg-slate-800 border-4 border-green-500 dark:border-green-400 rounded-lg shadow-xl p-4 max-w-sm">
            {/* Tooltip Header */}
            <div className="bg-green-500 dark:bg-green-600 text-white px-3 py-2 rounded-t-md -mx-4 -mt-4 mb-3">
              <h3 className="font-bold text-sm">
                {formatDateForPHT(hoveredDate)}
              </h3>
            </div>

            {/* Events List */}
            <div
              className="space-y-3 max-h-48 overflow-y-auto tooltip-scroll"
              onScroll={handleTooltipScroll}
              onMouseMove={handleScrollAreaMouseMove}
              onMouseEnter={handleTooltipMouseEnter}
            >
              {getEventsByDate(hoveredDate).map((event, index) => (
                <div key={event.id} className={`p-2 rounded-md border ${getEventTypeColor(event.type)}`}>
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="font-semibold text-sm leading-tight">{event.title}</h4>
                    <span className={`event-type-badge text-xs px-2 py-1 rounded-full font-medium ${
                      event.type === 'orientation' ? 'bg-green-100 text-green-700' :
                      event.type === 'assessment' ? 'bg-amber-100 text-amber-700' :
                      event.type === 'workshop' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {event.type}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{event.time}</span>
                  </div>

                  <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{event.location}</span>
                  </div>

                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                    {event.description.length > 80
                      ? `${event.description.substring(0, 80)}...`
                      : event.description
                    }
                  </p>
                </div>
              ))}
            </div>

            {/* Tooltip Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-green-500 dark:border-t-green-600"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
