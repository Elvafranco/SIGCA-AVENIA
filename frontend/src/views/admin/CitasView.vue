<script setup>
import { computed, ref } from 'vue'
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, Clock3, Search, Plus, X, Pencil, Eye, Save, CheckCircle2, AlertCircle, UserRound } from 'lucide-vue-next'
import { usePacientesStore } from '../../stores/pacientesStore'
import { useCitasStore } from '../../stores/citasStore'
import { useServiciosStore } from '../../stores/serviciosStore'

const { pacientes } = usePacientesStore()
const { citas } = useCitasStore()
const { servicios: catalogoServicios, serviciosActivos } = useServiciosStore()

// El filtro conserva también los nombres de servicios usados en citas anteriores.
const servicios = computed(() => [...new Set([
  ...catalogoServicios.value.map(s => s.nombre),
  ...citas.value.map(c => c.servicio).filter(Boolean)
])])

// Al editar, se permite mantener el servicio histórico aunque ya esté inactivo.
const serviciosSeleccionables = computed(() => [...new Set([
  ...serviciosActivos.value.map(s => s.nombre),
  ...(modoEdicion.value && formulario.value.servicio ? [formulario.value.servicio] : [])
])])
const estados = ['programada', 'confirmada', 'completada', 'cancelada', 'no asistió']
// Personal provisional de demostración: sustituir por el módulo de profesionales.
const profesionales = computed(() => {
  const existentes = [
    { id: 1, nombre: 'Profesional de psicología', servicio: 'Psicología' },
    { id: 2, nombre: 'Profesional de estimulación auditivo-verbal', servicio: 'Estimulación auditivo-verbal' },
    { id: 3, nombre: 'Profesional de apoyo al desarrollo', servicio: 'Apoyo al desarrollo' }
  ]
  // Se mantiene el identificador del profesional para las citas ya registradas.
  const equivalencias = { 'Atención psicológica': 'Psicología' }
  const nuevos = catalogoServicios.value
    .filter(s => !['Atención psicológica', 'Estimulación auditivo-verbal', 'Apoyo al desarrollo'].includes(s.nombre))
    .map(s => ({ id: `servicio-${s.id}`, nombre: `Profesional de ${s.nombre.toLowerCase()}`, servicio: s.nombre }))
  return [...existentes, ...nuevos, {
    ...existentes[0], servicio: 'Atención psicológica'
  }]
})

function fechaLocal(fecha = new Date()) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}
function formularioVacio() {
  return { id: null, pacienteId: '', paciente: '', servicio: '', profesionalId: '', profesional: '', fecha: fechaLocal(), hora: '', duracion: 60, estado: 'programada', observaciones: '' }
}
const fechaSeleccionada = ref(fechaLocal())
const busqueda = ref('')
const filtroEstado = ref('todos')
const filtroServicio = ref('todos')
const modalAbierto = ref(false)
const detalleAbierto = ref(false)
const modoEdicion = ref(false)
const citaSeleccionada = ref(null)
const formulario = ref(formularioVacio())
const mensaje = ref('')
const tipoMensaje = ref('exito')

const pacientesActivos = computed(() => pacientes.value.filter(p => p.estado === 'activo'))
const pacientesSeleccionables = computed(() => pacientes.value.filter(p => p.estado === 'activo' || (modoEdicion.value && String(p.id) === String(formulario.value.pacienteId))))
function nombrePaciente(cita) {
  const paciente = pacientes.value.find(p => String(p.id) === String(cita.pacienteId))
  return paciente ? `${paciente.nombres} ${paciente.apellidos}` : (cita.paciente || 'Paciente no disponible')
}
const profesionalesDisponibles = computed(() => profesionales.value.filter(p => p.servicio === formulario.value.servicio))
const citasFiltradas = computed(() => citas.value.filter(c => {
  const texto = busqueda.value.trim().toLowerCase()
  return (!texto || `${nombrePaciente(c)} ${c.profesional} ${c.servicio}`.toLowerCase().includes(texto)) &&
    (filtroEstado.value === 'todos' || c.estado === filtroEstado.value) &&
    (filtroServicio.value === 'todos' || c.servicio === filtroServicio.value)
}).sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`)))
const citasDelDia = computed(() => citas.value.filter(c => c.fecha === fechaSeleccionada.value).sort((a, b) => a.hora.localeCompare(b.hora)))
const totalProgramadas = computed(() => citas.value.filter(c => c.estado === 'programada').length)
const totalConfirmadas = computed(() => citas.value.filter(c => c.estado === 'confirmada').length)
const totalCompletadas = computed(() => citas.value.filter(c => c.estado === 'completada').length)

function formatoFecha(fecha) {
  if (!fecha) return 'Sin fecha'
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}
function formatoFechaLarga(fecha) {
  return new Date(`${fecha}T12:00:00`).toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function cambiarFecha(dias) {
  const fecha = new Date(`${fechaSeleccionada.value}T12:00:00`)
  fecha.setDate(fecha.getDate() + dias)
  fechaSeleccionada.value = fechaLocal(fecha)
}
function mostrarMensaje(texto, tipo = 'exito') {
  mensaje.value = texto
  tipoMensaje.value = tipo
}
function abrirNuevaCita() {
  formulario.value = formularioVacio()
  formulario.value.fecha = fechaSeleccionada.value
  modoEdicion.value = false
  detalleAbierto.value = false
  modalAbierto.value = true
  mensaje.value = ''
}
function editarCita(cita) {
  formulario.value = { ...cita }
  modoEdicion.value = true
  detalleAbierto.value = false
  modalAbierto.value = true
  mensaje.value = ''
}
function verCita(cita) {
  citaSeleccionada.value = cita
  detalleAbierto.value = true
}
function seleccionarServicio() {
  formulario.value.profesionalId = ''
  formulario.value.profesional = ''
  const servicio = catalogoServicios.value.find(s => s.nombre === formulario.value.servicio)
  if (servicio) formulario.value.duracion = Number(servicio.duracion)
}
function minutos(hora) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}
function guardarCita() {
  const f = formulario.value
  if (!f.pacienteId || !f.servicio || !f.profesionalId || !f.fecha || !f.hora) {
    mostrarMensaje('Completa los campos obligatorios.', 'error')
    return
  }
  const paciente = pacientes.value.find(p => String(p.id) === String(f.pacienteId))
  const profesional = profesionales.value.find(p => String(p.id) === String(f.profesionalId) && p.servicio === f.servicio)
  if (!paciente || !profesional) {
    mostrarMensaje('Selecciona un paciente y un profesional válidos.', 'error')
    return
  }
  if (!modoEdicion.value && paciente.estado !== 'activo') {
    mostrarMensaje('Solo se pueden programar citas para pacientes activos.', 'error')
    return
  }
  const inicio = minutos(f.hora)
  const fin = inicio + Number(f.duracion)
  if (fin > 1440) {
    mostrarMensaje('La cita no puede terminar después de medianoche.', 'error')
    return
  }
  const conflicto = citas.value.some(c => c.id !== f.id && c.estado !== 'cancelada' && c.fecha === f.fecha && String(c.profesionalId) === String(f.profesionalId) && inicio < minutos(c.hora) + Number(c.duracion) && fin > minutos(c.hora))
  if (conflicto && f.estado !== 'cancelada') {
    mostrarMensaje('El profesional ya tiene una cita en ese horario.', 'error')
    return
  }
  const registro = { ...f, paciente: `${paciente.nombres} ${paciente.apellidos}`, profesional: profesional.nombre, duracion: Number(f.duracion) }
  if (modoEdicion.value) {
    const indice = citas.value.findIndex(c => c.id === f.id)
    if (indice !== -1) citas.value[indice] = registro
  } else {
    registro.id = Date.now()
    citas.value.unshift(registro)
  }
  const editada = modoEdicion.value
  fechaSeleccionada.value = registro.fecha
  modalAbierto.value = false
  mostrarMensaje(editada ? 'La cita se actualizó correctamente.' : 'La cita se registró correctamente.')
}
function actualizarEstado(cita, estado) {
  if (estado !== 'cancelada') {
    const inicio = minutos(cita.hora)
    const fin = inicio + Number(cita.duracion)
    const conflicto = citas.value.some(c => c.id !== cita.id && c.estado !== 'cancelada' && c.fecha === cita.fecha && String(c.profesionalId) === String(cita.profesionalId) && inicio < minutos(c.hora) + Number(c.duracion) && fin > minutos(c.hora))
    if (conflicto) {
      mostrarMensaje('El profesional ya tiene otra cita en ese horario.', 'error')
      return
    }
  }
  citas.value = citas.value.map(c => c.id === cita.id ? { ...c, estado } : c)
  citaSeleccionada.value = citas.value.find(c => c.id === cita.id)
  mostrarMensaje(`Estado actualizado a «${estado}».`)
}
</script>

<template>
  <div class="citas-view">
    <header class="encabezado">
      <div>
        <span class="sobrelinea">SIGCA / AGENDA DE ATENCIÓN</span>
        <h2>Gestión de citas</h2>
        <p>Programa sesiones, consulta horarios y actualiza el estado de las atenciones.</p>
      </div>
      <button class="boton-principal" @click="abrirNuevaCita"><Plus :size="18" /> Nueva cita</button>
    </header>

    <div v-if="mensaje" class="mensaje" :class="tipoMensaje" role="status">
      <CheckCircle2 v-if="tipoMensaje === 'exito'" :size="18" />
      <AlertCircle v-else :size="18" />
      <span>{{ mensaje }}</span>
      <button aria-label="Cerrar mensaje" @click="mensaje = ''"><X :size="17" /></button>
    </div>

    <section class="indicadores">
      <article class="indicador"><div class="indicador-icono"><CalendarDays :size="22" /></div><div><span>Total de citas</span><strong>{{ citas.length }}</strong></div></article>
      <article class="indicador"><div class="indicador-icono"><CalendarPlus :size="22" /></div><div><span>Programadas</span><strong>{{ totalProgramadas }}</strong></div></article>
      <article class="indicador"><div class="indicador-icono"><Clock3 :size="22" /></div><div><span>Confirmadas</span><strong>{{ totalConfirmadas }}</strong></div></article>
      <article class="indicador"><div class="indicador-icono"><CheckCircle2 :size="22" /></div><div><span>Completadas</span><strong>{{ totalCompletadas }}</strong></div></article>
    </section>

    <section class="panel">
      <div class="panel-encabezado">
        <div><span class="sobrelinea">01 — AGENDA</span><h3>Citas por fecha</h3></div>
        <div class="navegacion-fecha">
          <button aria-label="Día anterior" @click="cambiarFecha(-1)"><ChevronLeft :size="19" /></button>
          <input v-model="fechaSeleccionada" type="date" aria-label="Seleccionar fecha" />
          <button aria-label="Día siguiente" @click="cambiarFecha(1)"><ChevronRight :size="19" /></button>
        </div>
      </div>
      <p class="fecha-descripcion">{{ formatoFechaLarga(fechaSeleccionada) }}</p>
      <div v-if="citasDelDia.length" class="agenda-lista">
        <article v-for="cita in citasDelDia" :key="cita.id" class="agenda-item">
          <div class="agenda-hora"><Clock3 :size="16" /> {{ cita.hora }}</div>
          <div class="agenda-informacion"><strong>{{ nombrePaciente(cita) }}</strong><span>{{ cita.servicio }}</span><small>{{ cita.profesional }}</small></div>
          <span class="estado" :class="cita.estado.replace(' ', '-')">{{ cita.estado }}</span>
          <button class="accion-icono" aria-label="Ver cita" @click="verCita(cita)"><Eye :size="18" /></button>
        </article>
      </div>
      <div v-else class="estado-vacio">
        <CalendarDays :size="32" :stroke-width="1.4" />
        <h4>No hay citas para esta fecha</h4>
        <p>Selecciona otro día o registra una cita nueva.</p>
        <button class="boton-texto" @click="abrirNuevaCita"><Plus :size="16" /> Programar cita</button>
      </div>
    </section>

    <section class="panel">
      <div class="panel-encabezado"><div><span class="sobrelinea">02 — REGISTROS</span><h3>Listado de citas</h3></div><span class="contador">{{ citasFiltradas.length }} resultados</span></div>
      <div class="herramientas">
        <div class="buscador"><Search :size="18" /><input v-model="busqueda" type="search" placeholder="Buscar paciente o profesional..." /></div>
        <select v-model="filtroServicio" aria-label="Filtrar por servicio"><option value="todos">Todos los servicios</option><option v-for="servicio in servicios" :key="servicio" :value="servicio">{{ servicio }}</option></select>
        <select v-model="filtroEstado" aria-label="Filtrar por estado"><option value="todos">Todos los estados</option><option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option></select>
      </div>
      <div v-if="citasFiltradas.length" class="tabla-scroll">
        <table>
          <thead><tr><th>Paciente</th><th>Servicio</th><th>Profesional</th><th>Fecha</th><th>Hora</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody><tr v-for="cita in citasFiltradas" :key="cita.id">
            <td class="nombre-paciente">{{ nombrePaciente(cita) }}</td><td>{{ cita.servicio }}</td><td>{{ cita.profesional }}</td><td>{{ formatoFecha(cita.fecha) }}</td><td>{{ cita.hora }}</td>
            <td><span class="estado" :class="cita.estado.replace(' ', '-')">{{ cita.estado }}</span></td>
            <td><div class="acciones"><button aria-label="Ver cita" @click="verCita(cita)"><Eye :size="17" /></button><button aria-label="Editar cita" @click="editarCita(cita)"><Pencil :size="16" /></button></div></td>
          </tr></tbody>
        </table>
      </div>
      <div v-else class="estado-vacio"><CalendarDays :size="32" :stroke-width="1.4" /><h4>{{ citas.length ? 'No se encontraron citas' : 'No hay citas registradas' }}</h4><p>{{ citas.length ? 'Modifica los filtros para consultar otros registros.' : 'Las citas registradas aparecerán en este listado.' }}</p></div>
    </section>

    <div v-if="modalAbierto" class="modal-fondo" @click.self="modalAbierto = false">
      <section class="modal" role="dialog" aria-modal="true" aria-label="Formulario de cita">
        <div class="modal-encabezado"><div><span class="sobrelinea">AVENIA / AGENDA</span><h3>{{ modoEdicion ? 'Editar cita' : 'Nueva cita' }}</h3></div><button class="cerrar" aria-label="Cerrar" @click="modalAbierto = false"><X :size="21" /></button></div>
        <form class="formulario" @submit.prevent="guardarCita">
          <div class="grupo-titulo"><UserRound :size="19" /><h4>Paciente y servicio</h4></div>
          <div class="campos">
            <label class="campo-completo">Paciente *
              <select v-model="formulario.pacienteId" required>
                <option value="">Seleccionar paciente</option>
                <option v-for="paciente in pacientesSeleccionables" :key="paciente.id" :value="paciente.id">{{ paciente.codigo }} — {{ paciente.nombres }} {{ paciente.apellidos }}</option>
              </select>
              <small v-if="!pacientesActivos.length" class="aviso">No hay pacientes activos. Registra o activa un paciente en el módulo Pacientes.</small>
            </label>
            <label>Servicio *<select v-model="formulario.servicio" required @change="seleccionarServicio"><option value="">Seleccionar servicio</option><option v-for="servicio in serviciosSeleccionables" :key="servicio" :value="servicio">{{ servicio }}</option></select></label>
            <label>Profesional *<select v-model="formulario.profesionalId" required><option value="">Seleccionar profesional</option><option v-for="profesional in profesionalesDisponibles" :key="profesional.id" :value="profesional.id">{{ profesional.nombre }}</option></select></label>
          </div>
          <div class="grupo-titulo segundo"><CalendarDays :size="19" /><h4>Fecha y horario</h4></div>
          <div class="campos">
            <label>Fecha *<input v-model="formulario.fecha" type="date" required /></label>
            <label>Hora de inicio *<input v-model="formulario.hora" type="time" required /></label>
            <label>Duración<select v-model.number="formulario.duracion"><option :value="30">30 minutos</option><option :value="45">45 minutos</option><option :value="60">60 minutos</option><option :value="90">90 minutos</option><option v-if="![30,45,60,90].includes(Number(formulario.duracion))" :value="Number(formulario.duracion)">{{ formulario.duracion }} minutos</option></select></label>
            <label>Estado<select v-model="formulario.estado"><option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option></select></label>
            <label class="campo-completo">Observaciones<textarea v-model="formulario.observaciones" rows="3" placeholder="Indicaciones relacionadas con la cita"></textarea></label>
          </div>
          <div v-if="mensaje && tipoMensaje === 'error'" class="error-formulario"><AlertCircle :size="17" /> {{ mensaje }}</div>
          <div class="formulario-pie"><span>* Campos obligatorios</span><div><button type="button" class="boton-cancelar" @click="modalAbierto = false">Cancelar</button><button type="submit" class="boton-principal"><Save :size="17" /> {{ modoEdicion ? 'Guardar cambios' : 'Registrar cita' }}</button></div></div>
        </form>
      </section>
    </div>

    <div v-if="detalleAbierto && citaSeleccionada" class="modal-fondo" @click.self="detalleAbierto = false">
      <section class="modal modal-detalle" role="dialog" aria-modal="true" aria-label="Detalle de la cita">
        <div class="modal-encabezado"><div><span class="sobrelinea">AVENIA / CITA</span><h3>Detalle de la cita</h3></div><button class="cerrar" aria-label="Cerrar" @click="detalleAbierto = false"><X :size="21" /></button></div>
        <div class="detalle-contenido">
          <div class="detalle-principal"><CalendarDays :size="28" /><div><strong>{{ nombrePaciente(citaSeleccionada) }}</strong><p>{{ citaSeleccionada.servicio }}</p></div></div>
          <dl class="detalle-grid"><div><dt>Profesional</dt><dd>{{ citaSeleccionada.profesional }}</dd></div><div><dt>Fecha</dt><dd>{{ formatoFecha(citaSeleccionada.fecha) }}</dd></div><div><dt>Hora</dt><dd>{{ citaSeleccionada.hora }}</dd></div><div><dt>Duración</dt><dd>{{ citaSeleccionada.duracion }} minutos</dd></div><div><dt>Estado</dt><dd>{{ citaSeleccionada.estado }}</dd></div></dl>
          <div class="observaciones"><strong>Observaciones</strong><p>{{ citaSeleccionada.observaciones || 'Sin observaciones.' }}</p></div>
          <label class="cambiar-estado">Actualizar estado<select :value="citaSeleccionada.estado" @change="actualizarEstado(citaSeleccionada, $event.target.value)"><option v-for="estado in estados" :key="estado" :value="estado">{{ estado }}</option></select></label>
        </div>
        <div class="detalle-pie"><button class="boton-cancelar" @click="detalleAbierto = false">Cerrar</button><button class="boton-principal" @click="editarCita(citaSeleccionada)"><Pencil :size="17" /> Editar cita</button></div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.citas-view{max-width:1500px;margin:0 auto;color:#40333D}button,input,select,textarea{font:inherit}button{cursor:pointer}.sobrelinea{display:block;color:#95738B;font-size:10px;font-weight:700;letter-spacing:1.7px}.encabezado{display:flex;align-items:center;justify-content:space-between;gap:25px;margin-bottom:30px}.encabezado h2{margin:13px 0 10px;font-family:var(--font-heading,Georgia,serif);font-size:clamp(36px,4vw,52px);font-weight:400}.encabezado p{margin:0;color:#8A7985;font-size:13px;line-height:1.8}.boton-principal{display:inline-flex;align-items:center;justify-content:center;gap:9px;padding:13px 20px;background:#76566E;border:1px solid #76566E;border-radius:9px;color:white;font-size:12px;font-weight:700}.boton-principal:hover{background:#604358}.mensaje{display:flex;align-items:center;gap:10px;margin-bottom:20px;padding:14px 18px;border-radius:9px;font-size:12px}.mensaje.exito{background:#EDF5EE;color:#4E7755}.mensaje.error{background:#FFF0EF;color:#A44E4E}.mensaje button{margin-left:auto;border:0;background:transparent;color:inherit}.indicadores{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:17px;margin-bottom:25px}.indicador{display:flex;align-items:center;gap:15px;padding:22px;background:white;border:1px solid #EEE5E9;border-radius:13px}.indicador-icono{display:grid;place-items:center;width:48px;height:48px;flex-shrink:0;background:#F1E6EC;border-radius:12px;color:#76566E}.indicador>div:last-child{display:flex;flex-direction:column;gap:7px}.indicador span{color:#8A7985;font-size:12px}.indicador strong{font-family:var(--font-heading,Georgia,serif);font-size:33px;font-weight:500}.panel{margin-bottom:24px;padding:28px;background:white;border:1px solid #EEE5E9;border-radius:14px}.panel-encabezado{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:22px}.panel-encabezado h3{margin:8px 0 0;font-family:var(--font-heading,Georgia,serif);font-size:30px;font-weight:500}.navegacion-fecha{display:flex;align-items:center;gap:8px}.navegacion-fecha button,.accion-icono,.acciones button{display:grid;place-items:center;width:35px;height:35px;border:1px solid #E9DEE4;border-radius:8px;background:white;color:#76566E}.navegacion-fecha input{padding:8px;border:1px solid #E9DEE4;border-radius:8px;color:#76566E;font-size:12px}.fecha-descripcion{margin:0 0 22px;color:#95738B;font-size:12px;text-transform:capitalize}.agenda-lista{display:flex;flex-direction:column;gap:10px}.agenda-item{display:flex;align-items:center;gap:18px;padding:18px;background:#FCFAFB;border:1px solid #EEE5E9;border-radius:10px}.agenda-hora{display:flex;align-items:center;gap:8px;min-width:100px;color:#76566E;font-size:13px;font-weight:700}.agenda-informacion{display:flex;flex:1;flex-direction:column;gap:5px}.agenda-informacion strong{font-size:13px}.agenda-informacion span,.agenda-informacion small{color:#94818E;font-size:11px}.estado{display:inline-block;padding:7px 11px;border-radius:20px;background:#F1E6EC;color:#76566E;font-size:10px;font-weight:700;text-transform:capitalize;white-space:nowrap}.estado.confirmada,.estado.completada{background:#EDF5EE;color:#4E7755}.estado.cancelada,.estado.no-asistió{background:#F9E9E9;color:#A45C5C}.estado-vacio{display:flex;flex-direction:column;align-items:center;padding:55px 20px;border:1px dashed #E6D8E0;border-radius:12px;background:#FCFAFB;color:#76566E;text-align:center}.estado-vacio h4{margin:18px 0 8px;color:#40333D;font-family:var(--font-heading,Georgia,serif);font-size:26px;font-weight:500}.estado-vacio p{margin:0;color:#94818E;font-size:12px}.boton-texto{display:inline-flex;align-items:center;gap:8px;margin-top:20px;border:0;background:transparent;color:#76566E;font-size:12px;font-weight:700}.contador{color:#95738B;font-size:11px}.herramientas{display:flex;gap:12px;margin-bottom:22px}.buscador{display:flex;align-items:center;gap:10px;flex:1;padding:0 14px;border:1px solid #E9DEE4;border-radius:9px;color:#95738B}.buscador input{width:100%;min-width:0;padding:13px 0;border:0;outline:0;font-size:12px}.herramientas select{min-width:160px;padding:12px;border:1px solid #E9DEE4;border-radius:9px;background:white;color:#76566E;font-size:12px}.tabla-scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:12px}th{padding:14px 12px;background:#FAF6F8;color:#95738B;text-align:left;font-size:10px}td{padding:16px 12px;border-bottom:1px solid #F1E9ED;color:#746571}.nombre-paciente{color:#40333D;font-weight:700}.acciones{display:flex;gap:7px}.modal-fondo{position:fixed;inset:0;z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(42,31,40,.58)}.modal{display:flex;flex-direction:column;width:100%;max-width:760px;max-height:92vh;overflow:hidden;background:white;border-radius:17px}.modal-encabezado{display:flex;align-items:center;justify-content:space-between;padding:25px 30px;border-bottom:1px solid #EEE5E9}.modal-encabezado h3{margin:8px 0 0;font-family:var(--font-heading,Georgia,serif);font-size:32px;font-weight:500}.cerrar{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:50%;background:#F5EDF1;color:#76566E}.formulario,.detalle-contenido{overflow-y:auto;padding:30px}.grupo-titulo{display:flex;align-items:center;gap:10px;margin-bottom:20px;color:#76566E}.grupo-titulo.segundo{margin-top:35px}.grupo-titulo h4{margin:0;color:#40333D;font-family:var(--font-heading,Georgia,serif);font-size:24px;font-weight:500}.campos{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.campos label{display:flex;flex-direction:column;gap:9px;color:#76566E;font-size:11px;font-weight:700}.campos input,.campos select,.campos textarea,.cambiar-estado select{width:100%;min-width:0;padding:13px;border:1px solid #E9DEE4;border-radius:8px;background:white;color:#40333D;outline:none;font-size:12px}.campos input:focus,.campos select:focus,.campos textarea:focus{border-color:#76566E}.campo-completo{grid-column:1/-1}.campos textarea{resize:vertical}.aviso{font-size:11px;color:#A45C5C;font-weight:400}.error-formulario{display:flex;align-items:center;gap:9px;margin-top:20px;padding:12px;background:#FFF0EF;border-radius:8px;color:#A44E4E;font-size:12px}.formulario-pie,.detalle-pie{display:flex;align-items:center;justify-content:space-between;gap:15px;margin-top:30px;padding-top:22px;border-top:1px solid #EEE5E9}.formulario-pie>span{color:#A99AA3;font-size:11px}.formulario-pie>div{display:flex;gap:10px}.boton-cancelar{padding:13px 18px;border:1px solid #E9DEE4;border-radius:9px;background:white;color:#76566E;font-size:12px;font-weight:700}.modal-detalle{max-width:620px}.detalle-principal{display:flex;align-items:center;gap:17px;padding:24px;background:#F8F1F5;border-radius:12px;color:#76566E}.detalle-principal strong{color:#40333D;font-family:var(--font-heading,Georgia,serif);font-size:25px;font-weight:500}.detalle-principal p{margin:5px 0 0;color:#94818E;font-size:12px}.detalle-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:22px;margin:28px 0}.detalle-grid dt{margin-bottom:7px;color:#A08F9A;font-size:11px}.detalle-grid dd{margin:0;color:#40333D;font-size:12px}.observaciones{padding:20px;background:#FCFAFB;border-radius:10px}.observaciones strong{font-size:12px}.observaciones p{color:#94818E;font-size:12px;line-height:1.8}.cambiar-estado{display:flex;flex-direction:column;gap:10px;margin-top:24px;color:#76566E;font-size:12px;font-weight:700}.detalle-pie{padding:20px 30px;margin:0;justify-content:flex-end}@media(max-width:1200px){.indicadores{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:768px){.encabezado,.panel-encabezado,.herramientas{align-items:flex-start;flex-direction:column}.indicadores,.campos,.detalle-grid{grid-template-columns:1fr}.panel{padding:20px}.herramientas select,.buscador{width:100%}.agenda-item{align-items:flex-start;flex-wrap:wrap}.modal-fondo{padding:10px}.formulario,.detalle-contenido{padding:22px}.formulario-pie{align-items:flex-start;flex-direction:column}}
</style>
