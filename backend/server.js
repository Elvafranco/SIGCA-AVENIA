const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

// Rutas del sistema
const pacientesRoutes = require("./routes/pacientes");

const app = express();

// Configuración
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/sigca_avenia";

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    mensaje: "Bienvenido a SIGCA - AVENIA",
    estado: "Servidor funcionando"
  });
});

// Estado del servidor y base de datos
app.get("/api/status", (req, res) => {
  res.json({
    sistema: "SIGCA - AVENIA",
    servidor: "activo",
    baseDatos:
      mongoose.connection.readyState === 1
        ? "conectada"
        : "desconectada",
    fecha: new Date().toISOString()
  });
});

// API de pacientes
app.use("/api/pacientes", pacientesRoutes);

// Conexión a MongoDB e inicio del servidor
async function iniciarServidor() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });

    console.log("MongoDB conectado correctamente");
    console.log("Base de datos: sigca_avenia");

    app.listen(PORT, () => {
      console.log("==============================");
      console.log("SIGCA - AVENIA | Backend");
      console.log(`Servidor: http://localhost:${PORT}`);
      console.log("==============================");
    });
  } catch (error) {
    console.error(
      "Error al conectar MongoDB:",
      error.message
    );
    process.exit(1);
  }
}

iniciarServidor();
