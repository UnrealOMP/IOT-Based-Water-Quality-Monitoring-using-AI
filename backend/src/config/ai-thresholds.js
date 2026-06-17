/**
 * AI Engine Threshold Configuration
 * All thresholds are config-driven and can be adjusted per deployment
 * 
 * Thresholds are based on standard water quality parameters:
 * - pH: 6.5-8.5 is acceptable for most uses
 * - TDS: < 500 ppm is good, 500-1000 acceptable, >1000 poor
 * - Turbidity: < 1 NTU is excellent, 1-5 acceptable, >5 poor
 * - Temperature: 20-30°C is ideal for most applications
 */

export const thresholds = {
  pH: {
    excellent: { min: 7.0, max: 7.5 },
    good: { min: 6.5, max: 8.0 },
    acceptable: { min: 6.0, max: 8.5 },
    // Outside acceptable range is poor
  },
  tds: {
    excellent: { max: 300 }, // ppm
    good: { max: 500 },
    acceptable: { max: 1000 },
    // > 1000 is poor
  },
  turbidity: {
    excellent: { max: 1 }, // NTU
    good: { max: 3 },
    acceptable: { max: 5 },
    // > 5 is poor
  },
  temperature: {
    excellent: { min: 22, max: 26 }, // Celsius
    good: { min: 20, max: 28 },
    acceptable: { min: 18, max: 30 },
    // Outside acceptable range is poor
  },
};

/**
 * Rate of change thresholds for trend detection
 * These determine if a parameter is degrading or improving rapidly
 */
export const trendThresholds = {
  pH: { critical: 0.5, warning: 0.3 }, // per sample
  tds: { critical: 100, warning: 50 }, // ppm per sample
  turbidity: { critical: 2, warning: 1 }, // NTU per sample
  temperature: { critical: 3, warning: 1.5 }, // Celsius per sample
};

/**
 * Overall water quality status mapping
 */
export const statusLevels = {
  EXCELLENT: 'EXCELLENT',
  GOOD: 'GOOD',
  ACCEPTABLE: 'ACCEPTABLE',
  POOR: 'POOR',
  CRITICAL: 'CRITICAL',
};

/**
 * Alert severity levels
 */
export const alertSeverity = {
  INFO: 'INFO',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};
