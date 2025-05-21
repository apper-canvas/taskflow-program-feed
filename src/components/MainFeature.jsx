import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { getIcon } from '../utils/iconUtils';

// Import services
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus
} from '../services/taskService';

import { createTaskTag } from '../services/taskTagService';

const MainFeature = () => {
  // Define task status options
  const statusOptions = [
    { id: 'todo', label: 'To Do', color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100', icon: 'circle' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100', icon: 'clock' },
    { id: 'done', label: 'Done', color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100', icon: 'check-circle' }
  ];

  // Define priority options
  const priorityOptions = [
    { id: 'low', label: 'Low', color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300', icon: 'arrow-down' },
    { id: 'medium', label: 'Medium', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300', icon: 'minus' },
    { id: 'high', label: 'High', color: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300', icon: 'arrow-up' },
    { id: 'urgent', label: 'Urgent', color: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300', icon: 'alert-circle' }
  ];

  // Initialize state
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [taskError, setTaskError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);
  const [tagActionLoading, setTagActionLoading] = useState(false);

  // Get user info from Redux
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const userId = user?.userId;
  const userName = user?.firstName;

  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentTask, setCurrentTask] = useState({
    id: '',
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch tasks on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, filters]);

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setTaskError(null);
      const fetchedTasks = await getTasks({
        status: filters.status !== 'all' ? filters.status : null,
        priority: filters.priority !== 'all' ? filters.priority : null,
        search: filters.search || null
      });
      
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTaskError('Failed to load tasks. Please try again.');
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!currentTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    
    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // Update existing task
        updateTask(currentTask.Id, currentTask)
          .then(() => {
            toast.success("Task updated successfully");
            fetchTasks();
            resetForm();
          })
          .catch(error => {
            console.error('Error updating task:', error);
            toast.error("Failed to update task");
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      } else {
        // Create new task
        const newTaskData = {
          ...currentTask,
          createdAt: new Date().toISOString()
        };
        createTask(newTaskData)
          .then(() => {
            toast.success("New task created successfully");
            fetchTasks();
            resetForm();
          })
          .catch(error => {
            console.error('Error creating task:', error);
            toast.error("Failed to create task");
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      }
    } catch (error) {
      console.error('Task submission error:', error);
      toast.error("An error occurred while saving the task");
      setIsSubmitting(false);
    }
  };

  // Reset form fields and state
  const resetForm = () => {
    setCurrentTask({
      id: '',
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      tags: []
    });
    setTagInput('');
    setShowTaskForm(false);
    setIsEditMode(false);
  };

  // Edit task
  const editTask = (task) => {
    setCurrentTask({ ...task });
    setIsEditMode(true);
    setShowTaskForm(true);
  };

  // Delete task
  const handleDeleteTask = (id) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }
    
    setIsDeleting(id);
    
    deleteTask(id)
      .then(() => {
        toast.success("Task deleted successfully");
        fetchTasks();
      })
      .catch(error => {
        console.error('Error deleting task:', error);
        toast.error("Failed to delete task");
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  // Handle tag input
  const handleTagAdd = () => {
    if (tagInput.trim() && !currentTask.tags.includes(tagInput.trim())) {
      setCurrentTask({
        ...currentTask,
        tags: [...currentTask.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setCurrentTask({
      ...currentTask,
      tags: currentTask.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Change task status (quick action)
  const changeStatus = async (taskId, newStatus) => {
    setStatusUpdateLoading(taskId);
    
    try {
      await updateTaskStatus(taskId, newStatus);
      toast.info("Task status updated");
      fetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error("Failed to update task status");
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      priority: 'all',
      search: ''
    });
    toast.info("Filters reset");
  };

  // Apply filters locally (already applied on backend)
  const filteredTasks = tasks.filter(task => {
    // Status filter
    if (filters.status !== 'all' && task.status !== filters.status) {
      return false;
    }
    
    // Priority filter
    if (filters.priority !== 'all' && task.priority !== filters.priority) {
      return false;
    }
    
    // Search filter (title, description, and tags)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchTerm);
      const matchesDescription = task.description.toLowerCase().includes(searchTerm);
      const matchesTags = task.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) || false;
      
      if (!matchesTitle && !matchesDescription && !matchesTags) {
        return false;
      }
    }
    
    return true;
  });
  
  // Process task counts by status
  const taskCountsByStatus = statusOptions.map(status => ({
    ...status,
    count: tasks.filter(task => task.status === status.id).length
  }));

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            if (!isAuthenticated) return toast.error("Please login to create tasks");
            setIsEditMode(false);
            setShowTaskForm(true);
          }}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Task
        </motion.button>
        
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowFilters(!showFilters)}
            className="btn-outline"
          >
            <FilterIcon className="h-5 w-5 mr-2" />
            Filters
          </motion.button>
          
          {filteredTasks.length !== tasks.length && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={resetFilters}
              className="btn bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-100 dark:hover:bg-red-800/50"
            >
              <XIcon className="h-5 w-5 mr-2" />
              Clear Filters
            </motion.button>
          )}
        </div>
      </div>
      
      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="card mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-primary" />
                Filter Tasks
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                      placeholder="Search in tasks..."
                      className="form-input pl-10"
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-400" />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="form-select"
                  >
                    <option value="all">All Statuses</option>
                    {statusOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    className="form-select"
                  >
                    <option value="all">All Priorities</option>
                    {priorityOptions.map(option => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Task Form Modal */}
      <AnimatePresence>
        {showTaskForm && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-surface-800 rounded-xl shadow-lg"
            >
              <div className="sticky top-0 bg-surface-100 dark:bg-surface-700 px-6 py-4 border-b border-surface-200 dark:border-surface-600 flex justify-between items-center">
                <h3 className="font-semibold text-xl">
                  {isEditMode ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-surface-500 hover:text-surface-700 dark:text-surface-300 dark:hover:text-surface-100 transition-colors"
                  aria-label="Close"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label htmlFor="title" className="form-label">Task Title*</label>
                  <input
                    id="title"
                    type="text"
                    value={currentTask.title}
                    onChange={(e) => setCurrentTask({...currentTask, title: e.target.value})}
                    placeholder="What needs to be done?"
                    className="form-input"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    rows="3"
                    value={currentTask.description}
                    onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                    placeholder="Add more details about this task..."
                    className="form-input resize-none"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className="form-label">Status</label>
                    <select
                      id="status"
                      value={currentTask.status}
                      onChange={(e) => setCurrentTask({...currentTask, status: e.target.value})}
                      className="form-select"
                    >
                      {statusOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="form-label">Priority</label>
                    <select
                      id="priority"
                      value={currentTask.priority}
                      onChange={(e) => setCurrentTask({...currentTask, priority: e.target.value})}
                      className="form-select"
                    >
                      {priorityOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="dueDate" className="form-label">Due Date</label>
                  <input
                    id="dueDate"
                    type="date"
                    value={currentTask.dueDate}
                    onChange={(e) => setCurrentTask({...currentTask, dueDate: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Tags</label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTagAdd();
                        }
                      }}
                      placeholder="Add a tag..."
                      className="form-input flex-1 mr-2"
                    />
                    <button
                      type="button"
                      onClick={handleTagAdd}
                      className="btn-outline"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {currentTask.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {currentTask.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200"
                          >
                            <XIcon className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 border-t border-surface-200 dark:border-surface-700">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn-primary ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Task' : 'Create Task')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {taskCountsByStatus.map(status => {
          const { count } = status;
          const StatusIcon = getIcon(status.icon);
          
          return (
            <div key={status.id} className="card">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${status.color} mr-3`}> 
                    <StatusIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{status.label}</h3>
                    <p className="text-surface-600 dark:text-surface-400">{count} task{count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilters({...filters, status: status.id})}
                  className="btn-outline py-1 px-3 text-sm"
                >
                  View
                </motion.button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Task List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary border-r-transparent"></div>
          <span className="ml-3 text-surface-700 dark:text-surface-300">Loading tasks...</span>
        </div>
      ) : taskError ? (
        <div className="p-6 text-center text-red-500">{taskError} <button onClick={fetchTasks} className="underline">Try again</button></div>
      ) : filteredTasks.length > 0 ? (
        <div className="task-grid"> 
          {filteredTasks.map(task => {
            // Find status and priority info
            const taskStatus = statusOptions.find(s => s.id === task.status);
            const taskPriority = priorityOptions.find(p => p.id === task.priority);
            const StatusIcon = getIcon(taskStatus.icon);
            const PriorityIcon = getIcon(taskPriority.icon);
            
            return (
              <motion.div
                key={task.Id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="card"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${taskStatus.color}`}>
                    <StatusIcon className="h-3.5 w-3.5 mr-1" />
                    {taskStatus.label}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editTask(task)}
                      className="text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Edit task"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.Id)}
                      className="text-surface-500 hover:text-red-600 dark:text-surface-400 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Delete task"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-medium mb-2 text-surface-800 dark:text-surface-100">
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-surface-600 dark:text-surface-400 mb-3 text-sm line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="flex items-center mb-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${taskPriority.color}`}>
                    <PriorityIcon className="h-3.5 w-3.5 mr-1" />
                    {taskPriority.label}
                  </span>
                  
                  {task.dueDate && (
                    <span className="ml-2 text-xs text-surface-500 dark:text-surface-400 flex items-center">
                      <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                      Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
                
                {task.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {task.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-block px-2 py-0.5 text-xs rounded-full bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="border-t border-surface-200 dark:border-surface-700 pt-3 mt-2">
                  <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">
                    Created: {format(new Date(task.createdAt), 'MMM d, yyyy')}
                  </p>
                  
                  <div className="flex space-x-2">
                    {/* Quick Status Change Buttons - only show relevant ones */}
                    {task.status !== 'todo' && ( 
                      <button
                        onClick={() => changeStatus(task.Id, 'todo')}
                        className={`btn-outline py-1 px-2 text-xs ${statusUpdateLoading === task.Id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={statusUpdateLoading === task.Id}
                      >
                        <CircleIcon className="h-3 w-3 mr-1" />
                        {statusUpdateLoading === task.Id ? 'Updating...' : 'To Do'}
                      </button>
                    )}
                    
                    {task.status !== 'in-progress' && (
                      <button
                        onClick={() => changeStatus(task.Id, 'in-progress')}
                        className={`btn-outline py-1 px-2 text-xs ${statusUpdateLoading === task.Id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={statusUpdateLoading === task.Id}
                      >
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {statusUpdateLoading === task.Id ? 'Updating...' : 'In Progress'}
                      </button>
                    )}
                    
                    {task.status !== 'done' && (
                      <button
                        onClick={() => changeStatus(task.Id, 'done')}
                        className={`btn-outline py-1 px-2 text-xs ${statusUpdateLoading === task.Id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={statusUpdateLoading === task.Id}
                      >
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        {statusUpdateLoading === task.Id ? 'Updating...' : 'Done'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <div className="inline-block p-4 rounded-full bg-surface-200 dark:bg-surface-700 mb-4">
            <InboxIcon className="h-10 w-10 text-surface-500 dark:text-surface-400" />
          </div>
          <h3 className="text-xl font-medium mb-2">No tasks found</h3>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            {tasks.length === 0 ? 
              "You don't have any tasks yet. Create your first task to get started." : 
              "No tasks match your current filters. Try adjusting your filters or clear them."}
          </p>
          {tasks.length === 0 ? (
            <button
              onClick={() => {
                setIsEditMode(false);
                setShowTaskForm(true);
              }}
              className="btn-primary mx-auto"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create First Task
            </button>
          ) : (
            <button
              onClick={resetFilters}
              className="btn-outline mx-auto"
            >
              <FilterOffIcon className="h-5 w-5 mr-2" />
              Clear Filters
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
};

// Icon components
const PlusIcon = getIcon('plus');
const FilterIcon = getIcon('filter');
const XIcon = getIcon('x');
const SearchIcon = getIcon('search');
const PencilIcon = getIcon('pencil');
const TrashIcon = getIcon('trash-2');
const CalendarIcon = getIcon('calendar');
const CheckCircleIcon = getIcon('check-circle');
const ClockIcon = getIcon('clock');
const CircleIcon = getIcon('circle');
const InboxIcon = getIcon('inbox');
const AdjustmentsHorizontalIcon = getIcon('sliders-horizontal');
const FilterOffIcon = getIcon('filter-x');

export default MainFeature;