// Script to seed Firestore with Punjab shelter data
const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
// admin.initializeApp({
//   credential: admin.credential.cert(require('../path-to-your-service-account-key.json'))
// });

const db = admin.firestore();

const PUNJAB_SHELTERS = [
  // Amritsar District
  {
    shelter_id: "AMR_001",
    name: "Golden Temple Community Center",
    lat: 31.6200,
    lon: 74.8765,
    capacity: 500,
    available: 320,
    status: "operational",
    district: "Amritsar",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-43210"
  },
  {
    shelter_id: "AMR_002", 
    name: "Amritsar Government School",
    lat: 31.6340,
    lon: 74.8720,
    capacity: 300,
    available: 180,
    status: "operational",
    district: "Amritsar",
    amenities: ["Food", "Restrooms", "Medical"],
    contact: "+91-98765-43211"
  },
  {
    shelter_id: "AMR_003",
    name: "Jallianwala Bagh Memorial Hall",
    lat: 31.6200,
    lon: 74.8800,
    capacity: 200,
    available: 150,
    status: "operational",
    district: "Amritsar",
    amenities: ["Food", "Restrooms"],
    contact: "+91-98765-43212"
  },

  // Ludhiana District
  {
    shelter_id: "LUD_001",
    name: "Ludhiana Sports Complex",
    lat: 30.9010,
    lon: 75.8573,
    capacity: 800,
    available: 450,
    status: "operational",
    district: "Ludhiana",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-43220"
  },
  {
    shelter_id: "LUD_002",
    name: "Guru Nanak Dev Engineering College",
    lat: 30.9200,
    lon: 75.8500,
    capacity: 400,
    available: 280,
    status: "operational",
    district: "Ludhiana",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-43221"
  },
  {
    shelter_id: "LUD_003",
    name: "Ludhiana Railway Station Shelter",
    lat: 30.9000,
    lon: 75.8600,
    capacity: 150,
    available: 90,
    status: "operational",
    district: "Ludhiana",
    amenities: ["Food", "Restrooms"],
    contact: "+91-98765-43222"
  },

  // Jalandhar District
  {
    shelter_id: "JAL_001",
    name: "Jalandhar City Center",
    lat: 31.3260,
    lon: 75.5762,
    capacity: 600,
    available: 380,
    status: "operational",
    district: "Jalandhar",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-43230"
  },
  {
    shelter_id: "JAL_002",
    name: "Punjab Agricultural University",
    lat: 31.3400,
    lon: 75.5700,
    capacity: 500,
    available: 320,
    status: "operational",
    district: "Jalandhar",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-43231"
  },

  // Patiala District
  {
    shelter_id: "PAT_001",
    name: "Patiala Palace Grounds",
    lat: 30.3398,
    lon: 76.3869,
    capacity: 700,
    available: 420,
    status: "operational",
    district: "Patiala",
    amenities: ["Food", "Medical", "WiFi", "Parking", "Restrooms"],
    contact: "+91-98765-43240"
  },
  {
    shelter_id: "PAT_002",
    name: "Thapar Institute of Engineering",
    lat: 30.3500,
    lon: 76.3800,
    capacity: 400,
    available: 250,
    status: "operational",
    district: "Patiala",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-43241"
  },

  // Bathinda District
  {
    shelter_id: "BAT_001",
    name: "Bathinda Fort Community Center",
    lat: 30.2110,
    lon: 74.9455,
    capacity: 350,
    available: 200,
    status: "operational",
    district: "Bathinda",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-43250"
  },

  // Firozpur District
  {
    shelter_id: "FIR_001",
    name: "Firozpur Cantonment Area",
    lat: 30.9167,
    lon: 74.6000,
    capacity: 450,
    available: 280,
    status: "operational",
    district: "Firozpur",
    amenities: ["Food", "Medical", "WiFi", "Restrooms"],
    contact: "+91-98765-43260"
  },

  // Gurdaspur District
  {
    shelter_id: "GUR_001",
    name: "Gurdaspur Government College",
    lat: 32.0400,
    lon: 75.4000,
    capacity: 300,
    available: 180,
    status: "operational",
    district: "Gurdaspur",
    amenities: ["Food", "Restrooms", "Medical"],
    contact: "+91-98765-43270"
  },

  // Hoshiarpur District
  {
    shelter_id: "HOS_001",
    name: "Hoshiarpur Sports Stadium",
    lat: 31.5300,
    lon: 75.9200,
    capacity: 400,
    available: 250,
    status: "operational",
    district: "Hoshiarpur",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-43280"
  },

  // Moga District
  {
    shelter_id: "MOG_001",
    name: "Moga City Hall",
    lat: 30.8100,
    lon: 75.1700,
    capacity: 250,
    available: 150,
    status: "operational",
    district: "Moga",
    amenities: ["Food", "Restrooms"],
    contact: "+91-98765-43290"
  },

  // Sangrur District
  {
    shelter_id: "SAN_001",
    name: "Sangrur District Hospital",
    lat: 30.2500,
    lon: 75.8400,
    capacity: 200,
    available: 120,
    status: "operational",
    district: "Sangrur",
    amenities: ["Food", "Medical", "Restrooms"],
    contact: "+91-98765-43300"
  }
];

async function seedShelters() {
  console.log('Seeding shelters data...');
  
  const batch = db.batch();
  
  for (const shelter of PUNJAB_SHELTERS) {
    const shelterRef = db.collection('shelters').doc(shelter.shelter_id);
    batch.set(shelterRef, shelter);
  }
  
  await batch.commit();
  console.log('Shelters seeded successfully!');
}

// Run the seeding function
seedShelters().catch(console.error);
