import { createRouter, createWebHistory } from "vue-router";
import NotFound from "../pages/errors/404.vue";
import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import CustomerProducts from "../pages/CustomerHome.vue";
import CustomerCarts from "../pages/Cart.vue";
import CustomerHistory from "../pages/TransactionHistory.vue";
import TransactionDetails from "../pages/TransactionDetails.vue";
import { useUserStore } from "../stores/UserStore";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },
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
    name: "CustomerHistory",
    component: CustomerHistory,
    meta: { requiresAuth: true, role: "customer" },
  },
  {
    path: "/olshopv1/transaction-details/:id",
    name: "TransactionDetails",
    component: TransactionDetails,
    meta: { requiresAuth: true, role: "customer" },
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
    if (role === "admin") return next("/admin");
    if (role === "customer") return next("/olshopv1/products");
    return next("/subadmin");
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next("/login");
  }

  if (to.meta.role && to.meta.role !== role) {
    return next("/");
  }

  next();
});

export default router;
