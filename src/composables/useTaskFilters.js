import { ref, computed, watch, onBeforeUnmount } from 'vue'

/**
 * Options Object Pattern - Flexible Configuration
 * This composable accepts an options object to configure filtering behavior
 * making it highly customizable and maintainable
 */
export function useTaskFilters(tasks, options = {}) {
    // Default configuration
    const defaultOptions = {
        // Filter options
        enableSearch: true,
        enableStatusFilter: true,
        enablePriorityFilter: true,
        enableCategoryFilter: true,

        // Search configuration
        searchFields: ['title', 'category'],
        searchCaseSensitive: false,
        searchMinLength: 1,

        // Sorting options
        defaultSortBy: 'createdAt',
        defaultSortOrder: 'desc',
        enableSorting: true,

        // Performance options
        debounceMs: 300,
        enableDebounce: true,

        // UI options
        showFilterCount: true,
        persistFilters: false,
        storageKey: 'taskFilters',

        // Callbacks
        onFilterChange: null,
        onSearchChange: null,
    }

    // Merge user options with defaults
    const config = { ...defaultOptions, ...options }

    // Filter state
    const searchQuery = ref('')
    const statusFilter = ref('all') // 'all', 'completed', 'pending'
    const priorityFilter = ref('all') // 'all', 'high', 'medium', 'low'
    const categoryFilter = ref('all') // 'all', or specific category
    const sortBy = ref(config.defaultSortBy)
    const sortOrder = ref(config.defaultSortOrder) // 'asc', 'desc'

    // Debounced search query
    const debouncedSearchQuery = ref('')
    let searchTimeout = null

    // Load persisted filters if enabled
    if (config.persistFilters) {
        try {
            const stored = JSON.parse(localStorage.getItem(config.storageKey) || '{}')
            if (stored.searchQuery !== undefined) searchQuery.value = stored.searchQuery
            if (stored.statusFilter !== undefined) statusFilter.value = stored.statusFilter
            if (stored.priorityFilter !== undefined) priorityFilter.value = stored.priorityFilter
            if (stored.categoryFilter !== undefined) categoryFilter.value = stored.categoryFilter
            if (stored.sortBy !== undefined) sortBy.value = stored.sortBy
            if (stored.sortOrder !== undefined) sortOrder.value = stored.sortOrder
            // Initialize debounced search with persisted value
            debouncedSearchQuery.value = searchQuery.value
        } catch (error) {
            console.warn('Failed to load persisted filters:', error)
        }
    }

    // Watch search query for debouncing
    const scheduleDebounce = (newQuery) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        if (config.enableDebounce) {
            searchTimeout = setTimeout(() => {
                debouncedSearchQuery.value = newQuery
                config.onSearchChange?.(newQuery)
            }, config.debounceMs)
        } else {
            debouncedSearchQuery.value = newQuery
            config.onSearchChange?.(newQuery)
        }
    }

    watch(searchQuery, scheduleDebounce)

    // Cleanup timeout on unmount
    onBeforeUnmount(() => {
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }
    })

    // Get unique values for filter options
    const availableCategories = computed(() => {
        if (!config.enableCategoryFilter) return []
        try {
            const categories = [
                ...new Set(
                    tasks.value.map((task) => task.category).filter((category) => category != null),
                ),
            ]
            return categories.sort()
        } catch (error) {
            console.warn('Error computing available categories:', error)
            return []
        }
    })

    const availablePriorities = computed(() => {
        if (!config.enablePriorityFilter) return []
        return ['high', 'medium', 'low']
    })

    // Main filtering logic
    const filteredTasks = computed(() => {
        try {
            let result = [...tasks.value]

            // Search filter
            if (
                config.enableSearch &&
                debouncedSearchQuery.value.length >= config.searchMinLength
            ) {
                const query = config.searchCaseSensitive
                    ? debouncedSearchQuery.value
                    : debouncedSearchQuery.value.toLowerCase()

                result = result.filter((task) => {
                    return config.searchFields.some((field) => {
                        try {
                            const rawValue = task[field]
                            if (rawValue == null) return false

                            const fieldValue = config.searchCaseSensitive
                                ? String(rawValue)
                                : String(rawValue).toLowerCase()
                            return fieldValue.includes(query)
                        } catch (error) {
                            console.warn(`Error processing search field "${field}":`, error)
                            return false
                        }
                    })
                })
            }

            // Status filter
            if (config.enableStatusFilter && statusFilter.value !== 'all') {
                result = result.filter((task) => {
                    if (statusFilter.value === 'completed') return task.completed
                    if (statusFilter.value === 'pending') return !task.completed
                    return true
                })
            }

            // Priority filter
            if (config.enablePriorityFilter && priorityFilter.value !== 'all') {
                result = result.filter((task) => task.priority === priorityFilter.value)
            }

            // Category filter
            if (config.enableCategoryFilter && categoryFilter.value !== 'all') {
                result = result.filter((task) => task.category === categoryFilter.value)
            }

            // Sorting
            if (config.enableSorting && sortBy.value) {
                result.sort((a, b) => {
                    let aValue = a[sortBy.value]
                    let bValue = b[sortBy.value]

                    // Handle null/undefined values first
                    if (aValue == null && bValue == null) return 0
                    if (aValue == null) return 1
                    if (bValue == null) return -1

                    // Store original types for comparison
                    const aType = typeof aValue
                    const bType = typeof bValue

                    // Handle different data types safely
                    if (aType === 'string' || bType === 'string') {
                        // Convert both to strings and lowercase for consistent comparison
                        aValue = String(aValue).toLowerCase()
                        bValue = String(bValue).toLowerCase()
                    } else if (aType === 'boolean' || bType === 'boolean') {
                        // Convert booleans to numbers
                        aValue = aValue ? 1 : 0
                        bValue = bValue ? 1 : 0
                    } else if (aType === 'number' && bType === 'number') {
                        // Numbers can be compared directly
                        // No conversion needed
                    } else {
                        // For any other types, convert to strings
                        aValue = String(aValue).toLowerCase()
                        bValue = String(bValue).toLowerCase()
                    }

                    let comparison = 0
                    if (aValue > bValue) comparison = 1
                    if (aValue < bValue) comparison = -1

                    return sortOrder.value === 'desc' ? -comparison : comparison
                })
            }

            return result
        } catch (error) {
            console.error('⚙️ Options Object Pattern: Error in filteredTasks computation:', error)
            // Return original tasks as fallback
            return [...tasks.value]
        }
    })

    // Filter statistics
    const filterStats = computed(() => {
        if (!config.showFilterCount) return null

        return {
            total: tasks.value.length,
            filtered: filteredTasks.value.length,
            hidden: tasks.value.length - filteredTasks.value.length,
            hasActiveFilters: hasActiveFilters.value,
        }
    })

    // Check if any filters are active
    const hasActiveFilters = computed(() => {
        return (
            (config.enableSearch && debouncedSearchQuery.value.length >= config.searchMinLength) ||
            (config.enableStatusFilter && statusFilter.value !== 'all') ||
            (config.enablePriorityFilter && priorityFilter.value !== 'all') ||
            (config.enableCategoryFilter && categoryFilter.value !== 'all')
        )
    })

    // Watch for filter changes and persist if enabled
    watch(
        [searchQuery, statusFilter, priorityFilter, categoryFilter, sortBy, sortOrder],
        ([search, status, priority, category, sortByVal, sortOrderVal]) => {
            // Persist filters if enabled
            if (config.persistFilters) {
                try {
                    const filterState = {
                        searchQuery: search,
                        statusFilter: status,
                        priorityFilter: priority,
                        categoryFilter: category,
                        sortBy: sortByVal,
                        sortOrder: sortOrderVal,
                    }
                    localStorage.setItem(config.storageKey, JSON.stringify(filterState))
                } catch (error) {
                    console.warn('Failed to persist filters:', error)
                }
            }

            // Call external callback
            config.onFilterChange?.({
                search: debouncedSearchQuery.value,
                status,
                priority,
                category,
                sortBy: sortByVal,
                sortOrder: sortOrderVal,
            })
        },
    )

    // Filter actions
    const clearAllFilters = () => {
        searchQuery.value = ''
        debouncedSearchQuery.value = ''
        statusFilter.value = 'all'
        priorityFilter.value = 'all'
        categoryFilter.value = 'all'
        sortBy.value = config.defaultSortBy
        sortOrder.value = config.defaultSortOrder
    }

    const setFilter = (filterType, value) => {
        switch (filterType) {
            case 'search':
                searchQuery.value = value
                break
            case 'status':
                statusFilter.value = value
                break
            case 'priority':
                priorityFilter.value = value
                break
            case 'category':
                categoryFilter.value = value
                break
            case 'sortBy':
                sortBy.value = value
                break
            case 'sortOrder':
                sortOrder.value = value
                break
        }
    }

    const toggleSortOrder = () => {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
    }

    return {
        // Configuration
        config,

        // Filter state
        searchQuery,
        debouncedSearchQuery,
        statusFilter,
        priorityFilter,
        categoryFilter,
        sortBy,
        sortOrder,

        // Computed data
        filteredTasks,
        filterStats,
        hasActiveFilters,
        availableCategories,
        availablePriorities,

        // Actions
        clearAllFilters,
        setFilter,
        toggleSortOrder,
    }
}
