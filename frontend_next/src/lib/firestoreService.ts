import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { AuthUserProfile } from "@/contexts/AuthContext";

/**
 * Save or update user profile in Firestore
 */
export async function saveUserProfileToFirestore(profile: AuthUserProfile): Promise<void> {
  if (!isFirebaseConfigured || !db || !profile.uid) return;
  try {
    const userRef = doc(db, "users", profile.uid);
    // Sanitize undefined values
    const cleanData = JSON.parse(JSON.stringify({
      ...profile,
      updatedAt: new Date().toISOString()
    }));
    await setDoc(userRef, cleanData, { merge: true });
    console.log("User profile synced to Firestore:", profile.uid);
  } catch (error) {
    console.warn("Error saving user profile to Firestore:", error);
  }
}

/**
 * Fetch user profile from Firestore by UID
 */
export async function getUserProfileFromFirestore(uid: string): Promise<AuthUserProfile | null> {
  if (!isFirebaseConfigured || !db || !uid) return null;
  try {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as AuthUserProfile;
    }
  } catch (error) {
    console.warn("Error fetching user profile from Firestore:", error);
  }
  return null;
}

/**
 * Save Inspection Record to Firestore
 */
export async function saveInspectionToFirestore(inspection: any): Promise<string | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const inspectionId = inspection.id || `INS-${Date.now().toString(36).toUpperCase()}`;
    const inspectionRef = doc(db, "inspections", inspectionId);
    
    const payload = {
      ...inspection,
      id: inspectionId,
      createdAt: inspection.createdAt || new Date().toISOString(),
      timestamp: serverTimestamp()
    };

    await setDoc(inspectionRef, JSON.parse(JSON.stringify(payload)), { merge: true });
    console.log("Inspection successfully saved to Firestore:", inspectionId);
    return inspectionId;
  } catch (error) {
    console.warn("Error saving inspection to Firestore:", error);
    return null;
  }
}

/**
 * Fetch all Inspections from Firestore
 */
export async function getInspectionsFromFirestore(maxResults = 50): Promise<any[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const q = query(
      collection(db, "inspections"), 
      orderBy("createdAt", "desc"), 
      limit(maxResults)
    );
    const querySnapshot = await getDocs(q);
    const results: any[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  } catch (error) {
    console.warn("Error getting inspections from Firestore:", error);
    return [];
  }
}

/**
 * Real-time listener for Inspections
 */
export function subscribeToInspections(onUpdate: (inspections: any[]) => void) {
  if (!isFirebaseConfigured || !db) return () => {};
  try {
    const q = query(collection(db, "inspections"), orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
      onUpdate(items);
    });
  } catch (error) {
    console.warn("Firestore listener error:", error);
    return () => {};
  }
}

/**
 * Save Citizen Consumer Complaint to Firestore
 */
export async function saveComplaintToFirestore(complaint: any): Promise<string | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const complaintId = complaint.id || `CMP-${Date.now().toString(36).toUpperCase()}`;
    const complaintRef = doc(db, "complaints", complaintId);
    
    const payload = {
      ...complaint,
      id: complaintId,
      status: complaint.status || "Registered",
      filedAt: new Date().toISOString(),
      timestamp: serverTimestamp()
    };

    await setDoc(complaintRef, JSON.parse(JSON.stringify(payload)), { merge: true });
    console.log("Complaint saved to Firestore:", complaintId);
    return complaintId;
  } catch (error) {
    console.warn("Error saving complaint to Firestore:", error);
    return null;
  }
}

/**
 * Fetch Complaints from Firestore
 */
export async function getComplaintsFromFirestore(): Promise<any[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const querySnapshot = await getDocs(collection(db, "complaints"));
    const results: any[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  } catch (error) {
    console.warn("Error fetching complaints from Firestore:", error);
    return [];
  }
}
