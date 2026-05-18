import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./CafeApp.css";

const defaultMenu = [
  menuItem("filter-kaapi", "House Filter Coffee", "Coffee", 89, "5 min", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=640&q=80", ["Hot", "Signature"]),
  menuItem("cold-brew", "Classic Cold Brew", "Coffee", 139, "6 min", "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=640&q=80", ["Cold"]),
  menuItem("veg-burger", "Crunch Veg Burger", "Burger", 179, "12 min", "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=640&q=80", ["Popular"]),
  menuItem("cheese-burger", "Smoked Cheese Burger", "Burger", 229, "14 min", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=640&q=80", ["Chef pick"]),
  menuItem("paneer-kuff", "Paneer Kuff", "Kuffs", 119, "8 min", "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=640&q=80", ["Crisp"]),
  menuItem("corn-kuff", "Cheese Corn Kuff", "Kuffs", 109, "7 min", "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=640&q=80", ["Snack"]),
  menuItem("fries", "Peri Peri Fries", "Sides", 99, "7 min", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=640&q=80", ["Share"]),
  menuItem("brownie", "Walnut Brownie", "Dessert", 129, "6 min", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=640&q=80", ["Sweet"]),
];

const defaultUsers = [
  {
    id: "u-admin",
    name: "Swiss Delight Admin",
    email: "admin@swissdelight.com",
    password: "admin123",
    role: "admin",
    active: true,
    phone: "9876543210",
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 90,
  },
  {
    id: "u-customer",
    name: "Demo Customer",
    email: "customer@swissdelight.com",
    password: "customer123",
    role: "customer",
    active: true,
    phone: "9123456780",
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
];

const initialOrders = [
  orderSeed("KOT-1041", 3, "Walk-in", "walkin@swissdelight.local", "processing", "UPI", Date.now() - 1000 * 60 * 8, [
    { id: "veg-burger", name: "Crunch Veg Burger", price: 179, qty: 2 },
    { id: "filter-kaapi", name: "House Filter Coffee", price: 89, qty: 2 },
  ]),
  orderSeed("KOT-1042", 7, "Asha", "customer@swissdelight.com", "pending", "Card", Date.now() - 1000 * 60 * 3, [
    { id: "paneer-kuff", name: "Paneer Kuff", price: 119, qty: 3 },
    { id: "cold-brew", name: "Classic Cold Brew", price: 139, qty: 1 },
  ]),
  orderSeed("KOT-1043", 1, "Rahul", "rahul@example.com", "completed", "Cash", Date.now() - 1000 * 60 * 15, [
    { id: "cheese-burger", name: "Smoked Cheese Burger", price: 229, qty: 1 },
    { id: "fries", name: "Peri Peri Fries", price: 99, qty: 1 },
  ]),
];

const defaultNotifications = [
  notification("admin", "New order KOT-1042 received", "Order from Asha is waiting in KOT."),
  notification("admin", "Payment confirmed", "KOT-1041 UPI transaction completed."),
  notification("customer@swissdelight.com", "Order status update", "KOT-1042 is waiting for kitchen confirmation."),
];

const statuses = ["pending", "processing", "completed", "cancelled"];
const statusMap = { pending: "waiting", processing: "preparing", completed: "prepared", cancelled: "cancelled" };
const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

function menuItem(id, name, category, price, time, image, tags) {
  return { id, name, category, price, time, image, tags, available: true };
}

function orderSeed(id, table, customer, customerEmail, status, payment, createdAt, items) {
  return {
    id,
    table,
    customer,
    customerEmail,
    status,
    paid: status !== "cancelled",
    payment,
    transactionStatus: status === "cancelled" ? "failed" : "success",
    createdAt,
    items,
  };
}

function notification(target, title, body) {
  return { id: `N-${Date.now()}-${Math.random()}`, target, title, body, createdAt: Date.now(), read: false };
}

function loadStored(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function minutesAgo(time) {
  return Math.max(1, Math.round((Date.now() - time) / 60000));
}

function nextStatus(status) {
  if (status === "pending") return "processing";
  if (status === "processing") return "completed";
  return status;
}

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function orderTotal(order) {
  return order.items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export default function CafeApp() {
  const [orders, setOrders] = useState(() => loadStored("cafe-demo-orders", initialOrders));
  const [menuItems, setMenuItems] = useState(() => loadStored("cafe-demo-menu", defaultMenu));
  const [users, setUsers] = useState(() => loadStored("cafe-demo-users", defaultUsers));
  const [session, setSession] = useState(() => loadStored("cafe-demo-session", null));
  const [guestCustomer, setGuestCustomer] = useState(() => loadStored("cafe-demo-guest", { name: "", phone: "" }));
  const [notifications, setNotifications] = useState(() => loadStored("cafe-demo-notifications", defaultNotifications));

  const sessionUser = users.find((user) => user.id === session?.userId) || null;
  const currentUser = sessionUser?.role === "admin" ? sessionUser : null;

  useEffect(() => localStorage.setItem("cafe-demo-orders", JSON.stringify(orders)), [orders]);
  useEffect(() => localStorage.setItem("cafe-demo-menu", JSON.stringify(menuItems)), [menuItems]);
  useEffect(() => localStorage.setItem("cafe-demo-users", JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem("cafe-demo-session", JSON.stringify(session)), [session]);
  useEffect(() => localStorage.setItem("cafe-demo-guest", JSON.stringify(guestCustomer)), [guestCustomer]);
  useEffect(() => localStorage.setItem("cafe-demo-notifications", JSON.stringify(notifications)), [notifications]);

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === "cafe-demo-orders" && event.newValue) setOrders(JSON.parse(event.newValue));
      if (event.key === "cafe-demo-menu" && event.newValue) setMenuItems(JSON.parse(event.newValue));
      if (event.key === "cafe-demo-users" && event.newValue) setUsers(JSON.parse(event.newValue));
      if (event.key === "cafe-demo-session" && event.newValue) setSession(JSON.parse(event.newValue));
      if (event.key === "cafe-demo-guest" && event.newValue) setGuestCustomer(JSON.parse(event.newValue));
      if (event.key === "cafe-demo-notifications" && event.newValue) setNotifications(JSON.parse(event.newValue));
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function login(email, password) {
    const user = users.find((entry) => entry.role === "admin" && entry.email.toLowerCase() === email.toLowerCase() && entry.password === password);
    if (!user) return { ok: false, message: "Invalid email or password." };
    if (!user.active) return { ok: false, message: "This account is deactivated." };
    setSession({ userId: user.id, role: user.role, loginAt: Date.now() });
    return { ok: true, role: user.role };
  }

  function register(payload) {
    if (users.some((user) => user.email.toLowerCase() === payload.email.toLowerCase())) {
      return { ok: false, message: "Email already registered." };
    }
    const user = {
      id: `u-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone || "",
      role: "customer",
      active: true,
      joinedAt: Date.now(),
    };
    setUsers((current) => [...current, user]);
    setSession({ userId: user.id, role: "customer", loginAt: Date.now() });
    return { ok: true, role: "customer" };
  }

  function logout() {
    setSession(null);
  }

  function addNotification(target, title, body) {
    setNotifications((current) => [notification(target, title, body), ...current]);
  }

  function placeOrder(order) {
    setOrders((current) => [order, ...current]);
    addNotification("admin", `New order ${order.id}`, `${order.customer} placed an order for Table ${order.table}.`);
    addNotification(order.customerEmail, "Order confirmation", `${order.id} confirmed with ${order.payment} payment.`);
    addNotification(order.customerEmail, "Payment success", `${rupee.format(orderTotal(order))} received for ${order.id}.`);
  }

  function updateStatus(id, status) {
    const order = orders.find((entry) => entry.id === id);
    setOrders((current) => current.map((entry) => (entry.id === id ? { ...entry, status } : entry)));
    if (order) {
      addNotification("admin", `Order ${id} ${status}`, `Kitchen status changed to ${statusLabel(status)}.`);
      addNotification(order.customerEmail, "Order status update", `${id} is now ${statusLabel(status)}.`);
    }
  }

  function cancelOrder(id) {
    const order = orders.find((entry) => entry.id === id);
    setOrders((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, status: "cancelled", paid: false, transactionStatus: "failed" } : entry
      )
    );
    if (order) {
      addNotification("admin", `Failed transaction ${id}`, `${order.payment} payment/order was cancelled.`);
      addNotification(order.customerEmail, "Payment failed", `${id} was cancelled. Please contact the counter.`);
    }
  }

  function resetDemo() {
    setOrders(initialOrders);
    setMenuItems(defaultMenu);
    setUsers(defaultUsers);
    setGuestCustomer({ name: "", phone: "" });
    setNotifications(defaultNotifications);
  }

  function updateMenuItem(id, patch) {
    setMenuItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addMenuItem(item) {
    setMenuItems((current) => [{ ...item, id: `item-${Date.now()}`, available: true, tags: ["New"] }, ...current]);
  }

  function deleteMenuItem(id) {
    setMenuItems((current) => current.filter((item) => item.id !== id));
  }

  function updateUser(id, patch) {
    setUsers((current) => current.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  }

  return (
    <BrowserRouter>
      <main className="cafe-shell">
        <CafeHeader currentUser={currentUser} logout={logout} />

        <Routes>
          <Route path="/" element={<Navigate to="/customer/menu" replace />} />
          <Route path="/login" element={<AuthPage mode="login" login={login} currentUser={currentUser} />} />
          <Route
            path="/customer/*"
            element={
              <CustomerArea
                guestCustomer={guestCustomer}
                setGuestCustomer={setGuestCustomer}
                menuItems={menuItems}
                orders={orders}
                placeOrder={placeOrder}
              />
            }
          />
          <Route
            path="/admin/*"
            element={
              <Protected role="admin" currentUser={currentUser}>
                <AdminPage
                  orders={orders}
                  menuItems={menuItems}
                  updateStatus={updateStatus}
                  cancelOrder={cancelOrder}
                  resetDemo={resetDemo}
                  updateMenuItem={updateMenuItem}
                  addMenuItem={addMenuItem}
                  deleteMenuItem={deleteMenuItem}
                />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

function CafeHeader({ currentUser, logout }) {
  const location = useLocation();
  const isCustomerPage = location.pathname.startsWith("/customer");

  return (
    <header className="cafe-topbar">
      <div>
        <span className="eyebrow">Secure cafe management prototype</span>
        <h1>Swiss Delight</h1>
      </div>
      <nav className="module-switch" aria-label="Cafe pages">
        {currentUser?.role === "admin" && <NavLink to="/admin/dashboard">Admin Page</NavLink>}
        {currentUser?.role === "admin" && <button onClick={logout}>Logout</button>}
        {!currentUser && !isCustomerPage && <NavLink to="/login">Admin Login</NavLink>}
      </nav>
    </header>
  );
}

function Protected({ role, currentUser, children }) {
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== role) return <Navigate to="/customer/menu" replace />;
  return children;
}

function AuthPage({ mode, login, currentUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "admin@swissdelight.com", password: "admin123" });
  const [error, setError] = useState("");

  if (currentUser) return <Navigate to="/admin/dashboard" replace />;

  function submit(event) {
    event.preventDefault();
    const result = login(form.email, form.password);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate("/admin/dashboard");
  }

  return (
    <section className="auth-page page-pad">
      <form className="auth-card" onSubmit={submit}>
        <span className="eyebrow">Secure admin login</span>
        <h2>Sign in to Swiss Delight</h2>
        <label>Email<input value={form.email} required onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
        <label>Password<input type="password" value={form.password} required onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="checkout-button" type="submit">Login</button>
        <p className="auth-hint">Admin demo: admin@swissdelight.com / admin123</p>
        <NavLink to="/customer/menu">Open customer page</NavLink>
      </form>
    </section>
  );
}

function CustomerArea({ guestCustomer, setGuestCustomer, menuItems, orders, placeOrder }) {
  const customerKey = guestCustomer.phone ? `phone:${guestCustomer.phone}` : "";
  return (
    <section className="customer-area page-pad">
      <nav className="admin-nav customer-nav" aria-label="Customer modules">
        <NavLink to="/customer/menu">Menu</NavLink>
        <NavLink to="/customer/orders">Orders</NavLink>
        <NavLink to="/customer/profile">Profile</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="menu" replace />} />
        <Route path="menu" element={<CustomerMenu guestCustomer={guestCustomer} setGuestCustomer={setGuestCustomer} menuItems={menuItems} orders={orders} placeOrder={placeOrder} />} />
        <Route path="orders" element={<CustomerOrders customerKey={customerKey} orders={orders} />} />
        <Route path="profile" element={<CustomerProfile guestCustomer={guestCustomer} setGuestCustomer={setGuestCustomer} />} />
        <Route path="*" element={<Navigate to="menu" replace />} />
      </Routes>
    </section>
  );
}

function CustomerMenu({ guestCustomer, setGuestCustomer, menuItems, orders, placeOrder }) {
  const [cart, setCart] = useState([]);
  const [table, setTable] = useState(4);
  const [payment, setPayment] = useState("UPI");
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [lastKot, setLastKot] = useState(null);
  const [customerDraft, setCustomerDraft] = useState(guestCustomer);
  const categories = ["All", ...new Set(menuItems.map((item) => item.category))];
  const filteredMenu = menuItems.filter((item) => item.available && (category === "All" || item.category === category) && item.name.toLowerCase().includes(query.toLowerCase()));
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  function addItem(item) {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      return existing ? current.map((entry) => (entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry)) : [...current, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  }

  function changeQty(id, change) {
    setCart((current) => current.map((item) => (item.id === id ? { ...item, qty: item.qty + change } : item)).filter((item) => item.qty > 0));
  }

  function checkout() {
    if (!cart.length || !customerDraft.name.trim() || !customerDraft.phone.trim()) return;
    const cleanCustomer = { name: customerDraft.name.trim(), phone: customerDraft.phone.trim() };
    setGuestCustomer(cleanCustomer);
    const order = {
      id: `KOT-${1044 + orders.length}`,
      table,
      customer: cleanCustomer.name,
      customerPhone: cleanCustomer.phone,
      customerEmail: `phone:${cleanCustomer.phone}`,
      status: "pending",
      paid: true,
      payment,
      transactionStatus: "success",
      createdAt: Date.now(),
      items: cart,
    };
    placeOrder(order);
    setCart([]);
    setLastKot(order.id);
  }

  return (
    <section className="customer-grid">
      <div className="menu-panel">
        <div className="menu-toolbar">
          <div><h2>Available Menu</h2><p>Search, filter, add to cart and place orders.</p></div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search menu" aria-label="Search menu" />
        </div>
        <div className="category-row">
          {categories.map((name) => <button key={name} className={category === name ? "active" : ""} onClick={() => setCategory(name)}>{name}</button>)}
        </div>
        <div className="menu-grid">
          {filteredMenu.map((item) => (
            <article className="menu-item" key={item.id}>
              <img src={item.image} alt={item.name} />
              <div className="menu-item-body">
                <div><span>{item.category}</span><h3>{item.name}</h3></div>
                <p>{item.tags.join(" / ")} | {item.time}</p>
                <div className="menu-item-actions"><strong>{rupee.format(item.price)}</strong><button onClick={() => addItem(item)}>Add</button></div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <aside className="checkout-panel">
        <h2>Cart</h2>
        <label>Name<input value={customerDraft.name} onChange={(event) => setCustomerDraft({ ...customerDraft, name: event.target.value })} /></label>
        <label>Phone<input value={customerDraft.phone} onChange={(event) => setCustomerDraft({ ...customerDraft, phone: event.target.value })} /></label>
        <label>Table<select value={table} onChange={(event) => setTable(Number(event.target.value))}>{Array.from({ length: 10 }, (_, index) => index + 1).map((number) => <option value={number} key={number}>Table {number}</option>)}</select></label>
        <div className="cart-list">
          {cart.length ? cart.map((item) => (
            <div className="cart-row" key={item.id}>
              <div><strong>{item.name}</strong><span>{rupee.format(item.price)} each</span></div>
              <div className="qty-control"><button onClick={() => changeQty(item.id, -1)}>-</button><span>{item.qty}</span><button onClick={() => changeQty(item.id, 1)}>+</button></div>
            </div>
          )) : <p className="empty-state">Add menu items to create an order.</p>}
        </div>
        <div className="payment-box"><span>Payment</span><div className="payment-options">{["Cash", "UPI", "Card"].map((mode) => <button key={mode} className={payment === mode ? "active" : ""} onClick={() => setPayment(mode)}>{mode}</button>)}</div></div>
        <div className="total-row"><span>Total</span><strong>{rupee.format(cartTotal)}</strong></div>
        <button className="checkout-button" onClick={checkout} disabled={!cart.length || !customerDraft.name.trim() || !customerDraft.phone.trim()}>Place Order</button>
        {lastKot && <p className="sync-note">{lastKot} confirmed and sent to KOT.</p>}
      </aside>
    </section>
  );
}

function CustomerOrders({ customerKey, orders }) {
  const myOrders = customerKey ? orders.filter((order) => order.customerEmail === customerKey) : [];
  return <OrderCards title="Order History" orders={myOrders} />;
}

function CustomerProfile({ guestCustomer, setGuestCustomer }) {
  const [profile, setProfile] = useState(guestCustomer);
  return (
    <div className="admin-main narrow-panel">
      <div className="admin-header"><div><h2>Customer Details</h2><p>Only name and phone are needed for customer ordering.</p></div></div>
      <div className="profile-form">
        <label>Name<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
        <label>Phone<input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
        <button className="checkout-button" onClick={() => setGuestCustomer({ name: profile.name.trim(), phone: profile.phone.trim() })}>Save Details</button>
      </div>
    </div>
  );
}

function AdminPage({ orders, menuItems, updateStatus, cancelOrder, resetDemo, updateMenuItem, addMenuItem, deleteMenuItem }) {
  const stats = useMemo(() => {
    const validOrders = orders.filter((order) => order.status !== "cancelled");
    return {
      totalOrders: orders.length,
      revenue: validOrders.reduce((sum, order) => sum + orderTotal(order), 0),
      activeKot: orders.filter((order) => ["pending", "processing"].includes(order.status)).length,
      pending: orders.filter((order) => order.status === "pending").length,
    };
  }, [orders]);

  return (
    <section className="admin-shell page-pad">
      <aside className="admin-sidebar">
        <div><h2>Admin</h2><p>Full management access</p></div>
        <nav className="admin-nav" aria-label="Admin submodules">
          <NavLink to="/admin/dashboard">Dashboard</NavLink>
          <NavLink to="/admin/kot">KOT</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <NavLink to="/admin/billing">Billing</NavLink>
          <NavLink to="/admin/payments">Payments</NavLink>
          <NavLink to="/admin/floor-plan">Floor Plan</NavLink>
          <NavLink to="/admin/menu-management">Menu Management</NavLink>
        </nav>
        <button className="reset-button" onClick={resetDemo}>Reset demo</button>
      </aside>

      <div className="admin-content">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardModule stats={stats} orders={orders} />} />
          <Route path="kot" element={<KotModule orders={orders} updateStatus={updateStatus} cancelOrder={cancelOrder} />} />
          <Route path="orders" element={<OrdersModule orders={orders} updateStatus={updateStatus} cancelOrder={cancelOrder} />} />
          <Route path="billing" element={<BillingModule orders={orders} updateStatus={updateStatus} />} />
          <Route path="payments" element={<PaymentsModule orders={orders} />} />
          <Route path="floor-plan" element={<FloorPlanModule orders={orders} />} />
          <Route path="menu-management" element={<MenuManagementModule menuItems={menuItems} updateMenuItem={updateMenuItem} addMenuItem={addMenuItem} deleteMenuItem={deleteMenuItem} />} />
          <Route path="*" element={<Navigate to="kot" replace />} />
        </Routes>
      </div>
    </section>
  );
}

function DashboardModule({ stats, orders }) {
  return (
    <div className="admin-main">
      <div className="admin-header"><div><h2>Dashboard Statistics</h2><p>Total orders, revenue, active customers and sales summary.</p></div></div>
      <div className="stat-strip">
        <Metric label="Total Orders" value={stats.totalOrders} tone="amber" />
        <Metric label="Total Revenue" value={rupee.format(stats.revenue)} tone="rose" />
        <Metric label="Active KOT" value={stats.activeKot} tone="green" />
        <Metric label="Pending Orders" value={stats.pending} tone="blue" />
      </div>
      <div className="sales-summary">
        {["Cash", "UPI", "Card"].map((mode) => {
          const total = orders.filter((order) => order.payment === mode && order.status !== "cancelled").reduce((sum, order) => sum + orderTotal(order), 0);
          return <Metric key={mode} label={`${mode} Sales`} value={rupee.format(total)} tone={mode === "UPI" ? "blue" : mode === "Card" ? "green" : "amber"} />;
        })}
      </div>
    </div>
  );
}

function KotModule({ orders, updateStatus, cancelOrder }) {
  const activeOrders = orders.filter((order) => ["pending", "processing"].includes(order.status));
  const completedToday = orders.filter((order) => order.status === "completed");
  const totalItems = activeOrders.reduce((sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.qty, 0), 0);

  return (
    <div className="admin-main kot-module">
      <div className="admin-header">
        <div>
          <h2>Kitchen Order Tickets</h2>
          <p>Live kitchen flow from pending to processing to completed.</p>
        </div>
      </div>

      <div className="kot-command-strip">
        <Metric label="Active Tickets" value={activeOrders.length} tone="amber" />
        <Metric label="Items In Kitchen" value={totalItems} tone="blue" />
        <Metric label="Completed" value={completedToday.length} tone="green" />
      </div>

      <div className="kot-board">
        {["pending", "processing", "completed"].map((status) => (
          <section className="kot-lane" key={status}>
            <div className="kot-lane-head">
              <h3>{statusLabel(status)}</h3>
              <span>{orders.filter((order) => order.status === status).length}</span>
            </div>
            {orders
              .filter((order) => order.status === status)
              .sort((a, b) => a.createdAt - b.createdAt)
              .map((order) => (
                <KotTicket
                  key={order.id}
                  order={order}
                  onAdvance={() => updateStatus(order.id, nextStatus(order.status))}
                  onSetStatus={(newStatus) => updateStatus(order.id, newStatus)}
                  onCancel={() => cancelOrder(order.id)}
                />
              ))}
            {!orders.some((order) => order.status === status) && (
              <p className="lane-empty">No {statusLabel(status).toLowerCase()} tickets.</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

function OrdersModule({ orders, updateStatus, cancelOrder }) {
  return (
    <div className="admin-main">
      <div className="admin-header"><div><h2>Order Management</h2><p>View all orders, update status and cancel orders.</p></div></div>
      <OrderCards title="" orders={orders} updateStatus={updateStatus} cancelOrder={cancelOrder} admin />
    </div>
  );
}

function BillingModule({ orders, updateStatus }) {
  return (
    <div className="admin-main">
      <div className="admin-header"><div><h2>Billing</h2><p>Paid bills, table totals, payment mode and final close action.</p></div></div>
      <OrderCards title="" orders={orders} updateStatus={updateStatus} admin billingOnly />
    </div>
  );
}

function CustomersModule({ users, orders, updateUser }) {
  const customers = users.filter((user) => user.role === "customer");
  return (
    <div className="admin-main">
      <div className="admin-header"><div><h2>Customer Accounts</h2><p>View details and activate or deactivate customer access.</p></div></div>
      <div className="menu-management">
        {customers.map((user) => {
          const count = orders.filter((order) => order.customerEmail === user.email).length;
          return (
            <article className="customer-row" key={user.id}>
              <div><strong>{user.name}</strong><span>{user.email} | {user.phone || "No phone"} | {count} orders</span></div>
              <button className={user.active ? "available" : "unavailable"} onClick={() => updateUser(user.id, { active: !user.active })}>{user.active ? "Active" : "Inactive"}</button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PaymentsModule({ orders }) {
  return (
    <div className="admin-main">
      <div className="admin-header"><div><h2>Payment History</h2><p>Transaction status across Cash, UPI and Card payments.</p></div></div>
      <div className="billing-list">
        {orders.map((order) => (
          <article className="bill-card" key={order.id}>
            <div className="bill-head"><div><strong>{order.id}</strong><span>{order.payment} | {order.customer}</span></div><b>{rupee.format(orderTotal(order))}</b></div>
            <div className="bill-actions"><span className={`status-pill ${order.transactionStatus === "success" ? "served" : "cancelled"}`}>{order.transactionStatus}</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>
          </article>
        ))}
      </div>
    </div>
  );
}

function FloorPlanModule({ orders }) {
  const activeOrders = orders.filter((order) => !["completed", "cancelled"].includes(order.status));
  return (
    <div className="floor-module">
      <div className="floor-panel module-panel">
        <div><h2>10 Table Floor Plan</h2><p>Tables update from live order state.</p></div>
        <div className="floor-plan">
          {Array.from({ length: 10 }, (_, index) => index + 1).map((number) => {
            const order = activeOrders.find((entry) => entry.table === number);
            return <button key={number} className={`table-node ${order ? statusMap[order.status] : "free"}`}><span>T{number}</span><small>{order ? statusLabel(order.status) : "Free"}</small></button>;
          })}
        </div>
      </div>
      <div className="served-log module-panel">
        <h3>Completed Tables</h3>
        {orders.filter((order) => order.status === "completed").slice(0, 8).map((order) => <p key={order.id}>{order.id} | Table {order.table} | {rupee.format(orderTotal(order))}</p>)}
        {!orders.some((order) => order.status === "completed") && <p>No completed orders yet.</p>}
      </div>
    </div>
  );
}

function MenuManagementModule({ menuItems, updateMenuItem, addMenuItem, deleteMenuItem }) {
  const [draft, setDraft] = useState({ name: "", category: "Coffee", price: 99, time: "8 min", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=640&q=80" });
  return (
    <div className="admin-main">
      <div className="admin-header"><div><h2>Menu Management</h2><p>Add, edit, delete and hide customer menu items.</p></div></div>
      <div className="add-menu-form">
        <input placeholder="Item name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
        <input placeholder="Category" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} />
        <input type="number" min="1" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} />
        <button onClick={() => draft.name && addMenuItem(draft)}>Add Item</button>
      </div>
      <div className="menu-management">
        {menuItems.map((item) => (
          <article className="menu-admin-row" key={item.id}>
            <img src={item.image} alt={item.name} />
            <div><strong>{item.name}</strong><span>{item.category} | {item.time}</span></div>
            <label>Price<input type="number" min="1" value={item.price} onChange={(event) => updateMenuItem(item.id, { price: Number(event.target.value) })} /></label>
            <button className={item.available ? "available" : "unavailable"} onClick={() => updateMenuItem(item.id, { available: !item.available })}>{item.available ? "Available" : "Hidden"}</button>
            <button className="delete-button" onClick={() => deleteMenuItem(item.id)}>Delete</button>
          </article>
        ))}
      </div>
    </div>
  );
}

function ReportsModule({ orders }) {
  const today = new Date().toDateString();
  const dailyOrders = orders.filter((order) => new Date(order.createdAt).toDateString() === today && order.status !== "cancelled");
  const month = new Date().getMonth();
  const monthlyOrders = orders.filter((order) => new Date(order.createdAt).getMonth() === month && order.status !== "cancelled");
  return (
    <div className="admin-main">
      <div className="admin-header"><div><h2>Reports</h2><p>Daily sales reports, monthly reports and revenue analytics.</p></div></div>
      <div className="stat-strip">
        <Metric label="Daily Sales" value={rupee.format(dailyOrders.reduce((sum, order) => sum + orderTotal(order), 0))} tone="amber" />
        <Metric label="Daily Orders" value={dailyOrders.length} tone="blue" />
        <Metric label="Monthly Sales" value={rupee.format(monthlyOrders.reduce((sum, order) => sum + orderTotal(order), 0))} tone="rose" />
        <Metric label="Monthly Orders" value={monthlyOrders.length} tone="green" />
      </div>
      <div className="analytics-bars">
        {["Coffee", "Burger", "Kuffs", "Sides", "Dessert"].map((category) => {
          const total = orders.flatMap((order) => order.items).filter((item) => defaultMenu.find((menu) => menu.id === item.id)?.category === category).reduce((sum, item) => sum + item.price * item.qty, 0);
          return <div className="bar-row" key={category}><span>{category}</span><b style={{ width: `${Math.max(8, total / 20)}%` }}></b><strong>{rupee.format(total)}</strong></div>;
        })}
      </div>
    </div>
  );
}

function NotificationsList({ notifications }) {
  return (
    <div className="admin-main narrow-panel">
      <div className="admin-header"><div><h2>Notifications</h2><p>Real-time order, payment and status updates.</p></div></div>
      <div className="billing-list">
        {notifications.map((note) => (
          <article className="bill-card" key={note.id}>
            <div className="bill-head"><div><strong>{note.title}</strong><span>{note.body}</span></div><b>{minutesAgo(note.createdAt)} min</b></div>
          </article>
        ))}
        {!notifications.length && <p className="empty-state">No notifications yet.</p>}
      </div>
    </div>
  );
}

function OrderCards({ title, orders, updateStatus, cancelOrder, admin, billingOnly }) {
  return (
    <div className="billing-list">
      {title && <h2>{title}</h2>}
      {orders.map((order) => (
        <article className="bill-card" key={order.id}>
          <div className="bill-head"><div><strong>{order.id}</strong><span>Table {order.table} | {order.customer} | {order.payment}</span></div><b>{rupee.format(orderTotal(order))}</b></div>
          <div className="bill-lines">{order.items.map((item) => <p key={item.id}><span>{item.qty} x {item.name}</span><strong>{rupee.format(item.price * item.qty)}</strong></p>)}</div>
          <div className="bill-actions">
            <span className={`status-pill ${order.status}`}>{statusLabel(order.status)}</span>
            {admin && !billingOnly && order.status !== "completed" && order.status !== "cancelled" && <button onClick={() => updateStatus(order.id, nextStatus(order.status))}>Update Status</button>}
            {admin && !billingOnly && order.status !== "cancelled" && <button onClick={() => cancelOrder(order.id)}>Cancel</button>}
            {admin && billingOnly && order.status !== "completed" && order.status !== "cancelled" && <button onClick={() => updateStatus(order.id, "completed")}>Close Bill</button>}
          </div>
        </article>
      ))}
      {!orders.length && <p className="empty-state">No orders found.</p>}
    </div>
  );
}

function Metric({ label, value, tone }) {
  return <div className={`metric ${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function KotTicket({ order, onAdvance, onSetStatus, onCancel }) {
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  const isFinal = ["completed", "cancelled"].includes(order.status);

  return (
    <article className={`kot-ticket ${statusMap[order.status] || order.status}`}>
      <div className="ticket-head">
        <div>
          <strong>{order.id}</strong>
          <span>Table {order.table} | {order.customer}</span>
        </div>
        <small>{minutesAgo(order.createdAt)} min</small>
      </div>
      <div className="kot-meta-row">
        <span className={`status-pill ${order.status}`}>{statusLabel(order.status)}</span>
        <span>{itemCount} items</span>
        <span>{order.payment}</span>
      </div>
      <div className="ticket-items">
        {order.items.map((item) => (
          <p key={item.id}>
            <span><b>{item.qty}</b> x {item.name}</span>
            <strong>{rupee.format(item.price * item.qty)}</strong>
          </p>
        ))}
      </div>
      <div className="ticket-foot">
        <span>{rupee.format(orderTotal(order))}</span>
        <div className="kot-actions">
          {order.status === "pending" && <button onClick={onAdvance}>Start Preparing</button>}
          {order.status === "processing" && <button onClick={onAdvance}>Mark Completed</button>}
          {order.status === "completed" && <button onClick={() => onSetStatus("processing")}>Reopen</button>}
          {!isFinal && <button className="muted-action" onClick={onCancel}>Cancel</button>}
        </div>
      </div>
    </article>
  );
}
