export default {
  template: `
    <div class="dashboard-container">
        <h2>My Service Requests</h2>
        
        <!-- Grid Container for 2 Sections (Accepted and Not Accepted) -->
        <div class="grid-container">
        
            <!-- Accepted Services -->
            <div class="service-list">
                <h3>Accepted Services</h3>
                <ul class="scrollable-list">
                    <li v-for="request in acceptedServices" :key="request.id">
                        <strong>Service:</strong> {{ request.service_name }} <br>
                        <strong>Status:</strong> {{ request.service_status }} <br>
                        <strong>Assigned Professional:</strong> 
                        <span v-if="request.professional">
                            {{ request.professional.name }}
                        </span>
                        <span v-else>Not Assigned</span> <br>
                        
                        <button 
                            v-if="request.service_status === 'assigned'" 
                            class="btn btn-primary" 
                            @click="closeService(request.id)">
                            Close Service
                        </button>
                    </li>
                </ul>
            </div>
            
            <!-- Not Accepted Services -->
            <div class="service-list">
                <h3>Not Accepted Services</h3>
                <ul class="scrollable-list">
                    <li v-for="request in notAcceptedServices" :key="request.id">
                        <strong>Service:</strong> {{ request.service_name }} <br>
                        <strong>Status:</strong> {{ request.service_status }} <br>
                        <strong>Assigned Professional:</strong> 
                        <span v-if="request.professional">
                            {{ request.professional.name }}
                        </span>
                        <span v-else>Not Assigned</span> <br>
                    </li>
                </ul>
            </div>
        </div>
    </div>
  `,
  data() {
    return {
      serviceRequests: [], // Store customer requests
    };
  },
  computed: {
    // Categorize services into two types: accepted and not accepted
    acceptedServices() {
      return this.serviceRequests.filter(request => request.service_status === 'assigned');
    },
    notAcceptedServices() {
      return this.serviceRequests.filter(request => request.service_status === 'requested');
    },
  },
  methods: {
    async fetchServiceRequests() {
      try {
        const res = await fetch('/api/customer_requests', {
          method: 'GET',
          headers: { 'Authentication-Token': this.$store.state.auth_token },
        });
        if (res.ok) {
          this.serviceRequests = await res.json();
        } else {
          console.error("Failed to fetch service requests");
          alert("Error fetching service requests.");
        }
      } catch (error) {
        console.error("Network error:", error);
        alert("Unable to fetch service requests. Please try again later.");
      }
    },
    async closeService(requestId) {
      const request = this.serviceRequests.find(req => req.id === requestId);
      if (!request) {
        alert("Service request not found!");
        return;
      }
      
      try {
        const res = await fetch(`/api/service_requests/${requestId}`, {
          method: 'PATCH', // Use PATCH method to update
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify({ action: "close" }), // Include close action
        });
      
        if (res.ok) {
          alert("Service closed successfully!");
          this.fetchServiceRequests(); // Refresh requests after closing
        } else {
          const error = await res.json();
          console.error("Backend error:", error);
          alert(`Failed to close service: ${error.message}`);
        }
      } catch (error) {
        console.error("Network error:", error);
        alert("Unable to close the service. Please try again later.");
      }
    },
  },
  mounted() {
    this.fetchServiceRequests();
  },
};
