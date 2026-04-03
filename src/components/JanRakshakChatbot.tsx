import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  X,
  Minimize2,
  Maximize2,
  AlertTriangle,
  MapPin,
  Phone,
  FileText,
  Users,
  BarChart3,
  Bot,
  User,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, submitFloodReport, FloodReport } from "@/lib/supabase";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  data?: any;
}

interface JanRakshakChatbotProps {
  className?: string;
}

const JanRakshakChatbot: React.FC<JanRakshakChatbotProps> = ({
  className = "",
}) => {
  const { currentUser, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [floodData, setFloodData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load initial flood data
  useEffect(() => {
    if (isOpen && currentUser) {
      loadFloodData();
      if (messages.length === 0) {
        addWelcomeMessage();
      }
    }
  }, [isOpen, currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const loadFloodData = async () => {
    try {
      // Get recent flood reports
      const { data: reports } = await supabase
        .from("flood_reports")
        .select("*")
        .gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        )
        .order("created_at", { ascending: false })
        .limit(10);

      // Get nearby shelters
      const { data: shelters } = await supabase
        .from("shelters")
        .select("*")
        .eq("is_active", true)
        .limit(20);

      // Get emergency contacts
      const { data: contacts } = await supabase
        .from("emergency_contacts")
        .select("*")
        .eq("user_id", currentUser?.uid)
        .order("is_primary", { ascending: false })
        .limit(5);

      setFloodData({
        reports: reports || [],
        shelters: shelters || [],
        contacts: contacts || [],
        userLocation: userProfile?.location,
      });
    } catch (error) {
      console.error("Error loading flood data:", error);
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "bot",
      content: `Hello! I'm JanRakshak AI Assistant. I can help you with:

🚨 **Emergency Assistance**
• Submit flood reports
• Find nearby shelters
• Get emergency contacts

📊 **Flood Information**
• Check current flood status
• View recent reports
• Get flood predictions

🏠 **Location Services**
• Update your location
• Find nearby resources
• Get evacuation routes

How can I help you today?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const addMessage = (content: string, type: "user" | "bot", data?: any) => {
    const message: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      data,
    };
    setMessages((prev) => [...prev, message]);
  };

  const simulateTyping = async (response: string) => {
    setIsTyping(true);
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000)
    );
    setIsTyping(false);
    addMessage(response, "bot");
  };

  const handleSubmitReport = async (reportData: any) => {
    if (!currentUser || !userProfile) {
      await simulateTyping("Please sign in to submit a flood report.");
      return;
    }

    try {
      const report: Omit<FloodReport, "id" | "created_at" | "updated_at"> = {
        user_id: currentUser.uid,
        user_name: userProfile.full_name || userProfile.displayName || "User",
        user_email: currentUser.email || "",
        title: reportData.title || "Flood Report via Chatbot",
        description: reportData.description,
        severity: reportData.severity || "medium",
        location: {
          lat: reportData.location?.lat || userProfile.location?.lat || 0,
          lng: reportData.location?.lng || userProfile.location?.lng || 0,
          address:
            reportData.location?.address ||
            userProfile.location?.address ||
            "Unknown",
          state:
            reportData.location?.state ||
            userProfile.location?.state ||
            "Unknown",
          district:
            reportData.location?.district ||
            userProfile.location?.district ||
            "Unknown",
        },
        images: [],
        status: "pending",
      };

      const submittedReport = await submitFloodReport(report);

      if (submittedReport) {
        await simulateTyping(
          `✅ **Flood Report Submitted Successfully!**

📋 **Report Details:**
• Title: ${report.title}
• Severity: ${report.severity}
• Location: ${report.location.address}
• Status: Pending verification

Your report has been sent to our emergency response team. They will review and take appropriate action. Thank you for helping keep your community safe!`
        );
        toast.success("Flood report submitted successfully!");
      } else {
        await simulateTyping(
          "❌ Sorry, I couldn't submit your flood report. Please try again or contact emergency services directly."
        );
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      await simulateTyping(
        "❌ There was an error submitting your report. Please try again."
      );
    }
  };

  const processMessage = async (userMessage: string) => {
    const message = userMessage.toLowerCase().trim();

    // Emergency keywords
    if (
      message.includes("emergency") ||
      message.includes("help") ||
      message.includes("urgent")
    ) {
      await simulateTyping(
        `🚨 **EMERGENCY ASSISTANCE**

If this is a life-threatening emergency, call **108** immediately!

**Quick Actions:**
• 🚨 Call Emergency Services: 108
• 🏥 Call Ambulance: 102
• 👮 Call Police: 100

**I can help you:**
• Submit a flood report
• Find nearby shelters
• Get evacuation routes
• Contact emergency services

What type of assistance do you need?`
      );
      return;
    }

    // Report submission
    if (
      message.includes("report") ||
      message.includes("submit") ||
      message.includes("flood")
    ) {
      if (
        message.includes("report") &&
        (message.includes("submit") || message.includes("create"))
      ) {
        await simulateTyping(
          `📝 **Submit Flood Report**

I'll help you submit a flood report. Please provide:

1. **Description**: What's happening? (e.g., "Water level rising rapidly in my area")
2. **Severity**: How serious is it?
   • Low: Minor flooding, no immediate danger
   • Medium: Moderate flooding, some risk
   • High: Significant flooding, evacuation may be needed
   • Critical: Severe flooding, immediate danger

Please describe the flood situation:`
        );
        return;
      }
    }

    // Location services
    if (
      message.includes("location") ||
      message.includes("where") ||
      message.includes("nearby")
    ) {
      const location = userProfile?.location;
      if (location) {
        await simulateTyping(
          `📍 **Your Current Location**

**Address**: ${location.address || "Not specified"}
**State**: ${location.state || "Not specified"}
**District**: ${location.district || "Not specified"}

**Nearby Resources:**
• 🏠 Shelters: ${floodData?.shelters?.length || 0} available
• 📊 Recent Reports: ${floodData?.reports?.length || 0} in last 24h
• 👥 Emergency Contacts: ${floodData?.contacts?.length || 0} saved

Would you like me to help you find specific resources near your location?`
        );
      } else {
        await simulateTyping(
          `📍 **Location Services**

I don't have your location information. To provide better assistance, please:

1. Go to your profile settings
2. Update your location
3. Or tell me your current area

This helps me provide accurate flood information and emergency resources.`
        );
      }
      return;
    }

    // Shelter information
    if (
      message.includes("shelter") ||
      message.includes("safe") ||
      message.includes("evacuate")
    ) {
      const shelters = floodData?.shelters || [];
      if (shelters.length > 0) {
        const nearestShelters = shelters.slice(0, 3);
        let response = `🏠 **Nearby Emergency Shelters**

**Available Shelters:**
`;
        nearestShelters.forEach((shelter: any, index: number) => {
          response += `${index + 1}. **${shelter.name}**
   📍 ${shelter.address}
   📞 ${shelter.phone || "Contact local authorities"}
   👥 Capacity: ${shelter.capacity - (shelter.occupied || 0)} available
   
`;
        });
        response += `**Emergency Contacts:**
• 🚨 Emergency Services: 108
• 🏥 Ambulance: 102
• 👮 Police: 100

Would you like directions to any of these shelters?`;
        await simulateTyping(response);
      } else {
        await simulateTyping(
          `🏠 **Emergency Shelters**

I don't have shelter information for your area right now. 

**For immediate shelter assistance:**
• 🚨 Call Emergency Services: 108
• 📞 Contact local authorities
• 🏛️ Visit nearest government office

**Stay Safe:**
• Move to higher ground
• Avoid floodwaters
• Keep emergency kit ready

Is there anything else I can help you with?`
        );
      }
      return;
    }

    // Flood status
    if (
      message.includes("status") ||
      message.includes("flood") ||
      message.includes("water")
    ) {
      const reports = floodData?.reports || [];
      const criticalReports = reports.filter(
        (r: any) => r.severity === "critical"
      ).length;
      const highReports = reports.filter(
        (r: any) => r.severity === "high"
      ).length;

      await simulateTyping(
        `📊 **Current Flood Status**

**Recent Activity (Last 24 hours):**
• 📋 Total Reports: ${reports.length}
• 🚨 Critical: ${criticalReports}
• ⚠️ High Risk: ${highReports}

**Risk Assessment:**
${
  criticalReports > 0
    ? "🔴 **HIGH RISK** - Critical flooding reported"
    : highReports > 2
    ? "🟡 **MODERATE RISK** - Multiple high-risk reports"
    : reports.length > 5
    ? "🟢 **LOW RISK** - Some flooding activity"
    : "🟢 **MINIMAL RISK** - No significant flooding"
}

**Stay Informed:**
• Monitor weather updates
• Check local news
• Follow official advisories

Would you like to submit a new report or get more information?`
      );
      return;
    }

    // Help/Commands
    if (
      message.includes("help") ||
      message.includes("commands") ||
      message.includes("what can you do")
    ) {
      await simulateTyping(
        `🤖 **JanRakshak AI Assistant Commands**

**🚨 Emergency:**
• "emergency" - Get emergency assistance
• "help" - Show this help menu

**📝 Reports:**
• "submit report" - Create a flood report
• "flood status" - Check current flood situation

**📍 Location:**
• "my location" - Show your current location
• "nearby shelters" - Find emergency shelters

**📊 Information:**
• "flood data" - Get flood statistics
• "recent reports" - View recent flood reports

**💬 General:**
• Ask any question about floods, safety, or emergency procedures
• I can help with evacuation planning
• Get weather and flood predictions

What would you like to know?`
      );
      return;
    }

    // Default response
    await simulateTyping(
      `I understand you're asking about "${userMessage}". 

I'm here to help with flood-related emergencies and information. I can:

🚨 **Emergency Assistance** - Get help during floods
📝 **Submit Reports** - Report flood situations  
📍 **Location Services** - Find nearby resources
📊 **Flood Information** - Get current status

Could you be more specific about what you need help with? You can also type "help" to see all available commands.`
    );
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = inputValue.trim();
    addMessage(userMessage, "user");
    setInputValue("");

    await processMessage(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={toggleChat}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className="w-96 h-[500px] shadow-2xl border-0 bg-white">
        <CardHeader className="pb-2 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg">
              <Bot className="w-5 h-5 mr-2" />
              JanRakshak AI
            </CardTitle>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="text-white hover:bg-blue-700 h-8 w-8 p-0"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="text-white hover:bg-blue-700 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            <CardContent className="p-0 flex flex-col h-[420px]">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.type === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.type === "bot" && (
                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          {message.type === "user" && (
                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap text-sm">
                              {message.content}
                            </div>
                            <div className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              <div className="border-t p-3">
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isTyping ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default JanRakshakChatbot;






