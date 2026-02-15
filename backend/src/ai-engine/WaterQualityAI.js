import { thresholds, trendThresholds, statusLevels, alertSeverity } from '../config/ai-thresholds.js';
import { AIEvaluation } from '../domain/models/AIEvaluation.js';
import { Alert } from '../domain/models/Alert.js';

/**
 * Local AI Engine: Water Quality Assessment
 * 
 * Design Philosophy:
 * - "Think fast, speak slowly"
 * - Evaluates every sample but emits opinions only on state changes
 * - Uses rolling windows and debouncing to prevent noise
 * - State machine: STABLE / WARNING / CRITICAL
 */
export class WaterQualityAI {
  constructor(config = {}) {
    this.debounceMs = config.debounceMs || 5000;
    this.rollingWindowSize = config.rollingWindowSize || 10;
    this.trendDetectionSamples = config.trendDetectionSamples || 5;
    
    // State tracking per device
    this.deviceStates = new Map(); // deviceId -> { lastEvaluation, lastEvaluationTime, recentReadings, currentState }
  }

  /**
   * Main evaluation method
   * Returns evaluation only if state changed or threshold breached
   */
  async evaluate(reading, recentReadings = []) {
    const deviceId = reading.deviceId;
    const now = Date.now();
    
    // Initialize device state if needed
    if (!this.deviceStates.has(deviceId)) {
      this.deviceStates.set(deviceId, {
        lastEvaluation: null,
        lastEvaluationTime: 0,
        recentReadings: [],
        currentState: 'UNKNOWN',
      });
    }
    
    const state = this.deviceStates.get(deviceId);
    
    // Add reading to rolling window
    state.recentReadings.push({
      reading,
      timestamp: now,
    });
    
    // Keep only recent readings
    if (state.recentReadings.length > this.rollingWindowSize) {
      state.recentReadings.shift();
    }
    
    // Analyze current reading
    const analysis = this._analyzeReading(reading, state.recentReadings.map(r => r.reading));
    
    // Check if we should emit a new evaluation
    const shouldEmit = this._shouldEmitEvaluation(state, analysis, now);
    
    if (!shouldEmit) {
      return null; // No new evaluation needed
    }
    
    // Generate evaluation
    const evaluation = this._generateEvaluation(reading, analysis, state);
    
    // Extract alerts from analysis
    const alerts = analysis.alerts || [];
    
    // Update state
    state.lastEvaluation = evaluation;
    state.lastEvaluationTime = now;
    state.currentState = evaluation.status;
    
    return {
      evaluation,
      alerts,
    };
  }

  /**
   * Analyze a reading and recent history
   */
  _analyzeReading(reading, recentReadings) {
    const analysis = {
      parameters: {},
      trends: {},
      overallStatus: statusLevels.EXCELLENT,
      issues: [],
      alerts: [],
    };
    
    // Analyze each parameter
    analysis.parameters.pH = this._analyzeParameter('pH', reading.pH, recentReadings);
    analysis.parameters.tds = this._analyzeParameter('tds', reading.tds, recentReadings);
    analysis.parameters.turbidity = this._analyzeParameter('turbidity', reading.turbidity, recentReadings);
    analysis.parameters.temperature = this._analyzeParameter('temperature', reading.temperature, recentReadings);
    
    if (reading.dissolvedOxygen !== null) {
      analysis.parameters.dissolvedOxygen = this._analyzeParameter('dissolvedOxygen', reading.dissolvedOxygen, recentReadings);
    }
    
    // Determine overall status (worst parameter wins)
    const statuses = Object.values(analysis.parameters).map(p => p.status);
    analysis.overallStatus = this._determineOverallStatus(statuses);
    
    // Detect trends
    if (recentReadings.length >= this.trendDetectionSamples) {
      analysis.trends = this._detectTrends(recentReadings);
    }
    
    // Identify issues and generate alerts
    analysis.issues = this._identifyIssues(analysis);
    analysis.alerts = this._generateAlerts(reading, analysis);
    
    return analysis;
  }

  /**
   * Analyze a single parameter
   */
  _analyzeParameter(name, value, recentReadings) {
    const paramThresholds = thresholds[name];
    if (!paramThresholds) {
      return { status: statusLevels.ACCEPTABLE, level: 'unknown', value };
    }
    
    let status = statusLevels.POOR;
    let level = 'poor';
    
    // Check thresholds (from best to worst)
    if (this._isInRange(value, paramThresholds.excellent)) {
      status = statusLevels.EXCELLENT;
      level = 'excellent';
    } else if (this._isInRange(value, paramThresholds.good)) {
      status = statusLevels.GOOD;
      level = 'good';
    } else if (this._isInRange(value, paramThresholds.acceptable)) {
      status = statusLevels.ACCEPTABLE;
      level = 'acceptable';
    }
    
    return {
      name,
      value,
      status,
      level,
      thresholds: paramThresholds,
    };
  }

  /**
   * Check if value is within range
   */
  _isInRange(value, range) {
    if (range.min !== undefined && value < range.min) return false;
    if (range.max !== undefined && value > range.max) return false;
    return true;
  }

  /**
   * Determine overall status from parameter statuses
   */
  _determineOverallStatus(statuses) {
    const priority = {
      [statusLevels.CRITICAL]: 5,
      [statusLevels.POOR]: 4,
      [statusLevels.ACCEPTABLE]: 3,
      [statusLevels.GOOD]: 2,
      [statusLevels.EXCELLENT]: 1,
    };
    
    const worstStatus = statuses.reduce((worst, current) => {
      return priority[current] > priority[worst] ? current : worst;
    }, statusLevels.EXCELLENT);
    
    return worstStatus;
  }

  /**
   * Detect trends in recent readings
   */
  _detectTrends(recentReadings) {
    if (recentReadings.length < this.trendDetectionSamples) {
      return {};
    }
    
    const trends = {};
    const samples = recentReadings.slice(-this.trendDetectionSamples);
    
    ['pH', 'tds', 'turbidity', 'temperature', 'dissolvedOxygen'].forEach(param => {
      const values = samples.map(r => r[param]).filter(v => v !== null && v !== undefined);
      if (values.length < 2) return;
      
      // Calculate rate of change
      const first = values[0];
      const last = values[values.length - 1];
      const change = last - first;
      const changePerSample = change / (values.length - 1);
      
      const trendThreshold = trendThresholds[param];
      if (!trendThreshold) return;
      
      const absChange = Math.abs(changePerSample);
      
      if (absChange >= trendThreshold.critical) {
        trends[param] = {
          direction: change > 0 ? 'increasing' : 'decreasing',
          severity: 'critical',
          rate: changePerSample,
        };
      } else if (absChange >= trendThreshold.warning) {
        trends[param] = {
          direction: change > 0 ? 'increasing' : 'decreasing',
          severity: 'warning',
          rate: changePerSample,
        };
      }
    });
    
    return trends;
  }

  /**
   * Identify issues from analysis
   */
  _identifyIssues(analysis) {
    const issues = [];
    
    Object.entries(analysis.parameters).forEach(([name, param]) => {
      if (param.status === statusLevels.POOR || param.status === statusLevels.CRITICAL) {
        issues.push({
          parameter: name,
          status: param.status,
          value: param.value,
          message: `${name.toUpperCase()} is ${param.level} (${param.value})`,
        });
      }
    });
    
    // Check for critical trends
    Object.entries(analysis.trends).forEach(([param, trend]) => {
      if (trend.severity === 'critical') {
        issues.push({
          parameter: param,
          status: statusLevels.CRITICAL,
          trend: true,
          message: `${param.toUpperCase()} is ${trend.direction} rapidly (${trend.rate.toFixed(2)} per sample)`,
        });
      }
    });
    
    return issues;
  }

  /**
   * Generate alerts from analysis
   */
  _generateAlerts(reading, analysis) {
    const alerts = [];
    
    // Parameter threshold alerts
    Object.entries(analysis.parameters).forEach(([name, param]) => {
      if (param.status === statusLevels.CRITICAL) {
        alerts.push(new Alert({
          deviceId: reading.deviceId,
          timestamp: reading.timestamp,
          severity: alertSeverity.CRITICAL,
          title: `Critical ${name.toUpperCase()} Level`,
          message: `${name.toUpperCase()} is at critical level: ${param.value}`,
          parameter: name,
          value: param.value,
          threshold: param.thresholds,
        }));
      } else if (param.status === statusLevels.POOR) {
        alerts.push(new Alert({
          deviceId: reading.deviceId,
          timestamp: reading.timestamp,
          severity: alertSeverity.HIGH,
          title: `Poor ${name.toUpperCase()} Level`,
          message: `${name.toUpperCase()} is outside acceptable range: ${param.value}`,
          parameter: name,
          value: param.value,
          threshold: param.thresholds,
        }));
      }
    });
    
    // Trend alerts
    Object.entries(analysis.trends).forEach(([param, trend]) => {
      if (trend.severity === 'critical') {
        alerts.push(new Alert({
          deviceId: reading.deviceId,
          timestamp: reading.timestamp,
          severity: alertSeverity.CRITICAL,
          title: `Critical Trend Detected: ${param.toUpperCase()}`,
          message: `${param.toUpperCase()} is ${trend.direction} rapidly at rate of ${trend.rate.toFixed(2)} per sample`,
          parameter: param,
          value: reading[param],
          threshold: { rate: trend.rate },
        }));
      } else if (trend.severity === 'warning') {
        alerts.push(new Alert({
          deviceId: reading.deviceId,
          timestamp: reading.timestamp,
          severity: alertSeverity.MEDIUM,
          title: `Trend Warning: ${param.toUpperCase()}`,
          message: `${param.toUpperCase()} is ${trend.direction} at rate of ${trend.rate.toFixed(2)} per sample`,
          parameter: param,
          value: reading[param],
          threshold: { rate: trend.rate },
        }));
      }
    });
    
    return alerts;
  }

  /**
   * Determine if evaluation should be emitted
   * Returns true if:
   * - State changed
   * - Threshold breached
   * - Trend detected
   * - Debounce period elapsed
   */
  _shouldEmitEvaluation(state, analysis, now) {
    // First evaluation
    if (!state.lastEvaluation) {
      return true;
    }
    
    // State changed
    if (state.currentState !== analysis.overallStatus) {
      return true;
    }
    
    // Critical status always emits
    if (analysis.overallStatus === statusLevels.CRITICAL) {
      return true;
    }
    
    // Alerts triggered
    if (analysis.alerts.length > 0) {
      return true;
    }
    
    // Significant trend detected
    if (Object.keys(analysis.trends).length > 0) {
      const hasCriticalTrend = Object.values(analysis.trends).some(t => t.severity === 'critical');
      if (hasCriticalTrend) {
        return true;
      }
    }
    
    // Debounce check (don't emit too frequently)
    const timeSinceLastEvaluation = now - state.lastEvaluationTime;
    if (timeSinceLastEvaluation >= this.debounceMs) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate evaluation object
   */
  _generateEvaluation(reading, analysis, state) {
    const explanation = this._generateExplanation(analysis);
    const reasoning = this._generateReasoning(analysis);
    const suggestedAction = this._generateSuggestedAction(analysis);
    const triggerReason = this._determineTriggerReason(state, analysis);
    
    return new AIEvaluation({
      deviceId: reading.deviceId,
      timestamp: reading.timestamp,
      status: analysis.overallStatus,
      explanation,
      reasoning,
      suggestedAction,
      confidence: 1.0,
      triggerReason,
    });
  }

  /**
   * Generate human-readable explanation
   */
  _generateExplanation(analysis) {
    const status = analysis.overallStatus;
    const issues = analysis.issues;
    
    if (status === statusLevels.EXCELLENT) {
      return 'Water quality is excellent. All parameters are within optimal ranges.';
    } else if (status === statusLevels.GOOD) {
      return 'Water quality is good. All parameters are within acceptable ranges.';
    } else if (status === statusLevels.ACCEPTABLE) {
      return 'Water quality is acceptable but some parameters are approaching limits.';
    } else if (status === statusLevels.POOR) {
      const issueList = issues.slice(0, 2).map(i => i.parameter).join(', ');
      return `Water quality is poor. Issues detected in: ${issueList}. Immediate attention recommended.`;
    } else if (status === statusLevels.CRITICAL) {
      const issueList = issues.slice(0, 2).map(i => i.parameter).join(', ');
      return `CRITICAL: Water quality is unsafe. Critical issues in: ${issueList}. Immediate action required.`;
    }
    
    return 'Water quality assessment unavailable.';
  }

  /**
   * Generate detailed reasoning per parameter
   */
  _generateReasoning(analysis) {
    const reasoning = {};
    
    Object.entries(analysis.parameters).forEach(([name, param]) => {
      reasoning[name] = {
        value: param.value,
        status: param.status,
        level: param.level,
        message: `${name.toUpperCase()} is ${param.level} at ${param.value}`,
      };
    });
    
    if (Object.keys(analysis.trends).length > 0) {
      reasoning.trends = analysis.trends;
    }
    
    return reasoning;
  }

  /**
   * Generate suggested action
   */
  _generateSuggestedAction(analysis) {
    if (analysis.overallStatus === statusLevels.EXCELLENT || analysis.overallStatus === statusLevels.GOOD) {
      return null; // No action needed
    }
    
    const criticalIssues = analysis.issues.filter(i => i.status === statusLevels.CRITICAL);
    if (criticalIssues.length > 0) {
      const param = criticalIssues[0].parameter;
      return `Immediate action required: Address ${param.toUpperCase()} levels. Consider water treatment or system shutdown.`;
    }
    
    const poorIssues = analysis.issues.filter(i => i.status === statusLevels.POOR);
    if (poorIssues.length > 0) {
      const param = poorIssues[0].parameter;
      return `Monitor ${param.toUpperCase()} closely. Consider preventive measures to avoid further degradation.`;
    }
    
    return 'Continue monitoring. Water quality requires attention.';
  }

  /**
   * Determine why this evaluation was triggered
   */
  _determineTriggerReason(state, analysis) {
    if (!state.lastEvaluation) {
      return 'INITIAL_EVALUATION';
    }
    
    if (state.currentState !== analysis.overallStatus) {
      return `STATE_CHANGE: ${state.currentState} -> ${analysis.overallStatus}`;
    }
    
    if (analysis.alerts.length > 0) {
      return `ALERT_TRIGGERED: ${analysis.alerts[0].title}`;
    }
    
    if (Object.keys(analysis.trends).length > 0) {
      return `TREND_DETECTED: ${Object.keys(analysis.trends).join(', ')}`;
    }
    
    return 'PERIODIC_UPDATE';
  }
}
