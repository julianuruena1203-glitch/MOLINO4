import React, { useState, useMemo, useEffect } from 'react';
import { MeasurementPoint, JunctionBox, PointStatus } from '../types';
import { getCleanComponentName, formatBoxId, getNomenclature, getEquipoSortWeight } from './PointsTable';
import { 
  Compass,
  Check,
  Search,
  X,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Activity,
  Layers,
  Zap,
  Tag,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Lock,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

interface Schematic2DViewerProps {
  area?: 1 | 2 | 3 | 4 | 'sotano';
  boxes?: JunctionBox[];
  points?: MeasurementPoint[];
  onSelectPoint?: (point: MeasurementPoint) => void;
  onSavePoint?: (updatedPoint: MeasurementPoint) => void;
}

export const Schematic2DViewer: React.FC<Schematic2DViewerProps> = ({
  area = 1,
  boxes = [],
  points = [],
  onSelectPoint,
  onSavePoint
}) => {
  const isSotano = area === 4 || area === 'sotano';
  const currentArea = area;
  const areaTitle = isSotano ? 'Sótano' : `Área ${currentArea}`;

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'green' | 'amber' | 'red'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'dryer' | 'pinion' | 'roller'>('all');

  // Selected point for detailed stage management drawer
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);

  // Zoom & Pan state for the PNG photo
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Configuration for the official attached PNG photo matching user files
  const schemaConfig = useMemo(() => {
    if (isSotano) {
      return {
        imageNumber: 4,
        title: 'Imagen 4 · Visor 2D Área Sótano',
        subtitle: 'Foto PNG oficial de Retornos de Lona (Primera, Segunda, Tercera y Cuarta Sección)',
        badge: 'Imagen 4 · Sótano',
        filename: 'Sotano.png',
        photoUrl: '/Sotano.png',
        areaLabel: 'Área Sótano · Retornos'
      };
    }
    if (currentArea === 3) {
      return {
        imageNumber: 3,
        title: 'Imagen 3 · Visor 2D Área 3',
        subtitle: 'Foto PNG oficial de Cuarta Sección (Secadores 31 al 38, Rodillos de Lona y Piñones XIV al XVI)',
        badge: 'Imagen 3 · Área 3',
        filename: 'Area 3.png',
        photoUrl: '/Area 3.png',
        areaLabel: 'Secadores 31 al 38 · JB #3'
      };
    }
    if (currentArea === 2) {
      return {
        imageNumber: 2,
        title: 'Imagen 2 · Visor 2D Área 2',
        subtitle: 'Foto PNG oficial de Tercera Sección, Unidad Clupak M4 y Segunda Sección (Secadores 17 al 30)',
        badge: 'Imagen 2 · Área 2',
        filename: 'Area 2.png',
        photoUrl: '/Area 2.png',
        areaLabel: 'Clupak & Secadores 17 al 30 · JB #2'
      };
    }
    return {
      imageNumber: 1,
      title: 'Imagen 1 · Visor 2D Área 1',
      subtitle: 'Foto PNG oficial de Primera y Segunda Sección (Secadores 1 al 16, Rodillos y Piñones I al III)',
      badge: 'Imagen 1 · Área 1',
      filename: 'Area 1.png',
      photoUrl: '/Area 1.png',
      areaLabel: 'Secadores 1 al 16 · JB #1'
    };
  }, [currentArea, isSotano]);

  // Support local attached photo with persistence in localStorage
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`medremotm4_photo_${schemaConfig.filename}`);
      setCustomPhoto(saved || null);
    } catch {
      setCustomPhoto(null);
    }
    setZoomLevel(1);
  }, [schemaConfig]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.8));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoomLevel(1);

  const handleAttachPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomPhoto(dataUrl);
        try {
          localStorage.setItem(`medremotm4_photo_${schemaConfig.filename}`, dataUrl);
        } catch (err) {
          console.warn('Storage quota exceeded', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Points of the current area, sorted exactly as in the Listado General table
  const areaPoints = useMemo(() => {
    if (isSotano) {
      const list = points.filter(p => {
        return (
          p.area === 4 ||
          String(p.area).toLowerCase().includes('sotano') ||
          String(p.area).toLowerCase().includes('sótano') ||
          formatBoxId(p.boxId) === 'Área Sótano' ||
          String(p.boxId).toLowerCase().includes('sotano') ||
          String(p.boxId).toLowerCase().includes('sótano')
        );
      });
      return [...list].sort((a, b) => getEquipoSortWeight(a) - getEquipoSortWeight(b));
    }

    const list = points.filter(p => {
      // Exclude points assigned to Área Sótano
      if (
        p.area === 4 ||
        String(p.area).toLowerCase().includes('sotano') ||
        String(p.area).toLowerCase().includes('sótano') ||
        formatBoxId(p.boxId) === 'Área Sótano' ||
        String(p.boxId).toLowerCase().includes('sotano') ||
        String(p.boxId).toLowerCase().includes('sótano')
      ) {
        return false;
      }

      // Check explicit area first
      if (p.area !== undefined && p.area !== null && p.area !== '') {
        return Number(p.area) === currentArea;
      }

      // Fallback to boxId
      const cleanBox = formatBoxId(p.boxId);
      if (currentArea === 3) return cleanBox === 'JB #3';
      if (currentArea === 2) return cleanBox === 'JB #2';
      return cleanBox === 'JB #1';
    });
    return [...list].sort((a, b) => getEquipoSortWeight(a) - getEquipoSortWeight(b));
  }, [points, currentArea, isSotano]);

  // Counts by type for the current area
  const dryerCount = useMemo(() => areaPoints.filter(p => p.type === 'dryer').length, [areaPoints]);
  const pinionCount = useMemo(() => areaPoints.filter(p => p.type === 'pinion').length, [areaPoints]);
  const rollerCount = useMemo(() => areaPoints.filter(p => p.type.includes('felt')).length, [areaPoints]);

  // Helper: check completion percentage (0 - 100) exactly matching Listado General milestones
  const getPointProgress = (p: MeasurementPoint): number => {
    const count = (p.stages?.sensorMounted ? 1 : 0) +
                  (p.stages?.cablePulled ? 1 : 0) +
                  (p.stages?.connectedToJB ? 1 : 0);
    if (count === 3 || p.status === 'verified') return 100;
    if (count === 2) return 67;
    if (count === 1) return 33;
    if (p.status === 'installed') return 67;
    if (p.status === 'in_progress') return 33;
    return 0;
  };

  const is100Percent = (p: MeasurementPoint): boolean => {
    const count = (p.stages?.sensorMounted ? 1 : 0) +
                  (p.stages?.cablePulled ? 1 : 0) +
                  (p.stages?.connectedToJB ? 1 : 0);
    return count === 3 || p.status === 'verified';
  };

  // Filtered single list of points
  const displayedPoints = useMemo(() => {
    return areaPoints.filter(p => {
      const isDone = is100Percent(p);
      const progress = getPointProgress(p);

      if (statusFilter === 'green' && !isDone) return false;
      if (statusFilter === 'amber' && (progress === 0 || progress === 100)) return false;
      if (statusFilter === 'red' && progress > 0) return false;

      const isDryer = p.type === 'dryer';
      const isPinion = p.type === 'pinion';
      const isRoller = p.type === 'felt_roll_pocket' || p.type === 'felt_roll_upper';

      if (typeFilter === 'dryer' && !isDryer) return false;
      if (typeFilter === 'pinion' && !isPinion) return false;
      if (typeFilter === 'roller' && !isRoller) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const tag = (p.tag || '').toLowerCase();
        const nom = getNomenclature(p).toLowerCase();
        const name = (p.name || '').toLowerCase();
        const orig = (p.originalLabel || '').toLowerCase();
        return tag.includes(q) || nom.includes(q) || name.includes(q) || orig.includes(q);
      }

      return true;
    });
  }, [areaPoints, statusFilter, typeFilter, searchQuery]);

  // Overall Statistics for this area
  const stats = useMemo(() => {
    const total = areaPoints.length;
    const completed = areaPoints.filter(is100Percent).length;
    const inProgress = areaPoints.filter(p => {
      const prog = getPointProgress(p);
      return prog > 0 && prog < 100;
    }).length;
    const pending = total - completed - inProgress;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, pending, percent };
  }, [areaPoints]);

  // Selected point details
  const selectedPoint = useMemo(() => {
    return points.find(p => p.id === selectedPointId) || null;
  }, [points, selectedPointId]);

  // 1-Click Toggle: flip point between 100% (Verde) and 0% (Rojo)
  const handleToggle100 = (pt: MeasurementPoint) => {
    if (!onSavePoint) return;
    const isDone = is100Percent(pt);

    const newStages = {
      ...pt.stages,
      baseMachined: !isDone,
      sensorMounted: !isDone,
      conduitInstalled: !isDone,
      cablePulled: !isDone,
      connectedToJB: !isDone,
      biasVerified: !isDone ? (pt.stages?.biasVerified ?? true) : false,
      vibrationTestOk: !isDone ? (pt.stages?.vibrationTestOk ?? true) : false
    };

    const updatedPoint: MeasurementPoint = {
      ...pt,
      stages: newStages,
      biasVoltage: !isDone ? (pt.biasVoltage || 12.0) : 0,
      status: !isDone ? 'verified' : 'pending'
    };

    onSavePoint(updatedPoint);
  };

  // Toggle individual stage
  const handleToggleStage = (pt: MeasurementPoint, stageKey: keyof MeasurementPoint['stages']) => {
    if (!onSavePoint) return;
    const currentVal = Boolean(pt.stages?.[stageKey]);
    const updatedStages = {
      ...pt.stages,
      [stageKey]: !currentVal
    };

    const count = (updatedStages.sensorMounted ? 1 : 0) +
                  (updatedStages.cablePulled ? 1 : 0) +
                  (updatedStages.connectedToJB ? 1 : 0);

    let newStatus: PointStatus = 'pending';
    if (count === 3) newStatus = 'verified';
    else if (count === 2) newStatus = 'installed';
    else if (count === 1) newStatus = 'in_progress';

    const updatedPoint: MeasurementPoint = {
      ...pt,
      stages: updatedStages,
      status: newStatus
    };

    onSavePoint(updatedPoint);
  };

  return (
    <div className="w-full space-y-5">
      {/* ================= BARRA SUPERIOR INFORMATIVA DEL ESQUEMA FIJO ORIGINAL ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shadow-2xs">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                {schemaConfig.title}
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {schemaConfig.badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {schemaConfig.subtitle} · Plano original de ingeniería fijado sin modificaciones.
            </p>
          </div>
        </div>

        {/* Right side controls: Zoom & Locked status */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Alejar (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-xs font-bold text-slate-700 select-none min-w-[48px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Acercar (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors cursor-pointer ml-0.5"
              title="Restablecer zoom (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer ml-0.5"
              title="Ver en pantalla completa"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Locked Badge */}
          <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Esquema Fijo e Inmutable</span>
          </div>
        </div>
      </div>

      {/* ================= 1. ESQUEMA TÉCNICO OFICIAL ORIGINAL (IMAGEN ADJUNTA FIJA) ================= */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Banner de archivo oficial */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold font-mono text-[11px] border border-sky-200">
              Imagen {schemaConfig.imageNumber}
            </span>
            <ImageIcon className="w-4 h-4 text-sky-600" />
            <span className="font-semibold text-slate-800">{schemaConfig.filename}</span>
            <span className="text-slate-400">·</span>
            <span className="text-[11px] text-slate-500">{schemaConfig.areaLabel} · Foto PNG original sin modificar</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Input para adjuntar foto PNG de cada área */}
            <label 
              className="flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors border border-slate-300 shadow-2xs"
              title={`Adjuntar archivo PNG para ${schemaConfig.title}`}
            >
              <Upload className="w-3.5 h-3.5 text-sky-600" />
              <span>Adjuntar PNG</span>
              <input
                type="file"
                accept="image/png,image/*"
                onChange={handleAttachPhoto}
                className="hidden"
              />
            </label>

            <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>Foto PNG Oficial</span>
            </div>
          </div>
        </div>

        {/* Canvas de foto PNG con zoom y scroll suave */}
        <div className="relative w-full p-4 sm:p-6 overflow-auto bg-white flex items-center justify-center min-h-[380px] max-h-[640px]">
          <div 
            className="transition-transform duration-150 ease-out origin-center flex items-center justify-center w-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={customPhoto || schemaConfig.photoUrl}
              alt={schemaConfig.title}
              className="max-h-[520px] max-w-full w-auto object-contain select-none"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Footer del visor con aviso de integridad */}
        <div className="bg-slate-50/80 border-t border-slate-200/80 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
          <span>Foto PNG oficial · Smurfit Westrock Molino 4 ({schemaConfig.filename})</span>
          <span>Esquemas vectoriales eliminados · Foto original intacta</span>
        </div>
      </div>

      {/* Modal Pantalla Completa si el usuario hace clic en expandir */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xs flex flex-col p-4 sm:p-6 animate-in fade-in">
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl text-white mb-4">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-sky-400" />
              <div>
                <h3 className="text-sm font-bold text-white">{schemaConfig.title}</h3>
                <p className="text-xs text-slate-400">{schemaConfig.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg"
                  title="Alejar"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-3 font-mono text-xs font-bold text-sky-400">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-300 hover:text-white rounded-lg"
                  title="Acercar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg ml-1"
                  title="Restablecer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Cerrar pantalla completa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-2xl border border-slate-800 overflow-auto p-6 flex items-center justify-center">
            <div 
              className="transition-transform duration-150 ease-out origin-center flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={customPhoto || schemaConfig.photoUrl}
                alt={schemaConfig.title}
                className="max-h-[82vh] w-auto max-w-none object-contain select-none"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. FILTERS & SEARCH BAR ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                  statusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                onClick={() => setStatusFilter('green')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'green' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>100% Verde ({stats.completed})</span>
              </button>
              <button
                onClick={() => setStatusFilter('amber')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'amber' ? 'bg-amber-500 text-white' : 'text-amber-700 hover:bg-amber-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>En Proceso ({stats.inProgress})</span>
              </button>
              <button
                onClick={() => setStatusFilter('red')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === 'red' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Pendiente Rojo ({stats.pending})</span>
              </button>
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg font-medium cursor-pointer ${
                  typeFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos los Tipos
              </button>
              <button
                onClick={() => setTypeFilter('dryer')}
                className={`px-2.5 py-1.5 rounded-lg font-medium cursor-pointer ${
                  typeFilter === 'dryer' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Secadores ({dryerCount})
              </button>
              <button
                onClick={() => setTypeFilter('pinion')}
                className={`px-2.5 py-1.5 rounded-lg font-medium cursor-pointer ${
                  typeFilter === 'pinion' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Piñones ({pinionCount})
              </button>
              <button
                onClick={() => setTypeFilter('roller')}
                className={`px-2.5 py-1.5 rounded-lg font-medium cursor-pointer ${
                  typeFilter === 'roller' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rodillos ({rollerCount})
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por equipo o tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-sky-500 w-64"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= 3. LISTADO GENERAL CON IDENTIFICACIÓN EXACTA DE COLUMNA EQUIPO ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-black text-slate-900">
              Listado General de Puntos {areaTitle} (Identificación Columna EQUIPO)
            </h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {displayedPoints.length} de {areaPoints.length}
            </span>
          </div>

          <div className="text-xs text-slate-500">
            Avance Global {areaTitle}: <span className="font-mono font-bold text-emerald-600">{stats.completed} de {stats.total} ({stats.percent}%)</span>
          </div>
        </div>

        {/* Grid of Simplified Cards */}
        {displayedPoints.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No se encontraron componentes con los filtros aplicados.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2.5">
            {displayedPoints.map((pt, idx) => {
              const isDone = is100Percent(pt);
              const progress = getPointProgress(pt);
              const isSelected = selectedPointId === pt.id;

              // Exact identification from Listado General column "EQUIPO"
              const equipoLabel = getNomenclature(pt);

              // Colors based on real-time progress
              let cardBg = 'bg-rose-50/60 border-rose-200 hover:bg-rose-50 hover:border-rose-300';
              let circleBg = 'bg-rose-500 text-white border-rose-600';
              let badgeColor = 'bg-white text-rose-700 border-rose-200';

              if (isDone) {
                cardBg = 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300';
                circleBg = 'bg-emerald-600 text-white border-emerald-700';
                badgeColor = 'bg-emerald-600 text-white border-emerald-700';
              } else if (progress > 0) {
                cardBg = 'bg-amber-50/70 border-amber-200 hover:bg-amber-50 hover:border-amber-300';
                circleBg = 'bg-amber-500 text-white border-amber-600';
                badgeColor = 'bg-white text-amber-700 border-amber-200';
              }

              return (
                <div
                  key={pt.id ? `${pt.id}_${pt.area || ''}_${idx}` : `pt-card-${idx}`}
                  onClick={() => setSelectedPointId(pt.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer select-none shadow-xs ${cardBg} ${
                    isSelected ? 'ring-2 ring-sky-500 shadow-md scale-[1.02] z-10' : ''
                  }`}
                  title={`${equipoLabel} · ${getCleanComponentName(pt)} · Click para ver/ajustar hitos`}
                >
                  {/* Círculo de color con la identificación exacta de la columna EQUIPO */}
                  <div
                    className={`min-w-10 h-10 px-2 rounded-full flex items-center justify-center font-mono font-black text-xs shrink-0 border shadow-xs transition-colors ${circleBg}`}
                  >
                    {equipoLabel}
                  </div>

                  {/* Valor de porcentaje de cubrimiento de cada punto con alternancia rápida */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle100(pt);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border transition-transform active:scale-95 cursor-pointer shadow-xs ${badgeColor}`}
                    title={isDone ? 'Click para marcar 0%' : 'Click para marcar 100%'}
                  >
                    {isDone ? (
                      <span className="flex items-center gap-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>100%</span>
                      </span>
                    ) : (
                      <span>{progress}%</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Popover / Quick Management Drawer when clicking on any point */}
      {selectedPoint && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-2 sticky bottom-4 z-40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Identity */}
            <div className="flex items-center gap-3.5">
              <div className={`min-w-12 h-12 px-3 rounded-xl flex items-center justify-center font-mono font-black text-sm border-2 shadow-md ${
                is100Percent(selectedPoint)
                  ? 'bg-emerald-500 text-white border-emerald-400'
                  : getPointProgress(selectedPoint) > 0
                  ? 'bg-amber-500 text-white border-amber-400'
                  : 'bg-rose-500 text-white border-rose-400'
              }`}>
                {getNomenclature(selectedPoint)}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">
                    {getNomenclature(selectedPoint)} · {getCleanComponentName(selectedPoint)}
                  </h4>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                    is100Percent(selectedPoint)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${is100Percent(selectedPoint) ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                    <span>{is100Percent(selectedPoint) ? '100% Verde (Completado)' : 'Rojo (<100% Pendiente)'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Identificación EQUIPO: <span className="font-mono text-sky-400 font-bold">{getNomenclature(selectedPoint)}</span> · {formatBoxId(selectedPoint.boxId)} (Canal {selectedPoint.boxChannel}) · Técnico: {selectedPoint.technician || 'No asignado'}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* 1-Click Toggle 100% */}
              <button
                onClick={() => handleToggle100(selectedPoint)}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                  is100Percent(selectedPoint)
                    ? 'bg-rose-600 hover:bg-rose-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {is100Percent(selectedPoint) ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                    <span>Cambiar a Rojo (0%)</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Activar en Verde (100%)</span>
                  </>
                )}
              </button>

              <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block"></div>

              {/* Individual Stage Checkboxes */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => handleToggleStage(selectedPoint, 'sensorMounted')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    selectedPoint.stages?.sensorMounted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span>{selectedPoint.stages?.sensorMounted ? '✓' : '○'}</span>
                  <span>Sensor</span>
                </button>

                <button
                  onClick={() => handleToggleStage(selectedPoint, 'cablePulled')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    selectedPoint.stages?.cablePulled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span>{selectedPoint.stages?.cablePulled ? '✓' : '○'}</span>
                  <span>Cable</span>
                </button>

                <button
                  onClick={() => handleToggleStage(selectedPoint, 'connectedToJB')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                    selectedPoint.stages?.connectedToJB
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span>{selectedPoint.stages?.connectedToJB ? '✓' : '○'}</span>
                  <span>Conexión JB</span>
                </button>
              </div>

              {/* Modal full view */}
              {onSelectPoint && (
                <button
                  onClick={() => onSelectPoint(selectedPoint)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 ml-1 transition-colors cursor-pointer"
                >
                  <span>Ficha</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Close */}
              <button
                onClick={() => setSelectedPointId(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 ml-1 transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
