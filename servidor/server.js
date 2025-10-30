// Importamos los módulos necesarios
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises'; // Usamos promesas de File System
import path from 'path';

// --- CONFIGURACIÓN INICIAL ---
const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), 'db.json');
const SECRET_TOKEN = "mi-token-secreto-123"; // Token para simular seguridad

// --- MIDDLEWARES ---
app.use(cors()); // Permite peticiones de otros dominios (tu cliente)
app.use(express.json()); // Parsea automáticamente el body de las peticiones a JSON

// --- FUNCIONES HELPER (Base de Datos) ---

// Lee la base de datos (nuestro archivo JSON)
const readDb = async () => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // Si no existe, creamos uno
        const newDb = { products: [] };
        await writeDb(newDb);
        return newDb;
    }
};

// Escribe en la base de datos
const writeDb = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
};

// --- MIDDLEWARE DE SEGURIDAD ---
// Esto responde a la pregunta 3 del caso de estudio
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    // El token debe venir como "Bearer MI-TOKEN-SECRETO-123"
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: "No autorizado: Token no provisto." });
    }

    if (token !== SECRET_TOKEN) {
        return res.status(403).json({ message: "Prohibido: Token inválido." });
    }
    
    // Si el token es válido, continuamos
    next();
};

// --- ENDPOINTS DE LA API ---

// 1. LOGIN (No protegido)
// Simula un login. Si el usuario es correcto, devuelve el token.
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // Validación de prototipo: usuario 'admin', contraseña '1234'
    if (username === 'admin' && password === '1234') {
        res.json({
            message: "Login exitoso",
            token: SECRET_TOKEN 
        });
    } else {
        res.status(401).json({ message: "Usuario o contraseña incorrectos" });
    }
});

// 2. OBTENER TODOS LOS PRODUCTOS (Protegido)
app.get('/api/products', authMiddleware, async (req, res) => {
    const db = await readDb();
    res.json(db.products);
});

// 3. CREAR UN PRODUCTO (Protegido)
app.post('/api/products', authMiddleware, async (req, res) => {
    const { sku, name, quantity } = req.body;

    // Validación de servidor (¡importante!)
    if (!sku || !name || quantity == null) {
        return res.status(400).json({ message: "Datos incompletos (sku, name, quantity)" });
    }

    const db = await readDb();
    const newProduct = {
        id: Date.now().toString(), // Usamos un timestamp como ID único
        sku,
        name,
        quantity: parseInt(quantity)
    };
    db.products.push(newProduct);
    await writeDb(db);

    res.status(201).json(newProduct);
});

// 4. ACTUALIZAR UN PRODUCTO (Protegido)
app.put('/api/products/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { sku, name, quantity } = req.body;
    
    if (!sku || !name || quantity == null) {
        return res.status(400).json({ message: "Datos incompletos" });
    }

    const db = await readDb();
    const productIndex = db.products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return res.status(404).json({ message: "Producto no encontrado" });
    }

    db.products[productIndex] = {
        ...db.products[productIndex], // Mantenemos el ID
        sku,
        name,
        quantity: parseInt(quantity)
    };
    await writeDb(db);
    
    res.json(db.products[productIndex]);
});

// 5. ELIMINAR UN PRODUCTO (Protegido)
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    
    const db = await readDb();
    const productIndex = db.products.findIndex(p => p.id === id);

    if (productIndex === -1) {
        return res.status(404).json({ message: "Producto no encontrado" });
    }

    db.products.splice(productIndex, 1); // Eliminamos el producto del array
    await writeDb(db);

    res.status(200).json({ message: "Producto eliminado" });
});

// --- INICIAR SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});