import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Droplets, CloudRain, Wind } from 'lucide-react';

interface RiskIndicatorProps {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  lastUpdated: string;
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ riskLevel, location, lastUpdated }) => {
  const getRiskConfig = () => {
    switch (riskLevel) {
      case 'critical':
        return {
          color: 'bg-red-600',
          textColor: 'text-red-600',
          label: 'Critical Risk',
          icon: AlertTriangle,
        };
      case 'high':
        return {
          color: 'bg-orange-500',
          textColor: 'text-orange-500',
          label: 'High Risk',
          icon: Droplets,
        };
      case 'medium':
        return {
          color: 'bg-yellow-500',
          textColor: 'text-yellow-500',
          label: 'Medium Risk',
          icon: CloudRain,
        };
      default:
        return {
          color: 'bg-green-500',
          textColor: 'text-green-500',
          label: 'Low Risk',
          icon: Wind,
        };
    }
  };

  const config = getRiskConfig();
  const Icon = config.icon;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg">Flood Risk Assessment</span>
          <Icon className={`w-6 h-6 ${config.textColor}`} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Badge className={`${config.color} text-white text-sm px-3 py-1`}>
            {config.label}
          </Badge>
          <div className="text-sm text-gray-600">
            <p>Location: {location}</p>
            <p className="text-xs mt-1">Last updated: {lastUpdated}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskIndicator;
