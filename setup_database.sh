#!/bin/bash

# Database Setup Script for JalRakshak Role-Based Authentication
# This script ensures your Supabase database has all required tables and columns

echo "🗄️  Setting up JalRakshak database for role-based authentication..."

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"

# Run the user_profiles table migration
echo "🔧 Applying database migration for user_profiles table..."

# Execute the SQL migration
supabase db reset --db-url "$(cat .env.local | grep SUPABASE_URL | cut -d '=' -f2)" || {
    echo "⚠️  Database reset failed. Trying direct migration..."
    
    # Alternative: Apply migration directly
    psql "$(cat .env.local | grep DATABASE_URL | cut -d '=' -f2)" -f fix_user_profiles_table.sql || {
        echo "❌ Direct migration failed. Please run the SQL manually in your Supabase dashboard:"
        echo "   1. Go to your Supabase project dashboard"
        echo "   2. Navigate to SQL Editor"
        echo "   3. Copy and paste the contents of fix_user_profiles_table.sql"
        echo "   4. Run the queries"
        exit 1
    }
}

echo "✅ Database migration completed"

# Verify table structure
echo "🔍 Verifying user_profiles table structure..."

# Check if we can connect and verify
psql "$(cat .env.local | grep DATABASE_URL | cut -d '=' -f2)" -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'user_profiles' ORDER BY ordinal_position;" || {
    echo "⚠️  Could not verify table structure directly"
    echo "📋 Please manually verify in Supabase dashboard that user_profiles table has these columns:"
    echo "   - id (uuid, primary key)"
    echo "   - email (varchar)"
    echo "   - name (varchar(100))"
    echo "   - role (varchar)"
    echo "   - organization (varchar(100))"
    echo "   - district (varchar(50))"
    echo "   - state (varchar(50))"
    echo "   - phone (varchar(15))"
    echo "   - is_active (boolean)"
    echo "   - created_at (timestamp)"
    echo "   - updated_at (timestamp)"
    echo "   - last_login (timestamp)"
}

echo ""
echo "🎯 Database setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Test signup with different roles"
echo "   2. Check that profiles are created in user_profiles table"
echo "   3. Verify role-based redirects work during signin"
echo ""
echo "🔧 If issues persist:"
echo "   1. Check browser console for detailed error messages"
echo "   2. Verify Supabase connection in .env.local"
echo "   3. Check Row Level Security (RLS) policies in Supabase dashboard"