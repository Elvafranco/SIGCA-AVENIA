const express = require('express')
const mongoose = require('mongoose')
const Paciente = require('../models/Paciente')

const router = express.Router()

// Validar identificadores de MongoDB
function validarId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      mensaje: 'Identificador de paciente inválido'
    })
  }

  next()
}

// Consultar todos los pacientes
router.get('/', async (req, res) => {
  try {
    const pacientes = await Paciente.find()
      .sort({ createdAt: -1 })

    res.json(pacientes)
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar pacientes'
    })
  }
})

// Consultar un paciente por ID
router.get('/:id', validarId, async (req, res) => {
  try {
    const paciente = await Paciente.findById(req.params.id)

    if (!paciente) {
      return res.status(404).json({
        mensaje: 'Paciente no encontrado'
      })
    }

    res.json(paciente)
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al consultar el paciente'
    })
  }
})

// Registrar un nuevo paciente
router.post('/', async (req, res) => {
  try {
    const paciente = new Paciente(req.body)

    const nuevoPaciente = await paciente.save()

    res.status(201).json(nuevoPaciente)
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al registrar paciente',
      error: error.message
    })
  }
})

// Actualizar información de un paciente
router.put('/:id', validarId, async (req, res) => {
  try {
    // Evitar modificar identificadores y fechas internas
    const {
      _id,
      id,
      createdAt,
      updatedAt,
      ...datosActualizados
    } = req.body

    const paciente = await Paciente.findByIdAndUpdate(
      req.params.id,
      { $set: datosActualizados },
      {
        new: true,
        runValidators: true
      }
    )

    if (!paciente) {
      return res.status(404).json({
        mensaje: 'Paciente no encontrado'
      })
    }

    res.json(paciente)
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al actualizar paciente',
      error: error.message
    })
  }
})

// Desactivar un paciente
router.patch(
  '/:id/desactivar',
  validarId,
  async (req, res) => {
    try {
      const paciente = await Paciente.findByIdAndUpdate(
        req.params.id,
        { estado: 'Inactivo' },
        {
          new: true,
          runValidators: true
        }
      )

      if (!paciente) {
        return res.status(404).json({
          mensaje: 'Paciente no encontrado'
        })
      }

      res.json(paciente)
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al desactivar paciente'
      })
    }
  }
)

// Reactivar un paciente
router.patch(
  '/:id/activar',
  validarId,
  async (req, res) => {
    try {
      const paciente = await Paciente.findByIdAndUpdate(
        req.params.id,
        { estado: 'Activo' },
        {
          new: true,
          runValidators: true
        }
      )

      if (!paciente) {
        return res.status(404).json({
          mensaje: 'Paciente no encontrado'
        })
      }

      res.json(paciente)
    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al activar paciente'
      })
    }
  }
)

module.exports = router
