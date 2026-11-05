const express = require("express");
const Paciente = require("../models/Paciente");

const router = express.Router();

// Consultar pacientes
router.get("/", async (req, res) => {
  try {
    const pacientes = await Paciente.find().sort({ createdAt: -1 });
    res.json(pacientes);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al consultar pacientes"
    });
  }
});

// Registrar paciente
router.post("/", async (req, res) => {
  try {
    const paciente = new Paciente(req.body);
    const nuevoPaciente = await paciente.save();
    res.status(201).json(nuevoPaciente);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al registrar paciente",
      error: error.message
    });
  }
});

// Actualizar paciente
router.put("/:id", async (req, res) => {
  try {
    const paciente = await Paciente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!paciente) {
      return res.status(404).json({
        mensaje: "Paciente no encontrado"
      });
    }

    res.json(paciente);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al actualizar paciente",
      error: error.message
    });
  }
});

// Desactivar paciente
router.patch("/:id/desactivar", async (req, res) => {
  try {
    const paciente = await Paciente.findByIdAndUpdate(
      req.params.id,
      { estado: "Inactivo" },
      { new: true, runValidators: true }
    );

    if (!paciente) {
      return res.status(404).json({
        mensaje: "Paciente no encontrado"
      });
    }

    res.json(paciente);
  } catch (error) {
    res.status(400).json({
      mensaje: "Error al desactivar paciente",
      error: error.message
    });
  }
});

module.exports = router;
