# Vue 3 Design Patterns Demo

The Vue 3 Design Patterns demo is based on Michael Thiessen's <a href="https://michaelnthiessen.com/scaling-your-vue-app" target="_blank">Scaling Your Vue App: 4 Proven Patterns to Keep It Clean article</a>.

🏪 Data Store Pattern
The <u><code>taskStore</code></u> provides a single source of truth for all
task data. It uses Vue's <code>reactive()</code> to ensure all components
stay in sync when data changes. Check the browser console to see state
changes.

🧩 Thin Composables Pattern
The <u><code>useTasks()</code></u> wraps store operations with loading
states and error handling. <code>useTaskFilters()</code> handles all
filtering logic without UI concerns. This keeps components focused on
presentation.

⚙️ Options Object Pattern
The <u><code>useTaskFilters()</code></u> composable accepts an options
object with 15+ configuration properties. Try changing
<code>persistFilters: true</code> - your filters survive page reloads!
Debouncing, search fields, and callbacks are all configurable.

🔄 Flexible Arguments Pattern
The <u><code>useTaskInput</code></u> can parse strings, objects, arrays,
JSON, or mixed formats. Try the different input modes and examples to see
how the same composable handles completely different input types seamlessly.

## 🛠️ Getting Started

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Start development server:**

    ```bash
    npm run dev
    ```

3. **Build for production:**
    ```bash
    npm run build
    ```
