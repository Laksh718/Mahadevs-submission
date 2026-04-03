import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { TranslatedText } from "@/components/TranslatedText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GradientCard from "@/components/GradientCard";
import UserLayout from "@/components/UserLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, submitFloodReport, uploadMedia, getUserReports, deleteFloodReport, type FloodReport } from "@/lib/supabase";
import { getFirebase } from '@/lib/firebase';
import { getCurrentLocation, getLocationWithDetails, searchLocation, type LocationInfo } from "@/lib/locationService";
import { searchPredefinedLocations, getAllStates, convertToLocationInfo, type PredefinedLocation } from "@/lib/predefinedLocations";
import {
  Camera,
  Upload,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Users,
  TrendingUp,
  Plus,
  Loader2,
  X,
  ImageIcon,
  Send,
  Navigation,
  MessageSquare,
  Heart,
  Share2,
  Trash2,
  Zap,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const Reports = () => {
  const { currentUser, userProfile } = useAuth();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [reports, setReports] = useState<FloodReport[]>([]);
  const [userLocation, setUserLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<FloodReport | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "medium" as "low" | "medium" | "high" | "critical",
    locationSearch: "",
    selectedLocation: null as LocationInfo | null,
    locationType: "geo" as "geo" | "predefined",
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [predefinedLocations, setPredefinedLocations] = useState<PredefinedLocation[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Load user location and nearby reports
  useEffect(() => {
    loadUserLocation();
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadUserReports();
    }
  }, [currentUser]);

  const loadUserLocation = async () => {
    try {
      const location = await getLocationWithDetails();
      setUserLocation(location);
      setFormData(prev => ({ ...prev, selectedLocation: location }));
      toast.success(`Location detected: ${location.district}, ${location.state}`);
    } catch (error) {
      console.error('Error getting location:', error);
      // Set default to Punjab if location fails
      const defaultLocation: LocationInfo = {
        coords: { lat: 30.9010, lng: 75.8573 }, // Punjab center
        address: "Punjab, India",
        state: "Punjab",
        district: "",
        country: "India"
      };
      setUserLocation(defaultLocation);
      setFormData(prev => ({ ...prev, selectedLocation: defaultLocation }));
    }
  };

  const loadUserReports = async () => {
    if (!currentUser) {
      console.log('No current user found');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Loading reports for user:', currentUser.uid);
      const userReports = await getUserReports(currentUser.uid);
      console.log('Loaded user reports:', userReports);
      setReports(userReports);
      
      if (userReports.length === 0) {
        console.log('No reports found for user');
      } else {
        console.log(`Successfully loaded ${userReports.length} reports`);
      }
    } catch (error) {
      console.error('Error loading user reports:', error);
      toast.error('Failed to load your reports. Please try again.');
      setReports([]); // Clear reports on error
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (selectedImages.length + files.length > 5) {
      toast.error('Maximum 5 files allowed');
      return;
    }

    // Validate file sizes and types
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const fileSizeKB = file.size / 1024;
      const fileSizeMB = file.size / (1024 * 1024);
      
      // Check if it's an image
      if (file.type.startsWith('image/')) {
        if (fileSizeKB > 500) {
          errors.push(`${file.name}: Image size must be under 500KB (current: ${fileSizeKB.toFixed(1)}KB)`);
          return;
        }
        validFiles.push(file);
      }
      // Check if it's a video
      else if (file.type.startsWith('video/')) {
        if (fileSizeMB > 5) {
          errors.push(`${file.name}: Video size must be under 5MB (current: ${fileSizeMB.toFixed(1)}MB)`);
          return;
        }
        validFiles.push(file);
      }
      // Unsupported file type
      else {
        errors.push(`${file.name}: Only images and videos are supported`);
        return;
      }
    });

    // Show errors if any
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    // Add valid files
    if (validFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...validFiles]);

      // Create preview URLs
      validFiles.forEach(file => {
        const url = URL.createObjectURL(file);
        setImagePreviewUrls(prev => [...prev, url]);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => {
      const url = prev[index];
      URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleLocationSearch = async (query: string) => {
    if (query.length < 2) {
      setPredefinedLocations([]);
      setShowLocationSuggestions(false);
      return;
    }
    
    try {
      if (formData.locationType === 'predefined') {
        const locations = searchPredefinedLocations(query);
        setPredefinedLocations(locations);
        setShowLocationSuggestions(locations.length > 0);
      } else {
        const locations = await searchLocation(query);
        if (locations.length > 0) {
          setFormData(prev => ({ ...prev, selectedLocation: locations[0] }));
        }
      }
    } catch (error) {
      console.error('Location search error:', error);
    }
  };

  const selectPredefinedLocation = (location: PredefinedLocation) => {
    const locationInfo = convertToLocationInfo(location);
    setFormData(prev => ({ 
      ...prev, 
      selectedLocation: locationInfo,
      locationSearch: `${location.name}, ${location.district}, ${location.state}`
    }));
    setPredefinedLocations([]);
    setShowLocationSuggestions(false);
  };

  const useCurrentLocation = async () => {
    try {
      const location = await getLocationWithDetails();
      setFormData(prev => ({ ...prev, selectedLocation: location, locationSearch: location.address }));
      toast.success('Current location selected');
    } catch (error) {
      toast.error('Failed to get current location');
    }
  };

  const handleSubmitReport = async () => {
    if (!currentUser || !userProfile) {
      toast.error('Please sign in to submit reports');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.selectedLocation) {
      toast.error('Please select a location');
      return;
    }

    setSubmitting(true);
    try {
      // Upload images to Supabase storage
      const imageUrls: string[] = [];
      let uploadCount = 0;
      
      for (const file of selectedImages) {
        try {
          const url = await uploadMedia(file, 'reports-images');
          if (url) {
            imageUrls.push(url);
            uploadCount++;
          }
        } catch (error) {
          console.error(`Error uploading file:`, error);
        }
      }

      // Submit report
      const report: Omit<FloodReport, 'id' | 'created_at' | 'updated_at'> = {
        user_id: currentUser.uid,
        user_name: userProfile.displayName,
        user_email: userProfile.email,
        title: formData.title,
        description: formData.description,
        severity: formData.severity,
        location: {
          lat: formData.selectedLocation.coords.lat,
          lng: formData.selectedLocation.coords.lng,
          address: formData.selectedLocation.address,
          state: formData.selectedLocation.state,
          district: formData.selectedLocation.district,
        },
        images: imageUrls,
        status: 'pending',
      };

      // Attach Firebase user info to the report
      const { auth } = getFirebase();
      const firebaseUser = auth.currentUser;
      if (firebaseUser) {
        report.user_id = firebaseUser.uid;
        report.user_name = firebaseUser.displayName || firebaseUser.email || 'Unknown';
        report.user_email = firebaseUser.email || '';
      }
      const submittedReport = await submitFloodReport(report);
      
      if (submittedReport) {
        toast.success('Report submitted successfully!');
        // Refresh the user's reports list
        await loadUserReports();
        
        // Reset form
        setFormData({
          title: "",
          description: "",
          severity: "medium",
          locationSearch: "",
          selectedLocation: userLocation,
          locationType: "geo",
        });
        setSelectedImages([]);
        setImagePreviewUrls([]);
        setPredefinedLocations([]);
        setShowLocationSuggestions(false);
        setShowSubmitDialog(false);
      } else {
        toast.error('Failed to submit report');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'resolved':
        return 'text-blue-600 bg-blue-100';
      case 'false_alarm':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleViewDetails = (report: FloodReport) => {
    setSelectedReport(report);
    setShowDetailDialog(true);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await deleteFloodReport(reportId);
      if (success) {
        toast.success('Report deleted successfully');
        // Refresh the user's reports list
        await loadUserReports();
      } else {
        toast.error('Failed to delete report');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete report');
    }
  };

  const openLocationInMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
  };


  console.log('Reports component rendering, currentUser:', currentUser, 'loading:', loading, 'reports:', reports.length);

  return (
    <UserLayout title="My Reports" description="View and manage your flood reports">
      <style>{`
        ${theme === 'high-contrast' ? `
          .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900,
          .text-gray-500, .text-gray-400, .text-slate-600, .text-slate-700,
          .text-slate-500, .text-slate-900, .text-slate-800, .text-gray-300 {
            color: hsl(0, 0%, 100%) !important;
          }
          .bg-white\\/80, .bg-white\\/90, .bg-white\\/95, .bg-white {
            background-color: hsl(0, 0%, 10%) !important;
          }
          .bg-clip-text {
            -webkit-text-fill-color: hsl(47, 100%, 60%) !important;
          }
          /* All gradient backgrounds */
          .bg-gradient-to-br, .bg-gradient-to-r, .bg-gradient-to-l, .bg-gradient-to-t, .bg-gradient-to-b {
            background: hsl(0, 0%, 10%) !important;
          }
          /* All -50 level backgrounds */
          .from-slate-50, .to-slate-50, .from-white, .to-white,
          .from-blue-50, .to-cyan-50, .from-green-50, .to-emerald-50,
          .from-red-50, .to-rose-50, .from-orange-50, .to-amber-50,
          .from-purple-50, .to-pink-50, .from-yellow-50, .to-yellow-50 {
            background: hsl(0, 0%, 10%) !important;
          }
          /* All -100 level backgrounds */
          .from-blue-100, .to-teal-100, .bg-blue-100, .bg-green-100,
          .bg-red-100, .bg-orange-100, .bg-slate-100, .bg-gray-100 {
            background-color: hsl(0, 0%, 20%) !important;
          }
          /* All border colors */
          .border-blue-200, .border-gray-200, .border-gray-300, .border-slate-200 {
            border-color: hsl(0, 0%, 40%) !important;
          }
          /* Shadow/backdrop */
          .shadow-sm, .shadow-lg, .shadow-xl, .shadow-2xl {
            box-shadow: none !important;
          }
        ` : ''}
      `}</style>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-8 mb-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-800 bg-clip-text text-transparent">
              My Flood Reports
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              View and manage your personal flood reports. Track the status of your submissions and access detailed information.
            </p>
          </div>
          
          {userLocation && (
            <div className="inline-flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
              <MapPin className="w-4 h-4" />
              <span>Your location: {userLocation.district}, {userLocation.state}</span>
            </div>
          )}
          
          <div className="flex justify-center pt-4">
            <Button 
              onClick={() => setShowSubmitDialog(true)}
              className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-10 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-lg z-10 relative"
            >
              <Plus className="w-6 h-6 mr-2" />
              Submit New Report
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <GradientCard className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">My Reports</h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            {reports.length}
          </p>
        </GradientCard>

        <GradientCard className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Critical</h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            {reports.filter(r => r.severity === 'critical').length}
          </p>
        </GradientCard>

        <GradientCard className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Verified</h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            {reports.filter(r => r.status === 'verified').length}
          </p>
        </GradientCard>

        <GradientCard className="p-6 text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Pending</h3>
          <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {reports.filter(r => r.status === 'pending').length}
          </p>
        </GradientCard>
      </div>

      {/* Submit Report Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="max-w-6xl w-[90vw] h-[90vh] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submit Flood Report</DialogTitle>
              <DialogDescription>
                Help your community by reporting flood conditions in your area
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of the situation"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the flood situation, water levels, affected areas, etc."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Severity */}
              <div className="space-y-2">
                <Label>Severity Level</Label>
                <Select value={formData.severity} onValueChange={(value: any) => setFormData(prev => ({ ...prev, severity: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Minor water accumulation</SelectItem>
                    <SelectItem value="medium">Medium - Noticeable flooding</SelectItem>
                    <SelectItem value="high">High - Significant flooding</SelectItem>
                    <SelectItem value="critical">Critical - Dangerous conditions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label>Location</Label>
                
                {/* Location Type Selection */}
                <div className="flex space-x-2 mb-3">
                  <Button
                    type="button"
                    variant={formData.locationType === 'geo' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, locationType: 'geo' }))}
                    className="flex-1"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    GPS Location
                  </Button>
                  <Button
                    type="button"
                    variant={formData.locationType === 'predefined' ? 'default' : 'outline'}
                    onClick={() => setFormData(prev => ({ ...prev, locationType: 'predefined' }))}
                    className="flex-1"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Predefined Location
                  </Button>
                </div>

                {/* Location Search */}
                <div className="relative">
                  <Input
                    placeholder={
                      formData.locationType === 'geo' 
                        ? "Search for location or use current location"
                        : "Search predefined locations (cities, districts, landmarks)"
                    }
                    value={formData.locationSearch}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, locationSearch: e.target.value }));
                      handleLocationSearch(e.target.value);
                    }}
                    className="flex-1"
                  />
                  
                  {/* Location Suggestions Dropdown */}
                  {showLocationSuggestions && predefinedLocations.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {predefinedLocations.map((location) => (
                        <div
                          key={location.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => selectPredefinedLocation(location)}
                        >
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <div>
                              <div className="font-medium text-gray-900">{location.name}</div>
                              <div className="text-sm text-gray-600">
                                {location.district}, {location.state} • {location.type}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Use Current Location Button (only for GPS) */}
                {formData.locationType === 'geo' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={useCurrentLocation}
                    className="w-full"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Use Current GPS Location
                  </Button>
                )}

                {/* Selected Location Display */}
                {formData.selectedLocation && (
                  <div className="text-sm text-slate-600 flex items-center space-x-1 p-2 bg-blue-50 rounded-md">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>{formData.selectedLocation.address}</span>
                  </div>
                )}
              </div>

              {/* Media Upload */}
              <div className="space-y-2">
                <Label>Images & Videos (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleImageSelection}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Click to upload images/videos or drag and drop</p>
                    <p className="text-sm text-gray-500">
                      Images: PNG, JPG up to 500KB each<br/>
                      Videos: MP4, MOV up to 5MB each<br/>
                      Maximum 5 files total
                    </p>
                    <p className="text-xs text-blue-600 mt-1">Files will be stored securely (Supabase storage or base64)</p>
                    <p className="text-xs text-gray-500 mt-1">Note: If Supabase storage is not available, files will be stored as base64 data</p>
                  </label>
                </div>

                {/* Media Previews */}
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {imagePreviewUrls.map((url, index) => {
                      const file = selectedImages[index];
                      const isVideo = file?.type.startsWith('video/');
                      
                      return (
                        <div key={index} className="relative">
                          {isVideo ? (
                            <video
                              src={url}
                              className="w-full h-24 object-cover rounded-lg"
                              controls
                            />
                          ) : (
                            <img
                              src={url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {isVideo ? 'VIDEO' : 'IMAGE'}
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowSubmitDialog(false)}
                  className="px-8 py-2 min-w-[100px]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitReport}
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 px-8 py-2 min-w-[140px] font-semibold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Report
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      {/* Report Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <span>{selectedReport.title}</span>
                  <Badge className={getSeverityColor(selectedReport.severity)}>
                    {selectedReport.severity.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(selectedReport.status)}>
                    {selectedReport.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Report submitted by {selectedReport.user_name} • {formatTimeAgo(selectedReport.created_at || new Date().toISOString())}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Location Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-blue-700 font-medium">Address:</p>
                      <p className="text-blue-800">{selectedReport.location.address}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">District, State:</p>
                      <p className="text-blue-800">{selectedReport.location.district}, {selectedReport.location.state}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Coordinates:</p>
                      <p className="text-blue-800">{selectedReport.location.lat.toFixed(6)}, {selectedReport.location.lng.toFixed(6)}</p>
                    </div>
                    <div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => openLocationInMaps(selectedReport.location.lat, selectedReport.location.lng)}
                        className="border-blue-300 text-blue-700 hover:bg-blue-100"
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Open in Maps
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Report Description</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-slate-700 leading-relaxed">{selectedReport.description}</p>
                  </div>
                </div>

                {/* Images Gallery */}
                {selectedReport.images && selectedReport.images.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Media ({selectedReport.images.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedReport.images.map((mediaUrl, index) => {
                        const isVideo = mediaUrl.includes('video/') || mediaUrl.includes('.mp4') || mediaUrl.includes('.mov') || mediaUrl.includes('.avi') || mediaUrl.includes('.webm');
                        const isBase64Video = mediaUrl.startsWith('data:video/');
                        
                        return (
                          <div key={index} className="relative group">
                            {isVideo || isBase64Video ? (
                              <div className="relative">
                                <video
                                  src={mediaUrl}
                                  className="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                                  controls
                                  preload="metadata"
                                />
                                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  VIDEO
                                </div>
                              </div>
                            ) : (
                              <div className="relative">
                                <img
                                  src={mediaUrl}
                                  alt={`Report media ${index + 1}`}
                                  className="w-full h-48 object-cover rounded-lg cursor-pointer transition-transform group-hover:scale-105"
                                  onClick={() => {
                                    setSelectedImageUrl(mediaUrl);
                                    setShowImageViewer(true);
                                  }}
                                />
                                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                                  IMAGE
                                </div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Report Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-2">Severity Level</h4>
                    <Badge className={getSeverityColor(selectedReport.severity)}>
                      {selectedReport.severity.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-slate-600 mt-1">
                      {selectedReport.severity === 'critical' ? 'Immediate action required' :
                       selectedReport.severity === 'high' ? 'High priority response needed' :
                       selectedReport.severity === 'medium' ? 'Moderate attention required' :
                       'Low priority monitoring'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-2">Report Status</h4>
                    <Badge className={getStatusColor(selectedReport.status)}>
                      {selectedReport.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <p className="text-xs text-slate-600 mt-1">
                      {selectedReport.status === 'verified' ? 'Verified by authorities' :
                       selectedReport.status === 'resolved' ? 'Situation resolved' :
                       selectedReport.status === 'false_alarm' ? 'Marked as false alarm' :
                       'Awaiting verification'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-slate-900 mb-2">Reporter</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {selectedReport.user_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{selectedReport.user_name}</p>
                        <p className="text-xs text-slate-600">{selectedReport.user_email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigator.share && navigator.share({
                        title: selectedReport.title,
                        text: selectedReport.description,
                        url: window.location.href
                      }).catch(() => {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Link copied to clipboard');
                      })}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share Report
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => openLocationInMaps(selectedReport.location.lat, selectedReport.location.lng)}
                    >
                      <MapPin className="w-4 h-4 mr-1" />
                      View Location
                    </Button>
                  </div>
                  <Button 
                    onClick={() => setShowDetailDialog(false)}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>


      {/* Reports List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">My Reports</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
            <p className="text-slate-600 mt-2">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-slate-600">You haven't submitted any reports yet. Create your first report!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reports.map((report) => (
              <Card key={report.id} className="shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2">
                        {report.title}
                      </CardTitle>
                      <div className="flex items-center space-x-3 text-sm text-slate-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span>{report.location.district}, {report.location.state}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span>{formatTimeAgo(report.created_at || new Date().toISOString())}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Badge className={`${getSeverityColor(report.severity)} text-xs font-medium px-2 py-1`}>
                        {report.severity.toUpperCase()}
                      </Badge>
                      <Badge className={`${getStatusColor(report.status)} text-xs font-medium px-2 py-1`}>
                        {report.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-slate-700 mb-4 line-clamp-3 leading-relaxed">
                    {report.description}
                  </p>
                  
                  {/* Media Preview */}
                  {report.images && report.images.length > 0 && (
                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        {report.images.slice(0, 2).map((mediaUrl, index) => {
                          const isVideo = mediaUrl && (
                            mediaUrl.includes('.mp4') || 
                            mediaUrl.includes('.mov') || 
                            mediaUrl.includes('.avi') ||
                            mediaUrl.startsWith('data:video/')
                          );
                          
                          return (
                            <div key={index} className="relative group">
                              {isVideo ? (
                                <video
                                  src={mediaUrl}
                                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  controls
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <img
                                  src={mediaUrl}
                                  alt={`Report media ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                  onClick={() => {
                                    setSelectedImageUrl(mediaUrl);
                                    setShowImageViewer(true);
                                  }}
                                />
                              )}
                              <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                                {isVideo ? 'VIDEO' : 'IMAGE'}
                              </div>
                              {report.images.length > 2 && index === 1 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">+{report.images.length - 2}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Report #{report.id?.slice(-6)}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(report)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDeleteReport(report.id!)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      <Dialog open={showImageViewer} onOpenChange={setShowImageViewer}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black">
          <div className="relative w-full h-full">
            <img
              src={selectedImageUrl}
              alt="Full size image"
              className="w-full h-full object-contain"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImageViewer(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
};

export default Reports;