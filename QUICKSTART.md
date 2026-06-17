# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- MongoDB running (local or remote)
- npm or yarn package manager

## Step 1: Backend Setup

```bash
cd software/backend
npm install
```

Create `.env` file:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/water_quality_monitoring
JWT_SECRET=your-secret-key-here
DEVICE_API_KEYS=test_device_key_123
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
AI_DEBOUNCE_MS=5000
AI_ROLLING_WINDOW_SIZE=10
AI_TREND_DETECTION_SAMPLES=5
FRONTEND_URL=http://localhost:3000
FIREBASE_ENABLED=true
FIREBASE_DATABASE_URL=https://water-quality-43909-default-rtdb.firebaseio.com
FIREBASE_SERVICE_ACCOUNT_PATH=./water-quality-43909-firebase-adminsdk-fbsvc-ec33247bd7.json
FIREBASE_SENSOR_PATH=water-quality/current
FIREBASE_DEVICE_ID=HARDWARE_DEVICE_001
```

Start backend:
```bash
npm start
# or for development:
npm run dev
```

Backend should be running on `http://localhost:3001`

## Step 2: Frontend Setup

Open a new terminal:

```bash
cd software/frontend
npm install
npm run dev
```

Frontend should be running on `http://localhost:3000`

## Step 3: Test the System

### Option A: Using curl/Postman

Send a test sensor reading:

```bash
curl -X POST http://localhost:3001/api/v1/sensor/ingest \
  -H "Content-Type: application/json" \
  -H "X-API-Key: test_device_key_123" \
  -d '{
    "pH": 7.2,
    "tds": 350,
    "turbidity": 2.1,
    "temperature": 24.5
  }'
```

### Option B: Using the Dashboard

1. Open `http://localhost:3000` in your browser
2. Enter API key: `test_device_key_123`
3. Click "Connect"
4. Send sensor data using the curl command above
5. Watch the dashboard update in real-time

## ESP32 Integration

### Sample Arduino/ESP32 Code

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "http://YOUR_SERVER_IP:3001/api/v1/sensor/ingest";
const char* apiKey = "test_device_key_123";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-API-Key", apiKey);
    
    // Read your sensors here
    float pH = 7.2; // Replace with actual sensor reading
    float tds = 350;
    float turbidity = 2.1;
    float temperature = 24.5;
    
    StaticJsonDocument<200> doc;
    doc["pH"] = pH;
    doc["tds"] = tds;
    doc["turbidity"] = turbidity;
    doc["temperature"] = temperature;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    int httpResponseCode = http.POST(jsonString);
    
    if (httpResponseCode > 0) {
      Serial.print("Response code: ");
      Serial.println(httpResponseCode);
    } else {
      Serial.print("Error: ");
      Serial.println(httpResponseCode);
    }
    
    http.end();
  }
  
  delay(5000); // Send every 5 seconds
}
```

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `mongod` or check your MongoDB URI
- Check port 3001 is not in use
- Check `.env` file exists and has correct values

### Frontend won't connect
- Check backend is running on port 3001
- Check CORS settings in backend `.env` (FRONTEND_URL)
- Check browser console for errors

### No data showing
- Verify API key matches in `.env` and request header
- Check backend logs for errors
- Verify sensor data format matches expected schema

### AI not generating evaluations
- AI only generates evaluations on state changes or threshold breaches
- Try sending data with poor values (e.g., pH=4.0 or tds=2000) to trigger evaluation
- Check AI debounce settings in `.env`

## Next Steps

1. Configure your actual device API keys
2. Adjust AI thresholds in `backend/src/config/ai-thresholds.js`
3. Customize dashboard appearance
4. Set up production deployment
5. Configure email/SMS alerts (if needed)
