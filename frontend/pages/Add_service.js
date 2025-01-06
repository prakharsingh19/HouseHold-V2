export default {
    template: `
    <div class="container">
        <div class="row mt-4">
            <div class="col-md-6">
                <input
                    type="text"
                    class="form-control"
                    placeholder="Search services by name or description"
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

        <div class="row mt-4">
            <div
                v-for="service in filteredServices"
                :key="service.id"
                class="col-md-4 mb-3"
            >
                <div class="card h-100">
                    <div class="card-body"style="background-color: #c2cad0; color: black;">
                        <h5 class="card-title">{{ service.name }}</h5>
                        <p class="card-text">
                            <strong>Price:</strong> {{ service.price }}<br />
                            <strong>Time Required:</strong> {{ service.time_required }} mins<br />
                            <strong>Description:</strong> {{ service.description }}
                        </p>
                        <button class="btn btn-secondary" @click="editService(service.id)">Edit</button>
                        <button class="btn btn-danger" @click="deleteService(service.id)">Delete</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Form for adding or editing services -->
        <div class="card mt-4"style="background-color: #c2cad0; color: black;">
            <div class="card-header">
                <h3>{{ editingServiceId ? 'Edit Service' : 'Add New Service' }}</h3>
            </div>
            <div class="card-body">
                <form @submit.prevent="submitService">
                    <div class="mb-3">
                        <label for="name">Service Name</label>
                        <input v-model="name" id="name" class="form-control" required />
                    </div>
                    <div class="mb-3">
                        <label for="price">Base Price</label>
                        <input v-model="price" id="price" type="number" class="form-control" required />
                    </div>
                    <div class="mb-3">
                        <label for="time_required">Time Required (mins)</label>
                        <input v-model="time_required" id="time_required" type="number" class="form-control" required />
                    </div>
                    <div class="mb-3">
                        <label for="description">Description</label>
                        <textarea v-model="description" id="description" class="form-control"></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="category">Category</label>
                        <select v-model="category_id" id="category" class="form-select" required>
                            <option v-for="category in categories" :value="category.id">{{ category.name }}</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" style="background-color: #116466; color: white;" type="submit">{{ editingServiceId ? 'Update Service' : 'Add Service' }}</button>
                </form>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            services: [],
            categories: [],
            searchQuery: '',
            selectedCategory: '', // Holds the selected category ID
            name: '',
            price: '',
            time_required: '',
            description: '',
            category_id: '',
            editingServiceId: null, // To store the ID of the service being edited
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
        async submitService() {
            const method = this.editingServiceId ? 'PUT' : 'POST';
            const url = this.editingServiceId ? `/api/services/${this.editingServiceId}` : '/api/services';
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-Token': this.$store.state.auth_token,
                },
                body: JSON.stringify({
                    name: this.name,
                    price: this.price,
                    time_required: this.time_required,
                    description: this.description,
                    category_id: this.category_id,
                }),
            });
            if (res.ok) {
                alert(this.editingServiceId ? 'Service updated successfully' : 'Service added successfully');
                this.resetForm();
                this.fetchServices(); // Refresh the service list
            } else {
                alert('Failed to save service');
            }
        },
        resetForm() {
            this.name = '';
            this.price = '';
            this.time_required = '';
            this.description = '';
            this.category_id = '';
            this.editingServiceId = null;
        },
        editService(serviceId) {
            const service = this.services.find(s => s.id === serviceId);
            if (service) {
                this.name = service.name;
                this.price = service.price;
                this.time_required = service.time_required;
                this.description = service.description;
                this.category_id = service.category.id;
                this.editingServiceId = service.id;
            }
        },
        async deleteService(serviceId) {
            if (confirm('Are you sure you want to delete this service?')) {
                const res = await fetch(`/api/services/${serviceId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                });
                if (res.ok) {
                    alert('Service deleted successfully');
                    this.fetchServices(); // Refresh the service list
                } else {
                    alert('Failed to delete service');
                }
            }
        },
    },
    mounted() {
        this.fetchServices();
        this.fetchCategories();
    },
};
