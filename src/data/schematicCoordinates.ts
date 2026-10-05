/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MeasurementPoint } from '../types';

export const getPointCoordinates = (point: Partial<MeasurementPoint>): { x: number; y: number } => {
  if (point.coordinates && typeof point.coordinates.x === 'number' && typeof point.coordinates.y === 'number') {
    return point.coordinates;
  }

  const channel = point.boxChannel || 1;
  const col = (channel - 1) % 12;
  const row = Math.floor((channel - 1) / 12);

  return {
    x: 80 + col * 75,
    y: 120 + row * 100,
  };
};
