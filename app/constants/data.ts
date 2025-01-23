export interface DataPoint extends Record<string, unknown> {
  timestamp: number;
  pressure: number;
  flowrate: number;
  weight: number;
}