# AquaSmart Frontend - Backend Integration

## API Integration

The frontend has been successfully integrated with the AquaSmart backend API. The following components now fetch real-time data from your backend:

### Connected Pages
- **Dashboard**: Shows real-time sensor data for pH, Turbidity, and TDS
- **pH Level**: Dedicated pH monitoring with real-time updates
- **Turbidity**: Dedicated turbidity monitoring with real-time updates  
- **History**: Historical data view with all sensor readings

### Backend Configuration

The frontend is configured to connect to your backend at:
```
http://localhost:8080/api/v1/sensors/latest
```

Make sure your backend is running on port 8080 before starting the frontend.

### Features

1. **Real-time Data**: Automatically refreshes sensor data every 30 seconds
2. **Error Handling**: Shows appropriate error messages if backend is not available
3. **Status Indicators**: Color-coded status based on safe water parameters:
   - **pH**: Safe range 6.5-8.5 (WHO standards)
   - **Turbidity**: Safe range 0-1 NTU (WHO standards)  
   - **TDS**: Safe range 300-600 mg/L

4. **History Export**: Export historical data to CSV format
5. **Search & Filter**: Search through historical data by any parameter
6. **Responsive Design**: Works on desktop and mobile devices

### How to Start

1. **Start Backend Server** (make sure it's running on localhost:8080)
2. **Start Frontend**:
   ```bash
   npm run dev
   ```
3. **Open Browser**: Navigate to http://localhost:5173

### Data Structure

The frontend expects the backend API to return data in this format:
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2025-09-29T09:37:24.903784Z",
      "filter_mode": "drinking_water",
      "flow": 2.5,
      "ph": 7.2,
      "turbidity": 1.5,
      "tds": 250
    }
  ]
}
```

### Troubleshooting

If you see "Error loading sensor data" messages:
1. Check if backend is running on localhost:8080
2. Check if the API endpoint `/api/v1/sensors/latest` is accessible
3. Check browser console for CORS or network errors
4. Ensure the backend returns data in the expected JSON format

### Safety Thresholds

The frontend includes safety monitoring with these thresholds:

**pH Levels:**
- Safe: 6.5 - 8.5
- Warning: 6.0 - 6.5 or 8.5 - 9.0  
- Danger: < 6.0 or > 9.0

**Turbidity (NTU):**
- Safe: 0 - 1.0
- Warning: 1.0 - 4.0
- Danger: > 4.0

**TDS (mg/L):**
- Safe: 300 - 600
- Warning: 150 - 300 or 600 - 1000
- Danger: < 150 or > 1000