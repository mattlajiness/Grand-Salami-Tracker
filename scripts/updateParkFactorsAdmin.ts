import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

const parkFactors = [
  { game: "BAL @ BOS", runs: 9, hr: -10, park: "Fenway Park", condition: "Hum: 38% | Pres: 1019 | High", isClosed: false },
  { game: "COL @ LAA", runs: 2, hr: 7, park: "Angel Stadium", condition: "Hum: 50% | Pres: 1011 | Consistent", isClosed: false },
  { game: "KC @ CIN", runs: 2, hr: 0, park: "Great American BP", condition: "Hum: 56% | Pres: 1024 | Low", isClosed: false },
  { game: "LAD @ ARI", runs: 0, hr: -8, park: "Chase Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "SD @ PHI", runs: 0, hr: 3, park: "Citizens Bank Park", condition: "Hum: 28% | Pres: 1021 | Very High", isClosed: false },
  { game: "CHW @ MIN", runs: -3, hr: -11, park: "Target Field", condition: "Hum: 32% | Pres: 1021 | Medium", isClosed: false },
  { game: "MIA @ WAS", runs: -4, hr: -21, park: "Nationals Park", condition: "Hum: 25% | Pres: 1024 | Med-High", isClosed: false },
  { game: "PIT @ HOU", runs: -4, hr: 6, park: "Daikin Park", condition: "ROOF CLOSED", isClosed: true },
  { game: "DET @ TB", runs: -6, hr: -3, park: "Tropicana Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "NYM @ SEA", runs: -7, hr: -2, park: "T-Mobile Park", condition: "Hum: 35% | Pres: 1018 | Medium", isClosed: false },
  { game: "TEX @ STL", runs: -7, hr: -20, park: "Busch Stadium", condition: "Hum: 52% | Pres: 1022 | Med-High", isClosed: false },
  { game: "SF @ MIL", runs: -7, hr: -3, park: "American Family Fld", condition: "Hum: 54% | Pres: 1023 | Low", isClosed: false },
  { game: "ATH @ CHC", runs: -9, hr: -5, park: "Wrigley Field", condition: "Hum: 44% | Pres: 1023 | Extreme", isClosed: false },
  { game: "TOR @ ATL", runs: -11, hr: -20, park: "Truist Park", condition: "Hum: 33% | Pres: 1021 | Medium", isClosed: false },
  { game: "CLE @ NYY", runs: -12, hr: -2, park: "Yankee Stadium", condition: "Hum: 36% | Pres: 1022 | High", isClosed: false }
];

async function run() {
  try {
    const config = JSON.parse(await readFile('./firebase-applet-config.json', 'utf-8'));
    
    if (admin.apps.length === 0) {
      admin.initializeApp({
        projectId: config.projectId
      });
    }

    const db = getFirestore(config.firestoreDatabaseId);
    const date = new Date().toISOString().split('T')[0];
    
    console.log(`Writing to parkFactors/${date} in database: ${config.firestoreDatabaseId}...`);
    
    await db.collection('parkFactors').doc(date).set({
      parkFactors,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log("Successfully updated park factors for", date);
  } catch (err) {
    console.error("Critical error in park factors update:", err);
  }
}

run();
