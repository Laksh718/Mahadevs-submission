"""
xView2 Flood Damage Detection Inference
Modified for Indian Flood Early Warning System (JalRakshak)
"""

import torch
import torch.nn as nn
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
import cv2
import json
import os
from typing import Dict, Any, Tuple
from indian_damage_mapping import IndianDamageMapper

class xView2Inference:
    def __init__(self, model_path: str = None, device: str = "cpu"):
        self.device = torch.device(device if torch.cuda.is_available() else "cpu")
        self.damage_mapper = IndianDamageMapper()
        
        # Load model (simplified version for demo)
        # In production, load actual xView2 ResNet50 FPN model
        self.model = self._load_model(model_path)
        self.model.eval()
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((512, 512)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
        
        # Damage class mapping
        self.damage_classes = {
            0: "no-damage",
            1: "minor-damage", 
            2: "major-damage",
            3: "destroyed"
        }

    def _load_model(self, model_path: str = None):
        """Load xView2 model (simplified for demo)"""
        # For demo purposes, create a simple CNN
        # In production, load actual xView2 ResNet50 FPN weights
        class SimpleDamageClassifier(nn.Module):
            def __init__(self, num_classes=4):
                super().__init__()
                self.backbone = nn.Sequential(
                    nn.Conv2d(3, 64, 3, padding=1),
                    nn.ReLU(),
                    nn.MaxPool2d(2),
                    nn.Conv2d(64, 128, 3, padding=1),
                    nn.ReLU(),
                    nn.MaxPool2d(2),
                    nn.Conv2d(128, 256, 3, padding=1),
                    nn.ReLU(),
                    nn.AdaptiveAvgPool2d((1, 1))
                )
                self.classifier = nn.Sequential(
                    nn.Flatten(),
                    nn.Linear(256, 128),
                    nn.ReLU(),
                    nn.Dropout(0.5),
                    nn.Linear(128, num_classes)
                )
                
            def forward(self, x):
                x = self.backbone(x)
                return self.classifier(x)
        
        model = SimpleDamageClassifier()
        
        # Load pretrained weights if available
        if model_path and os.path.exists(model_path):
            model.load_state_dict(torch.load(model_path, map_location=self.device))
        else:
            # For demo, initialize with random weights
            # In production, load actual xView2 weights
            print("Warning: Using random weights for demo. Load actual xView2 weights for production.")
            
        return model.to(self.device)

    def preprocess_image(self, image_path: str) -> torch.Tensor:
        """Preprocess image for model inference"""
        try:
            # Load image
            image = Image.open(image_path).convert('RGB')
            
            # Apply transforms
            image_tensor = self.transform(image).unsqueeze(0)
            
            return image_tensor.to(self.device)
        except Exception as e:
            raise ValueError(f"Error preprocessing image: {str(e)}")

    def predict_damage(self, image_path: str, state: str = "punjab") -> Dict[str, Any]:
        """
        Predict flood damage from image
        Returns Indian-specific damage assessment
        """
        try:
            # Preprocess image
            image_tensor = self.preprocess_image(image_path)
            
            # Run inference
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.softmax(outputs, dim=1)
                confidence, predicted_class = torch.max(probabilities, 1)
                
            # Get prediction
            predicted_class = predicted_class.item()
            confidence_score = confidence.item()
            damage_class = self.damage_classes[predicted_class]
            
            # Map to Indian damage assessment
            damage_assessment = self.damage_mapper.map_damage_level(
                damage_class, confidence_score, state
            )
            
            # Add model metadata
            damage_assessment.update({
                "model_info": {
                    "model_name": "xView2-ResNet50-FPN",
                    "version": "1.0",
                    "confidence_threshold": 0.5
                },
                "image_info": {
                    "path": image_path,
                    "processed_size": "512x512"
                }
            })
            
            return damage_assessment
            
        except Exception as e:
            return {
                "error": f"Prediction failed: {str(e)}",
                "damage_level": "Unknown",
                "confidence": 0.0
            }

    def batch_predict(self, image_paths: list, state: str = "punjab") -> list:
        """Predict damage for multiple images"""
        results = []
        for image_path in image_paths:
            result = self.predict_damage(image_path, state)
            results.append(result)
        return results

    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            "model_name": "xView2 Flood Damage Detection",
            "version": "1.0",
            "device": str(self.device),
            "num_classes": len(self.damage_classes),
            "classes": list(self.damage_classes.values()),
            "supported_states": list(self.damage_mapper.state_relief_amounts.keys())
        }

# Example usage
if __name__ == "__main__":
    # Initialize model
    inference = xView2Inference()
    
    # Test with sample image (replace with actual image path)
    sample_image = "sample_flood_image.jpg"
    
    if os.path.exists(sample_image):
        result = inference.predict_damage(sample_image, "punjab")
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print("Sample image not found. Please provide a valid image path.")
