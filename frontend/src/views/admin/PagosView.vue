<script setup>
import { ref, computed, watch } from 'vue'
import {
  Wallet, Plus, Search, Eye, X, Receipt,
  CreditCard, Banknote, ArrowLeftRight,
  CheckCircle2, Clock3, AlertCircle,
  Ban, CalendarDays
} from 'lucide-vue-next'

import { usePagosStore } from '../../stores/pagosStore'
import { useCitasStore } from '../../stores/citasStore'
import { useCajaStore } from '../../stores/cajaStore'

const {
  pagos,
  pagosOrdenados,
  obtenerResumenCita,
  registrarPago,
  anularPago
} = usePagosStore()

const { citas } = useCitasStore()
const { cajasAbiertas, obtenerCajaAbierta } = useCajaStore()

// Identidad provisional de la demostración, hasta implementar autenticación.
// Si la caja fue abierta con otro ID en la versión anterior de Caja diaria,
// se reutiliza su responsable SOLO cuando existe una única caja abierta.
const usuarioDemostracion = {
  id: 'admin-001',
  nombre: 'Administración',
  rol: 'ADMINISTRADOR'
}

const usuarioActual = computed(() => {
  const propia = obtenerCajaAbierta(usuarioDemostracion.id)
  if (propia) return usuarioDemostracion

  const abiertas = cajasAbiertas.value
  if (abiertas.length === 1) {
    return {
      id: String(abiertas[0].usuarioId),
      nombre: abiertas[0].usuarioNombre || usuarioDemostracion.nombre,
      rol: usuarioDemostracion.rol
    }
  }

  return usuarioDemostracion
})

const busqueda = ref('')
const filtroMetodo = ref('')
const filtroEstado = ref('')
const filtroFecha = ref('')

const modalNuevo = ref(false)
const modalDetalle = ref(false)
const modalAnular = ref(false)

const pagoSeleccionado = ref(null)
const mensaje = ref('')
const tipoMensaje = ref('exito')

const formulario = ref({
  citaId: '',
  monto: '',
  metodo: 'EFECTIVO'
})

const motivoAnulacion = ref('')
const errorAnulacion = ref('')

const cajaActual = computed(() =>
  obtenerCajaAbierta(usuarioActual.value.id)
)

const citasConSaldo = computed(() =>
  citas.value
    .map(cita => ({
      ...cita,
      identificador: String(cita.id ?? cita._id ?? ''),
      resumen: obtenerResumenCita(cita.id ?? cita._id)
    }))
    .filter(cita =>
      cita.identificador &&
      cita.resumen &&
      cita.resumen.saldoPendiente > 0
    )
)

const resumenSeleccionado = computed(() =>
  formulario.value.citaId
    ? obtenerResumenCita(formulario.value.citaId)
    : null
)

const pagosFiltrados = computed(() => {
  const texto = busqueda.value.toLowerCase().trim()

  return pagosOrdenados.value.filter(pago => {
    const coincideTexto =
      !texto ||
      String(pago.pacienteNombre || '').toLowerCase().includes(texto) ||
      String(pago.comprobante || '').toLowerCase().includes(texto) ||
      String(pago.citaId || '').toLowerCase().includes(texto)

    const coincideMetodo =
      !filtroMetodo.value || pago.metodo === filtroMetodo.value

    const coincideEstado =
      !filtroEstado.value || pago.estado === filtroEstado.value

    const coincideFecha =
      !filtroFecha.value ||
      fechaLocal(pago.fecha) === filtroFecha.value

    return coincideTexto && coincideMetodo &&
      coincideEstado && coincideFecha
  })
})

const totalRegistrado = computed(() =>
  pagos.value
    .filter(pago => pago.estado === 'REGISTRADO')
    .reduce((total, pago) => total + Number(pago.monto), 0)
)

const totalAnulado = computed(() =>
  pagos.value
    .filter(pago => pago.estado === 'ANULADO')
    .reduce((total, pago) => total + Number(pago.monto), 0)
)

const totalPendiente = computed(() =>
  citas.value.reduce((total, cita) => {
    const resumen = obtenerResumenCita(cita.id ?? cita._id)
    return total + Number(resumen?.saldoPendiente || 0)
  }, 0)
)

function moneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ'
  }).format(Number(valor) || 0)
}

function fechaLocal(valor) {
  if (!valor) return ''

  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return ''

  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')

  return `${anio}-${mes}-${dia}`
}

function fechaVisible(valor) {
  if (!valor) return '—'

  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return '—'

  return fecha.toLocaleString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function nombreCita(cita) {
  return String(
    cita.pacienteNombre ??
    cita.paciente?.nombre ??
    cita.paciente ??
    'Paciente'
  )
}

// Descripción legible de la cita, sin cambiar su identificador interno.
function servicioCita(cita) {
  if (!cita) return 'Servicio no especificado'
  const servicio = cita.servicioNombre ?? cita.nombreServicio ??
    cita.servicio?.nombre ?? cita.servicio?.titulo ??
    (typeof cita.servicio === 'string' ? cita.servicio : null) ??
    cita.tipoServicio ?? cita.tratamientoNombre
  return String(servicio || 'Servicio no especificado')
}

function fechaCita(cita) {
  if (!cita) return 'Fecha no especificada'
  const valor = cita.fecha ?? cita.fechaCita ?? cita.dia ?? cita.fechaInicio
  if (!valor) return 'Fecha no especificada'
  // Evita desplazar el día por zona horaria en fechas YYYY-MM-DD.
  const texto = String(valor)
  const match = texto.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) return `${match[3]}/${match[2]}/${match[1]}`
  const fecha = new Date(valor)
  return Number.isNaN(fecha.getTime()) ? texto : fecha.toLocaleDateString('es-GT')
}

function horaCita(cita) {
  if (!cita) return 'Hora no especificada'
  const hora = cita.hora ?? cita.horaCita ?? cita.horaInicio ?? cita.inicio
  return hora ? String(hora) : 'Hora no especificada'
}

function descripcionCita(cita) {
  return `${nombreCita(cita)} — ${servicioCita(cita)} | ${fechaCita(cita)} · ${horaCita(cita)}`
}

function buscarCita(id) {
  return citas.value.find(cita => String(cita.id ?? cita._id) === String(id)) || null
}

function abrirNuevo() {
  formulario.value = {
    citaId: '',
    monto: '',
    metodo: 'EFECTIVO'
  }
  modalNuevo.value = true
}

function completarSaldo() {
  if (resumenSeleccionado.value) {
    formulario.value.monto =
      resumenSeleccionado.value.saldoPendiente.toFixed(2)
  }
}

function mostrarMensaje(texto, tipo = 'exito') {
  mensaje.value = texto
  tipoMensaje.value = tipo
}

function guardarPago() {
  const resultado = registrarPago({
    citaId: formulario.value.citaId,
    monto: formulario.value.monto,
    metodo: formulario.value.metodo,
    usuarioId: usuarioActual.value.id,
    usuarioNombre: usuarioActual.value.nombre
  })

  if (!resultado.ok) {
    mostrarMensaje(resultado.mensaje, 'error')
    return
  }

  modalNuevo.value = false
  mostrarMensaje(
    `Pago registrado. Comprobante: ${resultado.pago.comprobante}`
  )
}

function verDetalle(pago) {
  pagoSeleccionado.value = pago
  modalDetalle.value = true
}

function solicitarAnulacion(pago) {
  pagoSeleccionado.value = pago
  motivoAnulacion.value = ''
  errorAnulacion.value = ''
  modalDetalle.value = false
  modalAnular.value = true
}

function confirmarAnulacion() {
  if (!pagoSeleccionado.value) return
  errorAnulacion.value = ''

  const resultado = anularPago({
    pagoId: pagoSeleccionado.value.id,
    motivo: motivoAnulacion.value,
    usuarioId: usuarioActual.value.id,
    rol: usuarioActual.value.rol
  })

  if (!resultado.ok) {
    errorAnulacion.value = resultado.mensaje || 'No se pudo anular el pago.'
    return
  }

  modalAnular.value = false
  mostrarMensaje('El pago fue anulado y el saldo se actualizó.')
}

watch(
  () => formulario.value.citaId,
  () => {
    formulario.value.monto = ''
  }
)
</script>

<template>
  <section class="pagos-admin">
    <div class="pagos-encabezado">
      <div>
        <span class="pagos-etiqueta">SIGCA / CONTROL FINANCIERO</span>
        <h1>Pagos y saldos.</h1>
        <p>Consulta los ingresos, registra abonos y da seguimiento a los saldos de cada atención.</p>
      </div>

      <button class="pagos-boton-principal" @click="abrirNuevo">
        <Plus :size="17" />
        Nuevo pago
      </button>
    </div>

    <div v-if="mensaje" class="pagos-alerta" :class="tipoMensaje">
      <component
        :is="tipoMensaje === 'error' ? AlertCircle : CheckCircle2"
        :size="17"
      />
      <span>{{ mensaje }}</span>
      <button @click="mensaje = ''"><X :size="16" /></button>
    </div>

    <div class="pagos-resumen">
      <article class="pagos-tarjeta">
        <div class="pagos-icono"><Wallet :size="22" /></div>
        <div>
          <span>Ingresos válidos</span>
          <strong>{{ moneda(totalRegistrado) }}</strong>
          <small>Pagos registrados</small>
        </div>
      </article>

      <article class="pagos-tarjeta">
        <div class="pagos-icono"><Clock3 :size="22" /></div>
        <div>
          <span>Saldos pendientes</span>
          <strong>{{ moneda(totalPendiente) }}</strong>
          <small>Por cobrar en citas</small>
        </div>
      </article>

      <article class="pagos-tarjeta">
        <div class="pagos-icono"><Ban :size="22" /></div>
        <div>
          <span>Pagos anulados</span>
          <strong>{{ moneda(totalAnulado) }}</strong>
          <small>No se contabilizan como ingresos</small>
        </div>
      </article>
    </div>

    <div class="pagos-panel">
      <div class="pagos-panel-titulo">
        <div>
          <span class="pagos-etiqueta">01 — MOVIMIENTOS</span>
          <h2>Historial de pagos</h2>
        </div>
        <span class="pagos-contador">{{ pagosFiltrados.length }} resultados</span>
      </div>

      <div class="pagos-filtros">
        <label class="pagos-busqueda">
          <Search :size="17" />
          <input
            v-model="busqueda"
            placeholder="Buscar paciente, comprobante o cita..."
          />
        </label>

        <input
          v-model="filtroFecha"
          type="date"
          class="pagos-control"
          title="Filtrar por fecha"
        />

        <select v-model="filtroMetodo" class="pagos-control">
          <option value="">Todos los métodos</option>
          <option value="EFECTIVO">Efectivo</option>
          <option value="TRANSFERENCIA">Transferencia</option>
          <option value="TARJETA">Tarjeta</option>
        </select>

        <select v-model="filtroEstado" class="pagos-control">
          <option value="">Todos los estados</option>
          <option value="REGISTRADO">Registrados</option>
          <option value="ANULADO">Anulados</option>
        </select>
      </div>

      <div class="pagos-tabla-contenedor">
        <table class="pagos-tabla">
          <thead>
            <tr>
              <th>Comprobante</th>
              <th>Paciente</th>
              <th>Fecha y hora</th>
              <th>Método</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pago in pagosFiltrados" :key="pago.id">
              <td class="pagos-codigo">{{ pago.comprobante }}</td>
              <td>
                <strong>{{ pago.pacienteNombre }}</strong>
                <small>{{ descripcionCita(buscarCita(pago.citaId)) }}</small>
              </td>
              <td>{{ fechaVisible(pago.fecha) }}</td>
              <td>{{ pago.metodo }}</td>
              <td class="pagos-monto">{{ moneda(pago.monto) }}</td>
              <td>
                <span
                  class="pagos-estado"
                  :class="pago.estado === 'REGISTRADO' ? 'registrado' : 'anulado'"
                >
                  {{ pago.estado === 'REGISTRADO' ? 'Registrado' : 'Anulado' }}
                </span>
              </td>
              <td>
                <div class="pagos-acciones">
                  <button title="Ver comprobante" @click="verDetalle(pago)">
                    <Eye :size="16" />
                  </button>
                  <button
                    v-if="pago.estado === 'REGISTRADO'"
                    title="Anular pago"
                    @click="solicitarAnulacion(pago)"
                  >
                    <Ban :size="16" />
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!pagosFiltrados.length">
              <td colspan="7" class="pagos-vacio">
                Todavía no hay pagos que coincidan con la búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pagos-panel">
      <div class="pagos-panel-titulo">
        <div>
          <span class="pagos-etiqueta">02 — CUENTAS POR COBRAR</span>
          <h2>Saldos por cita</h2>
        </div>
      </div>

      <div class="pagos-tabla-contenedor">
        <table class="pagos-tabla">
          <thead>
            <tr>
              <th>Paciente</th>
              <th>Cita</th>
              <th>Costo</th>
              <th>Pagado</th>
              <th>Saldo</th>
              <th>Estado financiero</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="cita in citas" :key="cita.id ?? cita._id">
              <tr v-if="obtenerResumenCita(cita.id ?? cita._id)">
                <td><strong>{{ nombreCita(cita) }}</strong></td>
                <td>
                  <strong>{{ servicioCita(cita) }}</strong>
                  <small>{{ fechaCita(cita) }} · {{ horaCita(cita) }}</small>
                </td>
                <td>{{ moneda(obtenerResumenCita(cita.id ?? cita._id).costo) }}</td>
                <td>{{ moneda(obtenerResumenCita(cita.id ?? cita._id).totalPagado) }}</td>
                <td class="pagos-monto">
                  {{ moneda(obtenerResumenCita(cita.id ?? cita._id).saldoPendiente) }}
                </td>
                <td>
                  <span
                    class="pagos-estado"
                    :class="obtenerResumenCita(cita.id ?? cita._id).estadoFinanciero.toLowerCase()"
                  >
                    {{ obtenerResumenCita(cita.id ?? cita._id).estadoFinanciero }}
                  </span>
                </td>
              </tr>
            </template>
            <tr v-if="!citas.length">
              <td colspan="6" class="pagos-vacio">
                No hay citas registradas.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Registrar pago -->
    <div v-if="modalNuevo" class="pagos-overlay" @click.self="modalNuevo = false">
      <div class="pagos-modal">
        <div class="pagos-modal-cabecera">
          <div>
            <span class="pagos-etiqueta">AVENIA / FINANZAS</span>
            <h2>Registrar pago</h2>
          </div>
          <button class="pagos-cerrar" @click="modalNuevo = false">
            <X :size="20" />
          </button>
        </div>

        <form class="pagos-formulario" @submit.prevent="guardarPago">
          <div v-if="!cajaActual" class="pagos-aviso">
            <AlertCircle :size="18" />
            No se encontró una caja abierta para este usuario. Verifica Caja diaria antes de registrar pagos.
          </div>

          <div v-if="cajaActual" class="pagos-caja-informacion">
            Caja activa: <strong>{{ cajaActual.id }}</strong> · Responsable: {{ cajaActual.usuarioNombre }}
          </div>

          <div v-if="!citasConSaldo.length" class="pagos-aviso">
            <AlertCircle :size="18" />
            No hay citas con saldo pendiente. Revisa las citas registradas y sus costos.
          </div>

          <label>
            Cita del paciente *
            <select v-model="formulario.citaId" required>
              <option value="">Seleccionar cita</option>
              <option
                v-for="cita in citasConSaldo"
                :key="cita.identificador"
                :value="cita.identificador"
              >
                {{ descripcionCita(cita) }}
                | Saldo: {{ moneda(cita.resumen.saldoPendiente) }}
              </option>
            </select>
          </label>

          <div v-if="resumenSeleccionado" class="pagos-desglose">
            <div><span>Servicio</span><strong>{{ servicioCita(buscarCita(formulario.citaId)) }}</strong></div>
            <div><span>Fecha y hora</span><strong>{{ fechaCita(buscarCita(formulario.citaId)) }} · {{ horaCita(buscarCita(formulario.citaId)) }}</strong></div>
            <div><span>Costo de la cita</span><strong>{{ moneda(resumenSeleccionado.costo) }}</strong></div>
            <div><span>Abonos anteriores</span><strong>{{ moneda(resumenSeleccionado.totalPagado) }}</strong></div>
            <div><span>Saldo pendiente</span><strong>{{ moneda(resumenSeleccionado.saldoPendiente) }}</strong></div>
          </div>

          <div class="pagos-campos-dobles">
            <label>
              Monto del pago (Q) *
              <input
                v-model="formulario.monto"
                type="number"
                min="0.01"
                step="0.01"
                required
                placeholder="0.00"
              />
            </label>

            <label>
              Método de pago *
              <select v-model="formulario.metodo" required>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="TARJETA">Tarjeta</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            class="pagos-boton-secundario"
            :disabled="!resumenSeleccionado"
            @click="completarSaldo"
          >
            Completar saldo pendiente
          </button>

          <div class="pagos-modal-pie">
            <button type="button" class="pagos-boton-secundario" @click="modalNuevo = false">
              Cancelar
            </button>
            <button type="submit" class="pagos-boton-principal" :disabled="!cajaActual || !resumenSeleccionado">
              <Receipt :size="16" />
              Registrar pago
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detalle del comprobante -->
    <div v-if="modalDetalle && pagoSeleccionado" class="pagos-overlay" @click.self="modalDetalle = false">
      <div class="pagos-modal">
        <div class="pagos-modal-cabecera">
          <div>
            <span class="pagos-etiqueta">AVENIA / COMPROBANTE INTERNO</span>
            <h2>{{ pagoSeleccionado.comprobante }}</h2>
          </div>
          <button class="pagos-cerrar" @click="modalDetalle = false">
            <X :size="20" />
          </button>
        </div>

        <div class="pagos-formulario">
          <div class="pagos-comprobante">
            <Receipt :size="30" />
            <strong>{{ moneda(pagoSeleccionado.monto) }}</strong>
            <span>{{ pagoSeleccionado.estado }}</span>
          </div>

          <div class="pagos-desglose">
            <div><span>Paciente</span><strong>{{ pagoSeleccionado.pacienteNombre }}</strong></div>
            <div><span>Cita</span><strong>{{ descripcionCita(buscarCita(pagoSeleccionado.citaId)) }}</strong></div>
            <div><span>Método</span><strong>{{ pagoSeleccionado.metodo }}</strong></div>
            <div><span>Fecha</span><strong>{{ fechaVisible(pagoSeleccionado.fecha) }}</strong></div>
            <div><span>Registrado por</span><strong>{{ pagoSeleccionado.usuarioNombre }}</strong></div>
            <div><span>Caja</span><strong>{{ pagoSeleccionado.cajaId }}</strong></div>
            <div v-if="pagoSeleccionado.motivoAnulacion">
              <span>Motivo de anulación</span>
              <strong>{{ pagoSeleccionado.motivoAnulacion }}</strong>
            </div>
          </div>

          <div class="pagos-modal-pie">
            <button class="pagos-boton-secundario" @click="modalDetalle = false">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Anulación -->
    <div v-if="modalAnular && pagoSeleccionado" class="pagos-overlay" @click.self="modalAnular = false">
      <div class="pagos-modal">
        <div class="pagos-modal-cabecera">
          <div>
            <span class="pagos-etiqueta">AVENIA / OPERACIÓN CONTROLADA</span>
            <h2>Anular pago</h2>
          </div>
          <button class="pagos-cerrar" @click="modalAnular = false">
            <X :size="20" />
          </button>
        </div>

        <form class="pagos-formulario" @submit.prevent="confirmarAnulacion">
          <div v-if="errorAnulacion" class="pagos-aviso" role="alert">
            <AlertCircle :size="18" />
            <span>{{ errorAnulacion }}</span>
          </div>
          <p>
            Se anulará el comprobante
            <strong>{{ pagoSeleccionado.comprobante }}</strong>
            por {{ moneda(pagoSeleccionado.monto) }}.
          </p>

          <label>
            Motivo de anulación *
            <textarea
              v-model="motivoAnulacion"
              rows="4"
              required
              placeholder="Explique por qué se anula este pago..."
            ></textarea>
          </label>

          <div class="pagos-modal-pie">
            <button type="button" class="pagos-boton-secundario" @click="modalAnular = false">
              Cancelar
            </button>
            <button type="submit" class="pagos-boton-principal">
              Confirmar anulación
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pagos-caja-informacion {
  background: #f2e8ee;
  border: 1px solid #e8dce3;
  border-radius: 9px;
  color: #76566e;
  font-size: 12px;
  padding: 12px 16px;
  margin-bottom: 18px;
}

.pagos-admin {
  padding: 36px 32px 52px;
  background: #fcf9f6;
  color: #40333d;
  min-height: 100%;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
}

.pagos-encabezado,
.pagos-panel-titulo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.pagos-etiqueta {
  color: #98758b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.pagos-encabezado h1 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 46px;
  font-weight: 500;
  color: #40333d;
  margin: 14px 0 8px;
}

.pagos-encabezado p,
.pagos-panel p {
  font-size: 13px;
  color: #987f8e;
}

.pagos-boton-principal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  border-radius: 9px;
  background: #76566e;
  color: #fff;
  padding: 13px 20px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
}

.pagos-boton-principal:hover {
  background: #61465b;
}

.pagos-boton-principal:disabled {
  opacity: .5;
  cursor: not-allowed;
}

.pagos-boton-secundario {
  border: 1px solid #e8dce3;
  background: #fff;
  color: #76566e;
  border-radius: 9px;
  padding: 12px 17px;
  cursor: pointer;
  font-size: 12px;
}

.pagos-resumen {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.pagos-tarjeta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 23px 20px;
  background: white;
  border: 1px solid #ecdee5;
  border-radius: 13px;
}

.pagos-icono {
  width: 47px;
  height: 47px;
  flex-shrink: 0;
  border-radius: 12px;
  background: #f2e8ee;
  color: #76566e;
  display: grid;
  place-items: center;
}

.pagos-tarjeta span,
.pagos-tarjeta small {
  display: block;
  font-size: 11px;
  color: #a18a99;
}

.pagos-tarjeta strong {
  display: block;
  font-family: Georgia, serif;
  font-size: 25px;
  font-weight: 400;
  margin: 7px 0;
  color: #40333d;
}

.pagos-panel {
  background: white;
  border: 1px solid #ecdee5;
  border-radius: 14px;
  padding: 26px;
  margin-bottom: 22px;
}

.pagos-panel-titulo {
  margin-bottom: 24px;
}

.pagos-panel-titulo h2,
.pagos-modal-cabecera h2 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 500;
  color: #40333d;
  font-size: 30px;
  margin: 8px 0 0;
}

.pagos-contador {
  font-size: 11px;
  color: #a18a99;
}

.pagos-filtros {
  display: grid;
  grid-template-columns: minmax(200px, 1fr) 150px 170px 150px;
  gap: 10px;
  margin-bottom: 20px;
}

.pagos-busqueda {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #eadde4;
  border-radius: 8px;
  padding: 0 13px;
  color: #a18a99;
}

.pagos-busqueda input {
  border: none;
  outline: none;
  width: 100%;
  height: 40px;
  background: transparent;
}

.pagos-control {
  width: 100%;
  border: 1px solid #eadde4;
  border-radius: 8px;
  background: white;
  color: #76566e;
  padding: 0 10px;
  height: 42px;
  font-size: 11px;
}

.pagos-tabla-contenedor {
  overflow-x: auto;
}

.pagos-tabla {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12px;
}

.pagos-tabla th {
  background: #faf6f9;
  color: #a18a99;
  font-size: 10px;
  font-weight: 600;
  padding: 14px 12px;
  white-space: nowrap;
}

.pagos-tabla td {
  border-bottom: 1px solid #f0e6eb;
  padding: 16px 12px;
  color: #705d6b;
}

.pagos-tabla td strong,
.pagos-tabla td small {
  display: block;
}

.pagos-tabla td strong {
  color: #40333d;
  font-size: 12px;
}

.pagos-tabla td small {
  color: #aa96a2;
  font-size: 10px;
  margin-top: 5px;
}

.pagos-codigo,
.pagos-monto {
  color: #76566e !important;
  font-weight: 700;
}

.pagos-estado {
  display: inline-block;
  border-radius: 30px;
  padding: 6px 10px;
  font-size: 10px;
  font-weight: 700;
}

.pagos-estado.registrado,
.pagos-estado.pagado {
  background: #eaf5ed;
  color: #358451;
}

.pagos-estado.pendiente {
  background: #f6eee2;
  color: #a47b3e;
}

.pagos-estado.parcial {
  background: #f2e8ee;
  color: #76566e;
}

.pagos-estado.anulado {
  background: #fae8e8;
  color: #b45252;
}

.pagos-acciones {
  display: flex;
  gap: 7px;
}

.pagos-acciones button,
.pagos-cerrar {
  display: grid;
  place-items: center;
  border: 1px solid #eadde4;
  border-radius: 7px;
  background: white;
  color: #76566e;
  padding: 7px;
  cursor: pointer;
}

.pagos-vacio {
  text-align: center;
  padding: 35px !important;
  color: #a18a99 !important;
}

.pagos-alerta,
.pagos-aviso {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  border-radius: 9px;
  font-size: 12px;
  margin-bottom: 20px;
}

.pagos-alerta.exito {
  background: #eaf5ed;
  color: #358451;
}

.pagos-alerta.error,
.pagos-aviso {
  background: #fff0ed;
  color: #a64f48;
}

.pagos-alerta button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.pagos-overlay {
  position: fixed;
  inset: 0;
  background: rgba(42, 32, 40, .52);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
}

.pagos-modal {
  background: white;
  border-radius: 17px;
  width: min(600px, 100%);
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 70px rgba(40, 25, 35, .15);
}

.pagos-modal-cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 1px solid #eee2e8;
}

.pagos-formulario {
  padding: 26px 28px;
}

.pagos-formulario label {
  display: flex;
  flex-direction: column;
  gap: 9px;
  color: #76566e;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 20px;
}

.pagos-formulario input,
.pagos-formulario select,
.pagos-formulario textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #e8dce3;
  border-radius: 8px;
  background: white;
  color: #40333d;
  outline-color: #76566e;
  font: inherit;
  font-weight: 400;
}

.pagos-campos-dobles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.pagos-desglose {
  background: #faf6f9;
  border-radius: 10px;
  padding: 18px;
  margin: 16px 0 22px;
}

.pagos-desglose div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  font-size: 12px;
}

.pagos-desglose span {
  color: #9b8292;
}

.pagos-desglose strong {
  color: #40333d;
  text-align: right;
}

.pagos-modal-pie {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 22px;
  margin-top: 20px;
  border-top: 1px solid #eee2e8;
}

.pagos-comprobante {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  color: #76566e;
}

.pagos-comprobante strong {
  font-family: Georgia, serif;
  font-size: 36px;
  color: #40333d;
  font-weight: 400;
}

@media (max-width: 1100px) {
  .pagos-filtros {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 750px) {
  .pagos-admin {
    padding: 22px 15px;
  }

  .pagos-encabezado {
    align-items: flex-start;
    flex-direction: column;
  }

  .pagos-resumen {
    grid-template-columns: 1fr;
  }

  .pagos-filtros,
  .pagos-campos-dobles {
    grid-template-columns: 1fr;
  }

  .pagos-panel {
    padding: 17px;
  }

  .pagos-modal-cabecera,
  .pagos-formulario {
    padding: 20px;
  }
}
</style>
