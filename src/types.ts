/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PointType = 'dryer' | 'felt_roll_upper' | 'felt_roll_pocket' | 'pinion';

export type PointStatus = 'pending' | 'in_progress' | 'installed' | 'verified';

export type BoxId = 'JB #1' | 'JB #2' | 'JB #3' | 'JB Area 1' | 'JB Area 2' | 'JB Area 3' | 'Área Sótano' | string;

export interface PointStages {
  baseMachined?: boolean;
  sensorMounted?: boolean;
  conduitInstalled?: boolean;
  cablePulled?: boolean;
  connectedToJB?: boolean;
  biasVerified?: boolean;
  vibrationTestOk?: boolean;
  [key: string]: boolean | undefined;
}

export interface MeasurementPoint {
  id: string;
  tag: string;
  name: string;
  type: PointType;
  boxId: BoxId;
  boxChannel: number;
  area?: number | 1 | 2 | 3 | 4 | string;
  side?: string;
  orientation?: string;
  sensorModel?: string;
  sensorSerial?: string;
  cableMeters?: number;
  cableLength?: number;
  cableTag?: string;
  condition?: 'nuevo' | 'viejo' | null | string;
  mountingType?: 'disco' | 'perforacion' | string | null;
  biasVoltage?: number | null;
  status: PointStatus;
  stages: PointStages;
  costHardware?: number;
  costCableAndConduit?: number;
  costLabor?: number;
  notes?: string;
  technician?: string;
  installedDate?: string;
  lastUpdated?: string;
  originalLabel?: string;
  coordinates?: { x: number; y: number };
}

export type MaterialCategory = 'sensors' | 'cables' | 'conduit' | 'mounting' | 'junction_boxes' | 'tools' | 'consumables' | string;

export interface MaterialItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: MaterialCategory;
  requiredQty: number;
  installedQty: number;
  unitCost: number;
  unit?: string;
  stockQty: number;
  minStockThreshold?: number;
  quantityNeeded?: number;
  quantityInstalled?: number;
  quantityInStock?: number;
  supplier?: string;
  imageUrl?: string;
  notes?: string;
}

export interface CostCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  committed?: number;
  actual?: number;
  description?: string;
}

export interface JunctionBox {
  id: BoxId;
  name: string;
  location?: string;
  totalChannels: number;
  usedChannels?: number;
  status?: string;
  enclosureType?: string;
  notes?: string;
}
