const mongoose = require("mongoose");

const pacienteSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    apellido: {
      type: String,
      trim: true,
      default: ""
    },
    fechaNacimiento: {
      type: Date,
      default: null
    },
    telefono: {
      type: String,
      trim: true,
      default: ""
    },
    correo: {
      type: String,
      trim: true,
      default: ""
    },
    direccion: {
      type: String,
      trim: true,
      default: ""
    },
    observaciones: {
      type: String,
      trim: true,
      default: ""
    },
    estado: {
      type: String,
      enum: ["Activo", "Inactivo"],
      default: "Activo"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Paciente", pacienteSchema);
