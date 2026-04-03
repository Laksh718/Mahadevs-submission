import { useState, ChangeEvent, useRef } from 'react';
import { UploadCloud, FileText, Loader2, X, Camera, Sparkles, AlertTriangle, DollarSign, Trash2, Cpu, ClipboardList, Shield, Zap, Siren, Settings, Check, Eye, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const ImageAnalysis = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'analyzing' | 'complete' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analysisSteps = [
    { text: `Processing images locally...`, duration: 500, progress: 20 },
    { text: `Running local damage detection model...`, duration: 1500, progress: 70 },
    { text: "Generating final report...", duration: 500, progress: 100 },
  ];
  
  const recentAnalyses = [
    { id: "RPT-20240715-001", date: "2024-07-15", severity: "Severe", images: 12, priority: "High" },
    { id: "RPT-20240714-005", date: "2024-07-14", severity: "Moderate", images: 5, priority: "Medium" },
    { id: "RPT-20240714-004", date: "2024-07-14", severity: "Catastrophic", images: 34, priority: "Critical" },
    { id: "RPT-20240713-002", date: "2024-07-13", severity: "Minor", images: 8, priority: "Low" },
  ];

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length) {
      const newFiles = [...uploadedFiles, ...files];
      setUploadedFiles(newFiles);
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews([...previews, ...newPreviews]);
      setAnalysisStatus('idle');
      setReport(null);
      setProgress(0);
      setCurrentStep(0);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) return;

    setAnalysisStatus('analyzing');
    setErrorMessage(null);
    setProgress(0);
    setCurrentStep(0);

    for (const step of analysisSteps) {
      setCurrentStep((prev) => prev + 1);
      await new Promise(resolve => setTimeout(resolve, step.duration));
      setProgress(step.progress);
    }

    generateDummyReport(uploadedFiles.length);
    setAnalysisStatus('complete');
  };

  const generateDummyReport = (numImages: number) => {
    const severities = ['Minimal', 'Minor', 'Moderate', 'Severe', 'Catastrophic'];
    const damageTypes = ['Inundation', 'Structural Collapse', 'Wildfire', 'Landslide', 'Utility Damage'];
    const hazardTypes = ['Gas Leak', 'Exposed Wiring', 'Contaminated Water', 'Unstable Structures'];
    const recommendations = [
      "Deploy initial assessment team for on-site verification.",
      "Alert residents and advise immediate evacuation of affected zones.",
      "Coordinate with utility companies to shut off services in hazardous areas.",
      "Mobilize heavy machinery for debris clearance on primary routes.",
      "Request engineering corps for structural integrity assessment.",
      "Establish a 500-meter safety perimeter around unstable structures."
    ];

    const randomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    const randomSubset = (arr: any[], n: number) => arr.sort(() => 0.5 - Math.random()).slice(0, n);

    const damageBreakdown = randomSubset(damageTypes, 3).map(type => ({
      type,
      percentage: Math.random() * 100,
      severity: randomElement(severities)
    }));

    const totalPercentage = damageBreakdown.reduce((sum, item) => sum + item.percentage, 0);
    damageBreakdown.forEach(item => item.percentage = (item.percentage / totalPercentage) * 100);

    const repairCost = Math.floor(Math.random() * 500000) + 50000;
    const recoveryCost = Math.floor(Math.random() * 200000) + 25000;

    const damageReport = {
      totalImages: numImages,
      timestamp: new Date().toISOString(),
      confidenceScore: Math.random() * 10 + 90,
      priority: randomElement(['Low', 'Medium', 'High', 'Critical']),
      overallSeverity: randomElement(severities),
      detectedHazards: randomSubset(hazardTypes, 2),
      damageBreakdown,
      estimatedCost: {
        repair: repairCost,
        recovery: recoveryCost,
        total: repairCost + recoveryCost
      },
      actionableSteps: randomSubset(recommendations, 3),
      modelInfo: {
        name: 'DisasterNet-v5.2',
        version: '3.0.1',
        accuracy: 98.2,
      },
    };
    setReport(damageReport);
  };

  const handleReset = () => {
    setUploadedFiles([]);
    setPreviews([]);
    setAnalysisStatus('idle');
    setReport(null);
    setProgress(0);
    setCurrentStep(0);
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

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Critical': return "bg-red-600 text-white hover:bg-red-700";
      case 'High': return "bg-orange-500 text-white hover:bg-orange-600";
      case 'Medium': return "bg-yellow-400 text-slate-900 hover:bg-yellow-500";
      default: return "bg-blue-500 text-white hover:bg-blue-600";
    }
  };
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Catastrophic': return 'bg-red-500';
      case 'Severe': return 'bg-orange-500';
      case 'Moderate': return 'bg-yellow-500';
      case 'Minor': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <div onClick={handleUploadClick} className="relative block w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-blue-500 bg-slate-50/70 hover:bg-slate-100">
            <Camera className="mx-auto h-12 w-12 text-slate-400" />
            <p className="mt-4 text-sm font-semibold text-slate-600">Drop images here or click to browse</p>
            <p className="mt-1 text-xs text-slate-500">Upload PNG, JPG, or HEIC files for damage assessment</p>
            <input ref={fileInputRef} type="file" multiple className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, image/heic, image/heif" />
          </div>

          {previews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Images for Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img src={preview} alt={`Preview ${index}`} className="rounded-lg object-cover w-full h-32" />
                      <button onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {analysisStatus === 'idle' && (
                   <Button onClick={handleAnalyze} type="button" className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Run Analysis on {uploadedFiles.length} Images
                  </Button>
                )}
                 <Button onClick={handleReset} variant="outline" className="w-full mt-2">Clear All</Button>
              </CardContent>
            </Card>
          )}
          
          {previews.length === 0 && (
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Clock className="w-5 h-5 mr-3"/>Recent Analyses</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-3">
                {recentAnalyses.map((analysis) => (
                  <div key={analysis.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <div className="flex flex-col">
                       <span className="font-semibold text-slate-800">{analysis.id}</span>
                       <span className="text-xs text-slate-500">{analysis.date} - {analysis.images} images</span>
                    </div>
                    <Badge className={getPriorityBadge(analysis.priority)}>{analysis.priority}</Badge>
                  </div>
                ))}
                 <Button variant="outline" className="w-full mt-2">View All Reports</Button>
              </CardContent>
            </Card>
          )}

        </div>

        <Card className="h-full sticky top-8">
          <CardHeader>
            <CardTitle className="flex items-center"><FileText className="w-5 h-5 mr-3" /> AI Analysis Report</CardTitle>
          </CardHeader>
          <CardContent>
            {analysisStatus === 'complete' && report ? (
              <div className="space-y-6 text-sm">

                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                  <span className="font-semibold text-slate-700">Priority Assessment</span>
                  <Badge className={getPriorityBadge(report.priority)}>{report.priority}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-600">Confidence Score</p>
                    <p className="font-bold text-lg text-slate-800">{report.confidenceScore.toFixed(1)}%</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-600">Overall Severity</p>
                    <p className="font-bold text-lg text-slate-800">{report.overallSeverity}</p>
                  </div>
                </div>

                 <div>
                  <h4 className="font-semibold mb-2 flex items-center"><Siren className="w-4 h-4 mr-2 text-red-600"/> Detected Hazards</h4>
                  <div className="flex flex-wrap gap-2">
                    {report.detectedHazards.map((hazard: string, i: number) => (
                      <Badge key={i} variant="destructive">{hazard}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center"><ClipboardList className="w-4 h-4 mr-2"/> Damage Breakdown</h4>
                  <div className="space-y-3">
                    {report.damageBreakdown.map((item: any, i:number) => (
                      <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-slate-600 font-medium">{item.type}</span>
                           <span className={`text-xs font-semibold px-2 py-0.5 rounded-full text-white ${getSeverityColor(item.severity)}`}>{item.severity}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                            <div className={`${getSeverityColor(item.severity)} h-full rounded-full`} style={{ width: `${item.percentage.toFixed(2)}%` }}></div>
                          </div>
                          <span className="w-16 text-right font-semibold text-slate-700">{item.percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center"><DollarSign className="w-4 h-4 mr-2"/> Detailed Cost Analysis</h4>
                  <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Estimated Repair Cost:</span>
                      <span className="font-medium text-slate-800">{formatCurrency(report.estimatedCost.repair)}</span>
                    </div>
                     <div className="flex justify-between items-center">
                      <span className="text-slate-600">Resource & Recovery Cost:</span>
                      <span className="font-medium text-slate-800">{formatCurrency(report.estimatedCost.recovery)}</span>
                    </div>
                    <Separator/>
                     <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Total Estimated Cost:</span>
                      <span className="font-bold text-lg text-blue-800">{formatCurrency(report.estimatedCost.total)}</span>
                    </div>
                  </div>
                </div>
                
                <div className={'bg-blue-50 border-l-4 border-blue-400 p-4'}>
                  <h4 className="font-semibold mb-2 flex items-center text-blue-800"><Shield className="w-4 h-4 mr-2"/> Recommended Actions</h4>
                  <ul className="list-disc list-inside space-y-1.5 text-blue-700">
                    {report.actionableSteps.map((step: string, i: number) => <li key={i}>{step}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center"><Cpu className="w-4 h-4 mr-2"/> Analysis Model Details</h4>
                  <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                    <p>Model: {report.modelInfo.name} (v{report.modelInfo.version})</p>
                    <p>Accuracy: {report.modelInfo.accuracy}% | Processed {report.totalImages} images in this batch.</p>
                    <p>Timestamp: {new Date(report.timestamp).toLocaleString()}</p>
                  </div>
                </div>

              </div>
            ) : analysisStatus === 'analyzing' ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4">
                    <Loader2 className="w-8 h-8 mb-2 animate-spin"/>
                    <p>{progress}% - {currentStep > 0 && analysisSteps[currentStep - 1]?.text}</p>
                </div>
            ) : analysisStatus === 'error' ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-red-500 border-2 border-dashed border-red-500 rounded-lg p-4">
                <AlertTriangle className="w-8 h-8 mb-2"/>
                <p>An error occurred during analysis.</p>
                <p className="text-xs mt-2 text-red-400">{errorMessage}</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 border-2 border-dashed rounded-lg p-4">
                <Eye className="w-10 h-10 mb-4 text-slate-400"/>
                <p className="font-semibold">AI-Powered Insights Await</p>
                <p className="text-xs mt-2 text-slate-400 max-w-xs mx-auto">Your comprehensive damage assessment report will be generated here. Just upload one or more images to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImageAnalysis;
