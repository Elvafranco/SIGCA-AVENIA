import { ref, computed, watch } from 'vue'

const CLAVE = 'sigca_avenia_cajas'

function cargarCajas() {
  try {
    const guardado = localStorage.getItem(CLAVE)
    if (guardado !== null) {
      const datos = JSON.parse(guardado)
      if (Array.isArray(datos)) return datos
    }
  } catch (error) {
    console.error('Error al cargar cajas:', error)
  }

  return []
}

const cajas = ref(cargarCajas())

watch(
  cajas,
  (datos) => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(datos))
    } catch (error) {
      console.error('Error al guardar cajas:', error)
    }
  },
  { deep: true }
)

function generarId() {
  const numeros = cajas.value
    .map(caja => Number(String(caja.id).replace('CAJ-', '')))
    .filter(numero => Number.isInteger(numero) && numero > 0)

  return `CAJ-${String(Math.max(0, ...numeros) + 1).padStart(4, '0')}`
}

function redondear(valor) {
  return Math.round((Number(valor) + Number.EPSILON) * 100) / 100
}

function obtenerTotales(caja) {
  const pagosValidos = (caja.movimientos || []).filter(
    pago => pago.estado === 'REGISTRADO'
  )

  const totalEfectivo = redondear(
    pagosValidos
      .filter(pago => pago.metodo === 'EFECTIVO')
      .reduce((total, pago) => total + Number(pago.monto), 0)
  )

  const totalTransferencias = redondear(
    pagosValidos
      .filter(pago => pago.metodo === 'TRANSFERENCIA')
      .reduce((total, pago) => total + Number(pago.monto), 0)
  )

  const totalTarjeta = redondear(
    pagosValidos
      .filter(pago => pago.metodo === 'TARJETA')
      .reduce((total, pago) => total + Number(pago.monto), 0)
  )

  const totalIngresos = redondear(
    totalEfectivo + totalTransferencias + totalTarjeta
  )

  const efectivoEsperado = redondear(
    Number(caja.montoInicial) + totalEfectivo
  )

  return {
    totalEfectivo,
    totalTransferencias,
    totalTarjeta,
    totalIngresos,
    efectivoEsperado
  }
}

export function useCajaStore() {
  const cajasAbiertas = computed(() =>
    cajas.value.filter(caja => caja.estado === 'ABIERTA')
  )

  const cajasCerradas = computed(() =>
    cajas.value.filter(caja => caja.estado === 'CERRADA')
  )

  function obtenerCajaAbierta(usuarioId) {
    return cajas.value.find(
      caja =>
        caja.usuarioId === String(usuarioId) &&
        caja.estado === 'ABIERTA'
    ) || null
  }

  function abrirCaja(usuarioId, usuarioNombre, montoInicial) {
    const idUsuario = String(usuarioId || '').trim()
    const nombre = String(usuarioNombre || '').trim()
    const monto = Number(montoInicial)

    if (!idUsuario || !nombre) {
      return {
        ok: false,
        mensaje: 'Debe indicar el usuario responsable.'
      }
    }

    if (!Number.isFinite(monto) || monto < 0) {
      return {
        ok: false,
        mensaje: 'El monto inicial debe ser válido y no negativo.'
      }
    }

    if (obtenerCajaAbierta(idUsuario)) {
      return {
        ok: false,
        mensaje: 'Este usuario ya tiene una caja abierta.'
      }
    }

    const caja = {
      id: generarId(),
      usuarioId: idUsuario,
      usuarioNombre: nombre,
      fechaApertura: new Date().toISOString(),
      montoInicial: redondear(monto),
      movimientos: [],
      totalEfectivo: 0,
      totalTransferencias: 0,
      totalTarjeta: 0,
      totalIngresos: 0,
      efectivoEsperado: redondear(monto),
      efectivoContado: null,
      diferencia: null,
      fechaCierre: null,
      estado: 'ABIERTA'
    }

    cajas.value.push(caja)

    return {
      ok: true,
      mensaje: 'Caja abierta correctamente.',
      caja
    }
  }

  function obtenerCaja(id) {
    return cajas.value.find(caja => caja.id === id) || null
  }

  function registrarPagoEnCaja(cajaId, pago) {
    const caja = obtenerCaja(cajaId)

    if (!caja || caja.estado !== 'ABIERTA') {
      return {
        ok: false,
        mensaje: 'No existe una caja abierta para registrar el pago.'
      }
    }

    if (
      !pago ||
      !pago.id ||
      !pago.citaId ||
      !['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'].includes(pago.metodo) ||
      !Number.isFinite(Number(pago.monto)) ||
      Number(pago.monto) <= 0
    ) {
      return {
        ok: false,
        mensaje: 'Los datos del pago no son válidos.'
      }
    }

    if (caja.usuarioId !== String(pago.usuarioId)) {
      return {
        ok: false,
        mensaje: 'El pago debe pertenecer al responsable de la caja.'
      }
    }

    const pagoExistente = cajas.value.some(item =>
      (item.movimientos || []).some(movimiento => movimiento.id === pago.id)
    )

    if (pagoExistente) {
      return {
        ok: false,
        mensaje: 'Este pago ya fue registrado en una caja.'
      }
    }

    caja.movimientos.push({
      ...pago,
      monto: redondear(pago.monto),
      estado: 'REGISTRADO'
    })

    Object.assign(caja, obtenerTotales(caja))

    return {
      ok: true,
      mensaje: 'Pago asociado correctamente a la caja.'
    }
  }

  function anularPagoEnCaja(cajaId, pagoId, motivo) {
    const caja = obtenerCaja(cajaId)

    if (!caja || caja.estado !== 'ABIERTA') {
      return {
        ok: false,
        mensaje: 'Solo pueden anularse pagos de cajas abiertas.'
      }
    }

    if (!String(motivo || '').trim()) {
      return {
        ok: false,
        mensaje: 'Debe indicar el motivo de anulación.'
      }
    }

    const pago = caja.movimientos.find(item => item.id === pagoId)

    if (!pago || pago.estado !== 'REGISTRADO') {
      return {
        ok: false,
        mensaje: 'El pago no existe o ya fue anulado.'
      }
    }

    pago.estado = 'ANULADO'
    pago.motivoAnulacion = String(motivo).trim()
    pago.fechaAnulacion = new Date().toISOString()

    Object.assign(caja, obtenerTotales(caja))

    return {
      ok: true,
      mensaje: 'Pago anulado correctamente.'
    }
  }

  function cerrarCaja(cajaId, usuarioId, efectivoContado) {
    const caja = obtenerCaja(cajaId)
    const contado = Number(efectivoContado)

    if (!caja || caja.estado !== 'ABIERTA') {
      return {
        ok: false,
        mensaje: 'La caja no existe o ya está cerrada.'
      }
    }

    if (caja.usuarioId !== String(usuarioId)) {
      return {
        ok: false,
        mensaje: 'Solo el responsable puede cerrar esta caja.'
      }
    }

    if (!Number.isFinite(contado) || contado < 0) {
      return {
        ok: false,
        mensaje: 'Ingrese un monto de efectivo contado válido.'
      }
    }

    Object.assign(caja, obtenerTotales(caja))

    caja.efectivoContado = redondear(contado)
    caja.diferencia = redondear(
      caja.efectivoContado - caja.efectivoEsperado
    )
    caja.fechaCierre = new Date().toISOString()
    caja.estado = 'CERRADA'

    return {
      ok: true,
      mensaje: 'Caja cerrada correctamente.',
      caja
    }
  }

  function consultarTotales(cajaId) {
    const caja = obtenerCaja(cajaId)
    if (!caja) return null

    return obtenerTotales(caja)
  }

  return {
    cajas,
    cajasAbiertas,
    cajasCerradas,
    obtenerCaja,
    obtenerCajaAbierta,
    abrirCaja,
    registrarPagoEnCaja,
    anularPagoEnCaja,
    cerrarCaja,
    consultarTotales
  }
}
