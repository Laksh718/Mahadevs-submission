import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";

interface AdminRegionSelectorProps {
  selectedRegions: string[];
  onRegionsChange: (regions: string[]) => void;
  className?: string;
}

const AdminRegionSelector: React.FC<AdminRegionSelectorProps> = ({
  selectedRegions,
  onRegionsChange,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // States and cities with available flood prediction data
  const regions = [
    "All Users",
    "All States",
    // States with flood prediction data
    "Tamil Nadu",
    "Telangana",
    "Maharashtra",
    "Kerala",
    "Punjab",
    "West Bengal",
    // Cities with flood prediction data
    "Chennai",
    "Hyderabad",
    "Kolhapur",
    "Sangli",
    "Satara",
    "Wayanad",
    "Idukki",
    "Ludhiana",
    "Firozpur",
    "Kolkata",
  ];

  const handleRegionToggle = (region: string) => {
    if (selectedRegions.includes(region)) {
      onRegionsChange(selectedRegions.filter((r) => r !== region));
    } else {
      onRegionsChange([...selectedRegions, region]);
    }
  };

  const handleClearAll = () => {
    onRegionsChange([]);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
        >
          <span className="text-sm">
            {selectedRegions.length > 0
              ? `${selectedRegions.length} region${
                  selectedRegions.length > 1 ? "s" : ""
                } selected`
              : "Select regions"}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="p-2 border-b border-gray-200">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="w-full text-xs"
              >
                Clear All
              </Button>
            </div>
            <ScrollArea className="max-h-48">
              <div className="p-1">
                {regions.map((region) => (
                  <div
                    key={region}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    onClick={() => handleRegionToggle(region)}
                  >
                    <Checkbox
                      checked={selectedRegions.includes(region)}
                      onChange={() => handleRegionToggle(region)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm">{region}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      {selectedRegions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedRegions.map((region) => (
            <span
              key={region}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
            >
              {region}
              <button
                onClick={() => handleRegionToggle(region)}
                className="ml-1 hover:text-red-600"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRegionSelector;
