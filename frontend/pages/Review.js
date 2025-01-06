export default {
    template: `
      <div class="review-container">
          <h2>Rate Your Service</h2>
          <form @submit.prevent="submitReview">
              <div class="form-group">
                  <label for="rating">Rating (1-5):</label>
                  <input type="number" id="rating" v-model="rating" min="1" max="5" required />
              </div>
              <div class="form-group">
                  <label for="remarks">Remarks:</label>
                  <textarea id="remarks" v-model="remarks" rows="4" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Submit Review</button>
          </form>
      </div>
    `,
    data() {
      return {
        requestId: this.$route.params.requestId, // Getting the request ID from the route params
        rating: null,
        remarks: '',
      };
    },
    methods: {
      async submitReview() {
        try {
          const response = await fetch(`/api/service_requests/${this.requestId}/review`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authentication-Token': this.$store.state.auth_token,
            },
            body: JSON.stringify({
              rating: this.rating,
              remarks: this.remarks,
            }),
          });
  
          if (response.ok) {
            alert("Thank you for your review!");
            this.$router.push({ name: 'customer_dashboard' }); // Redirect to customer dashboard
          } else {
            const error = await response.json();
            alert(`Failed to submit review: ${error.message}`);
          }
        } catch (error) {
          console.error("Network error:", error);
          alert("Unable to submit review. Please try again later.");
        }
      },
    },
  };
  