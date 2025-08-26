<template>
    <div id="app">
        <!-- Header Section -->
        <header class="app-header">
            <h1>Vue 3 Design Patterns Demo</h1>
            <p class="subtitle">
                Comprehensive demonstration of Michael Thiessen's design patterns working together
            </p>

            <!-- Pattern Overview -->
            <div class="patterns-overview">
                <div class="pattern-card">
                    <h3>🏪 Data Store Pattern</h3>
                    <!-- <p>Centralized reactive state management</p> -->
                    <p>
                        The <u><code>taskStore</code></u> provides a single source of truth for all
                        task data. It uses Vue's <code>reactive()</code> to ensure all components
                        stay in sync when data changes. Check the browser console to see state
                        changes.
                    </p>
                </div>
                <div class="pattern-card">
                    <h3>🧩 Thin Composables</h3>
                    <!-- <p>Clean separation of logic from UI</p> -->
                    <p>
                        The <u><code>useTasks()</code></u> wraps store operations with loading
                        states and error handling. <code>useTaskFilters()</code> handles all
                        filtering logic without UI concerns. This keeps components focused on
                        presentation.
                    </p>
                </div>
                <div class="pattern-card">
                    <h3>⚙️ Options Object</h3>
                    <!-- <p>Flexible composable configuration</p> -->
                    <p>
                        The <u><code>useTaskFilters()</code></u> composable accepts an options
                        object with 15+ configuration properties. Try changing
                        <code>persistFilters: true</code> - your filters survive page reloads!
                        Debouncing, search fields, and callbacks are all configurable.
                    </p>
                </div>
                <div class="pattern-card">
                    <h3>🔄 Flexible Arguments</h3>
                    <!-- <p>Handle different input types gracefully</p> -->
                    <p>
                        The <u><code>useTaskInput</code></u> can parse strings, objects, arrays,
                        JSON, or mixed formats. Try the different input modes and examples to see
                        how the same composable handles completely different input types seamlessly.
                    </p>
                </div>
            </div>
        </header>

        <!-- Global Error Display -->
        <div v-if="error" class="global-error">
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">{{ error }}</span>
                <button @click="clearError" class="error-dismiss">×</button>
            </div>
        </div>

        <!-- Main Content -->
        <main class="app-main">
            <!-- Task Form - Demonstrates Flexible Arguments Pattern -->
            <section class="demo-section">
                <TaskForm />
            </section>

            <!-- Task Filters - Demonstrates Options Object Pattern -->
            <section class="demo-section">
                <TaskFilters :filters="taskFilters" />
            </section>

            <!-- Task List - Demonstrates Data Store + Thin Composables -->
            <section class="demo-section">
                <TaskList
                    :filteredTasks="taskFilters.filteredTasks.value"
                    :hasActiveFilters="taskFilters.hasActiveFilters.value"
                />
            </section>
        </main>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTasks } from './composables/useTasks.js'
import { useTaskFilters } from './composables/useTaskFilters.js'

import TaskForm from './components/TaskForm.vue'
import TaskFilters from './components/TaskFilters.vue'
import TaskList from './components/TaskList.vue'

// Data Store Pattern + Thin Composables Pattern
// Get reactive tasks data and actions from the centralized store
const { tasks, error, clearError } = useTasks()

// Options Object Pattern + Flexible Configuration
// Configure the filter composable with custom options
const taskFilters = useTaskFilters(tasks, {
    persistFilters: true,
    debounceMs: 250,
    defaultSortBy: 'createdAt',
    defaultSortOrder: 'desc',
    storageKey: 'vue-patterns-demo-filters',
    onFilterChange(filterState) {
        console.log('🔍 Filter state changed:', filterState)
    },
    onSearchChange(searchQuery) {
        console.log('🔎 Search query changed:', searchQuery)
    },
})

// Computed properties for demo statistics
const demoStats = computed(() => ({
    totalTasks: tasks.value.length,
    filteredTasks: taskFilters.filteredTasks.value.length,
    activeFilters: taskFilters.hasActiveFilters.value,
    categories: taskFilters.availableCategories.value.length,
    priorities: taskFilters.availablePriorities.value.length,
}))
</script>

<style scoped>
#app {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    font-family:
        system-ui,
        -apple-system,
        sans-serif;
}

/* Header Styles */
.app-header {
    text-align: center;
    margin-bottom: 3rem;
}

.app-header h1 {
    font-size: 2.5rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.subtitle {
    font-size: 1.1rem;
    color: #6c757d;
    margin-bottom: 2rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

/* Pattern Overview Cards */
.patterns-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.pattern-card {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid #dee2e6;
    transition:
        transform 0.2s,
        box-shadow 0.2s;
}

.pattern-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.pattern-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    color: #495057;
}

.pattern-card p {
    margin: 0;
    font-size: 0.9rem;
    color: #6c757d;
}

/* Demo Statistics */
.demo-stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 1.5rem;
    flex-wrap: wrap;
}

.stat {
    text-align: center;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    min-width: 80px;
}

.stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #007bff;
}

.stat-label {
    display: block;
    font-size: 0.8rem;
    color: #6c757d;
    margin-top: 0.25rem;
}

/* Global Error */
.global-error {
    margin-bottom: 2rem;
}

.error-content {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #f5c6cb;
}

.error-icon {
    font-size: 1.2rem;
}

.error-message {
    flex: 1;
}

.error-dismiss {
    background: none;
    border: none;
    color: #721c24;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: background-color 0.2s;
}

.error-dismiss:hover {
    background: rgba(114, 28, 36, 0.1);
}

/* Main Content */
.app-main {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.demo-section {
    width: 100%;
}

/* Footer */
.app-footer {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 2px solid #e9ecef;
}

.pattern-explanations {
    display: grid;
    gap: 1rem;
}

.pattern-detail {
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.pattern-detail summary {
    padding: 1rem;
    cursor: pointer;
    font-weight: 600;
    color: #495057;
    transition: background-color 0.2s;
}

.pattern-detail summary:hover {
    background: #e9ecef;
}

.pattern-detail p {
    padding: 0 1rem 1rem 1rem;
    margin: 0;
    color: #6c757d;
    line-height: 1.6;
}

.pattern-detail code {
    background: #e9ecef;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    color: #495057;
}

/* Responsive Design */
@media (max-width: 768px) {
    #app {
        padding: 1rem 0.5rem;
    }

    .app-header h1 {
        font-size: 2rem;
    }

    .patterns-overview {
        grid-template-columns: 1fr;
    }

    .demo-stats {
        gap: 1rem;
    }

    .stat {
        min-width: 60px;
        padding: 0.75rem;
    }
}
</style>
