import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);

// Base de données Firestore avec l'ID spécifique à l'applet
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Service d'authentification Firebase
export const auth = getAuth(app);

// Fournisseur d'authentification Google
export const googleProvider = new GoogleAuthProvider();

// Énumération pour les catégories d'opérations Firestore
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

// Interface d'informations d'erreur Firestore personnalisées
export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Fonction globale de gestion et d'enrichissement des erreurs Firestore
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Méthode de connexion simplifiée par popup Google
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Erreur de connexion Google:", error);
    throw error;
  }
}

// Méthode de déconnexion
export async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    throw error;
  }
}
