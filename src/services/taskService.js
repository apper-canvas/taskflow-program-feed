/**
 * Task Service - Handles all task-related operations
 * Maps to the task33 table in the database
 */

// Get tasks with optional filtering
export const getTasks = async (filters = {}) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Define fields to fetch (all fields including system fields)
    const fields = [
      "Id", "Name", "Tags", "Owner", "title", "description", 
      "status", "priority", "dueDate", "createdAt"
    ];

    // Set up basic query params
    const params = {
      fields: fields,
      orderBy: [
        {
          fieldName: "createdAt",
          SortType: "DESC"
        }
      ],
      where: []
    };

    // Add filters if provided
    if (filters.status && filters.status !== 'all') {
      params.where.push({
        fieldName: "status",
        operator: "ExactMatch",
        values: [filters.status]
      });
    }

    if (filters.priority && filters.priority !== 'all') {
      params.where.push({
        fieldName: "priority",
        operator: "ExactMatch",
        values: [filters.priority]
      });
    }

    if (filters.search) {
      // Add search conditions (title, description, tags)
      params.whereGroups = [{
        operator: "OR",
        subGroups: [
          {
            conditions: [{
              fieldName: "title",
              operator: "Contains",
              values: [filters.search]
            }],
            operator: ""
          },
          {
            conditions: [{
              fieldName: "description",
              operator: "Contains",
              values: [filters.search]
            }],
            operator: ""
          },
          {
            conditions: [{
              fieldName: "Tags",
              operator: "Contains",
              values: [filters.search]
            }],
            operator: ""
          }
        ]
      }];
    }

    const response = await apperClient.fetchRecords("task33", params);
    return response.data || [];
    
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

// Get a single task by ID
export const getTaskById = async (taskId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const response = await apperClient.getRecordById("task33", taskId);
    return response.data;
    
  } catch (error) {
    console.error(`Error fetching task with ID ${taskId}:`, error);
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Only include updateable fields
    const params = {
      records: [{
        Name: taskData.title,
        Tags: taskData.tags.join(','),
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
        createdAt: new Date().toISOString()
      }]
    };

    const response = await apperClient.createRecord("task33", params);
    return response.results[0].data;
    
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// Update an existing task
export const updateTask = async (taskId, taskData) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Only include updateable fields
    const params = {
      records: [{
        Id: taskId,
        Name: taskData.title,
        Tags: taskData.tags.join(','),
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        dueDate: taskData.dueDate
      }]
    };

    const response = await apperClient.updateRecord("task33", params);
    return response.results[0].data;
    
  } catch (error) {
    console.error(`Error updating task with ID ${taskId}:`, error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      RecordIds: [taskId]
    };

    const response = await apperClient.deleteRecord("task33", params);
    return response.success;
    
  } catch (error) {
    console.error(`Error deleting task with ID ${taskId}:`, error);
    throw error;
  }
};

// Update task status (quick action)
export const updateTaskStatus = async (taskId, newStatus) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      records: [{
        Id: taskId,
        status: newStatus
      }]
    };

    const response = await apperClient.updateRecord("task33", params);
    return response.results[0].data;
    
  } catch (error) {
    console.error(`Error updating task status for ID ${taskId}:`, error);
    throw error;
  }
};