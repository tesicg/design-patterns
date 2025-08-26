import { ref, computed } from 'vue'

/**
 * Flexible Arguments Pattern - Handle Different Input Types
 * This composable can handle various input formats for creating tasks:
 * - String: "Task title"
 * - Object: { title: "Task", priority: "high" }
 * - Array: ["Task 1", "Task 2"] or [{ title: "Task 1" }, { title: "Task 2" }]
 */
export function useTaskInput() {
    const inputValue = ref('')
    const inputMode = ref('simple') // 'simple', 'advanced', 'bulk'
    const isProcessing = ref(false)
    const lastProcessedInput = ref(null)

    // Advanced input fields
    const advancedInput = ref({
        title: '',
        priority: 'medium',
        category: 'general',
    })

    // Bulk input
    const bulkInput = ref('')

    // Input validation
    const isValidInput = computed(() => {
        switch (inputMode.value) {
            case 'simple':
                return inputValue.value.trim().length > 0
            case 'advanced':
                return advancedInput.value.title.trim().length > 0
            case 'bulk':
                return bulkInput.value.trim().length > 0
            default:
                return false
        }
    })

    // Parse different input types into standardized task objects
    const parseTaskInput = (input) => {
        // Handle null/undefined
        if (!input) {
            throw new Error('Input cannot be empty')
        }

        // Handle string input
        if (typeof input === 'string') {
            const trimmed = input.trim()
            if (!trimmed) {
                throw new Error('Task title cannot be empty')
            }
            return {
                title: trimmed,
                priority: 'medium',
                category: 'general',
            }
        }

        // Handle object input
        if (typeof input === 'object' && !Array.isArray(input)) {
            if (!input.title || typeof input.title !== 'string' || !input.title.trim()) {
                throw new Error('Task object must have a valid title')
            }

            return {
                title: input.title.trim(),
                priority: input.priority || 'medium',
                category: input.category || 'general',
                ...input, // Allow additional properties
            }
        }

        // Handle array input
        if (Array.isArray(input)) {
            if (input.length === 0) {
                throw new Error('Task array cannot be empty')
            }

            return input.map((item, index) => {
                try {
                    return parseTaskInput(item)
                } catch (error) {
                    throw new Error(`Invalid task at index ${index}: ${error.message}`)
                }
            })
        }

        throw new Error('Invalid input type. Expected string, object, or array.')
    }

    // Parse bulk input (text with multiple lines or comma-separated)
    const parseBulkInput = (bulkText) => {
        if (!bulkText || typeof bulkText !== 'string') {
            throw new Error('Bulk input must be a string')
        }

        const trimmed = bulkText.trim()
        if (!trimmed) {
            throw new Error('Bulk input cannot be empty')
        }

        // Try to parse as JSON first
        try {
            const parsed = JSON.parse(trimmed)
            return parseTaskInput(parsed)
        } catch {
            // Not JSON, treat as plain text
        }

        // Split by lines or commas
        const lines = trimmed
            .split(/\n|,/)
            .map((line) => line.trim())
            .filter((line) => line)

        if (lines.length === 0) {
            throw new Error('No valid tasks found in bulk input')
        }

        return lines.map((line) => {
            // Check if line looks like JSON object
            if (line.startsWith('{') && line.endsWith('}')) {
                try {
                    return parseTaskInput(JSON.parse(line))
                } catch {
                    // Treat as plain text if JSON parsing fails
                    return parseTaskInput(line)
                }
            }
            return parseTaskInput(line)
        })
    }

    // Process input based on current mode
    const processInput = async () => {
        if (!isValidInput.value) {
            throw new Error('Invalid input')
        }

        isProcessing.value = true

        try {
            let result

            switch (inputMode.value) {
                case 'simple':
                    result = parseTaskInput(inputValue.value)
                    lastProcessedInput.value = { type: 'simple', value: inputValue.value }
                    break

                case 'advanced':
                    result = parseTaskInput(advancedInput.value)
                    lastProcessedInput.value = {
                        type: 'advanced',
                        value: { ...advancedInput.value },
                    }
                    break

                case 'bulk':
                    result = parseBulkInput(bulkInput.value)
                    lastProcessedInput.value = { type: 'bulk', value: bulkInput.value }
                    break

                default:
                    throw new Error('Invalid input mode')
            }

            return result
        } finally {
            isProcessing.value = false
        }
    }

    // Clear input based on mode
    const clearInput = () => {
        switch (inputMode.value) {
            case 'simple':
                inputValue.value = ''
                break
            case 'advanced':
                advancedInput.value = {
                    title: '',
                    priority: 'medium',
                    category: 'general',
                }
                break
            case 'bulk':
                bulkInput.value = ''
                break
        }
    }

    // Set input mode and clear current input
    const setInputMode = (mode) => {
        if (['simple', 'advanced', 'bulk'].includes(mode)) {
            inputMode.value = mode
            clearInput()
        }
    }

    // Preset input examples for demonstration
    const loadExample = (exampleType) => {
        switch (exampleType) {
            case 'simple':
                setInputMode('simple')
                inputValue.value = 'Review project documentation'
                break

            case 'advanced':
                setInputMode('advanced')
                advancedInput.value = {
                    title: 'Implement user authentication',
                    priority: 'high',
                    category: 'development',
                }
                break

            case 'bulk-text':
                setInputMode('bulk')
                bulkInput.value = `Setup development environment
Write unit tests
Deploy to staging
Review code changes`
                break

            case 'bulk-json':
                setInputMode('bulk')
                bulkInput.value = `[
  {"title": "Design database schema", "priority": "high", "category": "database"},
  {"title": "Create API endpoints", "priority": "medium", "category": "backend"},
  {"title": "Build user interface", "priority": "medium", "category": "frontend"}
]`
                break

            case 'bulk-mixed':
                setInputMode('bulk')
                bulkInput.value = `Quick task
{"title": "Complex task", "priority": "high", "category": "important"}
Another simple task`
                break
        }
    }

    // Get current input summary
    const inputSummary = computed(() => {
        switch (inputMode.value) {
            case 'simple':
                return {
                    mode: 'Simple Text',
                    preview: inputValue.value || 'Enter task title...',
                    valid: isValidInput.value,
                }
            case 'advanced':
                return {
                    mode: 'Advanced Object',
                    preview: advancedInput.value.title || 'Enter task details...',
                    valid: isValidInput.value,
                    details: {
                        priority: advancedInput.value.priority,
                        category: advancedInput.value.category,
                    },
                }
            case 'bulk':
                const lines = bulkInput.value.split('\n').filter((line) => line.trim())
                return {
                    mode: 'Bulk Input',
                    preview: `${lines.length} task(s)`,
                    valid: isValidInput.value,
                    details: {
                        taskCount: lines.length,
                    },
                }
            default:
                return {
                    mode: 'Unknown',
                    preview: '',
                    valid: false,
                }
        }
    })

    return {
        // Input state
        inputValue,
        inputMode,
        advancedInput,
        bulkInput,
        isProcessing,
        lastProcessedInput,

        // Computed
        isValidInput,
        inputSummary,

        // Methods
        parseTaskInput,
        parseBulkInput,
        processInput,
        clearInput,
        setInputMode,
        loadExample,
    }
}
