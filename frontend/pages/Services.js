export default {
    template: `
    <div class="container mt-4">
        <h2>Discover Services</h2>

        <!-- Search and Filters -->
        <div class="row mb-3">
            <div class="col-md-6">
                <input
                    type="text"
                    class="form-control"
                    placeholder="Search services by name or tags"
                    v-model="searchQuery"
                    @input="fetchServices"
                />
            </div>
            <div class="col-md-4">
                <select class="form-select" v-model="selectedCategory" @change="fetchServices">
                    <option value="">All Categories</option>
                    <option v-for="category in categories" :value="category.id">{{ category.name }}</option>
                </select>
            </div>
        </div>

        <!-- Service List -->
        <div class="row">
            <div
                v-for="service in filteredServices"
                :key="service.id"
                class="col-md-4 mb-3"
            >
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">{{ service.name }}</h5>
                        <p class="card-text">
                        <strong>Price:</strong> {{ service.price }} mins<br />
                        <strong>Time Required:</strong> {{ service.time_required }} mins<br />
                            <strong>Description:</strong> {{ service.description }}
                        </p>
                        <button class="btn btn-primary" @click="requestService(service.id)">
                            Request Service
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            services: [],
            categories: [],
            searchQuery: '',
            selectedCategory: '',
        };
    },
    computed: {
        filteredServices() {
            return this.services.filter((service) => {
                const matchesQuery =
                    this.searchQuery === '' ||
                    service.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    service.description.toLowerCase().includes(this.searchQuery.toLowerCase());

                const matchesCategory =
                    this.selectedCategory === '' || service.category.id == this.selectedCategory;

                return matchesQuery && matchesCategory;
            });
        },
    },
    methods: {
        async fetchServices() {
            const res = await fetch('/api/services');
            if (res.ok) {
                this.services = await res.json();
            }
        },
        async fetchCategories() {
            const res = await fetch('/api/categories');
            if (res.ok) {
                this.categories = await res.json();
            }
        },
        async requestService(serviceId) {
            const res = await fetch('/api/service_requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.$store.state.auth_token,
                },
                body: JSON.stringify({
                    service_id: serviceId,
                }),
            });
            if (res.ok) {
                alert('Service requested successfully!');
                this.$router.push('/custmor_dashboard');
            } else {
                alert('Failed to request the service.');
            }
        },
    },
    mounted() {
        this.fetchServices();
        this.fetchCategories();
    },
};
