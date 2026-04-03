import { supabase } from './supabase';

/**
 * Add test users to Supabase for admin panel testing
 */
export const addTestUsers = async () => {
  try {
    console.log('Adding test users to Supabase...');
    
    const testUsers = [
      {
        firebase_uid: 'test-user-1',
        email: 'john.doe@example.com',
        display_name: 'John Doe',
        photo_url: null,
        role: 'user',
        disabled: false,
        joined_at: new Date().toISOString(),
        last_login: new Date().toISOString(),
      },
      {
        firebase_uid: 'test-user-2',
        email: 'jane.smith@example.com',
        display_name: 'Jane Smith',
        photo_url: null,
        role: 'user',
        disabled: false,
        joined_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        last_login: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        firebase_uid: 'test-admin-1',
        email: 'admin@example.com',
        display_name: 'Admin User',
        photo_url: null,
        role: 'admin',
        disabled: false,
        joined_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        last_login: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      },
      {
        firebase_uid: 'test-emergency-1',
        email: 'emergency@example.com',
        display_name: 'Emergency Responder',
        photo_url: null,
        role: 'emergency_responder',
        disabled: false,
        joined_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        last_login: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      },
      {
        firebase_uid: 'test-disabled-1',
        email: 'disabled@example.com',
        display_name: 'Disabled User',
        photo_url: null,
        role: 'user',
        disabled: true,
        joined_at: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
        last_login: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      }
    ];

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(testUsers, { 
        onConflict: 'firebase_uid',
        ignoreDuplicates: false 
      })
      .select();

    if (error) {
      console.error('Error adding test users:', error);
      return false;
    }

    console.log('Test users added successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in addTestUsers:', error);
    return false;
  }
};

/**
 * Add test reports to Supabase for admin panel testing
 */
export const addTestReports = async () => {
  try {
    console.log('Adding test reports to Supabase...');
    
    const testReports = [
      {
        title: 'Flood Warning - Downtown Area',
        description: 'Water levels rising rapidly in downtown area. Multiple streets flooded.',
        location: 'Downtown, City Center',
        severity: 'critical',
        status: 'pending',
        user_id: 'test-user-1',
        latitude: 40.7128,
        longitude: -74.0060,
        image_url: null,
      },
      {
        title: 'Minor Flooding - Residential Area',
        description: 'Some flooding in residential streets after heavy rain.',
        location: 'Residential District',
        severity: 'medium',
        status: 'verified',
        user_id: 'test-user-2',
        latitude: 40.7589,
        longitude: -73.9851,
        image_url: null,
      },
      {
        title: 'Drainage System Overflow',
        description: 'Drainage system unable to handle current water volume.',
        location: 'Industrial Zone',
        severity: 'high',
        status: 'pending',
        user_id: 'test-emergency-1',
        latitude: 40.6892,
        longitude: -74.0445,
        image_url: null,
      },
      {
        title: 'False Alarm - No Flooding',
        description: 'Reported flooding was actually just puddles from recent rain.',
        location: 'Suburban Area',
        severity: 'low',
        status: 'false_alarm',
        user_id: 'test-user-1',
        latitude: 40.7505,
        longitude: -73.9934,
        image_url: null,
      },
      {
        title: 'River Overflow Warning',
        description: 'River levels approaching flood stage. Evacuation recommended.',
        location: 'Riverside District',
        severity: 'critical',
        status: 'verified',
        user_id: 'test-emergency-1',
        latitude: 40.7831,
        longitude: -73.9712,
        image_url: null,
      }
    ];

    const { data, error } = await supabase
      .from('flood_reports')
      .insert(testReports)
      .select();

    if (error) {
      console.error('Error adding test reports:', error);
      return false;
    }

    console.log('Test reports added successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in addTestReports:', error);
    return false;
  }
};

/**
 * Initialize test data for admin panel
 */
export const initializeTestData = async () => {
  try {
    console.log('Initializing test data...');
    
    const usersAdded = await addTestUsers();
    const reportsAdded = await addTestReports();
    
    if (usersAdded && reportsAdded) {
      console.log('Test data initialized successfully');
      return true;
    } else {
      console.log('Some test data failed to initialize');
      return false;
    }
  } catch (error) {
    console.error('Error initializing test data:', error);
    return false;
  }
};