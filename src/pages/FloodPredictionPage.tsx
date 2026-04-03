import React from 'react';
import UserLayout from '@/components/UserLayout';
import FloodPredictionSimple from '@/components/FloodPredictionSimple';

const FloodPredictionPage: React.FC = () => {
  return (
    <UserLayout title="Flood Prediction" description="AI-powered flood risk assessment">
      <FloodPredictionSimple />
    </UserLayout>
  );
};

export default FloodPredictionPage;