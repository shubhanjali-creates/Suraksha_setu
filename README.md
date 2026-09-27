# Suraksha Setu — India Disaster Response Platform

A full-stack React + Express + MongoDB disaster-response prototype localized for Indian communities.

## Core workflows
- Incident reporting → verification → response → resolution
- India-focused map for incidents, hospitals and shelters
- Volunteer task assignment and completion
- Resource inventory and incident allocation
- Community membership, announcements and database-backed chat polling
- SOS incident creation using browser geolocation
- Emergency contacts and help centres
- Donations recorded in INR
- Role-aware admin/responder/volunteer APIs
- Notifications and dashboard analytics

## Run locally
### Backend
```bash
cd server
npm install
copy .env.example .env
# edit .env and set MONGO_URI + JWT_SECRET
npm run seed:india
npm start
```

### Frontend
```bash
cd client
npm install
npm start
```

Demo password for seeded accounts: `Demo@12345`

The seeded accounts are fictional demo identities. Emergency phone numbers shown in the demo should be treated as sample data; verify official numbers before real-world use.
