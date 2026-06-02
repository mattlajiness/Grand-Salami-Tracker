import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const parkFactors = [
  { game: "KC @ CIN", runs: 7, hr: 9, park: "Great American BP", condition: "Hum: 55% | Pres: 1022 | Low", isClosed: false },
  { game: "BAL @ BOS", runs: 2, hr: -12, park: "Fenway Park", condition: "Hum: 41% | Pres: 1018 | High", isClosed: false },
  { game: "COL @ LAA", runs: 1, hr: 7, park: "Angel Stadium", condition: "Hum: 47% | Pres: 1014 | Consistent", isClosed: false },
  { game: "LAD @ ARI", runs: 0, hr: -8, park: "Chase Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "CHW @ MIN", runs: -3, hr: -23, park: "Target Field", condition: "Hum: 37% | Pres: 1025 | Medium", isClosed: false },
  { game: "PIT @ HOU", runs: -4, hr: 6, park: "Daikin Park", condition: "ROOF CLOSED", isClosed: true },
  { game: "SD @ PHI", runs: -5, hr: -6, park: "Citizens Bank Park", condition: "Hum: 34% | Pres: 1020 | Very High", isClosed: false },
  { game: "DET @ TB", runs: -6, hr: -4, park: "Tropicana Field", condition: "ROOF CLOSED", isClosed: true },
  { game: "NYM @ SEA", runs: -7, hr: 2, park: "T-Mobile Park", condition: "Hum: 24% | Pres: 1012 | Medium", isClosed: false },
  { game: "TOR @ ATL", runs: -7, hr: -11, park: "Truist Park", condition: "Hum: 57% | Pres: 1017 | Medium", isClosed: false },
  { game: "MIA @ WAS", runs: -9, hr: -23, park: "Nationals Park", condition: "Hum: 45% | Pres: 1021 | Med-High", isClosed: false },
  { game: "CLE @ NYY", runs: -11, hr: -7, park: "Yankee Stadium", condition: "Hum: 29% | Pres: 1020 | High", isClosed: false },
  { game: "TEX @ STL", runs: -12, hr: -26, park: "Busch Stadium", condition: "Hum: 52% | Pres: 1023 | Med-High", isClosed: false },
  { game: "SF @ MIL", runs: -20, hr: -13, park: "American Family Fld", condition: "Hum: 51% | Pres: 1028 | Low", isClosed: false },
  { game: "ATH @ CHC", runs: -25, hr: -33, park: "Wrigley Field", condition: "Hum: 62% | Pres: 1027 | Extreme", isClosed: false }
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
