export default {
    template: `
    <div class="container mt-4">
        <!-- Add Category Card -->
        <div class="card shadow-sm mb-3">
            <div class="card-header text-center">
                <h5>Add New Category</h5>
            </div>
            <div class="card-body">
                <form @submit.prevent="submitCategory">
                    <div class="mb-2">
                        <label for="categoryName" class="form-label">Category Name</label>
                        <input 
                            type="text" 
                            id="categoryName" 
                            v-model="category" 
                            class="form-control" 
                            placeholder="Enter category name" 
                            required
                        />
                    </div>
                    <div class="mb-2">
                        <label for="tags" class="form-label">Tags</label>
                        <input 
                            type="text" 
                            id="tags" 
                            v-model="tags" 
                            class="form-control" 
                            placeholder="Enter tags (comma-separated)" 
                        />
                    </div>
                    <div class="mb-2">
                        <label for="description" class="form-label">Description</label>
                        <textarea 
                            id="description" 
                            v-model="desc" 
                            class="form-control" 
                            placeholder="Enter a brief description" 
                            rows="2"
                        ></textarea>
                    </div>
                    <div class="text-center">
                        <button type="submit" class="btn btn-sm btn-primary w-100">Add Category</button>
                    </div>
                </form>
            </div>
        </div>
        <button @click="create_csv"> Export Category Data </button>

        <!-- Existing Categories Scrollable Section -->
        <div class="card shadow-sm">
            <div class="card-header text-center">
                <h5>Existing Categories</h5>
            </div>
            <div class="card-body p-2" style="max-height: 300px; overflow-y: auto;">
                <div v-if="categories.length === 0" class="text-center text-muted">
                    <p>No categories available.</p>
                </div>
                <div v-else>
                    <div 
                        v-for="cat in categories" 
                        :key="cat.id" 
                        class="card mb-2"
                    >
                        <div class="card-body p-2">
                            <h6 class="card-title mb-1">{{ cat.name }}</h6>
                            <p class="card-text mb-1"><small>{{ cat.tags || "No tags" }}</small></p>
                            <p class="card-text text-muted"><small>{{ cat.description || "No description" }}</small></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            category: null,
            tags: null,
            desc: null,
            role: '',
            categories: [], // To store the fetched categories
        };
    },
    methods: {
        async fetchCategories() {
            const res = await fetch(location.origin + '/api/categories', {
                method: 'GET',
                headers: { 'Authentication-Token' : this.$store.state.auth_token },
            });
            if (res.ok) {
                this.categories = await res.json(); // Update the categories list
            } else {
                console.error('Failed to fetch categories');
            }
        },
        async submitCategory() {
            const res = await fetch(location.origin + '/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json',  'Authentication-Token' : this.$store.state.auth_token },
                body: JSON.stringify({
                    category: this.category,
                    tags: this.tags,
                    desc: this.desc,
                    role: this.role,
                }),
            });
            if (res.ok) {
                console.log('New Category Added to Application');
                await this.fetchCategories(); // Refresh the list of categories
                this.category = this.tags = this.desc = this.role = ''; // Reset form inputs
            } else {
                console.error('Failed to add category');
            }
        },
        async create_csv(){
            const res = await fetch(location.origin + '/create-csv', {
                headers : {
                    'Authentication-Token' : this.$store.state.auth_token
                }
            })
            const task_id = (await res.json()).task_id

            const interval = setInterval(async() => {
                const res = await fetch(`${location.origin}/get-csv/${task_id}` )
                if (res.ok){
                    console.log('data is ready')
                    window.open(`${location.origin}/get-csv/${task_id}`)
                    clearInterval(interval)
                }

            }, 100)
            
        }
    },
    mounted() {
        this.fetchCategories(); // Fetch categories when the component loads
    },
};
