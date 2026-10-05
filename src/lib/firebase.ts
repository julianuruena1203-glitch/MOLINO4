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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

// Test initial connection
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'project_meta', 'connection_test'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client is currently offline or connecting.");
    }
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
export const saveAllPointsToFirebase = async (points: MeasurementPoint[]): Promise<void> => {
  const chunkSize = 400;
  for (let i = 0; i < points.length; i += chunkSize) {
    const chunk = points.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach(point => {
      const docRef = doc(db, 'points', point.id);
      batch.set(docRef, cleanForFirestore(point), { merge: true });
    });
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'points');
      throw error;
    }
  }

  try {
    await setDoc(doc(db, 'project_meta', 'sync'), {
      lastSynced: new Date().toISOString(),
      totalPoints: points.length
    }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'project_meta/sync');
  }
};

export const saveSinglePointToFirebase = async (point: MeasurementPoint): Promise<void> => {
  const docRef = doc(db, 'points', point.id);
  try {
    await setDoc(docRef, cleanForFirestore(point), { merge: true });
    await setDoc(doc(db, 'project_meta', 'sync'), {
      lastSynced: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `points/${point.id}`);
    throw error;
  }
};

export const deletePointFromFirebase = async (pointId: string): Promise<void> => {
  const docRef = doc(db, 'points', pointId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `points/${pointId}`);
    throw error;
  }
};

export const deleteMultiplePointsFromFirebase = async (pointIds: string[]): Promise<void> => {
  const chunkSize = 400;
  for (let i = 0; i < pointIds.length; i += chunkSize) {
    const chunk = pointIds.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach(id => {
      const docRef = doc(db, 'points', id);
      batch.delete(docRef);
    });
    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'points');
      throw error;
    }
  }
};

export const loadPointsFromFirebase = async (): Promise<MeasurementPoint[] | null> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'points'));
    if (querySnapshot.empty) {
      return null;
    }
    const points: MeasurementPoint[] = [];
    querySnapshot.forEach(docSnap => {
      points.push(docSnap.data() as MeasurementPoint);
    });
    return points;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'points');
    return null;
  }
};

// -------------------------------------------------------------
// Materials API
// -------------------------------------------------------------
export const saveAllMaterialsToFirebase = async (materials: MaterialItem[]): Promise<void> => {
  const batch = writeBatch(db);
  materials.forEach(mat => {
    const docRef = doc(db, 'materials', mat.id);
    batch.set(docRef, cleanForFirestore(mat), { merge: true });
  });
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'materials');
    throw error;
  }
};

export const loadMaterialsFromFirebase = async (): Promise<MaterialItem[] | null> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'materials'));
    if (querySnapshot.empty) {
      return null;
    }
    const materials: MaterialItem[] = [];
    querySnapshot.forEach(docSnap => {
      materials.push(docSnap.data() as MaterialItem);
    });
    return materials;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'materials');
    return null;
  }
};

// -------------------------------------------------------------
// Costs API
// -------------------------------------------------------------
export const saveAllCostsToFirebase = async (costs: CostCategory[]): Promise<void> => {
  const batch = writeBatch(db);
  costs.forEach(cost => {
    const docRef = doc(db, 'costs', cost.id);
    batch.set(docRef, cleanForFirestore(cost), { merge: true });
  });
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'costs');
    throw error;
  }
};

export const loadCostsFromFirebase = async (): Promise<CostCategory[] | null> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'costs'));
    if (querySnapshot.empty) {
      return null;
    }
    const costs: CostCategory[] = [];
    querySnapshot.forEach(docSnap => {
      costs.push(docSnap.data() as CostCategory);
    });
    return costs;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'costs');
    return null;
  }
};

// -------------------------------------------------------------
// Junction Boxes API
// -------------------------------------------------------------
export const saveAllBoxesToFirebase = async (boxes: JunctionBox[]): Promise<void> => {
  const batch = writeBatch(db);
  boxes.forEach(box => {
    const docRef = doc(db, 'junction_boxes', box.id);
    batch.set(docRef, cleanForFirestore(box), { merge: true });
  });
  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'junction_boxes');
    throw error;
  }
};

export const loadBoxesFromFirebase = async (): Promise<JunctionBox[] | null> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'junction_boxes'));
    if (querySnapshot.empty) {
      return null;
    }
    const boxes: JunctionBox[] = [];
    querySnapshot.forEach(docSnap => {
      boxes.push(docSnap.data() as JunctionBox);
    });
    return boxes;
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
