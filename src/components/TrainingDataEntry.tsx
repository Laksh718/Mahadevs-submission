import React, { useState, useEffect } from "react";
import {
  Save,
  Upload,
  MapPin,
  Users,
  Calendar,
  Clock,
  Building,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  createTrainingSession,
  getTrainingPartners,
  getTrainingThemes,
  getTargetAudiences,
  TrainingSession,
  TrainingPartner,
  TrainingTheme,
  TargetAudience,
} from "@/lib/trainingService";

interface TrainingDataEntryProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TrainingDataEntry: React.FC<TrainingDataEntryProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [partners, setPartners] = useState<TrainingPartner[]>([]);
  const [themes, setThemes] = useState<TrainingTheme[]>([]);
  const [audiences, setTargetAudiences] = useState<TargetAudience[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    partner_id: "",
    state: "",
    district: "",
    venue: "",
    start_date: "",
    end_date: "",
    duration_hours: "",
    expected_participants: "",
    training_mode: "OFFLINE",
    certification_provided: false,
    budget_allocated: "",
    selectedThemes: [] as string[],
    selectedAudiences: [] as string[],
  });

  // Indian states that have flood prediction data
  const states = [
    "Tamil Nadu",
    "Telangana",
    "Maharashtra",
    "Kerala",
    "Punjab",
    "West Bengal",
    "Assam",
    "Bihar",
    "Odisha",
    "Uttarakhand",
  ];

  // District mapping based on state selection
  const districtsByState: Record<string, string[]> = {
    "Tamil Nadu": [
      "Chennai",
      "Cuddalore",
      "Thanjavur",
      "Coimbatore",
      "Madurai",
    ],
    Maharashtra: ["Mumbai", "Pune", "Kolhapur", "Sangli", "Satara", "Nagpur"],
    Kerala: [
      "Thiruvananthapuram",
      "Kochi",
      "Kozhikode",
      "Wayanad",
      "Idukki",
      "Alappuzha",
      "Kottayam",
    ],
    "West Bengal": [
      "Kolkata",
      "Howrah",
      "North 24 Parganas",
      "South 24 Parganas",
    ],
    Punjab: ["Ludhiana", "Amritsar", "Firozpur", "Jalandhar"],
    Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
    Assam: ["Guwahati", "Dhemaji", "Lakhimpur", "Silchar"],
    Bihar: ["Patna", "Darbhanga", "Muzaffarpur", "Bhagalpur"],
    Odisha: ["Bhubaneswar", "Cuttack", "Puri", "Berhampur"],
    Uttarakhand: ["Dehradun", "Haridwar", "Rishikesh", "Nainital"],
  };

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [partnersData, themesData, audiencesData] = await Promise.all([
        getTrainingPartners(),
        getTrainingThemes(),
        getTargetAudiences(),
      ]);

      setPartners(partnersData || []);
      setThemes(themesData || []);
      setTargetAudiences(audiencesData || []);
    } catch (error) {
      console.error("Error loading form data:", error);
      toast.error("Failed to load form options");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleThemeToggle = (themeId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedThemes: prev.selectedThemes.includes(themeId)
        ? prev.selectedThemes.filter((id) => id !== themeId)
        : [...prev.selectedThemes, themeId],
    }));
  };

  const handleAudienceToggle = (audienceId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAudiences: prev.selectedAudiences.includes(audienceId)
        ? prev.selectedAudiences.filter((id) => id !== audienceId)
        : [...prev.selectedAudiences, audienceId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.title ||
      !formData.partner_id ||
      !formData.state ||
      !formData.district
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error("Please select training dates");
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast.error("End date must be after start date");
      return;
    }

    setLoading(true);
    try {
      // Create the training session
      const sessionData: Omit<
        TrainingSession,
        "id" | "created_at" | "updated_at"
      > = {
        title: formData.title,
        description: formData.description || undefined,
        partner_id: formData.partner_id,
        state: formData.state,
        district: formData.district,
        venue: formData.venue || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date,
        duration_hours: formData.duration_hours
          ? parseInt(formData.duration_hours)
          : undefined,
        expected_participants: formData.expected_participants
          ? parseInt(formData.expected_participants)
          : undefined,
        status: "PLANNED",
        training_mode: formData.training_mode as
          | "OFFLINE"
          | "ONLINE"
          | "HYBRID",
        certification_provided: formData.certification_provided,
        budget_allocated: formData.budget_allocated
          ? parseFloat(formData.budget_allocated)
          : undefined,
        created_by: "admin", // This should be the current user's ID
      };

      const newSession = await createTrainingSession(sessionData);

      // TODO: Add themes and audiences to the session (requires additional API calls)

      toast.success("Training session created successfully");

      // Reset form
      setFormData({
        title: "",
        description: "",
        partner_id: "",
        state: "",
        district: "",
        venue: "",
        start_date: "",
        end_date: "",
        duration_hours: "",
        expected_participants: "",
        training_mode: "OFFLINE",
        certification_provided: false,
        budget_allocated: "",
        selectedThemes: [],
        selectedAudiences: [],
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating training session:", error);
      toast.error("Failed to create training session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            New Training Session Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Training Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="e.g., Flood Risk Management Training"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="partner">Training Partner *</Label>
                <Select
                  value={formData.partner_id}
                  onValueChange={(value) =>
                    handleInputChange("partner_id", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select partner organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {partners.map((partner) => (
                      <SelectItem key={partner.id} value={partner.id || ""}>
                        {partner.name} ({partner.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Training objectives and detailed description"
                rows={3}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => {
                    handleInputChange("state", value);
                    handleInputChange("district", ""); // Reset district when state changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Select
                  value={formData.district}
                  onValueChange={(value) =>
                    handleInputChange("district", value)
                  }
                  disabled={!formData.state}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.state &&
                      districtsByState[formData.state]?.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => handleInputChange("venue", e.target.value)}
                  placeholder="Training venue/location"
                />
              </div>
            </div>

            {/* Dates and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    handleInputChange("start_date", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    handleInputChange("end_date", e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration_hours">Duration (Hours)</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  value={formData.duration_hours}
                  onChange={(e) =>
                    handleInputChange("duration_hours", e.target.value)
                  }
                  placeholder="e.g., 16"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="training_mode">Training Mode</Label>
                <Select
                  value={formData.training_mode}
                  onValueChange={(value) =>
                    handleInputChange("training_mode", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Participants and Budget */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expected_participants">
                  Expected Participants
                </Label>
                <Input
                  id="expected_participants"
                  type="number"
                  value={formData.expected_participants}
                  onChange={(e) =>
                    handleInputChange("expected_participants", e.target.value)
                  }
                  placeholder="e.g., 50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_allocated">Budget (₹)</Label>
                <Input
                  id="budget_allocated"
                  type="number"
                  value={formData.budget_allocated}
                  onChange={(e) =>
                    handleInputChange("budget_allocated", e.target.value)
                  }
                  placeholder="e.g., 100000"
                />
              </div>

              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="certification"
                    checked={formData.certification_provided}
                    onCheckedChange={(checked) =>
                      handleInputChange("certification_provided", checked)
                    }
                  />
                  <Label htmlFor="certification">Certification Provided</Label>
                </div>
              </div>
            </div>

            {/* Training Themes */}
            <div className="space-y-3">
              <Label>Training Themes</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {themes.map((theme) => (
                  <div key={theme.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`theme-${theme.id}`}
                      checked={formData.selectedThemes.includes(theme.id)}
                      onCheckedChange={() => handleThemeToggle(theme.id)}
                    />
                    <Label htmlFor={`theme-${theme.id}`} className="text-sm">
                      {theme.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Audiences */}
            <div className="space-y-3">
              <Label>Target Audiences</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {audiences.map((audience) => (
                  <div
                    key={audience.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`audience-${audience.id}`}
                      checked={formData.selectedAudiences.includes(audience.id)}
                      onCheckedChange={() => handleAudienceToggle(audience.id)}
                    />
                    <Label
                      htmlFor={`audience-${audience.id}`}
                      className="text-sm"
                    >
                      {audience.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Training Session
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrainingDataEntry;
