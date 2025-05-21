/**
 * User Preference Service - Handles user preference operations
 * Maps to the user_preference2 table in the database
 */

// Get user preference for a specific user
export const getUserPreference = async (userId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: ["Id", "Name", "userName", "darkMode", "lastLogin"],
      where: [
        {
          fieldName: "Owner",
          operator: "ExactMatch",
          values: [userId]
        }
      ]
    };

    const response = await apperClient.fetchRecords("user_preference2", params);
    return response.data || [];
    
  } catch (error) {
    console.error("Error fetching user preference:", error);
    throw error;
  }
};

// Create user preference
export const createUserPreference = async (userName, darkMode = false) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [{
        Name: `Preferences for ${userName}`,
        userName: userName,
        darkMode: darkMode,
        lastLogin: new Date().toISOString()
      }]
    };

    const response = await apperClient.createRecord("user_preference2", params);
    return response.results[0].data;
    
  } catch (error) {
    console.error("Error creating user preference:", error);
    throw error;
  }
};

// Update user preference
export const updateUserPreference = async (userId, preferences) => {
  try {
    // First check if preference exists
    const existingPrefs = await getUserPreference(userId);
    
    if (existingPrefs.length === 0) {
      // Create if doesn't exist
      return createUserPreference(preferences.userName || 'User', preferences.darkMode || false);
    }
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [{
        Id: existingPrefs[0].Id,
        ...preferences,
        lastLogin: new Date().toISOString()
      }]
    };

    const response = await apperClient.updateRecord("user_preference2", params);
    return response.results[0].data;
    
  } catch (error) {
    console.error("Error updating user preference:", error);
    throw error;
  }
};