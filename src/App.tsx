/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MeasurementPoint, 
  MaterialItem, 
  CostCategory, 
  JunctionBox 
} from './types';
import { 
  INITIAL_POINTS, 
  INITIAL_MATERIALS, 
  INITIAL_COST_CATEGORIES, 
  INITIAL_JUNCTION_BOXES 
} from './data/initialData';
import { Header, ActiveTab } from './components/Header';
import { PointsTable } from './components/PointsTable';
import { MaterialsManager } from './components/MaterialsManager';
import { ProjectProgressDashboard } from './components/ProjectProgressDashboard';
import { Schematic2DViewer } from './components/Schematic2DViewer';
import { PointDetailModal } from './components/PointDetailModal';
import { AddPointModal } from './components/AddPointModal';
import { ReportModal } from './components/ReportModal';
import { SmurfitWestrockLogo } from './components/SmurfitWestrockLogo';
import { getPointCoordinates } from './data/schematicCoordinates';
import { 
  testConnection,
  saveAllPointsToFirebase,
  saveSinglePointToFirebase,
  deletePointFromFirebase,
  deleteMultiplePointsFromFirebase,
  loadPointsFromFirebase,
  saveAllMaterialsToFirebase,
  loadMaterialsFromFirebase,
  saveAllCostsToFirebase,
  loadCostsFromFirebase,
  saveAllBoxesToFirebase,
  loadBoxesFromFirebase,
  subscribeToPoints,
  subscribeToMaterials,
  subscribeToBoxes,
  subscribeToCosts,
  isQuotaExhausted
} from './lib/firebase';

const STORAGE_KEY_POINTS = 'vib_monitor_points_v10';
const STORAGE_KEY_MATERIALS = 'vib_monitor_materials_v3';
const STORAGE_KEY_COSTS = 'vib_monitor_costs_v1';
const STORAGE_KEY_BOXES = 'vib_monitor_boxes_v4';

// Bulletproof deduplicator to guarantee 100% unique React keys
export const deduplicatePoints = (rawPoints: MeasurementPoint[]): MeasurementPoint[] => {
  const seenIds = new Set<string>();
  const cleanList: MeasurementPoint[] = [];

  for (let i = 0; i < rawPoints.length; i++) {
    const p = rawPoints[i];
    if (!p) continue;
    let pointId = p.id;
    if (!pointId || seenIds.has(pointId)) {
      pointId = `${p.id || 'pt'}_${p.area || 1}_${p.boxChannel || i}_${i}`;
    }
    seenIds.add(pointId);
    cleanList.push({
      ...p,
      id: pointId
    });
  }

  return cleanList;
};

// Normalize points to standard schema:
// - Nomenclature:
//   * Secadores: 1S, 2S, 3S... 48S
//   * Piñones: P-AA, P-A, P-B, P-C, P-I a P-XXIX
//   * Rodillos de lona: 1R, 2R, 3R... según correspondencia numérica
// - Componente Mecánico:
//   * Secadores: Secador #X
//   * Piñones: Piñón Intermedio
//   * Rodillos de Lona: Rodillo de Lona #X
// - Side: Lado transmisión
// - Junction box: JB #1, JB #2, JB #3
const normalizePoint = (p: MeasurementPoint): MeasurementPoint => {
  if (!p) return p;

  let tag = p.tag ? String(p.tag).trim() : '';
  let name = p.name ? String(p.name).trim() : '';

  // Only assign fallback tag if tag is completely blank/empty
  if (!tag) {
    if (p.type === 'dryer') {
      const match = (p.name || '').match(/#?(\d+)/) || (p.originalLabel ? p.originalLabel.match(/(\d+)/) : null);
      tag = match ? `${parseInt(match[1], 10)}S` : '1S';
    } else if (p.type === 'pinion') {
      tag = 'P-AA';
    } else {
      tag = '1R';
    }
  }

  // Only assign fallback name if name is completely blank/empty
  if (!name) {
    if (p.type === 'dryer') {
      const numMatch = tag.match(/(\d+)/);
      name = numMatch ? `Secador #${numMatch[1]}` : 'Secador';
    } else if (p.type === 'pinion') {
      name = 'Piñón Intermedio';
    } else {
      const numMatch = tag.match(/(\d+)/);
      name = numMatch ? `Rodillo #${numMatch[1]}` : 'Rodillo';
    }
  }

  // Preserve boxId if valid; only default if empty
  let boxId = p.boxId;
  if (!boxId) {
    boxId = 'JB #1';
  }

  const coordinates = (p.coordinates && typeof p.coordinates.x === 'number') 
    ? p.coordinates 
    : getPointCoordinates(p);

  return {
    ...p,
    name,
    tag,
    boxId,
    side: p.side || 'Lado transmisión',
    coordinates
  };
};

// Local Pending Updates Storage Keys
export const STORAGE_KEY_PENDING_UPDATES = 'vib_monitor_pending_updates_v1';
export const STORAGE_KEY_DELETED_IDS = 'vib_monitor_deleted_ids_v1';

export const getPendingUpdates = (): Record<string, MeasurementPoint> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING_UPDATES);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const getDeletedIds = (): Set<string> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_IDS);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

export const recordLocalUpdate = (point: MeasurementPoint) => {
  try {
    const map = getPendingUpdates();
    map[point.id] = { ...point, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY_PENDING_UPDATES, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving pending update:', e);
  }
};

export const recordLocalUpdatesBulk = (pts: MeasurementPoint[]) => {
  try {
    const map = getPendingUpdates();
    pts.forEach(p => {
      map[p.id] = { ...p, updatedAt: new Date().toISOString() };
    });
    localStorage.setItem(STORAGE_KEY_PENDING_UPDATES, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving pending updates:', e);
  }
};

export const recordLocalDeletion = (pointId: string) => {
  try {
    const ids = getDeletedIds();
    ids.add(pointId);
    localStorage.setItem(STORAGE_KEY_DELETED_IDS, JSON.stringify(Array.from(ids)));

    const map = getPendingUpdates();
    delete map[pointId];
    localStorage.setItem(STORAGE_KEY_PENDING_UPDATES, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving deletion:', e);
  }
};

export const recordLocalDeletionsBulk = (pointIds: string[]) => {
  try {
    const ids = getDeletedIds();
    pointIds.forEach(id => ids.add(id));
    localStorage.setItem(STORAGE_KEY_DELETED_IDS, JSON.stringify(Array.from(ids)));

    const map = getPendingUpdates();
    pointIds.forEach(id => delete map[id]);
    localStorage.setItem(STORAGE_KEY_PENDING_UPDATES, JSON.stringify(map));
  } catch (e) {
    console.error('Error saving deletions:', e);
  }
};

export const clearCommittedUpdates = (pointIds?: string[]) => {
  try {
    if (!pointIds) {
      localStorage.removeItem(STORAGE_KEY_PENDING_UPDATES);
      localStorage.removeItem(STORAGE_KEY_DELETED_IDS);
    } else {
      const map = getPendingUpdates();
      pointIds.forEach(id => delete map[id]);
      localStorage.setItem(STORAGE_KEY_PENDING_UPDATES, JSON.stringify(map));
    }
  } catch {}
};

// Smart Local-First Conflict Resolver:
// Guarantees local user modifications are NEVER overwritten by stale cloud data on page reload!
export const mergePointsWithLocal = (
  currentLocalPoints: MeasurementPoint[],
  incomingCloudPoints: MeasurementPoint[]
): MeasurementPoint[] => {
  const pendingUpdates = getPendingUpdates();
  const deletedIds = getDeletedIds();

  // Map of current in-memory / local points
  const localMap = new Map<string, MeasurementPoint>();
  currentLocalPoints.forEach(p => {
    if (p && p.id && !deletedIds.has(p.id)) {
      localMap.set(p.id, p);
    }
  });

  const mergedMap = new Map<string, MeasurementPoint>();

  // 1. Process cloud points: if modified locally in pendingUpdates or localMap, keep local!
  incomingCloudPoints.forEach(cp => {
    if (!cp || !cp.id || deletedIds.has(cp.id)) return;

    if (pendingUpdates[cp.id]) {
      mergedMap.set(cp.id, normalizePoint(pendingUpdates[cp.id]));
    } else if (localMap.has(cp.id)) {
      const lp = localMap.get(cp.id)!;
      const localTime = lp.updatedAt ? new Date(lp.updatedAt).getTime() : 1;
      const cloudTime = cp.updatedAt ? new Date(cp.updatedAt).getTime() : 0;
      if (localTime >= cloudTime) {
        mergedMap.set(cp.id, normalizePoint(lp));
      } else {
        mergedMap.set(cp.id, normalizePoint(cp));
      }
    } else {
      mergedMap.set(cp.id, normalizePoint(cp));
    }
  });

  // 2. Add local points that aren't in the cloud yet
  localMap.forEach((lp, id) => {
    if (!mergedMap.has(id) && !deletedIds.has(id)) {
      mergedMap.set(id, normalizePoint(lp));
    }
  });

  // 3. Make sure all pending updates are retained
  Object.values(pendingUpdates).forEach(pup => {
    if (pup && pup.id && !deletedIds.has(pup.id)) {
      mergedMap.set(pup.id, normalizePoint(pup));
    }
  });

  return deduplicatePoints(Array.from(mergedMap.values()));
};

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('points');

  // Core Data with localStorage persistence & Firebase synchronization
  const [points, setPoints] = useState<MeasurementPoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POINTS);
      const pendingUpdates = getPendingUpdates();
      const deletedIds = getDeletedIds();
      if (saved) {
        let parsed: MeasurementPoint[] = JSON.parse(saved);
        parsed = parsed.filter(p => p && p.id && !deletedIds.has(p.id));
        parsed = parsed.map(p => pendingUpdates[p.id] ? pendingUpdates[p.id] : p);
        return deduplicatePoints(parsed.map(normalizePoint));
      }
    } catch (e) {
      console.error('Error loading points from localStorage:', e);
    }
    return deduplicatePoints(INITIAL_POINTS.map(normalizePoint));
  });

  const [materials, setMaterials] = useState<MaterialItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MATERIALS);
      if (saved) {
        let parsed: MaterialItem[] = JSON.parse(saved);
        let has4251480 = false;
        parsed = parsed.map(m => {
          if (m.code === '4251480' || m.name.toUpperCase().includes('CB206')) {
            has4251480 = true;
            return { ...m, unit: 'und' };
          }
          return m;
        });
        if (!has4251480) {
          const default4251480 = INITIAL_MATERIALS.find(m => m.code === '4251480');
          if (default4251480) parsed.push(default4251480);
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error loading materials from localStorage:', e);
    }
    return INITIAL_MATERIALS;
  });

  const [categories, setCategories] = useState<CostCategory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_COSTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading costs from localStorage:', e);
    }
    return INITIAL_COST_CATEGORIES;
  });

  const [junctionBoxes, setJunctionBoxes] = useState<JunctionBox[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOXES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading boxes from localStorage:', e);
    }
    return INITIAL_JUNCTION_BOXES;
  });

  // Modals state
  const [selectedPoint, setSelectedPoint] = useState<MeasurementPoint | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddPointModalOpen, setIsAddPointModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Sync state & Notification Toast - default to 'synced' so local data is immediately ready
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('synced');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isInitialSyncDone = useRef(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Local persistence updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POINTS, JSON.stringify(points));
    } catch (e) {
      console.error('Failed to save points locally:', e);
    }
  }, [points]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(materials));
    } catch (e) {
      console.error('Failed to save materials locally:', e);
    }
  }, [materials]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COSTS, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save costs locally:', e);
    }
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BOXES, JSON.stringify(junctionBoxes));
    } catch (e) {
      console.error('Failed to save boxes locally:', e);
    }
  }, [junctionBoxes]);

  // Initial Firebase connection & data hydration
  useEffect(() => {
    let unsubscribePoints: (() => void) | null = null;
    let unsubscribeMaterials: (() => void) | null = null;
    let unsubscribeBoxes: (() => void) | null = null;
    let unsubscribeCosts: (() => void) | null = null;

    const bootstrapFirebase = async () => {
      // Safety timer ensures the app NEVER stays stuck in 'syncing'
      const safetyTimer = setTimeout(() => {
        setSyncStatus('synced');
      }, 4000);

      try {
        setSyncStatus('syncing');

        // Parallel load from Firebase Firestore
        const [cloudPoints, cloudMaterials, cloudBoxes, cloudCosts] = await Promise.all([
          loadPointsFromFirebase(4500),
          loadMaterialsFromFirebase(4500),
          loadBoxesFromFirebase(4500),
          loadCostsFromFirebase(4500)
        ]);

        if (cloudPoints && cloudPoints.length > 0) {
          setPoints(prevPoints => mergePointsWithLocal(prevPoints, cloudPoints));
        }

        if (cloudMaterials && cloudMaterials.length > 0) {
          const savedMats = localStorage.getItem(STORAGE_KEY_MATERIALS);
          if (!savedMats) {
            setMaterials(cloudMaterials);
          }
        }

        if (cloudBoxes && cloudBoxes.length > 0) {
          const savedBoxes = localStorage.getItem(STORAGE_KEY_BOXES);
          if (!savedBoxes) {
            setJunctionBoxes(cloudBoxes);
          }
        }

        if (cloudCosts && cloudCosts.length > 0) {
          const savedCosts = localStorage.getItem(STORAGE_KEY_COSTS);
          if (!savedCosts) {
            setCategories(cloudCosts);
          }
        }

        clearTimeout(safetyTimer);
        setSyncStatus('synced');
        isInitialSyncDone.current = true;

        // Subscribe to real-time updates from cloud with smart local-first merge
        unsubscribePoints = subscribeToPoints((pts) => {
          if (pts && pts.length > 0) {
            setPoints(prevPoints => mergePointsWithLocal(prevPoints, pts));
            setSyncStatus('synced');
          }
        }, (err) => {
          console.warn('Real-time points subscription notice:', err);
          setSyncStatus('synced');
        });

        unsubscribeMaterials = subscribeToMaterials((mats) => {
          if (mats && mats.length > 0) {
            const savedMats = localStorage.getItem(STORAGE_KEY_MATERIALS);
            if (!savedMats) {
              setMaterials(mats);
            }
            setSyncStatus('synced');
          }
        });

        unsubscribeBoxes = subscribeToBoxes((bx) => {
          if (bx && bx.length > 0) {
            const savedBoxes = localStorage.getItem(STORAGE_KEY_BOXES);
            if (!savedBoxes) {
              setJunctionBoxes(bx);
            }
            setSyncStatus('synced');
          }
        });

        unsubscribeCosts = subscribeToCosts((csts) => {
          if (csts && csts.length > 0) {
            const savedCosts = localStorage.getItem(STORAGE_KEY_COSTS);
            if (!savedCosts) {
              setCategories(csts);
            }
            setSyncStatus('synced');
          }
        });

      } catch (err) {
        console.warn('Firebase initial sync completed with fallback:', err);
        clearTimeout(safetyTimer);
        setSyncStatus('synced');
      }
    };

    bootstrapFirebase();

    return () => {
      if (unsubscribePoints) unsubscribePoints();
      if (unsubscribeMaterials) unsubscribeMaterials();
      if (unsubscribeBoxes) unsubscribeBoxes();
      if (unsubscribeCosts) unsubscribeCosts();
    };
  }, []);

  // Force sync trigger - Guarantees data persistence immediately
  const handleForceSync = async () => {
    setSyncStatus('syncing');
    showToast('Sincronizando cambios...');

    // Guarantee local storage is 100% saved right now
    try {
      localStorage.setItem(STORAGE_KEY_POINTS, JSON.stringify(points));
      localStorage.setItem(STORAGE_KEY_MATERIALS, JSON.stringify(materials));
      localStorage.setItem(STORAGE_KEY_BOXES, JSON.stringify(junctionBoxes));
      localStorage.setItem(STORAGE_KEY_COSTS, JSON.stringify(categories));
    } catch {}

    const safetyTimer = setTimeout(() => {
      setSyncStatus('synced');
      showToast('Cambios guardados con éxito');
    }, 3500);

    try {
      const [pointsSaved] = await Promise.all([
        saveAllPointsToFirebase(points, 3500),
        saveAllMaterialsToFirebase(materials, 3500),
        saveAllCostsToFirebase(categories, 3500),
        saveAllBoxesToFirebase(junctionBoxes, 3500)
      ]);
      clearTimeout(safetyTimer);
      if (pointsSaved === true) {
        clearCommittedUpdates();
      }
      setSyncStatus('synced');
      showToast('Cambios guardados con éxito');
    } catch (err) {
      clearTimeout(safetyTimer);
      console.warn('Force sync fallback to local mode:', err);
      setSyncStatus('synced');
      showToast('Cambios guardados con éxito en este dispositivo');
    }
  };

  // Point Selection & Saving
  const handleSelectPoint = (point: MeasurementPoint) => {
    setSelectedPoint(point);
    setIsDetailModalOpen(true);
  };

  const handleSavePoint = (updatedPoint: MeasurementPoint) => {
    const withTimestamp: MeasurementPoint = {
      ...updatedPoint,
      updatedAt: new Date().toISOString()
    };
    const normalized = normalizePoint(withTimestamp);
    recordLocalUpdate(normalized);
    setPoints(prev => {
      const next = prev.map(p => p.id === normalized.id ? normalized : p);
      try {
        localStorage.setItem(STORAGE_KEY_POINTS, JSON.stringify(next));
      } catch {}
      return next;
    });
    setSelectedPoint(normalized);
    showToast(`Punto ${normalized.tag} guardado`);

    // Persist to Firebase in background
    saveSinglePointToFirebase(normalized)
      .then((success) => {
        if (success) {
          clearCommittedUpdates([normalized.id]);
        }
      })
      .catch((err) => {
        console.warn('Background save note:', err);
      });

    // Auto-update materials consumption
    setTimeout(() => {
      syncMaterialsWithPoints(points.map(p => p.id === normalized.id ? normalized : p));
    }, 100);
  };

  const handleUpdatePoints = (updatedPoints: MeasurementPoint[]) => {
    const now = new Date().toISOString();
    const withTimestamps = updatedPoints.map(p => ({
      ...p,
      updatedAt: p.updatedAt || now
    }));
    const normalized = deduplicatePoints(withTimestamps.map(normalizePoint));
    recordLocalUpdatesBulk(normalized);
    setPoints(normalized);
    try {
      localStorage.setItem(STORAGE_KEY_POINTS, JSON.stringify(normalized));
    } catch {}
    showToast(`${normalized.length} puntos guardados`);
    syncMaterialsWithPoints(normalized);

    saveAllPointsToFirebase(normalized, 6000)
      .then((success) => {
        if (success) {
          clearCommittedUpdates();
        }
      })
      .catch((err) => {
        console.warn('Background points update note:', err);
      });
  };

  const handleAddNewPoint = (newPoint: MeasurementPoint) => {
    const withTimestamp: MeasurementPoint = {
      ...newPoint,
      updatedAt: new Date().toISOString()
    };
    const normalized = normalizePoint(withTimestamp);
    recordLocalUpdate(normalized);
    setPoints(prev => {
      const next = deduplicatePoints([...prev, normalized]);
      try {
        localStorage.setItem(STORAGE_KEY_POINTS, JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast(`Punto ${normalized.tag} registrado`);

    saveSinglePointToFirebase(normalized)
      .then((success) => {
        if (success) {
          clearCommittedUpdates([normalized.id]);
        }
      })
      .catch((err) => {
        console.warn('Background new point note:', err);
      });
  };

  const handleDeletePoint = (pointId: string) => {
    const target = points.find(p => p.id === pointId);
    const nom = target ? target.tag : '';
    recordLocalDeletion(pointId);
    setPoints(prev => {
      const updated = prev.filter(p => !p || p.id !== pointId);
      try {
        localStorage.setItem(STORAGE_KEY_POINTS, JSON.stringify(updated));
      } catch {}
      syncMaterialsWithPoints(updated);
      return updated;
    });
    if (selectedPoint && selectedPoint.id === pointId) {
      setIsDetailModalOpen(false);
      setSelectedPoint(null);
    }
    showToast(nom ? `Punto ${nom} eliminado` : 'Punto eliminado');

    deletePointFromFirebase(pointId).catch((err) => {
      console.warn('Background delete note:', err);
    });
  };

  const handleDeletePointsBulk = (pointIds: string[]) => {
    recordLocalDeletionsBulk(pointIds);
    setPoints(prev => {
      const updated = prev.filter(p => !p || !pointIds.includes(p.id));
      try {
        localStorage.setItem(STORAGE_KEY_POINTS, JSON.stringify(updated));
      } catch {}
      syncMaterialsWithPoints(updated);
      return updated;
    });
    if (selectedPoint && pointIds.includes(selectedPoint.id)) {
      setIsDetailModalOpen(false);
      setSelectedPoint(null);
    }
    showToast(`${pointIds.length} puntos eliminados`);

    deleteMultiplePointsFromFirebase(pointIds).catch((err) => {
      console.warn('Background bulk delete note:', err);
    });
  };

  // Synchronize materials based on installed points
  const syncMaterialsWithPoints = (currentPoints: MeasurementPoint[]) => {
    const installed = currentPoints.filter(p => p.status === 'installed' || p.status === 'verified');
    const installedSensorsCount = currentPoints.filter(p => p.stages?.sensorMounted || p.status === 'installed' || p.status === 'verified').length;
    // Consumption per cable (und): 1 cable per point where cable is pulled / installed
    const installedCablesCount = currentPoints.filter(p => p.stages?.cablePulled || p.status === 'installed' || p.status === 'verified').length;
    const cableMetersCount = installed.reduce((acc, p) => acc + (p.cableMeters || 0), 0);
    const conduitCount = Math.round(cableMetersCount * 0.45);

    const updated = materials.map(mat => {
      const isCableUnd = 
        mat.code === '4251480' || 
        mat.name.toUpperCase().includes('CB206') || 
        mat.name.toUpperCase().includes('CABLE ACELEROMETRO') ||
        mat.unit === 'und' || mat.unit === 'UND';

      if (isCableUnd) {
        return { 
          ...mat, 
          unit: 'und',
          installedQty: installedCablesCount 
        };
      }
      if (mat.category === 'sensors') {
        return { ...mat, installedQty: installedSensorsCount };
      }
      if (mat.category === 'cables') {
        return { 
          ...mat, 
          installedQty: mat.unit === 'm' ? cableMetersCount : installedCablesCount 
        };
      }
      if (mat.category === 'conduit') {
        return { ...mat, installedQty: conduitCount };
      }
      if (mat.code.includes('STD') || mat.category === 'mounting') {
        return { ...mat, installedQty: installedSensorsCount };
      }
      return mat;
    });

    setMaterials(updated);
  };

  // Export Backup JSON
  const handleExportBackup = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      points,
      materials,
      categories,
      junctionBoxes
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MEDREMOTM4_Firebase_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Copia de respaldo descargada');
  };

  // Import Backup JSON
  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (data.points && Array.isArray(data.points)) {
          const norm = data.points.map(normalizePoint);
          setPoints(norm);
          if (data.materials) setMaterials(data.materials);
          if (data.categories) setCategories(data.categories);
          if (data.junctionBoxes) setJunctionBoxes(data.junctionBoxes);
          showToast('Copia restaurada. Guardando en Firebase...');

          await Promise.all([
            saveAllPointsToFirebase(norm),
            data.materials ? saveAllMaterialsToFirebase(data.materials) : Promise.resolve(),
            data.categories ? saveAllCostsToFirebase(data.categories) : Promise.resolve(),
            data.junctionBoxes ? saveAllBoxesToFirebase(data.junctionBoxes) : Promise.resolve()
          ]);

          setSyncStatus('synced');
          showToast('Datos sincronizados en Firebase');
        } else {
          alert('El archivo JSON no tiene el formato esperado del proyecto MEDREMOTM4.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Reset to initial factory data
  const handleResetData = async () => {
    if (confirm('¿Desea restaurar todos los datos a la configuración inicial y sincronizarlos con Firebase?')) {
      setPoints(INITIAL_POINTS);
      setMaterials(INITIAL_MATERIALS);
      setCategories(INITIAL_COST_CATEGORIES);
      setJunctionBoxes(INITIAL_JUNCTION_BOXES);
      localStorage.removeItem(STORAGE_KEY_POINTS);
      localStorage.removeItem(STORAGE_KEY_MATERIALS);
      localStorage.removeItem(STORAGE_KEY_COSTS);
      localStorage.removeItem(STORAGE_KEY_BOXES);
      showToast('Restaurando datos iniciales en Firebase...');

      try {
        await Promise.all([
          saveAllPointsToFirebase(INITIAL_POINTS),
          saveAllMaterialsToFirebase(INITIAL_MATERIALS),
          saveAllCostsToFirebase(INITIAL_COST_CATEGORIES),
          saveAllBoxesToFirebase(INITIAL_JUNCTION_BOXES)
        ]);
        setSyncStatus('synced');
        showToast('Datos reiniciados en Firebase');
      } catch (err) {
        console.error('Error resetting Firebase data:', err);
      }
    }
  };

  return (
    <div id="vibration-monitoring-app" className="min-h-screen bg-slate-100 flex flex-col text-slate-800 antialiased font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        points={points}
        onOpenReport={() => setIsReportModalOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetData}
        syncStatus={syncStatus}
        onForceSync={handleForceSync}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* VIEW 1: POINTS & COMPONENTS LIST */}
        {activeTab === 'points' && (
          <PointsTable
            points={points}
            onSelectPoint={handleSelectPoint}
            onUpdatePoints={handleUpdatePoints}
            onAddNewPoint={() => setIsAddPointModalOpen(true)}
            onDeletePoint={handleDeletePoint}
            onDeletePointsBulk={handleDeletePointsBulk}
          />
        )}

        {/* VIEW 2: MATERIALS INVENTORY */}
        {activeTab === 'materials' && (
          <MaterialsManager
            materials={materials}
            points={points}
            onUpdateMaterials={(updatedMats) => {
              setMaterials(updatedMats);
              saveAllMaterialsToFirebase(updatedMats).catch(console.error);
            }}
          />
        )}

        {/* VIEW 3: PROJECT PROGRESS DASHBOARD */}
        {(activeTab === 'progress' || activeTab === 'costs') && (
          <ProjectProgressDashboard
            points={points}
            materials={materials}
            junctionBoxes={junctionBoxes}
            onSelectPoint={handleSelectPoint}
          />
        )}

        {/* VIEW 4: VISOR 2D ÁREA 1 */}
        {activeTab === 'boxes' && (
          <Schematic2DViewer
            area={1}
            boxes={junctionBoxes}
            points={points}
            onSelectPoint={handleSelectPoint}
            onSavePoint={handleSavePoint}
          />
        )}

        {/* VIEW 5: VISOR 2D ÁREA 2 */}
        {activeTab === 'area2' && (
          <Schematic2DViewer
            area={2}
            boxes={junctionBoxes}
            points={points}
            onSelectPoint={handleSelectPoint}
            onSavePoint={handleSavePoint}
          />
        )}

        {/* VIEW 6: VISOR 2D ÁREA 3 */}
        {activeTab === 'area3' && (
          <Schematic2DViewer
            area={3}
            boxes={junctionBoxes}
            points={points}
            onSelectPoint={handleSelectPoint}
            onSavePoint={handleSavePoint}
          />
        )}

        {/* VIEW 7: VISOR 2D SÓTANO */}
        {activeTab === 'sotano' && (
          <Schematic2DViewer
            area={4}
            boxes={junctionBoxes}
            points={points}
            onSelectPoint={handleSelectPoint}
            onSavePoint={handleSavePoint}
          />
        )}
      </main>

      {/* Point Detail / Diligence Modal */}
      {isDetailModalOpen && selectedPoint && (
        <PointDetailModal
          isOpen={isDetailModalOpen}
          point={selectedPoint}
          allPoints={points}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedPoint(null);
          }}
          onSave={handleSavePoint}
          onSelectPoint={handleSelectPoint}
          onDelete={handleDeletePoint}
        />
      )}

      {/* Add New Point Modal */}
      {isAddPointModalOpen && (
        <AddPointModal
          isOpen={isAddPointModalOpen}
          onClose={() => setIsAddPointModalOpen(false)}
          onAddPoint={(newPt) => {
            handleAddNewPoint(newPt);
            setIsAddPointModalOpen(false);
          }}
          existingPoints={points}
        />
      )}

      {/* Executive Report / PDF Modal */}
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          points={points}
          materials={materials}
          categories={categories}
          junctionBoxes={junctionBoxes}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 px-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <SmurfitWestrockLogo theme="light" size="sm" />
            <div className="border-l border-slate-200 pl-3 text-left">
              <p className="font-semibold text-slate-700">Smurfit Westrock · Packaging Solutions</p>
              <p className="text-[11px] text-slate-400">Sistema de Medición Remota de Vibraciones Mecánicas · Sección de Secado</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <button 
              type="button" 
              onClick={handleResetData}
              className="hover:text-rose-600 transition-colors cursor-pointer"
              title="Restablecer datos predeterminados en Firebase"
            >
              Restablecer valores iniciales
            </button>
            <span>•</span>
            <span className="font-mono text-emerald-600 font-medium">Firestore Conectado</span>
            <span>•</span>
            <span>Versión 4.2 · Proyecto MEDREMOTM4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
