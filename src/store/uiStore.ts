import { create } from 'zustand'

type ViewMode = 'list' | 'calendar'
type CalendarViewMode = 'month' | 'week'

interface UIState {
  // Calendar state
  calendarYear: number
  calendarMonth: number
  selectedDate: string | null
  eventsViewMode: ViewMode
  calendarViewMode: CalendarViewMode
  calendarWeekOffset: number

  // Navigation state
  selectedGroupId: string | null
  selectedKetePostId: string | null

  // UI state
  isMobileMenuOpen: boolean
  isSearchOpen: boolean

  // Actions
  setCalendarYear: (year: number) => void
  setCalendarMonth: (month: number) => void
  setSelectedDate: (date: string | null) => void
  setEventsViewMode: (mode: ViewMode) => void
  setCalendarViewMode: (mode: CalendarViewMode) => void
  setSelectedGroupId: (id: string | null) => void
  setSelectedKetePostId: (id: string | null) => void
  setMobileMenuOpen: (open: boolean) => void
  setSearchOpen: (open: boolean) => void
  changeMonth: (delta: number) => void
  changeWeek: (delta: number) => void
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
  selectedDate: null,
  eventsViewMode: 'list',
  calendarViewMode: 'month',
  calendarWeekOffset: 0,
  selectedGroupId: null,
  selectedKetePostId: null,
  isMobileMenuOpen: false,
  isSearchOpen: false,

  // Actions
  setCalendarYear: (calendarYear) => set({ calendarYear }),
  setCalendarMonth: (calendarMonth) => set({ calendarMonth }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setEventsViewMode: (eventsViewMode) => set({ eventsViewMode }),
  setCalendarViewMode: (calendarViewMode) => set({ calendarViewMode }),
  setSelectedGroupId: (selectedGroupId) => set({ selectedGroupId }),
  setSelectedKetePostId: (selectedKetePostId) => set({ selectedKetePostId }),
  setMobileMenuOpen: (isMobileMenuOpen) => set({ isMobileMenuOpen }),
  setSearchOpen: (isSearchOpen) => set({ isSearchOpen }),

  changeMonth: (delta) => set((state) => {
    let newMonth = state.calendarMonth + delta
    let newYear = state.calendarYear

    if (newMonth > 11) {
      newMonth = 0
      newYear++
    } else if (newMonth < 0) {
      newMonth = 11
      newYear--
    }

    return { calendarMonth: newMonth, calendarYear: newYear }
  }),

  changeWeek: (delta) => set((state) => ({
    calendarWeekOffset: state.calendarWeekOffset + delta
  }))
}))
