#!/bin/bash

# NDMA Training Management System Setup Script
echo "🎯 Setting up NDMA Training Management System..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from your project root directory"
    exit 1
fi

# Check if Supabase files exist
if [ ! -f "integrated_training_schema.sql" ]; then
    echo "❌ Error: integrated_training_schema.sql not found"
    echo "Please ensure all SQL files are in your project root"
    exit 1
fi

if [ ! -f "training_seed_data.sql" ]; then
    echo "❌ Error: training_seed_data.sql not found"  
    echo "Please ensure all SQL files are in your project root"
    exit 1
fi

echo "✅ SQL files found"

# Check if components exist
if [ ! -f "src/components/TrainingDataEntry.tsx" ]; then
    echo "❌ Error: TrainingDataEntry.tsx component missing"
    exit 1
fi

if [ ! -f "src/components/TrainingReports.tsx" ]; then
    echo "❌ Error: TrainingReports.tsx component missing"
    exit 1
fi

if [ ! -f "src/lib/trainingService.ts" ]; then
    echo "❌ Error: trainingService.ts missing"
    exit 1
fi

echo "✅ All components found"

# Check if AdminTraining page exists  
if [ ! -f "src/pages/AdminTraining.tsx" ]; then
    echo "❌ Error: AdminTraining.tsx page missing"
    exit 1
fi

echo "✅ Admin page found"

# Install dependencies if needed
echo "📦 Checking dependencies..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Dependencies ready"

# Show next steps
echo ""
echo "🚀 Setup Complete! Next steps:"
echo ""
echo "1. 📊 Run SQL scripts in Supabase:"
echo "   - Copy integrated_training_schema.sql to Supabase SQL Editor"
echo "   - Run the schema creation script"
echo "   - Copy training_seed_data.sql to Supabase SQL Editor" 
echo "   - Run the seed data script"
echo ""
echo "2. 🧪 Test the setup:"
echo "   - Copy test_training_setup.sql to Supabase SQL Editor"
echo "   - Run to verify tables and data exist"
echo ""
echo "3. 🎯 Access the system:"
echo "   - Start your dev server: npm run dev"
echo "   - Navigate to: /admin/training"
echo "   - Click 'System Status' tab to verify everything works"
echo ""
echo "4. 📚 Documentation:"
echo "   - Setup guide: NDMA_TRAINING_SETUP.md"
echo "   - Troubleshooting: TRAINING_TROUBLESHOOTING.md"
echo ""
echo "✅ Ready to deploy NDMA Training Management System!"