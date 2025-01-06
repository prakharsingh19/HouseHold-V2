import LoginPage from "../pages/LoginPage.js";
import RegisterUser from "../pages/RegisterUser.js";
import RegisterPro from "../pages/RegisterPro.js";
import Home from "../pages/home.js"
import store from './store.js'
import Dashboard from "../pages/Dashboard.js"
import Add_category from "../pages/Add_category.js"
import Pro_verification from "../pages/Pro_verification.js";
import Add_service from "../pages/Add_service.js";
import Services from "../pages/Services.js";
import Pro_dashboard from "../pages/Pro_dashboard.js";
import Customer_dashboard from "../pages/Customer_dashboard.js";
import Customer_management from "../pages/Customer_management.js";
import History from "../pages/History.js";
// import Review from "../pages/Review.js";


const routes = [
    {path : '/', component : Home},
    {path : '/login', component : LoginPage},
    {path : '/registerUser', component : RegisterUser},
    {path : '/dashboard', component : Dashboard},
    {path : '/registerPro',component: RegisterPro},
    {path : '/categories', component: Add_category, meta: { requiresLogin: true, role: 'admin' }},
    {path : '/pro_verification', component : Pro_verification},
    {path : '/add_service', component: Add_service, meta: { requiresLogin: true, role: 'admin' }},
    {path : '/services', component: Services, meta: { requiresLogin: true, role: 'customer' }},
    {path : '/pro_dashboard', component : Pro_dashboard},
    {path : '/custmor_dashboard', component : Customer_dashboard},
    {path : '/customer_management', component : Customer_management, meta: { requiresLogin: true, role: 'admin' }},
    {path : '/history', component : History},
]

const router = new VueRouter({
    routes
})

// navigation guards
router.beforeEach((to, from, next) => {
    // Check if the route requires login
    if (to.matched.some((record) => record.meta.requiresLogin)) {
        if (!store.state.loggedIn) {
            // Redirect to login page if not logged in
            next({ path: '/login' });
        } else if (to.meta.role && to.meta.role !== store.state.role) {
            // Prevent access if user role does not match
            alert('Role not authorized');
            next({ path: '/' });
        } else {
            next();
        }
    } else {
        next(); // Proceed to the route if no login is required
    }
});
export default router;