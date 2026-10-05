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
  subscribeToCosts
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
  let tag = p.tag ? p.tag.trim() : '';

  if (!tag) {
    if (p.type === 'dryer') {
      const match = (p.name || '').match(/#?(\d+)/) || (p.originalLabel ? p.originalLabel.match(/(\d+)/) : null);
      if (match) {
        tag = `${parseInt(match[1], 10)}S`;
      } else {
        tag = '1S';
      }
    } else if (p.type === 'pinion') {
      const initialMatch = INITIAL_POINTS.find(ip => ip.id === p.id);
      if (initialMatch && initialMatch.tag && /^P-[A-Z0-9]+$/i.test(initialMatch.tag.trim())) {
        tag = initialMatch.tag.trim().toUpperCase();
      } else {
        const raw = (p.originalLabel || p.name || '').toUpperCase();
        if (raw.includes('AA')) tag = 'P-AA';
        else if (raw.includes('XXVIII')) tag = 'P-XXVIII';
        else if (raw.includes('XXVII')) tag = 'P-XXVII';
        else if (raw.includes('XXVI')) tag = 'P-XXVI';
        else if (raw.includes('XXIX')) tag = 'P-XXIX';
        else if (raw.includes('XXV')) tag = 'P-XXV';
        else if (raw.includes('XXIV')) tag = 'P-XXIV';
        else if (raw.includes('XXIII')) tag = 'P-XXIII';
        else if (raw.includes('XXII')) tag = 'P-XXII';
        else if (raw.includes('XXI')) tag = 'P-XXI';
        else if (raw.includes('XX')) tag = 'P-XX';
        else if (raw.includes('XVIII')) tag = 'P-XVIII';
        else if (raw.includes('XVII')) tag = 'P-XVII';
        else if (raw.includes('XVI')) tag = 'P-XVI';
        else if (raw.includes('XIX')) tag = 'P-XIX';
        else if (raw.includes('XIV')) tag = 'P-XIV';
        else if (raw.includes('XV')) tag = 'P-XV';
        else if (raw.includes('XIII')) tag = 'P-XIII';
        else if (raw.includes('XII')) tag = 'P-XII';
        else if (raw.includes('XI')) tag = 'P-XI';
        else if (raw.includes('X')) tag = 'P-X';
        else if (raw.includes('VIII')) tag = 'P-VIII';
        else if (raw.includes('VII')) tag = 'P-VII';
        else if (raw.includes('VI')) tag = 'P-VI';
        else if (raw.includes('IV')) tag = 'P-IV';
        else if (raw.includes('IX')) tag = 'P-IX';
        else if (raw.includes('V')) tag = 'P-V';
        else if (raw.includes('III')) tag = 'P-III';
        else if (raw.includes('II')) tag = 'P-II';
        else if (/\bI\b/.test(raw) || raw === 'I' || raw.endsWith('-I')) tag = 'P-I';
        else if (/\bA\b/.test(raw) || raw === 'A' || raw.endsWith('-A')) tag = 'P-A';
        else if (/\bB\b/.test(raw) || raw === 'B' || raw.endsWith('-B')) tag = 'P-B';
        else if (/\bC\b/.test(raw) || raw === 'C' || raw.endsWith('-C')) tag = 'P-C';
        else tag = 'P-AA';
      }
    } else if (p.type === 'felt_roll_upper' || p.type === 'felt_roll_pocket') {
      const initialMatch = INITIAL_POINTS.find(ip => ip.id === p.id);
      if (initialMatch && initialMatch.tag && /^\d+R$/i.test(initialMatch.tag.trim())) {
        tag = initialMatch.tag.trim().toUpperCase();
      } else {
        const initialFeltPoints = INITIAL_POINTS.filter(ip => ip.type === 'felt_roll_upper' || ip.type === 'felt_roll_pocket');
        const idx = initialFeltPoints.findIndex(ip => ip.id === p.id);
        if (idx !== -1) {
          tag = `${idx + 1}R`;
        } else {
          const numMatch = (p.originalLabel || p.name || '').match(/(\d+)/);
          tag = numMatch ? `${parseInt(numMatch[1], 10)}R` : '1R';
        }
      }
    }
  } else if (p.type === 'dryer') {
    if (!/^\d+[A-Z]?S?$/i.test(tag) || /L\d/i.test(tag)) {
      const match = (p.name && p.name.match(/#\s*(\d+[A-Z]?)/i)) ||
                    (p.id && p.id.match(/pt-\d+s-(\d+[a-z]?)/i)) ||
                    (p.originalLabel && p.originalLabel.match(/^(\d+[A-Z]?)/i)) ||
                    tag.match(/L3-(\d+)/i);
      if (match) {
        const rawNum = match[1].toUpperCase().replace(/^0+/, '');
        tag = rawNum.endsWith('S') || rawNum.endsWith('A') ? rawNum : `${rawNum}S`;
      } else {
        tag = '1S';
      }
    }
  } else if (p.type === 'felt_roll_upper' || p.type === 'felt_roll_pocket') {
    if (!/^\d+R$/i.test(tag)) {
      const numMatch = tag.match(/(\d+)/) || (p.originalLabel || p.name || '').match(/(\d+)/);
      tag = numMatch ? `${parseInt(numMatch[1], 10)}R` : '1R';
    }
  }

  let name = p.name ? p.name.trim() : '';
  if (p.type === 'felt_roll_upper' || p.type === 'felt_roll_pocket') {
    const numMatch = tag.match(/(\d+)/) || (p.tag || '').match(/(\d+)/) || (name || '').match(/#?(\d+)/);
    if (numMatch) {
      name = `Rodillo de Lona #${parseInt(numMatch[1], 10)}`;
    } else {
      name = 'Rodillo de Lona';
    }
  } else if (!name) {
    if (p.type === 'pinion') {
      name = 'Piñón Intermedio';
    } else {
      name = 'Secador';
    }
  } else if (name.toLowerCase().startsWith('cilindro secador')) {
    name = name.replace(/^cilindro\s+secador/i, 'Secador');
  }

  let boxId = p.boxId;
  const rawBox = String(boxId || '').trim();
  if (rawBox === 'JB-01' || rawBox === 'JB Area 1' || rawBox === 'JB #1' || rawBox.includes('1')) boxId = 'JB #1';
  else if (rawBox === 'JB-02' || rawBox === 'JB Area 2' || rawBox === 'JB #2' || rawBox.includes('2')) boxId = 'JB #2';
  else if (rawBox === 'JB-03' || rawBox === 'JB Area 3' || rawBox === 'JB #3' || rawBox.includes('3')) boxId = 'JB #3';
  else boxId = 'JB #1';

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

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('points');

  // Core Data with localStorage persistence & Firebase synchronization
  const [points, setPoints] = useState<MeasurementPoint[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POINTS);
      if (saved) {
        const parsed: MeasurementPoint[] = JSON.parse(saved);
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
        return JSON.parse(saved);
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

  // Sync state & Notification Toast
  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced' | 'error'>('syncing');
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
      setSyncStatus('syncing');
      try {
        await testConnection();

        // Check if database already has points
        const cloudPoints = await loadPointsFromFirebase();
        if (cloudPoints && cloudPoints.length > 0) {
          const normPoints = deduplicatePoints(cloudPoints.map(normalizePoint));
          setPoints(normPoints);
        } else {
          // First time seeding database
          await saveAllPointsToFirebase(INITIAL_POINTS);
        }

        const cloudMaterials = await loadMaterialsFromFirebase();
        if (cloudMaterials && cloudMaterials.length > 0) {
          setMaterials(cloudMaterials);
        } else {
          await saveAllMaterialsToFirebase(INITIAL_MATERIALS);
        }

        const cloudBoxes = await loadBoxesFromFirebase();
        if (cloudBoxes && cloudBoxes.length > 0) {
          setJunctionBoxes(cloudBoxes);
        } else {
          await saveAllBoxesToFirebase(INITIAL_JUNCTION_BOXES);
        }

        const cloudCosts = await loadCostsFromFirebase();
        if (cloudCosts && cloudCosts.length > 0) {
          setCategories(cloudCosts);
        } else {
          await saveAllCostsToFirebase(INITIAL_COST_CATEGORIES);
        }

        setSyncStatus('synced');
        isInitialSyncDone.current = true;

        // Subscribe to real-time updates from cloud
        unsubscribePoints = subscribeToPoints((pts) => {
          if (pts.length > 0) {
            setPoints(deduplicatePoints(pts.map(normalizePoint)));
          }
        });

        unsubscribeMaterials = subscribeToMaterials((mats) => {
          if (mats.length > 0) {
            setMaterials(mats);
          }
        });

        unsubscribeBoxes = subscribeToBoxes((bx) => {
          if (bx.length > 0) {
            setJunctionBoxes(bx);
          }
        });

        unsubscribeCosts = subscribeToCosts((csts) => {
          if (csts.length > 0) {
            setCategories(csts);
          }
        });

      } catch (err) {
        console.error('Firebase initial sync failed:', err);
        setSyncStatus('error');
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

  // Force sync trigger
  const handleForceSync = async () => {
    setSyncStatus('syncing');
    showToast('Sincronizando con Firebase Firestore...');
    try {
      await Promise.all([
        saveAllPointsToFirebase(points),
        saveAllMaterialsToFirebase(materials),
        saveAllCostsToFirebase(categories),
        saveAllBoxesToFirebase(junctionBoxes)
      ]);
      setSyncStatus('synced');
      showToast('Base de datos Firebase sincronizada');
    } catch (err) {
      console.error('Error in manual force sync:', err);
      setSyncStatus('error');
      showToast('Error al sincronizar con Firebase');
    }
  };

  // Point Selection & Saving
  const handleSelectPoint = (point: MeasurementPoint) => {
    setSelectedPoint(point);
    setIsDetailModalOpen(true);
  };

  const handleSavePoint = (updatedPoint: MeasurementPoint) => {
    const normalized = normalizePoint(updatedPoint);
    setPoints(prev => prev.map(p => p.id === normalized.id ? normalized : p));
    setSelectedPoint(normalized);
    showToast(`Punto ${normalized.tag} actualizado`);

    // Persist to Firebase
    saveSinglePointToFirebase(normalized).catch((err) => {
      console.error('Error saving point to Firebase:', err);
      setSyncStatus('error');
    });

    // Auto-update materials consumption
    setTimeout(() => {
      syncMaterialsWithPoints(points.map(p => p.id === normalized.id ? normalized : p));
    }, 100);
  };

  const handleUpdatePoints = (updatedPoints: MeasurementPoint[]) => {
    const normalized = deduplicatePoints(updatedPoints.map(normalizePoint));
    setPoints(normalized);
    showToast(`${normalized.length} puntos actualizados en Firebase`);
    syncMaterialsWithPoints(normalized);

    saveAllPointsToFirebase(normalized).catch((err) => {
      console.error('Error updating points in Firebase:', err);
      setSyncStatus('error');
    });
  };

  const handleAddNewPoint = (newPoint: MeasurementPoint) => {
    const normalized = normalizePoint(newPoint);
    setPoints(prev => deduplicatePoints([...prev, normalized]));
    showToast(`Punto ${normalized.tag} guardado en base de datos`);

    saveSinglePointToFirebase(normalized).catch((err) => {
      console.error('Error adding point to Firebase:', err);
      setSyncStatus('error');
    });
  };

  const handleDeletePoint = (pointId: string) => {
    const target = points.find(p => p.id === pointId);
    const nom = target ? target.tag : '';
    setPoints(prev => {
      const updated = prev.filter(p => p.id !== pointId);
      syncMaterialsWithPoints(updated);
      return updated;
    });
    if (selectedPoint && selectedPoint.id === pointId) {
      setIsDetailModalOpen(false);
      setSelectedPoint(null);
    }
    showToast(nom ? `Punto ${nom} eliminado` : 'Punto eliminado');

    deletePointFromFirebase(pointId).catch((err) => {
      console.error('Error deleting point from Firebase:', err);
      setSyncStatus('error');
    });
  };

  const handleDeletePointsBulk = (pointIds: string[]) => {
    setPoints(prev => {
      const updated = prev.filter(p => !pointIds.includes(p.id));
      syncMaterialsWithPoints(updated);
      return updated;
    });
    if (selectedPoint && pointIds.includes(selectedPoint.id)) {
      setIsDetailModalOpen(false);
      setSelectedPoint(null);
    }
    showToast(`${pointIds.length} puntos eliminados`);

    deleteMultiplePointsFromFirebase(pointIds).catch((err) => {
      console.error('Error in bulk delete on Firebase:', err);
      setSyncStatus('error');
    });
  };

  // Synchronize materials based on installed points
  const syncMaterialsWithPoints = (currentPoints: MeasurementPoint[]) => {
    const installed = currentPoints.filter(p => p.status === 'installed' || p.status === 'verified');
    const installedCount = installed.length;
    const cableCount = installed.reduce((acc, p) => acc + (p.cableMeters || 0), 0);
    const conduitCount = Math.round(cableCount * 0.45);

    const updated = materials.map(mat => {
      if (mat.category === 'sensors' && mat.code.includes('100MV')) {
        return { ...mat, installedQty: installedCount };
      }
      if (mat.category === 'cables') {
        return { ...mat, installedQty: cableCount };
      }
      if (mat.category === 'conduit') {
        return { ...mat, installedQty: conduitCount };
      }
      if (mat.code.includes('STD')) {
        return { ...mat, installedQty: installedCount };
      }
      return mat;
    });

    setMaterials(updated);
    saveAllMaterialsToFirebase(updated).catch(console.error);
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
