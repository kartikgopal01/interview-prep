import { interviewCovers, mappings } from "@/constants";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { auth } from "@/firebase/client";
import { signOut as firebaseSignOut } from "firebase/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Comprehensive sign-out function that clears all login cache and authentication state
 * This should be used consistently across the application for signing out
 */
export async function signOut(): Promise<void> {
  try {
    // 1. Sign out from Firebase client auth
    await firebaseSignOut(auth);
    
    // 2. Clear session cookie
    document.cookie = 'session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    
    // 3. Clear all localStorage data
    localStorage.clear();
    
    // 4. Clear all sessionStorage data  
    sessionStorage.clear();
    
    // 5. Clear any cached API responses in browser cache
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
    
    // 6. Clear IndexedDB data (Firebase uses this for offline persistence)
    if ('indexedDB' in window) {
      try {
        // Clear Firebase-related IndexedDB databases
        const dbs = ['firebase-app-check-database', 'firebase-installations-database', 'firebaseLocalStorageDb'];
        for (const dbName of dbs) {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          deleteReq.onerror = () => console.warn(`Failed to delete IndexedDB: ${dbName}`);
        }
      } catch (error) {
        console.warn('Failed to clear IndexedDB:', error);
      }
    }
    
    // 7. Force a hard redirect to clear any remaining state
    window.location.href = '/sign-in';
  } catch (error) {
    console.error('Sign out error:', error);
    // Fallback: still redirect even if cleanup fails
    window.location.href = '/sign-in';
  }
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok; // Returns true if the icon exists
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const randomIndex = Math.floor(Math.random() * interviewCovers.length);
  return `/covers${interviewCovers[randomIndex]}`;
};
