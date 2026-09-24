import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

const parkFactors = [
  { game: "ARI @ COL", runs: 26, hr: 19, park: "Coors Field", condition: "Hum: 60% | Pres: 1015 | Low", isClosed: false },
  { game: "HOU @ ATH", runs: 20, hr: 31, park: "Sutter Health Park", condition: "Hum: 24% | Pres: 1010 | Very High", isClosed: false },
  { game: "LAA @ ATH", runs: 20, hr: 31, park: "Sutter Health Park", condition: "Hum: 24% | Pres: 1010 | Very High", isClosed: false },
  { game: "TOR @ BAL", runs: 1, hr: -23, park: "Oriole Park", condition: "Hum: 56% | Pres: 1027 | Med-High", isClosed: false },
  { game: "SD @ LAD", runs: 0, hr: 24, park: "Dodger Stadium", condition: "Hum: 60% | Pres: 1010 | Consistent", isClosed: false },
  { game: "WAS @ DET", runs: -1, hr: -10, park: "Comerica Park", condition: "Hum: 52% | Pres: 1028 | High", isClosed: false },
  { game: "CHW @ KC", runs: -1, hr: -7, park: "Kauffman Stadium", condition: "Hum: 51% | Pres: 1022 | High", isClosed: false },
  { game: "MIN @ SF", runs: -3, hr: -16, park: "Oracle Park", condition: "Hum: 65% | Pres: 1014 | Consistent", isClosed: false },
  { game: "MIL @ PHI", runs: -4, hr: -20, park: "Citizens Bank Park", condition: "Hum: 54% | Pres: 1029 | Very High", isClosed: false },
  { game: "NYM @ TEX", runs: -8, hr: -11, park: "Globe Life Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "CIN @ ATL", runs: -14, hr: -18, park: "Truist Park", condition: "Hum: 71% | Pres: 1020 | Medium", isClosed: false },
  { game: "CLE @ BOS", runs: -15, hr: -42, park: "Fenway Park", condition: "Hum: 70% | Pres: 1033 | High", isClosed: false },
  { game: "STL @ PIT", runs: -17, hr: -34, park: "PNC Park", condition: "Hum: 52% | Pres: 1026 | Med-High", isClosed: false },
  { game: "LAA @ SEA", runs: -18, hr: -9, park: "T-Mobile Park", condition: "ROOF OPEN | Hum: 65% | Pres: 1018 | Medium", isClosed: false },
  { game: "HOU @ SEA", runs: -18, hr: -9, park: "T-Mobile Park", condition: "ROOF OPEN | Hum: 65% | Pres: 1018 | Medium", isClosed: false },
  { game: "TB @ NYY", runs: -18, hr: -28, park: "Yankee Stadium", condition: "Hum: 44% | Pres: 1030 | High", isClosed: false },
  { game: "MIA @ CHC", runs: -26, hr: -32, park: "Wrigley Field", condition: "Hum: 74% | Pres: 1026 | Extreme", isClosed: false }
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
