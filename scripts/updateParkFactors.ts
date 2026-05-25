import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const parkFactors = [
  { game: "SEA @ ATH", runs: 23, hr: 34, park: "Sutter Health Park", condition: "Hum: 34% | Pres: 1009 | Very High" },
  { game: "MIN @ CHW", runs: 5, hr: 1, park: "Rate Field", condition: "Hum: 41% | Pres: 1019 | Med-High" },
  { game: "NYY @ KC", runs: 4, hr: 11, park: "Kauffman Stadium", condition: "Hum: 33% | Pres: 1016 | High" },
  { game: "CHC @ PIT", runs: 2, hr: -12, park: "PNC Park", condition: "Hum: 79% | Pres: 1020 | Med-High" },
  { game: "TB @ BAL", runs: -1, hr: -10, park: "Oriole Park", condition: "Hum: 85% | Pres: 1020 | Med-High" },
  { game: "COL @ LAD", runs: -2, hr: 12, park: "Dodger Stadium", condition: "Hum: 58% | Pres: 1011 | Consistent" },
  { game: "CIN @ NYM", runs: -5, hr: 4, park: "Citi Field", condition: "Hum: 86% | Pres: 1019 | Low" },
  { game: "ARI @ SF", runs: -6, hr: -25, park: "Oracle Park", condition: "Hum: 75% | Pres: 1015 | Consistent" },
  { game: "STL @ MIL", runs: -6, hr: 5, park: "American Family Fld", condition: "Hum: 31% | Pres: 1018 | Low" },
  { game: "HOU @ TEX", runs: -7, hr: -11, park: "Globe Life Field", condition: "ROOF CLOSED" },
  { game: "MIA @ TOR", runs: -8, hr: 0, park: "Rogers Centre", condition: "Hum: 67% | Pres: 1019 | Minimal" },
  { game: "PHI @ SD", runs: -9, hr: -7, park: "Petco Park", condition: "Hum: 57% | Pres: 1013 | Low" },
  { game: "WAS @ CLE", runs: -13, hr: -20, park: "Progressive Field", condition: "Hum: 73% | Pres: 1020 | High" }
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
