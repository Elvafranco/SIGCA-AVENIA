import { ref, computed, watch } from 'vue'

const CLAVE = 'sigca_avenia_materiales'
const CLAVE_MOVIMIENTOS = 'sigca_avenia_movimientos_materiales'

function cargarDatos(clave) {
  try {
    const guardados = localStorage.getItem(clave)

    if (guardados !== null) {
      const datos = JSON.parse(guardados)

      if (Array.isArray(datos)) {
        return datos
      }
    }
  } catch (error) {
    console.error(`Error al cargar ${clave}:`, error)
  }

  return []
}

// Conserva los materiales que ya están registrados
const materiales = ref(cargarDatos(CLAVE))

// Almacena el historial de entradas y salidas
const movimientos = ref(cargarDatos(CLAVE_MOVIMIENTOS))

watch(
  materiales,
  (nuevosMateriales) => {
    try {
      localStorage.setItem(
        CLAVE,
        JSON.stringify(nuevosMateriales)
      )
    } catch (error) {
      console.error('Error al guardar materiales:', error)
    }
  },
  { deep: true }
)

watch(
  movimientos,
  (nuevosMovimientos) => {
    try {
      localStorage.setItem(
        CLAVE_MOVIMIENTOS,
        JSON.stringify(nuevosMovimientos)
      )
    } catch (error) {
      console.error('Error al guardar movimientos:', error)
    }
  },
  { deep: true }
)

export function useMaterialesStore() {
  const totalMateriales = computed(() =>
    materiales.value.length
  )

  const materialesBajoMinimo = computed(() =>
    materiales.value.filter(
      material =>
        Number(material.existencia) <= Number(material.minimo)
    )
  )

  const valorInventario = computed(() =>
    materiales.value.reduce(
      (total, material) =>
        total +
        Number(material.existencia) *
        Number(material.costo),
      0
    )
  )

  const historialMovimientos = computed(() =>
    [...movimientos.value].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    )
  )

  function generarId() {
    const numeros = materiales.value
      .map(material =>
        Number(String(material.id).replace('MAT-', ''))
      )
      .filter(numero => Number.isInteger(numero))

    return `MAT-${String(
      Math.max(0, ...numeros) + 1
    ).padStart(3, '0')}`
  }

  function agregarMaterial(datos) {
    const material = {
      ...datos,
      id: generarId(),
      existencia: Number(datos.existencia) || 0,
      minimo: Number(datos.minimo) || 0,
      costo: Number(datos.costo) || 0,
      estado: datos.estado || 'ACTIVO'
    }

    materiales.value.push(material)

    return material
  }

  function actualizarMaterial(id, datos) {
    const indice = materiales.value.findIndex(
      material => material.id === id
    )

    if (indice === -1) return false

    materiales.value[indice] = {
      ...materiales.value[indice],
      ...datos,
      id,
      existencia: Number(
        datos.existencia ??
        materiales.value[indice].existencia
      ),
      minimo: Number(
        datos.minimo ??
        materiales.value[indice].minimo
      ),
      costo: Number(
        datos.costo ??
        materiales.value[indice].costo
      )
    }

    return true
  }

  function registrarMovimiento(
    id,
    tipo,
    cantidad,
    observaciones = ''
  ) {
    const material = materiales.value.find(
      item => item.id === id
    )

    const unidades = Number(cantidad)
    const tipoNormalizado = String(tipo).toUpperCase()

    if (
      !material ||
      !Number.isFinite(unidades) ||
      unidades <= 0
    ) {
      return false
    }

    if (
      tipoNormalizado !== 'ENTRADA' &&
      tipoNormalizado !== 'SALIDA'
    ) {
      return false
    }

    const existenciaAnterior = Number(material.existencia)

    if (
      tipoNormalizado === 'SALIDA' &&
      existenciaAnterior < unidades
    ) {
      return false
    }

    const existenciaNueva =
      tipoNormalizado === 'ENTRADA'
        ? existenciaAnterior + unidades
        : existenciaAnterior - unidades

    material.existencia = existenciaNueva

    const movimiento = {
      id:
        'MOV-' +
        Date.now() +
        '-' +
        Math.random().toString(36).slice(2, 8),
      materialId: material.id,
      materialNombre: material.nombre,
      tipo: tipoNormalizado,
      cantidad: unidades,
      existenciaAnterior,
      existenciaNueva,
      observaciones: String(observaciones || '').trim(),
      fecha: new Date().toISOString()
    }

    movimientos.value.push(movimiento)

    return true
  }

  function cambiarEstado(id) {
    const material = materiales.value.find(
      item => item.id === id
    )

    if (!material) return false

    material.estado =
      material.estado === 'ACTIVO'
        ? 'INACTIVO'
        : 'ACTIVO'

    return true
  }

  function obtenerMaterial(id) {
    return materiales.value.find(
      material => material.id === id
    )
  }

  function obtenerMovimientosMaterial(id) {
    return historialMovimientos.value.filter(
      movimiento => movimiento.materialId === id
    )
  }

  return {
    materiales,
    movimientos,
    historialMovimientos,
    totalMateriales,
    materialesBajoMinimo,
    valorInventario,
    agregarMaterial,
    actualizarMaterial,
    registrarMovimiento,
    cambiarEstado,
    obtenerMaterial,
    obtenerMovimientosMaterial
  }
}
