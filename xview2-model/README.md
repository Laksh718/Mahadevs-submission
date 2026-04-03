# xView2 Flood Damage Detection for JalRakshak

## 🎯 Overview

This is an AI-powered flood damage detection system specifically designed for the JalRakshak Flood Early Warning System. It uses the xView2 model to analyze flood damage images and provides Indian-specific damage assessments with NDMA relief recommendations.

## 🚀 Features

- **AI-Powered Analysis**: Uses xView2 ResNet50 FPN model for damage detection
- **Indian Cost Mapping**: NDMA and SDRF relief amount calculations
- **Bilingual Support**: Hindi and English interface
- **State-wise Customization**: Different relief amounts for different states
- **Emergency Integration**: Direct contact to disaster management authorities
- **Cloud-Ready**: Deployable on Google Cloud Run
- **Firebase Integration**: Seamless integration with JalRakshak app

## 📁 Project Structure

```
xview2-model/
├── api.py                      # FastAPI service
├── inference.py                # xView2 model inference
├── indian_damage_mapping.py    # Indian cost mapping and NDMA categories
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker configuration
├── cloudbuild.yaml            # Google Cloud Build config
├── deploy.sh                  # Deployment script
└── README.md                  # This file
```

## 🛠️ Installation

### Local Development

```bash
# Clone the repository
git clone <your-repo>
cd xview2-model

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run locally
python api.py
```

### Docker Deployment

```bash
# Build Docker image
docker build -t xview2-damage-detection .

# Run locally
docker run -p 8080:8080 xview2-damage-detection

# Deploy to Google Cloud Run
./deploy.sh
```

## 🔧 Configuration

### Environment Variables

```bash
# Required
PORT=8080
PYTHONPATH=/app

# Optional
XVIEW2_MODEL_PATH=/path/to/model/weights
DEVICE=cpu  # or cuda
```

### State Configuration

The system supports multiple Indian states with different relief amounts:

- **Punjab**: ₹4L (Category A), ₹2L (Category B), ₹50K (Category C)
- **Haryana**: ₹3.5L (Category A), ₹1.8L (Category B), ₹45K (Category C)
- **Himachal Pradesh**: ₹4.5L (Category A), ₹2.2L (Category B), ₹55K (Category C)

## 📡 API Endpoints

### POST /analyze

Analyze flood damage from image URL.

**Request:**
```json
{
  "image_url": "https://example.com/flood-image.jpg",
  "state": "punjab",
  "latitude": 30.7333,
  "longitude": 76.7794,
  "user_id": "user123"
}
```

**Response:**
```json
{
  "damage_level": "Major Damage",
  "hindi_damage_level": "बड़ा नुकसान",
  "confidence": 0.87,
  "estimated_cost_display": "₹1L - ₹3L",
  "ndma_category": "Category B",
  "relief_amount_display": "₹2L",
  "color": "#EF4444",
  "description": "Significant structural damage, requires major repairs",
  "hindi_description": "काफी संरचनात्मक नुकसान, बड़ी मरम्मत की जरूरत",
  "recommendations": {
    "immediate_actions": [
      "Evacuate if structure is unsafe",
      "Contact emergency services immediately",
      "Document damage extensively"
    ],
    "relief_application": {
      "required": true,
      "category": "Category B",
      "amount": "₹2L",
      "form": "SDRF Form 1B",
      "deadline": "Within 15 days of incident"
    },
    "documentation_required": [
      "Structural engineer's assessment",
      "Damage assessment report",
      "Property ownership documents"
    ],
    "timeline": "Apply within 15 days, processing takes 10-20 days"
  },
  "emergency_contacts": {
    "disaster_control": "+91-172-2740000",
    "relief_commissioner": "+91-172-2740001",
    "district_collector": "+91-172-2740002"
  },
  "state": "Punjab"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_info": {
    "model_name": "xView2 Flood Damage Detection",
    "version": "1.0",
    "device": "cpu",
    "num_classes": 4,
    "classes": ["no-damage", "minor-damage", "major-damage", "destroyed"]
  }
}
```

### GET /states

Get list of supported states.

**Response:**
```json
{
  "supported_states": ["punjab", "haryana", "himachal_pradesh", "default"],
  "count": 4
}
```

## 🧪 Testing

### Unit Tests

```bash
# Run tests
python -m pytest tests/

# Run with coverage
python -m pytest tests/ --cov=.
```

### API Testing

```bash
# Test health endpoint
curl http://localhost:8080/health

# Test analysis endpoint
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/test-image.jpg",
    "state": "punjab"
  }'
```

## 🚀 Deployment

### Google Cloud Run

1. **Set up Google Cloud Project**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   gcloud services enable cloudbuild.googleapis.com run.googleapis.com
   ```

2. **Deploy using Cloud Build**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/xview2-damage-detection
   gcloud run deploy xview2-damage-detection \
     --image gcr.io/YOUR_PROJECT_ID/xview2-damage-detection \
     --region asia-south1 \
     --platform managed \
     --allow-unauthenticated \
     --memory 2Gi \
     --cpu 2
   ```

3. **Deploy using script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Docker Compose

```yaml
version: '3.8'
services:
  xview2-api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - DEVICE=cpu
    volumes:
      - ./models:/app/models
```

## 📊 Monitoring

### Health Checks

- **Endpoint**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 30 seconds

### Logging

- **Level**: INFO
- **Format**: JSON
- **Output**: Cloud Logging (GCP) or stdout

### Metrics

- Request count
- Response time
- Error rate
- Model inference time

## 🔒 Security

### Authentication

- API key authentication (optional)
- CORS configuration
- Rate limiting

### Data Privacy

- No image storage
- Temporary processing only
- GDPR compliant

## 🛠️ Development

### Adding New States

1. Update `indian_damage_mapping.py`
2. Add state to `state_relief_amounts`
3. Add emergency contacts
4. Test with sample data

### Customizing Cost Mapping

1. Edit `indian_damage_mapping.py`
2. Update `damage_categories` dictionary
3. Modify cost ranges and relief amounts
4. Test with different damage levels

### Model Updates

1. Replace model weights in `inference.py`
2. Update model architecture if needed
3. Test with sample images
4. Deploy new version

## 📞 Support

For issues or questions:
- Check logs: `gcloud logs read --service=xview2-damage-detection`
- Test API: Use the `/health` endpoint
- Verify configuration: Check environment variables

## 📄 License

This project is part of the JalRakshak Flood Early Warning System and is designed for Indian disaster management use.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 🎯 Roadmap

- [ ] Add more Indian states
- [ ] Implement real-time video analysis
- [ ] Add damage severity scoring
- [ ] Integrate with government databases
- [ ] Add mobile app support
- [ ] Implement offline mode
