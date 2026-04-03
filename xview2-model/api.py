"""
FastAPI Service for xView2 Flood Damage Detection
Deployed on Google Cloud Run for JalRakshak Flood Early Warning System
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import tempfile
import os
import json
import logging
from typing import Optional
from inference import xView2Inference
from indian_damage_mapping import IndianDamageMapper

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="JalRakshak Flood Damage Detection API",
    description="AI-powered flood damage assessment for Indian disaster management",
    version="1.0.0"
)
 #add cors middle
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model (lazy loading)
model_instance = None
damage_mapper = IndianDamageMapper()

def get_model():
    """Get or initialize model instance"""
    global model_instance
    if model_instance is None:
        logger.info("Initializing xView2 model...")
        model_instance = xView2Inference(device="cpu")  # Use CPU for Cloud Run
        logger.info("Model initialized successfully")
    return model_instance

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "JalRakshak Flood Damage Detection API",
        "status": "healthy",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        model = get_model()
        model_info = model.get_model_info()
        return {
            "status": "healthy",
            "model_loaded": True,
            "model_info": model_info
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "model_loaded": False,
            "error": str(e)
        }

@app.post("/analyze")
async def analyze_damage(
    file: UploadFile = File(...),
    state: str = Form(default="punjab"),
    latitude: Optional[float] = Form(default=None),
    longitude: Optional[float] = Form(default=None),
    user_id: Optional[str] = Form(default=None)
):
    """
    Analyze flood damage from uploaded image
    
    Args:
        file: Image file (JPEG, PNG)
        state: Indian state (default: punjab)
        latitude: GPS latitude (optional)
        longitude: GPS longitude (optional)
        user_id: User identifier (optional)
    
    Returns:
        JSON with damage assessment and recommendations
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400, 
                detail="File must be an image (JPEG, PNG)"
            )
        
        # Validate state
        valid_states = list(damage_mapper.state_relief_amounts.keys())
        if state.lower() not in valid_states:
            state = "default"
            logger.warning(f"Invalid state '{state}', using default")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
            content = await file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name
        
        try:
            # Get model and run inference
            model = get_model()
            result = model.predict_damage(tmp_file_path, state.lower())
            
            # Add metadata
            result.update({
                "metadata": {
                    "uploaded_file": file.filename,
                    "file_size": len(content),
                    "content_type": file.content_type,
                    "state": state,
                    "coordinates": {
                        "latitude": latitude,
                        "longitude": longitude
                    },
                    "user_id": user_id,
                    "timestamp": "2024-01-01T00:00:00Z"  # Add actual timestamp
                }
            })
            
            # Log successful analysis
            logger.info(f"Damage analysis completed for {file.filename}: {result.get('damage_level', 'Unknown')}")
            
            return JSONResponse(content=result)
            
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.unlink(tmp_file_path)
                
    except Exception as e:
        logger.error(f"Analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

@app.get("/states")
async def get_supported_states():
    """Get list of supported Indian states"""
    states = list(damage_mapper.state_relief_amounts.keys())
    return {
        "supported_states": states,
        "count": len(states)
    }

@app.get("/state/{state_name}")
async def get_state_info(state_name: str):
    """Get state-specific information"""
    try:
        state_info = damage_mapper.get_state_info(state_name.lower())
        return state_info
    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"State '{state_name}' not found"
        )

@app.get("/model/info")
async def get_model_info():
    """Get model information"""
    try:
        model = get_model()
        return model.get_model_info()
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get model info: {str(e)}"
        )

@app.post("/batch-analyze")
async def batch_analyze_damage(
    files: list[UploadFile] = File(...),
    state: str = Form(default="punjab")
):
    """
    Analyze multiple images for flood damage
    
    Args:
        files: List of image files
        state: Indian state
    
    Returns:
        List of damage assessments
    """
    try:
        if len(files) > 10:  # Limit batch size
            raise HTTPException(
                status_code=400,
                detail="Maximum 10 images allowed per batch"
            )
        
        results = []
        temp_files = []
        
        try:
            # Process each file
            for file in files:
                if not file.content_type.startswith('image/'):
                    continue
                
                # Save file temporarily
                with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as tmp_file:
                    content = await file.read()
                    tmp_file.write(content)
                    temp_files.append(tmp_file.name)
                
                # Analyze damage
                model = get_model()
                result = model.predict_damage(tmp_file.name, state.lower())
                result["filename"] = file.filename
                results.append(result)
            
            return {
                "results": results,
                "total_processed": len(results),
                "state": state
            }
            
        finally:
            # Clean up temporary files
            for temp_file in temp_files:
                if os.path.exists(temp_file):
                    os.unlink(temp_file)
                    
    except Exception as e:
        logger.error(f"Batch analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Batch analysis failed: {str(e)}"
        )

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500
        }
    )

if __name__ == "__main__":
    # Run with uvicorn for development
    uvicorn.run(
        "api:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8080)),
        reload=True
    )
