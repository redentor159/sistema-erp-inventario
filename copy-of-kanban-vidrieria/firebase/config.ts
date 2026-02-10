// Import the functions you need from the SDKs you need
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// IMPORTANT: Replace with your own Firebase configuration from your Firebase project console
const firebaseConfig = {
  apiKey: "AIzaSyB42_NOEP55Pe7gsL1HfPwzvbNeoXShahs",
  authDomain: "kanban-yahiro.firebaseapp.com",
  projectId: "kanban-yahiro",
  storageBucket: "kanban-yahiro.firebasestorage.app",
  messagingSenderId: "334092855277",
  appId: "1:334092855277:web:168e17ea6b0ca3f0b9e9e4"
};

// A flag to check if the config has been updated.
export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.apiKey !== "";


// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const db = firebase.firestore();


// --- Seed User Logic (Improved) ---
const seedDefaultUser = async () => {
    // Only run seeding if Firebase is configured to avoid errors.
    if (!isFirebaseConfigured) {
        console.warn("Firebase no está configurado. Saltando la creación del usuario por defecto.");
        return;
    }

    const email = "corp.vidriosyahiro@gmail.com";
    const password = "Corporacion de Vidrio y Aluminio Yahiro SRL";

    try {
        // Step 1: Check if the user exists by fetching sign-in methods.
        const signInMethods = await auth.fetchSignInMethodsForEmail(email);

        // Step 2: If the array of methods is empty, the user does not exist.
        if (signInMethods.length === 0) {
            // Step 3: Create the user.
            await auth.createUserWithEmailAndPassword(email, password);
            
            // Step 4: Sign out immediately so the app starts at the login screen.
            // This is crucial because createUserWithEmailAndPassword also signs the user in.
            await auth.signOut();
            console.log('Usuario por defecto creado y deslogueado exitosamente.');
        } else {
            // console.log('El usuario por defecto ya existe.');
        }
    } catch (error) {
        // This might catch network errors or other Firebase issues.
        console.error('Error durante la verificación del usuario por defecto:', error);
    }
};

// Execute the seeding function.
seedDefaultUser();
// --- End of Seed User Logic ---

export default firebase;