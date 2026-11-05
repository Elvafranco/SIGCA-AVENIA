<script setup>
import { ref, computed } from 'vue'
import {
  Wallet, Plus, X, CheckCircle2, Clock3,
  Banknote, CreditCard, ArrowLeftRight,
  LockKeyhole, Eye, ReceiptText
} from 'lucide-vue-next'
import { useCajaStore } from '../../stores/cajaStore.js'

const {
  cajas,
  cajasAbiertas,
  cajasCerradas,
  obtenerCajaAbierta,
  abrirCaja,
  cerrarCaja,
  consultarTotales
} = useCajaStore()

// Usuario temporal de administración.
// Posteriormente se sustituirá por el usuario autenticado.
const usuarioActual = {
  id: 'admin',
  nombre: 'Administración'
}

const modalApertura = ref(false)
const modalCierre = ref(false)
const modalDetalle = ref(false)

const montoInicial = ref('')
const efectivoContado = ref('')
const mensaje = ref('')
const tipoMensaje = ref('exito')
const cajaSeleccionada = ref(null)

const cajaActual = computed(() =>
  obtenerCajaAbierta(usuarioActual.id)
)

const totalesActuales = computed(() =>
  cajaActual.value
    ? consultarTotales(cajaActual.value.id)
    : null
)

const totalCajas = computed(() => cajas.value.length)

const cajasOrdenadas = computed(() =>
  [...cajas.value].sort(
    (a, b) => new Date(b.fechaApertura) - new Date(a.fechaApertura)
  )
)

const totalesDetalle = computed(() =>
  cajaSeleccionada.value
    ? consultarTotales(cajaSeleccionada.value.id)
    : null
)

const movimientosDetalle = computed(() =>
  cajaSeleccionada.value?.movimientos || []
)

const diferenciaCalculada = computed(() => {
  const contado = Number(efectivoContado.value)

  if (
    efectivoContado.value === '' ||
    !Number.isFinite(contado) ||
    !totalesActuales.value
  ) return null

  return Math.round(
    (contado - totalesActuales.value.efectivoEsperado) * 100
  ) / 100
})

function moneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ'
  }).format(Number(valor) || 0)
}

function fecha(valor) {
  if (!valor) return '—'

  return new Date(valor).toLocaleString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function notificar(texto, tipo = 'exito') {
  mensaje.value = texto
  tipoMensaje.value = tipo
}

function guardarApertura() {
  if (montoInicial.value === '') {
    notificar('Ingresa el monto inicial de efectivo.', 'error')
    return
  }

  const resultado = abrirCaja(
    usuarioActual.id,
    usuarioActual.nombre,
    montoInicial.value
  )

  notificar(resultado.mensaje, resultado.ok ? 'exito' : 'error')

  if (resultado.ok) {
    modalApertura.value = false
    montoInicial.value = ''
  }
}

function guardarCierre() {
  if (!cajaActual.value) return

  if (efectivoContado.value === '') {
    notificar('Ingresa el efectivo contado.', 'error')
    return
  }

  const resultado = cerrarCaja(
    cajaActual.value.id,
    usuarioActual.id,
    efectivoContado.value
  )

  notificar(resultado.mensaje, resultado.ok ? 'exito' : 'error')

  if (resultado.ok) {
    modalCierre.value = false
    efectivoContado.value = ''
  }
}

function verDetalle(caja) {
  cajaSeleccionada.value = caja
  modalDetalle.value = true
}

function metodoTexto(metodo) {
  const metodos = {
    EFECTIVO: 'Efectivo',
    TRANSFERENCIA: 'Transferencia',
    TARJETA: 'Tarjeta'
  }

  return metodos[metodo] || metodo
}
</script>

<template>
  <section class="caja-pagina">
    <div class="caja-encabezado">
      <div>
        <span class="caja-etiqueta">SIGCA / CONTROL FINANCIERO</span>
        <h1>Caja diaria.</h1>
        <p>Administra la apertura, los ingresos y el cierre de cada jornada.</p>
      </div>

      <button
        v-if="!cajaActual"
        class="caja-boton-primario"
        @click="modalApertura = true; mensaje = ''"
      >
        <Plus :size="17" />
        Abrir caja
      </button>

      <button
        v-else
        class="caja-boton-primario"
        @click="modalCierre = true; mensaje = ''"
      >
        <LockKeyhole :size="17" />
        Cerrar caja
      </button>
    </div>

    <div
      v-if="mensaje"
      class="caja-aviso"
      :class="{ 'caja-aviso-error': tipoMensaje === 'error' }"
    >
      {{ mensaje }}
      <button @click="mensaje = ''" aria-label="Cerrar aviso">
        <X :size="15" />
      </button>
    </div>

    <div class="caja-indicadores">
      <div class="caja-tarjeta">
        <div class="caja-icono"><Wallet :size="21" /></div>
        <div>
          <span>Estado de mi caja</span>
          <strong>{{ cajaActual ? 'Abierta' : 'Sin caja abierta' }}</strong>
          <small>{{ cajaActual ? cajaActual.id : 'Pendiente de apertura' }}</small>
        </div>
      </div>

      <div class="caja-tarjeta">
        <div class="caja-icono"><Banknote :size="21" /></div>
        <div>
          <span>Ingresos de mi caja</span>
          <strong>{{ moneda(totalesActuales?.totalIngresos) }}</strong>
          <small>Pagos válidos registrados</small>
        </div>
      </div>

      <div class="caja-tarjeta">
        <div class="caja-icono"><Clock3 :size="21" /></div>
        <div>
          <span>Cajas registradas</span>
          <strong>{{ totalCajas }}</strong>
          <small>{{ cajasCerradas.length }} cierres realizados</small>
        </div>
      </div>
    </div>

    <div v-if="cajaActual" class="caja-panel">
      <div class="caja-seccion-superior">
        <div>
          <span class="caja-etiqueta">01 — JORNADA ACTIVA</span>
          <h2>Resumen de caja</h2>
        </div>
        <span class="caja-estado caja-estado-abierta">Abierta</span>
      </div>

      <div class="caja-datos">
        <div>
          <span>Responsable</span>
          <strong>{{ cajaActual.usuarioNombre }}</strong>
        </div>
        <div>
          <span>Fecha de apertura</span>
          <strong>{{ fecha(cajaActual.fechaApertura) }}</strong>
        </div>
        <div>
          <span>Monto inicial</span>
          <strong>{{ moneda(cajaActual.montoInicial) }}</strong>
        </div>
      </div>

      <div class="caja-resumen">
        <div>
          <Banknote :size="19" />
          <span>Ingresos en efectivo</span>
          <strong>{{ moneda(totalesActuales?.totalEfectivo) }}</strong>
        </div>
        <div>
          <ArrowLeftRight :size="19" />
          <span>Transferencias</span>
          <strong>{{ moneda(totalesActuales?.totalTransferencias) }}</strong>
        </div>
        <div>
          <CreditCard :size="19" />
          <span>Tarjetas</span>
          <strong>{{ moneda(totalesActuales?.totalTarjeta) }}</strong>
        </div>
        <div class="caja-resumen-destacado">
          <Wallet :size="19" />
          <span>Efectivo esperado</span>
          <strong>{{ moneda(totalesActuales?.efectivoEsperado) }}</strong>
        </div>
      </div>

      <div class="caja-total">
        <span>Total de ingresos de la jornada</span>
        <strong>{{ moneda(totalesActuales?.totalIngresos) }}</strong>
      </div>
    </div>

    <div v-else class="caja-panel caja-vacio">
      <div class="caja-icono caja-icono-grande">
        <Wallet :size="30" />
      </div>
      <h2>Tu jornada comienza aquí.</h2>
      <p>
        Abre una caja para habilitar el registro de pagos y llevar
        el control de los ingresos del día.
      </p>
      <button
        class="caja-boton-primario"
        @click="modalApertura = true; mensaje = ''"
      >
        <Plus :size="17" />
        Abrir mi caja
      </button>
    </div>

    <div class="caja-panel">
      <div class="caja-seccion-superior">
        <div>
          <span class="caja-etiqueta">02 — HISTORIAL</span>
          <h2>Registro de cajas</h2>
          <p>Consulta las jornadas abiertas y los cierres anteriores.</p>
        </div>
        <span class="caja-contador">{{ cajasOrdenadas.length }} registros</span>
      </div>

      <div class="caja-tabla-contenedor">
        <table class="caja-tabla">
          <thead>
            <tr>
              <th>Caja</th>
              <th>Responsable</th>
              <th>Apertura</th>
              <th>Ingresos</th>
              <th>Diferencia</th>
              <th>Estado</th>
              <th>Detalle</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="caja in cajasOrdenadas" :key="caja.id">
              <td><strong>{{ caja.id }}</strong></td>
              <td>{{ caja.usuarioNombre }}</td>
              <td>{{ fecha(caja.fechaApertura) }}</td>
              <td>{{ moneda(consultarTotales(caja.id)?.totalIngresos) }}</td>
              <td>
                {{ caja.diferencia === null ? '—' : moneda(caja.diferencia) }}
              </td>
              <td>
                <span
                  class="caja-estado"
                  :class="caja.estado === 'ABIERTA'
                    ? 'caja-estado-abierta'
                    : 'caja-estado-cerrada'"
                >
                  {{ caja.estado === 'ABIERTA' ? 'Abierta' : 'Cerrada' }}
                </span>
              </td>
              <td>
                <button class="caja-boton-icono" @click="verDetalle(caja)">
                  <Eye :size="17" />
                </button>
              </td>
            </tr>

            <tr v-if="!cajasOrdenadas.length">
              <td colspan="7" class="caja-sin-registros">
                Todavía no hay cajas registradas.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Apertura -->
    <div v-if="modalApertura" class="caja-fondo-modal">
      <div class="caja-modal">
        <div class="caja-modal-encabezado">
          <div>
            <span class="caja-etiqueta">AVENIA / APERTURA</span>
            <h2>Abrir caja diaria</h2>
          </div>
          <button class="caja-boton-icono" @click="modalApertura = false">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="guardarApertura">
          <div class="caja-modal-cuerpo">
            <label>Usuario responsable</label>
            <input :value="usuarioActual.nombre" disabled />

            <label>Monto inicial de efectivo (Q) *</label>
            <input
              v-model="montoInicial"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />

            <p class="caja-ayuda">
              El monto inicial se utilizará para calcular el efectivo
              esperado al finalizar la jornada.
            </p>
          </div>

          <div class="caja-modal-pie">
            <button type="button" class="caja-boton-secundario"
              @click="modalApertura = false">Cancelar</button>
            <button type="submit" class="caja-boton-primario">
              <CheckCircle2 :size="17" />
              Confirmar apertura
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Cierre -->
    <div v-if="modalCierre && cajaActual" class="caja-fondo-modal">
      <div class="caja-modal">
        <div class="caja-modal-encabezado">
          <div>
            <span class="caja-etiqueta">AVENIA / CIERRE</span>
            <h2>Cerrar caja diaria</h2>
          </div>
          <button class="caja-boton-icono" @click="modalCierre = false">
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="guardarCierre">
          <div class="caja-modal-cuerpo">
            <div class="caja-cierre-linea">
              <span>Monto inicial</span>
              <strong>{{ moneda(cajaActual.montoInicial) }}</strong>
            </div>
            <div class="caja-cierre-linea">
              <span>Ingresos en efectivo</span>
              <strong>{{ moneda(totalesActuales?.totalEfectivo) }}</strong>
            </div>
            <div class="caja-cierre-linea caja-cierre-total">
              <span>Efectivo esperado</span>
              <strong>{{ moneda(totalesActuales?.efectivoEsperado) }}</strong>
            </div>

            <label>Efectivo contado al cierre (Q) *</label>
            <input
              v-model="efectivoContado"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />

            <div v-if="diferenciaCalculada !== null" class="caja-diferencia">
              <span>Diferencia</span>
              <strong>{{ moneda(diferenciaCalculada) }}</strong>
              <small v-if="diferenciaCalculada < 0">Faltante de efectivo</small>
              <small v-else-if="diferenciaCalculada > 0">Sobrante de efectivo</small>
              <small v-else>Cuadre exacto</small>
            </div>

            <p class="caja-ayuda">
              Al cerrar la caja ya no podrán registrarse ni anularse
              pagos asociados a esta jornada.
            </p>
          </div>

          <div class="caja-modal-pie">
            <button type="button" class="caja-boton-secundario"
              @click="modalCierre = false">Cancelar</button>
            <button type="submit" class="caja-boton-primario">
              <LockKeyhole :size="17" />
              Confirmar cierre
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Detalle -->
    <div v-if="modalDetalle && cajaSeleccionada" class="caja-fondo-modal">
      <div class="caja-modal caja-modal-ancho">
        <div class="caja-modal-encabezado">
          <div>
            <span class="caja-etiqueta">AVENIA / TRAZABILIDAD</span>
            <h2>Detalle de {{ cajaSeleccionada.id }}</h2>
          </div>
          <button class="caja-boton-icono" @click="modalDetalle = false">
            <X :size="20" />
          </button>
        </div>

        <div class="caja-modal-cuerpo">
          <div class="caja-datos">
            <div>
              <span>Responsable</span>
              <strong>{{ cajaSeleccionada.usuarioNombre }}</strong>
            </div>
            <div>
              <span>Apertura</span>
              <strong>{{ fecha(cajaSeleccionada.fechaApertura) }}</strong>
            </div>
            <div>
              <span>Cierre</span>
              <strong>{{ fecha(cajaSeleccionada.fechaCierre) }}</strong>
            </div>
          </div>

          <div class="caja-resumen">
            <div>
              <span>Efectivo</span>
              <strong>{{ moneda(totalesDetalle?.totalEfectivo) }}</strong>
            </div>
            <div>
              <span>Transferencias</span>
              <strong>{{ moneda(totalesDetalle?.totalTransferencias) }}</strong>
            </div>
            <div>
              <span>Tarjeta</span>
              <strong>{{ moneda(totalesDetalle?.totalTarjeta) }}</strong>
            </div>
            <div>
              <span>Total ingresos</span>
              <strong>{{ moneda(totalesDetalle?.totalIngresos) }}</strong>
            </div>
          </div>

          <h3 class="caja-subtitulo">
            <ReceiptText :size="19" />
            Movimientos registrados
          </h3>

          <div class="caja-tabla-contenedor">
            <table class="caja-tabla">
              <thead>
                <tr>
                  <th>Comprobante</th>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pago in movimientosDetalle" :key="pago.id">
                  <td>{{ pago.numeroComprobante || pago.comprobante || pago.id }}</td>
                  <td>{{ fecha(pago.fechaHora || pago.fecha) }}</td>
                  <td>{{ metodoTexto(pago.metodo) }}</td>
                  <td>{{ moneda(pago.monto) }}</td>
                  <td>
                    <span class="caja-estado"
                      :class="pago.estado === 'REGISTRADO'
                        ? 'caja-estado-abierta'
                        : 'caja-estado-cerrada'">
                      {{ pago.estado }}
                    </span>
                  </td>
                </tr>
                <tr v-if="!movimientosDetalle.length">
                  <td colspan="5" class="caja-sin-registros">
                    No hay pagos asociados a esta caja.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="cajaSeleccionada.estado === 'CERRADA'" class="caja-cierre-info">
            <div>
              <span>Efectivo esperado</span>
              <strong>{{ moneda(cajaSeleccionada.efectivoEsperado) }}</strong>
            </div>
            <div>
              <span>Efectivo contado</span>
              <strong>{{ moneda(cajaSeleccionada.efectivoContado) }}</strong>
            </div>
            <div>
              <span>Diferencia</span>
              <strong>{{ moneda(cajaSeleccionada.diferencia) }}</strong>
            </div>
          </div>
        </div>

        <div class="caja-modal-pie">
          <button class="caja-boton-secundario" @click="modalDetalle = false">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.caja-pagina {
  padding: 32px 28px 50px;
  background: #fcf9f6;
  color: #40333d;
  min-height: 100%;
  font-family: 'DM Sans', sans-serif;
}
.caja-encabezado, .caja-seccion-superior {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.caja-encabezado { margin-bottom: 30px; }
.caja-etiqueta {
  font-size: 10px;
  letter-spacing: 2px;
  color: #a37c97;
  font-weight: 700;
}
.caja-encabezado h1 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 44px;
  font-weight: 500;
  margin: 12px 0;
  color: #40333d;
}
.caja-encabezado p, .caja-seccion-superior p {
  color: #94798b;
  font-size: 13px;
  margin: 6px 0;
}
.caja-boton-primario {
  border: none;
  border-radius: 8px;
  background: #76566e;
  color: white;
  padding: 13px 19px;
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  justify-content: center;
}
.caja-boton-primario:hover { background: #63455c; }
.caja-boton-secundario {
  border: 1px solid #ead9e3;
  background: white;
  color: #76566e;
  padding: 12px 18px;
  border-radius: 8px;
  cursor: pointer;
}
.caja-indicadores {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 15px;
  margin-bottom: 24px;
}
.caja-tarjeta {
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 23px 20px;
  background: white;
  border: 1px solid #eadfe5;
  border-radius: 12px;
}
.caja-tarjeta span, .caja-tarjeta small {
  display: block;
  font-size: 11px;
  color: #a18096;
}
.caja-tarjeta strong {
  display: block;
  margin: 7px 0;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 27px;
  font-weight: 600;
}
.caja-icono {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2e8ee;
  border-radius: 11px;
  color: #76566e;
}
.caja-panel {
  background: white;
  border: 1px solid #eadfe5;
  border-radius: 13px;
  padding: 26px;
  margin-bottom: 23px;
}
.caja-seccion-superior { margin-bottom: 22px; }
.caja-seccion-superior h2, .caja-modal h2, .caja-vacio h2 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 30px;
  font-weight: 500;
  margin: 8px 0;
  color: #40333d;
}
.caja-estado {
  display: inline-block;
  border-radius: 20px;
  padding: 6px 11px;
  font-size: 10px;
  font-weight: 700;
}
.caja-estado-abierta { background: #eaf4ed; color: #287c47; }
.caja-estado-cerrada { background: #f3e7eb; color: #a25b6e; }
.caja-datos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  padding: 20px 0;
  border-top: 1px solid #f0e6eb;
  border-bottom: 1px solid #f0e6eb;
}
.caja-datos span, .caja-cierre-info span {
  display: block;
  font-size: 11px;
  color: #9c8194;
  margin-bottom: 7px;
}
.caja-datos strong, .caja-cierre-info strong {
  font-size: 13px;
  font-weight: 600;
}
.caja-resumen {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 22px 0;
}
.caja-resumen > div {
  border: 1px solid #f0e6eb;
  border-radius: 9px;
  padding: 17px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: #76566e;
}
.caja-resumen span { color: #967e90; font-size: 11px; }
.caja-resumen strong { color: #40333d; font-size: 17px; }
.caja-resumen-destacado { background: #faf5f8; }
.caja-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-radius: 9px;
  background: #76566e;
  color: white;
  font-size: 13px;
}
.caja-total strong { font-size: 22px; }
.caja-vacio {
  text-align: center;
  padding: 45px 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.caja-icono-grande { width: 60px; height: 60px; }
.caja-vacio p {
  color: #94798b;
  max-width: 400px;
  font-size: 13px;
  line-height: 1.8;
}
.caja-contador { color: #a18096; font-size: 11px; }
.caja-tabla-contenedor { overflow-x: auto; }
.caja-tabla {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12px;
}
.caja-tabla th {
  background: #faf5f8;
  color: #a18096;
  font-size: 10px;
  padding: 15px 12px;
  font-weight: 600;
}
.caja-tabla td {
  padding: 17px 12px;
  border-bottom: 1px solid #f1e8ed;
}
.caja-sin-registros {
  text-align: center;
  color: #a18096;
  padding: 35px !important;
}
.caja-boton-icono {
  background: white;
  border: 1px solid #ead9e3;
  color: #76566e;
  border-radius: 7px;
  padding: 7px;
  display: inline-flex;
  cursor: pointer;
}
.caja-fondo-modal {
  position: fixed;
  inset: 0;
  background: rgba(40, 30, 40, .52);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
}
.caja-modal {
  background: white;
  border-radius: 15px;
  width: 100%;
  max-width: 530px;
  max-height: 88vh;
  overflow-y: auto;
}
.caja-modal-ancho { max-width: 850px; }
.caja-modal-encabezado {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 25px;
  border-bottom: 1px solid #f0e6eb;
}
.caja-modal-cuerpo { padding: 25px; }
.caja-modal-cuerpo label {
  display: block;
  color: #76566e;
  font-size: 12px;
  font-weight: 600;
  margin: 17px 0 9px;
}
.caja-modal-cuerpo input {
  width: 100%;
  padding: 13px;
  border: 1px solid #e8d7e1;
  border-radius: 8px;
  outline: none;
  color: #40333d;
  background: white;
}
.caja-modal-cuerpo input:focus { border-color: #76566e; }
.caja-modal-cuerpo input:disabled { background: #faf5f8; }
.caja-ayuda {
  color: #94798b;
  font-size: 12px;
  line-height: 1.7;
}
.caja-modal-pie {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 25px;
  border-top: 1px solid #f0e6eb;
}
.caja-cierre-linea, .caja-diferencia {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  font-size: 13px;
}
.caja-cierre-total {
  border-top: 1px solid #eadfe5;
  font-weight: 700;
}
.caja-diferencia {
  flex-wrap: wrap;
  background: #faf5f8;
  border-radius: 8px;
  padding: 15px;
  margin-top: 18px;
}
.caja-diferencia small { width: 100%; color: #a18096; }
.caja-subtitulo {
  display: flex;
  gap: 9px;
  align-items: center;
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 25px;
  font-weight: 500;
  margin-top: 28px;
}
.caja-cierre-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 25px;
  padding: 20px;
  background: #faf5f8;
  border-radius: 9px;
}
.caja-aviso {
  display: flex;
  justify-content: space-between;
  padding: 14px 18px;
  margin-bottom: 20px;
  border-radius: 8px;
  background: #eaf4ed;
  color: #287c47;
  font-size: 12px;
}
.caja-aviso-error { background: #fff0ed; color: #b84e47; }
.caja-aviso button { border: 0; background: none; cursor: pointer; color: inherit; }
@media (max-width: 950px) {
  .caja-indicadores { grid-template-columns: 1fr; }
  .caja-resumen { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 650px) {
  .caja-pagina { padding: 20px 15px; }
  .caja-encabezado { align-items: flex-start; flex-direction: column; }
  .caja-datos, .caja-cierre-info { grid-template-columns: 1fr; }
  .caja-resumen { grid-template-columns: 1fr; }
}
</style>
