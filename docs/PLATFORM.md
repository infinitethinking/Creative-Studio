# Infinite Thinking — Practice Booking Platform
## Product Specification for Cursor

---

## 1. Project Overview

A business-agnostic practice management and booking platform for Swiss small businesses that sell time — health practitioners, salons, coaches, and any multi-practitioner cabinet. Built in Astro with Supabase backend, deployable to GitHub Pages initially, then to a custom .ch domain via Infomaniak.

**Core philosophy:** The vertical (physio, salon, osteo) is just configuration. The platform is the same engine underneath.

**Three interfaces, one codebase:**
- Client — mobile phone (booking flow)
- Solo / Salon — tablet (day view, touch-optimised)
- Cabinet / Centre — desktop (week view, multi-practitioner)

---

## 2. Tech Stack

```
Frontend        Astro (existing repo)
Database        Supabase (PostgreSQL + RLS + Auth)
Auth            Supabase magic links (no passwords)
Payments        Stripe (upfront + post-session invoice)
Email           Infomaniak SMTP
SMS             Infomaniak SMS API (or Twilio fallback)
Calendar export .ics file generation (server-side, no library needed)
Hosting         GitHub Pages → Infomaniak / custom domain later
```

No n8n. No Make. No WhatsApp API. No complex orchestration.
Supabase edge functions handle all automation triggers.

---

## 3. User Roles & Permissions

```
OWNER
├── Full access to everything
├── Add / remove staff
├── Set / change pricing (with optional min/max guard rails)
├── Access revenue reports
├── Configure platform settings
└── Manage billing / subscription

PRACTITIONER
├── Own calendar only
├── Set own buffer time (overrides practice default)
├── Set own working hours and holidays
├── View own bookings and client notes
├── View own revenue only
└── Cannot: see colleagues' data, change others' settings

ASSISTANT / RECEPTIONIST
├── View all calendars
├── Book / move / cancel any appointment
├── Check clients in
├── Process payments
├── Redeem gift vouchers
├── Import client files
└── Cannot: change fees, access reports, manage staff

CLIENT
└── Book, pay, cancel, manage own appointments only
```

---

## 4. Supabase Schema

### practices
```sql
id              uuid primary key
name            text
address         text
city            text
phone           text
email           text
default_buffer_minutes  integer default 15
owner_id        uuid references auth.users
created_at      timestamptz default now()
```

### staff
```sql
id              uuid primary key
practice_id     uuid references practices
user_id         uuid references auth.users
first_name      text
last_name       text
role            text check (role in ('owner','practitioner','assistant'))
buffer_override_minutes  integer  -- null = use practice default
working_hours   jsonb   -- { mon: {start:'09:00', end:'18:00'}, ... }
active          boolean default true
created_at      timestamptz default now()
```

### services
```sql
id              uuid primary key
practice_id     uuid references practices
name            text
duration_minutes integer
base_price      numeric
price_min       numeric   -- optional guard rail
price_max       numeric   -- optional guard rail
payment_timing  text check (payment_timing in ('upfront','post_session'))
active          boolean default true
```

### staff_services
```sql
staff_id        uuid references staff
service_id      uuid references services
price_override  numeric   -- null = use base_price
primary key (staff_id, service_id)
```

### clients
```sql
id              uuid primary key
practice_id     uuid references practices
first_name      text
last_name       text
phone           text
email           text
preferred_channel  text check (preferred_channel in ('sms','email'))  default 'sms'
preferred_staff_id  uuid references staff
notes           text   -- practitioner-visible only
last_visit_date date   -- computed, updated on each booking
no_show_count   integer default 0
imported_from   text   -- 'csv' | 'manual' | 'booking'
created_at      timestamptz default now()
```

### bookings
```sql
id              uuid primary key
practice_id     uuid references practices
staff_id        uuid references staff
service_id      uuid references services
client_id       uuid references clients
start_time      timestamptz
end_time        timestamptz
status          text check (status in ('pending','confirmed','completed','cancelled','no_show'))
payment_status  text check (payment_status in ('unpaid','paid','refunded'))
payment_timing  text check (payment_timing in ('upfront','post_session'))
stripe_payment_id  text
amount          numeric
notes           text
created_by      uuid references auth.users   -- who booked it
created_at      timestamptz default now()
```

### recurring_bookings
```sql
id              uuid primary key
client_id       uuid references clients
staff_id        uuid references staff
service_id      uuid references services
frequency       text check (frequency in ('weekly','biweekly','monthly'))
preferred_day   text   -- 'monday'
preferred_time  time   -- '14:00'
start_date      date
end_date        date
status          text check (status in ('active','paused','cancelled'))
conflict_rule   text check (conflict_rule in ('skip','offer_alternative'))
```

### smart_reminders
```sql
id              uuid primary key
practice_id     uuid references practices
service_id      uuid references services   -- null = all services
trigger_after_days  integer   -- e.g. 42 for 6 weeks
message_template    text   -- "Bonjour {prénom}, ça fait {days} jours..."
channel         text check (channel in ('sms','email'))
active          boolean default true
```

### gift_vouchers
```sql
id              uuid primary key
practice_id     uuid references practices
code            text unique
amount          numeric
original_amount numeric
issued_to_email text
issued_at       timestamptz
expires_at      timestamptz
used_at         timestamptz
stripe_payment_id  text
```

### loyalty_stamps
```sql
id              uuid primary key
client_id       uuid references clients
practice_id     uuid references practices
booking_id      uuid references bookings
awarded_at      timestamptz
redeemed_at     timestamptz
```

---

## 5. Application Routes

```
PUBLIC (no auth)
/                           Landing page (agency site)
/demo                       Demo toggle: client / salon / cabinet view
/demo/[vertical]            Pre-configured vertical demo
/book/[practice_slug]       Client booking entry point
/book/[practice_slug]/[staff_slug]  Book specific practitioner
/confirm/[booking_id]       Booking confirmation page
/cancel/[booking_id]        Self-serve cancellation (via link in SMS/email)
/voucher/purchase           Gift voucher purchase page

CLIENT (magic link auth)
/my/bookings                Upcoming and past bookings
/my/profile                 Preferences, notification settings

PRACTITIONER / ASSISTANT (magic link auth)
/dashboard                  Today's view (tablet default)
/dashboard/week             Week view (desktop default)
/dashboard/clients          Client list, search, history
/dashboard/clients/[id]     Individual client record
/dashboard/bookings/new     Manual booking entry

OWNER (magic link auth)
/admin                      Overview, key metrics
/admin/staff                Manage practitioners and roles
/admin/services             Manage services, pricing, buffer times
/admin/reminders            Configure smart reminder rules
/admin/vouchers             Gift voucher management
/admin/loyalty              Loyalty programme config
/admin/import               Client file import (CSV / vCard)
/admin/reports              Revenue, bookings, no-show rate
```

---

## 6. Client Booking Flow (Mobile, 3 taps)

```
Step 1: Practice landing → /book/[slug]
  - Practice name, address, photo
  - List of services with duration and price
  - "Book" button per service

Step 2: Choose practitioner + time
  - If multiple staff: select practitioner (or "no preference")
  - Calendar: week view, available slots highlighted
  - Tap slot to select

Step 3: Confirm + pay
  - Summary: service / practitioner / time / price
  - Name + phone (email optional)
  - Preferred notification channel: SMS or email
  - Stripe payment (if upfront service)
  - "Confirm booking" button

Step 4: Confirmation screen
  - Booking reference
  - "Add to calendar" → downloads .ics file
  - "Cancel booking" link
  - SMS sent immediately
  - Email sent with .ics attachment
```

No account creation required. Magic link sent if client wants to manage bookings later.

---

## 7. .ics File Generation

Generate server-side on booking confirmation. Plain text, no external library.

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Infinite Thinking//Practice Booking//FR
BEGIN:VEVENT
UID:[booking_id]@infinitethinking.ch
DTSTART:[start_time in UTC, format: 20260623T140000Z]
DTEND:[end_time in UTC]
SUMMARY:[service_name] — [practitioner_first_name] [practitioner_last_name]
LOCATION:[practice_address], [practice_city]
DESCRIPTION:Confirmation #[booking_id]\nAnnuler: [cancel_url]
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Rappel: votre RDV demain à [time]
END:VALARM
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:Rappel: votre RDV dans 2 heures
END:VALARM
END:VEVENT
END:VCALENDAR
```

Attach to confirmation email as `rdv-[date].ics`.
Also expose as `/ics/[booking_id]` for direct download link in SMS.

---

## 8. Notification Logic

### On booking confirmed:
```
SMS  → "RDV confirmé: [service] le [date] à [time]
        [practitioner], [city]
        Annuler: [cancel_link]
        Calendrier: [ics_link]"

Email → Subject: "Confirmation RDV — [date]"
        Body: full details
        Attachment: .ics file
```

### 24hrs before:
```
SMS  → "Rappel: RDV demain [date] à [time]
        [practitioner], [address]
        Annuler: [cancel_link]"
```

### On cancellation (by client):
```
SMS  → "RDV annulé. Rebooker: [booking_url]"
Practitioner notified → SMS + dashboard alert
Slot reopens automatically
```

### On completion (post-session payment):
```
Email → Invoice / QR bill attached
SMS   → "Merci! Votre facture: [link]"
```

### Smart reminders (triggered by edge function):
```
Daily cron → check clients where:
  last_visit_date < now() - trigger_after_days
  AND no upcoming booking exists
  AND smart_reminder.active = true

Send SMS: "Bonjour {prénom}, {message_template}"
Log in smart_reminder_log to avoid duplicates
```

---

## 9. Practitioner Dashboard — Tablet (Day View)

```
Layout: two-column, touch-optimised

LEFT PANEL (60%)
  Date navigation: ← Today →
  Timeline: 08:00 → 19:00
  Booking blocks: color by status
    confirmed  → blue
    completed  → green
    cancelled  → grey
    no-show    → red
  Tap booking → expand detail (right panel)
  Drag booking → reschedule (confirmation required)
  Tap empty slot → new booking modal

RIGHT PANEL (40%)
  Selected booking detail:
    Client name, phone
    Service, duration, price
    Payment status
    Notes field (editable)
    Actions:
      [ Check in ]
      [ Complete + Pay ]
      [ No show ]
      [ Cancel ]
      [ Reschedule ]

BOTTOM BAR
  [ + Walk-in ]  [ Redeem voucher ]  [ End of day summary ]

If multiple practitioners (owner/assistant view):
  Horizontal scroll → one column per practitioner
  Same day view, all columns visible
```

---

## 10. Cabinet Dashboard — Desktop (Week View)

```
Layout: full-width grid

TOP BAR
  ← Week of [date] →   [ Today ]
  Filter: [ All ] [ Practitioner 1 ] [ Practitioner 2 ] ...
  [ + New booking ]

MAIN GRID
  Rows: time slots (30min increments)
  Columns: one per practitioner
  Cells: booking blocks, color by status
  Click cell → booking detail side panel
  Drag across columns → reassign practitioner

SIDE PANEL (on booking click)
  Same detail view as tablet
  All actions available

LEFT SIDEBAR (optional, collapsible)
  Mini calendar for date navigation
  Staff list with toggle visibility
  Quick stats: today's bookings / revenue
```

---

## 11. Client Record

```
/dashboard/clients/[id]

HEADER
  Name, phone, email
  Preferred channel, preferred practitioner
  Last visit: [date]   Total visits: [n]   No-shows: [n]
  [ Send reminder ]  [ New booking ]

TABS

  History
    List of all past bookings
    Date / service / practitioner / amount / status
    Click → booking detail

  Upcoming
    Next confirmed bookings
    Cancel / reschedule actions

  Notes
    Free text, practitioner-visible only
    Timestamped entries

  Loyalty
    Stamp count, redemption history

  Reminders sent
    Log of all SMS / email sent
```

---

## 12. Client File Import

```
/admin/import

Step 1: Upload CSV or vCard
Step 2: Column mapper
  "Match your column to our field"
  Your column: [Prénom] → Our field: [first_name]
  Your column: [Mobile] → Our field: [phone]
  etc.
Step 3: Preview (first 5 rows)
Step 4: Confirm import
Step 5: Results: X imported / Y skipped (duplicates by phone)

Duplicate detection: match on phone number
```

---

## 13. Gift Vouchers

```
PURCHASE FLOW (/voucher/purchase)
  Select amount (fixed options or custom)
  Recipient name + email
  Personal message (optional)
  Stripe payment
  → Email sent to recipient with unique code
  → PDF voucher attached (simple, branded)

REDEMPTION (at booking, step 3)
  "I have a voucher code" → enter code
  Validates: active, not expired, sufficient balance
  Deducts from voucher balance
  Partial use allowed (remainder stays on voucher)
```

---

## 14. Pricing Configuration (Admin)

```
/admin/services

Per service:
  Name, duration, payment timing (upfront / post-session)
  Base price
  Min price / Max price (optional guard rails)
  Active toggle

Per practitioner override (in staff profile):
  Price override per service
  Buffer time override
  Working hours + holidays
```

---

## 15. Demo Page

```
/demo

Toggle bar:
  [ 📱 Client — mobile ]
  [ 🖥️ Salon — tablet ]  
  [ 🏥 Cabinet — desktop ]

Each view renders in a device frame
Pre-loaded with realistic Geneva fake data:
  Practice: "Cabinet Champel" or "Salon Place du Cirque"
  Practitioners: French-Swiss names
  Services: realistic for the vertical
  Bookings: realistic week of activity

Purpose: show prospects their world, already working
No auth required, full interactive flow
```

---

## 16. Vertical Configuration Examples

Stored as config / seed data. Same schema, different values.

### Salon config
```
services:
  - Coupe de cheveux, 30min, CHF 45, upfront
  - Rasage, 20min, CHF 35, upfront
  - Taille de barbe, 15min, CHF 25, upfront
  - Soins capilaires, 45min, CHF 65, upfront
payment_timing: upfront (mandatory)
smart_reminder: after 42 days (6 weeks)
loyalty: stamp card (every 10 visits = 1 free cut)
```

### Health cabinet config
```
services:
  - Ostéopathie 60min, CHF 120, post_session
  - Consultation de suivi 45min, CHF 95, post_session
  - Physiothérapie 45min, CHF 90, post_session
  - Nutrition 60min, CHF 110, post_session
payment_timing: post_session
smart_reminder: after 30 days (monthly practitioners)
loyalty: off
```

---

## 17. Build Order (V1 → V1.3)

### V1 — Core (build first)
```
[ ] Supabase schema (all tables above)
[ ] Magic link auth
[ ] Client booking flow (mobile, 3 taps)
[ ] .ics file generation
[ ] SMS + email confirmations
[ ] Practitioner dashboard — tablet day view
[ ] Owner admin — services + staff management
[ ] Stripe upfront payment
[ ] Demo page with toggle
```

### V1.1
```
[ ] Desktop week view (multi-practitioner)
[ ] Client record + history
[ ] CSV import
[ ] Smart reminders (edge function cron)
[ ] Recurring bookings
```

### V1.2
```
[ ] Gift vouchers
[ ] Loyalty stamps
[ ] Post-session invoice + QR bill
[ ] Revenue reports
```

### V1.3
```
[ ] Referral system
[ ] Google Calendar sync (iCal feed)
[ ] Multi-language (FR + DE)
```

---

## 18. Pricing Model (Your Business)

```
SETUP (one-off)
Solo (1 practitioner)         CHF 2'900
Cabinet (2–5 practitioners)   CHF 4'900
Centre (6+ practitioners)     CHF 7'500

Includes:
  Domain + Infomaniak hosting setup
  Full platform configuration
  Client file import
  WhatsApp / SMS templates configured
  SEO foundations + Google Business setup
  1hr training session
  2 years maintenance

ADD-ONS (one-off)
Additional practitioner       CHF 300/person
Gift vouchers module          CHF 300
Loyalty + referral            CHF 400
Google Ads setup              CHF 400

ANNUAL RENEWAL (year 3+)
Platform + hosting            CHF 900–1'500/yr
SMS credits                   Usage-based passthrough

OPTIONAL MONTHLY
SEO reporting                 CHF 150/month
Google Ads management         CHF 200/month + % spend
```

---

## 19. Positioning

**Against OneDoc / Doctolib:**
```
OneDoc: CHF 150/month/practitioner = CHF 1'800/year/person
Your platform: CHF 4'900 once = paid back in under 3 years
              then CHF 900/yr renewal = fraction of the cost
```

**Tagline:** "Votre cabinet, en pilote automatique."

**Target:** Swiss health and wellness practitioners (osteo, physio,
nutrition, massage, yoga, coaching) and service SMEs (salons, coaches)
who run on phone bookings, paper diaries, and manual admin.

**Geography:** Geneva / Lausanne first (FR), Zürich second (DE).

---

*Spec version 1.0 — Infinite Thinking Studio, Geneva*
*Built with Astro + Supabase + Stripe + Infomaniak*
