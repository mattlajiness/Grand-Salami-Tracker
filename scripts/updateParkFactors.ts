import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const parkFactors = [
  { game: "ARI @ COL", runs: 32, hr: 13, park: "Coors Field" },
  { game: "SF @ ATH", runs: 13, hr: 16, park: "Sutter Health Park" },
  { game: "BAL @ WAS", runs: 10, hr: 10, park: "Nationals Park" },
  { game: "CHC @ CHW", runs: 3, hr: 9, park: "Rate Field" },
  { game: "PHI @ PIT", runs: 1, hr: -4, park: "PNC Park" },
  { game: "TOR @ DET", runs: 1, hr: -1, park: "Comerica Park" },
  { game: "CIN @ CLE", runs: 1, hr: 10, park: "Progressive Field" },
  { game: "LAD @ LAA", runs: -1, hr: 4, park: "Angel Stadium" },
  { game: "KC @ STL", runs: -1, hr: 2, park: "Busch Stadium" },
  { game: "MIL @ MIN", runs: -3, hr: -5, park: "Target Field" },
  { game: "TEX @ HOU", runs: -5, hr: 5, park: "Daikin Park" },
  { game: "MIA @ TB", runs: -6, hr: -3, park: "Tropicana Field" },
  { game: "NYY @ NYM", runs: -7, hr: 1, park: "Citi Field" },
  { game: "BOS @ ATL", runs: -8, hr: -10, park: "Truist Park" },
  { game: "SD @ SEA", runs: -13, hr: -13, park: "T-Mobile Park" }
];

async function updateParkFactors() {
  console.log("Updating park factors...");
  const date = new Date().toISOString().split('T')[0];
  
  try {
    await setDoc(doc(db, 'parkFactors', date), {
      parkFactors,
      updatedAt: new Date()
    });
    console.log("Successfully updated park factors for", date);
  } catch (error) {
    console.error("Error updating park factors:", error);
  }
}

updateParkFactors();
