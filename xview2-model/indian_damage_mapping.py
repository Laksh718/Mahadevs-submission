"""
Indian Flood Damage Assessment Mapping
Based on NDMA (National Disaster Management Authority) and SDRF (State Disaster Response Fund) guidelines
"""

import json
from typing import Dict, Any

class IndianDamageMapper:
    def __init__(self):
        # NDMA Relief Categories and SDRF Cost Mapping for India
        self.damage_categories = {
            "no_damage": {
                "label": "No Damage",
                "hindi_label": "कोई नुकसान नहीं",
                "ndma_category": "N/A",
                "cost_range": (0, 0),
                "color": "#10B981",  # Green
                "description": "Structure is intact with no visible damage",
                "hindi_description": "संरचना सही है, कोई दिखाई देने वाला नुकसान नहीं"
            },
            "minor_damage": {
                "label": "Minor Damage", 
                "hindi_label": "मामूली नुकसान",
                "ndma_category": "Category C",
                "cost_range": (20000, 50000),
                "color": "#F59E0B",  # Yellow
                "description": "Minor structural damage, repairable",
                "hindi_description": "मामूली संरचनात्मक नुकसान, मरम्मत योग्य"
            },
            "major_damage": {
                "label": "Major Damage",
                "hindi_label": "बड़ा नुकसान", 
                "ndma_category": "Category B",
                "cost_range": (100000, 300000),
                "color": "#EF4444",  # Red
                "description": "Significant structural damage, requires major repairs",
                "hindi_description": "काफी संरचनात्मक नुकसान, बड़ी मरम्मत की जरूरत"
            },
            "destroyed": {
                "label": "Destroyed",
                "hindi_label": "पूरी तरह नष्ट",
                "ndma_category": "Category A", 
                "cost_range": (500000, 2000000),
                "color": "#7C2D12",  # Dark Red
                "description": "Structure is completely destroyed or severely damaged",
                "hindi_description": "संरचना पूरी तरह नष्ट या गंभीर रूप से क्षतिग्रस्त"
            }
        }
        
        # State-wise relief amounts (SDRF guidelines)
        self.state_relief_amounts = {
            "punjab": {
                "category_a": 400000,  # ₹4 Lakhs
                "category_b": 200000,  # ₹2 Lakhs  
                "category_c": 50000    # ₹50k
            },
            "haryana": {
                "category_a": 350000,
                "category_b": 180000,
                "category_c": 45000
            },
            "himachal_pradesh": {
                "category_a": 450000,
                "category_b": 220000,
                "category_c": 55000
            },
            "default": {
                "category_a": 400000,
                "category_b": 200000,
                "category_c": 50000
            }
        }
        
        # Emergency contacts by state
        self.emergency_contacts = {
            "punjab": {
                "disaster_control": "+91-172-2740000",
                "relief_commissioner": "+91-172-2740001",
                "district_collector": "+91-172-2740002"
            },
            "haryana": {
                "disaster_control": "+91-172-2741000", 
                "relief_commissioner": "+91-172-2741001",
                "district_collector": "+91-172-2741002"
            },
            "default": {
                "disaster_control": "108",
                "relief_commissioner": "+91-11-23093566",
                "district_collector": "100"
            }
        }

    def map_damage_level(self, xview2_prediction: str, confidence: float, state: str = "punjab") -> Dict[str, Any]:
        """
        Map xView2 prediction to Indian damage assessment
        """
        # Map xView2 classes to our damage categories
        xview2_mapping = {
            "no-damage": "no_damage",
            "minor-damage": "minor_damage", 
            "major-damage": "major_damage",
            "destroyed": "destroyed"
        }
        
        damage_key = xview2_mapping.get(xview2_prediction.lower(), "minor_damage")
        damage_info = self.damage_categories[damage_key]
        
        # Calculate estimated cost based on confidence and state
        base_cost_range = damage_info["cost_range"]
        confidence_factor = 0.5 + (confidence * 0.5)  # Scale confidence to 0.5-1.0
        
        min_cost = int(base_cost_range[0] * confidence_factor)
        max_cost = int(base_cost_range[1] * confidence_factor)
        avg_cost = (min_cost + max_cost) // 2
        
        # Get state-specific relief amount
        state_info = self.state_relief_amounts.get(state, self.state_relief_amounts["default"])
        relief_amount = state_info.get(f"category_{damage_info['ndma_category'].lower().split()[-1]}", 0)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(damage_key, relief_amount, state)
        
        return {
            "damage_level": damage_info["label"],
            "hindi_damage_level": damage_info["hindi_label"],
            "confidence": round(confidence, 2),
            "estimated_cost_min": min_cost,
            "estimated_cost_max": max_cost,
            "estimated_cost_avg": avg_cost,
            "estimated_cost_display": f"₹{avg_cost//1000}K - ₹{max_cost//1000}K",
            "ndma_category": damage_info["ndma_category"],
            "relief_amount": relief_amount,
            "relief_amount_display": f"₹{relief_amount//1000}K",
            "color": damage_info["color"],
            "description": damage_info["description"],
            "hindi_description": damage_info["hindi_description"],
            "recommendations": recommendations,
            "emergency_contacts": self.emergency_contacts.get(state, self.emergency_contacts["default"]),
            "state": state.title()
        }

    def _generate_recommendations(self, damage_key: str, relief_amount: int, state: str) -> Dict[str, Any]:
        """Generate actionable recommendations based on damage assessment"""
        
        recommendations = {
            "immediate_actions": [],
            "relief_application": {},
            "documentation_required": [],
            "timeline": ""
        }
        
        if damage_key == "no_damage":
            recommendations["immediate_actions"] = [
                "Document current condition with photos",
                "Monitor for any delayed damage signs",
                "Keep emergency contacts ready"
            ]
            recommendations["relief_application"]["required"] = False
            recommendations["timeline"] = "No immediate action required"
            
        elif damage_key == "minor_damage":
            recommendations["immediate_actions"] = [
                "Secure the property to prevent further damage",
                "Contact local authorities for assessment",
                "Document all damage with detailed photos",
                "Apply for Category C relief assistance"
            ]
            recommendations["relief_application"] = {
                "required": True,
                "category": "Category C",
                "amount": f"₹{relief_amount//1000}K",
                "form": "SDRF Form 1A",
                "deadline": "Within 30 days of incident"
            }
            recommendations["documentation_required"] = [
                "Damage assessment report",
                "Property ownership documents", 
                "Aadhaar card copy",
                "Bank account details",
                "Recent property photos"
            ]
            recommendations["timeline"] = "Apply within 30 days, processing takes 15-30 days"
            
        elif damage_key == "major_damage":
            recommendations["immediate_actions"] = [
                "Evacuate if structure is unsafe",
                "Contact emergency services immediately",
                "Document damage extensively",
                "Apply for Category B relief assistance",
                "Contact insurance company if applicable"
            ]
            recommendations["relief_application"] = {
                "required": True,
                "category": "Category B", 
                "amount": f"₹{relief_amount//1000}K",
                "form": "SDRF Form 1B",
                "deadline": "Within 15 days of incident"
            }
            recommendations["documentation_required"] = [
                "Structural engineer's assessment",
                "Damage assessment report",
                "Property ownership documents",
                "Aadhaar card copy", 
                "Bank account details",
                "Insurance claim documents",
                "Before/after photos"
            ]
            recommendations["timeline"] = "Apply within 15 days, processing takes 10-20 days"
            
        else:  # destroyed
            recommendations["immediate_actions"] = [
                "Evacuate immediately - structure is unsafe",
                "Contact emergency services (108)",
                "Seek temporary shelter",
                "Apply for Category A relief assistance",
                "Contact insurance company",
                "Register for rehabilitation assistance"
            ]
            recommendations["relief_application"] = {
                "required": True,
                "category": "Category A",
                "amount": f"₹{relief_amount//1000}K", 
                "form": "SDRF Form 1A",
                "deadline": "Within 7 days of incident"
            }
            recommendations["documentation_required"] = [
                "Structural engineer's assessment",
                "Damage assessment report",
                "Property ownership documents",
                "Aadhaar card copy",
                "Bank account details", 
                "Insurance claim documents",
                "Before/after photos",
                "Death certificate (if applicable)",
                "Medical certificates (if injured)"
            ]
            recommendations["timeline"] = "Apply within 7 days, processing takes 5-15 days"
            
        return recommendations

    def get_state_info(self, state: str) -> Dict[str, Any]:
        """Get state-specific information"""
        return {
            "state": state.title(),
            "relief_amounts": self.state_relief_amounts.get(state, self.state_relief_amounts["default"]),
            "emergency_contacts": self.emergency_contacts.get(state, self.emergency_contacts["default"])
        }

# Example usage
if __name__ == "__main__":
    mapper = IndianDamageMapper()
    
    # Test with sample xView2 prediction
    result = mapper.map_damage_level("major-damage", 0.87, "punjab")
    print(json.dumps(result, indent=2, ensure_ascii=False))
