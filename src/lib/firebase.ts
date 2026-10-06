/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDocFromServer,
  writeBatch, 
  onSnapshot, 
  setDoc,
  deleteDoc,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { MeasurementPoint, MaterialItem, CostCategory, JunctionBox } from '../types';

// Initialize Firebase App singleton
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with specific database ID if provided in config
export const db: Firestore = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId.trim() !== '' && firebaseConfig.firestoreDatabaseId !== '(default)') 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId) 
  : getFirestore(app);

// Error logging handler compliant with FirestoreErrorInfo standard
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

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

// Quota exhaustion tracking and circuit-breaker
const QUOTA_EXHAUSTED_KEY = 'vib_monitor_firestore_quota_exhausted';

export const isQuotaError = (error: unknown): boolean => {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;
  return (
    code === 'resource-exhausted' ||
    msg.includes('resource-exhausted') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('Quota exceeded') ||
    msg.includes('Free daily write units')
  );
};

export const isQuotaExhausted = (): boolean => {
  try {
    const val = localStorage.getItem(QUOTA_EXHAUSTED_KEY);
    if (!val) return false;
    const { timestamp } = JSON.parse(val);
    // Quota resets daily (~24h, verify within 8h window)
    if (Date.now() - timestamp < 8 * 60 * 60 * 1000) {
      return true;
    }
    localStorage.removeItem(QUOTA_EXHAUSTED_KEY);
    return false;
  } catch {
    return false;
  }
};

export const markQuotaExhausted = () => {
  try {
    localStorage.setItem(QUOTA_EXHAUSTED_KEY, JSON.stringify({ timestamp: Date.now() }));
    console.info('Firestore: Modo almacenamiento local activo (cuota diaria alcanzada). Datos preservados localmente.');
  } catch {}
};

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  if (isQuotaError(error)) {
    markQuotaExhausted();
  }
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  if (!isQuotaError(error)) {
    console.error('Firestore Error: ', JSON.stringify(errInfo));
  } else {
    console.warn('Firestore Quota Notice: Almacenamiento local activo por límite diario gratuito de escrituras.');
  }
  return errInfo;
}

// Test initial connection with timeout
export async function testConnection(timeoutMs = 2500): Promise<boolean> {
  try {
    const testPromise = getDocs(collection(db, 'project_meta'));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase connection timeout')), timeoutMs)
    );
    await Promise.race([testPromise, timeoutPromise]);
    return true;
  } catch (error) {
    console.warn("Firebase connection test warning:", error);
    return false;
  }
}

// Helper to remove undefined fields which Firestore rejects
export function cleanForFirestore<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = Array.isArray(obj) ? [] : {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === undefined) {
      continue;
    } else if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
      cleaned[key] = cleanForFirestore(val);
    } else {
      cleaned[key] = val;
    }
  }
  return cleaned;
}

// -------------------------------------------------------------
// Points API
// -------------------------------------------------------------
export const saveAllPointsToFirebase = async (
  points: MeasurementPoint[], 
  timeoutMs = 8000,
  forceAttempt = false
): Promise<void> => {
  if (isQuotaExhausted() && !forceAttempt) {
    return;
  }
  try {
    const savePromise = (async () => {
      const chunkSize = 400;
      for (let i = 0; i < points.length; i += chunkSize) {
        const chunk = points.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach(point => {
          const docRef = doc(db, 'points', point.id);
          batch.set(docRef, cleanForFirestore(point), { merge: true });
        });
        await batch.commit();
      }

      try {
        await setDoc(doc(db, 'project_meta', 'sync'), {
          lastSynced: new Date().toISOString(),
          totalPoints: points.length
        }, { merge: true });
      } catch (err) {
        if (isQuotaError(err)) {
          markQuotaExhausted();
        }
      }

      // Success! Clear quota flag if it was set
      try {
        localStorage.removeItem(QUOTA_EXHAUSTED_KEY);
      } catch {}
    })();

    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Sincronización excedió el tiempo límite (8s)')), timeoutMs)
    );

    await Promise.race([savePromise, timeoutPromise]);
  } catch (err) {
    if (isQuotaError(err)) {
      markQuotaExhausted();
      return;
    }
    console.warn('saveAllPointsToFirebase note:', err);
  }
};

export const saveSinglePointToFirebase = async (point: MeasurementPoint): Promise<void> => {
  if (isQuotaExhausted()) {
    return;
  }
  const docRef = doc(db, 'points', point.id);
  try {
    await setDoc(docRef, cleanForFirestore(point), { merge: true });
    try {
      localStorage.removeItem(QUOTA_EXHAUSTED_KEY);
      await setDoc(doc(db, 'project_meta', 'sync'), {
        lastSynced: new Date().toISOString()
      }, { merge: true });
    } catch {}
  } catch (error) {
    if (isQuotaError(error)) {
      markQuotaExhausted();
      return;
    }
    handleFirestoreError(error, OperationType.WRITE, `points/${point.id}`);
  }
};

export const deletePointFromFirebase = async (pointId: string): Promise<void> => {
  if (isQuotaExhausted()) {
    return;
  }
  const docRef = doc(db, 'points', pointId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    if (isQuotaError(error)) {
      markQuotaExhausted();
      return;
    }
    handleFirestoreError(error, OperationType.DELETE, `points/${pointId}`);
  }
};

export const deleteMultiplePointsFromFirebase = async (pointIds: string[]): Promise<void> => {
  if (isQuotaExhausted()) {
    return;
  }
  try {
    const chunkSize = 400;
    for (let i = 0; i < pointIds.length; i += chunkSize) {
      const chunk = pointIds.slice(i, i + chunkSize);
      const batch = writeBatch(db);
      chunk.forEach(id => {
        const docRef = doc(db, 'points', id);
        batch.delete(docRef);
      });
      await batch.commit();
    }
  } catch (error) {
    if (isQuotaError(error)) {
      markQuotaExhausted();
      return;
    }
    handleFirestoreError(error, OperationType.DELETE, 'points');
  }
};

export const loadPointsFromFirebase = async (timeoutMs = 5000): Promise<MeasurementPoint[] | null> => {
  try {
    const fetchPromise = (async () => {
      const querySnapshot = await getDocs(collection(db, 'points'));
      if (querySnapshot.empty) {
        return null;
      }
      const points: MeasurementPoint[] = [];
      querySnapshot.forEach(docSnap => {
        points.push(docSnap.data() as MeasurementPoint);
      });
      return points;
    })();

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), timeoutMs)
    );

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'points');
    return null;
  }
};

// -------------------------------------------------------------
// Materials API
// -------------------------------------------------------------
export const saveAllMaterialsToFirebase = async (materials: MaterialItem[], timeoutMs = 6000): Promise<void> => {
  if (isQuotaExhausted()) {
    return;
  }
  try {
    const savePromise = (async () => {
      const batch = writeBatch(db);
      materials.forEach(mat => {
        const docRef = doc(db, 'materials', mat.id);
        batch.set(docRef, cleanForFirestore(mat), { merge: true });
      });
      try {
        await batch.commit();
      } catch (error) {
        if (isQuotaError(error)) {
          markQuotaExhausted();
          return;
        }
        handleFirestoreError(error, OperationType.WRITE, 'materials');
        throw error;
      }
    })();

    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Sincronización materiales agotada')), timeoutMs)
    );

    await Promise.race([savePromise, timeoutPromise]);
  } catch (err) {
    if (isQuotaError(err)) {
      markQuotaExhausted();
      return;
    }
    console.warn('saveAllMaterialsToFirebase note:', err);
  }
};

export const loadMaterialsFromFirebase = async (timeoutMs = 5000): Promise<MaterialItem[] | null> => {
  try {
    const fetchPromise = (async () => {
      const querySnapshot = await getDocs(collection(db, 'materials'));
      if (querySnapshot.empty) {
        return null;
      }
      const materials: MaterialItem[] = [];
      querySnapshot.forEach(docSnap => {
        materials.push(docSnap.data() as MaterialItem);
      });
      return materials;
    })();

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), timeoutMs)
    );

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'materials');
    return null;
  }
};

// -------------------------------------------------------------
// Costs API
// -------------------------------------------------------------
export const saveAllCostsToFirebase = async (costs: CostCategory[], timeoutMs = 6000): Promise<void> => {
  if (isQuotaExhausted()) {
    return;
  }
  try {
    const savePromise = (async () => {
      const batch = writeBatch(db);
      costs.forEach(cost => {
        const docRef = doc(db, 'costs', cost.id);
        batch.set(docRef, cleanForFirestore(cost), { merge: true });
      });
      try {
        await batch.commit();
      } catch (error) {
        if (isQuotaError(error)) {
          markQuotaExhausted();
          return;
        }
        handleFirestoreError(error, OperationType.WRITE, 'costs');
        throw error;
      }
    })();

    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Sincronización costos agotada')), timeoutMs)
    );

    await Promise.race([savePromise, timeoutPromise]);
  } catch (err) {
    if (isQuotaError(err)) {
      markQuotaExhausted();
      return;
    }
    console.warn('saveAllCostsToFirebase note:', err);
  }
};

export const loadCostsFromFirebase = async (timeoutMs = 5000): Promise<CostCategory[] | null> => {
  try {
    const fetchPromise = (async () => {
      const querySnapshot = await getDocs(collection(db, 'costs'));
      if (querySnapshot.empty) {
        return null;
      }
      const costs: CostCategory[] = [];
      querySnapshot.forEach(docSnap => {
        costs.push(docSnap.data() as CostCategory);
      });
      return costs;
    })();

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), timeoutMs)
    );

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'costs');
    return null;
  }
};

// -------------------------------------------------------------
// Junction Boxes API
// -------------------------------------------------------------
export const saveAllBoxesToFirebase = async (boxes: JunctionBox[], timeoutMs = 6000): Promise<void> => {
  if (isQuotaExhausted()) {
    return;
  }
  try {
    const savePromise = (async () => {
      const batch = writeBatch(db);
      boxes.forEach(box => {
        const docRef = doc(db, 'junction_boxes', box.id);
        batch.set(docRef, cleanForFirestore(box), { merge: true });
      });
      try {
        await batch.commit();
      } catch (error) {
        if (isQuotaError(error)) {
          markQuotaExhausted();
          return;
        }
        handleFirestoreError(error, OperationType.WRITE, 'junction_boxes');
        throw error;
      }
    })();

    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Sincronización cajas agotada')), timeoutMs)
    );

    await Promise.race([savePromise, timeoutPromise]);
  } catch (err) {
    if (isQuotaError(err)) {
      markQuotaExhausted();
      return;
    }
    console.warn('saveAllBoxesToFirebase note:', err);
  }
};

export const loadBoxesFromFirebase = async (timeoutMs = 5000): Promise<JunctionBox[] | null> => {
  try {
    const fetchPromise = (async () => {
      const querySnapshot = await getDocs(collection(db, 'junction_boxes'));
      if (querySnapshot.empty) {
        return null;
      }
      const boxes: JunctionBox[] = [];
      querySnapshot.forEach(docSnap => {
        boxes.push(docSnap.data() as JunctionBox);
      });
      return boxes;
    })();

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), timeoutMs)
    );

    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'junction_boxes');
    return null;
  }
};

// -------------------------------------------------------------
// Real-time synchronization listeners
// -------------------------------------------------------------
export const subscribeToPoints = (
  callback: (points: MeasurementPoint[]) => void,
  onError?: (err: unknown) => void
) => {
  return onSnapshot(
    collection(db, 'points'),
    (snapshot) => {
      if (!snapshot.empty) {
        const items: MeasurementPoint[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as MeasurementPoint);
        });
        callback(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'points');
      if (onError) onError(error);
    }
  );
};

export const subscribeToMaterials = (
  callback: (materials: MaterialItem[]) => void,
  onError?: (err: unknown) => void
) => {
  return onSnapshot(
    collection(db, 'materials'),
    (snapshot) => {
      if (!snapshot.empty) {
        const items: MaterialItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as MaterialItem);
        });
        callback(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'materials');
      if (onError) onError(error);
    }
  );
};

export const subscribeToBoxes = (
  callback: (boxes: JunctionBox[]) => void,
  onError?: (err: unknown) => void
) => {
  return onSnapshot(
    collection(db, 'junction_boxes'),
    (snapshot) => {
      if (!snapshot.empty) {
        const items: JunctionBox[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as JunctionBox);
        });
        callback(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'junction_boxes');
      if (onError) onError(error);
    }
  );
};

export const subscribeToCosts = (
  callback: (costs: CostCategory[]) => void,
  onError?: (err: unknown) => void
) => {
  return onSnapshot(
    collection(db, 'costs'),
    (snapshot) => {
      if (!snapshot.empty) {
        const items: CostCategory[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as CostCategory);
        });
        callback(items);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, 'costs');
      if (onError) onError(error);
    }
  );
};
