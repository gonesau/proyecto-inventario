/* js/app.js (Versión Local con Fetch) */

// =================================================================
// 1. CONFIGURACIÓN Y REFERENCIAS AL DOM
// =================================================================

const API_URL = 'http://localhost:3000/api'; // La URL de tu servidor local
let authToken = null; // Aquí guardaremos el token de seguridad

// Contenedores
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');

// Login/Logout
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const btnLogout = document.getElementById('btn-logout');

// Formulario y Modal
const productModal = new bootstrap.Modal(document.getElementById('product-modal'));
const productForm = document.getElementById('product-form');
const productModalTitle = document.getElementById('product-modal-title');
const productIdField = document.getElementById('product-id');

// Tabla
const productTableBody = document.getElementById('product-table-body');

// =================================================================
// 2. LÓGICA DE AUTENTICACIÓN
// =================================================================

// Interceptamos el envío del formulario de login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('d-none'); // Ocultamos errores previos

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            // response.ok es false si el status es 4xx o 5xx
            throw new Error(data.message || 'Error en el servidor');
        }

        // --- Login Exitoso ---
        authToken = data.token; // Guardamos el token
        // Guardamos el token en localStorage para persistir la sesión (opcional pero robusto)
        localStorage.setItem('authToken', authToken); 
        
        showApp(); // Mostramos la app

    } catch (error) {
        loginError.textContent = error.message;
        loginError.classList.remove('d-none');
    }
});

// Botón de Salir
btnLogout.addEventListener('click', () => {
    authToken = null;
    localStorage.removeItem('authToken');
    showLogin();
});

// Revisamos si ya existe un token al cargar la página
function checkSession() {
    const token = localStorage.getItem('authToken');
    if (token) {
        authToken = token;
        showApp();
    } else {
        showLogin();
    }
}

// Funciones para mostrar/ocultar contenedores
function showApp() {
    loginContainer.classList.add('d-none');
    appContainer.classList.remove('d-none');
    loadProducts(); // Cargamos los productos al mostrar la app
}

function showLogin() {
    appContainer.classList.add('d-none');
    loginContainer.classList.remove('d-none');
    productTableBody.innerHTML = ''; // Limpiamos la tabla
}

// =================================================================
// 3. LÓGICA DE NEGOCIO (CRUD con Fetch)
// =================================================================

/**
 * Función genérica para peticiones 'fetch' que incluye el token.
 * Esto hace el código más robusto y mantenible.
 */
async function apiFetch(endpoint, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}` // ¡Aquí va la seguridad!
    };

    options.headers = { ...defaultHeaders, ...options.headers };

    const response = await fetch(`${API_URL}${endpoint}`, options);

    if (response.status === 401 || response.status === 403) {
        // Token inválido o expirado
        alert('Sesión inválida. Por favor, inicia sesión de nuevo.');
        btnLogout.click(); // Forzamos el logout
        return null;
    }

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la petición a la API');
    }

    // Si la respuesta no tiene contenido (como un DELETE)
    if (response.status === 204 || response.status === 200 && response.headers.get('content-length') === '0') {
        return { ok: true };
    }

    return response.json();
}

/**
 * Carga los productos de la API. (Read)
 */
async function loadProducts() {
    if (!authToken) return; // No hacer nada si no estamos logueados

    try {
        const products = await apiFetch('/products');
        
        productTableBody.innerHTML = ''; // Limpiamos la tabla
        if (products) {
            products.forEach(product => {
                renderProductRow(product.id, product);
            });
        }
    } catch (error) {
        console.error("Error al cargar productos:", error);
        alert(error.message);
    }
}

/**
 * Inserta una fila de producto en la tabla HTML.
 */
function renderProductRow(id, product) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${product.sku}</td>
        <td>${product.name}</td>
        <td>${product.quantity}</td>
        <td class="text-end">
            <button class="btn btn-sm btn-outline-secondary btn-edit" data-id="${id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${id}">Eliminar</button>
        </td>
    `;
    productTableBody.appendChild(tr);
}

/**
 * Manejador del formulario (para Crear y Actualizar).
 */
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const sku = document.getElementById('product-sku').value;
    const name = document.getElementById('product-name').value;
    const quantity = document.getElementById('product-quantity').value;
    const id = productIdField.value;

    if (!sku || !name || quantity === '') {
        alert('Por favor, completa todos los campos.');
        return;
    }

    const productData = { sku, name, quantity: parseInt(quantity) };

    try {
        if (id) {
            // --- Lógica de ACTUALIZAR (Update) ---
            await apiFetch(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
        } else {
            // --- Lógica de CREAR (Create) ---
            await apiFetch('/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
        }

        productModal.hide();
        loadProducts(); // Recargamos la lista

    } catch (error) {
        console.error("Error al guardar producto:", error);
        alert(error.message);
    }
});

/**
 * Manejador de clics en la tabla para EDITAR y ELIMINAR.
 * (Delegación de Eventos)
 */
productTableBody.addEventListener('click', async (e) => {
    const target = e.target;
    const productId = target.dataset.id;
    if (!productId) return;

    try {
        if (target.classList.contains('btn-delete')) {
            // --- Lógica de ELIMINAR (Delete) ---
            if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                await apiFetch(`/products/${productId}`, { method: 'DELETE' });
                loadProducts(); // Recargamos la lista
            }
        }

        if (target.classList.contains('btn-edit')) {
            // --- Lógica de EDITAR (Cargar datos) ---
            // Buscamos el producto en la tabla (no necesitamos otra llamada a la API si ya lo tenemos)
            const row = target.closest('tr');
            const cells = row.querySelectorAll('td');

            // Llenamos el formulario
            productIdField.value = productId;
            document.getElementById('product-sku').value = cells[0].textContent;
            document.getElementById('product-name').value = cells[1].textContent;
            document.getElementById('product-quantity').value = cells[2].textContent;
            
            productModalTitle.textContent = 'Editar Producto';
            productModal.show();
        }
    } catch (error) {
        console.error("Error en acción de producto:", error);
        alert(error.message);
    }
});

/**
 * Limpiamos el formulario cuando el modal se cierra.
 */
document.getElementById('product-modal').addEventListener('hidden.bs.modal', () => {
    productForm.reset();
    productIdField.value = '';
    productModalTitle.textContent = 'Agregar Producto';
});

// --- INICIO DE LA APLICACIÓN ---
checkSession();