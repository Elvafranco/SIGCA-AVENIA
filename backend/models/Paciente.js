const mongoose = require('mongoose')

const pacienteSchema = new mongoose.Schema(
  {
    numero: {
      type: Number,
      default: null
    },

    codigo: {
      type: String,
      trim: true,
      default: ''
    },

    nombres: {
      type: String,
      required: true,
      trim: true
    },

    apellidos: {
      type: String,
      required: true,
      trim: true
    },

    fechaNacimiento: {
      type: String,
      required: true
    },

    sexo: {
      type: String,
      default: ''
    },

    telefono: {
      type: String,
      trim: true,
      default: ''
    },

    correo: {
      type: String,
      trim: true,
      default: ''
    },

    direccion: {
      type: String,
      trim: true,
      default: ''
    },

    motivoConsulta: {
      type: String,
      trim: true,
      default: ''
    },

    observaciones: {
      type: String,
      trim: true,
      default: ''
    },

    responsableNombre: {
      type: String,
      trim: true,
      default: ''
    },

    responsableParentesco: {
      type: String,
      default: ''
    },

    responsableTelefono: {
      type: String,
      trim: true,
      default: ''
    },

    responsableCorreo: {
      type: String,
      trim: true,
      default: ''
    },

    estado: {
      type: String,
      enum: ['activo', 'inactivo'],
      default: 'activo'
    },

    fechaRegistro: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Paciente', pacienteSchema)
