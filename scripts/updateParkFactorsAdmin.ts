import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

const parkFactors = [
  { game: "MIN @ CHW", runs: -1, hr: -3, park: "Rate Field", condition: "Hum: 57% | Pres: 1022 | Med-High", isClosed: false },
  { game: "CHC @ PIT", runs: -3, hr: -18, park: "PNC Park", condition: "Hum: 52% | Pres: 1018 | Med-High", isClosed: false },
  { game: "ATL @ BOS", runs: -4, hr: -18, park: "Fenway Park", condition: "Hum: 74% | Pres: 1009 | High", isClosed: false },
  { game: "LAA @ DET", runs: -5, hr: -13, park: "Comerica Park", condition: "Hum: 46% | Pres: 1022 | High", isClosed: false },
  { game: "TOR @ BAL", runs: -6, hr: -22, park: "Oriole Park", condition: "Hum: 52% | Pres: 1014 | Med-High", isClosed: false },
  { game: "HOU @ TEX", runs: -7, hr: -11, park: "Globe Life Field", condition: "ROOF CLOSED", isClosed: true }
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
