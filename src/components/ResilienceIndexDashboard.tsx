import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  AlertTriangle,
  Shield,
  Users,
  MapPin,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
} from "lucide-react";

interface ResilienceMetrics {
  overallScore: number;
  trainingCoverage: number;
  volunteerDensity: number;
  responseEfficiency: number;
  preparednessLevel: number;
  riskMitigation: number;
}

interface HotspotAnalysis {
  district: string;
  state: string;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  trainingGap: number;
  volunteerGap: number;
  recommendations: string[];
}

interface ImpactCorrelation {
  metric: string;
  correlation: number;
  improvement: number;
  description: string;
}

export const ResilienceIndexDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ResilienceMetrics>({
    overallScore: 0,
    trainingCoverage: 0,
    volunteerDensity: 0,
    responseEfficiency: 0,
    preparednessLevel: 0,
    riskMitigation: 0,
  });

  const [hotspots, setHotspots] = useState<HotspotAnalysis[]>([]);
  const [correlations, setCorrelations] = useState<ImpactCorrelation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResilienceData();
  }, []);

  const loadResilienceData = async () => {
    setLoading(true);
    try {
      // Simulate AI-driven resilience calculation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setMetrics({
        overallScore: 78.5,
        trainingCoverage: 82.3,
        volunteerDensity: 74.1,
        responseEfficiency: 79.8,
        preparednessLevel: 76.4,
        riskMitigation: 81.2,
      });

      setHotspots([
        {
          district: "Patna",
          state: "Bihar",
          riskLevel: "HIGH",
          trainingGap: 45,
          volunteerGap: 38,
          recommendations: [
            "Increase flood rescue training by 60%",
            "Deploy 25 more volunteers",
            "Establish 3 additional shelter points",
          ],
        },
        {
          district: "Guwahati",
          state: "Assam",
          riskLevel: "CRITICAL",
          trainingGap: 62,
          volunteerGap: 55,
          recommendations: [
            "Emergency training deployment needed",
            "Coordinate with SDRF for immediate support",
            "Set up temporary coordination center",
          ],
        },
        {
          district: "Kochi",
          state: "Kerala",
          riskLevel: "MEDIUM",
          trainingGap: 23,
          volunteerGap: 18,
          recommendations: [
            "Maintain current training schedule",
            "Focus on specialized rescue techniques",
            "Enhance community awareness programs",
          ],
        },
      ]);

      setCorrelations([
        {
          metric: "Training Hours vs Response Time",
          correlation: 0.87,
          improvement: 23.4,
          description:
            "Districts with 40+ training hours show 23% faster response times",
        },
        {
          metric: "Volunteer Density vs Evacuation Success",
          correlation: 0.91,
          improvement: 31.2,
          description:
            "Higher volunteer density correlates with 31% better evacuation rates",
        },
        {
          metric: "Preparedness Drills vs Damage Reduction",
          correlation: 0.79,
          improvement: 18.7,
          description: "Regular drills reduce flood damage by average 19%",
        },
        {
          metric: "Community Training vs Alert Response",
          correlation: 0.84,
          improvement: 27.8,
          description: "Trained communities respond 28% faster to flood alerts",
        },
      ]);
    } catch (error) {
      console.error("Error loading resilience data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getRiskBadge = (level: string) => {
    const colors = {
      LOW: "bg-green-100 text-green-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    };
    return colors[level as keyof typeof colors] || colors.MEDIUM;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">
            Analyzing resilience metrics with AI insights...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            JalRakshak Resilience Index
          </h1>
        </div>
        <p className="text-gray-600">
          AI-Driven Decision Intelligence Platform for Disaster Preparedness
        </p>
      </div>

      {/* Overall Resilience Score */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  National Resilience Index
                </h2>
                <p className="text-blue-100">
                  AI-calculated preparedness score across all regions
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold mb-2">
                  {metrics.overallScore}%
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-blue-100">+3.2% from last month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Training Coverage</p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(
                    metrics.trainingCoverage
                  )}`}
                >
                  {metrics.trainingCoverage}%
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${getScoreBg(
                  metrics.trainingCoverage
                )}`}
              >
                <Users
                  className={`h-6 w-6 ${getScoreColor(
                    metrics.trainingCoverage
                  )}`}
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.trainingCoverage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volunteer Density</p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(
                    metrics.volunteerDensity
                  )}`}
                >
                  {metrics.volunteerDensity}%
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${getScoreBg(
                  metrics.volunteerDensity
                )}`}
              >
                <Shield
                  className={`h-6 w-6 ${getScoreColor(
                    metrics.volunteerDensity
                  )}`}
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.volunteerDensity}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Efficiency</p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(
                    metrics.responseEfficiency
                  )}`}
                >
                  {metrics.responseEfficiency}%
                </p>
              </div>
              <div
                className={`p-3 rounded-full ${getScoreBg(
                  metrics.responseEfficiency
                )}`}
              >
                <Activity
                  className={`h-6 w-6 ${getScoreColor(
                    metrics.responseEfficiency
                  )}`}
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${metrics.responseEfficiency}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Risk Hotspots Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>AI Risk Hotspots Analysis</span>
            </CardTitle>
            <CardDescription>
              Districts requiring immediate attention based on flood risk vs
              preparedness gap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hotspots.map((hotspot, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-600" />
                      <div>
                        <h4 className="font-semibold">
                          {hotspot.district}, {hotspot.state}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Training Gap: {hotspot.trainingGap}%
                        </p>
                      </div>
                    </div>
                    <Badge className={getRiskBadge(hotspot.riskLevel)}>
                      {hotspot.riskLevel}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">AI Recommendations:</h5>
                    {hotspot.recommendations.map((rec, recIndex) => (
                      <div
                        key={recIndex}
                        className="flex items-start space-x-2"
                      >
                        <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                        <p className="text-sm text-gray-700">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Impact Correlations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Impact Correlation Analytics</span>
            </CardTitle>
            <CardDescription>
              AI-driven insights showing training effectiveness and real-world
              impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {correlations.map((correlation, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      {correlation.metric}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">r =</span>
                      <span
                        className={`font-bold ${
                          correlation.correlation >= 0.8
                            ? "text-green-600"
                            : correlation.correlation >= 0.6
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {correlation.correlation.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 mb-3">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        +{correlation.improvement}% improvement
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700">
                    {correlation.description}
                  </p>

                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${correlation.correlation * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Recommended Actions</span>
          </CardTitle>
          <CardDescription>
            Priority actions based on AI analysis to improve national resilience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border-l-4 border-red-500 bg-red-50">
              <h4 className="font-semibold text-red-800">Critical Priority</h4>
              <p className="text-sm text-red-700 mt-1">
                Deploy emergency training teams to Guwahati and high-risk
                districts in Assam
              </p>
            </div>
            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <h4 className="font-semibold text-yellow-800">High Priority</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Increase volunteer recruitment by 35% in Bihar and Uttar Pradesh
              </p>
            </div>
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h4 className="font-semibold text-blue-800">
                Strategic Initiative
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Implement AI-driven early warning system integration with
                training schedules
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
