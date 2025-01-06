export default {
    template: `
      <div class="container mt-5">
          <h2 class="text-center text-warning mb-4">Pending Service Requests</h2>
          
          <div v-if="serviceRequests.length === 0" class="text-center text-muted">
              <p>No pending service requests.</p>
          </div>
  
          <div v-else>
              <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                  <div class="col" v-for="request in serviceRequests" :key="request.id">
                      <div class="card shadow-sm h-100">
                          <div class="card-body">
                              <h5 class="card-title text-primary">{{ request.service_name }}</h5>
                              <p class="card-text">
                                  <strong>Customer:</strong> {{ request.customer_name }}<br>
                                  <strong>Phone:</strong> {{ request.customer_phone }}<br>
                                  <strong>Address:</strong> {{ request.customer_address }}
                              </p>
                              <div class="d-grid">
                                  <button 
                                      class="btn btn-success"
                                      @click="acceptRequest(request.id)">
                                      Accept Request
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    `,
    data() {
      return {
        serviceRequests: [], // Store pending requests
      };
    },
    methods: {
      async fetchServiceRequests() {
        const res = await fetch('/api/service_requests', {
          method: 'GET',
          headers: { 'Authentication-Token': this.$store.state.auth_token },
        });
        if (res.ok) {
          this.serviceRequests = await res.json();
        } else {
          console.error("Failed to fetch service requests");
        }
      },
      async acceptRequest(requestId) {
        const res = await fetch(`/api/service_requests/${requestId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authentication-Token': this.$store.state.auth_token,
          },
          body: JSON.stringify({
            requestId: requestId
          }),
        });
        if (res.ok) {
          alert("Service request accepted!");
          this.fetchServiceRequests(); // Refresh the list
        } else {
          const error = await res.json();
          alert(`Error: ${error.error || "Unable to accept request"}`);
        }
      },
    },
    mounted() {
      this.fetchServiceRequests();
    },
  };
  