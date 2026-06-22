import type { BookingStatus, DateString, Service, Staff, StaffService, TimeString, Weekday } from './types';

const WEEKDAYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const BOOKED_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'completed'];

export interface BookingWindow {
  id: string;
  staffId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
}

export interface AvailabilitySlot {
  staffId: string;
  serviceId: string;
  date: DateString;
  startTime: TimeString;
  endTime: TimeString;
  startDateTime: string;
  endDateTime: string;
}

export interface GenerateAvailabilityInput {
  service: Service;
  staff: Staff[];
  staffServices: StaffService[];
  bookings: BookingWindow[];
  startDate: DateString;
  endDate: DateString;
  defaultBufferMinutes: number;
  slotStepMinutes?: number;
  staffId?: string;
  includeWeekends?: boolean;
}

export function generateAvailability(input: GenerateAvailabilityInput): AvailabilitySlot[] {
  const slotStepMinutes = input.slotStepMinutes ?? 30;
  const eligibleStaff = getEligibleStaff(input);
  const dates = getDatesInRange(input.startDate, input.endDate, input.includeWeekends ?? false);

  return eligibleStaff
    .flatMap(staffMember =>
      dates.flatMap(date => generateStaffDaySlots({
        date,
        staffMember,
        service: input.service,
        bookings: input.bookings,
        defaultBufferMinutes: input.defaultBufferMinutes,
        slotStepMinutes,
      }))
    )
    .sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));
}

function getEligibleStaff(input: GenerateAvailabilityInput): Staff[] {
  const serviceStaffIds = new Set(
    input.staffServices
      .filter(link => link.serviceId === input.service.id)
      .map(link => link.staffId)
  );

  return input.staff.filter(staffMember => {
    if (!staffMember.active) return false;
    if (input.staffId && staffMember.id !== input.staffId) return false;
    return serviceStaffIds.has(staffMember.id);
  });
}

function generateStaffDaySlots(args: {
  date: DateString;
  staffMember: Staff;
  service: Service;
  bookings: BookingWindow[];
  defaultBufferMinutes: number;
  slotStepMinutes: number;
}): AvailabilitySlot[] {
  const weekday = getWeekday(args.date);
  const workingDay = args.staffMember.workingHours[weekday];
  if (!workingDay) return [];

  const dayStart = timeToMinutes(workingDay.start);
  const dayEnd = timeToMinutes(workingDay.end);
  const bufferMinutes = args.staffMember.bufferOverrideMinutes ?? args.defaultBufferMinutes;
  const busyWindows = getBusyWindows(args.bookings, args.staffMember.id, args.date, bufferMinutes);
  const breakWindow = workingDay.break
    ? {
        start: timeToMinutes(workingDay.break.start),
        end: timeToMinutes(workingDay.break.end),
      }
    : null;
  const slots: AvailabilitySlot[] = [];

  for (
    let start = dayStart;
    start + args.service.durationMinutes <= dayEnd;
    start += args.slotStepMinutes
  ) {
    const end = start + args.service.durationMinutes;
    const crossesBreak = Boolean(breakWindow && overlaps(start, end, breakWindow.start, breakWindow.end));
    const crossesBooking = busyWindows.some(window => overlaps(start, end, window.start, window.end));

    if (crossesBreak || crossesBooking) continue;

    slots.push({
      staffId: args.staffMember.id,
      serviceId: args.service.id,
      date: args.date,
      startTime: minutesToTime(start),
      endTime: minutesToTime(end),
      startDateTime: makeTimestamp(args.date, start),
      endDateTime: makeTimestamp(args.date, end),
    });
  }

  return slots;
}

function getBusyWindows(
  bookings: BookingWindow[],
  staffId: string,
  date: DateString,
  bufferMinutes: number
): Array<{ start: number; end: number }> {
  return bookings
    .filter(booking => booking.staffId === staffId)
    .filter(booking => BOOKED_STATUSES.includes(booking.status))
    .filter(booking => getDatePart(booking.startTime) === date)
    .map(booking => ({
      start: timeToMinutes(getTimePart(booking.startTime)) - bufferMinutes,
      end: timeToMinutes(getTimePart(booking.endTime)) + bufferMinutes,
    }));
}

function getDatesInRange(startDate: DateString, endDate: DateString, includeWeekends: boolean): DateString[] {
  const dates: DateString[] = [];
  let cursor = startDate;

  while (cursor <= endDate) {
    const dayIndex = new Date(`${cursor}T12:00:00`).getDay();
    if (includeWeekends || (dayIndex >= 1 && dayIndex <= 5)) {
      dates.push(cursor);
    }
    cursor = addDays(cursor, 1);
  }

  return dates;
}

function getWeekday(date: DateString): Weekday {
  return WEEKDAYS[new Date(`${date}T12:00:00`).getDay()];
}

function addDays(dateString: DateString, days: number): DateString {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getDatePart(timestamp: string): DateString {
  return timestamp.slice(0, 10);
}

function getTimePart(timestamp: string): TimeString {
  return timestamp.slice(11, 16);
}

function timeToMinutes(time: TimeString): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): TimeString {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function makeTimestamp(date: DateString, minutes: number): string {
  return `${date}T${minutesToTime(minutes)}:00`;
}

function overlaps(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB;
}
