// dashboard.js

export default {
    data() {
      return {
        user: {}, // To store the user's details
      };
    },
    async mounted(){
    if (this.$store.state.loggedIn){
        const res = await fetch(location.origin + '/api/dashboard', {
            headers : {
                'Authentication-Token' : this.$store.state.auth_token
            }
        })

        this.user = await res.json()
    }
    else{
      console.alert("you're not logged in")
    }
  },
    template: `
    <div style="padding: 20px; max-width: 600px; margin: auto; text-align: center;">
    <h1>Welcome, {{ user.name }}</h1>
    <h2>Address : {{user.address}} <hr> phone : {{user.phone}}</h2>
    <div v-if="user.roles && user.roles.length">
      <p><strong>Role:</strong> {{ user.roles[0] }}</p>
    </div>
    <p v-else>No roles assigned.</p>
  </div>

    `,
    created() {
      // Ensure user details are available
      if (!this.$store.state.loggedIn) {
        this.$router.push("/login"); // Redirect if not logged in
      }
    },
  };
  