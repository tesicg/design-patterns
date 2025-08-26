<template>
    <div class="task-list">
        <div class="list-header">
            <h3>Tasks</h3>
            <div class="task-stats">
                <div class="stat-item">
                    <span class="stat-value">{{ taskStats.total }}</span>
                    <span class="stat-label">Total</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ taskStats.pending }}</span>
                    <span class="stat-label">Pending</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ taskStats.completed }}</span>
                    <span class="stat-label">Completed</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">{{ taskStats.completionRate }}%</span>
                    <span class="stat-label">Complete</span>
                </div>
            </div>
        </div>

        <div v-if="loading" class="loading">Loading tasks...</div>

        <div v-else-if="filteredTasks.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <h4>No tasks found</h4>
            <p v-if="hasActiveFilters">Try adjusting your filters or add some tasks.</p>
            <p v-else>Add your first task to get started!</p>
        </div>

        <div v-else>
            <div
                v-for="task in filteredTasks"
                :key="task.id"
                :class="['task-item', { completed: task.completed }]"
            >
                <div class="task-content">
                    <div class="task-checkbox">
                        <input
                            type="checkbox"
                            :checked="task.completed"
                            @change="toggleTask(task.id)"
                            :id="`task-${task.id}`"
                        />
                        <label :for="`task-${task.id}`" class="checkbox-label"></label>
                    </div>

                    <div class="task-details">
                        <div class="task-title">{{ task.title }}</div>
                        <div class="task-meta">
                            <span :class="['priority-badge', task.priority]">
                                {{ task.priority }}
                            </span>
                            <span class="category-badge">{{ task.category }}</span>
                            <span v-if="task.createdAt" class="created-date">
                                {{ formatDate(task.createdAt) }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="task-actions">
                    <button @click="editTask(task)" class="action-btn edit-btn" title="Edit">
                        ✏️
                    </button>
                    <button
                        @click="deleteTask(task.id)"
                        class="action-btn delete-btn"
                        title="Delete"
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>

        <div v-if="completedTasks.length > 0" class="bulk-actions">
            <button @click="clearCompleted" class="clear-completed-btn">
                Clear {{ completedTasks.length }} Completed Task(s)
            </button>
        </div>

        <!-- Edit Modal -->
        <div v-if="editingTask" class="modal-overlay" @click="cancelEdit">
            <div class="modal-content" @click.stop>
                <h4>Edit Task</h4>
                <div class="edit-form">
                    <div class="input-group">
                        <label>Title:</label>
                        <input
                            v-model="editForm.title"
                            type="text"
                            class="edit-input"
                            @keyup.enter="saveEdit"
                        />
                    </div>
                    <div class="input-row">
                        <div class="input-group">
                            <label>Priority:</label>
                            <select v-model="editForm.priority" class="edit-select">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Category:</label>
                            <input v-model="editForm.category" type="text" class="edit-input" />
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button @click="saveEdit" class="save-btn">Save</button>
                        <button @click="cancelEdit" class="cancel-btn">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps } from 'vue'
import { useTasks } from '../composables/useTasks.js'

const props = defineProps({
    filteredTasks: {
        type: Array,
        required: true,
    },
    hasActiveFilters: {
        type: Boolean,
        default: false,
    },
})

const {
    taskStats,
    completedTasks,
    loading,
    toggleTask,
    deleteTask: deleteTaskAction,
    updateTask,
    clearCompleted,
} = useTasks()

// Edit functionality
const editingTask = ref(null)
const editForm = ref({
    title: '',
    priority: 'medium',
    category: 'general',
})

const editTask = (task) => {
    editingTask.value = task
    editForm.value = {
        title: task.title,
        priority: task.priority,
        category: task.category,
    }
}

const saveEdit = async () => {
    if (!editingTask.value || !editForm.value.title.trim()) return

    try {
        await updateTask(editingTask.value.id, editForm.value)
        cancelEdit()
    } catch (error) {
        console.error('Failed to update task:', error)
    }
}

const cancelEdit = () => {
    editingTask.value = null
    editForm.value = {
        title: '',
        priority: 'medium',
        category: 'general',
    }
}

const deleteTask = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await deleteTaskAction(id)
        } catch (error) {
            console.error('Failed to delete task:', error)
        }
    }
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return (
        date.toLocaleDateString() +
        ' ' +
        date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    )
}
</script>

<style scoped>
.task-list {
    background: white;
    border-radius: 12px;
    padding: 24px;
    border: 1px solid #e9ecef;
}

.list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #f8f9fa;
}

.list-header h3 {
    margin: 0;
    color: #2c3e50;
}

.task-stats {
    display: flex;
    gap: 16px;
}

.stat-item {
    text-align: center;
    padding: 8px 12px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.stat-value {
    display: block;
    font-size: 18px;
    font-weight: 700;
    color: #2c3e50;
}

.stat-label {
    display: block;
    font-size: 12px;
    color: #6c757d;
    margin-top: 2px;
}

.loading {
    text-align: center;
    padding: 40px;
    color: #6c757d;
    font-style: italic;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #6c757d;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.empty-state h4 {
    margin: 0 0 8px 0;
    color: #495057;
}

.empty-state p {
    margin: 0;
    font-size: 14px;
}

.task-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    margin-bottom: 8px;
    transition: all 0.2s;
    background: white;
}

.task-item:hover {
    border-color: #007bff;
    box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
}

.task-item.completed {
    background: #f8f9fa;
    opacity: 0.7;
}

.task-item.completed .task-title {
    text-decoration: line-through;
    color: #6c757d;
}

.task-content {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 12px;
}

.task-checkbox {
    position: relative;
}

.task-checkbox input[type='checkbox'] {
    opacity: 0;
    position: absolute;
}

.checkbox-label {
    display: block;
    width: 20px;
    height: 20px;
    border: 2px solid #ced4da;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
}

.task-checkbox input[type='checkbox']:checked + .checkbox-label {
    background: #28a745;
    border-color: #28a745;
}

.task-checkbox input[type='checkbox']:checked + .checkbox-label::after {
    content: '✓';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    font-size: 12px;
    font-weight: bold;
}

.task-details {
    flex: 1;
}

.task-title {
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 4px;
    font-size: 16px;
}

.task-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
}

.priority-badge {
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
}

.priority-badge.high {
    background: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
}

.priority-badge.medium {
    background: #fff3e0;
    color: #ef6c00;
    border: 1px solid #ffcc02;
}

.priority-badge.low {
    background: #e8f5e8;
    color: #2e7d32;
    border: 1px solid #c8e6c9;
}

.category-badge {
    padding: 2px 8px;
    background: #e3f2fd;
    color: #1565c0;
    border-radius: 12px;
    font-size: 11px;
    border: 1px solid #bbdefb;
}

.created-date {
    font-size: 11px;
    color: #6c757d;
}

.task-actions {
    display: flex;
    gap: 4px;
}

.action-btn {
    padding: 6px 8px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.2s;
    font-size: 14px;
}

.action-btn:hover {
    background: #f8f9fa;
}

.edit-btn:hover {
    background: #e3f2fd;
}

.delete-btn:hover {
    background: #ffebee;
}

.bulk-actions {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #e9ecef;
    text-align: center;
}

.clear-completed-btn {
    padding: 8px 16px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.clear-completed-btn:hover {
    background: #c82333;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-content {
    background: white;
    padding: 24px;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-content h4 {
    margin: 0 0 20px 0;
    color: #2c3e50;
}

.edit-form .input-group {
    margin-bottom: 16px;
}

.edit-form label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
    color: #495057;
    font-size: 14px;
}

.input-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.edit-input,
.edit-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
}

.edit-input:focus,
.edit-select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 20px;
}

.save-btn {
    padding: 10px 20px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
}

.save-btn:hover {
    background: #218838;
}

.cancel-btn {
    padding: 10px 20px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}

.cancel-btn:hover {
    background: #5a6268;
}
</style>
