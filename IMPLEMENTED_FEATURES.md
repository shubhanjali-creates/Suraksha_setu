# Suraksha Setu – implemented improvements

- India-focused live map data from MongoDB; removed hardcoded map markers from the main map.
- India map bounds and marker filters for incidents, hospitals, shelters and relief centres.
- Fixed CommunityChat React effect cleanup and replaced polling with Socket.IO real-time messaging.
- Global and community announcements with title, priority, optional expiry, notifications and Socket.IO events.
- Admin dashboard with overview statistics, incident workflow, announcements, volunteer tasks, resources, user controls, communities and audit log.
- Resource allocation history and audit logging.
- Admin user role/active controls with backend authorization.
- Disabled accounts are rejected by authentication middleware.
- Registration no longer allows users to self-register as admin/responder; new registrations are affected users.
- Dashboard/resources/admin APIs are authenticated and admin APIs are role protected.
- Incident location creation remains authenticated so normal users can report incidents.
- SOS workflow uses the richer incident SOS endpoint and returns nearest help-centre information.
- Resource allocation and volunteer task assignment validate their referenced records.
- `.env` is ignored; `server/.env.example` is included.

## Demo admin

Seed with:

    cd server
    npm install
    npm run seed:india
    npm start

Seeded admin:

- Email: ananya.sharma@example.in
- Password: Demo@12345

The seed script is for a development/demo database and clears its listed collections.
