

# Shero – Smart Emergency SOS & Real-Time Safety System

## Overview
A premium personal safety web app where users can instantly send SOS alerts with live location, automatic timer alerts, and emergency contact notifications. Built with React + Lovable Cloud (Supabase) backend.

---

## Phase 1: Foundation & Visual Identity

### Stunning UI Shell
- Dark/light mode with glassmorphism design throughout
- Animated gradient background with subtle particle effects using Three.js (3D animated globe/particles)
- Smooth page transitions between all routes
- Floating emergency SOS button visible on every page
- Glass card components, glowing hover effects, micro-interactions

### Authentication
- Sign up / Login pages with beautiful animated backgrounds
- Email-based auth via Supabase
- Protected routes for dashboard and all features
- User profiles table in database

---

## Phase 2: Core Safety Features

### Dashboard
- Large central SOS button with red pulse/glow animation
- Quick-access cards: Safety Timer, Emergency Contacts, Location Preview, Recent Alerts
- Current location mini-map preview using Leaflet
- Animated stats/status indicators

### SOS Alert System (Main Feature)
- Big red SOS button with dramatic pulse animation
- On press: captures GPS location via Geolocation API
- Shows map preview with animated marker
- Saves alert to database (timestamp, coordinates, status)
- Generates Google Maps link for sharing
- Simulated notification to emergency contacts (stored in alert log)
- Emergency alarm sound effect + device vibration (mobile)
- PIN-protected cancel SOS (must enter PIN to cancel)
- Success/sent confirmation animation

### Emergency Contacts
- Add up to 5 contacts (name, phone, email)
- Edit and delete functionality
- Stored in Supabase database with user association
- Beautiful card-based UI

---

## Phase 3: Timer & Tracking

### Safety Timer
- User sets a countdown duration (e.g., 30 minutes)
- Animated circular countdown progress indicator
- Visual warning effects as timer nears expiry (color shift, pulse intensifies)
- "I'M SAFE" button to cancel
- If timer expires without "I'm Safe" → automatic SOS alert triggered
- Alert stored in database, contacts notified

### Live Map Tracking Page
- Full-page Leaflet map showing real-time user location
- Animated pulsing marker on current position
- Display last alert timestamp on map
- Travel mode: continuous location updates with path tracking

---

## Phase 4: History & Advanced Features

### Alert History
- List of all previous SOS alerts
- Shows: date, time, location link, status (sent/cancelled/auto-triggered)
- Filter and search capabilities
- Beautiful timeline-style UI

### Advanced Features
- 🔊 Emergency alarm sound on SOS activation
- 📳 Phone vibration on mobile devices
- 🌙 Night safety mode (auto dark theme after sunset)
- 🧑‍🤝‍🧑 Fake call simulation button (shows incoming call UI overlay)
- 📡 Offline mode (queue alerts locally, sync when back online)
- 🎤 Voice SOS trigger (say "HELP" to activate — using Web Speech API)

---

## Phase 5: Polish & Demo Data

### Demo Data
- Pre-loaded sample emergency contacts
- Example SOS alert history entries
- Default test GPS coordinates

### Final Polish
- Loading screen with Shero logo animation
- Smooth scroll transitions throughout
- Responsive design optimized for mobile, tablet, and desktop
- Well-commented, organized code structure

---

## Technical Approach
- **Frontend**: React + TypeScript + Tailwind CSS + Three.js (3D effects) + Leaflet (maps)
- **Backend**: Lovable Cloud (Supabase) — database, auth, edge functions
- **Database tables**: profiles, emergency_contacts, sos_alerts, timer_sessions

