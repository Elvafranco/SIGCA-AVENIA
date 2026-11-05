<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  UsersRound,
  CalendarDays,
  Wallet,
  Clock3,
  ArrowUpRight,
  ArrowRight,
  Plus,
  ClipboardList,
  Activity,
  CalendarClock,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-vue-next'

// Datos de demostración.
// Más adelante se conectarán con MongoDB.
const pacientes = ref([])
const citas = ref([])
const pagos = ref([])
const actividades = ref([])

const fechaActual = computed(() =>
  new Date().toLocaleDateString('es-GT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
)

const hoy = computed(() => {
  const fecha = new Date()
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
})

const citasHoy = computed(() =>
  citas.value.filter(cita => cita.fecha === hoy.value)
)

const citasPendientes = computed(() =>
  citas.value.filter(cita =>
    ['pendiente', 'programada'].includes(cita.estado)
  )
)

const ingresosHoy = computed(() =>
  pagos.value
    .filter(pago => pago.fecha === hoy.value)
    .reduce((total, pago) => total + Number(pago.monto || 0), 0)
)

const formatoMoneda = (valor) =>
  new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ'
  }).format(valor)

const tarjetas = computed(() => [
  {
    titulo: 'Pacientes registrados',
    valor: pacientes.value.length,
    descripcion: 'Total de pacientes',
    icono: UsersRound,
    clase: 'malva'
  },
  {
    titulo: 'Citas del día',
    valor: citasHoy.value.length,
    descripcion: 'Programadas para hoy',
    icono: CalendarDays,
    clase: 'champagne'
  },
  {
    titulo: 'Ingresos del día',
    valor: formatoMoneda(ingresosHoy.value),
    descripcion: 'Pagos registrados hoy',
    icono: Wallet,
    clase: 'rosa'
  },
  {
    titulo: 'Citas pendientes',
    valor: citasPendientes.value.length,
    descripcion: 'Por atender o confirmar',
    icono: Clock3,
    clase: 'crema'
  }
])

const proximasCitas = computed(() =>
  [...citas.value]
    .filter(cita => cita.fecha >= hoy.value)
    .sort((a, b) =>
      `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`)
    )
    .slice(0, 5)
)
</script>

<template>
  <div class="dashboard">

    <!-- BIENVENIDA -->
    <section class="bienvenida">
      <div class="bienvenida-texto">
        <span class="sobrelinea">
          AVENIA / GESTIÓN INTEGRAL
        </span>

        <h2>
          Un espacio para organizar
          <em>lo que importa.</em>
        </h2>

        <p>
          Consulta la actividad del centro y accede a las
          herramientas de gestión desde un mismo lugar.
        </p>

        <div class="bienvenida-fecha">
          <CalendarDays :size="16" />
          <span>{{ fechaActual }}</span>
        </div>
      </div>

      <div class="bienvenida-decoracion" aria-hidden="true">
        <div class="circulo circulo-uno"></div>
        <div class="circulo circulo-dos"></div>
        <div class="circulo circulo-tres"></div>
        <Sparkles :size="35" :stroke-width="1" />
      </div>
    </section>

    <!-- ENCABEZADO DE INDICADORES -->
    <div class="seccion-encabezado">
      <div>
        <span class="sobrelinea">01 — VISTA GENERAL</span>
        <h3>Resumen de operaciones</h3>
      </div>

      <span class="indicador-demo">
        Datos de demostración
      </span>
    </div>

    <!-- TARJETAS DE INDICADORES -->
    <section class="indicadores">
      <article
        v-for="tarjeta in tarjetas"
        :key="tarjeta.titulo"
        class="indicador"
      >
        <div class="indicador-superior">
          <span>{{ tarjeta.titulo }}</span>

          <div class="indicador-icono" :class="tarjeta.clase">
            <component
              :is="tarjeta.icono"
              :size="21"
              :stroke-width="1.7"
            />
          </div>
        </div>

        <strong>{{ tarjeta.valor }}</strong>
        <p>{{ tarjeta.descripcion }}</p>
      </article>
    </section>

    <!-- CONTENIDO PRINCIPAL -->
    <div class="dashboard-grid">

      <!-- PRÓXIMAS CITAS -->
      <section class="panel citas-panel">
        <div class="panel-encabezado">
          <div>
            <span class="sobrelinea">02 — AGENDA</span>
            <h3>Próximas citas</h3>
          </div>

          <RouterLink to="/admin/citas" class="enlace-panel">
            Ver agenda
            <ArrowUpRight :size="17" />
          </RouterLink>
        </div>

        <div v-if="proximasCitas.length" class="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="cita in proximasCitas"
                :key="cita.id"
              >
                <td>{{ cita.paciente }}</td>
                <td>{{ cita.servicio }}</td>
                <td>{{ cita.fecha }}</td>
                <td>{{ cita.hora }}</td>
                <td>
                  <span class="estado-cita">
                    {{ cita.estado }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="estado-vacio">
          <div class="vacio-icono">
            <CalendarClock :size="30" :stroke-width="1.4" />
          </div>

          <h4>Tu agenda está lista para comenzar</h4>

          <p>
            Las próximas citas aparecerán aquí cuando
            comencemos a registrar información en SIGCA.
          </p>

          <RouterLink to="/admin/citas" class="vacio-enlace">
            Ir a gestión de citas
            <ArrowRight :size="16" />
          </RouterLink>
        </div>
      </section>

      <!-- ACCESOS RÁPIDOS -->
      <section class="panel accesos-panel">
        <div class="panel-encabezado">
          <div>
            <span class="sobrelinea">03 — HERRAMIENTAS</span>
            <h3>Accesos rápidos</h3>
          </div>
        </div>

        <div class="accesos-lista">
          <RouterLink to="/admin/pacientes" class="acceso">
            <div class="acceso-icono">
              <UsersRound :size="20" />
            </div>

            <div>
              <strong>Registrar paciente</strong>
              <span>Crear un nuevo expediente</span>
            </div>

            <Plus :size="19" class="acceso-flecha" />
          </RouterLink>

          <RouterLink to="/admin/citas" class="acceso">
            <div class="acceso-icono">
              <CalendarDays :size="20" />
            </div>

            <div>
              <strong>Programar cita</strong>
              <span>Organizar la agenda de atención</span>
            </div>

            <Plus :size="19" class="acceso-flecha" />
          </RouterLink>

          <RouterLink to="/admin/pagos" class="acceso">
            <div class="acceso-icono">
              <Wallet :size="20" />
            </div>

            <div>
              <strong>Registrar pago</strong>
              <span>Actualizar cobros y saldos</span>
            </div>

            <Plus :size="19" class="acceso-flecha" />
          </RouterLink>

          <RouterLink to="/admin/materiales" class="acceso">
            <div class="acceso-icono">
              <ClipboardList :size="20" />
            </div>

            <div>
              <strong>Consultar materiales</strong>
              <span>Revisar existencias y movimientos</span>
            </div>

            <ArrowUpRight :size="19" class="acceso-flecha" />
          </RouterLink>
        </div>
      </section>

    </div>

    <!-- ACTIVIDAD RECIENTE -->
    <section class="panel actividad-panel">
      <div class="panel-encabezado">
        <div>
          <span class="sobrelinea">04 — SEGUIMIENTO</span>
          <h3>Actividad reciente</h3>
        </div>

        <Activity :size="21" class="actividad-icono" />
      </div>

      <div v-if="actividades.length" class="actividad-lista">
        <div
          v-for="actividad in actividades"
          :key="actividad.id"
          class="actividad-item"
        >
          <div class="actividad-marca">
            <CheckCircle2 :size="18" />
          </div>

          <div>
            <strong>{{ actividad.titulo }}</strong>
            <p>{{ actividad.descripcion }}</p>
          </div>

          <span>{{ actividad.fecha }}</span>
        </div>
      </div>

      <div v-else class="actividad-vacia">
        <div class="actividad-vacia-icono">
          <AlertCircle :size="22" :stroke-width="1.5" />
        </div>

        <div>
          <strong>Aún no hay movimientos registrados</strong>
          <p>
            Aquí se mostrará la actividad relacionada con
            citas, pacientes, pagos y otros procesos del centro.
          </p>
        </div>
      </div>
    </section>

    <!-- NOTA INFORMATIVA -->
    <div class="nota-sistema">
      <span class="nota-punto"></span>
      <p>
        <strong>Entorno de desarrollo.</strong>
        Los indicadores se encuentran preparados para recibir
        información. Actualmente no están conectados a la base de datos.
      </p>
    </div>

  </div>
</template>

<style scoped>
.dashboard {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  color: #40333D;
}

.sobrelinea {
  display: block;
  color: #95738B;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.8px;
  text-transform: uppercase;
}

/* BIENVENIDA */

.bienvenida {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 265px;
  padding: 42px 48px;
  overflow: hidden;
  background: #F1E6EC;
  border: 1px solid #EADDE5;
  border-radius: 18px;
}

.bienvenida-texto {
  position: relative;
  z-index: 2;
  max-width: 680px;
}

.bienvenida h2 {
  color: #40333D;
  margin: 19px 0;
  font-family: var(--font-heading, Georgia, serif);
  font-size: clamp(36px, 4vw, 56px);
  font-weight: 400;
  line-height: 1.08;
}

.bienvenida h2 em {
  display: block;
  color: #76566E;
  font-weight: 400;
}

.bienvenida p {
  max-width: 490px;
  color: #756671;
  font-size: 13px;
  line-height: 1.9;
}

.bienvenida-fecha {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  color: #76566E;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.bienvenida-decoracion {
  position: relative;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 210px;
  height: 190px;
  color: #76566E;
}

.circulo {
  position: absolute;
  border: 1px solid #C7AABA;
  border-radius: 50%;
}

.circulo-uno {
  width: 170px;
  height: 170px;
}

.circulo-dos {
  width: 125px;
  height: 125px;
}

.circulo-tres {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.35);
}

/* ENCABEZADOS */

.seccion-encabezado {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin: 42px 0 22px;
}

.seccion-encabezado h3,
.panel-encabezado h3 {
  margin: 8px 0 0;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 30px;
  font-weight: 500;
}

.indicador-demo {
  padding: 8px 12px;
  border: 1px solid #E4D5DD;
  border-radius: 20px;
  color: #95738B;
  font-size: 10px;
  font-weight: 700;
}

/* INDICADORES */

.indicadores {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.indicador {
  min-width: 0;
  padding: 24px;
  background: #FFFFFF;
  border: 1px solid #EEE5E9;
  border-radius: 14px;
}

.indicador-superior {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.indicador-superior > span {
  color: #786A73;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
}

.indicador-icono {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 43px;
  height: 43px;
  border-radius: 12px;
}

.indicador-icono.malva {
  background: #F1E6EC;
  color: #76566E;
}

.indicador-icono.champagne {
  background: #F5E9E1;
  color: #A17C6A;
}

.indicador-icono.rosa {
  background: #F4E5EA;
  color: #A46F86;
}

.indicador-icono.crema {
  background: #F6F0E8;
  color: #9C856E;
}

.indicador strong {
  display: block;
  margin-top: 22px;
  color: #40333D;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 37px;
  font-weight: 500;
  line-height: 1;
}

.indicador p {
  margin: 10px 0 0;
  color: #A08F9A;
  font-size: 11px;
}

/* PANELES */

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr);
  gap: 20px;
  margin-top: 24px;
}

.panel {
  min-width: 0;
  padding: 28px;
  background: #FFFFFF;
  border: 1px solid #EEE5E9;
  border-radius: 14px;
}

.panel-encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 25px;
}

.enlace-panel {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #76566E;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.enlace-panel:hover {
  text-decoration: underline;
}

/* TABLA DE CITAS */

.tabla-contenedor {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

th {
  padding: 14px 10px;
  background: #FAF6F8;
  color: #95738B;
  text-align: left;
  font-size: 10px;
  letter-spacing: 0.5px;
}

td {
  padding: 17px 10px;
  border-bottom: 1px solid #F1E9ED;
}

.estado-cita {
  display: inline-block;
  padding: 6px 10px;
  background: #F2E8EE;
  color: #76566E;
  border-radius: 20px;
  font-size: 10px;
  text-transform: capitalize;
}

/* ESTADO VACÍO */

.estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
  padding: 20px;
  text-align: center;
  border: 1px dashed #E6D8E0;
  border-radius: 12px;
  background: #FCFAFB;
}

.vacio-icono {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin-bottom: 17px;
  background: #F1E6EC;
  border-radius: 50%;
  color: #76566E;
}

.estado-vacio h4 {
  margin: 0 0 10px;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 24px;
  font-weight: 500;
}

.estado-vacio p {
  max-width: 330px;
  margin: 0;
  color: #94818E;
  font-size: 12px;
  line-height: 1.8;
}

.vacio-enlace {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  color: #76566E;
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

/* ACCESOS RÁPIDOS */

.accesos-lista {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.acceso {
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 15px;
  border: 1px solid #F0E7EC;
  border-radius: 10px;
  color: #40333D;
  text-decoration: none;
  transition: 0.2s;
}

.acceso:hover {
  background: #FAF6F8;
  border-color: #E4D5DD;
}

.acceso-icono {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  background: #F1E6EC;
  color: #76566E;
  border-radius: 10px;
}

.acceso > div:nth-child(2) {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}

.acceso strong {
  font-size: 12px;
  font-weight: 700;
}

.acceso span {
  color: #A08F9A;
  font-size: 10px;
}

.acceso-flecha {
  flex-shrink: 0;
  color: #76566E;
}

/* ACTIVIDAD */

.actividad-panel {
  margin-top: 24px;
}

.actividad-icono {
  color: #95738B;
}

.actividad-lista {
  display: flex;
  flex-direction: column;
}

.actividad-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 18px 0;
  border-bottom: 1px solid #F1E9ED;
}

.actividad-marca {
  color: #76566E;
}

.actividad-item > div:nth-child(2) {
  flex: 1;
}

.actividad-item strong,
.actividad-vacia strong {
  font-size: 12px;
}

.actividad-item p,
.actividad-vacia p {
  margin: 7px 0 0;
  color: #94818E;
  font-size: 12px;
  line-height: 1.8;
}

.actividad-item > span {
  color: #A08F9A;
  font-size: 11px;
}

.actividad-vacia {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: #FCFAFB;
  border: 1px dashed #E6D8E0;
  border-radius: 10px;
}

.actividad-vacia-icono {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  background: #F1E6EC;
  color: #76566E;
  border-radius: 50%;
}

/* NOTA */

.nota-sistema {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 25px;
  padding: 16px 20px;
  background: #F4EEF1;
  border-radius: 10px;
}

.nota-punto {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 5px;
  background: #B99CAB;
  border-radius: 50%;
}

.nota-sistema p {
  margin: 0;
  color: #786A73;
  font-size: 11px;
  line-height: 1.7;
}

/* RESPONSIVE */

@media (max-width: 1250px) {
  .indicadores {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .bienvenida {
    padding: 30px 25px;
  }

  .bienvenida-decoracion {
    display: none;
  }

  .indicadores {
    grid-template-columns: 1fr;
  }

  .seccion-encabezado {
    align-items: flex-start;
    flex-direction: column;
  }

  .panel {
    padding: 20px;
  }

  .panel-encabezado {
    align-items: flex-start;
    flex-direction: column;
  }

  .actividad-vacia {
    align-items: flex-start;
  }
}
</style>
