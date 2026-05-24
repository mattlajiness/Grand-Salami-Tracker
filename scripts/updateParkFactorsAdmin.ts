import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

const parkFactors = [
  { game: "STL @ CIN", runs: 10, hr: 17, park: "Great American BP", condition: "Hum: 87% | Pres: 1017 | Low" },
  { game: "SEA @ KC", runs: 2, hr: 7, park: "Kauffman Stadium", condition: "Hum: 38% | Pres: 1017 | High" },
  { game: "TEX @ LAA", runs: 2, hr: 3, park: "Angel Stadium", condition: "Hum: 57% | Pres: 1014 | Consistent" },
  { game: "COL @ ARI", runs: 0, hr: -8, park: "Chase Field", condition: "ROOF CLOSED" },
  { game: "CHW @ SF", runs: -1, hr: -17, park: "Oracle Park", condition: "Hum: 70% | Pres: 1016 | Consistent" },
  { game: "DET @ BAL", runs: -3, hr: -12, park: "Oriole Park", condition: "Hum: 78% | Pres: 1021 | Med-High" },
  { game: "NYM @ MIA", runs: -5, hr: -14, park: "LoanDepot Park", condition: "ROOF CLOSED" },
  { game: "LAD @ MIL", runs: -5, hr: 6, park: "American Family Fld", condition: "ROOF CLOSED" },
  { game: "PIT @ TOR", runs: -5, hr: 2, park: "Rogers Centre", condition: "ROOF CLOSED" },
  { game: "DET @ BAL", runs: -8, hr: -24, park: "Oriole Park", condition: "Hum: 91% | Pres: 1024 | Med-High" },
  { game: "WAS @ ATL", runs: -8, hr: -6, park: "Truist Park", condition: "Hum: 69% | Pres: 1018 | Medium" },
  { game: "ATH @ SD", runs: -10, hr: -9, park: "Petco Park", condition: "Hum: 82% | Pres: 1016 | Low" },
  { game: "MIN @ BOS", runs: -10, hr: -39, park: "Fenway Park", condition: "Hum: 85% | Pres: 1032 | High" },
  { game: "CLE @ PHI", runs: -11, hr: -17, park: "Citizens Bank Park", condition: "Hum: 98% | Pres: 1024 | Very High" },
  { game: "TB @ NYY", runs: -16, hr: -32, park: "Yankee Stadium", condition: "Hum: 94% | Pres: 1026 | High" },
  { game: "HOU @ CHC", runs: -23, hr: -20, park: "Wrigley Field", condition: "Hum: 79% | Pres: 1017 | Extreme" }
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
