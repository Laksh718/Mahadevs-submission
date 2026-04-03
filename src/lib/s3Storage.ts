// S3-compatible storage service for Supabase bucket
const S3_ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/s3`;
const REGION = 'ap-south-1';
const ACCESS_KEY = import.meta.env.VITE_SUPABASE_S3_ACCESS_KEY;
const BUCKET_NAME = 'reports-images';

// Helper function to convert file to base64 for fallback
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Generate S3 signature for authentication
const generateSignature = (method: string, path: string, headers: Record<string, string>): string => {
  // For now, we'll use a simple approach
  // In production, you'd want to implement proper AWS signature v4
  return ACCESS_KEY;
};

// Upload file to S3-compatible bucket
export const uploadToS3Bucket = async (file: File, folderPath: string = 'reports-images'): Promise<string | null> => {
  try {
    console.log('🚀 Starting S3 upload:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const fullPath = `${folderPath}/${fileName}`;
    
    console.log(`📁 Uploading to S3 path: ${fullPath}`);
    
    // Create FormData for S3 upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Try direct S3 upload
    const uploadUrl = `${S3_ENDPOINT}/${BUCKET_NAME}/${fullPath}`;
    
    console.log(`🔗 Upload URL: ${uploadUrl}`);
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ACCESS_KEY}`,
        'Content-Type': file.type,
      },
      body: file
    });
    
    if (response.ok) {
      console.log('✅ S3 upload successful');
      
      // Generate public URL
      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fullPath}`;
      console.log('🔗 Public URL:', publicUrl);
      
      return publicUrl;
    } else {
      console.error('❌ S3 upload failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      
      // Try alternative S3 methods
      return await tryAlternativeS3Upload(file, fullPath);
    }
    
  } catch (error) {
    console.error('💥 S3 upload exception:', error);
    
    // Fallback to base64
    try {
      console.log('🔄 Falling back to base64...');
      const base64Data = await fileToBase64(file);
      console.log('✅ Base64 fallback successful');
      return base64Data;
    } catch (base64Error) {
      console.error('💥 Base64 fallback failed:', base64Error);
      return null;
    }
  }
};

// Try alternative S3 upload methods
const tryAlternativeS3Upload = async (file: File, fullPath: string): Promise<string | null> => {
  console.log('🔄 Trying alternative S3 upload methods...');
  
  // Method 1: Try with different headers
  try {
    const uploadUrl = `${S3_ENDPOINT}/${BUCKET_NAME}/${fullPath}`;
    
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
        'x-amz-date': new Date().toISOString().replace(/[:\-]|\.\d{3}/g, ''),
        'Authorization': `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${new Date().toISOString().split('T')[0]}/${REGION}/s3/aws4_request`,
      },
      body: file
    });
    
    if (response.ok) {
      console.log('✅ Alternative S3 upload successful');
      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fullPath}`;
      return publicUrl;
    }
  } catch (error) {
    console.log('❌ Alternative S3 method 1 failed:', error);
  }
  
  // Method 2: Try with FormData
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', fullPath);
    
    const response = await fetch(`${S3_ENDPOINT}/${BUCKET_NAME}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_KEY}`,
      },
      body: formData
    });
    
    if (response.ok) {
      console.log('✅ FormData S3 upload successful');
      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fullPath}`;
      return publicUrl;
    }
  } catch (error) {
    console.log('❌ Alternative S3 method 2 failed:', error);
  }
  
  // Method 3: Try Supabase REST API
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${fullPath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_KEY}`,
        'Content-Type': file.type,
      },
      body: file
    });
    
    if (response.ok) {
      console.log('✅ Supabase REST API upload successful');
      const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fullPath}`;
      return publicUrl;
    }
  } catch (error) {
    console.log('❌ Supabase REST API method failed:', error);
  }
  
  return null;
};

// Test S3 connection
export const testS3Connection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Testing S3 connection...');
    
    // Try to list objects in bucket
    const response = await fetch(`${S3_ENDPOINT}/${BUCKET_NAME}?list-type=2`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ACCESS_KEY}`,
      }
    });
    
    if (response.ok) {
      console.log('✅ S3 connection successful');
      const data = await response.text();
      console.log('📄 Bucket contents:', data);
      return true;
    } else {
      console.error('❌ S3 connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('💥 S3 connection error:', error);
    return false;
  }
};

// Delete file from S3 bucket
export const deleteFromS3Bucket = async (url: string): Promise<boolean> => {
  try {
    // Extract path from URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const fullPath = `reports-images/${fileName}`;
    
    console.log('🗑️ Deleting from S3:', fullPath);
    
    const deleteUrl = `${S3_ENDPOINT}/${BUCKET_NAME}/${fullPath}`;
    
    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${ACCESS_KEY}`,
      }
    });
    
    if (response.ok) {
      console.log('✅ S3 delete successful');
      return true;
    } else {
      console.error('❌ S3 delete failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('💥 S3 delete error:', error);
    return false;
  }
};