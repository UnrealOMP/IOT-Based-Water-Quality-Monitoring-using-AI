import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import { readFileSync } from 'fs';
import { config } from '../config/index.js';
import { logger } from '../config/logger.js';
import { SensorIngestionService } from './SensorIngestionService.js';

let latestLiveData = null;
let lastProcessedTimestamp = null;
let sensorRef = null;
let valueListener = null;
let ingestionService = null;

function normalizeLiveData(raw) {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const ph = raw.ph ?? raw.pH;
  const tds = raw.tds;
  const temperature = raw.temperature;
  const turbidity = raw.turbidity;
  const timestamp = raw.timestamp;

  if (
    ph === undefined ||
    tds === undefined ||
    temperature === undefined ||
    turbidity === undefined ||
    timestamp === undefined
  ) {
    return null;
  }

  return {
    ph: Number(ph),
    tds: Number(tds),
    temperature: Number(temperature),
    turbidity: Number(turbidity),
    timestamp,
  };
}

function toIngestPayload(liveData) {
  return {
    pH: liveData.ph,
    tds: liveData.tds,
    turbidity: liveData.turbidity,
    temperature: liveData.temperature,
    timestamp: new Date().toISOString(),
    metadata: {
      source: 'firebase',
      firebaseTimestamp: liveData.timestamp,
    },
  };
}

function initializeFirebaseAdmin() {
  try {
    // Return existing database instance if already initialized
    if (getApps().length > 0) {
      return getDatabase();
    }

    logger.info(
      `Loading Firebase service account from: ${config.firebase.serviceAccountPath}`
    );

    const fileContent = readFileSync(
      config.firebase.serviceAccountPath,
      'utf8'
    );

    const serviceAccount = JSON.parse(fileContent);

    initializeApp({
      credential: cert(serviceAccount),
      databaseURL: config.firebase.databaseURL,
    });

    logger.info('Firebase Admin initialized successfully');

    return getDatabase();
  } catch (error) {
    logger.error( 
      `Firebase initialization failed: ${error.message}`,
      error
    );
    throw error;
  }
}

async function handleSnapshot(snapshot, onUpdate) {
  const liveData = normalizeLiveData(snapshot.val());
  if (!liveData) {
    logger.warn('Firebase snapshot missing required sensor fields');
    return;
  }

  if (lastProcessedTimestamp === liveData.timestamp) {
    return;
  }

  lastProcessedTimestamp = liveData.timestamp;
  latestLiveData = liveData;

  if (onUpdate) {
    onUpdate(liveData);
  }

  if (!ingestionService) {
    ingestionService = new SensorIngestionService();
  }

  try {
    await ingestionService.ingestReading(
      toIngestPayload(liveData),
      config.firebase.deviceId
    );
    logger.info(
      `Firebase reading ingested for ${config.firebase.deviceId} (timestamp: ${liveData.timestamp})`
    );
  } catch (error) {
    logger.error(`Firebase ingest failed: ${error.message}`, error);
  }
}

export function getLatestLiveData() {
  return latestLiveData;
}

export function initFirebaseListener(onUpdate) {
  if (!config.firebase.enabled) {
    logger.info('Firebase listener disabled');
    return;
  }

  const db = initializeFirebaseAdmin();
  sensorRef = db.ref(config.firebase.sensorPath);

  valueListener = (snapshot) => {
    handleSnapshot(snapshot, onUpdate).catch((error) => {
      logger.error(`Firebase snapshot handler error: ${error.message}`, error);
    });
  };

  sensorRef.on('value', valueListener);
  logger.info(`Firebase listener started on /${config.firebase.sensorPath}`);
}

export function stopFirebaseListener() {
  if (sensorRef && valueListener) {
    sensorRef.off('value', valueListener);
    sensorRef = null;
    valueListener = null;
    logger.info('Firebase listener stopped');
  }
}
