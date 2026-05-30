import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

const parkFactors = [
  { game: "SF @ COL", runs: 29, hr: 13, park: "Coors Field", condition: "Hum: 22% | Pres: 1005 | Low", isClosed: false },
  { game: "NYY @ ATH", runs: 20, hr: 32, park: "Sutter Health Park", condition: "Hum: 32% | Pres: 1014 | Very High", isClosed: false },
  { game: "ATL @ CIN", runs: 9, hr: 13, park: "Great American BP", condition: "Hum: 61% | Pres: 1017 | Low", isClosed: false },
  { game: "DET @ CHW", runs: -3, hr: -7, park: "Rate Field", condition: "Hum: 44% | Pres: 1019 | Med-High", isClosed: false },
  { game: "PHI @ LAD", runs: -4, hr: 11, park: "Dodger Stadium", condition: "Hum: 51% | Pres: 1013 | Consistent", isClosed: false },
  { game: "MIL @ HOU", runs: -4, hr: 6, park: "Daikin Park", condition: "ROOF CLOSED", isClosed: true },
  { game: "CHC @ STL", runs: -6, hr: -11, park: "Busch Stadium", condition: "Hum: 78% | Pres: 1013 | Med-High", isClosed: false },
  { game: "LAA @ TB", runs: -6, hr: -3, park: "Tropicana Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "MIN @ PIT", runs: -7, hr: -23, park: "PNC Park", condition: "Hum: 31% | Pres: 1017 | Med-High", isClosed: false },
  { game: "KC @ TEX", runs: -7, hr: -10, park: "Globe Life Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "TOR @ BAL", runs: -9, hr: -24, park: "Oriole Park", condition: "Hum: 42% | Pres: 1016 | Med-High", isClosed: false },
  { game: "BOS @ CLE", runs: -12, hr: -33, park: "Progressive Field", condition: "Hum: 57% | Pres: 1021 | High", isClosed: false },
  { game: "SD @ WAS", runs: -12, hr: -18, park: "Nationals Park", condition: "Hum: 38% | Pres: 1016 | Med-High", isClosed: false },
  { game: "MIA @ NYM", runs: -13, hr: -13, park: "Citi Field", condition: "Hum: 44% | Pres: 1015 | Low", isClosed: false },
  { game: "ARI @ SEA", runs: -20, hr: -23, park: "T-Mobile Park", condition: "Hum: 45% | Pres: 1024 | Medium", isClosed: false }
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
