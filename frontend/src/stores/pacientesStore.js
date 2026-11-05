import { ref, watch } from 'vue'

const STORAGE_KEY = 'sigca_avenia_pacientes'
const API_URL = 'http://localhost:3000/api/pacientes'

function cargarPacientesLocales() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY)
    const pacientes = datos ? JSON.parse(datos) : []
    return Array.isArray(pacientes) ? pacientes : []
  } catch (error) {
    console.error('Error al cargar pacientes:', error)
    return []
  }
}

// Conservamos los pacientes existentes
const pacientes = ref(cargarPacientesLocales())

const cargando = ref(false)
const errorPacientes = ref('')

// Mantener respaldo local
watch(
  pacientes,
  (nuevosPacientes) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nuevosPacientes)
      )
    } catch (error) {
      console.error('Error al guardar pacientes:', error)
    }
  },
  { deep: true }
)

// Consultar pacientes de MongoDB
async function obtenerPacientesMongoDB() {
  cargando.value = true
  errorPacientes.value = ''

  try {
    const respuesta = await fetch(API_URL)

    if (!respuesta.ok) {
      throw new Error('No se pudieron consultar los pacientes')
    }

    const datos = await respuesta.json()

    return Array.isArray(datos) ? datos : []
  } catch (error) {
    console.error('Error al consultar MongoDB:', error)
    errorPacientes.value = error.message
    return null
  } finally {
    cargando.value = false
  }
}

// Registrar un paciente en MongoDB
async function registrarPacienteMongoDB(datosPaciente) {
  try {
    const respuesta = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosPaciente)
    })

    const resultado = await respuesta.json()

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje || 'No se pudo registrar el paciente'
      )
    }

    return resultado
  } catch (error) {
    console.error('Error al registrar paciente:', error)
    errorPacientes.value = error.message
    throw error
  }
}

// Actualizar un paciente en MongoDB
async function actualizarPacienteMongoDB(id, datosPaciente) {
  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosPaciente)
    })

    const resultado = await respuesta.json()

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje || 'No se pudo actualizar el paciente'
      )
    }

    return resultado
  } catch (error) {
    console.error('Error al actualizar paciente:', error)
    errorPacientes.value = error.message
    throw error
  }
}

// Desactivar un paciente en MongoDB
async function desactivarPacienteMongoDB(id) {
  try {
    const respuesta = await fetch(
      `${API_URL}/${id}/desactivar`,
      { method: 'PATCH' }
    )

    const resultado = await respuesta.json()

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje || 'No se pudo desactivar el paciente'
      )
    }

    return resultado
  } catch (error) {
    console.error('Error al desactivar paciente:', error)
    errorPacientes.value = error.message
    throw error
  }
}

export function usePacientesStore() {
  return {
    pacientes,
    cargando,
    errorPacientes,
    obtenerPacientesMongoDB,
    registrarPacienteMongoDB,
    actualizarPacienteMongoDB,
    desactivarPacienteMongoDB
  }
}
