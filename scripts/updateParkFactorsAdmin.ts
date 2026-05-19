import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

const parkFactors = [
  { game: "TEX @ COL", runs: 14, hr: -8, park: "Coors Field", condition: "Hum: 69% | Pres: 1020 | Low Carry" },
  { game: "CIN @ PHI", runs: 12, hr: 37, park: "Citizens Bank Park", condition: "Hum: 39% | Pres: 1017 | Very High" },
  { game: "NYM @ WAS", runs: 7, hr: 5, park: "Nationals Park", condition: "Hum: 26% | Pres: 1017 | Med-High" },
  { game: "TOR @ NYY", runs: 4, hr: 18, park: "Yankee Stadium", condition: "Hum: 42% | Pres: 1015 | High Carry" },
  { game: "SF @ ARI", runs: 3, hr: -7, park: "Chase Field", condition: "Hum: 8% | Pres: 1009 | Medium" },
  { game: "ATH @ LAA", runs: 1, hr: 5, park: "Angel Stadium", condition: "Hum: 38% | Pres: 1012 | Consistent" },
  { game: "CLE @ DET", runs: -1, hr: -2, park: "Comerica Park", condition: "Hum: 72% | Pres: 1012 | High Density" },
  { game: "ATL @ MIA", runs: -6, hr: -15, park: "LoanDepot Park", condition: "ROOF CLOSED" },
  { game: "BAL @ TB", runs: -6, hr: -3, park: "Tropicana Field", condition: "ROOF CLOSED" },
  { game: "LAD @ SD", runs: -10, hr: -6, park: "Petco Park", condition: "Hum: 59% | Pres: 1013 | Low Carry" },
  { game: "HOU @ MIN", runs: -11, hr: -25, park: "Target Field", condition: "Hum: 57% | Pres: 1021 | Medium Carry" },
  { game: "MIL @ CHC", runs: -11, hr: -6, park: "Wrigley Field", condition: "Hum: 76% | Pres: 1016 | Extreme Air Edge" },
  { game: "PIT @ STL", runs: -13, hr: -20, park: "Busch Stadium", condition: "Hum: 89% | Pres: 1017 | Med-High Density" },
  { game: "CHW @ SEA", runs: -15, hr: -10, park: "T-Mobile Park", condition: "Hum: 69% | Pres: 1021 | Medium Carry" },
  { game: "BOS @ KC", runs: -16, hr: -21, park: "Kauffman Stadium", condition: "Hum: 66% | Pres: 1020 | High Density" }
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
