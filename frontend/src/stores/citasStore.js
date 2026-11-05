import { ref, watch } from 'vue'

const STORAGE_KEY = 'sigca_avenia_citas'

function cargarCitas() {
  try {
    const datos = localStorage.getItem(STORAGE_KEY)
    const citasGuardadas = datos ? JSON.parse(datos) : []

    return Array.isArray(citasGuardadas)
      ? citasGuardadas
      : []
  } catch (error) {
    console.error('Error al cargar citas:', error)
    return []
  }
}

const citas = ref(cargarCitas())

watch(
  citas,
  (nuevasCitas) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(nuevasCitas)
      )
    } catch (error) {
      console.error('Error al guardar citas:', error)
    }
  },
  { deep: true }
)

export function useCitasStore() {
  return { citas }
}
