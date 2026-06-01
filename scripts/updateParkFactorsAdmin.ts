import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

const parkFactors = [
  { game: "KC @ CIN", runs: 9, hr: 11, park: "Great American BP", condition: "Hum: 56% | Pres: 1016 | Low", isClosed: false },
  { game: "COL @ LAA", runs: 4, hr: 4, park: "Angel Stadium", condition: "Hum: 48% | Pres: 1012 | Consistent", isClosed: false },
  { game: "CHW @ MIN", runs: 1, hr: -19, park: "Target Field", condition: "Hum: 48% | Pres: 1020 | Medium", isClosed: false },
  { game: "LAD @ ARI", runs: 0, hr: -8, park: "Chase Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "MIA @ WAS", runs: -3, hr: -17, park: "Nationals Park", condition: "Hum: 47% | Pres: 1015 | Med-High", isClosed: false },
  { game: "SF @ MIL", runs: -5, hr: 6, park: "American Family Fld", condition: "ROOF CLOSED", isClosed: true },
  { game: "DET @ TB", runs: -6, hr: -3, park: "Tropicana Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "TEX @ STL", runs: -10, hr: -15, park: "Busch Stadium", condition: "Hum: 74% | Pres: 1014 | Med-High", isClosed: false },
  { game: "NYM @ SEA", runs: -16, hr: -8, park: "T-Mobile Park", condition: "Hum: 36% | Pres: 1018 | Medium", isClosed: false }
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
