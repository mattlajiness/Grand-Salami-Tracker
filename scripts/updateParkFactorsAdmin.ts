import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

const parkFactors = [
  { game: "SF @ COL", runs: 27, hr: 3, park: "Coors Field", condition: "Hum: 29% | Pres: 1000 | Low", isClosed: false },
  { game: "ATL @ CIN", runs: 11, hr: 12, park: "Great American BP", condition: "Hum: 49% | Pres: 1013 | Low", isClosed: false },
  { game: "NYY @ ATH", runs: 9, hr: 9, park: "Sutter Health Park", condition: "Hum: 44% | Pres: 1015 | Very High", isClosed: false },
  { game: "TOR @ BAL", runs: 3, hr: 3, park: "Oriole Park", condition: "Hum: 49% | Pres: 1009 | Med-High", isClosed: false },
  { game: "SD @ WAS", runs: 3, hr: 8, park: "Nationals Park", condition: "Hum: 36% | Pres: 1010 | Med-High", isClosed: false },
  { game: "MIN @ PIT", runs: 1, hr: -5, park: "PNC Park", condition: "Hum: 50% | Pres: 1012 | Med-High", isClosed: false },
  { game: "CHC @ STL", runs: -3, hr: -10, park: "Busch Stadium", condition: "Hum: 74% | Pres: 1013 | Med-High", isClosed: false },
  { game: "BOS @ CLE", runs: -3, hr: 3, park: "Progressive Field", condition: "Hum: 57% | Pres: 1013 | High", isClosed: false },
  { game: "MIL @ HOU", runs: -4, hr: 6, park: "Daikin Park", condition: "ROOF CLOSED", isClosed: true },
  { game: "PHI @ LAD", runs: -5, hr: 6, park: "Dodger Stadium", condition: "Hum: 54% | Pres: 1014 | Consistent", isClosed: false },
  { game: "DET @ CHW", runs: -5, hr: -5, park: "Rate Field", condition: "Hum: 52% | Pres: 1015 | Med-High", isClosed: false },
  { game: "LAA @ TB", runs: -6, hr: -4, park: "Tropicana Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "KC @ TEX", runs: -7, hr: -11, park: "Globe Life Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "MIA @ NYM", runs: -8, hr: 1, park: "Citi Field", condition: "Hum: 36% | Pres: 1005 | Low", isClosed: false },
  { game: "ARI @ SEA", runs: -15, hr: -13, park: "T-Mobile Park", condition: "Hum: 65% | Pres: 1019 | Medium", isClosed: false }
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
