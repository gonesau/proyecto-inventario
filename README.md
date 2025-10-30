# Prototipo: Control de Inventario (Caso de Estudio)

Este es un prototipo funcional desarrollado como solución al "Caso de Estudio 2: Aplicación de Control de Inventario". El proyecto demuestra una arquitectura Cliente-Servidor completa, auto-alojada (*self-hosted*), que incluye:

1.  Un **Servicio Remoto (Backend)**: Una API RESTful construida con Node.js y Express.
2.  Un **Cliente (Frontend)**: Una Aplicación de Página Única (SPA) construida con HTML, Bootstrap 5 y JavaScript (Fetch API).

---

## CONTEXTO: EL CASO DE ESTUDIO

El proyecto responde a los siguientes requisitos:

> **Caso 2: Aplicación de Control de Inventario con Sincronización Remota**
> Una tienda necesita una aplicación que gestione productos localmente, pero que
> también:
> • Sincronice la información con un servicio remoto mediante API o Web
> Service.
> • Permita registrar, actualizar y eliminar productos.
> • Muestre los datos en una interfaz funcional (web, escritorio o móvil).
>
> **Preguntas de análisis:**
> 1. Presente el diseño de la arquitectura, indicando los módulos principales.
> 2. Describa el proceso de integración con el servicio remoto y la forma de
> serializar los datos.
> 3. Mencione las medidas de seguridad aplicadas en las transacciones o
> comunicaciones.

---

## 🚀 Arquitectura

El proyecto está dividido en dos componentes principales que se ejecutan de forma independiente:



* **`servidor/`**: El backend (API REST) que maneja toda la lógica de negocio, la seguridad y la persistencia de datos (en un archivo `db.json`).
* **`cliente/`**: El frontend (SPA) que el usuario ve en el navegador. Es una interfaz de usuario pura que consume la API del servidor.

---

## ✨ Características

* **Autenticación de Prototipo**: Login simple que entrega un "token" de seguridad.
* **Seguridad de API**: Endpoints protegidos. El cliente debe enviar un *Bearer Token* válido para realizar operaciones.
* **Gestión de Productos (CRUD)**:
    * **C**reate (Crear): Agregar nuevos productos a través de un modal.
    * **R**ead (Leer): Listar todos los productos en una tabla.
    * **U**pdate (Actualizar): Editar la información de un producto existente.
    * **D**elete (Eliminar): Borrar productos de la base de datos.
* **Serialización JSON**: Toda la comunicación entre el cliente y el servidor se realiza enviando y recibiendo datos en formato JSON.
* **Interfaz Responsiva**: Creada con Bootstrap 5 para funcionar en escritorio y móvil.

---

## 🛠️ Stack Tecnológico

### Backend (servidor/)
* **Node.js**: Entorno de ejecución de JavaScript.
* **Express.js**: Framework para la creación de la API RESTful.
* **CORS**: Middleware para permitir la comunicación entre el cliente y el servidor (que corren en puertos diferentes).
* **Base de Datos**: Un archivo `db.json` como base de datos de archivo plano para el prototipo.

### Frontend (cliente/)
* **HTML5**
* **Bootstrap 5**: Framework CSS para la UI y responsividad.
* **JavaScript (ES6+)**: Lógica de la aplicación, manejo del DOM y eventos.
* **Fetch API**: Para realizar peticiones HTTP asíncronas al backend.

---

## 🏁 Cómo Levantar el Proyecto

Para ejecutar este prototipo, necesitas tener **Node.js** y **npm** instalados. El proyecto requiere que se levanten **dos servidores** en terminales separadas.

### 1. Levantar el Servidor (Backend)

```bash
# 1. Abre una terminal
# 2. Navega a la carpeta del servidor
cd servidor/

# 3. Instala las dependencias (solo la primera vez)
npm install

# 4. Inicia el servidor
npm start

# El servidor estará corriendo en http://localhost:3000
```

# 1. Abre una SEGUNDA terminal
# 2. Navega a la carpeta del cliente
cd cliente/

# 3. Usa 'npx serve' para levantar un servidor web simple
# Usamos el puerto 5500 para evitar conflictos con la API
npx serve -l 5500

# El cliente estará corriendo en http://localhost:5500
