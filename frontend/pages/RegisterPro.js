export default {
  template: `
    <div class="container mt-5">
        <div class="card shadow-sm">
            <div class="card-header text-center"style="background-color: #024950; color: white;">
                <h3>Register as Professional</h3>
            </div>
            <div class="card-body"style="background-color: #D1E8E2; color: black;">
                <form @submit.prevent="submitProfessional">
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
                        <label for="experience" class="form-label">Experience (Years)</label>
                        <input 
                            type="number" 
                            id="experience" 
                            v-model="experience" 
                            class="form-control" 
                            placeholder="Enter your years of experience" 
                            min="0" 
                            required 
                        />
                    </div>
                    <div class="mb-3">
                        <label for="category" class="form-label">Select a Category</label>
                        <select 
                            id="category" 
                            v-model="category_id" 
                            class="form-select" 
                            required
                        >
                            <option value="" disabled>Select a category</option>
                            <option 
                                v-for="category in categories" 
                                :key="category.id" 
                                :value="category.id"
                            >
                                {{ category.name }}
                            </option>
                        </select>
                    </div>
                    <div class="text-center">
                        <button type="submit" class="btn btn-primary w-100"style="background-color: #964735; color: white;">Register</button>
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
      name: null,
      service_type: null,
      experience: null,
      category_id: null,
      categories: [], // To store the fetched categories
    };
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await fetch(location.origin + "/api/categories")
        if (res.ok) {
          this.categories = await res.json();
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    },
    async submitProfessional() {
      const res = await fetch(location.origin + "/registerPro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
          name: this.name,
          service_type: this.service_type,
          experience: this.experience,
          category_id: this.category_id,
        }),
      });
      if (res.ok) {
        console.log("Professional registered successfully");
        this.$router.push("/login");
      } else {
        const error = await res.json();
        console.error("Error registering professional:", error.message);
        alert(`Error: ${error.message}`);
      }
    },
  },
  mounted() {
    this.fetchCategories(); // Fetch categories when the component loads
  },
};
