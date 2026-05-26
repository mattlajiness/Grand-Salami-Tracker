import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

const parkFactors = [
  { game: "SEA @ ATH", runs: 17, hr: 21, park: "Sutter Health Park", condition: "Hum: 27% | Pres: 1006 | Very High" },
  { game: "ATL @ BOS", runs: 16, hr: 2, park: "Fenway Park", condition: "Hum: 53% | Pres: 1014 | High" },
  { game: "MIA @ TOR", runs: 8, hr: 18, park: "Rogers Centre", condition: "Hum: 60% | Pres: 1013 | Minimal" },
  { game: "TB @ BAL", runs: 6, hr: 8, park: "Oriole Park", condition: "Hum: 85% | Pres: 1017 | Med-High" },
  { game: "MIN @ CHW", runs: 4, hr: 1, park: "Rate Field", condition: "Hum: 42% | Pres: 1014 | Med-High" },
  { game: "STL @ MIL", runs: 3, hr: 27, park: "American Family Fld", condition: "Hum: 57% | Pres: 1014 | Low" },
  { game: "NYY @ KC", runs: 2, hr: 17, park: "Kauffman Stadium", condition: "Hum: 66% | Pres: 1012 | High" },
  { game: "CHC @ PIT", runs: 2, hr: -10, park: "PNC Park", condition: "Hum: 61% | Pres: 1015 | Med-High" },
  { game: "LAA @ DET", runs: -2, hr: -14, park: "Comerica Park", condition: "Hum: 39% | Pres: 1015 | High" },
  { game: "ARI @ SF", runs: -3, hr: -16, park: "Oracle Park", condition: "Hum: 68% | Pres: 1009 | Consistent" },
  { game: "COL @ LAD", runs: -4, hr: 12, park: "Dodger Stadium", condition: "Hum: 53% | Pres: 1008 | Consistent" },
  { game: "CIN @ NYM", runs: -7, hr: 0, park: "Citi Field", condition: "Hum: 62% | Pres: 1016 | Low" },
  { game: "HOU @ TEX", runs: -7, hr: -11, park: "Globe Life Field", condition: "ROOF CLOSED" },
  { game: "WAS @ CLE", runs: -8, hr: -8, park: "Progressive Field", condition: "Hum: 60% | Pres: 1016 | High" },
  { game: "PHI @ SD", runs: -9, hr: -9, park: "Petco Park", condition: "Hum: 63% | Pres: 1010 | Low" }
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
