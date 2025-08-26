import { reactive, computed } from 'vue'

/**
 * Data Store Pattern - Centralized state management
 * This store manages all task-related state and provides reactive data
 * that can be shared across multiple components
 */
class TaskStore {
    constructor() {
        // Reactive state - the single source of truth
        this.state = reactive({
            tasks: [
                {
                    id: 1,
                    title: 'Learn Vue 3 Composition API',
                    completed: false,
                    priority: 'high',
                    category: 'learning',
                },
                {
                    id: 2,
                    title: 'Build a todo app',
                    completed: true,
                    priority: 'medium',
                    category: 'project',
                },
                {
                    id: 3,
                    title: 'Write documentation',
                    completed: false,
                    priority: 'low',
                    category: 'work',
                },
            ],
            nextId: 4,
            loading: false,
            error: null,
        })
    }

    // Computed properties for derived state
    get completedTasks() {
        return computed(() => this.state.tasks.filter((task) => task.completed))
    }

    get pendingTasks() {
        return computed(() => this.state.tasks.filter((task) => !task.completed))
    }

    get taskStats() {
        return computed(() => ({
            total: this.state.tasks.length,
            completed: this.completedTasks.value.length,
            pending: this.pendingTasks.value.length,
            completionRate:
                this.state.tasks.length > 0
                    ? Math.round((this.completedTasks.value.length / this.state.tasks.length) * 100)
                    : 0,
        }))
    }

    // Actions - methods that modify state
    addTask(taskData) {
        const task = {
            id: this.state.nextId++,
            title: taskData.title || taskData,
            completed: false,
            priority: taskData.priority || 'medium',
            category: taskData.category || 'general',
            createdAt: new Date().toISOString(),
        }

        this.state.tasks.push(task)
        return task
    }

    updateTask(id, updates) {
        const taskIndex = this.state.tasks.findIndex((task) => task.id === id)
        if (taskIndex !== -1) {
            Object.assign(this.state.tasks[taskIndex], updates)
            return this.state.tasks[taskIndex]
        }
        return null
    }

    deleteTask(id) {
        const taskIndex = this.state.tasks.findIndex((task) => task.id === id)
        if (taskIndex !== -1) {
            return this.state.tasks.splice(taskIndex, 1)[0]
        }
        return null
    }

    toggleTask(id) {
        const task = this.state.tasks.find((task) => task.id === id)
        if (task) {
            task.completed = !task.completed
            return task
        }
        return null
    }

    clearCompleted() {
        const completedCount = this.completedTasks.value.length
        // Mutate the array in place to maintain reactivity
        const pendingTasks = this.state.tasks.filter((task) => !task.completed)
        this.state.tasks.splice(0, this.state.tasks.length, ...pendingTasks)
        return completedCount
    }

    // Bulk operations
    addMultipleTasks(tasks) {
        const addedTasks = []
        tasks.forEach((taskData) => {
            addedTasks.push(this.addTask(taskData))
        })
        return addedTasks
    }

    setLoading(loading) {
        this.state.loading = loading
    }

    setError(error) {
        this.state.error = error
    }

    // Get all tasks (reactive reference)
    get tasks() {
        return this.state.tasks
    }

    // Get task by ID
    getTaskById(id) {
        return this.state.tasks.find((task) => task.id === id)
    }
}

// Create and export a singleton instance
export const taskStore = new TaskStore()
