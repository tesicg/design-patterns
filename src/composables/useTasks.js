import { computed, nextTick } from 'vue'
import { taskStore } from '../stores/taskStore.js'

/**
 * Thin Composables Pattern - Separate Logic from UI
 * This composable provides a clean interface to task operations
 * without mixing business logic with component logic
 */
export function useTasks() {
    // Expose reactive state from store
    const tasks = computed(() => taskStore.tasks)
    const completedTasks = taskStore.completedTasks
    const pendingTasks = taskStore.pendingTasks
    const taskStats = taskStore.taskStats
    const loading = computed(() => taskStore.state.loading)
    const error = computed(() => taskStore.state.error)

    // Task operations - thin wrappers around store methods
    const addTask = async (taskData) => {
        try {
            console.log('🏪 Data Store Pattern: Setting loading state')
            taskStore.setLoading(true)
            taskStore.setError(null)

            // Simulate async operation (e.g., API call)
            await new Promise((resolve) => setTimeout(resolve, 100))

            console.log('🧩 Thin Composable: Processing task data:', taskData)
            const newTask = taskStore.addTask(taskData)
            console.log('🏪 Data Store Pattern: Task added to store:', newTask)

            // Ensure DOM updates before resolving
            await nextTick()

            return newTask
        } catch (err) {
            console.error('❌ Error in addTask:', err)
            taskStore.setError('Failed to add task')
            throw err
        } finally {
            taskStore.setLoading(false)
        }
    }

    const updateTask = async (id, updates) => {
        try {
            taskStore.setLoading(true)
            taskStore.setError(null)

            await new Promise((resolve) => setTimeout(resolve, 50))

            const updatedTask = taskStore.updateTask(id, updates)
            if (!updatedTask) {
                throw new Error('Task not found')
            }

            await nextTick()
            return updatedTask
        } catch (err) {
            taskStore.setError('Failed to update task')
            throw err
        } finally {
            taskStore.setLoading(false)
        }
    }

    const deleteTask = async (id) => {
        try {
            taskStore.setLoading(true)
            taskStore.setError(null)

            await new Promise((resolve) => setTimeout(resolve, 50))

            const deletedTask = taskStore.deleteTask(id)
            if (!deletedTask) {
                throw new Error('Task not found')
            }

            await nextTick()
            return deletedTask
        } catch (err) {
            taskStore.setError('Failed to delete task')
            throw err
        } finally {
            taskStore.setLoading(false)
        }
    }

    const toggleTask = async (id) => {
        try {
            const toggledTask = taskStore.toggleTask(id)
            if (!toggledTask) {
                throw new Error('Task not found')
            }

            await nextTick()
            return toggledTask
        } catch (err) {
            taskStore.setError('Failed to toggle task')
            throw err
        }
    }

    const clearCompleted = async () => {
        try {
            taskStore.setLoading(true)
            taskStore.setError(null)

            await new Promise((resolve) => setTimeout(resolve, 100))

            const clearedCount = taskStore.clearCompleted()

            await nextTick()
            return clearedCount
        } catch (err) {
            taskStore.setError('Failed to clear completed tasks')
            throw err
        } finally {
            taskStore.setLoading(false)
        }
    }

    // Bulk operations
    const addMultipleTasks = async (tasksData) => {
        try {
            console.log('🔄 Flexible Arguments: Processing bulk tasks:', tasksData)
            taskStore.setLoading(true)
            taskStore.setError(null)

            await new Promise((resolve) => setTimeout(resolve, 200))

            const addedTasks = taskStore.addMultipleTasks(tasksData)
            console.log(`🏪 Data Store Pattern: ${addedTasks.length} tasks added to store`)

            await nextTick()
            return addedTasks
        } catch (err) {
            console.error('❌ Error in addMultipleTasks:', err)
            taskStore.setError('Failed to add multiple tasks')
            throw err
        } finally {
            taskStore.setLoading(false)
        }
    }

    // Utility functions
    const getTaskById = (id) => {
        return taskStore.getTaskById(id)
    }

    const hasTask = (id) => {
        return !!taskStore.getTaskById(id)
    }

    // Clear error
    const clearError = () => {
        taskStore.setError(null)
    }

    return {
        // State
        tasks,
        completedTasks,
        pendingTasks,
        taskStats,
        loading,
        error,

        // Actions
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        clearCompleted,
        addMultipleTasks,

        // Utilities
        getTaskById,
        hasTask,
        clearError,
    }
}
