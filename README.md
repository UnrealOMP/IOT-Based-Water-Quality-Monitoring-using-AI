# Water Quality Monitoring Platform

Production-grade IoT-based Water Quality Monitoring Platform using MERN stack with local AI engine.

## Architecture

- **Backend**: Node.js + Express (Clean Architecture)
- **Frontend**: React + Vite
- **Database**: MongoDB (time-series optimized)
- **AI Engine**: Local rule-based + statistical engine (no cloud AI)

## Project Structure

```
software/
├── backend/          # Node.js backend
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── domain/       # Domain models
│   │   ├── database/     # MongoDB schemas
│   │   ├── repositories/ # Data access layer
│   │   ├── services/     # Business logic
│   │   ├── ai-engine/   # Local AI engine
│   │   ├── controllers/  # HTTP controllers
│   │   ├── middlewares/ # Express middlewares
│   │   ├── routes/       # API routes
│   │   └── server.js     # Entry point
│   └── package.json
└── frontend/         # React frontend
    ├── src/
    │   ├── components/   # React components
    │   ├── services/     # API services
    │   ├── config/       # Configuration
    │   └── App.jsx       # Main app
    └── package.json
```

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd software/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure `.env`:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `DEVICE_API_KEYS` with your device API keys (comma-separated)
   - Set `JWT_SECRET` for user authentication
   - Set Firebase variables (see below)
   - Adjust other settings as needed

Firebase configuration (optional, enabled by default):

```env
FIREBASE_ENABLED=true
FIREBASE_DATABASE_URL=https://water-quality-43909-default-rtdb.firebaseio.com
FIREBASE_SERVICE_ACCOUNT_PATH=./water-quality-43909-firebase-adminsdk-fbsvc-ec33247bd7.json
FIREBASE_SENSOR_PATH=water-quality/current
FIREBASE_DEVICE_ID=HARDWARE_DEVICE_001
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd software/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Sensor Ingestion
- `POST /api/v1/sensor/ingest` - Ingest sensor data (requires X-API-Key header)

### Sensor Data
- `GET /api/v1/sensor/latest/:deviceId?` - Get latest reading
- `GET /api/v1/sensor/recent/:deviceId?` - Get recent readings
- `GET /api/v1/sensor/dashboard/:deviceId?` - Get dashboard summary

### AI Evaluations
- `GET /api/v1/ai/latest/:deviceId?` - Get latest AI evaluation
- `GET /api/v1/ai/recent/:deviceId?` - Get recent evaluations

### Alerts
- `GET /api/v1/alerts/:deviceId?` - Get alerts
- `POST /api/v1/alerts/:alertId/acknowledge` - Acknowledge alert

### Live Firebase Data
- `GET /api/live-data` - Latest processed sensor values from Firebase Realtime Database
- Socket.io event `sensor-update` - Real-time push when Firebase `/water-quality/current` changes

## ESP32 Integration

ESP32 devices can write processed sensor values directly to Firebase Realtime Database at `/water-quality/current`:

```json
{
  "ph": 6.6,
  "tds": 0,
  "temperature": 32.9,
  "turbidity": 97,
  "timestamp": 179710
}
```

The backend listens to this path, caches live data, pushes updates via Socket.io, and persists readings to MongoDB for AI evaluation.

Alternatively, send HTTP POST to `/api/v1/sensor/ingest`:

### Sensor Data Format

Send POST request to `/api/v1/sensor/ingest` with:

```json
{
  "pH": 7.2,
  "tds": 350,
  "turbidity": 2.1,
  "temperature": 24.5,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Headers Required

```
X-API-Key: your_device_api_key
Content-Type: application/json
```

### Example ESP32 Code (Arduino)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://your-server:3001/api/v1/sensor/ingest";
const char* apiKey = "your_device_api_key";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", apiKey);
    
    // Read sensors (example values)
    float pH = readPH();
    float tds = readTDS();
    float turbidity = readTurbidity();
    float temperature = readTemperature();
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["pH"] = pH;
    doc["tds"] = tds;
    doc["turbidity"] = turbidity;
    doc["temperature"] = temperature;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.println("Data sent successfully");
    }
    
    http.end();
  }
  
  delay(5000); // Send every 5 seconds
}
```

## AI Engine Behavior

The AI engine follows a "think fast, speak slowly" approach:

- **Evaluates every sample** but **emits opinions only on**:
  - State changes (e.g., GOOD → POOR)
  - Threshold breaches
  - Trend detection (rapid degradation/improvement)
  - Debounce period elapsed (default: 5 seconds)

This prevents flickering and noisy outputs while maintaining real-time responsiveness.

## Configuration

### AI Thresholds

Edit `backend/src/config/ai-thresholds.js` to adjust water quality thresholds.

### AI Engine Parameters

Configure in `.env`:
- `AI_DEBOUNCE_MS`: Minimum time between evaluations (default: 5000ms)
- `AI_ROLLING_WINDOW_SIZE`: Number of samples for trend analysis (default: 10)
- `AI_TREND_DETECTION_SAMPLES`: Samples needed for trend detection (default: 5)

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a production MongoDB instance
3. Configure proper CORS origins
4. Set up reverse proxy (nginx) for HTTPS
5. Use PM2 or similar for process management
6. Configure proper logging and monitoring

## License

ISC
