import React, { useState, useEffect } from 'react';
import { LOCATION_COORDS } from '../lib/floodPredictionService';
import { indianStatesDistricts, getDistrictsForState } from '../lib/locationService';
import { MapPin, Search, ChevronDown } from 'lucide-react';

interface AreaSelectorProps {
  onLocationSelect: (location: string, coords: { lat: number; lon: number; state: string }) => void;
  selectedLocation?: string;
  className?: string;
}

interface LocationOption {
  name: string;
  coords: { lat: number; lon: number; state: string };
  type: 'city' | 'state';
}

const AreaSelector: React.FC<AreaSelectorProps> = ({ 
  onLocationSelect, 
  selectedLocation,
  className = '' 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState<LocationOption[]>([]);

  // Get all unique states from location data
  const allStates = Array.from(new Set(Object.values(LOCATION_COORDS).map(loc => loc.state))).sort();

  // Get all cities for the selected state
  const getCitiesForState = (state: string): LocationOption[] => {
    return Object.entries(LOCATION_COORDS)
      .filter(([_, coords]) => coords.state === state)
      .map(([name, coords]) => ({
        name,
        coords,
        type: 'city' as const
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Get all available locations
  const getAllLocations = (): LocationOption[] => {
    return Object.entries(LOCATION_COORDS)
      .map(([name, coords]) => ({
        name,
        coords,
        type: 'city' as const
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  // Filter locations based on search query and selected state
  useEffect(() => {
    let locations: LocationOption[] = [];

    if (selectedState) {
      locations = getCitiesForState(selectedState);
    } else {
      locations = getAllLocations();
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      locations = locations.filter(location =>
        location.name.toLowerCase().includes(query) ||
        location.coords.state.toLowerCase().includes(query)
      );
    }

    setFilteredLocations(locations);
  }, [searchQuery, selectedState]);

  const handleLocationSelect = (location: LocationOption) => {
    onLocationSelect(location.name, location.coords);
    setSearchQuery(location.name);
    setIsDropdownOpen(false);
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict('');
    setSearchQuery('');
    setIsDropdownOpen(true);
  };

  const clearSelection = () => {
    setSearchQuery('');
    setSelectedState('');
    setSelectedDistrict('');
    setIsDropdownOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-4">
        {/* State Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select State
          </label>
          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All States</option>
            {allStates.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* Location Search */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Location
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              placeholder="Search for cities..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={clearSelection}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
            <ChevronDown 
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-transform ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredLocations.length > 0 ? (
                <div className="py-1">
                  {selectedState && (
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b">
                      {selectedState}
                    </div>
                  )}
                  {filteredLocations.map((location) => (
                    <button
                      key={`${location.name}-${location.coords.state}`}
                      onClick={() => handleLocationSelect(location)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                        selectedLocation === location.name ? 'bg-blue-50 text-blue-700' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-gray-500">{location.coords.state}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  No locations found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">{selectedLocation}</div>
                <div className="text-sm text-blue-700">
                  {LOCATION_COORDS[selectedLocation as keyof typeof LOCATION_COORDS]?.state}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default AreaSelector;