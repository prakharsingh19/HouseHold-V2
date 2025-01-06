export default {
    template : `<div class="container mt-5">
    <div class="card shadow-sm">
        <div class="card-header text-center" style="background-color: #024950; color: white;">
            <h3>Register as Customer</h3>
        </div>
        <div class="card-body"style="background-color: #E3e2df; color: black;">
            <form @submit.prevent="submitLogin">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        v-model="name" 
                        class="form-control" 
                        placeholder="Enter your full name" 
                        required 
                    />
                </div>
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
                        placeholder="Enter a secure password" 
                        required 
                    />
                </div>
                <div class="mb-3">
                    <label for="address" class="form-label">Address</label>
                    <input 
                        type="text" 
                        id="address" 
                        v-model="address" 
                        class="form-control" 
                        placeholder="Enter your address" 
                        required 
                    />
                </div>
                <div class="mb-3">
                    <label for="phone" class="form-label">Phone</label>
                    <input 
                        type="text" 
                        id="phone" 
                        v-model="phone" 
                        class="form-control" 
                        placeholder="Enter 10-digit phone number" 
                        maxlength="10" 
                        @input="validatePhone" 
                        required 
                    />
                </div>
                <div class="text-center">
                    <button type="submit" class="btn btn-primary w-100"style="background-color: #116466; color: white;">Register</button>
                </div>
            </form>
        </div>
    </div>
</div>

    `,
    data(){
        return {
            email : null,
            password : null,
            name:null,
            address:null,
            phone:null,
            
        } 
    },
    methods : {
        validatePhone() {
            // Remove non-numeric characters
            this.phone = this.phone.replace(/\D/g, '');
            // Limit to 10 characters
            if (this.phone.length > 10) {
                this.phone = this.phone.slice(0, 10);
            }
        },
        async submitLogin(){
            const res = await fetch(location.origin+'/registerUser', 
                {method : 'POST', 
                    headers: {'Content-Type' : 'application/json'}, 
                    body : JSON.stringify({ email: this.email,
                        password: this.password,
                        role: 'customer',
                        name: this.name,
                        address: this.address,
                        phone: this.phone})
                })
            if (res.ok){
                console.log('we are register')
                this.$router.push('/login')

            }
        }
    }
}