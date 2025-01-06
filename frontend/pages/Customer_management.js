export default {
    template: `
    <div class="container mt-5">
        <div class="card shadow-sm">
            <div class="card-header text-center">
                <h3>Customer Management</h3>
            </div>
            <div class="card-body">
                <div v-if="customers.length === 0" class="text-center">
                    <p>No customers found.</p>
                </div>
                <div v-else>
                    <div class="mb-3">
                        <label class="form-label">Search Customers</label>
                        <input 
                            type="text" 
                            v-model="searchQuery" 
                            class="form-control" 
                            placeholder="Search by name or email" 
                        />
                    </div>
                    <div style="max-height: 500px; overflow-y: auto;">
                        <ul class="list-group">
                            <li 
                                v-for="customer in filteredCustomers" 
                                :key="customer.id" 
                                class="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <strong> {{customer.id}}</strong>
                                    <strong>{{ customer.name }}</strong> - 
                                    <small>{{ customer.email }}</small>
                                    <p>Phone: {{ customer.phone }}</p>
                                    <p>Address: {{ customer.address }}</p>
                                    <span 
                                        :class="customer.active ? 'text-success' : 'text-danger'"
                                    >
                                        {{ customer.active ? 'Active' : 'Blocked' }}
                                    </span>
                                </div>
                                <button 
                                    class="btn btn-sm" 
                                    :class="customer.active ? 'btn-danger' : 'btn-success'"
                                    @click="toggleActiveStatus(customer)"
                                >
                                    {{ customer.active ? 'Block' : 'Unblock' }}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            customers: [], // All customers fetched from the backend
            searchQuery: '', // For filtering customers
        };
    },
    computed: {
        filteredCustomers() {
            const query = this.searchQuery.toLowerCase();
            return this.customers
                .filter(c => 
                    c.name.toLowerCase().includes(query) || 
                    c.email.toLowerCase().includes(query)
                )
                .sort((a, b) => a.active - b.active); // Blocked first
        },
    },
    methods: {
        async fetchCustomers() {
            try {
                const res = await fetch(`${location.origin}/api/customers`, {
                    method: 'GET',
                    headers: { 'Authentication-Token': this.$store.state.auth_token },
                });
                if (res.ok) {
                    this.customers = await res.json();
                } else {
                    console.error('Failed to fetch customers');
                }
            } catch (error) {
                console.error('Error fetching customers:', error);
            }
        },
        async toggleActiveStatus(customer) {
            try {
                const res = await fetch(`${location.origin}/api/customer/${customer.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                    body: JSON.stringify({ active: !customer.active }), // Correct key
                });
                if (res.ok) {
                    customer.active = !customer.active; // Update local state
                } else {
                    const error = await res.json();
                    console.error('Failed to update customer status:', error);
                }
            } catch (error) {
                console.error('Error updating customer status:', error);
            }
        },
    },
    mounted() {
        this.fetchCustomers();
    },
};
