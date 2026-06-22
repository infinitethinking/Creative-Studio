export type UUID = string;
export type DateString = string;
export type TimeString = string;
export type TimestampString = string;

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type StaffRole = 'owner' | 'practitioner' | 'assistant';
export type PaymentTiming = 'upfront' | 'post_session';
export type PreferredChannel = 'sms' | 'email';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type ImportSource = 'csv' | 'manual' | 'booking';

export interface WorkingDay {
  start: TimeString;
  end: TimeString;
  break?: {
    start: TimeString;
    end: TimeString;
  };
}

export type WorkingHours = Partial<Record<Weekday, WorkingDay | null>>;

export interface Practice {
  id: UUID;
  slug: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  defaultBufferMinutes: number;
  ownerId: UUID;
  createdAt: TimestampString;
}

export interface Staff {
  id: UUID;
  practiceId: UUID;
  userId: UUID | null;
  slug: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
  bufferOverrideMinutes: number | null;
  workingHours: WorkingHours;
  active: boolean;
  createdAt: TimestampString;
}

export interface Service {
  id: UUID;
  practiceId: UUID;
  slug: string;
  name: string;
  durationMinutes: number;
  basePrice: number;
  priceMin: number | null;
  priceMax: number | null;
  paymentTiming: PaymentTiming;
  active: boolean;
}

export interface StaffService {
  staffId: UUID;
  serviceId: UUID;
  priceOverride: number | null;
}

export interface Client {
  id: UUID;
  practiceId: UUID;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  preferredChannel: PreferredChannel;
  preferredStaffId: UUID | null;
  notes: string;
  lastVisitDate: DateString | null;
  noShowCount: number;
  importedFrom: ImportSource;
  createdAt: TimestampString;
}

export interface Booking {
  id: UUID;
  practiceId: UUID;
  staffId: UUID;
  serviceId: UUID;
  clientId: UUID;
  startTime: TimestampString;
  endTime: TimestampString;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentTiming: PaymentTiming;
  stripePaymentId: string | null;
  amount: number;
  notes: string;
  createdBy: UUID | null;
  createdAt: TimestampString;
}
