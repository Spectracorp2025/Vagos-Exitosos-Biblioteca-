import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Publication, Report, ReportStatus, CommunityInfo } from '../types';

const PUBLICATIONS_COLLECTION = 'publications';
const REPORTS_COLLECTION = 'reports';
const COMMUNITY_COLLECTION = 'community';
const COMMUNITY_DOC = 'info';

// Local storage fallback for publications so the app works seamlessly even if offline or before rules propagate
const LOCAL_PUBS_KEY = 'vagos_local_publications';
const LOCAL_REPORTS_KEY = 'vagos_local_reports';


function saveLocalPublications(pubs: Publication[]) {
  try {
    localStorage.setItem(LOCAL_PUBS_KEY, JSON.stringify(pubs));
  } catch (err) {
    console.warn('Could not cache publications locally', err);
  }
}

function getLocalReports(): Report[] {
  try {
    const raw = localStorage.getItem(LOCAL_REPORTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalReports(reports: Report[]) {
  try {
    localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(reports));
  } catch (err) {
    console.warn('Could not cache reports locally', err);
  }
}

// Initial curated community publications to jumpstart the library
// Empty initial publications so the platform is completely clean and ready for real posts
export const INITIAL_COMMUNITY_PUBLICATIONS: Publication[] = [];

function getLocalPublications(): Publication[] {
  try {
    const raw = localStorage.getItem(LOCAL_PUBS_KEY);
    if (!raw) return [];
    const parsed: Publication[] = JSON.parse(raw);
    // Filter out any legacy demo/sample items
    const cleaned = parsed.filter(
      (p) =>
        !p.id.startsWith('pub_gta_') &&
        !p.id.startsWith('pub_god_') &&
        !p.id.startsWith('pub_cyber_') &&
        !p.id.startsWith('pub_termux_')
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(LOCAL_PUBS_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

export const firestoreService = {
  // Subscribe to publications in realtime
  subscribePublications(callback: (pubs: Publication[]) => void): () => void {
    const local = getLocalPublications();
    callback(local);

    try {
      const q = query(collection(db, PUBLICATIONS_COLLECTION), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Publication[] = [];
            snapshot.forEach((d) => {
              const data = d.data() as Publication;
              // Ignore any demo ids
              if (
                !d.id.startsWith('pub_gta_') &&
                !d.id.startsWith('pub_god_') &&
                !d.id.startsWith('pub_cyber_') &&
                !d.id.startsWith('pub_termux_')
              ) {
                list.push({ ...data, id: d.id });
              }
            });
            saveLocalPublications(list);
            callback(list);
          } else {
            const current = getLocalPublications();
            callback(current);
          }
        },
        (error) => {
          console.warn('Firestore subscription fallback to local cache:', error.message);
          callback(getLocalPublications());
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Error setting up onSnapshot for publications:', err);
      return () => {};
    }
  },

  // Create a new publication
  async createPublication(pub: Omit<Publication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Publication> {
    const id = 'pub_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();
    const newPub: Publication = {
      ...pub,
      id,
      createdAt: now,
      updatedAt: now,
    };

    // Update local cache immediately for responsive feel
    const current = getLocalPublications();
    const updated = [newPub, ...current];
    saveLocalPublications(updated);

    // Persist to Firestore
    try {
      const docRef = doc(db, PUBLICATIONS_COLLECTION, id);
      await setDoc(docRef, newPub);
    } catch (error) {
      console.warn('Firestore save failed, stored locally:', error);
      // We don't block the user, error will be logged with handleFirestoreError if needed
    }

    return newPub;
  },

  // Update publication
  async updatePublication(id: string, updates: Partial<Publication>): Promise<void> {
    const current = getLocalPublications();
    const idx = current.findIndex((p) => p.id === id);
    if (idx !== -1) {
      current[idx] = {
        ...current[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveLocalPublications(current);
    }

    try {
      const docRef = doc(db, PUBLICATIONS_COLLECTION, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.warn('Firestore update failed, updated locally:', error);
    }
  },

  // Delete publication
  async deletePublication(id: string): Promise<void> {
    const current = getLocalPublications();
    const filtered = current.filter((p) => p.id !== id);
    saveLocalPublications(filtered);

    try {
      const docRef = doc(db, PUBLICATIONS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.warn('Firestore delete failed, removed locally:', error);
    }
  },

  // Subscribe to reports
  subscribeReports(userId: string | null, isAdmin: boolean, callback: (reports: Report[]) => void): () => void {
    const local = getLocalReports();
    const filteredLocal = isAdmin ? local : local.filter((r) => r.userId === userId);
    callback(filteredLocal);

    try {
      const q = query(collection(db, REPORTS_COLLECTION), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: Report[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as Report;
            list.push({ ...data, id: d.id });
          });
          saveLocalReports(list);
          const filtered = isAdmin ? list : list.filter((r) => r.userId === userId);
          callback(filtered);
        },
        (error) => {
          console.warn('Firestore reports subscription fallback to local cache:', error.message);
          callback(filteredLocal);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Error setting up onSnapshot for reports:', err);
      return () => {};
    }
  },

  // Create report
  async createReport(reportData: Omit<Report, 'id' | 'status' | 'createdAt'>): Promise<Report> {
    const id = 'rep_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();
    const newReport: Report = {
      ...reportData,
      id,
      status: 'pendiente',
      createdAt: now,
      updatedAt: now,
    };

    const current = getLocalReports();
    const updated = [newReport, ...current];
    saveLocalReports(updated);

    try {
      const docRef = doc(db, REPORTS_COLLECTION, id);
      await setDoc(docRef, newReport);
    } catch (error) {
      console.warn('Firestore report save failed, cached locally:', error);
    }

    return newReport;
  },

  // Update report status (admin)
  async updateReportStatus(reportId: string, status: ReportStatus, adminNotes?: string): Promise<void> {
    const current = getLocalReports();
    const idx = current.findIndex((r) => r.id === reportId);
    if (idx !== -1) {
      current[idx].status = status;
      if (adminNotes !== undefined) current[idx].adminNotes = adminNotes;
      current[idx].updatedAt = new Date().toISOString();
      saveLocalReports(current);
    }

    try {
      const docRef = doc(db, REPORTS_COLLECTION, reportId);
      const payload: any = { status, updatedAt: new Date().toISOString() };
      if (adminNotes !== undefined) payload.adminNotes = adminNotes;
      await updateDoc(docRef, payload);
    } catch (error) {
      console.warn('Firestore report update failed, updated locally:', error);
    }
  },

  // Get single publication
  async getPublication(id: string): Promise<Publication | null> {
    const local = getLocalPublications();
    const found = local.find((p) => p.id === id);
    if (found) return found;

    try {
      const docRef = doc(db, PUBLICATIONS_COLLECTION, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { ...(snapshot.data() as Publication), id: snapshot.id };
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `${PUBLICATIONS_COLLECTION}/${id}`);
    }
    return null;
  },
};
