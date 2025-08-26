<template>
    <div class="task-filters">
        <div class="filters-header">
            <h3>Filter & Sort Tasks</h3>
            <div class="filter-stats" v-if="filters.filterStats.value">
                <span class="stat">
                    Showing {{ filters.filterStats.value.filtered }} of
                    {{ filters.filterStats.value.total }}
                </span>
                <button
                    v-if="filters.hasActiveFilters.value"
                    @click="filters.clearAllFilters"
                    class="clear-filters-btn"
                >
                    Clear All
                </button>
            </div>
        </div>

        <div class="filters-grid">
            <!-- Search Filter -->
            <div v-if="filters.config.enableSearch" class="filter-group">
                <label>Search Tasks:</label>
                <div class="search-input-wrapper">
                    <input
                        v-model="filters.searchQuery.value"
                        type="text"
                        placeholder="Search by title or category..."
                        class="search-input"
                    />
                    <span v-if="filters.debouncedSearchQuery.value" class="search-indicator">
                        🔍
                    </span>
                </div>
                <div class="filter-info">
                    Search in: {{ filters.config.searchFields.join(', ') }}
                    <span v-if="!filters.config.searchCaseSensitive">(case-insensitive)</span>
                </div>
            </div>

            <!-- Status Filter -->
            <div v-if="filters.config.enableStatusFilter" class="filter-group">
                <label>Status:</label>
                <select v-model="filters.statusFilter.value" class="filter-select">
                    <option value="all">All Tasks</option>
                    <option value="pending">Pending Only</option>
                    <option value="completed">Completed Only</option>
                </select>
            </div>

            <!-- Priority Filter -->
            <div v-if="filters.config.enablePriorityFilter" class="filter-group">
                <label>Priority:</label>
                <select v-model="filters.priorityFilter.value" class="filter-select">
                    <option value="all">All Priorities</option>
                    <option
                        v-for="priority in filters.availablePriorities.value"
                        :key="priority"
                        :value="priority"
                    >
                        {{ priority.charAt(0).toUpperCase() + priority.slice(1) }}
                    </option>
                </select>
            </div>

            <!-- Category Filter -->
            <div v-if="filters.config.enableCategoryFilter" class="filter-group">
                <label>Category:</label>
                <select v-model="filters.categoryFilter.value" class="filter-select">
                    <option value="all">All Categories</option>
                    <option
                        v-for="category in filters.availableCategories.value"
                        :key="category"
                        :value="category"
                    >
                        {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                    </option>
                </select>
            </div>

            <!-- Sorting -->
            <div v-if="filters.config.enableSorting" class="filter-group">
                <label>Sort By:</label>
                <div class="sort-controls">
                    <select v-model="filters.sortBy.value" class="filter-select">
                        <option value="title">Title</option>
                        <option value="priority">Priority</option>
                        <option value="category">Category</option>
                        <option value="completed">Status</option>
                        <option value="createdAt">Created Date</option>
                    </select>
                    <button @click="filters.toggleSortOrder" class="sort-order-btn">
                        {{ filters.sortOrder.value === 'asc' ? '↑' : '↓' }}
                    </button>
                </div>
                <div class="filter-info">
                    Order: {{ filters.sortOrder.value === 'asc' ? 'Ascending' : 'Descending' }}
                </div>
            </div>
        </div>

        <!-- Active Filters Summary -->
        <div v-if="filters.hasActiveFilters.value" class="active-filters">
            <h4>Active Filters:</h4>
            <div class="filter-tags">
                <span v-if="filters.debouncedSearchQuery.value" class="filter-tag">
                    Search: "{{ filters.debouncedSearchQuery.value }}"
                    <button @click="filters.setFilter('search', '')" class="remove-filter">
                        ×
                    </button>
                </span>
                <span v-if="filters.statusFilter.value !== 'all'" class="filter-tag">
                    Status: {{ filters.statusFilter.value }}
                    <button @click="filters.setFilter('status', 'all')" class="remove-filter">
                        ×
                    </button>
                </span>
                <span v-if="filters.priorityFilter.value !== 'all'" class="filter-tag">
                    Priority: {{ filters.priorityFilter.value }}
                    <button @click="filters.setFilter('priority', 'all')" class="remove-filter">
                        ×
                    </button>
                </span>
                <span v-if="filters.categoryFilter.value !== 'all'" class="filter-tag">
                    Category: {{ filters.categoryFilter.value }}
                    <button @click="filters.setFilter('category', 'all')" class="remove-filter">
                        ×
                    </button>
                </span>
            </div>
        </div>

        <!-- Configuration Display (for demonstration) -->
        <details class="config-details">
            <summary>Filter Configuration</summary>
            <div class="config-display">
                <div class="config-item">
                    <strong>Debounce:</strong> {{ filters.config.debounceMs }}ms ({{
                        filters.config.enableDebounce ? 'enabled' : 'disabled'
                    }})
                </div>
                <div class="config-item">
                    <strong>Search Fields:</strong> {{ filters.config.searchFields.join(', ') }}
                </div>
                <div class="config-item">
                    <strong>Min Search Length:</strong> {{ filters.config.searchMinLength }}
                </div>
                <div class="config-item">
                    <strong>Default Sort:</strong> {{ filters.config.defaultSortBy }} ({{
                        filters.config.defaultSortOrder
                    }})
                </div>
            </div>
        </details>
    </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
    filters: {
        type: Object,
        required: true,
    },
})

const { filters } = props
</script>

<style scoped>
.task-filters {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    border: 1px solid #e9ecef;
}

.filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.filters-header h3 {
    margin: 0;
    color: #2c3e50;
}

.filter-stats {
    display: flex;
    align-items: center;
    gap: 12px;
}

.stat {
    font-size: 14px;
    color: #6c757d;
    background: white;
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #dee2e6;
}

.clear-filters-btn {
    padding: 6px 12px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s;
}

.clear-filters-btn:hover {
    background: #c82333;
}

.filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
}

.filter-group {
    background: white;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #dee2e6;
}

.filter-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #495057;
    font-size: 14px;
}

.search-input-wrapper {
    position: relative;
}

.search-input {
    width: 90%;
    padding-left: 10px;
    padding-right: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.filter-select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
}

.search-input:focus,
.filter-select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-indicator {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
}

.sort-controls {
    display: flex;
    gap: 8px;
}

.sort-controls .filter-select {
    flex: 1;
}

.sort-order-btn {
    padding: 10px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: background-color 0.2s;
}

.sort-order-btn:hover {
    background: #0056b3;
}

.filter-info {
    margin-top: 6px;
    font-size: 12px;
    color: #6c757d;
    font-style: italic;
}

.active-filters {
    background: white;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #dee2e6;
    margin-bottom: 16px;
}

.active-filters h4 {
    margin: 0 0 12px 0;
    color: #495057;
    font-size: 14px;
}

.filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.filter-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #e3f2fd;
    color: #1565c0;
    padding: 4px 8px;
    border-radius: 16px;
    font-size: 12px;
    border: 1px solid #bbdefb;
}

.remove-filter {
    background: none;
    border: none;
    color: #1565c0;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    padding: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
}

.remove-filter:hover {
    background: rgba(21, 101, 192, 0.1);
}

.config-details {
    margin-top: 16px;
}

.config-details summary {
    cursor: pointer;
    font-weight: 600;
    color: #6c757d;
    font-size: 14px;
    padding: 8px 0;
}

.config-display {
    background: white;
    padding: 16px;
    border-radius: 6px;
    border: 1px solid #dee2e6;
    margin-top: 8px;
}

.config-item {
    margin-bottom: 8px;
    font-size: 13px;
    color: #495057;
}

.config-item:last-child {
    margin-bottom: 0;
}
</style>
