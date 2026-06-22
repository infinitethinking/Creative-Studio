export type UUID = string;
export type TimestampString = string;
export type DateString = string;
export type TimeString = string;

export type StaffRole = 'owner' | 'practitioner' | 'assistant';
export type PaymentTiming = 'upfront' | 'post_session';
export type PreferredChannel = 'sms' | 'email';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';
export type RecurringFrequency = 'weekly' | 'biweekly' | 'monthly';
export type RecurringStatus = 'active' | 'paused' | 'cancelled';
export type ConflictRule = 'skip' | 'offer_alternative';
export type ReminderChannel = 'sms' | 'email';
export type ImportSource = 'csv' | 'manual' | 'booking';
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface WorkingDay {
  start: TimeString;
  end: TimeString;
  break?: {
    start: TimeString;
    end: TimeString;
  };
}

export type WorkingHours = Partial<Record<DayKey, WorkingDay | null>>;

export interface Practice {
  id: UUID;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  default_buffer_minutes: number;
  owner_id: UUID;
  created_at: TimestampString;
}

export interface Staff {
  id: UUID;
  practice_id: UUID;
  user_id: UUID;
  first_name: string;
  last_name: string;
  role: StaffRole;
  buffer_override_minutes: number | null;
  working_hours: WorkingHours;
  active: boolean;
  created_at: TimestampString;
}

export interface Service {
  id: UUID;
  practice_id: UUID;
  name: string;
  duration_minutes: number;
  base_price: number;
  price_min: number | null;
  price_max: number | null;
  payment_timing: PaymentTiming;
  active: boolean;
}

export interface StaffService {
  staff_id: UUID;
  service_id: UUID;
  price_override: number | null;
}

export interface Client {
  id: UUID;
  practice_id: UUID;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  preferred_channel: PreferredChannel;
  preferred_staff_id: UUID | null;
  notes: string;
  last_visit_date: DateString | null;
  no_show_count: number;
  imported_from: ImportSource;
  created_at: TimestampString;
}

export interface Booking {
  id: UUID;
  practice_id: UUID;
  staff_id: UUID;
  service_id: UUID;
  client_id: UUID;
  start_time: TimestampString;
  end_time: TimestampString;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_timing: PaymentTiming;
  stripe_payment_id: string | null;
  amount: number;
  notes: string;
  created_by: UUID;
  created_at: TimestampString;
}

export interface RecurringBooking {
  id: UUID;
  client_id: UUID;
  staff_id: UUID;
  service_id: UUID;
  frequency: RecurringFrequency;
  preferred_day: string;
  preferred_time: TimeString;
  start_date: DateString;
  end_date: DateString | null;
  status: RecurringStatus;
  conflict_rule: ConflictRule;
}

export interface SmartReminder {
  id: UUID;
  practice_id: UUID;
  service_id: UUID | null;
  trigger_after_days: number;
  message_template: string;
  channel: ReminderChannel;
  active: boolean;
}

export interface GiftVoucher {
  id: UUID;
  practice_id: UUID;
  code: string;
  amount: number;
  original_amount: number;
  issued_to_email: string;
  issued_at: TimestampString;
  expires_at: TimestampString;
  used_at: TimestampString | null;
  stripe_payment_id: string | null;
}

export interface LoyaltyStamp {
  id: UUID;
  client_id: UUID;
  practice_id: UUID;
  booking_id: UUID;
  awarded_at: TimestampString;
  redeemed_at: TimestampString | null;
}

export type DemoAvailabilityStatus = 'disponible' | 'réservé';

export interface DemoAvailabilitySlot {
  practice_id: UUID;
  staff_id: UUID;
  service_id: UUID;
  start_time: TimestampString;
  end_time: TimestampString;
  status: DemoAvailabilityStatus;
  booking_id: UUID | null;
}

export interface DemoData {
  practices: Practice[];
  staff: Staff[];
  services: Service[];
  staff_services: StaffService[];
  clients: Client[];
  bookings: Booking[];
  recurring_bookings: RecurringBooking[];
  smart_reminders: SmartReminder[];
  gift_vouchers: GiftVoucher[];
  loyalty_stamps: LoyaltyStamp[];
  availability_slots: DemoAvailabilitySlot[];
}

export const demoWeek = {
  start_date: '2026-06-22',
  end_date: '2026-06-28',
  timezone: 'Europe/Zurich',
} as const;

export const practices: Practice[] = [
  {
    id: '00000000-0000-4000-8000-000000000101',
    name: 'Cabinet Santé Carouge',
    address: 'Rue Saint-Joseph 12',
    city: 'Carouge, Genève',
    phone: '+41 22 342 18 44',
    email: 'bonjour@cabinet-sante-carouge.ch',
    default_buffer_minutes: 15,
    owner_id: '10000000-0000-4000-8000-000000000101',
    created_at: '2026-01-08T09:00:00+01:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000201',
    name: 'Barbier du Rhône',
    address: 'Rue du Rhône 42',
    city: 'Genève',
    phone: '+41 22 312 40 18',
    email: 'bonjour@barbier-du-rhone.ch',
    default_buffer_minutes: 15,
    owner_id: '10000000-0000-4000-8000-000000000201',
    created_at: '2026-02-03T10:30:00+01:00',
  },
];

export const staff: Staff[] = [
  {
    id: '00000000-0000-4000-8000-000000000111',
    practice_id: '00000000-0000-4000-8000-000000000101',
    user_id: '10000000-0000-4000-8000-000000000111',
    first_name: 'Claire',
    last_name: 'Meylan',
    role: 'practitioner',
    buffer_override_minutes: null,
    working_hours: {
      mon: { start: '08:00', end: '17:30', break: { start: '12:00', end: '13:30' } },
      tue: { start: '08:00', end: '18:00', break: { start: '12:30', end: '14:00' } },
      wed: { start: '08:00', end: '16:30', break: { start: '12:00', end: '13:00' } },
      thu: { start: '09:00', end: '18:30', break: { start: '13:00', end: '14:00' } },
      fri: { start: '08:00', end: '15:30', break: { start: '12:00', end: '12:45' } },
      sat: null,
      sun: null,
    },
    active: true,
    created_at: '2026-01-08T09:15:00+01:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000112',
    practice_id: '00000000-0000-4000-8000-000000000101',
    user_id: '10000000-0000-4000-8000-000000000112',
    first_name: 'Marc',
    last_name: 'Delorme',
    role: 'practitioner',
    buffer_override_minutes: null,
    working_hours: {
      mon: { start: '07:30', end: '16:30', break: { start: '12:00', end: '13:00' } },
      tue: { start: '07:30', end: '17:00', break: { start: '12:00', end: '13:00' } },
      wed: { start: '07:30', end: '17:00', break: { start: '12:00', end: '13:00' } },
      thu: { start: '08:30', end: '18:00', break: { start: '12:30', end: '13:30' } },
      fri: { start: '07:30', end: '14:30', break: { start: '11:45', end: '12:30' } },
      sat: null,
      sun: null,
    },
    active: true,
    created_at: '2026-01-08T09:20:00+01:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000113',
    practice_id: '00000000-0000-4000-8000-000000000101',
    user_id: '10000000-0000-4000-8000-000000000113',
    first_name: 'Sophie',
    last_name: 'Rochat',
    role: 'practitioner',
    buffer_override_minutes: null,
    working_hours: {
      mon: { start: '09:00', end: '17:00', break: { start: '12:30', end: '13:30' } },
      tue: { start: '09:00', end: '18:00', break: { start: '12:30', end: '13:30' } },
      wed: { start: '09:00', end: '17:00', break: { start: '12:30', end: '13:30' } },
      thu: { start: '10:00', end: '19:00', break: { start: '13:30', end: '14:30' } },
      fri: { start: '09:00', end: '16:00', break: { start: '12:30', end: '13:15' } },
      sat: null,
      sun: null,
    },
    active: true,
    created_at: '2026-01-08T09:25:00+01:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000211',
    practice_id: '00000000-0000-4000-8000-000000000201',
    user_id: '10000000-0000-4000-8000-000000000211',
    first_name: 'Boris',
    last_name: 'Maret',
    role: 'practitioner',
    buffer_override_minutes: null,
    working_hours: {
      mon: null,
      tue: { start: '09:00', end: '19:00', break: { start: '13:00', end: '14:00' } },
      wed: { start: '09:00', end: '19:00', break: { start: '13:00', end: '14:00' } },
      thu: { start: '09:00', end: '20:00', break: { start: '13:30', end: '14:30' } },
      fri: { start: '09:00', end: '19:00', break: { start: '13:00', end: '14:00' } },
      sat: { start: '09:00', end: '17:00', break: { start: '12:30', end: '13:00' } },
      sun: null,
    },
    active: true,
    created_at: '2026-02-03T10:45:00+01:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000212',
    practice_id: '00000000-0000-4000-8000-000000000201',
    user_id: '10000000-0000-4000-8000-000000000212',
    first_name: 'Yanis',
    last_name: 'Favre',
    role: 'practitioner',
    buffer_override_minutes: null,
    working_hours: {
      mon: null,
      tue: { start: '10:00', end: '19:00', break: { start: '14:00', end: '15:00' } },
      wed: { start: '10:00', end: '19:00', break: { start: '14:00', end: '15:00' } },
      thu: { start: '10:00', end: '20:00', break: { start: '14:00', end: '15:00' } },
      fri: { start: '10:00', end: '19:00', break: { start: '14:00', end: '15:00' } },
      sat: { start: '09:00', end: '17:00', break: { start: '12:30', end: '13:00' } },
      sun: null,
    },
    active: true,
    created_at: '2026-02-03T10:50:00+01:00',
  },
];

export const services: Service[] = [
  {
    id: '00000000-0000-4000-8000-000000000121',
    practice_id: '00000000-0000-4000-8000-000000000101',
    name: 'Ostéopathie - première consultation',
    duration_minutes: 60,
    base_price: 120,
    price_min: 110,
    price_max: 130,
    payment_timing: 'post_session',
    active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000122',
    practice_id: '00000000-0000-4000-8000-000000000101',
    name: 'Ostéopathie - consultation de suivi',
    duration_minutes: 45,
    base_price: 95,
    price_min: 90,
    price_max: 110,
    payment_timing: 'post_session',
    active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000123',
    practice_id: '00000000-0000-4000-8000-000000000101',
    name: 'Physiothérapie',
    duration_minutes: 45,
    base_price: 90,
    price_min: 85,
    price_max: 100,
    payment_timing: 'post_session',
    active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000124',
    practice_id: '00000000-0000-4000-8000-000000000101',
    name: 'Rééducation sportive',
    duration_minutes: 60,
    base_price: 110,
    price_min: 100,
    price_max: 125,
    payment_timing: 'post_session',
    active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000125',
    practice_id: '00000000-0000-4000-8000-000000000101',
    name: 'Nutrition - bilan initial',
    duration_minutes: 60,
    base_price: 110,
    price_min: 100,
    price_max: 130,
    payment_timing: 'post_session',
    active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000126',
    practice_id: '00000000-0000-4000-8000-000000000101',
    name: 'Nutrition - suivi',
    duration_minutes: 45,
    base_price: 85,
    price_min: 80,
    price_max: 95,
    payment_timing: 'post_session',
    active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000221',
    practice_id: '00000000-0000-4000-8000-000000000201',
    name: 'Coupe homme',
    duration_minutes: 30,
    base_price: 45,
    price_min: 45,
    price_max: 55,
    payment_timing: 'upfront',
    active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000222',
    practice_id: '00000000-0000-4000-8000-000000000201',
    name: 'Rasage traditionnel',
    duration_minutes: 20,
    base_price: 35,
    price_min: 35,
    price_max: 45,
    payment_timing: 'upfront',
    active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000223',
    practice_id: '00000000-0000-4000-8000-000000000201',
    name: 'Taille de barbe',
    duration_minutes: 15,
    base_price: 25,
    price_min: 25,
    price_max: 35,
    payment_timing: 'upfront',
    active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000224',
    practice_id: '00000000-0000-4000-8000-000000000201',
    name: 'Soin capillaire',
    duration_minutes: 45,
    base_price: 65,
    price_min: 60,
    price_max: 75,
    payment_timing: 'upfront',
    active: true,
  },
];

export const staff_services: StaffService[] = [
  { staff_id: '00000000-0000-4000-8000-000000000111', service_id: '00000000-0000-4000-8000-000000000121', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000111', service_id: '00000000-0000-4000-8000-000000000122', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000112', service_id: '00000000-0000-4000-8000-000000000123', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000112', service_id: '00000000-0000-4000-8000-000000000124', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000113', service_id: '00000000-0000-4000-8000-000000000125', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000113', service_id: '00000000-0000-4000-8000-000000000126', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000211', service_id: '00000000-0000-4000-8000-000000000221', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000211', service_id: '00000000-0000-4000-8000-000000000222', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000211', service_id: '00000000-0000-4000-8000-000000000223', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000211', service_id: '00000000-0000-4000-8000-000000000224', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000212', service_id: '00000000-0000-4000-8000-000000000221', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000212', service_id: '00000000-0000-4000-8000-000000000222', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000212', service_id: '00000000-0000-4000-8000-000000000223', price_override: null },
  { staff_id: '00000000-0000-4000-8000-000000000212', service_id: '00000000-0000-4000-8000-000000000224', price_override: 60 },
];

export const clients: Client[] = [
  {
    id: '00000000-0000-4000-8000-000000000131',
    practice_id: '00000000-0000-4000-8000-000000000101',
    first_name: 'Marie',
    last_name: 'Dubois',
    phone: '+41 79 321 45 67',
    email: 'marie.dubois@example.ch',
    preferred_channel: 'sms',
    preferred_staff_id: '00000000-0000-4000-8000-000000000111',
    notes: 'Douleurs cervicales récurrentes, préfère les rendez-vous le matin.',
    last_visit_date: '2026-05-18',
    no_show_count: 0,
    imported_from: 'csv',
    created_at: '2026-01-12T11:20:00+01:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000132',
    practice_id: '00000000-0000-4000-8000-000000000101',
    first_name: 'Julien',
    last_name: 'Morel',
    phone: '+41 78 654 20 11',
    email: 'julien.morel@example.ch',
    preferred_channel: 'email',
    preferred_staff_id: '00000000-0000-4000-8000-000000000112',
    notes: 'Préparation course de montagne, suivi du genou gauche.',
    last_visit_date: '2026-06-10',
    no_show_count: 0,
    imported_from: 'booking',
    created_at: '2026-03-02T08:45:00+01:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000133',
    practice_id: '00000000-0000-4000-8000-000000000101',
    first_name: 'Camille',
    last_name: 'Berset',
    phone: '+41 76 210 98 54',
    email: 'camille.berset@example.ch',
    preferred_channel: 'sms',
    preferred_staff_id: '00000000-0000-4000-8000-000000000113',
    notes: 'Objectif: stabiliser les repas de midi pendant les semaines de travail.',
    last_visit_date: '2026-05-26',
    no_show_count: 1,
    imported_from: 'manual',
    created_at: '2026-02-14T15:10:00+01:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000134',
    practice_id: '00000000-0000-4000-8000-000000000101',
    first_name: 'Antoine',
    last_name: 'Favre',
    phone: '+41 79 884 12 30',
    email: 'antoine.favre@example.ch',
    preferred_channel: 'sms',
    preferred_staff_id: '00000000-0000-4000-8000-000000000111',
    notes: 'Travail assis prolongé, tension lombaire après les déplacements.',
    last_visit_date: '2026-04-30',
    no_show_count: 0,
    imported_from: 'csv',
    created_at: '2026-01-20T13:30:00+01:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000135',
    practice_id: '00000000-0000-4000-8000-000000000101',
    first_name: 'Nadia',
    last_name: 'Keller',
    phone: '+41 77 451 76 88',
    email: 'nadia.keller@example.ch',
    preferred_channel: 'email',
    preferred_staff_id: '00000000-0000-4000-8000-000000000112',
    notes: 'Rééducation après entorse, éviter les exercices avec saut.',
    last_visit_date: '2026-06-17',
    no_show_count: 0,
    imported_from: 'booking',
    created_at: '2026-04-01T10:00:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000136',
    practice_id: '00000000-0000-4000-8000-000000000101',
    first_name: 'Luc',
    last_name: 'Perrin',
    phone: '+41 78 100 44 90',
    email: 'luc.perrin@example.ch',
    preferred_channel: 'sms',
    preferred_staff_id: '00000000-0000-4000-8000-000000000113',
    notes: 'Souhaite un plan simple pour repas de bureau.',
    last_visit_date: null,
    no_show_count: 0,
    imported_from: 'booking',
    created_at: '2026-06-19T16:15:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000231',
    practice_id: '00000000-0000-4000-8000-000000000201',
    first_name: 'Thomas',
    last_name: 'Monnier',
    phone: '+41 79 555 18 21',
    email: 'thomas.monnier@example.ch',
    preferred_channel: 'sms',
    preferred_staff_id: '00000000-0000-4000-8000-000000000211',
    notes: 'Coupe courte, dégradé bas, vient souvent le vendredi.',
    last_visit_date: '2026-05-29',
    no_show_count: 0,
    imported_from: 'csv',
    created_at: '2026-02-06T12:05:00+01:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000232',
    practice_id: '00000000-0000-4000-8000-000000000201',
    first_name: 'Romain',
    last_name: 'Girard',
    phone: '+41 78 640 22 10',
    email: 'romain.girard@example.ch',
    preferred_channel: 'sms',
    preferred_staff_id: '00000000-0000-4000-8000-000000000212',
    notes: 'Barbe précise, préfère un rasage à la serviette chaude.',
    last_visit_date: '2026-06-06',
    no_show_count: 0,
    imported_from: 'booking',
    created_at: '2026-03-11T18:40:00+01:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000233',
    practice_id: '00000000-0000-4000-8000-000000000201',
    first_name: 'Sébastien',
    last_name: 'Aubert',
    phone: '+41 76 335 90 12',
    email: 'sebastien.aubert@example.ch',
    preferred_channel: 'email',
    preferred_staff_id: '00000000-0000-4000-8000-000000000211',
    notes: 'Coupe classique avant rendez-vous client.',
    last_visit_date: '2026-05-21',
    no_show_count: 1,
    imported_from: 'manual',
    created_at: '2026-02-18T09:30:00+01:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000234',
    practice_id: '00000000-0000-4000-8000-000000000201',
    first_name: 'Mehdi',
    last_name: 'Roux',
    phone: '+41 77 202 14 70',
    email: 'mehdi.roux@example.ch',
    preferred_channel: 'sms',
    preferred_staff_id: '00000000-0000-4000-8000-000000000212',
    notes: 'Soin capillaire toutes les six semaines.',
    last_visit_date: '2026-05-12',
    no_show_count: 0,
    imported_from: 'booking',
    created_at: '2026-04-05T14:20:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000235',
    practice_id: '00000000-0000-4000-8000-000000000201',
    first_name: 'Adrien',
    last_name: 'Lombard',
    phone: '+41 79 718 36 45',
    email: 'adrien.lombard@example.ch',
    preferred_channel: 'sms',
    preferred_staff_id: '00000000-0000-4000-8000-000000000211',
    notes: 'Coupe et barbe avant le week-end.',
    last_visit_date: null,
    no_show_count: 0,
    imported_from: 'booking',
    created_at: '2026-06-20T11:45:00+02:00',
  },
];

export const bookings: Booking[] = [
  {
    id: '00000000-0000-4000-8000-000000000141',
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000111',
    service_id: '00000000-0000-4000-8000-000000000121',
    client_id: '00000000-0000-4000-8000-000000000131',
    start_time: '2026-06-22T08:15:00+02:00',
    end_time: '2026-06-22T09:15:00+02:00',
    status: 'completed',
    payment_status: 'paid',
    payment_timing: 'post_session',
    stripe_payment_id: null,
    amount: 120,
    notes: 'Séance terminée, facture réglée à la réception.',
    created_by: '10000000-0000-4000-8000-000000000111',
    created_at: '2026-06-12T10:05:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000142',
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000111',
    service_id: '00000000-0000-4000-8000-000000000122',
    client_id: '00000000-0000-4000-8000-000000000134',
    start_time: '2026-06-22T10:00:00+02:00',
    end_time: '2026-06-22T10:45:00+02:00',
    status: 'confirmed',
    payment_status: 'unpaid',
    payment_timing: 'post_session',
    stripe_payment_id: null,
    amount: 95,
    notes: 'Suivi lombaire, prévoir exercices à domicile.',
    created_by: '10000000-0000-4000-8000-000000000111',
    created_at: '2026-06-18T09:10:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000143',
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000111',
    service_id: '00000000-0000-4000-8000-000000000121',
    client_id: '00000000-0000-4000-8000-000000000131',
    start_time: '2026-06-24T14:00:00+02:00',
    end_time: '2026-06-24T15:00:00+02:00',
    status: 'confirmed',
    payment_status: 'unpaid',
    payment_timing: 'post_session',
    stripe_payment_id: null,
    amount: 120,
    notes: 'Contrôle après déplacement professionnel.',
    created_by: '10000000-0000-4000-8000-000000000111',
    created_at: '2026-06-19T11:00:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000144',
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000112',
    service_id: '00000000-0000-4000-8000-000000000123',
    client_id: '00000000-0000-4000-8000-000000000132',
    start_time: '2026-06-22T07:45:00+02:00',
    end_time: '2026-06-22T08:30:00+02:00',
    status: 'completed',
    payment_status: 'paid',
    payment_timing: 'post_session',
    stripe_payment_id: null,
    amount: 90,
    notes: 'Mobilité améliorée, continuer le renforcement léger.',
    created_by: '10000000-0000-4000-8000-000000000112',
    created_at: '2026-06-16T13:25:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000145',
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000112',
    service_id: '00000000-0000-4000-8000-000000000124',
    client_id: '00000000-0000-4000-8000-000000000135',
    start_time: '2026-06-23T15:30:00+02:00',
    end_time: '2026-06-23T16:30:00+02:00',
    status: 'confirmed',
    payment_status: 'unpaid',
    payment_timing: 'post_session',
    stripe_payment_id: null,
    amount: 110,
    notes: 'Rééducation cheville, séance longue demandée.',
    created_by: '10000000-0000-4000-8000-000000000112',
    created_at: '2026-06-18T17:00:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000146',
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000112',
    service_id: '00000000-0000-4000-8000-000000000123',
    client_id: '00000000-0000-4000-8000-000000000132',
    start_time: '2026-06-25T09:30:00+02:00',
    end_time: '2026-06-25T10:15:00+02:00',
    status: 'confirmed',
    payment_status: 'unpaid',
    payment_timing: 'post_session',
    stripe_payment_id: null,
    amount: 90,
    notes: 'Contrôle avant sortie longue du week-end.',
    created_by: '10000000-0000-4000-8000-000000000112',
    created_at: '2026-06-20T08:35:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000147',
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000113',
    service_id: '00000000-0000-4000-8000-000000000125',
    client_id: '00000000-0000-4000-8000-000000000136',
    start_time: '2026-06-23T09:00:00+02:00',
    end_time: '2026-06-23T10:00:00+02:00',
    status: 'confirmed',
    payment_status: 'unpaid',
    payment_timing: 'post_session',
    stripe_payment_id: null,
    amount: 110,
    notes: 'Premier bilan nutritionnel.',
    created_by: '10000000-0000-4000-8000-000000000113',
    created_at: '2026-06-19T16:20:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000148',
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000113',
    service_id: '00000000-0000-4000-8000-000000000126',
    client_id: '00000000-0000-4000-8000-000000000133',
    start_time: '2026-06-26T11:00:00+02:00',
    end_time: '2026-06-26T11:45:00+02:00',
    status: 'confirmed',
    payment_status: 'unpaid',
    payment_timing: 'post_session',
    stripe_payment_id: null,
    amount: 85,
    notes: 'Suivi des repas de midi et hydratation.',
    created_by: '10000000-0000-4000-8000-000000000113',
    created_at: '2026-06-20T09:10:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000241',
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000211',
    service_id: '00000000-0000-4000-8000-000000000221',
    client_id: '00000000-0000-4000-8000-000000000231',
    start_time: '2026-06-23T09:15:00+02:00',
    end_time: '2026-06-23T09:45:00+02:00',
    status: 'confirmed',
    payment_status: 'paid',
    payment_timing: 'upfront',
    stripe_payment_id: 'pi_demo_barbier_001',
    amount: 45,
    notes: 'Dégradé bas, finition naturelle.',
    created_by: '10000000-0000-4000-8000-000000000211',
    created_at: '2026-06-18T12:30:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000242',
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000212',
    service_id: '00000000-0000-4000-8000-000000000222',
    client_id: '00000000-0000-4000-8000-000000000232',
    start_time: '2026-06-24T11:00:00+02:00',
    end_time: '2026-06-24T11:20:00+02:00',
    status: 'confirmed',
    payment_status: 'paid',
    payment_timing: 'upfront',
    stripe_payment_id: 'pi_demo_barbier_002',
    amount: 35,
    notes: 'Rasage traditionnel avec serviette chaude.',
    created_by: '10000000-0000-4000-8000-000000000212',
    created_at: '2026-06-19T18:05:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000243',
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000211',
    service_id: '00000000-0000-4000-8000-000000000223',
    client_id: '00000000-0000-4000-8000-000000000235',
    start_time: '2026-06-25T17:30:00+02:00',
    end_time: '2026-06-25T17:45:00+02:00',
    status: 'confirmed',
    payment_status: 'paid',
    payment_timing: 'upfront',
    stripe_payment_id: 'pi_demo_barbier_003',
    amount: 25,
    notes: 'Taille de barbe avant déplacement.',
    created_by: '10000000-0000-4000-8000-000000000211',
    created_at: '2026-06-20T11:50:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000244',
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000212',
    service_id: '00000000-0000-4000-8000-000000000224',
    client_id: '00000000-0000-4000-8000-000000000234',
    start_time: '2026-06-26T14:30:00+02:00',
    end_time: '2026-06-26T15:15:00+02:00',
    status: 'confirmed',
    payment_status: 'paid',
    payment_timing: 'upfront',
    stripe_payment_id: 'pi_demo_barbier_004',
    amount: 60,
    notes: 'Soin capillaire, cuir chevelu sensible.',
    created_by: '10000000-0000-4000-8000-000000000212',
    created_at: '2026-06-20T10:15:00+02:00',
  },
  {
    id: '00000000-0000-4000-8000-000000000245',
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000211',
    service_id: '00000000-0000-4000-8000-000000000221',
    client_id: '00000000-0000-4000-8000-000000000233',
    start_time: '2026-06-27T10:30:00+02:00',
    end_time: '2026-06-27T11:00:00+02:00',
    status: 'confirmed',
    payment_status: 'paid',
    payment_timing: 'upfront',
    stripe_payment_id: 'pi_demo_barbier_005',
    amount: 45,
    notes: 'Coupe classique, pas trop court sur les côtés.',
    created_by: '10000000-0000-4000-8000-000000000211',
    created_at: '2026-06-21T15:00:00+02:00',
  },
];

export const recurring_bookings: RecurringBooking[] = [
  {
    id: '00000000-0000-4000-8000-000000000151',
    client_id: '00000000-0000-4000-8000-000000000135',
    staff_id: '00000000-0000-4000-8000-000000000112',
    service_id: '00000000-0000-4000-8000-000000000123',
    frequency: 'weekly',
    preferred_day: 'mardi',
    preferred_time: '15:30',
    start_date: '2026-06-03',
    end_date: '2026-07-28',
    status: 'active',
    conflict_rule: 'offer_alternative',
  },
  {
    id: '00000000-0000-4000-8000-000000000251',
    client_id: '00000000-0000-4000-8000-000000000234',
    staff_id: '00000000-0000-4000-8000-000000000212',
    service_id: '00000000-0000-4000-8000-000000000224',
    frequency: 'monthly',
    preferred_day: 'vendredi',
    preferred_time: '14:30',
    start_date: '2026-05-15',
    end_date: null,
    status: 'active',
    conflict_rule: 'offer_alternative',
  },
];

export const smart_reminders: SmartReminder[] = [
  {
    id: '00000000-0000-4000-8000-000000000161',
    practice_id: '00000000-0000-4000-8000-000000000101',
    service_id: null,
    trigger_after_days: 30,
    message_template: 'Bonjour {prénom}, cela fait {days} jours depuis votre dernier rendez-vous. Souhaitez-vous réserver un créneau cette semaine ?',
    channel: 'sms',
    active: true,
  },
  {
    id: '00000000-0000-4000-8000-000000000261',
    practice_id: '00000000-0000-4000-8000-000000000201',
    service_id: null,
    trigger_after_days: 42,
    message_template: 'Bonjour {prénom}, votre coupe mérite sûrement un rafraîchissement. Réservez votre prochain passage au salon.',
    channel: 'sms',
    active: true,
  },
];

export const gift_vouchers: GiftVoucher[] = [
  {
    id: '00000000-0000-4000-8000-000000000271',
    practice_id: '00000000-0000-4000-8000-000000000201',
    code: 'BARBIER-GE-75',
    amount: 75,
    original_amount: 75,
    issued_to_email: 'cadeau@example.ch',
    issued_at: '2026-06-10T14:00:00+02:00',
    expires_at: '2027-06-10T23:59:59+02:00',
    used_at: null,
    stripe_payment_id: 'pi_demo_voucher_001',
  },
];

export const loyalty_stamps: LoyaltyStamp[] = [
  {
    id: '00000000-0000-4000-8000-000000000281',
    client_id: '00000000-0000-4000-8000-000000000231',
    practice_id: '00000000-0000-4000-8000-000000000201',
    booking_id: '00000000-0000-4000-8000-000000000241',
    awarded_at: '2026-06-23T09:45:00+02:00',
    redeemed_at: null,
  },
];

export const availability_slots: DemoAvailabilitySlot[] = [
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000111',
    service_id: '00000000-0000-4000-8000-000000000121',
    start_time: '2026-06-22T08:15:00+02:00',
    end_time: '2026-06-22T09:15:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000141',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000111',
    service_id: '00000000-0000-4000-8000-000000000122',
    start_time: '2026-06-22T10:00:00+02:00',
    end_time: '2026-06-22T10:45:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000142',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000111',
    service_id: '00000000-0000-4000-8000-000000000122',
    start_time: '2026-06-23T08:30:00+02:00',
    end_time: '2026-06-23T09:15:00+02:00',
    status: 'disponible',
    booking_id: null,
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000111',
    service_id: '00000000-0000-4000-8000-000000000121',
    start_time: '2026-06-23T14:15:00+02:00',
    end_time: '2026-06-23T15:15:00+02:00',
    status: 'disponible',
    booking_id: null,
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000111',
    service_id: '00000000-0000-4000-8000-000000000121',
    start_time: '2026-06-24T14:00:00+02:00',
    end_time: '2026-06-24T15:00:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000143',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000111',
    service_id: '00000000-0000-4000-8000-000000000122',
    start_time: '2026-06-25T16:00:00+02:00',
    end_time: '2026-06-25T16:45:00+02:00',
    status: 'disponible',
    booking_id: null,
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000112',
    service_id: '00000000-0000-4000-8000-000000000123',
    start_time: '2026-06-22T07:45:00+02:00',
    end_time: '2026-06-22T08:30:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000144',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000112',
    service_id: '00000000-0000-4000-8000-000000000123',
    start_time: '2026-06-23T09:00:00+02:00',
    end_time: '2026-06-23T09:45:00+02:00',
    status: 'disponible',
    booking_id: null,
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000112',
    service_id: '00000000-0000-4000-8000-000000000124',
    start_time: '2026-06-23T15:30:00+02:00',
    end_time: '2026-06-23T16:30:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000145',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000112',
    service_id: '00000000-0000-4000-8000-000000000123',
    start_time: '2026-06-24T13:15:00+02:00',
    end_time: '2026-06-24T14:00:00+02:00',
    status: 'disponible',
    booking_id: null,
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000112',
    service_id: '00000000-0000-4000-8000-000000000123',
    start_time: '2026-06-25T09:30:00+02:00',
    end_time: '2026-06-25T10:15:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000146',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000113',
    service_id: '00000000-0000-4000-8000-000000000125',
    start_time: '2026-06-23T09:00:00+02:00',
    end_time: '2026-06-23T10:00:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000147',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000113',
    service_id: '00000000-0000-4000-8000-000000000126',
    start_time: '2026-06-24T10:15:00+02:00',
    end_time: '2026-06-24T11:00:00+02:00',
    status: 'disponible',
    booking_id: null,
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000113',
    service_id: '00000000-0000-4000-8000-000000000125',
    start_time: '2026-06-25T15:00:00+02:00',
    end_time: '2026-06-25T16:00:00+02:00',
    status: 'disponible',
    booking_id: null,
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000101',
    staff_id: '00000000-0000-4000-8000-000000000113',
    service_id: '00000000-0000-4000-8000-000000000126',
    start_time: '2026-06-26T11:00:00+02:00',
    end_time: '2026-06-26T11:45:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000148',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000211',
    service_id: '00000000-0000-4000-8000-000000000221',
    start_time: '2026-06-23T09:15:00+02:00',
    end_time: '2026-06-23T09:45:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000241',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000211',
    service_id: '00000000-0000-4000-8000-000000000221',
    start_time: '2026-06-23T10:00:00+02:00',
    end_time: '2026-06-23T10:30:00+02:00',
    status: 'disponible',
    booking_id: null,
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000211',
    service_id: '00000000-0000-4000-8000-000000000222',
    start_time: '2026-06-24T15:15:00+02:00',
    end_time: '2026-06-24T15:35:00+02:00',
    status: 'disponible',
    booking_id: null,
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000211',
    service_id: '00000000-0000-4000-8000-000000000223',
    start_time: '2026-06-25T17:30:00+02:00',
    end_time: '2026-06-25T17:45:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000243',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000211',
    service_id: '00000000-0000-4000-8000-000000000221',
    start_time: '2026-06-27T10:30:00+02:00',
    end_time: '2026-06-27T11:00:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000245',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000212',
    service_id: '00000000-0000-4000-8000-000000000222',
    start_time: '2026-06-24T11:00:00+02:00',
    end_time: '2026-06-24T11:20:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000242',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000212',
    service_id: '00000000-0000-4000-8000-000000000221',
    start_time: '2026-06-25T10:30:00+02:00',
    end_time: '2026-06-25T11:00:00+02:00',
    status: 'disponible',
    booking_id: null,
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000212',
    service_id: '00000000-0000-4000-8000-000000000224',
    start_time: '2026-06-26T14:30:00+02:00',
    end_time: '2026-06-26T15:15:00+02:00',
    status: 'réservé',
    booking_id: '00000000-0000-4000-8000-000000000244',
  },
  {
    practice_id: '00000000-0000-4000-8000-000000000201',
    staff_id: '00000000-0000-4000-8000-000000000212',
    service_id: '00000000-0000-4000-8000-000000000223',
    start_time: '2026-06-27T13:30:00+02:00',
    end_time: '2026-06-27T13:45:00+02:00',
    status: 'disponible',
    booking_id: null,
  },
];

export const demoData: DemoData = {
  practices,
  staff,
  services,
  staff_services,
  clients,
  bookings,
  recurring_bookings,
  smart_reminders,
  gift_vouchers,
  loyalty_stamps,
  availability_slots,
};
