import { ref, computed, watch } from 'vue'

const CLAVE = 'sigca_avenia_servicios'

const serviciosIniciales = [
  {
    id: 'SER-001',
    nombre: 'Atención psicológica',
    descripcion: 'Acompañamiento psicológico individual.',
    duracion: 60,
    precio: 250,
    imagen: '/src/assets/psicologia.png',
    estado: 'ACTIVO'
  },
  {
    id: 'SER-002',
    nombre: 'Estimulación auditivo-verbal',
    descripcion: 'Sesiones de estimulación y desarrollo de habilidades auditivas y del lenguaje.',
    duracion: 60,
    precio: 275,
    imagen: '/src/assets/estimulacion.png',
    estado: 'ACTIVO'
  },
  {
    id: 'SER-003',
    nombre: 'Apoyo al desarrollo',
    descripcion: 'Atención y acompañamiento para fortalecer habilidades del desarrollo.',
    duracion: 45,
    precio: 225,
    imagen: '/src/assets/desarrollo.png',
    estado: 'ACTIVO'
  }
]

function cargarServicios() {
  try {
    const guardados = localStorage.getItem(CLAVE)

    if (guardados !== null) {
      const datos = JSON.parse(guardados)
      if (Array.isArray(datos)) return datos
    }
  } catch (error) {
    console.error('Error al cargar servicios:', error)
  }

  return serviciosIniciales.map(servicio => ({ ...servicio }))
}

const servicios = ref(cargarServicios())

watch(
  servicios,
  (nuevosServicios) => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(nuevosServicios))
    } catch (error) {
      console.error('Error al guardar servicios:', error)
    }
  },
  { deep: true }
)

export function useServiciosStore() {
  const serviciosActivos = computed(() =>
    servicios.value.filter(servicio => servicio.estado === 'ACTIVO')
  )

  function generarId() {
    const numeros = servicios.value
      .map(servicio => Number(String(servicio.id).replace('SER-', '')))
      .filter(numero => Number.isInteger(numero))

    const siguiente = Math.max(0, ...numeros) + 1

    return `SER-${String(siguiente).padStart(3, '0')}`
  }

  function agregarServicio(datos) {
    const servicio = {
      ...datos,
      id: generarId(),
      estado: datos.estado || 'ACTIVO'
    }

    servicios.value.push(servicio)
    return servicio
  }

  function actualizarServicio(id, datos) {
    const indice = servicios.value.findIndex(servicio => servicio.id === id)

    if (indice === -1) return false

    servicios.value[indice] = {
      ...servicios.value[indice],
      ...datos,
      id
    }

    return true
  }

  function cambiarEstado(id) {
    const servicio = servicios.value.find(item => item.id === id)

    if (!servicio) return false

    servicio.estado = servicio.estado === 'ACTIVO'
      ? 'INACTIVO'
      : 'ACTIVO'

    return true
  }

  function obtenerServicio(id) {
    return servicios.value.find(servicio => servicio.id === id)
  }

  return {
    servicios,
    serviciosActivos,
    agregarServicio,
    actualizarServicio,
    cambiarEstado,
    obtenerServicio
  }
}
