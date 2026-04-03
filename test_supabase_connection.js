#!/usr/bin/env node

/**
 * Manual fix - Create sync function using SQL query
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Simple .env loader for standalone Node scripts
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      content.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split("=");
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join("=").trim();
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
  console.error(
    "❌ Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in environment"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSyncFunctionSimple() {
  try {
    console.log("🚀 Creating sync_firebase_user function using SQL query...");

    // Simple function creation using SQL
    const sqlQuery = `
CREATE OR REPLACE FUNCTION sync_firebase_user(
  p_firebase_uid text,
  p_email text,
  p_name text DEFAULT NULL,
  p_photo_url text DEFAULT NULL,
  p_chosen_role text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile_data json;
  user_role text;
BEGIN
  -- Role assignment: Use chosen role or default logic
  user_role := CASE 
    WHEN p_chosen_role IS NOT NULL AND p_chosen_role IN ('CITIZEN', 'VOLUNTEER', 'NGO', 'DMA') THEN p_chosen_role
    WHEN p_email = 'lb4397@srmist.edu.in' THEN 'ADMIN'
    ELSE 'CITIZEN'
  END;

  -- Insert or update user profile
  INSERT INTO user_profiles (
    firebase_uid, email, display_name, name, role, is_active, status,
    volunteer_status, availability, rating, region, created_at, updated_at, last_login, photo_url
  ) VALUES (
    p_firebase_uid, p_email, p_name, p_name, user_role, true, 'active',
    CASE WHEN user_role = 'VOLUNTEER' THEN 'active' ELSE 'inactive' END,
    '24/7', 0.0, 'Unknown', NOW(), NOW(), NOW(), p_photo_url
  )
  ON CONFLICT (firebase_uid) DO UPDATE SET
    email = EXCLUDED.email, display_name = EXCLUDED.display_name, name = EXCLUDED.name,
    last_login = NOW(), updated_at = NOW(), photo_url = EXCLUDED.photo_url;

  -- Return the user profile
  SELECT json_build_object(
    'id', id, 'firebase_uid', firebase_uid, 'email', email, 'role', role,
    'name', name, 'display_name', display_name, 'is_active', is_active,
    'status', status, 'photo_url', photo_url,
    'dashboard_route', CASE 
      WHEN role = 'ADMIN' THEN '/admin'
      WHEN role = 'DMA' THEN '/dma-dashboard' 
      WHEN role = 'NGO' THEN '/ngo-dashboard'
      WHEN role = 'VOLUNTEER' THEN '/volunteer-dashboard'
      ELSE '/dashboard'
    END
  ) INTO user_profile_data
  FROM user_profiles WHERE firebase_uid = p_firebase_uid;

  RETURN user_profile_data;
END;
$$;`;

    // Execute the query
    const { data, error } = await supabase.rpc("query", {
      sql: sqlQuery,
    });

    if (error) {
      console.log("❌ Function creation failed:", error.message);

      // Try direct insert approach for now
      console.log(
        "🔄 Trying fallback approach - testing user_profiles table..."
      );

      // Test if we can insert directly to user_profiles
      const testInsert = await supabase
        .from("user_profiles")
        .insert({
          firebase_uid: "test-user-fallback",
          email: "test-fallback@example.com",
          name: "Test Fallback User",
          role: "CITIZEN",
        })
        .select();

      if (testInsert.error) {
        console.log("❌ Direct insert also failed:", testInsert.error.message);
      } else {
        console.log("✅ Direct insert works! We can create profiles manually");
        console.log("📊 Inserted:", testInsert.data);

        // Clean up test user
        await supabase
          .from("user_profiles")
          .delete()
          .eq("firebase_uid", "test-user-fallback");
      }
    } else {
      console.log("✅ Function created successfully!");
      console.log("📊 Result:", data);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Run it
createSyncFunctionSimple();
