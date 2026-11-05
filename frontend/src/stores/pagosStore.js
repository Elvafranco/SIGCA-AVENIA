import { ref, computed, watch } from 'vue'
import { useCitasStore } from './citasStore'
import { useServiciosStore } from './serviciosStore'
import { useCajaStore } from './cajaStore'

const CLAVE_PAGOS = 'sigca_avenia_pagos'
const CLAVE_COSTOS = 'sigca_avenia_costos_citas'

function cargarLista(clave) {
  try {
    const datos = JSON.parse(localStorage.getItem(clave) || '[]')
    return Array.isArray(datos) ? datos : []
  } catch (error) {
    console.error(`Error al cargar ${clave}:`, error)
    return []
  }
}

const pagos = ref(cargarLista(CLAVE_PAGOS))
const costosCitas = ref(cargarLista(CLAVE_COSTOS))

watch(
  pagos,
  datos => localStorage.setItem(CLAVE_PAGOS, JSON.stringify(datos)),
  { deep: true }
)

watch(
  costosCitas,
  datos => localStorage.setItem(CLAVE_COSTOS, JSON.stringify(datos)),
  { deep: true }
)

const { citas } = useCitasStore()
const { servicios } = useServiciosStore()

const {
  obtenerCajaAbierta,
  obtenerCaja,
  registrarPagoEnCaja,
  anularPagoEnCaja
} = useCajaStore()

function centavos(valor) {
  const numero = Number(valor)
  if (!Number.isFinite(numero)) return NaN
  return Math.round((numero + Number.EPSILON) * 100)
}

function dinero(valorCentavos) {
  return Math.round(valorCentavos) / 100
}

function idCita(cita) {
  return String(cita?.id ?? cita?._id ?? '')
}

function obtenerCita(citaId) {
  return citas.value.find(
    cita => idCita(cita) === String(citaId)
  ) || null
}

function obtenerPacienteId(cita) {
  return String(
    cita?.pacienteId ??
    cita?.paciente?.id ??
    ''
  )
}

function obtenerPacienteNombre(cita) {
  return String(
    cita?.pacienteNombre ??
    cita?.paciente?.nombre ??
    cita?.paciente ??
    'Paciente'
  )
}

function buscarServicio(cita) {
  return servicios.value.find(servicio =>
    servicio.id === cita.servicioId ||
    servicio.nombre === cita.servicio ||
    servicio.nombre === cita.servicioNombre ||
    (
      cita.servicio === 'Psicología' &&
      servicio.nombre === 'Atención psicológica'
    )
  )
}

function obtenerCostoGuardado(citaId) {
  return costosCitas.value.find(
    item => item.citaId === String(citaId)
  )
}

function obtenerCostoCita(citaId) {
  const guardado = obtenerCostoGuardado(citaId)

  if (guardado) {
    return Number(guardado.costo)
  }

  const cita = obtenerCita(citaId)
  if (!cita) return null

  const precioPropio =
    cita.costoTotal ??
    cita.precioTotal ??
    cita.precio ??
    cita.costo

  if (
    precioPropio !== undefined &&
    precioPropio !== null &&
    precioPropio !== ''
  ) {
    const valor = Number(precioPropio)
    return Number.isFinite(valor) && valor >= 0
      ? dinero(centavos(valor))
      : null
  }

  const servicio = buscarServicio(cita)

  if (!servicio) return null

  const valor = Number(servicio.precio)

  return Number.isFinite(valor) && valor >= 0
    ? dinero(centavos(valor))
    : null
}

function fijarCostoCita(citaId) {
  const existente = obtenerCostoGuardado(citaId)
  if (existente) return Number(existente.costo)

  const costo = obtenerCostoCita(citaId)

  if (costo === null) return null

  costosCitas.value.push({
    citaId: String(citaId),
    costo,
    fechaRegistro: new Date().toISOString()
  })

  return costo
}

function pagosDeCita(citaId) {
  return pagos.value
    .filter(pago => pago.citaId === String(citaId))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
}

function obtenerResumenCita(citaId) {
  const costo = obtenerCostoCita(citaId)

  if (costo === null) return null

  const pagosValidos = pagosDeCita(citaId).filter(
    pago => pago.estado === 'REGISTRADO'
  )

  const pagadoCentavos = pagosValidos.reduce(
    (total, pago) => total + centavos(pago.monto),
    0
  )

  const costoCentavos = centavos(costo)
  const saldoCentavos = Math.max(
    0,
    costoCentavos - pagadoCentavos
  )

  const estadoFinanciero =
    pagadoCentavos === 0
      ? 'PENDIENTE'
      : saldoCentavos > 0
        ? 'PARCIAL'
        : 'PAGADO'

  return {
    citaId: String(citaId),
    costo: dinero(costoCentavos),
    totalPagado: dinero(pagadoCentavos),
    saldoPendiente: dinero(saldoCentavos),
    estadoFinanciero,
    cantidadPagos: pagosValidos.length
  }
}

function siguienteNumero() {
  const numeros = pagos.value
    .map(pago => Number(String(pago.id).replace('PAG-', '')))
    .filter(numero => Number.isInteger(numero) && numero > 0)

  return Math.max(0, ...numeros) + 1
}

function registrarPago(datos) {
  const citaId = String(datos.citaId || '').trim()
  const usuarioId = String(datos.usuarioId || '').trim()
  const usuarioNombre = String(datos.usuarioNombre || '').trim()
  const metodo = String(datos.metodo || '').toUpperCase()
  const montoCentavos = centavos(datos.monto)

  const cita = obtenerCita(citaId)

  if (!cita) {
    return { ok: false, mensaje: 'La cita seleccionada no existe.' }
  }

  if (!usuarioId || !usuarioNombre) {
    return { ok: false, mensaje: 'Debe identificar al usuario que registra el pago.' }
  }

  if (!['EFECTIVO', 'TRANSFERENCIA', 'TARJETA'].includes(metodo)) {
    return { ok: false, mensaje: 'Seleccione un método de pago válido.' }
  }

  if (!Number.isFinite(montoCentavos) || montoCentavos <= 0) {
    return { ok: false, mensaje: 'El monto debe ser mayor que cero.' }
  }

  const caja = obtenerCajaAbierta(usuarioId)

  if (!caja) {
    return { ok: false, mensaje: 'Debe abrir su caja antes de registrar pagos.' }
  }

  const resumen = obtenerResumenCita(citaId)

  if (!resumen) {
    return {
      ok: false,
      mensaje: 'No se pudo determinar el precio de esta cita.'
    }
  }

  if (montoCentavos > centavos(resumen.saldoPendiente)) {
    return {
      ok: false,
      mensaje: 'El monto supera el saldo pendiente de la cita.'
    }
  }

  const numero = siguienteNumero()
  const fecha = new Date().toISOString()

  const pago = {
    id: `PAG-${String(numero).padStart(5, '0')}`,
    comprobante: `AV-COMP-${String(numero).padStart(6, '0')}`,
    pacienteId: obtenerPacienteId(cita),
    pacienteNombre: obtenerPacienteNombre(cita),
    citaId,
    cajaId: caja.id,
    monto: dinero(montoCentavos),
    metodo,
    fecha,
    usuarioId,
    usuarioNombre,
    estado: 'REGISTRADO',
    motivoAnulacion: null,
    fechaAnulacion: null,
    usuarioAnulacionId: null
  }

  const resultadoCaja = registrarPagoEnCaja(caja.id, pago)

  if (!resultadoCaja.ok) return resultadoCaja

  fijarCostoCita(citaId)
  pagos.value.push(pago)

  return {
    ok: true,
    mensaje: 'Pago registrado correctamente.',
    pago,
    resumen: obtenerResumenCita(citaId)
  }
}

function anularPago(datos) {
  const pago = pagos.value.find(
    item => item.id === String(datos.pagoId)
  )

  if (!pago) {
    return { ok: false, mensaje: 'El pago no existe.' }
  }

  if (pago.estado !== 'REGISTRADO') {
    return { ok: false, mensaje: 'El pago ya fue anulado.' }
  }

  const motivo = String(datos.motivo || '').trim()

  if (!motivo) {
    return { ok: false, mensaje: 'Debe justificar la anulación.' }
  }

  const usuarioId = String(datos.usuarioId || '')
  const rol = String(datos.rol || '').toUpperCase()

  if (rol !== 'ADMINISTRADOR') {
    return {
      ok: false,
      mensaje: 'Solo un administrador puede autorizar la anulación.'
    }
  }

  const caja = obtenerCaja(pago.cajaId)

  if (!caja || caja.estado !== 'ABIERTA') {
    return {
      ok: false,
      mensaje: 'No pueden anularse pagos de cajas cerradas.'
    }
  }

  const resultadoCaja = anularPagoEnCaja(
    pago.cajaId,
    pago.id,
    motivo
  )

  if (!resultadoCaja.ok) return resultadoCaja

  pago.estado = 'ANULADO'
  pago.motivoAnulacion = motivo
  pago.fechaAnulacion = new Date().toISOString()
  pago.usuarioAnulacionId = usuarioId

  return {
    ok: true,
    mensaje: 'Pago anulado correctamente.',
    pago,
    resumen: obtenerResumenCita(pago.citaId)
  }
}

export function usePagosStore() {
  const pagosOrdenados = computed(() =>
    [...pagos.value].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    )
  )

  const pagosValidos = computed(() =>
    pagos.value.filter(pago => pago.estado === 'REGISTRADO')
  )

  function consultarPagos({
    pacienteId = '',
    citaId = '',
    fecha = '',
    metodo = '',
    estado = ''
  } = {}) {
    return pagosOrdenados.value.filter(pago => {
      return (
        (!pacienteId || pago.pacienteId === String(pacienteId)) &&
        (!citaId || pago.citaId === String(citaId)) &&
        (!fecha || pago.fecha.slice(0, 10) === fecha) &&
        (!metodo || pago.metodo === metodo) &&
        (!estado || pago.estado === estado)
      )
    })
  }

  return {
    pagos,
    pagosOrdenados,
    pagosValidos,
    costosCitas,
    obtenerCita,
    obtenerCostoCita,
    obtenerResumenCita,
    pagosDeCita,
    consultarPagos,
    registrarPago,
    anularPago
  }
}
