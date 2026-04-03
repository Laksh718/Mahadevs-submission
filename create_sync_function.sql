-- CREATE sync_firebase_user FUNCTION
-- This function syncs Firebase users to Supabase user_profiles table

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
    -- If user chose a specific role during signup, use that
    WHEN p_chosen_role IS NOT NULL AND p_chosen_role IN ('CITIZEN', 'VOLUNTEER', 'NGO', 'DMA') THEN p_chosen_role
    -- Only specific admin email gets ADMIN role automatically
    WHEN p_email = 'lb4397@srmist.edu.in' THEN 'ADMIN'
    -- Default: CITIZEN for everyone else
    ELSE 'CITIZEN'
  END;

  -- Insert or update user profile
  INSERT INTO user_profiles (
    firebase_uid,
    email,
    display_name,
    name,
    role,
    is_active,
    status,
    volunteer_status,
    availability,
    rating,
    region,
    created_at,
    updated_at,
    last_login,
    photo_url
  ) VALUES (
    p_firebase_uid,
    p_email,
    p_name,
    p_name,
    user_role,
    true,
    'active',
    CASE WHEN user_role = 'VOLUNTEER' THEN 'active' ELSE 'inactive' END,
    '24/7',
    0.0,
    'Unknown',
    NOW(),
    NOW(),
    NOW(),
    p_photo_url
  )
  ON CONFLICT (firebase_uid) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    name = EXCLUDED.name,
    last_login = NOW(),
    updated_at = NOW(),
    photo_url = EXCLUDED.photo_url
    -- Note: Role is NOT updated on conflict - roles are managed separately
  ;

  -- Return the user profile for the frontend
  SELECT json_build_object(
    'id', id,
    'firebase_uid', firebase_uid,
    'email', email,
    'role', role,
    'name', name,
    'display_name', display_name,
    'is_active', is_active,
    'status', status,
    'photo_url', photo_url,
    'dashboard_route', CASE 
      WHEN role = 'ADMIN' THEN '/admin'
      WHEN role = 'DMA' THEN '/dma-dashboard' 
      WHEN role = 'NGO' THEN '/ngo-dashboard'
      WHEN role = 'VOLUNTEER' THEN '/volunteer-dashboard'
      ELSE '/dashboard'
    END
  ) INTO user_profile_data
  FROM user_profiles
  WHERE user_profiles.firebase_uid = p_firebase_uid;

  RETURN user_profile_data;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION sync_firebase_user(text, text, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION sync_firebase_user(text, text, text, text, text) TO anon;