export default {
    template: `
      <div class="dashboard-container">
          <h2>Your Service History</h2>
          
          <div class="history-list">
              <ul class="scrollable-list">
                  <li v-for="entry in history" :key="entry.id">
                      <strong>Service:</strong> {{ entry.service_name }} <br>
                      <strong>Category:</strong> {{ entry.category_name }} <br>
                      <strong>Customer:</strong> {{ entry.customer_name }} <br>
                      <strong>Professional:</strong> {{ entry.pro_name }} <br>
                      <strong>Completion Date:</strong> {{ entry.date_of_completion }} <br>
                  </li>
              </ul>
          </div>
          <button @click="history_csv"> Export History </button>
      </div>
    `,
    data() {
      return {
        history: [], // Store history data
      };
    },
    methods: {
      async fetchHistory() {
        try {
          const res = await fetch('/api/history', {
            method: 'GET',
            headers: { 'Authentication-Token': this.$store.state.auth_token },
          });
          if (res.ok) {
            this.history = await res.json();
          } else {
            console.error("Failed to fetch history");
            alert("Error fetching history.");
          }
        } catch (error) {
          console.error("Network error:", error);
          alert("Unable to fetch history. Please try again later.");
        }
      },
      async history_csv(){
        const res = await fetch(location.origin + '/history-csv', {
            headers : {
                'Authentication-Token' : this.$store.state.auth_token
            }
        })
        const task_id = (await res.json()).task_id

        const interval = setInterval(async() => {
            const res = await fetch(`${location.origin}/get-history/${task_id}` )
            if (res.ok){
                console.log('data is ready')
                window.open(`${location.origin}/get-history/${task_id}`)
                clearInterval(interval)
            }

        }, 100)
        
    }
    },
    mounted() {
      this.fetchHistory(); // Fetch history when the component is mounted
    },
  };
  