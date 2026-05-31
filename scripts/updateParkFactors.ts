import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const parkFactors = [
  { game: "SF @ COL", runs: 31, hr: 29, park: "Coors Field", condition: "Hum: 12% | Pres: 1008 | Low", isClosed: false },
  { game: "NYY @ ATH", runs: 22, hr: 21, park: "Sutter Health Park", condition: "Hum: 29% | Pres: 1013 | Very High", isClosed: false },
  { game: "ATL @ CIN", runs: 5, hr: 5, park: "Great American BP", condition: "Hum: 37% | Pres: 1018 | Low", isClosed: false },
  { game: "PHI @ LAD", runs: 3, hr: 21, park: "Dodger Stadium", condition: "Hum: 31% | Pres: 1012 | Consistent", isClosed: false },
  { game: "SD @ WAS", runs: 2, hr: -5, park: "Nationals Park", condition: "Hum: 23% | Pres: 1019 | Med-High", isClosed: false },
  { game: "MIN @ PIT", runs: -1, hr: -23, park: "PNC Park", condition: "Hum: 26% | Pres: 1019 | Med-High", isClosed: false },
  { game: "TOR @ BAL", runs: -1, hr: -16, park: "Oriole Park", condition: "Hum: 30% | Pres: 1019 | Med-High", isClosed: false },
  { game: "MIL @ HOU", runs: -4, hr: 6, park: "Daikin Park", condition: "ROOF CLOSED", isClosed: true },
  { game: "DET @ CHW", runs: -5, hr: -3, park: "Rate Field", condition: "Hum: 75% | Pres: 1018 | Med-High", isClosed: false },
  { game: "LAA @ TB", runs: -6, hr: -4, park: "Tropicana Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "BOS @ CLE", runs: -7, hr: -19, park: "Progressive Field", condition: "Hum: 50% | Pres: 1020 | High", isClosed: false },
  { game: "CHC @ STL", runs: -7, hr: -14, park: "Busch Stadium", condition: "Hum: 69% | Pres: 1012 | Med-High", isClosed: false },
  { game: "KC @ TEX", runs: -7, hr: -10, park: "Globe Life Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "MIA @ NYM", runs: -12, hr: -11, park: "Citi Field", condition: "Hum: 29% | Pres: 1016 | Low", isClosed: false },
  { game: "ARI @ SEA", runs: -16, hr: -13, park: "T-Mobile Park", condition: "Hum: 43% | Pres: 1025 | Medium", isClosed: false }
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
