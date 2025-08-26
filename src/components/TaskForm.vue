<template>
    <div class="task-form">
        <div class="form-header">
            <h3>Add New Task(s)</h3>
            <div class="input-mode-selector">
                <button
                    v-for="mode in inputModes"
                    :key="mode.value"
                    @click="taskInput.setInputMode(mode.value)"
                    :class="{ active: taskInput.inputMode.value === mode.value }"
                    class="mode-btn"
                >
                    {{ mode.label }}
                </button>
            </div>
        </div>

        <!-- Simple Input Mode -->
        <div v-if="taskInput.inputMode.value === 'simple'" class="input-section">
            <div class="input-group">
                <input
                    v-model="taskInput.inputValue.value"
                    type="text"
                    placeholder="Enter task title..."
                    class="task-input"
                    @keyup.enter="handleSubmit"
                />
            </div>
        </div>

        <!-- Advanced Input Mode -->
        <div v-if="taskInput.inputMode.value === 'advanced'" class="input-section">
            <div class="input-group">
                <input
                    v-model="taskInput.advancedInput.value.title"
                    type="text"
                    placeholder="Task title..."
                    class="task-input"
                />
            </div>
            <div class="input-row">
                <div class="input-group">
                    <label>Priority:</label>
                    <select v-model="taskInput.advancedInput.value.priority" class="select-input">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>Category:</label>
                    <input
                        v-model="taskInput.advancedInput.value.category"
                        type="text"
                        placeholder="Category..."
                        class="task-input"
                    />
                </div>
            </div>
        </div>

        <!-- Bulk Input Mode -->
        <div v-if="taskInput.inputMode.value === 'bulk'" class="input-section">
            <div class="input-group">
                <textarea
                    v-model="taskInput.bulkInput.value"
                    placeholder="Enter multiple tasks (one per line) or JSON array..."
                    class="bulk-input"
                    rows="6"
                ></textarea>
            </div>
        </div>

        <!-- Example buttons -->
        <div class="examples">
            <span class="examples-label">Examples:</span>
            <button
                v-for="example in examples"
                :key="example.type"
                @click="taskInput.loadExample(example.type)"
                class="example-btn"
            >
                {{ example.label }}
            </button>
        </div>

        <!-- Action buttons -->
        <div class="form-actions">
            <button
                @click="handleSubmit"
                :disabled="!taskInput.isValidInput.value || taskInput.isProcessing.value"
                class="submit-btn"
            >
                <span v-if="taskInput.isProcessing.value">Processing...</span>
                <span v-else>Add Task(s)</span>
            </button>
            <button @click="taskInput.clearInput" class="clear-btn">Clear</button>
        </div>

        <!-- Error display -->
        <div v-if="error" class="error-message">
            {{ error }}
        </div>

        <!-- Success message -->
        <div v-if="successMessage" class="success-message">
            {{ successMessage }}
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskInput } from '../composables/useTaskInput.js'
import { useTasks } from '../composables/useTasks.js'

const taskInput = useTaskInput()
const { addTask, addMultipleTasks } = useTasks()

const error = ref('')
const successMessage = ref('')

const inputModes = [
    { value: 'simple', label: 'Simple' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'bulk', label: 'Bulk' },
]

const examples = [
    { type: 'simple', label: 'Simple Text' },
    { type: 'advanced', label: 'Advanced Object' },
    { type: 'bulk-text', label: 'Bulk Text' },
    { type: 'bulk-json', label: 'Bulk JSON' },
    { type: 'bulk-mixed', label: 'Mixed Format' },
]

const handleSubmit = async () => {
    error.value = ''
    successMessage.value = ''

    try {
        const processedInput = await taskInput.processInput()

        if (Array.isArray(processedInput)) {
            // Bulk operation
            const addedTasks = await addMultipleTasks(processedInput)
            successMessage.value = `Successfully added ${addedTasks.length} task(s)!`
        } else {
            // Single task
            await addTask(processedInput)
            successMessage.value = 'Task added successfully!'
        }

        taskInput.clearInput()

        // Clear success message after 3 seconds
        setTimeout(() => {
            successMessage.value = ''
        }, 3000)
    } catch (err) {
        error.value = err.message || 'Failed to add task(s)'

        // Clear error message after 5 seconds
        setTimeout(() => {
            error.value = ''
        }, 5000)
    }
}
</script>

<style scoped>
.task-form {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid #e9ecef;
}

.form-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.form-header h3 {
    margin: 0;
    color: #2c3e50;
}

.input-mode-selector {
    display: flex;
    gap: 8px;
}

.mode-btn {
    padding: 8px 16px;
    border: 1px solid #dee2e6;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 14px;
}

.mode-btn:hover {
    background: #e9ecef;
}

.mode-btn.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
}

.input-summary {
    background: white;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 16px;
    border-left: 4px solid #007bff;
}

.summary-info {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 8px;
}

.mode-label {
    font-weight: 600;
    color: #007bff;
    font-size: 14px;
}

.preview {
    color: #6c757d;
    font-style: italic;
}

.details {
    display: flex;
    gap: 16px;
    font-size: 12px;
}

.detail {
    color: #495057;
    background: #f8f9fa;
    padding: 2px 8px;
    border-radius: 4px;
}

.input-section {
    margin-bottom: 16px;
}

.input-group {
    margin-bottom: 12px;
}

.input-group label {
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

.task-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.select-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.task-input:focus,
.select-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.bulk-input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
    font-family: 'Courier New', monospace;
    resize: vertical;
    min-height: 120px;
}

.bulk-input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.examples {
    margin-bottom: 16px;
    padding: 12px;
    background: white;
    border-radius: 6px;
    border: 1px solid #e9ecef;
}

.examples-label {
    font-size: 12px;
    color: #6c757d;
    margin-right: 8px;
}

.example-btn {
    padding: 4px 8px;
    margin: 2px;
    border: 1px solid #dee2e6;
    background: white;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
}

.example-btn:hover {
    background: #f8f9fa;
    border-color: #007bff;
}

.form-actions {
    display: flex;
    gap: 12px;
}

.submit-btn {
    flex: 1;
    padding: 12px 24px;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
}

.submit-btn:hover:not(:disabled) {
    background: #218838;
}

.submit-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
}

.clear-btn {
    padding: 12px 24px;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.clear-btn:hover {
    background: #5a6268;
}

.error-message {
    margin-top: 12px;
    padding: 12px;
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 6px;
    font-size: 14px;
}

.success-message {
    margin-top: 12px;
    padding: 12px;
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
    border-radius: 6px;
    font-size: 14px;
}
</style>
