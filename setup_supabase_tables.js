#!/usr/bin/env node

/**
 * Simple Supabase Table Setup Script
 * This script creates tables using direct SQL execution
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Simple .env loader for standalone Node scripts
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim();
        }
      });
    }
  } catch (err) {}
}

loadEnv();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('🚀 Creating Supabase tables...');
    
    // Read the SQL file
    const sqlContent = fs.readFileSync('supabase_setup.sql', 'utf8');
    
    // Split into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          
          // Use the REST API to execute SQL
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey
            },
            body: JSON.stringify({ sql: statement })
          });
          
          if (!response.ok) {
            console.warn(`⚠️  Warning in statement ${i + 1}:`, await response.text());
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.warn(`⚠️  Error in statement ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('\n🎉 Table creation completed!');
    
    // Test the tables
    console.log('\n🧪 Testing tables...');
    
    const tables = ['user_profiles', 'admin_alerts', 'admin_shelters', 'admin_missions', 'location_data'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK (${data?.length || 0} records)`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Table creation failed:', error);
  }
}

// Alternative: Create tables using direct SQL execution
async function createTablesDirect() {
  try {
    console.log('🚀 Creating tables using direct SQL...');
    
    const tables = [
      {
        name: 'user_profiles',
        sql: `
          CREATE TABLE IF NOT EXISTS user_profiles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            firebase_uid TEXT UNIQUE,
            email TEXT NOT NULL,
            display_name TEXT,
            photo_url TEXT,
            role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'emergency_responder', 'volunteer', 'rescue_team')),
            disabled BOOLEAN DEFAULT FALSE,
            joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            phone TEXT,
            emergency_contact TEXT,
            specialization TEXT,
            experience TEXT,
            team TEXT,
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
            region TEXT DEFAULT 'Unknown',
            reports_submitted INTEGER DEFAULT 0,
            last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_online BOOLEAN DEFAULT FALSE,
            volunteer_status TEXT DEFAULT 'inactive' CHECK (volunteer_status IN ('inactive', 'active', 'standby', 'busy')),
            availability TEXT DEFAULT '24/7',
            rating DECIMAL(3,1) DEFAULT 0.0,
            missions_completed INTEGER DEFAULT 0
          );
        `
      },
      {
        name: 'admin_alerts',
        sql: `
          CREATE TABLE IF NOT EXISTS admin_alerts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            type TEXT NOT NULL,
            severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
            message TEXT NOT NULL,
            region TEXT NOT NULL,
            sent_to TEXT[] DEFAULT '{}',
            status TEXT DEFAULT 'active' CHECK (status IN ('active', 'delivered', 'dismissed')),
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_by TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            delivery_count INTEGER DEFAULT 0,
            read_count INTEGER DEFAULT 0
          );
        `
      },
      {
        name: 'admin_shelters',
        sql: `
          CREATE TABLE IF NOT EXISTS admin_shelters (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            location TEXT NOT NULL,
            address TEXT,
            capacity INTEGER NOT NULL DEFAULT 0,
            current_occupancy INTEGER DEFAULT 0,
            status TEXT DEFAULT 'available' CHECK (status IN ('available', 'near_full', 'full')),
            contact_person TEXT,
            contact_phone TEXT,
            contact_email TEXT,
            facilities TEXT[] DEFAULT '{}',
            coordinates JSONB DEFAULT '{"lat": 0, "lng": 0}',
            is_active BOOLEAN DEFAULT TRUE,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'admin_missions',
        sql: `
          CREATE TABLE IF NOT EXISTS admin_missions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            mission_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            mode TEXT DEFAULT 'Road' CHECK (mode IN ('Road', 'Boat', 'Air')),
            assigned_team TEXT NOT NULL,
            team_leader TEXT NOT NULL,
            team_contact TEXT NOT NULL,
            status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled')),
            priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
            estimated_time TEXT,
            distance TEXT,
            start_time TIMESTAMP WITH TIME ZONE,
            expected_completion TIMESTAMP WITH TIME ZONE,
            actual_completion TIMESTAMP WITH TIME ZONE,
            description TEXT,
            coordinates JSONB DEFAULT '{"origin": {"lat": 0, "lng": 0}, "destination": {"lat": 0, "lng": 0}}',
            route JSONB DEFAULT '[]',
            alternate_routes JSONB DEFAULT '[]',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'location_data',
        sql: `
          CREATE TABLE IF NOT EXISTS location_data (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            state TEXT NOT NULL,
            district TEXT NOT NULL,
            lat DECIMAL(10, 8) NOT NULL,
            lng DECIMAL(11, 8) NOT NULL,
            current_water_level DECIMAL(5, 2) DEFAULT 0,
            risk_level TEXT DEFAULT 'safe' CHECK (risk_level IN ('safe', 'warning', 'critical')),
            weather_data JSONB DEFAULT '{"temperature": 0, "humidity": 0, "precipitation": 0, "wind_speed": 0}',
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      }
    ];
    
    // Create tables using Supabase client
    for (const table of tables) {
      try {
        console.log(`⏳ Creating table ${table.name}...`);
        
        // Use the REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({ sql: table.sql })
        });
        
        if (!response.ok) {
          console.warn(`⚠️  Warning creating ${table.name}:`, await response.text());
        } else {
          console.log(`✅ Table ${table.name} created successfully`);
        }
      } catch (err) {
        console.warn(`⚠️  Error creating ${table.name}:`, err.message);
      }
    }
    
    // Insert sample data
    console.log('\n📊 Inserting sample data...');
    
    // Sample alerts
    const { error: alertsError } = await supabase
      .from('admin_alerts')
      .upsert([
        {
          type: 'Flood Warning',
          severity: 'high',
          message: 'Heavy rainfall expected in Chennai area. Please stay indoors and avoid low-lying areas.',
          region: 'Chennai',
          sent_to: ['all_users'],
          status: 'active',
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          created_by: 'admin@janrakshak.com',
          delivery_count: 150,
          read_count: 120
        },
        {
          type: 'Weather Update',
          severity: 'medium',
          message: 'Rain intensity decreasing in Tamil Nadu region. Conditions improving.',
          region: 'Tamil Nadu',
          sent_to: ['chennai_users'],
          status: 'active',
          expires_at: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
          created_by: 'admin@janrakshak.com',
          delivery_count: 75,
          read_count: 60
        },
        {
          type: 'Evacuation Notice',
          severity: 'critical',
          message: 'URGENT: Immediate evacuation required for areas near Adyar River. Emergency shelters are open.',
          region: 'Chennai Central',
          sent_to: ['chennai_central'],
          status: 'active',
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          created_by: 'admin@janrakshak.com',
          delivery_count: 200,
          read_count: 180
        }
      ]);
    
    if (alertsError) {
      console.warn('⚠️  Warning inserting alerts:', alertsError.message);
    } else {
      console.log('✅ Sample alerts inserted');
    }
    
    // Sample users
    const { error: usersError } = await supabase
      .from('user_profiles')
      .upsert([
        {
          firebase_uid: 'sample-user-1',
          email: 'admin@janrakshak.com',
          display_name: 'Admin User',
          role: 'admin',
          status: 'active',
          region: 'Chennai',
          specialization: 'Emergency Management',
          experience: '5 years',
          team: 'Team Alpha',
          volunteer_status: 'active',
          availability: '24/7',
          rating: 4.8,
          missions_completed: 25
        },
        {
          firebase_uid: 'sample-user-2',
          email: 'volunteer@janrakshak.com',
          display_name: 'John Doe',
          role: 'volunteer',
          status: 'active',
          region: 'Chennai',
          specialization: 'Water Rescue',
          experience: '3 years',
          team: 'Team Beta',
          volunteer_status: 'active',
          availability: 'Weekends',
          rating: 4.5,
          missions_completed: 15
        }
      ]);
    
    if (usersError) {
      console.warn('⚠️  Warning inserting users:', usersError.message);
    } else {
      console.log('✅ Sample users inserted');
    }
    
    console.log('\n🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  }
}

// Run the setup
if (import.meta.url === `file://${process.argv[1]}`) {
  createTablesDirect().then(() => {
    console.log('✅ Setup script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Setup script failed:', error);
    process.exit(1);
  });
}

export { createTables, createTablesDirect };