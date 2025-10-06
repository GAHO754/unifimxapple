// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const $ = (sel) => document.querySelector(sel);

const form = $('#leadForm');
const statusEl = $('#status');
const btn = $('#btnSubmit');

const setError = (id, msg) => {
  const small = document.querySelector(`.err[data-for="${id}"]`);
  if (small) small.textContent = msg || '';
};

const clearErrors = () => {
  ['fullName','email','phone','birthday','terms'].forEach(k => setError(k, ''));
  statusEl.textContent = '';
  statusEl.className = 'status';
};

const validate = () => {
  let ok = true;
  const fullName = $('#fullName').value.trim();
  const email = $('#email').value.trim();
  const phone = $('#phone').value.trim();
  const birthday = $('#birthday').value;
  const terms = $('#terms').checked;

  clearErrors();

  if (fullName.length < 3) { setError('fullName','Ingresa tu nombre completo.'); ok = false; }
  // Email simple
  if (!/^\S+@\S+\.\S{2,}$/.test(email)) { setError('email','Correo no válido.'); ok = false; }
  // Tel mexicano 10 dígitos
  if (!/^[0-9]{10}$/.test(phone)) { setError('phone','Debe tener 10 dígitos.'); ok = false; }
  if (!birthday) { setError('birthday','Selecciona tu fecha de cumpleaños.'); ok = false; }
  if (!terms) { setError('terms','Debes aceptar los términos.'); ok = false; }

  return ok;
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) return;

  btn.disabled = true;
  statusEl.textContent = 'Guardando...';
  statusEl.className = 'status';

  const payload = {
    fullName: $('#fullName').value.trim(),
    email: $('#email').value.trim().toLowerCase(),
    phone: $('#phone').value.trim(),
    birthday: $('#birthday').value,             // YYYY-MM-DD (string)
    termsAccepted: $('#terms').checked,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    source: 'webform'
  };

  try {
  await db.collection('leads').add(payload);
  statusEl.textContent = '¡Gracias! Espera ofertas y promociones muy pronto. ';
  statusEl.className = 'status ok';

  // ✅ Limpia el borrador porque ya se guardó bien
  if (window.__leadDraft && typeof window.__leadDraft.clear === 'function') {
    window.__leadDraft.clear();
  }

  form.reset();
} catch (err) {
  console.error(err);
  statusEl.textContent = 'Ocurrió un error al guardar. Intenta de nuevo.';
  statusEl.className = 'status bad';
} finally {
  btn.disabled = false;
}

});
