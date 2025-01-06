export default {
    template: `
    <div class="container mt-5">
        <div class="card shadow-sm">
            <div class="card-header text-center">
                <h3>Professional Verification</h3>
            </div>
            <div class="card-body">
                <div v-if="professionals.length === 0" class="text-center">
                    <p>No professionals found.</p>
                </div>
                <div v-else>
                    <div class="mb-3">
                        <label class="form-label">Search Professionals</label>
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
                                v-for="professional in filteredProfessionals" 
                                :key="professional.id" 
                                class="list-group-item d-flex justify-content-between align-items-center"
                            >
                                <div>
                                    <strong>{{ professional.name }}</strong> - 
                                    <small>{{ professional.email }}</small>
                                    <p>Rating:{{professional.rating}}</p>
                                    <span 
                                        :class="professional.is_verified ? 'text-success' : 'text-danger'"
                                    >
                                        {{ professional.is_verified ? 'Verified' : 'Unverified' }}
                                    </span>
                                </div>
                                <button 
                                    class="btn btn-sm" 
                                    :class="professional.is_verified ? 'btn-danger' : 'btn-success'"
                                    @click="toggleVerification(professional)"
                                >
                                    {{ professional.is_verified ? 'Unverify' : 'Verify' }}
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
            professionals: [], // All professionals fetched from the backend
            searchQuery: '', // For filtering professionals
        };
    },
    computed: {
        filteredProfessionals() {
            const query = this.searchQuery.toLowerCase();
            return this.professionals
                .filter(p => 
                    p.name.toLowerCase().includes(query) || 
                    p.email.toLowerCase().includes(query)
                )
                .sort((a, b) => a.is_verified - b.is_verified); // Unverified first
        },
    },
    methods: {
        async fetchProfessionals() {
            try {
                const res = await fetch(location.origin + '/api/professionals', {
                    method: 'GET',
                    headers: { 'Authentication-Token': this.$store.state.auth_token },
                });
                if (res.ok) {
                    this.professionals = await res.json();
                } else {
                    console.error('Failed to fetch professionals');
                }
            } catch (error) {
                console.error('Error fetching professionals:', error);
            }
        },
        async toggleVerification(professional) {
            try {
                const res = await fetch(location.origin + '/api/professionals/' + professional.id, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': this.$store.state.auth_token,
                    },
                    body: JSON.stringify({ is_verified: !professional.is_verified }),
                });
                if (res.ok) {
                    // Update local state
                    professional.is_verified = !professional.is_verified;
                } else {
                    console.error('Failed to update verification status');
                }
            } catch (error) {
                console.error('Error updating verification status:', error);
            }
        },
    },
    mounted() {
        this.fetchProfessionals();
    },
};
