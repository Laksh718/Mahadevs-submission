import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import AdminFloodPrediction from '@/components/AdminFloodPrediction';

const AdminFloodPredictionPage: React.FC = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <AdminFloodPrediction />
      </div>
    </AdminLayout>
  );
};

export default AdminFloodPredictionPage;