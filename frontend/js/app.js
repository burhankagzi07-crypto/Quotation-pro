const API = `${window.location.origin}/api`;
const FALLBACK_IMAGE = 'https://placehold.co/240x240?text=No+Image';

function getToken() {
  return localStorage.getItem('token');
}

function getRole() {
  return (localStorage.getItem('role') || 'user').toLowerCase();
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (_) {
    return {};
  }
}

function $(id) {
  return document.getElementById(id);
}

function money(value) {
  return `₹${Number(value || 0).toFixed(2)}`;
}

function setText(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

function showMessage(id, text, type = 'success') {
  const el = $(id);
  if (!el) return;
  el.textContent = text;
  el.className = `message ${type}`;
}

function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'login.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });
}

function authHeaders(isJson = false) {
  const headers = { Authorization: `Bearer ${getToken()}` };
  if (isJson) headers['Content-Type'] = 'application/json';
  return headers;
}

async function apiRequest(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));

  if (res.status === 401) {
    localStorage.clear();
    window.location.replace('login.html');
    return null;
  }

  if (!res.ok) {
    throw new Error(data.message || data.error || 'Request failed');
  }

  return data;
}

function requireAuth(allowedRoles = ['admin', 'user']) {
  const token = getToken();
  const role = getRole();

  if (!token) {
    window.location.replace('login.html');
    return false;
  }

  if (!allowedRoles.includes(role)) {
    window.location.replace(role === 'admin' ? 'admin.html' : 'user.html');
    return false;
  }

  return true;
}

function logout() {
  localStorage.clear();
  window.location.replace('login.html');
}

function renderNavbar(subtitle = 'Professional quotation management') {
  const role = getRole();
  const isAdmin = role === 'admin';

  const links = isAdmin
    ? `
      <a href="admin.html">Dashboard</a>
      <a href="products.html">Products</a>
      <a href="quotation.html">Build Quotation</a>
      <a href="quotations.html">Quotations</a>
    `
    : `
      <a href="user.html">Dashboard</a>
      <a href="quotation.html">Build Quotation</a>
      <a href="quotations.html">My Quotations</a>
    `;

  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <nav class="navbar">
      <div class="brand">
        <div class="logo">P</div>
        <div>
          <h1>Plumber Quotation System</h1>
          <p>${subtitle}</p>
        </div>
      </div>

      <button class="hamburger" onclick="toggleMenu()">☰</button>

      <div class="nav-links" id="navLinks">
        ${links}
        <button onclick="logout()">Logout</button>
      </div>
    </nav>
    `
  );

  setActiveNav();
}

function toggleMenu() {
  const menu = document.getElementById("navLinks");
  if (menu) menu.classList.toggle("active");
}

async function loadSummary() {
  try {
    const [products, quotations] = await Promise.all([
      apiRequest(`${API}/products`, { headers: authHeaders() }),
      apiRequest(`${API}/quotations`, { headers: authHeaders() })
    ]);

    const totalProducts = Array.isArray(products) ? products.length : 0;
    const totalQuotations = Array.isArray(quotations) ? quotations.length : 0;
    const totalValue = Array.isArray(quotations)
      ? quotations.reduce((sum, q) => sum + Number(q.totalAmount || 0), 0)
      : 0;

    setText('productCount', totalProducts);
    setText('quotationCount', totalQuotations);
    setText('totalValue', money(totalValue));
    setText('userRole', getRole());
    showMessage('dashboardMessage', '');
  } catch (error) {
    showMessage('dashboardMessage', `Backend error: ${error.message}`, 'error');
  }
}
