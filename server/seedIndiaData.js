/**
 * Seed Suraksha Setu with fictional India-based demo data.
 *
 * WARNING: This script clears the collections listed below before inserting
 * demo records. Run it only against a development/demo MongoDB database.
 *
 * Usage:
 *   node seedIndiaData.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Location = require('./models/Location');
const Incident = require('./models/Incident');
const EmergencyContact = require('./models/EmergencyContact');
const Community = require('./models/Community');
const Donation = require('./models/Donation');
const Resource = require('./models/Resource');
const HelpCenter = require('./models/HelpCenter');
const Announcement = require('./models/Announcement');
const Message = require('./models/Message');
const VolunteerTask = require('./models/VolunteerTask');
const ResourceAllocation = require('./models/ResourceAllocation');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('MONGO_URI is missing. Add it to server/.env');
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const models = [
    Message, Announcement, Donation, Resource, HelpCenter,
    EmergencyContact, Incident, Location, Community, User, VolunteerTask, ResourceAllocation, Notification
  ];

  for (const model of models) {
    await model.deleteMany({});
  }

  const password = await bcrypt.hash('Demo@12345', 10);

  await User.insertMany([
    {
      UserID: 101, Name: 'Rohan Verma', Email: 'rohan.verma@example.in',
      Phone: '9876543210', Password: password, Address: 'Raipur, Chhattisgarh, India',
      UserType: ['volunteer'], Available: true, Community: [1]
    },
    {
      UserID: 102, Name: 'Priya Patel', Email: 'priya.patel@example.in',
      Phone: '9812345678', Password: password, Address: 'Bhilai, Chhattisgarh, India',
      UserType: ['volunteer'], Available: true, Community: [1]
    },
    {
      UserID: 103, Name: 'Arjun Mehta', Email: 'arjun.mehta@example.in',
      Phone: '9123456780', Password: password, Address: 'Durg, Chhattisgarh, India',
      UserType: ['volunteer'], Available: false, Community: [1]
    },
    {
      UserID: 104, Name: 'Ananya Sharma', Email: 'ananya.sharma@example.in',
      Phone: '9987654321', Password: password, Address: 'Raipur, Chhattisgarh, India',
      UserType: ['admin', 'volunteer'], Available: true, Community: [1]
    }
  ]);

  await Location.insertMany([
    {
      LocationID: 1, IncidentID: [1], Latitude: 21.2514, Longitude: 81.6296,
      Address: 'Telibandha, Raipur, Chhattisgarh, India'
    },
    {
      LocationID: 2, IncidentID: [2], Latitude: 20.2961, Longitude: 85.8245,
      Address: 'Bhubaneswar, Odisha, India'
    },
    {
      LocationID: 3, IncidentID: [3], Latitude: 13.0827, Longitude: 80.2707,
      Address: 'Chennai, Tamil Nadu, India'
    },
    {
      LocationID: 4, IncidentID: [4], Latitude: 26.1445, Longitude: 91.7362,
      Address: 'Guwahati, Assam, India'
    },
    {
      LocationID: 5, IncidentID: [5], Latitude: 28.6139, Longitude: 77.2090,
      Address: 'New Delhi, India'
    }
  ]);

  await Incident.insertMany([
    {
      IncidentID: 1, Volunteers: [101, 102], AffectedIndividual: [1, 2, 3],
      ApproximateaffectedCount: 180, LocationID: 1, IncidentType: 'Flood',
      Description: 'Heavy monsoon rainfall has caused waterlogging in low-lying areas of Raipur. Community volunteers are assisting with evacuation and supplies.',
      CommunityID: 1, ReportedBy: 101, DateReported: new Date('2026-07-18T14:30:00+05:30'),
      Urgency: 'High', Status: 'Running'
    },
    {
      IncidentID: 2, Volunteers: [102], AffectedIndividual: [4, 5],
      ApproximateaffectedCount: 95, LocationID: 2, IncidentType: 'Cyclone',
      Description: 'Cyclonic weather has disrupted coastal services around Bhubaneswar. Relief teams are supporting temporary shelters.',
      CommunityID: 2, ReportedBy: 102, DateReported: new Date('2026-08-02T09:15:00+05:30'),
      Urgency: 'Medium', Status: 'Running'
    },
    {
      IncidentID: 3, Volunteers: [103], AffectedIndividual: [6],
      ApproximateaffectedCount: 70, LocationID: 3, IncidentType: 'Flood',
      Description: 'Localized flooding has affected several streets in Chennai. Volunteers are distributing drinking water and essential supplies.',
      CommunityID: 3, ReportedBy: 103, DateReported: new Date('2026-08-11T11:00:00+05:30'),
      Urgency: 'Medium', Status: 'Running'
    },
    {
      IncidentID: 4, Volunteers: [101], AffectedIndividual: [7, 8],
      ApproximateaffectedCount: 120, LocationID: 4, IncidentType: 'Flood',
      Description: 'River levels have risen around Guwahati. Community shelters and volunteer transport are active.',
      CommunityID: 4, ReportedBy: 101, DateReported: new Date('2026-08-18T16:20:00+05:30'),
      Urgency: 'High', Status: 'Running'
    },
    {
      IncidentID: 5, Volunteers: [104], AffectedIndividual: [9],
      ApproximateaffectedCount: 45, LocationID: 5, IncidentType: 'Fire',
      Description: 'A residential fire incident was reported in New Delhi. Local emergency services and volunteers assisted affected residents.',
      CommunityID: 5, ReportedBy: 104, DateReported: new Date('2026-08-25T18:10:00+05:30'),
      Urgency: 'High', Status: 'Running'
    }
  ]);

  await EmergencyContact.insertMany([
    {contactID: 1, name: 'National Emergency Helpline', designation: 'Emergency Services', locationID: 1, phone: '112', email: 'emergency@example.in'},
    {contactID: 2, name: 'Raipur District Control Room', designation: 'District Disaster Management', locationID: 1, phone: '07712441122', email: 'controlroom.raipur@example.in'},
    {contactID: 3, name: 'Odisha Relief Control Room', designation: 'State Disaster Management', locationID: 2, phone: '06742390000', email: 'relief.odisha@example.in'},
    {contactID: 4, name: 'Chennai Emergency Desk', designation: 'City Emergency Support', locationID: 3, phone: '04425305000', email: 'emergency.chennai@example.in'},
    {contactID: 5, name: 'Guwahati District Control Room', designation: 'District Disaster Management', locationID: 4, phone: '03612730100', email: 'controlroom.guwahati@example.in'}
  ]);

  await Community.insertMany([
    {ComID: 1, Users: [101, 102, 103, 104], JoinRequests: [], Name: 'Raipur Flood Response', LocationID: 1, Leader: 104, CreatedBy: 104, DateCreated: new Date('2026-07-15T14:15:00+05:30')},
    {ComID: 2, Users: [102], JoinRequests: [], Name: 'Bhubaneswar Cyclone Relief Network', LocationID: 2, Leader: 102, CreatedBy: 102, DateCreated: new Date('2026-08-02T10:15:00+05:30')},
    {ComID: 3, Users: [103], JoinRequests: [], Name: 'Chennai Flood Support', LocationID: 3, Leader: 103, CreatedBy: 103, DateCreated: new Date('2026-08-11T11:30:00+05:30')},
    {ComID: 4, Users: [101], JoinRequests: [], Name: 'Guwahati Flood Support', LocationID: 4, Leader: 101, CreatedBy: 101, DateCreated: new Date('2026-08-18T15:20:00+05:30')},
    {ComID: 5, Users: [104], JoinRequests: [], Name: 'New Delhi Fire Relief', LocationID: 5, Leader: 104, CreatedBy: 104, DateCreated: new Date('2026-08-25T18:30:00+05:30')}
  ]);

  await Resource.insertMany([
    {ResourceID: 1, Name: 'Drinking Water', Quantity: 2500, QuantityType: 'litres', LocationID: 1, Status: 'available'},
    {ResourceID: 2, Name: 'Food Packets', Quantity: 1200, QuantityType: 'packets', LocationID: 1, Status: 'available'},
    {ResourceID: 3, Name: 'First Aid Kits', Quantity: 150, QuantityType: 'kits', LocationID: 2, Status: 'available'},
    {ResourceID: 4, Name: 'Blankets', Quantity: 600, QuantityType: 'pieces', LocationID: 3, Status: 'available'},
    {ResourceID: 5, Name: 'Emergency Lights', Quantity: 180, QuantityType: 'pieces', LocationID: 4, Status: 'available'}
  ]);

  await HelpCenter.insertMany([
    {CenterID: 1, Name: 'Dr. B.R. Ambedkar Memorial Hospital', Role: 'Hospital', LocationID: 1, Phone: '07712891234', Capacity: 500, BookedSeats: 310},
    {CenterID: 2, Name: 'AIIMS Bhubaneswar', Role: 'Hospital', LocationID: 2, Phone: '06742390000', Capacity: 700, BookedSeats: 480},
    {CenterID: 3, Name: 'Government Relief Shelter - Chennai', Role: 'ShelterCenter', LocationID: 3, Phone: '04425305000', Capacity: 400, BookedSeats: 210},
    {CenterID: 4, Name: 'Guwahati Community Relief Centre', Role: 'ShelterCenter', LocationID: 4, Phone: '03612730100', Capacity: 350, BookedSeats: 190}
  ]);

  await Donation.insertMany([
    {DonationID: 1, Amount: 25000, DonatedBy: 101, DateDonated: new Date('2026-07-18T15:00:00+05:30'), ResourceID: 1},
    {DonationID: 2, Amount: 15000, DonatedBy: 102, DateDonated: new Date('2026-07-19T12:00:00+05:30'), ResourceID: 2},
    {DonationID: 3, Amount: 10000, DonatedBy: 103, DateDonated: new Date('2026-08-03T16:30:00+05:30'), ResourceID: 3}
  ]);

  await Announcement.insertMany([
    {AnnouncementID: 1, Content: 'Raipur relief volunteers should report to the Telibandha community centre at 8:00 AM.', CreatedBy: 104, CommunityID: 1, Urgency: 'high'},
    {AnnouncementID: 2, Content: 'Please use verified shelter information and avoid entering flooded roads.', CreatedBy: 104, CommunityID: 1, Urgency: 'medium'},
    {AnnouncementID: 3, Content: 'Essential medicine and drinking water are available at the relief desk.', CreatedBy: 102, CommunityID: 2, Urgency: 'medium'}
  ]);

  await Message.insertMany([
    {MessageID: 1, Sender: 101, CommunityID: 1, Content: 'The relief camp near Telibandha is accepting families.', CreationTime: new Date('2026-07-18T20:24:49+05:30')},
    {MessageID: 2, Sender: 102, CommunityID: 1, Content: 'I can bring drinking water and first-aid supplies tomorrow morning.', CreationTime: new Date('2026-07-18T20:27:49+05:30')},
    {MessageID: 3, Sender: 103, CommunityID: 1, Content: 'The volunteer team has arranged transport from affected neighbourhoods.', CreationTime: new Date('2026-07-18T20:28:49+05:30')}
  ]);


  await VolunteerTask.insertMany([
    {TaskID:1,Description:'Distribute drinking water at Telibandha relief centre.',AssignedTo:101,IncidentID:1,Status:'Running'},
    {TaskID:2,Description:'Coordinate transport for elderly residents in Raipur.',AssignedTo:102,IncidentID:1,Status:'Assigned'},
    {TaskID:3,Description:'Verify shelter occupancy and report shortages.',AssignedTo:103,IncidentID:4,Status:'Completed',DateCompleted:new Date('2026-08-19T13:00:00+05:30')}
  ]);
  await ResourceAllocation.insertMany([
    {AllocationID:1,ResourceID:1,IncidentID:1,Quantity:500,AllocatedBy:104},
    {AllocationID:2,ResourceID:2,IncidentID:1,Quantity:200,AllocatedBy:104}
  ]);
  await Notification.insertMany([
    {NotificationID:1,UserID:101,Title:'Volunteer task assigned',Message:'Distribute drinking water at Telibandha relief centre.',Type:'task'},
    {NotificationID:2,UserID:104,Title:'Incident requires attention',Message:'Raipur flood incident #1 is marked High urgency.',Type:'incident'}
  ]);

  console.log('India-based demo data inserted successfully.');
  console.log('Demo login password for seeded users: Demo@12345');
}

seed()
  .catch(err => {
    console.error('India data seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
