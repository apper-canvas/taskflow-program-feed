/**
 * Task Tag Service - Handles task-tag relationship operations
 * Maps to the task_tag3 table in the database
 */

// Get all tags for a specific task
export const getTaskTags = async (taskId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: ["Id", "Name", "tag", "task"],
      where: [
        {
          fieldName: "task",
          operator: "ExactMatch",
          values: [taskId]
        }
      ]
    };

    const response = await apperClient.fetchRecords("task_tag3", params);
    return response.data || [];
    
  } catch (error) {
    console.error("Error fetching task tags:", error);
    throw error;
  }
};

// Create a new tag for a task
export const createTaskTag = async (taskId, tagName) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [{
        Name: `${tagName} for task ${taskId}`,
        tag: tagName,
        task: taskId
      }]
    };

    const response = await apperClient.createRecord("task_tag3", params);
    return response.results[0].data;
    
  } catch (error) {
    console.error("Error creating task tag:", error);
    throw error;
  }
};

// Delete a task tag
export const deleteTaskTag = async (tagId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const response = await apperClient.deleteRecord("task_tag3", { RecordIds: [tagId] });
    return response.success;
  } catch (error) {
    console.error(`Error deleting task tag with ID ${tagId}:`, error);
    throw error;
  }
};