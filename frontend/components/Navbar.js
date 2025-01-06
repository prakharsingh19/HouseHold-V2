export default {
    template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light shadow">
        <div class="container-fluid">
            <router-link class="navbar-brand fw-bold" to="/">A-Z Services</router-link>
            <button 
                class="navbar-toggler" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#navbarNav" 
                aria-controls="navbarNav" 
                aria-expanded="false" 
                aria-label="Toggle navigation"
            >
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item" v-if="!$store.state.loggedIn">
                        <router-link class="nav-link" to="/login">Login</router-link>
                    </li>
                    <li class="nav-item" v-if="!$store.state.loggedIn">
                        <router-link class="nav-link" to="/registerUser">Register User</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role == 'admin'">
                        <router-link class="nav-link" to="/customer_management">Customer Management</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role == 'admin'">
                        <router-link class="nav-link" to="/add_service">Add Services</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role == 'admin'">
                        <router-link class="nav-link" to="/categories">Add Category</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role == 'admin'">
                        <router-link class="nav-link" to="/pro_verification">Professional Verification</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role == 'customer'">
                        <router-link class="nav-link" to="/services">Available Services</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role == 'customer'">
                        <router-link class="nav-link" to="/custmor_dashboard">Dashboard</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role == 'professional'">
                        <router-link class="nav-link" to="/pro_dashboard">Dashboard</router-link>
                    </li>
                    <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role != 'admin'">
                        <router-link class="nav-link" to="/history">History</router-link>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item" v-if="$store.state.loggedIn">
                        <button class="btn btn-outline-danger" @click="handleLogout()">Logout</button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    `,
    methods: {
        handleLogout() {
            this.$store.commit('logout'); // Log out the user
            this.$router.push('/');      // Redirect to the homepage
        }
    }
}
    