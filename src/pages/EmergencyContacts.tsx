import React, { useState, useEffect } from "react";
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UserLayout from "@/components/UserLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Phone,
  Plus,
  Edit,
  Trash2,
  Heart,
  Shield,
  AlertTriangle,
  Users,
  MapPin,
  Clock,
  Star,
  ArrowLeft,
  MessageSquare,
  Send,
  CheckCircle,
  X,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import JanRakshakChatbot from "@/components/JanRakshakChatbot";

interface EmergencyContact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface EmergencyMessage {
  id: string;
  user_id: string;
  contact_id: string;
  message: string;
  status: "sent" | "failed" | "pending";
  created_at: string;
}

const EmergencyContacts = () => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // State management
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedContact, setSelectedContact] =
    useState<EmergencyContact | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    relationship: "",
    is_primary: false,
  });

  // Load contacts
  useEffect(() => {
    if (currentUser) {
      loadContacts();
    }
  }, [currentUser]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      console.log("Loading emergency contacts...");

      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", currentUser?.uid)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading contacts:", error);
        toast.error("Failed to load emergency contacts");
        return;
      }

      console.log("Emergency contacts loaded:", data);
      setContacts(data || []);
    } catch (error) {
      console.error("Error loading contacts:", error);
      toast.error("Failed to load emergency contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!currentUser?.uid) return;

    try {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .insert([
          {
            user_id: currentUser.uid,
            name: formData.name,
            phone_number: formData.phone_number,
            relationship: formData.relationship,
            is_primary: formData.is_primary,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error adding contact:", error);
        toast.error("Failed to add emergency contact");
        return;
      }

      console.log("Emergency contact added:", data);
      setContacts((prev) => [...prev, data]);
      setShowAddDialog(false);
      setFormData({
        name: "",
        phone_number: "",
        relationship: "",
        is_primary: false,
      });
      toast.success("Emergency contact added successfully");
    } catch (error) {
      console.error("Error adding contact:", error);
      toast.error("Failed to add emergency contact");
    }
  };

  const handleUpdateContact = async () => {
    if (!selectedContact) return;

    try {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .update({
          name: formData.name,
          phone_number: formData.phone_number,
          relationship: formData.relationship,
          is_primary: formData.is_primary,
        })
        .eq("id", selectedContact.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating contact:", error);
        toast.error("Failed to update emergency contact");
        return;
      }

      console.log("Emergency contact updated:", data);
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === selectedContact.id ? data : contact
        )
      );
      setShowEditDialog(false);
      setSelectedContact(null);
      setFormData({
        name: "",
        phone_number: "",
        relationship: "",
        is_primary: false,
      });
      toast.success("Emergency contact updated successfully");
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update emergency contact");
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      const { error } = await supabase
        .from("emergency_contacts")
        .delete()
        .eq("id", contactId);

      if (error) {
        console.error("Error deleting contact:", error);
        toast.error("Failed to delete emergency contact");
        return;
      }

      setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
      toast.success("Emergency contact deleted successfully");
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete emergency contact");
    }
  };

  const handleCallContact = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, "_self");
  };

  const handleSendMessage = async () => {
    if (!selectedContact || !messageText.trim()) return;

    setSendingMessage(true);
    try {
      // Log the message attempt
      const { data: messageData, error: messageError } = await supabase
        .from("emergency_messages")
        .insert([
          {
            user_id: currentUser?.uid,
            contact_id: selectedContact.id,
            message: messageText,
            status: "sent",
          },
        ])
        .select()
        .single();

      if (messageError) {
        console.error("Error logging message:", messageError);
      }

      // In a real app, you would integrate with SMS service here
      // For now, we'll simulate sending
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Emergency message sent:", messageData);
      setShowMessageDialog(false);
      setMessageText("");
      setSelectedContact(null);
      toast.success("Emergency message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send emergency message");
    } finally {
      setSendingMessage(false);
    }
  };

  const openEditDialog = (contact: EmergencyContact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      phone_number: contact.phone_number,
      relationship: contact.relationship,
      is_primary: contact.is_primary,
    });
    setShowEditDialog(true);
  };

  const openMessageDialog = (contact: EmergencyContact) => {
    setSelectedContact(contact);
    setMessageText(
      `Emergency: I need help! My location: [Your current location]. Please contact me immediately.`
    );
    setShowMessageDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone_number: "",
      relationship: "",
      is_primary: false,
    });
    setSelectedContact(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600">Loading emergency contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <UserLayout
      title="Emergency Contacts"
      description="Manage your emergency contacts"
    >
      <style>{`
        ${theme === 'high-contrast' ? `
          .text-gray-600, .text-gray-700, .text-gray-800, .text-gray-900,
          .text-gray-500, .text-gray-400, .text-slate-600, .text-slate-700,
          .text-slate-500, .text-slate-900, .text-slate-800, .text-red-600,
          .text-blue-600, .text-green-600, .text-orange-600, .text-blue-900,
          .text-purple-500, .text-red-500, .text-green-500 {
            color: hsl(0, 0%, 100%) !important;
          }
          .bg-white\\/80, .bg-white\\/90, .bg-white\\/95, .bg-white, 
          .bg-red-50, .bg-blue-50, .bg-green-50, .bg-orange-50,
          .bg-gray-50, .bg-slate-50, .bg-red-100, .bg-blue-100,
          .bg-yellow-100 {
            background-color: hsl(0, 0%, 10%) !important;
            border-color: hsl(0, 0%, 40%) !important;
          }
          .hover\\:bg-gray-50:hover {
            background-color: hsl(0, 0%, 15%) !important;
          }
          .bg-clip-text {
            -webkit-text-fill-color: hsl(47, 100%, 60%) !important;
          }
          .border-red-200, .border-blue-200, .border-green-200,
          .border-gray-200, .border-slate-200, .border-yellow-200 {
            border-color: hsl(0, 0%, 40%) !important;
          }
          .shadow-lg, .shadow-sm, .shadow {
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.1) !important;
          }
          .text-yellow-800 {
            color: hsl(47, 100%, 60%) !important;
          }
        ` : ''}
      `}</style>
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Emergency Contacts
              </h1>
              <p className="text-sm text-gray-600">
                Manage your emergency contacts
              </p>
            </div>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Emergency Contact</DialogTitle>
                <DialogDescription>
                  Add a trusted contact for emergency situations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone_number: e.target.value,
                      }))
                    }
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={formData.relationship}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        relationship: e.target.value,
                      }))
                    }
                    placeholder="e.g., Family, Friend, Neighbor"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="primary"
                    checked={formData.is_primary}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        is_primary: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="primary">Primary Contact</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddContact}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Add Contact
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Emergency Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Emergency Actions
            </CardTitle>
            <CardDescription>
              Quick access to emergency services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Button
                className="h-16 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => window.open("tel:108", "_self")}
              >
                <Phone className="w-6 h-6 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Emergency</div>
                  <div className="text-xs opacity-90">108</div>
                </div>
              </Button>
              <Button
                className="h-16 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.open("tel:100", "_self")}
              >
                <Shield className="w-6 h-6 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Police</div>
                  <div className="text-xs opacity-90">100</div>
                </div>
              </Button>
              <Button
                className="h-16 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open("tel:102", "_self")}
              >
                <Heart className="w-6 h-6 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Ambulance</div>
                  <div className="text-xs opacity-90">102</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* JanRakshak AI Assistant */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-600">
              <MessageSquare className="w-5 h-5 mr-2" />
              AI Emergency Assistant
            </CardTitle>
            <CardDescription>
              Get instant help with flood emergencies and safety information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Available Features:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                    Emergency Assistance
                  </div>
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-green-500" />
                    Submit Reports
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    Find Shelters
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-purple-500" />
                    Emergency Contacts
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Click the chat button in the bottom right corner to start a
                conversation with our AI assistant. It can help you submit flood
                reports, find emergency resources, and get safety information.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contacts List */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Your Emergency Contacts ({contacts.length})
            </CardTitle>
            <CardDescription>
              Trusted contacts for emergency situations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contacts.length > 0 ? (
              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{contact.name}</h3>
                            {contact.is_primary && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <Star className="w-3 h-3 mr-1" />
                                Primary
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {contact.relationship}
                          </p>
                          <p className="text-sm text-gray-500">
                            {contact.phone_number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            handleCallContact(contact.phone_number)
                          }
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openMessageDialog(contact)}
                        >
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(contact)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">
                  No emergency contacts
                </h3>
                <p className="mb-4">
                  Add trusted contacts for emergency situations
                </p>
                <Button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Contact
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Contact Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Emergency Contact</DialogTitle>
            <DialogDescription>
              Update your emergency contact information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter contact name"
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone_number: e.target.value,
                  }))
                }
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="edit-relationship">Relationship</Label>
              <Input
                id="edit-relationship"
                value={formData.relationship}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    relationship: e.target.value,
                  }))
                }
                placeholder="e.g., Family, Friend, Neighbor"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-primary"
                checked={formData.is_primary}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_primary: e.target.checked,
                  }))
                }
                className="rounded"
              />
              <Label htmlFor="edit-primary">Primary Contact</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateContact}
              className="bg-red-600 hover:bg-red-700"
            >
              Update Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Dialog */}
      <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Emergency Message</DialogTitle>
            <DialogDescription>
              Send an emergency message to {selectedContact?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Emergency Message</Label>
              <Textarea
                id="message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Enter your emergency message..."
                rows={4}
              />
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This message will be sent via SMS to{" "}
                {selectedContact?.phone_number}
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMessageDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              className="bg-red-600 hover:bg-red-700"
              disabled={sendingMessage || !messageText.trim()}
            >
              {sendingMessage ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
};

export default EmergencyContacts;
