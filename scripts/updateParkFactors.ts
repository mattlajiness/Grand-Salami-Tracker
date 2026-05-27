import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const parkFactors = [
  { game: "SEA @ ATH", runs: 16, hr: 24, park: "Sutter Health Park", condition: "Hum: 40% | Pres: 1008 | Very High", isClosed: false },
  { game: "ATL @ BOS", runs: 11, hr: -8, park: "Fenway Park", condition: "Hum: 50% | Pres: 1006 | High", isClosed: false },
  { game: "LAA @ DET", runs: 5, hr: -7, park: "Comerica Park", condition: "Hum: 70% | Pres: 1013 | High", isClosed: false },
  { game: "ARI @ SF", runs: 3, hr: -10, park: "Oracle Park", condition: "Hum: 55% | Pres: 1009 | Consistent", isClosed: false },
  { game: "NYY @ KC", runs: 1, hr: 14, park: "Kauffman Stadium", condition: "Hum: 59% | Pres: 1013 | High", isClosed: false },
  { game: "MIA @ TOR", runs: 0, hr: 8, park: "Rogers Centre", condition: "Hum: 61% | Pres: 1014 | Minimal", isClosed: false },
  { game: "WAS @ CLE", runs: -1, hr: 4, park: "Progressive Field", condition: "Hum: 75% | Pres: 1014 | High", isClosed: false },
  { game: "STL @ MIL", runs: -3, hr: 8, park: "American Family Fld", condition: "Hum: 45% | Pres: 1016 | Low", isClosed: false },
  { game: "CIN @ NYM", runs: -3, hr: 9, park: "Citi Field", condition: "Hum: 59% | Pres: 1008 | Low", isClosed: false },
  { game: "MIN @ CHW", runs: -3, hr: -4, park: "Rate Field", condition: "Hum: 70% | Pres: 1015 | Med-High", isClosed: false },
  { game: "COL @ LAD", runs: -4, hr: 10, park: "Dodger Stadium", condition: "Hum: 57% | Pres: 1010 | Consistent", isClosed: false },
  { game: "CHC @ PIT", runs: -4, hr: -15, park: "PNC Park", condition: "Hum: 98% | Pres: 1013 | Med-High", isClosed: false },
  { game: "HOU @ TEX", runs: -7, hr: -11, park: "Globe Life Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "TB @ BAL", runs: -8, hr: -19, park: "Oriole Park", condition: "Hum: 92% | Pres: 1011 | Med-High", isClosed: false },
  { game: "PHI @ SD", runs: -8, hr: -8, park: "Petco Park", condition: "Hum: 46% | Pres: 1012 | Low", isClosed: false }
];

async function updateParkFactors() {
  const date = new Date().toISOString().split('T')[0];
  console.log(`Writing to parkFactors/${date} in database ${firebaseConfig.firestoreDatabaseId}...`);
  
  try {
    const docRef = doc(db, 'parkFactors', date);
    await setDoc(docRef, {
      parkFactors,
      updatedAt: new Date()
    });
    console.log("Successfully updated park factors for", date);
  } catch (error) {
    console.error("Error updating park factors:", error);
  }
}

updateParkFactors();
