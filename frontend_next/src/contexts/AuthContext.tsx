"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { saveUserProfileToFirestore, getUserProfileFromFirestore } from "@/lib/firestoreService";

export type AccountRole = "officer" | "user" | "admin";

export interface OfficerDetails {
  badgeNumber: string;         // e.g. "LMD-DEL-2024-984"
  designation: string;         // e.g. "Inspector of Legal Metrology (ILM)"
  jurisdictionZone: string;    // e.g. "Delhi NCR - North-West Division"
  statePosting: string;        // e.g. "NCT of Delhi"
  employeeCode: string;        // e.g. "GOI-EMP-784920"
  officialPhone: string;       // e.g. "+91 98765 43210"
  warrantSection: string;      // e.g. "Section 15 & 28, Legal Metrology Act 2009"
}

export interface ConsumerDetails {
  mobilePhone: string;         // e.g. "+91 98112 34567"
  state: string;               // e.g. "Maharashtra"
  districtCity: string;        // e.g. "Pune"
  pinCode: string;             // e.g. "411001"
  consumerCategory: string;    // e.g. "Individual Retail Buyer"
  idProofType?: string;        // e.g. "Aadhaar Card"
}

export interface AdminDetails {
  adminPost: string;           // e.g. "Director of Legal Metrology, Govt. of India"
  ministryDepartment: string;  // e.g. "Department of Consumer Affairs (DoCA)"
  centralGovtCode: string;     // e.g. "IAS-CENT-2016-8942"
  securityClearance: string;   // e.g. "Level 1 - Root Super-Admin (Rule Power Sec 52)"
  officialExtension: string;   // e.g. "Krishi Bhawan Ext 2338"
  adminSecretKey?: string;     // Secret master key
}

export interface AuthUserProfile {
  uid: string;
  email: string;
  name: string;
  role: AccountRole;
  badge: string;
  designation: string;
  jurisdiction?: string;
  employeeCode?: string;
  officialPhone?: string;
  statutoryAuthority?: string;
  photoURL?: string | null;
  officerDetails?: OfficerDetails;
  consumerDetails?: ConsumerDetails;
  adminDetails?: AdminDetails;
}

interface AuthContextType {
  user: AuthUserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isFirebaseReady: boolean;
  loginWithEmail: (email: string, password: string, role?: AccountRole) => Promise<{ user: AuthUserProfile; route: string }>;
  registerWithEmail: (
    email: string, 
    password: string, 
    role: AccountRole, 
    name: string, 
    meta?: {
      officer?: Partial<OfficerDetails>;
      consumer?: Partial<ConsumerDetails>;
      admin?: Partial<AdminDetails>;
    }
  ) => Promise<{ user: AuthUserProfile; route: string }>;
  loginWithGoogle: (preferredRole?: AccountRole) => Promise<{ user: AuthUserProfile; route: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  isFirebaseReady: false,
  loginWithEmail: async () => ({ user: {} as AuthUserProfile, route: "/dashboard" }),
  registerWithEmail: async () => ({ user: {} as AuthUserProfile, route: "/dashboard" }),
  loginWithGoogle: async () => ({ user: {} as AuthUserProfile, route: "/consumer" }),
  logout: async () => {}
});

export const determineRole = (email?: string | null, preferredRole?: AccountRole): { role: AccountRole; route: string; badge: string; designation: string } => {
  const cleanEmail = (email || "").trim().toLowerCase();
  
  if (cleanEmail === "admin@lmd.gov.in" || preferredRole === "admin") {
    return {
      role: "admin",
      route: "/admin",
      badge: "LMD-HQ-ADMIN-01",
      designation: "Central Policy & Rule Admin"
    };
  }

  if (cleanEmail.endsWith("@lmd.gov.in") || preferredRole === "officer") {
    return {
      role: "officer",
      route: "/dashboard",
      badge: "LMD-DEL-2024-984",
      designation: "Legal Metrology Enforcement Officer"
    };
  }

  return {
    role: "user",
    route: "/consumer",
    badge: "CITIZEN-VERIFIED",
    designation: "Public Consumer Account"
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AuthUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore stored session or listen to Firebase
  useEffect(() => {
    // 1. Initial local session check
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Local session read error:", e);
    }

    // 2. Firebase live auth listener if configured
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser);
        if (fbUser) {
          let firestoreProfile: AuthUserProfile | null = null;
          try {
            firestoreProfile = await getUserProfileFromFirestore(fbUser.uid);
          } catch (e) {
            console.warn("Firestore profile fetch:", e);
          }

          const stored = localStorage.getItem("user");
          const existing = firestoreProfile || (stored ? JSON.parse(stored) : null);
          const { role, route, badge, designation } = determineRole(fbUser.email, existing?.role);

          const profile: AuthUserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || "user@labelcomply.in",
            name: existing?.name || fbUser.displayName || fbUser.email?.split("@")[0] || "User",
            role: existing?.role || role,
            badge: existing?.badge || badge,
            designation: existing?.designation || designation,
            jurisdiction: existing?.jurisdiction,
            employeeCode: existing?.employeeCode,
            officialPhone: existing?.officialPhone,
            statutoryAuthority: existing?.statutoryAuthority,
            photoURL: fbUser.photoURL,
            officerDetails: existing?.officerDetails,
            consumerDetails: existing?.consumerDetails,
            adminDetails: existing?.adminDetails
          };
          setUser(profile);
          localStorage.setItem("user", JSON.stringify(profile));

          // Ensure Firestore has this profile saved
          if (!firestoreProfile) {
            saveUserProfileToFirestore(profile);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, password: string, role?: AccountRole) => {
    setLoading(true);
    try {
      const { role: finalRole, route, badge, designation } = determineRole(email, role);

      if (isFirebaseConfigured && auth) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        const profile: AuthUserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || email,
          name: fbUser.displayName || email.split("@")[0] || "User",
          role: finalRole,
          badge,
          designation,
          photoURL: fbUser.photoURL
        };

        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
        return { user: profile, route };
      } else {
        // Fallback demo/offline authentication
        const profile: AuthUserProfile = {
          uid: `demo-${Date.now()}`,
          email,
          name: email.split("@")[0].toUpperCase(),
          role: finalRole,
          badge,
          designation,
          photoURL: null
        };
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
        return { user: profile, route };
      }
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string, 
    password: string, 
    role: AccountRole, 
    name: string,
    meta?: {
      officer?: Partial<OfficerDetails>;
      consumer?: Partial<ConsumerDetails>;
      admin?: Partial<AdminDetails>;
    }
  ) => {
    setLoading(true);
    try {
      const { role: finalRole, route, badge: defaultBadge, designation: defaultDesig } = determineRole(email, role);

      let finalBadge = defaultBadge;
      let finalDesig = defaultDesig;
      let finalJurisdiction = "All-India Platform";
      let finalEmpCode: string | undefined = undefined;
      let finalPhone: string | undefined = undefined;
      let finalWarrant: string | undefined = undefined;

      if (finalRole === "officer") {
        finalBadge = meta?.officer?.badgeNumber || defaultBadge;
        finalDesig = meta?.officer?.designation || defaultDesig;
        finalJurisdiction = meta?.officer?.jurisdictionZone || "Delhi NCR & Northern Zone";
        finalEmpCode = meta?.officer?.employeeCode || "GOI-EMP-784920";
        finalPhone = meta?.officer?.officialPhone || "+91 98765 43210";
        finalWarrant = meta?.officer?.warrantSection || "Section 15 & 28, Legal Metrology Act 2009";
      } else if (finalRole === "admin") {
        finalBadge = meta?.admin?.centralGovtCode || "IAS-CENT-2016-8942";
        finalDesig = meta?.admin?.adminPost || "Director of Legal Metrology, Govt. of India";
        finalJurisdiction = meta?.admin?.ministryDepartment || "Department of Consumer Affairs (DoCA), Krishi Bhawan";
        finalEmpCode = meta?.admin?.centralGovtCode || "IAS-CENT-2016-8942";
        finalPhone = meta?.admin?.officialExtension || "+91-11-2338-1234 (Krishi Bhawan)";
        finalWarrant = meta?.admin?.securityClearance || "Section 52 Statutory Rule-Making Authority (Root Admin)";
      } else {
        finalBadge = meta?.consumer?.pinCode ? `CITIZEN-PIN-${meta.consumer.pinCode}` : "CITIZEN-VERIFIED";
        finalDesig = meta?.consumer?.consumerCategory ? `Citizen (${meta.consumer.consumerCategory})` : "Citizen Consumer";
        finalJurisdiction = meta?.consumer?.districtCity ? `${meta.consumer.districtCity}, ${meta.consumer.state || 'India'}` : "All-India Consumer Protection";
        finalPhone = meta?.consumer?.mobilePhone || "+91 98112 34567";
        finalWarrant = "Consumer Protection Act 2019 & Section 36 LM Act 2009";
      }

      const profilePayload = {
        name: name || email.split("@")[0] || "User",
        role: finalRole,
        badge: finalBadge,
        designation: finalDesig,
        jurisdiction: finalJurisdiction,
        employeeCode: finalEmpCode,
        officialPhone: finalPhone,
        statutoryAuthority: finalWarrant,
        photoURL: null,
        officerDetails: meta?.officer ? {
          badgeNumber: finalBadge,
          designation: finalDesig,
          jurisdictionZone: finalJurisdiction,
          statePosting: meta.officer.statePosting || "NCT of Delhi",
          employeeCode: finalEmpCode || "GOI-EMP-784920",
          officialPhone: finalPhone || "",
          warrantSection: finalWarrant || "Section 15 & 28, Legal Metrology Act 2009"
        } : undefined,
        consumerDetails: meta?.consumer ? {
          mobilePhone: meta.consumer.mobilePhone || "+91 98112 34567",
          state: meta.consumer.state || "Delhi",
          districtCity: meta.consumer.districtCity || "New Delhi",
          pinCode: meta.consumer.pinCode || "110001",
          consumerCategory: meta.consumer.consumerCategory || "Individual Retail Consumer",
          idProofType: meta.consumer.idProofType || "Aadhaar Card"
        } : undefined,
        adminDetails: meta?.admin ? {
          adminPost: finalDesig,
          ministryDepartment: finalJurisdiction,
          centralGovtCode: finalBadge,
          securityClearance: finalWarrant || "Level 1 - Root Super-Admin",
          officialExtension: finalPhone || "Krishi Bhawan Ext 2338",
          adminSecretKey: meta.admin.adminSecretKey || "LMD-CENTRAL-ROOT-KEY"
        } : undefined
      };

      if (isFirebaseConfigured && auth) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        try {
          await updateProfile(fbUser, { displayName: name });
        } catch (e) {
          console.warn("Could not update profile display name:", e);
        }

        const profile: AuthUserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || email,
          ...profilePayload
        };

        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
        try {
          await saveUserProfileToFirestore(profile);
        } catch (e) {}
        return { user: profile, route };
      } else {
        // Fallback demo registration
        const profile: AuthUserProfile = {
          uid: `demo-${Date.now()}`,
          email,
          ...profilePayload
        };
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
        return { user: profile, route };
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (preferredRole: AccountRole = "user") => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth && googleProvider) {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const { role, route, badge, designation } = determineRole(fbUser.email, preferredRole);

        const profile: AuthUserProfile = {
          uid: fbUser.uid,
          email: fbUser.email || "google-user@gmail.com",
          name: fbUser.displayName || "Google User",
          role,
          badge,
          designation,
          photoURL: fbUser.photoURL
        };

        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
        try {
          await saveUserProfileToFirestore(profile);
        } catch (e) {}
        return { user: profile, route };
      } else {
        // Fallback Google login simulation
        const profile: AuthUserProfile = {
          uid: `google-${Date.now()}`,
          email: "citizen.consumer@gmail.com",
          name: "Verified Google Consumer",
          role: preferredRole,
          badge: "GOOGLE-OAUTH-VERIFIED",
          designation: "Citizen Consumer Account",
          photoURL: null
        };
        const { route } = determineRole(profile.email, preferredRole);
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
        return { user: profile, route };
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await signOut(auth);
      }
    } catch (e) {
      console.error("Firebase signOut error:", e);
    } finally {
      setUser(null);
      setFirebaseUser(null);
      try {
        localStorage.removeItem("user");
        sessionStorage.clear();
      } catch (e) {}
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        isFirebaseReady: isFirebaseConfigured,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
