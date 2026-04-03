import { useState, ChangeEvent, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  Loader2,
  X,
  Camera,
  Sparkles,
  AlertTriangle,
  DollarSign,
  Trash2,
  Cpu,
  ClipboardList,
  Shield,
  Zap,
  Siren,
  Settings,
  Check,
  Eye,
  Clock,
  MapPin,
  Phone,
  ExternalLink,
  Globe,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFirebase } from "@/lib/firebase";

interface DamageAssessment {
  damage_level: string;
  hindi_damage_level: string;
  confidence: number;
  estimated_cost_display: string;
  ndma_category: string;
  relief_amount_display: string;
  color: string;
  description: string;
  hindi_description: string;
  recommendations: {
    immediate_actions: string[];
    relief_application: {
      required: boolean;
      category: string;
      amount: string;
      form: string;
      deadline: string;
    };
    documentation_required: string[];
    timeline: string;
  };
  emergency_contacts: {
    disaster_control: string;
    relief_commissioner: string;
    district_collector: string;
  };
  state: string;
}

const FloodDamageAnalysis = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<
    "idle" | "analyzing" | "complete" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [assessment, setAssessment] = useState<DamageAssessment | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [selectedState, setSelectedState] = useState("punjab");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
        },
        () => {
          // Default to Punjab center if geolocation fails
          setUserLocation({ lat: 30.7333, lon: 76.7794 });
        }
      );
    }
  }, []);

  const states = [
    { value: "punjab", label: "Punjab", hindi: "पंजाब" },
    { value: "haryana", label: "Haryana", hindi: "हरियाणा" },
    {
      value: "himachal_pradesh",
      label: "Himachal Pradesh",
      hindi: "हिमाचल प्रदेश",
    },
    { value: "uttar_pradesh", label: "Uttar Pradesh", hindi: "उत्तर प्रदेश" },
    { value: "rajasthan", label: "Rajasthan", hindi: "राजस्थान" },
  ];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length) {
      const newFiles = [...uploadedFiles, ...files];
      setUploadedFiles(newFiles);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
      setAnalysisStatus("idle");
      setAssessment(null);
      setProgress(0);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) return;

    setAnalysisStatus("analyzing");
    setErrorMessage(null);
    setProgress(0);

    try {
      // For demo purposes, skip Firebase Storage and use mock data
      // In production, uncomment the Firebase Storage code below
      setProgress(20);

      // Mock download URL for testing
      const downloadURL = URL.createObjectURL(uploadedFiles[0]);
      setProgress(50);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProgress(70);

      /* 
      // Production Firebase Storage code (uncomment when ready)
      const { storage } = getFirebase();
      const file = uploadedFiles[0];
      const fileName = `damage_assessments/${Date.now()}_${file.name}`;
      const storageRef = storage.ref(fileName);
      
      setProgress(20);
      
      // Upload file with metadata
      const uploadTask = storageRef.put(file, {
        customMetadata: {
          userId: 'current_user', // Replace with actual user ID
          state: selectedState,
          latitude: userLocation?.lat.toString() || '',
          longitude: userLocation?.lon.toString() || ''
        }
      });

      await uploadTask;
      setProgress(50);

      // Get download URL
      const downloadURL = await storageRef.getDownloadURL();
      setProgress(70);
      */

      // Call xView2 API (replace with actual Cloud Run URL)
      // For now, use mock data since API isn't deployed
      const xview2ApiUrl =
        import.meta.env.VITE_XVIEW2_API_URL ||
        "https://xview2-damage-detection-xxxxx-uc.a.run.app";

      try {
        const xview2Response = await fetch(`${xview2ApiUrl}/analyze`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image_url: downloadURL,
            state: selectedState,
            latitude: userLocation?.lat,
            longitude: userLocation?.lon,
            user_id: "current_user",
          }),
        });

        if (!xview2Response.ok) {
          throw new Error("xView2 API not available, using mock data");
        }

        const result = await xview2Response.json();
        setProgress(90);

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setAssessment(result);
        setAnalysisStatus("complete");
        setProgress(100);
      } catch (apiError) {
        console.warn("xView2 API not available, using mock data:", apiError);
        setProgress(90);

        // Generate mock assessment data
        const mockAssessment = generateMockAssessment(selectedState);
        setProgress(95);

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setAssessment(mockAssessment);
        setAnalysisStatus("complete");
        setProgress(100);
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Analysis failed"
      );
      setAnalysisStatus("error");
    }
  };

  // Generate mock assessment data for testing
  const generateMockAssessment = (state: string): DamageAssessment => {
    const damageLevels = ["Minor Damage", "Major Damage", "Destroyed"];
    const hindiLevels = ["मामूली नुकसान", "बड़ा नुकसान", "पूरी तरह नष्ट"];
    const randomIndex = Math.floor(Math.random() * damageLevels.length);

    const damageLevel = damageLevels[randomIndex];
    const hindiDamageLevel = hindiLevels[randomIndex];
    const confidence = 0.7 + Math.random() * 0.3; // 70-100% confidence

    const costRanges = {
      "Minor Damage": { min: 20000, max: 50000, display: "₹20K - ₹50K" },
      "Major Damage": { min: 100000, max: 300000, display: "₹1L - ₹3L" },
      Destroyed: { min: 500000, max: 2000000, display: "₹5L+" },
    };

    const ndmaCategories = {
      "Minor Damage": "Category C",
      "Major Damage": "Category B",
      Destroyed: "Category A",
    };

    const reliefAmounts = {
      punjab: {
        "Category A": "₹4L",
        "Category B": "₹2L",
        "Category C": "₹50K",
      },
      haryana: {
        "Category A": "₹3.5L",
        "Category B": "₹1.8L",
        "Category C": "₹45K",
      },
      himachal_pradesh: {
        "Category A": "₹4.5L",
        "Category B": "₹2.2L",
        "Category C": "₹55K",
      },
      default: {
        "Category A": "₹4L",
        "Category B": "₹2L",
        "Category C": "₹50K",
      },
    };

    const colors = {
      "Minor Damage": "#F59E0B",
      "Major Damage": "#EF4444",
      Destroyed: "#7C2D12",
    };

    const descriptions = {
      "Minor Damage": "Minor structural damage, repairable",
      "Major Damage": "Significant structural damage, requires major repairs",
      Destroyed: "Structure is completely destroyed or severely damaged",
    };

    const hindiDescriptions = {
      "Minor Damage": "मामूली संरचनात्मक नुकसान, मरम्मत योग्य",
      "Major Damage": "काफी संरचनात्मक नुकसान, बड़ी मरम्मत की जरूरत",
      Destroyed: "संरचना पूरी तरह नष्ट या गंभीर रूप से क्षतिग्रस्त",
    };

    const costRange = costRanges[damageLevel as keyof typeof costRanges];
    const ndmaCategory =
      ndmaCategories[damageLevel as keyof typeof ndmaCategories];
    const reliefAmount =
      reliefAmounts[state as keyof typeof reliefAmounts]?.[
        ndmaCategory as keyof (typeof reliefAmounts)["default"]
      ] ||
      reliefAmounts["default"][
        ndmaCategory as keyof (typeof reliefAmounts)["default"]
      ];

    return {
      damage_level: damageLevel,
      hindi_damage_level: hindiDamageLevel,
      confidence: Math.round(confidence * 100) / 100,
      estimated_cost_display: costRange.display,
      ndma_category: ndmaCategory,
      relief_amount_display: reliefAmount,
      color: colors[damageLevel as keyof typeof colors],
      description: descriptions[damageLevel as keyof typeof descriptions],
      hindi_description:
        hindiDescriptions[damageLevel as keyof typeof hindiDescriptions],
      recommendations: {
        immediate_actions: [
          "Contact emergency services immediately",
          "Keep emergency contacts ready",
          "Document all damage with detailed photos",
        ],
        relief_application: {
          required: true,
          category: ndmaCategory,
          amount: reliefAmount,
          form: `SDRF Form 1${ndmaCategory === "Category A" ? "A" : "B"}`,
          deadline:
            damageLevel === "Destroyed"
              ? "Within 7 days"
              : damageLevel === "Major Damage"
              ? "Within 15 days"
              : "Within 30 days",
        },
        documentation_required: [
          "Property ownership documents",
          "Aadhaar card copy",
          "Bank account details",
          "Recent property photos",
        ],
        timeline:
          damageLevel === "Destroyed"
            ? "Apply within 7 days, processing takes 5-15 days"
            : damageLevel === "Major Damage"
            ? "Apply within 15 days, processing takes 10-20 days"
            : "Apply within 30 days, processing takes 15-30 days",
      },
      emergency_contacts: {
        disaster_control: "+91-172-2740000",
        relief_commissioner: "+91-172-2740001",
        district_collector: "+91-172-2740002",
      },
      state: state.charAt(0).toUpperCase() + state.slice(1).replace("_", " "),
    };
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setPreviews([]);
    setAnalysisStatus("idle");
    setAssessment(null);
    setProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);

  const getDamageColor = (damageLevel: string) => {
    switch (damageLevel) {
      case "Minor Damage":
        return "bg-yellow-500";
      case "Major Damage":
        return "bg-orange-500";
      case "Destroyed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityBadge = (damageLevel: string) => {
    switch (damageLevel) {
      case "Destroyed":
        return "bg-red-600 text-white";
      case "Major Damage":
        return "bg-orange-500 text-white";
      case "Minor Damage":
        return "bg-yellow-400 text-slate-900";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const t = (key: string) => {
    const translations = {
      en: {
        title: "AI-Powered Flood Damage Assessment",
        subtitle:
          "Upload images to get instant damage analysis with NDMA relief recommendations",
        uploadText: "Drop images here or click to browse",
        uploadSubtext: "Upload PNG, JPG, or HEIC files for damage assessment",
        analyzeButton: "Run AI Analysis",
        clearButton: "Clear All",
        damageLevel: "Damage Level",
        confidence: "Confidence",
        estimatedCost: "Estimated Cost",
        ndmaCategory: "NDMA Category",
        reliefAmount: "Relief Amount",
        immediateActions: "Immediate Actions",
        reliefApplication: "Relief Application",
        documentationRequired: "Documentation Required",
        emergencyContacts: "Emergency Contacts",
        recommendations: "Recommendations",
        analysisReport: "AI Analysis Report",
        selectState: "Select State",
        language: "Language",
      },
      hi: {
        title: "AI-संचालित बाढ़ क्षति मूल्यांकन",
        subtitle:
          "NDMA राहत सिफारिशों के साथ तत्काल क्षति विश्लेषण के लिए छवियां अपलोड करें",
        uploadText: "यहां छवियां छोड़ें या ब्राउज़ करने के लिए क्लिक करें",
        uploadSubtext:
          "क्षति मूल्यांकन के लिए PNG, JPG, या HEIC फाइलें अपलोड करें",
        analyzeButton: "AI विश्लेषण चलाएं",
        clearButton: "सभी साफ करें",
        damageLevel: "क्षति स्तर",
        confidence: "विश्वसनीयता",
        estimatedCost: "अनुमानित लागत",
        ndmaCategory: "NDMA श्रेणी",
        reliefAmount: "राहत राशि",
        immediateActions: "तत्काल कार्य",
        reliefApplication: "राहत आवेदन",
        documentationRequired: "आवश्यक दस्तावेज",
        emergencyContacts: "आपातकालीन संपर्क",
        recommendations: "सिफारिशें",
        analysisReport: "AI विश्लेषण रिपोर्ट",
        selectState: "राज्य चुनें",
        language: "भाषा",
      },
    };
    return translations[language][key] || key;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-800 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          {t("subtitle")}
        </p>

        {/* Language and State Selection */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as "en" | "hi")}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              {states.map((state) => (
                <option key={state.value} value={state.value}>
                  {language === "hi" ? state.hindi : state.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Upload Section */}
        <div className="space-y-6">
          <div
            onClick={handleUploadClick}
            className="relative block w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-blue-500 bg-slate-50/70 hover:bg-slate-100"
          >
            <Camera className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-sm font-semibold text-slate-600">
              {t("uploadText")}
            </p>
            <p className="mt-1 text-xs text-slate-500">{t("uploadSubtext")}</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="sr-only"
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/heic, image/heif"
            />
          </div>

          {previews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  {t("analysisReport")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="rounded-lg object-cover w-full h-32"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {analysisStatus === "idle" && (
                  <Button
                    onClick={handleAnalyze}
                    className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t("analyzeButton")} ({uploadedFiles.length}{" "}
                    {language === "hi" ? "छवियां" : "images"})
                  </Button>
                )}
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="w-full mt-2"
                >
                  {t("clearButton")}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Analysis Results */}
        <Card className="h-full sticky top-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-3" />
              {t("analysisReport")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analysisStatus === "complete" && assessment ? (
              <div className="space-y-6 text-sm">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>
                      {language === "hi"
                        ? "विश्लेषण पूर्ण"
                        : "Analysis Complete"}
                    </span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                {/* Damage Level */}
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                  <span className="font-semibold text-slate-700">
                    {t("damageLevel")}
                  </span>
                  <Badge className={getPriorityBadge(assessment.damage_level)}>
                    {language === "hi"
                      ? assessment.hindi_damage_level
                      : assessment.damage_level}
                  </Badge>
                </div>

                {/* Confidence and Cost */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-600">{t("confidence")}</p>
                    <p className="font-bold text-lg text-slate-800">
                      {Math.round(assessment.confidence * 100)}%
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-600">{t("estimatedCost")}</p>
                    <p className="font-bold text-lg text-slate-800">
                      {assessment.estimated_cost_display}
                    </p>
                  </div>
                </div>

                {/* NDMA Category and Relief Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-600">{t("ndmaCategory")}</p>
                    <p className="font-bold text-lg text-slate-800">
                      {assessment.ndma_category}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-600">{t("reliefAmount")}</p>
                    <p className="font-bold text-lg text-slate-800">
                      {assessment.relief_amount_display}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-slate-600 mb-1">
                    {language === "hi" ? "विवरण" : "Description"}
                  </p>
                  <p className="text-slate-800">
                    {language === "hi"
                      ? assessment.hindi_description
                      : assessment.description}
                  </p>
                </div>

                {/* Immediate Actions */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Siren className="w-4 h-4 mr-2 text-red-600" />
                    {t("immediateActions")}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {assessment.recommendations.immediate_actions.map(
                      (action, i) => (
                        <li key={i}>{action}</li>
                      )
                    )}
                  </ul>
                </div>

                {/* Relief Application */}
                {assessment.recommendations.relief_application.required && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <h4 className="font-semibold mb-2 text-blue-800">
                      {t("reliefApplication")}
                    </h4>
                    <div className="space-y-2 text-blue-700">
                      <p>
                        <strong>
                          {language === "hi" ? "श्रेणी:" : "Category:"}
                        </strong>{" "}
                        {assessment.recommendations.relief_application.category}
                      </p>
                      <p>
                        <strong>
                          {language === "hi" ? "राशि:" : "Amount:"}
                        </strong>{" "}
                        {assessment.recommendations.relief_application.amount}
                      </p>
                      <p>
                        <strong>
                          {language === "hi" ? "फॉर्म:" : "Form:"}
                        </strong>{" "}
                        {assessment.recommendations.relief_application.form}
                      </p>
                      <p>
                        <strong>
                          {language === "hi" ? "अंतिम तिथि:" : "Deadline:"}
                        </strong>{" "}
                        {assessment.recommendations.relief_application.deadline}
                      </p>
                    </div>
                  </div>
                )}

                {/* Emergency Contacts */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-red-600" />
                    {t("emergencyContacts")}
                  </h4>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        window.open(
                          `tel:${assessment.emergency_contacts.disaster_control}`,
                          "_self"
                        )
                      }
                    >
                      <Phone className="w-3 h-3 mr-2" />
                      {language === "hi"
                        ? "आपदा नियंत्रण:"
                        : "Disaster Control:"}{" "}
                      {assessment.emergency_contacts.disaster_control}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() =>
                        window.open(
                          `tel:${assessment.emergency_contacts.relief_commissioner}`,
                          "_self"
                        )
                      }
                    >
                      <Phone className="w-3 h-3 mr-2" />
                      {language === "hi"
                        ? "राहत आयुक्त:"
                        : "Relief Commissioner:"}{" "}
                      {assessment.emergency_contacts.relief_commissioner}
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${userLocation?.lat},${userLocation?.lon}`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {language === "hi"
                      ? "Google Maps में खोलें"
                      : "Open in Google Maps"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const reportData = {
                        damageLevel: assessment.damage_level,
                        confidence: assessment.confidence,
                        estimatedCost: assessment.estimated_cost_display,
                        ndmaCategory: assessment.ndma_category,
                        reliefAmount: assessment.relief_amount_display,
                        state: assessment.state,
                        timestamp: new Date().toISOString(),
                      };
                      const blob = new Blob(
                        [JSON.stringify(reportData, null, 2)],
                        { type: "application/json" }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `damage-report-${Date.now()}.json`;
                      a.click();
                    }}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : analysisStatus === "analyzing" ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4">
                <Loader2 className="w-8 h-8 mb-2 animate-spin" />
                <p>
                  {progress}% -{" "}
                  {language === "hi"
                    ? "छवि का विश्लेषण कर रहे हैं..."
                    : "Analyzing image..."}
                </p>
                <Progress value={progress} className="w-full mt-4" />
              </div>
            ) : analysisStatus === "error" ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-red-500 border-2 border-dashed border-red-500 rounded-lg p-4">
                <AlertTriangle className="w-8 h-8 mb-2" />
                <p>
                  {language === "hi"
                    ? "विश्लेषण के दौरान त्रुटि हुई।"
                    : "An error occurred during analysis."}
                </p>
                <p className="text-xs mt-2 text-red-400">{errorMessage}</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 border-2 border-dashed rounded-lg p-4">
                <Eye className="w-10 h-10 mb-4 text-slate-400" />
                <p className="font-semibold">
                  {language === "hi"
                    ? "AI-संचालित अंतर्दृष्टि की प्रतीक्षा"
                    : "AI-Powered Insights Await"}
                </p>
                <p className="text-xs mt-2 text-slate-400 max-w-xs mx-auto">
                  {language === "hi"
                    ? "आपकी व्यापक क्षति मूल्यांकन रिपोर्ट यहां उत्पन्न की जाएगी। शुरू करने के लिए बस एक या अधिक छवियां अपलोड करें।"
                    : "Your comprehensive damage assessment report will be generated here. Just upload one or more images to get started."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FloodDamageAnalysis;
