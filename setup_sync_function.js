#!/usr/bin/env node

/**
 * Create sync_firebase_user function in Supabase
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
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error(
    "❌ Error: VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY not found in environment"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createSyncFunction() {
  try {
    console.log("🚀 Creating sync_firebase_user function...");

    // Read the SQL file
    const sqlContent = fs.readFileSync("create_sync_function.sql", "utf8");

    console.log("📝 Executing SQL function creation...");

    // Execute the SQL
    const { data, error } = await supabase
      .from("dummy") // We'll use rpc instead
      .select("*")
      .limit(1);

    // Use direct SQL execution
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceRoleKey}`,
        apikey: supabaseServiceRoleKey,
      },
      body: JSON.stringify({
        query: sqlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to create function:", errorText);

      // Try alternative approach - direct supabase sql
      console.log("🔄 Trying alternative approach...");
      const { data, error } = await supabase.rpc("exec_sql", {
        query: sqlContent,
      });

      if (error) {
        console.error("❌ Alternative approach failed:", error);
        return false;
      } else {
        console.log("✅ Function created successfully via alternative method!");
        return true;
      }
    } else {
      console.log("✅ Function created successfully!");
      return true;
    }
  } catch (error) {
    console.error("❌ Error creating function:", error);
    return false;
  }
}

// Test the function after creation
async function testSyncFunction() {
  try {
    console.log("🧪 Testing sync_firebase_user function...");

    const { data, error } = await supabase.rpc("sync_firebase_user", {
      p_firebase_uid: "test-user-123",
      p_email: "test@example.com",
      p_name: "Test User",
      p_photo_url: null,
      p_chosen_role: null,
    });

    if (error) {
      console.error("❌ Function test failed:", error);
      return false;
    } else {
      console.log("✅ Function test successful!");
      console.log("📊 Test result:", data);
      return true;
    }
  } catch (error) {
    console.error("❌ Error testing function:", error);
    return false;
  }
}

// Main execution
(async () => {
  console.log("🔧 Setting up sync_firebase_user function...\n");

  const created = await createSyncFunction();
  if (created) {
    console.log("\n🔍 Testing function...");
    await testSyncFunction();
  }

  console.log("\n🎉 Setup complete!");
})();
