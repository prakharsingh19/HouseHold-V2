export default {
  template: `
    <div
    style="height: 100vh; display: flex; justify-content: center; align-items: center; background-size: cover; background-position: center; background-color: #f5f5f5; background-image: url('/static/images/image.jpg');">
    <!-- Content for not logged in users -->
    <div v-if="!$store.state.loggedIn"
      style="background-color: #003135; padding: 40px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); width: 400px; text-align: center; color: white;">
      <h2>Welcome to AtoZ Service</h2>
      <p></p>

      <button @click="registerUser"
        style="background-color: #024950; border: none; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; cursor: pointer; width: 100%;">
        Register as Customer
      </button>
      <button @click="registerPro"
        style="background-color: #964735; border: none; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; cursor: pointer; width: 100%;">
        Register as Professional
      </button>
      <button @click="userLogin"
        style="background-color: #1F4529; border: none; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; cursor: pointer; width: 100%;">
        Login
      </button>
    </div>

    <!-- Content for logged in users -->
    <div v-else
      style="background-color: #007bff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); width: 400px; text-align: center; color: white;">
      <h2>Welcome Back!</h2>
      <p>Explore your dashboard and manage your services:</p>
      <button @click="goToDashboard"
        style="background-color: #28a745; border: none; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; cursor: pointer; width: 100%;">
        Go to Dashboard
      </button>
      <button @click="logout"
        style="background-color: #dc3545; border: none; color: white; padding: 10px 20px; margin: 10px 0; border-radius: 5px; cursor: pointer; width: 100%;">
        Logout
      </button>
    </div>
  </div>`,

  methods: {
    userLogin() {
      this.$router.push("/login");
    },
    registerUser() {
      this.$router.push("/registerUser");
    },
    registerPro() {
      this.$router.push("/registerPro");
    },
    goToDashboard() {
      this.$router.push("/dashboard"); // Navigate to the user's dashboard
    },
    logout() {
      this.$store.commit("logout"); // Log out the user
      this.$router.push("/"); // Redirect to the home page
    },
  },
};
