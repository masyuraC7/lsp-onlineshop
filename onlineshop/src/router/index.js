import { createRouter, createWebHistory } from "vue-router";
import NotFound from "../pages/errors/404.vue";
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import Profile from "../pages/Profile.vue";
import CustomerProducts from "../pages/CustomerHome.vue";
import CustomerCarts from "../pages/Cart.vue";
import TransactionHistory from "../pages/TransactionHistory.vue";
import TransactionDetails from "../pages/TransactionDetails.vue";
import AdminHome from "../pages/AdminHome.vue";
import AdminProducts from "../pages/AdminProducts.vue";
import AdminStocks from "../pages/AdminStocks.vue";
import AdminUsers from "../pages/AdminUsers.vue";
import { useUserStore } from "../stores/UserStore";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
  {
    path: "/olshopv1/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true, role: ["customer", "admin", "subadmin"] },
  },
  {
    path: "/olshopv1/products",
    name: "CustomerProducts",
    component: CustomerProducts,
    meta: { requiresAuth: true, role: "customer" },
  },
  {
    path: "/olshopv1/carts",
    name: "CustomerCarts",
    component: CustomerCarts,
    meta: { requiresAuth: true, role: "customer" },
  },
  {
    path: "/olshopv1/transaction-history",
    name: "TransactionHistory",
    component: TransactionHistory,
    meta: { requiresAuth: true, role: ["customer", "admin", "subadmin"] },
  },
  {
    path: "/olshopv1/transaction-details/:id",
    name: "TransactionDetails",
    component: TransactionDetails,
    meta: { requiresAuth: true, role: "customer" },
  },
  {
    path: "/olshopv1/cpanel",
    name: "AdminHome",
    component: AdminHome,
    meta: { requiresAuth: true, role: ["admin", "subadmin"] },
  },
  {
    path: "/olshopv1/cpanel/products",
    name: "AdminProducts",
    component: AdminProducts,
    meta: { requiresAuth: true, role: ["admin", "subadmin"] },
  },
  {
    path: "/olshopv1/cpanel/stocks",
    name: "AdminStocks",
    component: AdminStocks,
    meta: { requiresAuth: true, role: ["admin", "subadmin"] },
  },
  {
    path: "/olshopv1/cpanel/users",
    name: "AdminUsers",
    component: AdminUsers,
    meta: { requiresAuth: true, role: ["admin", "subadmin"] },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
    meta: { hideFooter: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();

  if (!userStore.isAuthenticated) {
    userStore.initFromLocalStorage();
  }

  const isAuthenticated = userStore.isAuthenticated;
  const user = userStore.user;
  const role = user.role;

  if (isAuthenticated && ["/login", "/register", "/"].includes(to.path)) {
    if (role === "admin") return next("/olshopv1/cpanel");
    if (role === "customer") return next("/olshopv1/products");
    if (role === "subadmin") return next("/olshopv1/cpanel");
    return next("/");
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next("/login");
  }

  if (to.meta.role) {
    if (Array.isArray(to.meta.role)) {
      if (!to.meta.role.includes(role)) return next("/");
    } else {
      if (to.meta.role !== role) return next("/");
    }
  }

  next();
});

export default router;
