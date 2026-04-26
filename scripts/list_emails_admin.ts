import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { readFile } from 'fs/promises';

async function run() {
  try {
    const config = JSON.parse(await readFile('./firebase-applet-config.json', 'utf-8'));
    
    admin.initializeApp({
      projectId: config.projectId
    });

    // Provide the specific database ID from the config using getFirestore helper
    const db = getFirestore(config.firestoreDatabaseId);
    
    console.log(`Querying database: ${config.firestoreDatabaseId}...`);
    const usersSnapshot = await db.collection('users').get();
    
    const emails = usersSnapshot.docs.map(doc => doc.data().email).filter(Boolean);
    
    if (emails.length === 0) {
      console.log("No user emails found in 'users' collection.");
    } else {
      console.log("\n--- REGISTERED USER EMAILS ---");
      emails.forEach(email => console.log(email));
      console.log("-------------------------------\n");
      console.log(`Total count: ${emails.length}`);
    }
  } catch (err) {
    console.error("Critical error in email retrieval:", err);
  }
}

run();
