import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

const parkFactors = [
  { game: "STL @ CIN", runs: 6, hr: 6, park: "Great American BP", condition: "Hum: 99% | Pres: 1015 | Low" },
  { game: "COL @ ARI", runs: 3, hr: -10, park: "Chase Field", condition: "Hum: 9% | Pres: 1004 | Medium" },
  { game: "MIN @ BOS", runs: 0, hr: -38, park: "Fenway Park", condition: "Hum: 38% | Pres: 1029 | High" },
  { game: "TEX @ LAA", runs: -1, hr: 4, park: "Angel Stadium", condition: "Hum: 45% | Pres: 1010 | Consistent" },
  { game: "SEA @ KC", runs: -5, hr: 1, park: "Kauffman Stadium", condition: "Hum: 88% | Pres: 1012 | High" },
  { game: "NYM @ MIA", runs: -5, hr: -13, park: "LoanDepot Park", condition: "ROOF CLOSED" },
  { game: "PIT @ TOR", runs: -5, hr: 2, park: "Rogers Centre", condition: "ROOF CLOSED" },
  { game: "LAD @ MIL", runs: -6, hr: 4, park: "American Family Fld", condition: "ROOF CLOSED" },
  { game: "DET @ BAL", runs: -9, hr: -27, park: "Oriole Park", condition: "Hum: 95% | Pres: 1025 | Med-High" },
  { game: "CLE @ PHI", runs: -9, hr: -13, park: "Citizens Bank Park", condition: "Hum: 77% | Pres: 1026 | Very High" },
  { game: "ATH @ SD", runs: -10, hr: -4, park: "Petco Park", condition: "Hum: 59% | Pres: 1010 | Low" },
  { game: "CHW @ SF", runs: -10, hr: -28, park: "Oracle Park", condition: "Hum: 77% | Pres: 1009 | Consistent" },
  { game: "WAS @ ATL", runs: -10, hr: -10, park: "Truist Park", condition: "Hum: 86% | Pres: 1016 | Medium" },
  { game: "HOU @ CHC", runs: -15, hr: -16, park: "Wrigley Field", condition: "Hum: 60% | Pres: 1019 | Extreme" },
  { game: "TB @ NYY", runs: -20, hr: -28, park: "Yankee Stadium", condition: "Hum: 45% | Pres: 1027 | High" }
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
