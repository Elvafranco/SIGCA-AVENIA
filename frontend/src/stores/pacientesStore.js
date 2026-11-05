import { ref, watch } from 'vue'

const STORAGE_KEY = 'sigca_avenia_pacientes'
const API_URL = 'http://localhost:3000/api/pacientes'

// Recuperar los registros locales existentes
function cargarPacientesLocales() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY)
    const lista = datos ? JSON.parse(datos) : []
    return Array.isArray(lista) ? lista : []
  } catch (error) {
    console.error('Error al cargar pacientes locales:', error)
    return []
  }
}

const pacientes = ref(cargarPacientesLocales())
const cargando = ref(false)
const errorPacientes = ref('')

// Conservar respaldo local sin borrar registros anteriores
watch(
  pacientes,
  (lista) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
    } catch (error) {
      console.error('Error al guardar respaldo:', error)
    }
  },
  { deep: true }
)

// Identificar registros de MongoDB
function esPacienteMongoDB(paciente) {
  return Boolean(
    paciente?._id &&
    /^[a-f\d]{24}$/i.test(String(paciente._id))
  )
}

// Preparar los datos que utiliza la interfaz
function normalizarPaciente(paciente) {
  return {
    ...paciente,
    id: paciente._id || paciente.id,
    nombres: paciente.nombres || paciente.nombre || '',
    apellidos: paciente.apellidos || paciente.apellido || '',
    fechaNacimiento: paciente.fechaNacimiento || '',
    estado: String(paciente.estado || 'activo').toLowerCase(),
    codigo: paciente.codigo ||
      `AV-${String(paciente.numero || '').padStart(4, '0')}`,
    fechaRegistro: paciente.fechaRegistro ||
      String(paciente.createdAt || '').slice(0, 10)
  }
}

// Consultar MongoDB sin reemplazar registros locales
async function obtenerPacientesMongoDB() {
  cargando.value = true
  errorPacientes.value = ''

  try {
    const respuesta = await fetch(API_URL)

    if (!respuesta.ok) {
      throw new Error('No se pudieron consultar los pacientes.')
    }

    const datos = await respuesta.json()

    if (!Array.isArray(datos)) {
      throw new Error('La respuesta del servidor no es válida.')
    }

    const pacientesMongo = datos.map(normalizarPaciente)

    const idsMongo = new Set(
      pacientesMongo.map(p => String(p._id))
    )

    // Los registros locales no se eliminan ni se migran
    // automáticamente para evitar pérdidas o duplicados.
    const pacientesLocales = pacientes.value.filter(
      p => !esPacienteMongoDB(p) ||
        !idsMongo.has(String(p._id))
    )

    pacientes.value = [
      ...pacientesMongo,
      ...pacientesLocales
    ]

    return pacientesMongo
  } catch (error) {
    console.error('Error al consultar MongoDB:', error)
    errorPacientes.value = error.message
    return null
  } finally {
    cargando.value = false
  }
}

// Peticiones al backend
async function solicitarAPI(url, opciones = {}) {
  errorPacientes.value = ''

  try {
    const respuesta = await fetch(url, opciones)
    const resultado = await respuesta.json()

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje ||
        'No se pudo completar la operación.'
      )
    }

    return resultado
  } catch (error) {
    console.error('Error de pacientes:', error)
    errorPacientes.value = error.message
    throw error
  }
}

// Registrar paciente
async function registrarPacienteMongoDB(datosPaciente) {
  const resultado = await solicitarAPI(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosPaciente)
  })

  const nuevo = normalizarPaciente(resultado)

  pacientes.value.unshift(nuevo)

  return nuevo
}

// Actualizar paciente
async function actualizarPacienteMongoDB(id, datosPaciente) {
  const resultado = await solicitarAPI(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datosPaciente)
  })

  const actualizado = normalizarPaciente(resultado)

  const indice = pacientes.value.findIndex(
    p => String(p._id) === String(id)
  )

  if (indice !== -1) {
    pacientes.value[indice] = actualizado
  }

  return actualizado
}

// Desactivar paciente
async function desactivarPacienteMongoDB(id) {
  const resultado = await solicitarAPI(
    `${API_URL}/${id}/desactivar`,
    { method: 'PATCH' }
  )

  const actualizado = normalizarPaciente(resultado.paciente)

  const indice = pacientes.value.findIndex(
    p => String(p._id) === String(id)
  )

  if (indice !== -1) {
    pacientes.value[indice] = actualizado
  }

  return actualizado
}

// Reactivar paciente
async function activarPacienteMongoDB(id) {
  const resultado = await solicitarAPI(
    `${API_URL}/${id}/activar`,
    { method: 'PATCH' }
  )

  const actualizado = normalizarPaciente(resultado.paciente)

  const indice = pacientes.value.findIndex(
    p => String(p._id) === String(id)
  )

  if (indice !== -1) {
    pacientes.value[indice] = actualizado
  }

  return actualizado
}

export function usePacientesStore() {
  return {
    pacientes,
    cargando,
    errorPacientes,
    esPacienteMongoDB,
    obtenerPacientesMongoDB,
    registrarPacienteMongoDB,
    actualizarPacienteMongoDB,
    desactivarPacienteMongoDB,
    activarPacienteMongoDB
  }
}
