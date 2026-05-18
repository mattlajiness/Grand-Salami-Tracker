import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const parkFactors = [
  { game: "MIL @ CHC", runs: 16, hr: 40, park: "Wrigley Field", condition: "Hum: 71% | Pres: 1010 | Extreme Receptivity" },
  { game: "BOS @ KC", runs: 15, hr: 35, park: "Kauffman Stadium", condition: "Hum: 77% | Pres: 1004 | High Carry" },
  { game: "CIN @ PHI", runs: 11, hr: 31, park: "Citizens Bank Park", condition: "Hum: 47% | Pres: 1020 | Very High" },
  { game: "NYM @ WAS", runs: 9, hr: 10, park: "Nationals Park", condition: "Hum: 32% | Pres: 1018 | Med-High" },
  { game: "SF @ ARI", runs: 8, hr: -5, park: "Chase Field", condition: "Hum: 16% | Pres: 1005 | Medium" },
  { game: "TEX @ COL", runs: 6, hr: -8, park: "Coors Field", condition: "Hum: 100% | Pres: 1018 | Low Density" },
  { game: "ATH @ LAA", runs: 3, hr: 3, park: "Angel Stadium", condition: "Hum: 56% | Pres: 1011 | Consistent" },
  { game: "HOU @ MIN", runs: 0, hr: -5, park: "Target Field", condition: "Hum: 86% | Pres: 1007 | Medium" },
  { game: "CLE @ DET", runs: -1, hr: -4, park: "Comerica Park", condition: "Hum: 54% | Pres: 1013 | High Marine Edge" },
  { game: "ATL @ MIA", runs: -5, hr: -13, park: "LoanDepot Park", condition: "ROOF CLOSED" },
  { game: "BAL @ TB", runs: -6, hr: -3, park: "Tropicana Field", condition: "ROOF CLOSED" },
  { game: "LAD @ SD", runs: -7, hr: -3, park: "Petco Park", condition: "Hum: 62% | Pres: 1011 | Low Carry" },
  { game: "TOR @ NYY", runs: -7, hr: 1, park: "Yankee Stadium", condition: "Hum: 62% | Pres: 1021 | High Density" },
  { game: "CHW @ SEA", runs: -21, hr: -15, park: "T-Mobile Park", condition: "Hum: 46% | Pres: 1020 | Medium Marine Layer" }
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
