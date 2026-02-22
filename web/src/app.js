const API_BASE = '/api';
const TELEGRAM_CHANNEL = 'https://t.me/FlashUSDTokens';

const state = {
  isAuthenticated: false,
  user: null,
  token: null,
  authMethod: 'wallet',
  theme: 'dark',
  sendData: null,
  referralCode: null,
  networkFees: {
    bsc: 0.5,
    eth: 5,
    trc20: 1,
    polygon: 0.5,
    solana: 0.25
  }
};

function generateReferralCode() {
  return 'FUSDT' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function getReferralLink(code) {
  return `${TELEGRAM_CHANNEL}?start=${code}`;
}

function shareToTelegram() {
  let code = localStorage.getItem('flash_usdt_referral_code');
  if (!code) {
    code = generateReferralCode();
    localStorage.setItem('flash_usdt_referral_code', code);
  }
  const link = getReferralLink(code);
  const message = `🚀 Join Flash USDT Sender - Fast, secure USDT transfers! Use my referral: ${code}\n\nJoin here: ${link}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`;
  window.open(telegramUrl, '_blank');
}

function shareToWhatsApp() {
  let code = localStorage.getItem('flash_usdt_referral_code');
  if (!code) {
    code = generateReferralCode();
    localStorage.setItem('flash_usdt_referral_code', code);
  }
  const link = getReferralLink(code);
  const message = `🚀 Join Flash USDT Sender - Fast, secure USDT transfers! Use my referral: ${code}\n\nJoin here: ${link}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

function showReferralModal() {
  let code = localStorage.getItem('flash_usdt_referral_code');
  if (!code) {
    code = generateReferralCode();
    localStorage.setItem('flash_usdt_referral_code', code);
  }
  const count = parseInt(localStorage.getItem('flash_usdt_referral_count') || '0');
  
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'referralModal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content" style="max-width:450px;">
      <div class="modal-header">
        <h2>📢 Invite Friends & Earn Rewards!</h2>
        <button class="modal-close" onclick="closeReferralModal()">&times;</button>
      </div>
      <div class="modal-body" style="text-align:center;">
        <p style="margin-bottom:20px;">Share your referral link and earn rewards!</p>
        <div style="background:rgba(0,255,255,0.1);padding:15px;border-radius:10px;margin-bottom:20px;">
          <div style="font-size:12px;color:#888;">Your Referral Code</div>
          <div style="font-size:24px;font-weight:bold;color:#FFD700;">${code}</div>
        </div>
        <div style="margin-bottom:20px;">
          <div style="font-size:12px;color:#888;">Total Referrals</div>
          <div style="font-size:32px;font-weight:bold;">${count}</div>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;">
          <button class="btn btn-primary" onclick="shareToTelegram()">📱 Telegram</button>
          <button class="btn" style="background:#25D366;color:#fff;" onclick="shareToWhatsApp()">💬 WhatsApp</button>
        </div>
        <button class="btn btn-outline" onclick="copyReferralLink()">📋 Copy Link</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.remove('hidden'), 10);
}

function closeReferralModal() {
  const modal = document.getElementById('referralModal');
  if (modal) {
    modal.classList.add('hidden');
    setTimeout(() => modal.remove(), 300);
  }
}

function copyReferralLink() {
  let code = localStorage.getItem('flash_usdt_referral_code');
  if (!code) {
    code = generateReferralCode();
    localStorage.setItem('flash_usdt_referral_code', code);
  }
  const link = getReferralLink(code);
  navigator.clipboard.writeText(link).then(() => {
    showToast('Referral link copied!', 'success');
  });
}

window.shareToTelegram = shareToTelegram;
window.shareToWhatsApp = shareToWhatsApp;
window.showReferralModal = showReferralModal;
window.closeReferralModal = closeReferralModal;
window.copyReferralLink = copyReferralLink;

const docsContent = {
  authentication: `
    <h3 id="docs-auth">Authentication</h3>
    <p>Flash USDT API supports three authentication methods:</p>
    
    <h4>1. Wallet Authentication</h4>
    <p>Connect using your cryptocurrency wallet address.</p>
    <div class="docs-code">// Wallet Auth Request
POST /api/auth/wallet
{
  "address": "0x..."
}</div>

    <h4>2. Email Authentication</h4>
    <p>Login with email and password.</p>
    <div class="docs-code">// Email Auth Request
POST /api/auth/email
{
  "email": "user@example.com",
  "password": "your-password"
}</div>

    <h4>3. API Key Authentication</h4>
    <p>Use API key for programmatic access.</p>
    <div class="docs-code">// API Key Auth
GET /api/balance
Headers:
  Authorization: FUSDT_your-api-key</div>
  `,
  
  endpoints: `
    <h3 id="docs-endpoints">API Endpoints</h3>
    
    <h4>Send USDT</h4>
    <div class="docs-code">POST /api/send
{
  "network": "bsc",
  "to": "0x...",
  "amount": 100,
  "memo": "optional"
}</div>

    <h4>Check Balance</h4>
    <div class="docs-code">GET /api/balance?network=bsc</div>

    <h4>Transaction History</h4>
    <div class="docs-code">GET /api/history?limit=10&network=all</div>

    <h4>Get Gas Price</h4>
    <div class="docs-code">GET /api/gas?network=bsc</div>

    <h4>Supported Networks</h4>
    <table class="docs-table">
      <tr><th>Network</th><th>Chain ID</th><th>Symbol</th></tr>
      <tr><td>bsc</td><td>56</td><td>BEP20</td></tr>
      <tr><td>eth</td><td>1</td><td>ERC20</td></tr>
      <tr><td>trc20</td><td>-</td><td>TRC20</td></tr>
      <tr><td>polygon</td><td>137</td><td>MATIC</td></tr>
      <tr><td>solana</td><td>-</td><td>SPL</td></tr>
    </table>
  `,
  
  errors: `
    <h3 id="docs-errors">Error Codes</h3>
    <table class="docs-table">
      <tr><th>Code</th><th>Message</th><th>Description</th></tr>
      <tr><td><code>AUTH_001</code></td><td>Invalid credentials</td><td>Wrong email/password</td></tr>
      <tr><td><code>AUTH_002</code></td><td>Token expired</td><td>Session expired</td></tr>
      <tr><td><code>AUTH_003</code></td><td>Invalid API key</td><td>API key not found</td></tr>
      <tr><td><code>SEND_001</code></td><td>Insufficient balance</td><td>Not enough USDT</td></tr>
      <tr><td><code>SEND_002</code></td><td>Invalid address</td><td>Wrong recipient format</td></tr>
      <tr><td><code>SEND_003</code></td><td>Network error</td><td>Blockchain connection failed</td></tr>
      <tr><td><code>TX_001</code></td><td>Transaction failed</td><td>Blockchain rejection</td></tr>
      <tr><td><code>TX_002</code></td><td>Pending</td><td>Transaction pending confirmation</td></tr>
    </table>
  `
};

function init() {
  loadAuthState();
  loadTheme();
  setupEventListeners();
  loadDocs();
  checkAuth();
  initParticles();
  loadSavedForm();
}

function loadAuthState() {
  const savedAuth = localStorage.getItem('flash_usdt_auth');
  if (savedAuth) {
    const auth = JSON.parse(savedAuth);
    state.isAuthenticated = true;
    state.user = auth.user;
    state.token = auth.token;
  }
}

function saveAuthState() {
  localStorage.setItem('flash_usdt_auth', JSON.stringify({
    user: state.user,
    token: state.token
  }));
}

function clearAuthState() {
  localStorage.removeItem('flash_usdt_auth');
  state.isAuthenticated = false;
  state.user = null;
  state.token = null;
}

function loadTheme() {
  const savedTheme = localStorage.getItem('flash_usdt_theme') || 'dark';
  state.theme = savedTheme;
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon();
}

function saveTheme() {
  localStorage.setItem('flash_usdt_theme', state.theme);
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  updateThemeIcon();
  saveTheme();
}

function updateThemeIcon() {
  const icon = document.querySelector('.theme-icon');
  if (icon) {
    icon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  }
}

function setupEventListeners() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
  });

  document.querySelectorAll('.action-card').forEach(card => {
    card.addEventListener('click', () => navigateTo(card.dataset.action));
  });

  document.getElementById('loginBtn').addEventListener('click', showAuthPanel);
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => switchAuthMethod(tab.dataset.method));
  });

  document.getElementById('authForm').addEventListener('submit', handleAuth);
  document.getElementById('sendForm').addEventListener('submit', handleSend);

  document.querySelectorAll('.auth-panel').forEach(panel => {
    panel.addEventListener('click', (e) => {
      if (e.target === panel) hideAuthPanel();
    });
  });

  document.getElementById('sendForm').addEventListener('input', updateSendSummary);
  document.getElementById('sendForm').addEventListener('change', saveFormDraft);

  const recipientInput = document.querySelector('input[name="recipient"]');
  if (recipientInput) {
    recipientInput.addEventListener('blur', validateAddress);
    recipientInput.addEventListener('input', clearValidation);
  }

  const amountInput = document.querySelector('input[name="amount"]');
  if (amountInput) {
    amountInput.addEventListener('input', validateAmount);
  }

  document.getElementById('confirmModalClose')?.addEventListener('click', hideConfirmModal);
  document.getElementById('confirmCancel')?.addEventListener('click', hideConfirmModal);
  document.getElementById('confirmSend')?.addEventListener('click', executeSend);

  document.getElementById('addressBookClose')?.addEventListener('click', hideAddressBook);
  document.getElementById('addAddressForm')?.addEventListener('submit', handleAddAddress);
  document.getElementById('addressBookBtn')?.addEventListener('click', showAddressBook);

  document.getElementById('buyAmount')?.addEventListener('input', updateBuyCalculation);
  document.getElementById('buyCurrency')?.addEventListener('change', updateBuyCalculation);
  document.getElementById('receiveNetwork')?.addEventListener('change', updateBuyCalculation);
  document.getElementById('buyNowBtn')?.addEventListener('click', handleBuyNow);

  document.addEventListener('keydown', handleKeyboard);
}

function handleKeyboard(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  if (e.key === 's' || e.key === 'S') {
    if (state.isAuthenticated) navigateTo('send');
  } else if (e.key === 'b' || e.key === 'B') {
    if (state.isAuthenticated) navigateTo('balance');
  } else if (e.key === 'h' || e.key === 'H') {
    if (state.isAuthenticated) navigateTo('history');
  } else if (e.key === 'Escape') {
    hideConfirmModal();
    hideAddressBook();
    hideAuthPanel();
  }
}

function navigateTo(page) {
  if (!state.isAuthenticated && ['send', 'balance', 'history'].includes(page)) {
    showAuthPanel();
    return;
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  const targetPage = document.getElementById(`${page}Page`);
  const targetBtn = document.querySelector(`.nav-btn[data-page="${page}"]`);
  
  if (targetPage) targetPage.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');

  if (page === 'balance') loadBalance();
  if (page === 'history') loadHistory();
  if (page === 'docs') loadDocs();
  if (page === 'send') loadRecentRecipients();
}

function checkAuth() {
  if (state.isAuthenticated) {
    document.getElementById('loginBtn').classList.add('hidden');
    document.getElementById('userMenu').classList.remove('hidden');
    document.getElementById('userAddress').textContent = formatAddress(state.user?.address || state.user?.email || state.user?.apiKey);
  } else {
    document.getElementById('loginBtn').classList.remove('hidden');
    document.getElementById('userMenu').classList.add('hidden');
  }
}

function formatAddress(addr) {
  if (!addr) return '';
  if (addr.length > 20) {
    return addr.substring(0, 6) + '...' + addr.substring(addr.length - 4);
  }
  return addr;
}

function showAuthPanel() {
  document.getElementById('authPanel').classList.remove('hidden');
}

function hideAuthPanel() {
  document.getElementById('authPanel').classList.add('hidden');
}

function switchAuthMethod(method) {
  state.authMethod = method;
  
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.method === method);
  });
  
  document.querySelectorAll('.auth-method').forEach(m => {
    m.classList.toggle('hidden', m.dataset.method !== method);
  });
}

async function handleAuth(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const method = state.authMethod;
  
  let data = {};
  
  if (method === 'wallet') {
    data = { address: formData.get('walletAddress') };
  } else if (method === 'email') {
    data = { email: formData.get('email'), password: formData.get('password') };
  } else if (method === 'api') {
    data = { apiKey: formData.get('apiKey') };
  }

  showToast('Authenticating...', 'info');

  await simulateApiCall(1500);

  state.isAuthenticated = true;
  state.user = data;
  state.token = 'mock-token-' + Date.now();
  
  saveAuthState();
  checkAuth();
  hideAuthPanel();
  showToast('Authentication successful!', 'success');
}

function logout() {
  clearAuthState();
  checkAuth();
  navigateTo('home');
  showToast('Logged out successfully', 'info');
}

function validateAddress(e) {
  const address = e.target.value.trim();
  const msgEl = e.target.nextElementSibling;
  
  if (!address) return;
  
  const isValid = /^0x[a-fA-F0-9]{40}$/.test(address) || /^[T1][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address);
  
  e.target.classList.remove('valid', 'invalid');
  e.target.classList.add(isValid ? 'valid' : 'invalid');
  
  if (msgEl && msgEl.classList.contains('validation-msg')) {
    msgEl.textContent = isValid ? '✓ Valid address' : '✗ Invalid address format';
    msgEl.className = `validation-msg ${isValid ? 'success' : 'error'}`;
  }
}

function clearValidation(e) {
  e.target.classList.remove('valid', 'invalid');
  const msgEl = e.target.nextElementSibling;
  if (msgEl && msgEl.classList.contains('validation-msg')) {
    msgEl.textContent = '';
  }
}

function validateAmount(e) {
  const amount = parseFloat(e.target.value);
  if (amount < 0) {
    e.target.value = 0;
  }
}

function updateSendSummary() {
  const amount = document.querySelector('input[name="amount"]').value || '0.00';
  const network = document.querySelector('select[name="network"]').value || 'bsc';
  const fee = state.networkFees[network] || 1;
  
  document.getElementById('summaryAmount').textContent = `${parseFloat(amount).toFixed(2)} USDT`;
  
  const feeEl = document.querySelector('.summary-row:nth-child(2) span:last-child');
  if (feeEl) {
    feeEl.textContent = `~${fee} USDT`;
  }
}

function saveFormDraft() {
  const form = document.getElementById('sendForm');
  if (!form) return;
  
  const formData = new FormData(form);
  const draft = {
    network: formData.get('network'),
    recipient: formData.get('recipient'),
    amount: formData.get('amount'),
    memo: formData.get('memo')
  };
  
  localStorage.setItem('flash_usdt_draft', JSON.stringify(draft));
}

function loadSavedForm() {
  const draft = localStorage.getItem('flash_usdt_draft');
  if (!draft) return;
  
  try {
    const data = JSON.parse(draft);
    const form = document.getElementById('sendForm');
    if (!form) return;
    
    if (data.network) form.querySelector('select[name="network"]').value = data.network;
    if (data.recipient) form.querySelector('input[name="recipient"]').value = data.recipient;
    if (data.amount) form.querySelector('input[name="amount"]').value = data.amount;
    if (data.memo) form.querySelector('input[name="memo"]').value = data.memo;
    
    updateSendSummary();
  } catch (e) {}
}

async function handleSend(e) {
  e.preventDefault();
  
  if (!state.isAuthenticated) {
    showAuthPanel();
    return;
  }

  const form = e.target;
  const formData = new FormData(form);
  const data = {
    network: formData.get('network'),
    to: formData.get('recipient'),
    amount: parseFloat(formData.get('amount')),
    memo: formData.get('memo')
  };

  const addressValid = /^0x[a-fA-F0-9]{40}$/.test(data.to) || /^[T1][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(data.to);
  
  if (!addressValid) {
    showToast('Please enter a valid recipient address', 'error');
    return;
  }

  if (!data.amount || data.amount <= 0) {
    showToast('Please enter a valid amount', 'error');
    return;
  }

  state.sendData = data;
  showConfirmModal();
}

function showConfirmModal() {
  const data = state.sendData;
  const fee = state.networkFees[data.network] || 1;
  const total = data.amount + fee;
  const networkNames = {
    bsc: '🟡 BEP20 (BSC)',
    eth: '🔷 ERC20 (Ethereum)',
    trc20: '🔴 TRC20 (Tron)',
    polygon: '🟣 POLYGON',
    solana: '🟠 SOLANA'
  };

  document.getElementById('confirmNetwork').textContent = networkNames[data.network] || data.network;
  document.getElementById('confirmRecipient').textContent = formatAddress(data.to);
  document.getElementById('confirmAmount').textContent = `${data.amount.toFixed(2)} USDT`;
  document.getElementById('confirmFee').textContent = `~${fee} USDT`;
  document.getElementById('confirmTotal').textContent = `${total.toFixed(2)} USDT`;
  
  document.getElementById('confirmModal').classList.remove('hidden');
}

function hideConfirmModal() {
  document.getElementById('confirmModal').classList.add('hidden');
  state.sendData = null;
}

async function executeSend() {
  if (!state.sendData) return;

  const btn = document.getElementById('confirmSend');
  btn.disabled = true;
  btn.textContent = 'Sending...';

  hideConfirmModal();
  showToast('Sending USDT...', 'info');

  await simulateApiCall(2000);

  btn.disabled = false;
  btn.textContent = 'Confirm Send';

  showToast('USDT sent successfully!', 'success');
  
  saveRecentRecipient(state.sendData.to);
  localStorage.removeItem('flash_usdt_draft');
  document.getElementById('sendForm').reset();
  updateSendSummary();
  state.sendData = null;
}

function showAddressBook() {
  loadAddressList();
  document.getElementById('addressBookModal').classList.remove('hidden');
}

function hideAddressBook() {
  document.getElementById('addressBookModal').classList.add('hidden');
}

function getAddressBook() {
  return JSON.parse(localStorage.getItem('flash_usdt_addressbook') || '[]');
}

function saveAddressBook(book) {
  localStorage.setItem('flash_usdt_addressbook', JSON.stringify(book));
}

function handleAddAddress(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  const book = getAddressBook();
  book.push({
    name: formData.get('addressName'),
    address: formData.get('addressValue')
  });
  saveAddressBook(book);
  
  e.target.reset();
  loadAddressList();
  showToast('Address added to book', 'success');
}

function loadAddressList() {
  const book = getAddressBook();
  const list = document.getElementById('addressList');
  
  if (book.length === 0) {
    list.innerHTML = '<p class="address-empty">No saved addresses</p>';
    return;
  }

  list.innerHTML = book.map((item, index) => `
    <div class="address-item" onclick="useAddress('${item.address}')">
      <div class="address-info">
        <span class="address-name">${item.name}</span>
        <span class="address-value">${formatAddress(item.address)}</span>
      </div>
      <button class="address-delete" onclick="event.stopPropagation(); deleteAddress(${index})" aria-label="Delete">🗑️</button>
    </div>
  `).join('');
}

window.useAddress = function(address) {
  document.querySelector('input[name="recipient"]').value = address;
  validateAddress({ target: { value: address, classList: '', nextElementSibling: document.querySelector('input[name="recipient"]').nextElementSibling } });
  hideAddressBook();
  showToast('Address selected', 'info');
};

window.deleteAddress = function(index) {
  const book = getAddressBook();
  book.splice(index, 1);
  saveAddressBook(book);
  loadAddressList();
  showToast('Address removed', 'info');
};

async function loadBalance() {
  const cards = document.querySelectorAll('.balance-card');
  
  cards.forEach(card => {
    const amountEl = card.querySelector('.balance-amount');
    const originalText = amountEl.textContent;
    amountEl.innerHTML = '<span class="skeleton" style="display:inline-block;width:60px;height:24px;"></span>';
  });

  await simulateApiCall(1000);

  const balances = {
    bsc: Math.random() * 1000,
    eth: Math.random() * 500,
    trc20: Math.random() * 800,
    polygon: Math.random() * 300,
    solana: Math.random() * 200
  };

  let total = 0;
  const networkNames = { bsc: '🟡 BEP20', eth: '🔷 ERC20', trc20: '🔴 TRC20', polygon: '🟣 POLYGON', solana: '🟠 SOLANA' };
  
  cards.forEach(card => {
    const network = Object.keys(networkNames).find(k => networkNames[k] === card.querySelector('.balance-network').textContent);
    const balance = balances[network] || 0;
    total += balance;
    
    card.querySelector('.balance-amount').textContent = balance.toFixed(2);
    card.querySelector('.balance-usd').textContent = `$${balance.toFixed(2)} USD`;
  });

  document.getElementById('totalBalance').textContent = `${total.toFixed(2)} USDT`;
}

async function loadHistory() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '<div class="history-empty"><span class="empty-icon">⏳</span><p>Loading...</p></div>';

  await simulateApiCall(800);

  const mockHistory = [
    { type: 'sent', to: '0x742d35Cc6634C0532925a3b844Bc9e7595f...', amount: 150, network: 'bsc', status: 'completed', date: '2024-01-15' },
    { type: 'received', from: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', amount: 500, network: 'eth', status: 'completed', date: '2024-01-14' },
    { type: 'sent', to: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', amount: 75, network: 'polygon', status: 'pending', date: '2024-01-13' }
  ];

  if (mockHistory.length === 0) {
    historyList.innerHTML = '<div class="history-empty"><span class="empty-icon">📜</span><p>No transactions yet</p></div>';
    return;
  }

  historyList.innerHTML = mockHistory.map(tx => `
    <div class="history-item">
      <div class="history-info">
        <div class="history-icon ${tx.type}">${tx.type === 'sent' ? '📤' : '📥'}</div>
        <div class="history-details">
          <h4>${tx.type === 'sent' ? 'Sent to' : 'Received from'}</h4>
          <p>${tx.type === 'sent' ? tx.to : tx.from}</p>
        </div>
      </div>
      <div class="history-meta">
        <div class="history-amount ${tx.type}">${tx.type === 'sent' ? '-' : '+'}${tx.amount} USDT</div>
        <div class="history-status ${tx.status}">${tx.status}</div>
      </div>
    </div>
  `).join('');
}

function loadDocs() {
  const docsContentEl = document.getElementById('docsContent');
  docsContentEl.innerHTML = docsContent.authentication + docsContent.endpoints + docsContent.errors;
}

function saveRecentRecipient(address) {
  let recent = JSON.parse(localStorage.getItem('recent_recipients') || '[]');
  recent = recent.filter(a => a !== address);
  recent.unshift(address);
  recent = recent.slice(0, 5);
  localStorage.setItem('recent_recipients', JSON.stringify(recent));
  loadRecentRecipients();
}

function loadRecentRecipients() {
  const recent = JSON.parse(localStorage.getItem('recent_recipients') || '[]');
  const list = document.getElementById('recentList');
  
  if (!list) return;
  
  if (recent.length === 0) {
    list.innerHTML = '<p style="color: var(--text-muted); text-align: center;">No recent recipients</p>';
    return;
  }

  list.innerHTML = recent.map(addr => `
    <div class="recent-item" onclick="fillRecipient('${addr}')">
      <span class="recent-address">${formatAddress(addr)}</span>
    </div>
  `).join('');
}

function fillRecipient(address) {
  navigateTo('send');
  document.querySelector('input[name="recipient"]').value = address;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function simulateApiCall(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 15000);
    
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 255, ${p.alpha})`;
      ctx.fill();
    });

    particles.forEach((p1, i) => {
      particles.slice(i + 1).forEach(p2 => {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 255, 255, ${0.15 * (1 - dist / 100)})`;
          ctx.stroke();
        }
      });
    });

    animationId = requestAnimationFrame(drawParticles);
  }

  resize();
  createParticles();
  drawParticles();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
}

document.addEventListener('DOMContentLoaded', init);

window.navigateTo = navigateTo;
window.fillRecipient = fillRecipient;

const exchangeRates = {
  USD: 1.00,
  EUR: 0.92,
  GBP: 0.79,
  BDT: 110.00
};

const buyNetworkFees = {
  bsc: 1,
  eth: 5,
  trc20: 1,
  polygon: 0.5
};

function updateBuyCalculation() {
  const buyAmount = parseFloat(document.getElementById('buyAmount')?.value) || 0;
  const currency = document.getElementById('buyCurrency')?.value || 'USD';
  const network = document.getElementById('receiveNetwork')?.value || 'bsc';
  
  const rate = exchangeRates[currency] || 1;
  const fee = buyNetworkFees[network] || 1;
  
  const usdtAmount = (buyAmount / rate);
  const finalAmount = usdtAmount - fee;
  
  const receiveInput = document.getElementById('receiveAmount');
  if (receiveInput) {
    receiveInput.value = finalAmount > 0 ? finalAmount.toFixed(2) : '0.00';
  }
  
  const rateEl = document.getElementById('exchangeRate');
  if (rateEl) {
    rateEl.textContent = rate.toFixed(2);
  }
  
  const currencyEl = document.querySelector('.currency-symbol');
  if (currencyEl) {
    currencyEl.textContent = currency;
  }
  
  const feeEl = document.getElementById('buyFee');
  if (feeEl) {
    feeEl.textContent = fee.toFixed(2);
  }
}

function handleBuyNow() {
  const walletAddress = document.getElementById('walletAddress')?.value;
  const buyAmount = parseFloat(document.getElementById('buyAmount')?.value);
  const currency = document.getElementById('buyCurrency')?.value || 'USD';
  const network = document.getElementById('receiveNetwork')?.value || 'bsc';
  const receiveAmount = parseFloat(document.getElementById('receiveAmount')?.value) || 0;
  
  if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
    showToast('Please enter a valid wallet address', 'error');
    return;
  }
  
  if (!buyAmount || buyAmount <= 0) {
    showToast('Please enter a valid amount', 'error');
    return;
  }
  
  if (receiveAmount <= 0) {
    showToast('Amount too small to cover network fees', 'error');
    return;
  }
  
  showToast('Redirecting to payment provider...', 'info');
  
  setTimeout(() => {
    showToast('Order placed! USDT will be sent to your wallet once payment is confirmed.', 'success');
    
    const purchases = JSON.parse(localStorage.getItem('flash_usdt_purchases') || '[]');
    purchases.unshift({
      id: 'TXN' + Date.now(),
      wallet: walletAddress,
      amount: receiveAmount,
      network: network,
      fiatAmount: buyAmount,
      currency: currency,
      status: 'pending',
      date: new Date().toISOString()
    });
    localStorage.setItem('flash_usdt_purchases', JSON.stringify(purchases));
    
    document.getElementById('buyAmount').value = '';
    updateBuyCalculation();
  }, 2000);
}
