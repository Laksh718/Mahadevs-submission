const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// Configuration
const XVIEW2_API_URL = functions.config().xview2?.api_url || 'https://xview2-damage-detection-xxxxx-uc.a.run.app';
const XVIEW2_API_KEY = functions.config().xview2?.api_key || '';

/**
 * Cloud Function triggered when an image is uploaded to Firebase Storage
 * Processes the image through xView2 model and saves results to Firestore
 */
exports.processDamageAssessment = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  const contentType = object.contentType;
  
  // Only process images in the damage_assessments folder
  if (!filePath.startsWith('damage_assessments/') || !contentType.startsWith('image/')) {
    console.log('Skipping non-image file or file not in damage_assessments folder');
    return null;
  }

  try {
    console.log(`Processing damage assessment for file: ${filePath}`);
    
    // Get download URL
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);
    const [downloadURL] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Extract metadata from file path or object metadata
    const userId = object.metadata?.userId || 'anonymous';
    const state = object.metadata?.state || 'punjab';
    const latitude = parseFloat(object.metadata?.latitude) || null;
    const longitude = parseFloat(object.metadata?.longitude) || null;
    const timestamp = object.timeCreated;

    // Call xView2 API
    const damageAssessment = await callXView2API(downloadURL, {
      state,
      latitude,
      longitude,
      userId,
      filename: filePath
    });

    // Save results to Firestore
    const reportId = await saveDamageReport({
      filePath,
      downloadURL,
      userId,
      state,
      latitude,
      longitude,
      timestamp,
      damageAssessment
    });

    // Send notification to user
    await sendNotification(userId, damageAssessment, reportId);

    console.log(`Damage assessment completed for file: ${filePath}, Report ID: ${reportId}`);
    return { reportId, damageAssessment };

  } catch (error) {
    console.error('Error processing damage assessment:', error);
    
    // Save error to Firestore
    await saveErrorReport(filePath, error.message, userId);
    
    throw error;
  }
});

/**
 * Call xView2 API to analyze damage
 */
async function callXView2API(imageURL, metadata) {
  try {
    const response = await axios.post(`${XVIEW2_API_URL}/analyze`, {
      image_url: imageURL,
      state: metadata.state,
      latitude: metadata.latitude,
      longitude: metadata.longitude,
      user_id: metadata.userId,
      filename: metadata.filename
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': XVIEW2_API_KEY ? `Bearer ${XVIEW2_API_KEY}` : ''
      },
      timeout: 30000 // 30 seconds timeout
    });

    return response.data;
  } catch (error) {
    console.error('xView2 API call failed:', error);
    
    // Return fallback assessment
    return {
      damage_level: 'Unknown',
      confidence: 0.0,
      error: 'Analysis service temporarily unavailable',
      estimated_cost_display: 'Unable to assess',
      recommendations: {
        immediate_actions: ['Contact local authorities for manual assessment'],
        relief_application: { required: false }
      }
    };
  }
}

/**
 * Save damage assessment report to Firestore
 */
async function saveDamageReport(data) {
  const reportData = {
    filePath: data.filePath,
    downloadURL: data.downloadURL,
    userId: data.userId,
    state: data.state,
    coordinates: {
      latitude: data.latitude,
      longitude: data.longitude
    },
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    createdAt: data.timestamp,
    damageAssessment: data.damageAssessment,
    status: 'completed',
    processedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  const docRef = await db.collection('damage_reports').add(reportData);
  return docRef.id;
}

/**
 * Save error report to Firestore
 */
async function saveErrorReport(filePath, errorMessage, userId) {
  const errorData = {
    filePath,
    userId,
    error: errorMessage,
    status: 'failed',
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  };

  await db.collection('damage_reports').add(errorData);
}

/**
 * Send notification to user about damage assessment results
 */
async function sendNotification(userId, damageAssessment, reportId) {
  try {
    // Get user's FCM token
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const fcmToken = userData?.fcmToken;

    if (!fcmToken) {
      console.log('No FCM token found for user:', userId);
      return;
    }

    const damageLevel = damageAssessment.damage_level || 'Unknown';
    const confidence = damageAssessment.confidence || 0;
    const estimatedCost = damageAssessment.estimated_cost_display || 'Unable to assess';

    const message = {
      token: fcmToken,
      notification: {
        title: `Flood Damage Assessment - ${damageLevel}`,
        body: `Confidence: ${Math.round(confidence * 100)}% | Estimated Cost: ${estimatedCost}`
      },
      data: {
        reportId,
        damageLevel,
        confidence: confidence.toString(),
        estimatedCost,
        type: 'damage_assessment'
      },
      android: {
        notification: {
          icon: 'ic_damage_assessment',
          color: getDamageColor(damageLevel),
          priority: 'high'
        }
      }
    };

    await admin.messaging().send(message);
    console.log('Notification sent to user:', userId);

  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}

/**
 * Get color code for damage level
 */
function getDamageColor(damageLevel) {
  const colors = {
    'No Damage': '#10B981',
    'Minor Damage': '#F59E0B',
    'Major Damage': '#EF4444',
    'Destroyed': '#7C2D12',
    'Unknown': '#6B7280'
  };
  return colors[damageLevel] || '#6B7280';
}

/**
 * HTTP Cloud Function to get damage reports for a user
 */
exports.getDamageReports = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const reportsSnapshot = await db.collection('damage_reports')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const reports = [];
    reportsSnapshot.forEach(doc => {
      reports.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return { reports };
  } catch (error) {
    console.error('Error fetching damage reports:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch damage reports');
  }
});

/**
 * HTTP Cloud Function to get damage statistics
 */
exports.getDamageStatistics = functions.https.onCall(async (data, context) => {
  const { state, timeRange } = data;
  
  try {
    let query = db.collection('damage_reports')
      .where('status', '==', 'completed');

    if (state && state !== 'all') {
      query = query.where('state', '==', state);
    }

    if (timeRange) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);
      query = query.where('timestamp', '>=', startDate);
    }

    const snapshot = await query.get();
    
    const stats = {
      total: 0,
      byDamageLevel: {},
      byState: {},
      averageConfidence: 0,
      totalEstimatedCost: 0
    };

    let totalConfidence = 0;
    let validReports = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      stats.total++;
      
      const damageLevel = data.damageAssessment?.damage_level || 'Unknown';
      const confidence = data.damageAssessment?.confidence || 0;
      const estimatedCost = data.damageAssessment?.estimated_cost_avg || 0;

      // Count by damage level
      stats.byDamageLevel[damageLevel] = (stats.byDamageLevel[damageLevel] || 0) + 1;
      
      // Count by state
      const reportState = data.state || 'Unknown';
      stats.byState[reportState] = (stats.byState[reportState] || 0) + 1;
      
      // Calculate averages
      if (confidence > 0) {
        totalConfidence += confidence;
        validReports++;
      }
      
      stats.totalEstimatedCost += estimatedCost;
    });

    stats.averageConfidence = validReports > 0 ? totalConfidence / validReports : 0;

    return stats;
  } catch (error) {
    console.error('Error fetching damage statistics:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch damage statistics');
  }
});

/**
 * HTTP Cloud Function to trigger manual damage assessment
 */
exports.triggerDamageAssessment = functions.https.onCall(async (data, context) => {
  const { imageURL, state, latitude, longitude } = data;
  const userId = context.auth?.uid;
  
  if (!userId) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  if (!imageURL) {
    throw new functions.https.HttpsError('invalid-argument', 'Image URL is required');
  }

  try {
    // Call xView2 API
    const damageAssessment = await callXView2API(imageURL, {
      state: state || 'punjab',
      latitude,
      longitude,
      userId
    });

    // Save to Firestore
    const reportId = await saveDamageReport({
      filePath: 'manual_assessment',
      downloadURL: imageURL,
      userId,
      state: state || 'punjab',
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
      damageAssessment
    });

    return { reportId, damageAssessment };
  } catch (error) {
    console.error('Error in manual damage assessment:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process damage assessment');
  }
});
