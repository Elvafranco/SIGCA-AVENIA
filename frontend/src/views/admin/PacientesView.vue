<script setup>
import { computed, onMounted, ref } from 'vue'
import { usePacientesStore } from '../../stores/pacientesStore'
import {
  Search, Plus, UsersRound, UserRound, UserRoundCheck, UserRoundX,
  X, Pencil, Eye, Phone, Mail, CalendarDays, ClipboardList,
  Save, CheckCircle2, AlertCircle, ArrowLeft, Trash2
} from 'lucide-vue-next'

const {
  pacientes, cargando, errorPacientes, esPacienteMongoDB,
  obtenerPacientesMongoDB, registrarPacienteMongoDB,
  actualizarPacienteMongoDB, desactivarPacienteMongoDB,
  activarPacienteMongoDB
} = usePacientesStore()

const busqueda = ref('')
const filtroEstado = ref('todos')
const modalAbierto = ref(false)
const detalleAbierto = ref(false)
const modoEdicion = ref(false)
const pacienteSeleccionado = ref(null)
const mensaje = ref('')
const tipoMensaje = ref('exito')
const guardando = ref(false)

const formularioVacio = () => ({
  id: null, nombres: '', apellidos: '', fechaNacimiento: '', sexo: '',
  telefono: '', correo: '', direccion: '', motivoConsulta: '',
  observaciones: '', responsableNombre: '', responsableParentesco: '',
  responsableTelefono: '', responsableCorreo: '', estado: 'activo',
  fechaRegistro: ''
})
const formulario = ref(formularioVacio())

const pacientesFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()
  return pacientes.value.filter(p => {
    const coincideTexto = [p.codigo, p.nombres, p.apellidos, p.responsableNombre]
      .some(valor => String(valor || '').toLowerCase().includes(texto))
    return coincideTexto && (filtroEstado.value === 'todos' || p.estado === filtroEstado.value)
  })
})
const totalActivos = computed(() => pacientes.value.filter(p => p.estado === 'activo').length)
const totalInactivos = computed(() => pacientes.value.filter(p => p.estado === 'inactivo').length)

function fechaLocal() {
  const fecha = new Date()
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}
function formatearFecha(fecha) {
  if (!fecha) return 'No registrada'
  const texto = String(fecha).slice(0, 10)
  const partes = texto.split('-')
  return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : texto
}
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return 'No indicada'
  const nacimiento = new Date(`${String(fechaNacimiento).slice(0, 10)}T12:00:00`)
  if (Number.isNaN(nacimiento.getTime())) return 'No indicada'
  const hoy = new Date()
  let edad = hoy.getFullYear() - nacimiento.getFullYear()
  const diferenciaMes = hoy.getMonth() - nacimiento.getMonth()
  if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())) edad--
  return `${edad} años`
}
function mostrarMensaje(texto, tipo = 'exito') {
  mensaje.value = texto
  tipoMensaje.value = tipo
}
function nuevoPaciente() {
  formulario.value = formularioVacio()
  modoEdicion.value = false
  modalAbierto.value = true
  detalleAbierto.value = false
  mensaje.value = ''
}
function editarPaciente(paciente) {
  formulario.value = { ...formularioVacio(), ...paciente }
  modoEdicion.value = true
  modalAbierto.value = true
  detalleAbierto.value = false
  mensaje.value = ''
}
function verPaciente(paciente) {
  pacienteSeleccionado.value = paciente
  detalleAbierto.value = true
  modalAbierto.value = false
}
function cerrarModal() {
  if (guardando.value) return
  modalAbierto.value = false
  formulario.value = formularioVacio()
}
function cerrarDetalle() {
  if (guardando.value) return
  detalleAbierto.value = false
  pacienteSeleccionado.value = null
}
function datosParaAPI(f) {
  const { id, _id, __v, createdAt, updatedAt, ...datos } = f
  return { ...datos, estado: String(f.estado || 'activo').toLowerCase() }
}
async function guardarPaciente() {
  if (guardando.value) return
  const f = formulario.value
  if (!f.nombres.trim() || !f.apellidos.trim()) {
    mostrarMensaje('Ingresa los nombres y apellidos del paciente.', 'error')
    return
  }
  if (!f.fechaNacimiento) {
    mostrarMensaje('Selecciona la fecha de nacimiento.', 'error')
    return
  }
  if (f.fechaNacimiento > fechaLocal()) {
    mostrarMensaje('La fecha de nacimiento no puede ser futura.', 'error')
    return
  }

  guardando.value = true
  const editando = modoEdicion.value
  try {
    if (editando) {
      if (esPacienteMongoDB(f)) {
        await actualizarPacienteMongoDB(f._id, datosParaAPI(f))
      } else {
        // Registro antiguo local: conservarlo en localStorage hasta migración controlada.
        const indice = pacientes.value.findIndex(p => p.id === f.id && !esPacienteMongoDB(p))
        if (indice === -1) throw new Error('No se encontró el paciente local.')
        pacientes.value[indice] = { ...f }
      }
    } else {
      // Los nuevos registros se crean en MongoDB. No guardar localmente si falla.
      const siguienteNumero = pacientes.value.reduce(
        (maximo, p) => Math.max(maximo, Number(p.numero) || 0), 0
      ) + 1
      const datos = {
        ...datosParaAPI(f),
        numero: siguienteNumero,
        codigo: `AV-${String(siguienteNumero).padStart(4, '0')}`,
        fechaRegistro: fechaLocal()
      }
      await registrarPacienteMongoDB(datos)
    }
    modalAbierto.value = false
    formulario.value = formularioVacio()
    mostrarMensaje(editando
      ? 'La información del paciente se actualizó correctamente.'
      : 'El paciente se registró correctamente en MongoDB.')
  } catch (error) {
    mostrarMensaje(error.message || 'No se pudo guardar el paciente.', 'error')
  } finally {
    guardando.value = false
  }
}
async function cambiarEstado(paciente) {
  if (guardando.value) return
  const nuevoEstado = paciente.estado === 'activo' ? 'inactivo' : 'activo'
  guardando.value = true
  try {
    let actualizado
    if (esPacienteMongoDB(paciente)) {
      actualizado = nuevoEstado === 'activo'
        ? await activarPacienteMongoDB(paciente._id)
        : await desactivarPacienteMongoDB(paciente._id)
    } else {
      actualizado = { ...paciente, estado: nuevoEstado }
      pacientes.value = pacientes.value.map(p => p.id === paciente.id && !esPacienteMongoDB(p) ? actualizado : p)
    }
    if (pacienteSeleccionado.value?.id === paciente.id) pacienteSeleccionado.value = actualizado
    mostrarMensaje(`El paciente ahora se encuentra ${nuevoEstado}.`)
  } catch (error) {
    mostrarMensaje(error.message || 'No se pudo cambiar el estado.', 'error')
  } finally {
    guardando.value = false
  }
}

onMounted(async () => {
  const resultado = await obtenerPacientesMongoDB()
  if (resultado === null) {
    mostrarMensaje('No se pudo conectar con MongoDB. Se conservan los registros locales; comprueba que el backend esté encendido.', 'error')
  }
})
</script>

<template>
  <div class="pacientes-view">

    <!-- ENCABEZADO -->
    <section class="encabezado">
      <div>
        <span class="sobrelinea">
          SIGCA / GESTIÓN DE PACIENTES
        </span>

        <h2>
          Personas que acompañamos<span>.</span>
        </h2>

        <p>
          Organiza los expedientes y la información de contacto
          de cada paciente y sus responsables.
        </p>
      </div>

      <button class="boton-principal" @click="nuevoPaciente">
        <Plus :size="18" />
        Nuevo paciente
      </button>
    </section>

    <!-- MENSAJES -->
    <div
      v-if="mensaje"
      class="mensaje"
      :class="tipoMensaje"
      role="status"
    >
      <CheckCircle2 v-if="tipoMensaje === 'exito'" :size="18" />
      <AlertCircle v-else :size="18" />
      <span>{{ mensaje }}</span>
      <button @click="mensaje = ''" aria-label="Cerrar mensaje">
        <X :size="17" />
      </button>
    </div>

    <!-- INDICADORES -->
    <section class="indicadores">
      <article class="indicador">
        <div class="indicador-icono">
          <UsersRound :size="22" />
        </div>
        <div>
          <span>Total de pacientes</span>
          <strong>{{ pacientes.length }}</strong>
          <small>Expedientes registrados</small>
        </div>
      </article>

      <article class="indicador">
        <div class="indicador-icono">
          <UserRoundCheck :size="22" />
        </div>
        <div>
          <span>Pacientes activos</span>
          <strong>{{ totalActivos }}</strong>
          <small>En seguimiento</small>
        </div>
      </article>

      <article class="indicador">
        <div class="indicador-icono">
          <UserRoundX :size="22" />
        </div>
        <div>
          <span>Pacientes inactivos</span>
          <strong>{{ totalInactivos }}</strong>
          <small>Sin seguimiento activo</small>
        </div>
      </article>
    </section>

    <!-- LISTADO -->
    <section class="panel-listado">
      <div class="panel-encabezado">
        <div>
          <span class="sobrelinea">01 — EXPEDIENTES</span>
          <h3>Directorio de pacientes</h3>
        </div>

        <span class="contador">
          {{ pacientesFiltrados.length }} resultados
        </span>
      </div>

      <!-- BUSCADOR Y FILTROS -->
      <div class="herramientas">
        <div class="buscador">
          <Search :size="19" />
          <input
            v-model="busqueda"
            type="search"
            placeholder="Buscar por nombre, expediente o responsable..."
            aria-label="Buscar pacientes"
          />
        </div>

        <select
          v-model="filtroEstado"
          aria-label="Filtrar pacientes por estado"
        >
          <option value="todos">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>

      <p v-if="cargando" role="status">Consultando pacientes de MongoDB...</p>

      <!-- TABLA -->
      <div v-if="pacientesFiltrados.length" class="tabla-scroll">
        <table>
          <thead>
            <tr>
              <th>Expediente</th>
              <th>Paciente</th>
              <th>Edad</th>
              <th>Responsable</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="paciente in pacientesFiltrados"
              :key="paciente.id"
            >
              <td class="codigo">{{ paciente.codigo }}</td>

              <td>
                <div class="celda-paciente">
                  <div class="avatar">
                    {{ paciente.nombres.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <strong>
                      {{ paciente.nombres }}
                      {{ paciente.apellidos }}
                    </strong>
                    <small>
                      Registrado:
                      {{ formatearFecha(paciente.fechaRegistro) }}
                    </small>
                  </div>
                </div>
              </td>

              <td>{{ calcularEdad(paciente.fechaNacimiento) }}</td>

              <td>
                {{ paciente.responsableNombre || 'No registrado' }}
              </td>

              <td>{{ paciente.telefono || '—' }}</td>

              <td>
                <span
                  class="estado"
                  :class="paciente.estado"
                >
                  {{ paciente.estado }}
                </span>
              </td>

              <td>
                <div class="acciones">
                  <button
                    title="Ver expediente"
                    aria-label="Ver expediente"
                    @click="verPaciente(paciente)"
                  >
                    <Eye :size="17" />
                  </button>

                  <button
                    title="Editar paciente"
                    aria-label="Editar paciente"
                    @click="editarPaciente(paciente)"
                  >
                    <Pencil :size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ESTADO VACÍO -->
      <div v-else class="estado-vacio">
        <div class="vacio-icono">
          <UsersRound :size="34" :stroke-width="1.4" />
        </div>

        <h4>
          {{ pacientes.length
            ? 'No encontramos coincidencias'
            : 'Cada historia comienza con un registro'
          }}
        </h4>

        <p>
          {{ pacientes.length
            ? 'Prueba con otro nombre o modifica los filtros.'
            : 'Aquí encontrarás los expedientes de las personas que reciben atención en AVENIA.'
          }}
        </p>

        <button
          v-if="!pacientes.length"
          class="boton-secundario"
          @click="nuevoPaciente"
        >
          <Plus :size="17" />
          Registrar primer paciente
        </button>
      </div>
    </section>

    <!-- MODAL DE REGISTRO Y EDICIÓN -->
    <div
      v-if="modalAbierto"
      class="modal-fondo"
      @click.self="cerrarModal"
    >
      <section
        class="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-formulario"
      >
        <div class="modal-encabezado">
          <div>
            <span class="sobrelinea">
              AVENIA / EXPEDIENTE
            </span>
            <h3 id="titulo-formulario">
              {{ modoEdicion ? 'Editar paciente' : 'Nuevo paciente' }}
            </h3>
          </div>

          <button
            class="cerrar"
            aria-label="Cerrar formulario"
            @click="cerrarModal"
          >
            <X :size="21" />
          </button>
        </div>

        <form class="formulario" @submit.prevent="guardarPaciente">
          <div class="grupo-titulo">
            <UserRound :size="19" />
            <h4>Información del paciente</h4>
          </div>

          <div class="campos">
            <label>
              Nombres *
              <input
                v-model="formulario.nombres"
                required
                maxlength="100"
                placeholder="Nombres del paciente"
              />
            </label>

            <label>
              Apellidos *
              <input
                v-model="formulario.apellidos"
                required
                maxlength="100"
                placeholder="Apellidos del paciente"
              />
            </label>

            <label>
              Fecha de nacimiento *
              <input
                v-model="formulario.fechaNacimiento"
                type="date"
                required
                :max="fechaLocal()"
              />
            </label>

            <label>
              Sexo
              <select v-model="formulario.sexo">
                <option value="">Seleccionar</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="No especificado">
                  No especificado
                </option>
              </select>
            </label>

            <label>
              Teléfono
              <input
                v-model="formulario.telefono"
                type="tel"
                placeholder="Número de contacto"
              />
            </label>

            <label>
              Correo electrónico
              <input
                v-model="formulario.correo"
                type="email"
                placeholder="correo@ejemplo.com"
              />
            </label>

            <label class="campo-completo">
              Dirección
              <input
                v-model="formulario.direccion"
                placeholder="Dirección de residencia"
              />
            </label>

            <label class="campo-completo">
              Motivo de consulta
              <textarea
                v-model="formulario.motivoConsulta"
                rows="3"
                placeholder="Motivo principal de atención"
              ></textarea>
            </label>
          </div>

          <div class="grupo-titulo segundo">
            <UsersRound :size="19" />
            <h4>Información del responsable</h4>
          </div>

          <p class="grupo-descripcion">
            Completa esta sección cuando el paciente tenga
            un padre, madre, tutor o encargado.
          </p>

          <div class="campos">
            <label>
              Nombre del responsable
              <input
                v-model="formulario.responsableNombre"
                placeholder="Nombre completo"
              />
            </label>

            <label>
              Parentesco
              <select v-model="formulario.responsableParentesco">
                <option value="">Seleccionar</option>
                <option value="Madre">Madre</option>
                <option value="Padre">Padre</option>
                <option value="Tutor legal">Tutor legal</option>
                <option value="Familiar">Otro familiar</option>
                <option value="Encargado">Encargado</option>
              </select>
            </label>

            <label>
              Teléfono del responsable
              <input
                v-model="formulario.responsableTelefono"
                type="tel"
                placeholder="Número de contacto"
              />
            </label>

            <label>
              Correo del responsable
              <input
                v-model="formulario.responsableCorreo"
                type="email"
                placeholder="correo@ejemplo.com"
              />
            </label>
          </div>

          <div class="grupo-titulo segundo">
            <ClipboardList :size="19" />
            <h4>Seguimiento</h4>
          </div>

          <div class="campos">
            <label>
              Estado del paciente
              <select v-model="formulario.estado">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </label>

            <label class="campo-completo">
              Observaciones
              <textarea
                v-model="formulario.observaciones"
                rows="3"
                placeholder="Información adicional relevante"
              ></textarea>
            </label>
          </div>

          <div
            v-if="mensaje && tipoMensaje === 'error'"
            class="error-formulario"
          >
            <AlertCircle :size="17" />
            {{ mensaje }}
          </div>

          <div class="formulario-pie">
            <span>* Campos obligatorios</span>

            <div class="formulario-botones">
              <button
                type="button"
                class="boton-cancelar"
                @click="cerrarModal"
              >
                Cancelar
              </button>

              <button type="submit" class="boton-principal" :disabled="guardando">
                <Save :size="17" />
                {{ guardando ? 'Guardando...' : (modoEdicion ? 'Guardar cambios' : 'Registrar paciente') }}
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>

    <!-- DETALLE DEL PACIENTE -->
    <div
      v-if="detalleAbierto && pacienteSeleccionado"
      class="modal-fondo"
      @click.self="cerrarDetalle"
    >
      <section
        class="modal modal-detalle"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del paciente"
      >
        <div class="modal-encabezado">
          <div>
            <span class="sobrelinea">
              {{ pacienteSeleccionado.codigo }}
            </span>

            <h3>
              {{ pacienteSeleccionado.nombres }}
              {{ pacienteSeleccionado.apellidos }}
            </h3>
          </div>

          <button
            class="cerrar"
            aria-label="Cerrar expediente"
            @click="cerrarDetalle"
          >
            <X :size="21" />
          </button>
        </div>

        <div class="detalle-contenido">
          <div class="detalle-identidad">
            <div class="detalle-avatar">
              {{ pacienteSeleccionado.nombres.charAt(0).toUpperCase() }}
            </div>

            <div>
              <strong>
                {{ pacienteSeleccionado.nombres }}
                {{ pacienteSeleccionado.apellidos }}
              </strong>

              <p>
                Expediente {{ pacienteSeleccionado.codigo }}
              </p>

              <span
                class="estado"
                :class="pacienteSeleccionado.estado"
              >
                {{ pacienteSeleccionado.estado }}
              </span>
            </div>
          </div>

          <div class="detalle-seccion">
            <h4>Datos personales</h4>

            <dl class="detalle-grid">
              <div>
                <dt>Fecha de nacimiento</dt>
                <dd>
                  {{ formatearFecha(pacienteSeleccionado.fechaNacimiento) }}
                </dd>
              </div>

              <div>
                <dt>Edad</dt>
                <dd>
                  {{ calcularEdad(pacienteSeleccionado.fechaNacimiento) }}
                </dd>
              </div>

              <div>
                <dt>Sexo</dt>
                <dd>{{ pacienteSeleccionado.sexo || 'No indicado' }}</dd>
              </div>

              <div>
                <dt>Teléfono</dt>
                <dd>{{ pacienteSeleccionado.telefono || 'No registrado' }}</dd>
              </div>

              <div>
                <dt>Correo</dt>
                <dd>{{ pacienteSeleccionado.correo || 'No registrado' }}</dd>
              </div>

              <div>
                <dt>Dirección</dt>
                <dd>{{ pacienteSeleccionado.direccion || 'No registrada' }}</dd>
              </div>
            </dl>
          </div>

          <div class="detalle-seccion">
            <h4>Responsable</h4>

            <dl class="detalle-grid">
              <div>
                <dt>Nombre</dt>
                <dd>
                  {{ pacienteSeleccionado.responsableNombre || 'No registrado' }}
                </dd>
              </div>

              <div>
                <dt>Parentesco</dt>
                <dd>
                  {{ pacienteSeleccionado.responsableParentesco || 'No indicado' }}
                </dd>
              </div>

              <div>
                <dt>Teléfono</dt>
                <dd>
                  {{ pacienteSeleccionado.responsableTelefono || 'No registrado' }}
                </dd>
              </div>

              <div>
                <dt>Correo</dt>
                <dd>
                  {{ pacienteSeleccionado.responsableCorreo || 'No registrado' }}
                </dd>
              </div>
            </dl>
          </div>

          <div class="detalle-seccion">
            <h4>Información de atención</h4>

            <p class="detalle-texto">
              <strong>Motivo de consulta:</strong>
              {{ pacienteSeleccionado.motivoConsulta || 'No registrado' }}
            </p>

            <p class="detalle-texto">
              <strong>Observaciones:</strong>
              {{ pacienteSeleccionado.observaciones || 'Sin observaciones' }}
            </p>
          </div>
        </div>

        <div class="detalle-pie">
          <button
            class="boton-cancelar"
            @click="cambiarEstado(pacienteSeleccionado)"
            :disabled="guardando"
          >
            {{
              pacienteSeleccionado.estado === 'activo'
                ? 'Marcar inactivo'
                : 'Marcar activo'
            }}
          </button>

          <button
            class="boton-principal"
            @click="editarPaciente(pacienteSeleccionado)"
          >
            <Pencil :size="17" />
            Editar expediente
          </button>
        </div>
      </section>
    </div>

  </div>
</template>

<style scoped>
.pacientes-view {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  color: #40333D;
}

button,
input,
select,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.sobrelinea {
  display: block;
  color: #95738B;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.7px;
}

/* ENCABEZADO */

.encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  margin-bottom: 30px;
}

.encabezado h2 {
  color: #40333D;
  margin: 14px 0 12px;
  font-family: var(--font-heading, Georgia, serif);
  font-size: clamp(36px, 4vw, 52px);
  font-weight: 400;
}

.encabezado h2 span {
  color: #B99CAB;
}

.encabezado p {
  max-width: 580px;
  margin: 0;
  color: #8A7985;
  font-size: 13px;
  line-height: 1.8;
}

.boton-principal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-shrink: 0;
  padding: 14px 20px;
  background: #76566E;
  border: 1px solid #76566E;
  border-radius: 9px;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 700;
  transition: background 0.2s;
}

.boton-principal:hover {
  background: #604358;
}

/* MENSAJE */

.mensaje {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 22px;
  padding: 14px 18px;
  border-radius: 9px;
  font-size: 12px;
}

.mensaje.exito {
  background: #EDF5EE;
  color: #4E7755;
}

.mensaje.error {
  background: #FFF0EF;
  color: #A44E4E;
}

.mensaje button {
  margin-left: auto;
  border: none;
  background: transparent;
  color: inherit;
}

/* INDICADORES */

.indicadores {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 25px;
}

.indicador {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  background: #FFFFFF;
  border: 1px solid #EEE5E9;
  border-radius: 13px;
}

.indicador-icono {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 54px;
  height: 54px;
  background: #F1E6EC;
  border-radius: 13px;
  color: #76566E;
}

.indicador > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.indicador span {
  color: #8A7985;
  font-size: 12px;
}

.indicador strong {
  color: #40333D;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 34px;
  font-weight: 500;
  line-height: 1;
}

.indicador small {
  color: #A99AA3;
  font-size: 10px;
}

/* LISTADO */

.panel-listado {
  padding: 28px;
  background: #FFFFFF;
  border: 1px solid #EEE5E9;
  border-radius: 14px;
}

.panel-encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}

.panel-encabezado h3 {
  margin: 9px 0 0;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 30px;
  font-weight: 500;
}

.contador {
  color: #95738B;
  font-size: 11px;
  font-weight: 600;
}

.herramientas {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.buscador {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  padding: 0 16px;
  border: 1px solid #E9DEE4;
  border-radius: 9px;
  color: #95738B;
}

.buscador input {
  width: 100%;
  min-width: 0;
  padding: 14px 0;
  border: none;
  outline: none;
  background: transparent;
  color: #40333D;
  font-size: 12px;
}

.herramientas select {
  min-width: 170px;
  padding: 13px;
  background: #FFFFFF;
  border: 1px solid #E9DEE4;
  border-radius: 9px;
  color: #76566E;
  font-size: 12px;
}

.tabla-scroll {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

th {
  padding: 15px 12px;
  background: #FAF6F8;
  color: #95738B;
  text-align: left;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

td {
  padding: 17px 12px;
  border-bottom: 1px solid #F1E9ED;
  color: #746571;
}

.codigo {
  color: #76566E;
  font-weight: 700;
}

.celda-paciente {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
}

.avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 37px;
  height: 37px;
  background: #F1E6EC;
  border-radius: 50%;
  color: #76566E;
  font-weight: 700;
}

.celda-paciente strong,
.celda-paciente small {
  display: block;
}

.celda-paciente strong {
  color: #40333D;
  font-size: 12px;
}

.celda-paciente small {
  margin-top: 5px;
  color: #A99AA3;
  font-size: 10px;
}

.estado {
  display: inline-block;
  padding: 7px 11px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  text-transform: capitalize;
}

.estado.activo {
  background: #EDF5EE;
  color: #4E7755;
}

.estado.inactivo {
  background: #F5E9E9;
  color: #9E6868;
}

.acciones {
  display: flex;
  gap: 8px;
}

.acciones button {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid #E9DEE4;
  border-radius: 8px;
  background: #FFFFFF;
  color: #76566E;
}

.acciones button:hover {
  background: #F1E6EC;
}

/* ESTADO VACÍO */

.estado-vacio {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 70px 20px;
  border: 1px dashed #E6D8E0;
  border-radius: 12px;
  background: #FCFAFB;
  text-align: center;
}

.vacio-icono {
  display: grid;
  place-items: center;
  width: 75px;
  height: 75px;
  margin-bottom: 20px;
  background: #F1E6EC;
  border-radius: 50%;
  color: #76566E;
}

.estado-vacio h4 {
  margin: 0 0 12px;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 27px;
  font-weight: 500;
}

.estado-vacio p {
  max-width: 400px;
  margin: 0 0 25px;
  color: #94818E;
  font-size: 12px;
  line-height: 1.8;
}

.boton-secundario {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  padding: 12px 17px;
  border: 1px solid #76566E;
  border-radius: 9px;
  background: transparent;
  color: #76566E;
  font-size: 12px;
  font-weight: 700;
}

/* MODALES */

.modal-fondo {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 22px;
  background: rgba(42, 31, 40, 0.58);
}

.modal {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 850px;
  max-height: 92vh;
  overflow: hidden;
  background: #FFFFFF;
  border-radius: 17px;
  box-shadow: 0 20px 70px rgba(38, 25, 35, 0.18);
}

.modal-encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 26px 32px;
  border-bottom: 1px solid #EEE5E9;
}

.modal-encabezado h3 {
  margin: 8px 0 0;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 33px;
  font-weight: 500;
}

.cerrar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: #F5EDF1;
  color: #76566E;
}

.formulario {
  overflow-y: auto;
  padding: 30px 32px;
}

.grupo-titulo {
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 20px;
  color: #76566E;
}

.grupo-titulo.segundo {
  margin-top: 36px;
}

.grupo-titulo h4 {
  margin: 0;
  color: #40333D;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 24px;
  font-weight: 500;
}

.grupo-descripcion {
  margin: -8px 0 22px;
  color: #94818E;
  font-size: 12px;
  line-height: 1.7;
}

.campos {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 19px;
}

.campos label {
  display: flex;
  flex-direction: column;
  gap: 9px;
  color: #76566E;
  font-size: 11px;
  font-weight: 700;
}

.campos input,
.campos select,
.campos textarea {
  width: 100%;
  min-width: 0;
  padding: 13px 14px;
  border: 1px solid #E9DEE4;
  border-radius: 8px;
  background: #FFFFFF;
  color: #40333D;
  outline: none;
  font-size: 12px;
  font-weight: 400;
}

.campos input:focus,
.campos select:focus,
.campos textarea:focus {
  border-color: #76566E;
  box-shadow: 0 0 0 3px #F1E6EC;
}

.campos textarea {
  resize: vertical;
}

.campo-completo {
  grid-column: 1 / -1;
}

.error-formulario {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 20px;
  padding: 12px;
  background: #FFF0EF;
  border-radius: 8px;
  color: #A44E4E;
  font-size: 12px;
}

.formulario-pie {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 35px;
  padding-top: 25px;
  border-top: 1px solid #EEE5E9;
}

.formulario-pie > span {
  color: #A99AA3;
  font-size: 11px;
}

.formulario-botones {
  display: flex;
  gap: 10px;
}

.boton-cancelar {
  padding: 13px 19px;
  border: 1px solid #E9DEE4;
  border-radius: 9px;
  background: #FFFFFF;
  color: #76566E;
  font-size: 12px;
  font-weight: 700;
}

/* DETALLE */

.modal-detalle {
  max-width: 720px;
}

.detalle-contenido {
  overflow-y: auto;
  padding: 30px 32px;
}

.detalle-identidad {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 25px;
  background: #F8F1F5;
  border-radius: 12px;
}

.detalle-avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: #EAD9CD;
  color: #76566E;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 30px;
}

.detalle-identidad strong {
  font-family: var(--font-heading, Georgia, serif);
  font-size: 26px;
  font-weight: 500;
}

.detalle-identidad p {
  margin: 6px 0 12px;
  color: #94818E;
  font-size: 11px;
}

.detalle-seccion {
  padding: 28px 0;
  border-bottom: 1px solid #EEE5E9;
}

.detalle-seccion h4 {
  margin: 0 0 20px;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 25px;
  font-weight: 500;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
  margin: 0;
}

.detalle-grid dt {
  margin-bottom: 7px;
  color: #A08F9A;
  font-size: 11px;
}

.detalle-grid dd {
  margin: 0;
  color: #40333D;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.detalle-texto {
  color: #786A73;
  font-size: 12px;
  line-height: 1.9;
}

.detalle-pie {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 22px 32px;
  border-top: 1px solid #EEE5E9;
}

/* RESPONSIVE */

@media (max-width: 1000px) {
  .indicadores {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .encabezado {
    align-items: flex-start;
    flex-direction: column;
  }

  .herramientas {
    flex-direction: column;
  }

  .herramientas select {
    width: 100%;
  }

  .panel-listado {
    padding: 20px;
  }

  .modal-fondo {
    padding: 10px;
  }

  .modal {
    max-height: 96vh;
  }

  .modal-encabezado,
  .formulario,
  .detalle-contenido {
    padding: 22px;
  }

  .campos,
  .detalle-grid {
    grid-template-columns: 1fr;
  }

  .formulario-pie {
    align-items: flex-start;
    flex-direction: column;
  }

  .formulario-botones {
    width: 100%;
  }

  .formulario-botones button {
    flex: 1;
  }

  .detalle-pie {
    flex-direction: column;
    padding: 20px;
  }
}
</style>
