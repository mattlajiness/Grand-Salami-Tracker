import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { readFile } from 'fs/promises';

async function listEmails() {
  try {
    const config = JSON.parse(await readFile('./firebase-applet-config.json', 'utf-8'));
    const app = initializeApp(config);
    const db = getFirestore(app);
    
    console.log("Fetching users from collection 'users'...");
    const querySnapshot = await getDocs(collection(db, 'users'));
    
    const emails = querySnapshot.docs.map(doc => doc.data().email).filter(Boolean);
    
    if (emails.length === 0) {
      console.log("No user emails found.");
    } else {
      console.log("\n--- USER EMAILS ---");
      emails.forEach(email => console.log(email));
      console.log("-------------------\n");
      console.log(`Total: ${emails.length} emails.`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error listing emails:", error);
    process.exit(1);
  }
}

listEmails();
