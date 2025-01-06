export default {
    template: `
    <div class="container mt-5">
        <div class="card shadow-sm">
            <div class="card-header text-center" style="background-color: #7091a6; color: white;">
                <h3>Login</h3>
            </div>
            <div class="card-body"style="background-color: #EAE7DC; color: black;">
                <form @submit.prevent="submitLogin">
                    <div class="mb-3">
                        <label for="email" class="form-label">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            v-model="email" 
                            class="form-control" 
                            placeholder="Enter your email" 
                            required
                        />
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            v-model="password" 
                            class="form-control" 
                            placeholder="Enter your password" 
                            required
                        />
                    </div>
                    <div v-if="alertMessage" class="alert" :class="alertClass" role="alert">
                        {{ alertMessage }}
                    </div>
                    <div class="text-center">
                        <button type="submit" class="btn btn-primary w-100" style="background-color: #124E66; color: white;">Login</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            email: null,
            password: null,
            alertMessage: null, // Alert message text
            alertClass: 'alert-danger', // Bootstrap alert class (default is danger)
        };
    },
    methods: {
        async submitLogin() {
            try {
                const res = await fetch(`${location.origin}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email, password: this.password }),
                });

                if (res.ok) {
                    // On successful login
                    const data = await res.json();
                    localStorage.setItem('user', JSON.stringify(data));
                    this.$store.commit('setUser', data); // Assuming a Vuex store method
                    this.alertMessage = 'Login successful!';
                    this.alertClass = 'alert-success';

                    // Redirect based on user role
                    setTimeout(() => {
                        if (data.role === 'customer') {
                            this.$router.push('/services');
                        } else if (data.role === 'professional') {
                            this.$router.push('/pro_dashboard');
                        } else if (data.role === 'admin') {
                            this.$router.push('/add_service');
                        }
                    }, 1000); // Redirect after a short delay
                } else {
                    // Handle error cases based on status codes and messages
                    const errorData = await res.json();
                    this.showErrorAlert(res.status, errorData.message);
                }
            } catch (error) {
                console.error('Error during login:', error);
                this.alertMessage = 'An unexpected error occurred. Please try again later.';
                this.alertClass = 'alert-danger';
            }
        },
        showErrorAlert(status, message) {
            // Set error message and appropriate alert class
            switch (status) {
                case 400:
                    this.alertMessage = 'Please enter valid email and password.';
                    break;
                case 401:
                    this.alertMessage = 'Password is incorrect. Please try again.';
                    break;
                case 403:
                    this.alertMessage = message.includes('not verified')
                        ? 'Your account is not verified yet.'
                        : 'Your account has been blocked.';
                    break;
                case 404:
                    this.alertMessage = 'This email is not registered.';
                    break;
                default:
                    this.alertMessage = 'An error occurred during login. Please try again.';
            }
            this.alertClass = 'alert-danger';
        },
    },
};
