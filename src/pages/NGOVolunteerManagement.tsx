import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import NGOLayout from "@/components/NGOLayout";
import GradientCard from "@/components/GradientCard";
import AnimatedCard from "@/components/AnimatedCard";
import { supabase } from "@/lib/supabase";
import {
  Users,
  UserPlus,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Award,
  Briefcase,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Edit,
} from "lucide-react";
import { toast } from "sonner";

interface Volunteer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  availability: "available" | "busy" | "offline";
  status: "active" | "inactive" | "pending";
  location?: string;
  experience_level: "beginner" | "intermediate" | "experienced" | "expert";
  languages?: string[];
  emergency_contact?: string;
  medical_info?: string;
  notes?: string;
  joined_date: string;
  last_activity?: string;
  completed_tasks: number;
  rating: number;
  certifications?: string[];
  created_at: string;
  updated_at: string;
}

interface CreateVolunteerRequest {
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  location?: string;
  experience_level: Volunteer["experience_level"];
  languages?: string[];
  emergency_contact?: string;
  medical_info?: string;
  notes?: string;
}

const NGOVolunteerManagement: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [filterExperience, setFilterExperience] = useState<string>("all");

  // Form state for adding new volunteer
  const [newVolunteer, setNewVolunteer] = useState<CreateVolunteerRequest>({
    name: "",
    email: "",
    phone: "",
    skills: [],
    location: "",
    experience_level: "beginner",
    languages: [],
    emergency_contact: "",
    medical_info: "",
    notes: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  // Real-time data fetching
  useEffect(() => {
    fetchVolunteers();

    // Set up real-time subscription
    const subscription = supabase
      .channel("volunteers")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "volunteers" },
        (payload) => {
          console.log("Volunteer change:", payload);
          fetchVolunteers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("volunteers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching volunteers:", error);
        toast.error("Failed to load volunteers");
        return;
      }

      setVolunteers(data || []);
    } catch (error) {
      console.error("Error in fetchVolunteers:", error);
      toast.error("Failed to load volunteers");
    } finally {
      setLoading(false);
    }
  };

  const addVolunteer = async () => {
    try {
      const { error } = await supabase.from("volunteers").insert([
        {
          ...newVolunteer,
          availability: "available",
          status: "active",
          joined_date: new Date().toISOString(),
          completed_tasks: 0,
          rating: 5.0,
        },
      ]);

      if (error) {
        console.error("Error adding volunteer:", error);
        toast.error("Failed to add volunteer");
        return;
      }

      toast.success("Volunteer added successfully");
      setIsCreateDialogOpen(false);
      setNewVolunteer({
        name: "",
        email: "",
        phone: "",
        skills: [],
        location: "",
        experience_level: "beginner",
        languages: [],
        emergency_contact: "",
        medical_info: "",
        notes: "",
      });
      setSkillInput("");
      setLanguageInput("");
      fetchVolunteers();
    } catch (error) {
      console.error("Error in addVolunteer:", error);
      toast.error("Failed to add volunteer");
    }
  };

  const updateVolunteerStatus = async (
    id: string,
    status: Volunteer["status"]
  ) => {
    try {
      const { error } = await supabase
        .from("volunteers")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating volunteer status:", error);
        toast.error("Failed to update status");
        return;
      }

      toast.success(`Volunteer status updated to ${status}`);
      fetchVolunteers();
    } catch (error) {
      console.error("Error in updateVolunteerStatus:", error);
      toast.error("Failed to update status");
    }
  };

  const updateVolunteerAvailability = async (
    id: string,
    availability: Volunteer["availability"]
  ) => {
    try {
      const { error } = await supabase
        .from("volunteers")
        .update({
          availability,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error updating volunteer availability:", error);
        toast.error("Failed to update availability");
        return;
      }

      toast.success(`Availability updated to ${availability}`);
      fetchVolunteers();
    } catch (error) {
      console.error("Error in updateVolunteerAvailability:", error);
      toast.error("Failed to update availability");
    }
  };

  // Handle skill input
  const addSkill = () => {
    if (skillInput.trim() && !newVolunteer.skills.includes(skillInput.trim())) {
      setNewVolunteer((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setNewVolunteer((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  // Handle language input
  const addLanguage = () => {
    if (
      languageInput.trim() &&
      !newVolunteer.languages?.includes(languageInput.trim())
    ) {
      setNewVolunteer((prev) => ({
        ...prev,
        languages: [...(prev.languages || []), languageInput.trim()],
      }));
      setLanguageInput("");
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setNewVolunteer((prev) => ({
      ...prev,
      languages:
        prev.languages?.filter((lang) => lang !== languageToRemove) || [],
    }));
  };

  // Filter volunteers
  const filteredVolunteers = volunteers.filter((volunteer) => {
    const matchesSearch =
      volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      volunteer.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      filterStatus === "all" || volunteer.status === filterStatus;
    const matchesAvailability =
      filterAvailability === "all" ||
      volunteer.availability === filterAvailability;
    const matchesExperience =
      filterExperience === "all" ||
      volunteer.experience_level === filterExperience;

    return (
      matchesSearch && matchesStatus && matchesAvailability && matchesExperience
    );
  });

  const getAvailabilityColor = (availability: Volunteer["availability"]) => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-yellow-100 text-yellow-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: Volunteer["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getExperienceIcon = (level: Volunteer["experience_level"]) => {
    switch (level) {
      case "beginner":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "intermediate":
        return <Briefcase className="h-4 w-4 text-green-500" />;
      case "experienced":
        return <Award className="h-4 w-4 text-orange-500" />;
      case "expert":
        return <Star className="h-4 w-4 text-purple-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  // Calculate statistics
  const stats = {
    total: volunteers.length,
    active: volunteers.filter((v) => v.status === "active").length,
    available: volunteers.filter((v) => v.availability === "available").length,
    busy: volunteers.filter((v) => v.availability === "busy").length,
    experienced: volunteers.filter(
      (v) =>
        v.experience_level === "experienced" || v.experience_level === "expert"
    ).length,
    highRated: volunteers.filter((v) => v.rating >= 4.5).length,
  };

  if (loading) {
    return (
      <NGOLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-lg">Loading volunteers...</span>
          </div>
        </div>
      </NGOLayout>
    );
  }

  return (
    <NGOLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <AnimatedCard delay={0} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-100">
                Volunteer Management
              </h1>
              <p className="text-gray-300 mt-1">
                Manage volunteer registrations and assignments
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={fetchVolunteers}
                variant="outline"
                className="flex items-center gap-2 border-white/30 text-gray-100 hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>

              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700">
                    <UserPlus className="h-4 w-4" />
                    Add Volunteer
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Volunteer</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={newVolunteer.name}
                      onChange={(e) =>
                        setNewVolunteer((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newVolunteer.email}
                      onChange={(e) =>
                        setNewVolunteer((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      value={newVolunteer.phone}
                      onChange={(e) =>
                        setNewVolunteer((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter current location"
                      value={newVolunteer.location}
                      onChange={(e) =>
                        setNewVolunteer((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience_level">Experience Level</Label>
                    <Select
                      value={newVolunteer.experience_level}
                      onValueChange={(value: any) =>
                        setNewVolunteer((prev) => ({
                          ...prev,
                          experience_level: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="experienced">Experienced</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input
                      id="emergency_contact"
                      placeholder="Emergency contact number"
                      value={newVolunteer.emergency_contact}
                      onChange={(e) =>
                        setNewVolunteer((prev) => ({
                          ...prev,
                          emergency_contact: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Skills</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill and press Enter"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addSkill();
                          }
                        }}
                      />
                      <Button type="button" onClick={addSkill} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newVolunteer.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => removeSkill(skill)}
                        >
                          {skill} ✕
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Languages</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a language and press Enter"
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addLanguage();
                          }
                        }}
                      />
                      <Button type="button" onClick={addLanguage} size="sm">
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newVolunteer.languages?.map((language, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => removeLanguage(language)}
                        >
                          {language} ✕
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="medical_info">Medical Information</Label>
                    <Textarea
                      id="medical_info"
                      placeholder="Any medical conditions, allergies, or important health information"
                      value={newVolunteer.medical_info}
                      onChange={(e) =>
                        setNewVolunteer((prev) => ({
                          ...prev,
                          medical_info: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information about the volunteer"
                      value={newVolunteer.notes}
                      onChange={(e) =>
                        setNewVolunteer((prev) => ({
                          ...prev,
                          notes: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false);
                      setNewVolunteer({
                        name: "",
                        email: "",
                        phone: "",
                        skills: [],
                        location: "",
                        experience_level: "beginner",
                        languages: [],
                        emergency_contact: "",
                        medical_info: "",
                        notes: "",
                      });
                      setSkillInput("");
                      setLanguageInput("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={addVolunteer}
                    disabled={!newVolunteer.name || !newVolunteer.email}
                  >
                    Add Volunteer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        </AnimatedCard>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <GradientCard variant="info" glow>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-400" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-200">Total</p>
                  <p className="text-xl font-bold text-gray-50">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="success" glow>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-200">Active</p>
                  <p className="text-xl font-bold text-gray-50">
                    {stats.active}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="success" glow>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Activity className="h-6 w-6 text-green-400" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-200">Available</p>
                  <p className="text-xl font-bold text-gray-50">
                    {stats.available}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="warning" glow>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-yellow-400" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-200">Busy</p>
                  <p className="text-xl font-bold text-gray-50">
                    {stats.busy}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="warning" glow>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Award className="h-6 w-6 text-orange-400" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-200">
                    Experienced
                  </p>
                  <p className="text-xl font-bold text-gray-50">
                    {stats.experienced}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>

          <GradientCard variant="purple" glow>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Star className="h-6 w-6 text-purple-400" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-200">
                    High Rated
                  </p>
                  <p className="text-xl font-bold text-gray-50">
                    {stats.highRated}
                  </p>
                </div>
              </div>
            </CardContent>
          </GradientCard>
        </div>

        {/* Filters */}
        <AnimatedCard delay={0.1} className="p-6 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterAvailability}
                onValueChange={setFilterAvailability}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterExperience}
                onValueChange={setFilterExperience}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="experienced">Experienced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </AnimatedCard>

        {/* Volunteers List */}
        {filteredVolunteers.length === 0 ? (
          <GradientCard variant="default" className="p-12 text-center">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-100 mb-2">
                No volunteers found
              </h3>
              <p className="text-gray-300 mb-6">
                {volunteers.length === 0
                  ? "Add your first volunteer to get started."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </CardContent>
          </GradientCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredVolunteers.map((volunteer, index) => (
              <AnimatedCard
                key={volunteer.id}
                delay={0.2 + index * 0.05}
                className="p-6"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {volunteer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-100">
                          {volunteer.name}
                        </h3>
                        <p className="text-sm text-gray-300">
                          {volunteer.email}
                        </p>
                        {volunteer.phone && (
                          <p className="text-sm text-gray-300 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {volunteer.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                      <Badge className={getStatusColor(volunteer.status)}>
                        {volunteer.status.toUpperCase()}
                      </Badge>
                      <Badge
                        className={getAvailabilityColor(volunteer.availability)}
                      >
                        {volunteer.availability.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {getExperienceIcon(volunteer.experience_level)}
                      <span className="text-sm text-gray-300 capitalize">
                        {volunteer.experience_level} level
                      </span>
                      <div className="flex items-center gap-1 ml-auto">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {volunteer.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {volunteer.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {volunteer.location}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {volunteer.completed_tasks} tasks completed
                      </span>
                    </div>

                    {volunteer.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Skills:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {volunteer.skills.slice(0, 4).map((skill, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {volunteer.skills.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{volunteer.skills.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {volunteer.languages && volunteer.languages.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Languages:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {volunteer.languages.map((language, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {language}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        Joined:{" "}
                        {new Date(volunteer.joined_date).toLocaleDateString()}
                      </p>

                      <div className="flex gap-2">
                        {volunteer.availability === "available" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateVolunteerAvailability(volunteer.id, "busy")
                            }
                          >
                            Assign Task
                          </Button>
                        )}

                        {volunteer.availability === "busy" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateVolunteerAvailability(
                                volunteer.id,
                                "available"
                              )
                            }
                          >
                            Mark Available
                          </Button>
                        )}

                        {volunteer.status === "active" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateVolunteerStatus(volunteer.id, "inactive")
                            }
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateVolunteerStatus(volunteer.id, "active")
                            }
                          >
                            Activate
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </AnimatedCard>
            ))}
          </div>
        )}
      </div>
    </NGOLayout>
  );
};

export default NGOVolunteerManagement;
