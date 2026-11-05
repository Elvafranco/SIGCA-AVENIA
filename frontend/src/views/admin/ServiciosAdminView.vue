<script setup>
import { ref, computed } from 'vue'
import {
  Plus, Search, Pencil, Eye, Power, X,
  ClipboardList, CheckCircle2, AlertCircle,
  Clock3, Wallet, Image as ImageIcon
} from 'lucide-vue-next'
import { useServiciosStore } from '../../stores/serviciosStore.js'

const {
  servicios,
  agregarServicio,
  actualizarServicio,
  cambiarEstado
} = useServiciosStore()

const busqueda = ref('')
const filtroEstado = ref('TODOS')
const modalAbierto = ref(false)
const modalDetalle = ref(false)
const modoEdicion = ref(false)
const servicioSeleccionado = ref(null)
const mensaje = ref('')
const tipoMensaje = ref('exito')
const errores = ref({})

const formularioVacio = () => ({
  nombre: '',
  descripcion: '',
  duracion: 60,
  precio: '',
  imagen: '',
  estado: 'ACTIVO'
})

const formulario = ref(formularioVacio())

const totalServicios = computed(() => servicios.value.length)
const totalActivos = computed(() =>
  servicios.value.filter(s => s.estado === 'ACTIVO').length
)
const totalInactivos = computed(() =>
  servicios.value.filter(s => s.estado === 'INACTIVO').length
)

const serviciosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  return servicios.value.filter(servicio => {
    const coincideTexto =
      !texto ||
      servicio.nombre.toLowerCase().includes(texto) ||
      servicio.descripcion.toLowerCase().includes(texto) ||
      servicio.id.toLowerCase().includes(texto)

    const coincideEstado =
      filtroEstado.value === 'TODOS' ||
      servicio.estado === filtroEstado.value

    return coincideTexto && coincideEstado
  })
})

function formatoPrecio(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2
  }).format(Number(valor) || 0)
}

function mostrarMensaje(texto, tipo = 'exito') {
  mensaje.value = texto
  tipoMensaje.value = tipo
}

function abrirNuevo() {
  modoEdicion.value = false
  servicioSeleccionado.value = null
  formulario.value = formularioVacio()
  errores.value = {}
  modalAbierto.value = true
}

function abrirEditar(servicio) {
  modoEdicion.value = true
  servicioSeleccionado.value = servicio
  formulario.value = { ...servicio }
  errores.value = {}
  modalDetalle.value = false
  modalAbierto.value = true
}

function abrirDetalle(servicio) {
  servicioSeleccionado.value = servicio
  modalDetalle.value = true
}

function cerrarModales() {
  modalAbierto.value = false
  modalDetalle.value = false
  servicioSeleccionado.value = null
  errores.value = {}
}

function validarFormulario() {
  const nuevosErrores = {}
  const nombre = formulario.value.nombre.trim()
  const descripcion = formulario.value.descripcion.trim()
  const duracion = Number(formulario.value.duracion)
  const precio = Number(formulario.value.precio)

  if (nombre.length < 3) {
    nuevosErrores.nombre = 'Ingresa un nombre de al menos 3 caracteres.'
  }

  if (descripcion.length < 10) {
    nuevosErrores.descripcion = 'Ingresa una descripción de al menos 10 caracteres.'
  }

  if (!Number.isInteger(duracion) || duracion <= 0) {
    nuevosErrores.duracion = 'La duración debe ser un número entero mayor que cero.'
  }

  if (
    formulario.value.precio === '' ||
    !Number.isFinite(precio) ||
    precio < 0 ||
    !Number.isInteger(Math.round(precio * 100))
  ) {
    nuevosErrores.precio = 'Ingresa un precio válido.'
  } else if (Math.abs(precio * 100 - Math.round(precio * 100)) > 0.000001) {
    nuevosErrores.precio = 'El precio debe tener máximo dos decimales.'
  }

  const duplicado = servicios.value.some(servicio =>
    servicio.nombre.trim().toLowerCase() === nombre.toLowerCase() &&
    servicio.id !== servicioSeleccionado.value?.id
  )

  if (duplicado) {
    nuevosErrores.nombre = 'Ya existe un servicio con ese nombre.'
  }

  errores.value = nuevosErrores
  return Object.keys(nuevosErrores).length === 0
}

function guardarServicio() {
  if (!validarFormulario()) return

  const datos = {
    nombre: formulario.value.nombre.trim(),
    descripcion: formulario.value.descripcion.trim(),
    duracion: Number(formulario.value.duracion),
    precio: Number(Number(formulario.value.precio).toFixed(2)),
    imagen: formulario.value.imagen.trim(),
    estado: formulario.value.estado
  }

  if (modoEdicion.value) {
    actualizarServicio(servicioSeleccionado.value.id, datos)
    mostrarMensaje('El servicio se actualizó correctamente.')
  } else {
    agregarServicio(datos)
    mostrarMensaje('El servicio se registró correctamente.')
  }

  cerrarModales()
}

function alternarEstado(servicio) {
  const accion = servicio.estado === 'ACTIVO'
    ? 'desactivar'
    : 'activar'

  if (!window.confirm(`¿Deseas ${accion} el servicio "${servicio.nombre}"?`)) {
    return
  }

  cambiarEstado(servicio.id)
  mostrarMensaje(`El servicio se ${accion === 'activar' ? 'activó' : 'desactivó'} correctamente.`)
}
</script>

<template>
  <section class="servicios-admin">
    <div class="encabezado">
      <div>
        <span class="etiqueta">SIGCA / ADMINISTRACIÓN DE SERVICIOS</span>
        <h2>Servicios que ofrecemos.</h2>
        <p>Organiza los servicios del centro, sus tarifas y disponibilidad.</p>
      </div>

      <button class="boton-primario" type="button" @click="abrirNuevo">
        <Plus :size="18" />
        Nuevo servicio
      </button>
    </div>

    <div
      v-if="mensaje"
      class="mensaje"
      :class="tipoMensaje"
      role="status"
    >
      <CheckCircle2 :size="18" />
      <span>{{ mensaje }}</span>
      <button type="button" aria-label="Cerrar mensaje" @click="mensaje = ''">
        <X :size="17" />
      </button>
    </div>

    <div class="resumen">
      <article class="tarjeta-resumen">
        <div class="resumen-icono"><ClipboardList :size="22" /></div>
        <div>
          <span>Total de servicios</span>
          <strong>{{ totalServicios }}</strong>
          <small>Servicios registrados</small>
        </div>
      </article>

      <article class="tarjeta-resumen">
        <div class="resumen-icono"><CheckCircle2 :size="22" /></div>
        <div>
          <span>Servicios activos</span>
          <strong>{{ totalActivos }}</strong>
          <small>Disponibles para atención</small>
        </div>
      </article>

      <article class="tarjeta-resumen">
        <div class="resumen-icono"><Power :size="22" /></div>
        <div>
          <span>Servicios inactivos</span>
          <strong>{{ totalInactivos }}</strong>
          <small>No disponibles para nuevas citas</small>
        </div>
      </article>
    </div>

    <div class="panel">
      <div class="panel-encabezado">
        <div>
          <span class="etiqueta">01 — CATÁLOGO</span>
          <h3>Directorio de servicios</h3>
        </div>
        <span class="contador">{{ serviciosFiltrados.length }} resultados</span>
      </div>

      <div class="filtros">
        <div class="campo-busqueda">
          <Search :size="18" />
          <input
            v-model="busqueda"
            type="search"
            placeholder="Buscar por nombre, descripción o código..."
          />
        </div>

        <select v-model="filtroEstado" aria-label="Filtrar por estado">
          <option value="TODOS">Todos los estados</option>
          <option value="ACTIVO">Activos</option>
          <option value="INACTIVO">Inactivos</option>
        </select>
      </div>

      <div class="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Servicio</th>
              <th>Duración</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="servicio in serviciosFiltrados" :key="servicio.id">
              <td class="codigo">{{ servicio.id }}</td>

              <td>
                <div class="nombre-servicio">
                  <div class="mini-icono"><ClipboardList :size="17" /></div>
                  <div>
                    <strong>{{ servicio.nombre }}</strong>
                    <small>{{ servicio.descripcion }}</small>
                  </div>
                </div>
              </td>

              <td>{{ servicio.duracion }} min</td>
              <td class="precio">{{ formatoPrecio(servicio.precio) }}</td>

              <td>
                <span
                  class="estado"
                  :class="servicio.estado === 'ACTIVO' ? 'activo' : 'inactivo'"
                >
                  {{ servicio.estado === 'ACTIVO' ? 'Activo' : 'Inactivo' }}
                </span>
              </td>

              <td>
                <div class="acciones">
                  <button
                    type="button"
                    title="Ver detalle"
                    aria-label="Ver detalle"
                    @click="abrirDetalle(servicio)"
                  >
                    <Eye :size="17" />
                  </button>

                  <button
                    type="button"
                    title="Editar servicio"
                    aria-label="Editar servicio"
                    @click="abrirEditar(servicio)"
                  >
                    <Pencil :size="17" />
                  </button>

                  <button
                    type="button"
                    :title="servicio.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'"
                    :aria-label="servicio.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'"
                    @click="alternarEstado(servicio)"
                  >
                    <Power :size="17" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="serviciosFiltrados.length === 0">
              <td colspan="6" class="sin-resultados">
                No se encontraron servicios con los filtros seleccionados.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FORMULARIO -->
    <div v-if="modalAbierto" class="modal-fondo" @click.self="cerrarModales">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-formulario">
        <div class="modal-encabezado">
          <div>
            <span class="etiqueta">AVENIA / SERVICIOS</span>
            <h3 id="titulo-formulario">
              {{ modoEdicion ? 'Editar servicio' : 'Nuevo servicio' }}
            </h3>
          </div>
          <button class="cerrar" type="button" aria-label="Cerrar" @click="cerrarModales">
            <X :size="21" />
          </button>
        </div>

        <form class="modal-cuerpo" @submit.prevent="guardarServicio">
          <div class="campo">
            <label for="servicio-nombre">Nombre del servicio *</label>
            <input
              id="servicio-nombre"
              v-model="formulario.nombre"
              type="text"
              placeholder="Ej. Atención psicológica"
              maxlength="100"
            />
            <small v-if="errores.nombre" class="error">{{ errores.nombre }}</small>
          </div>

          <div class="campo">
            <label for="servicio-descripcion">Descripción *</label>
            <textarea
              id="servicio-descripcion"
              v-model="formulario.descripcion"
              rows="4"
              placeholder="Describe en qué consiste el servicio..."
            ></textarea>
            <small v-if="errores.descripcion" class="error">
              {{ errores.descripcion }}
            </small>
          </div>

          <div class="dos-columnas">
            <div class="campo">
              <label for="servicio-duracion">Duración (minutos) *</label>
              <input
                id="servicio-duracion"
                v-model.number="formulario.duracion"
                type="number"
                min="1"
                step="1"
              />
              <small v-if="errores.duracion" class="error">
                {{ errores.duracion }}
              </small>
            </div>

            <div class="campo">
              <label for="servicio-precio">Precio (Q) *</label>
              <input
                id="servicio-precio"
                v-model="formulario.precio"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              <small v-if="errores.precio" class="error">
                {{ errores.precio }}
              </small>
            </div>
          </div>

          <div class="campo">
            <label for="servicio-imagen">Imagen o URL de imagen</label>
            <div class="campo-con-icono">
              <ImageIcon :size="18" />
              <input
                id="servicio-imagen"
                v-model="formulario.imagen"
                type="text"
                placeholder="Ruta o URL de la imagen"
              />
            </div>
          </div>

          <div class="campo">
            <label for="servicio-estado">Estado</label>
            <select id="servicio-estado" v-model="formulario.estado">
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>

          <div class="modal-acciones">
            <button class="boton-secundario" type="button" @click="cerrarModales">
              Cancelar
            </button>
            <button class="boton-primario" type="submit">
              {{ modoEdicion ? 'Guardar cambios' : 'Registrar servicio' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DETALLE -->
    <div v-if="modalDetalle && servicioSeleccionado" class="modal-fondo" @click.self="cerrarModales">
      <div class="modal modal-detalle" role="dialog" aria-modal="true" aria-labelledby="titulo-detalle">
        <div class="modal-encabezado">
          <div>
            <span class="etiqueta">AVENIA / SERVICIO</span>
            <h3 id="titulo-detalle">Detalle del servicio</h3>
          </div>
          <button class="cerrar" type="button" aria-label="Cerrar" @click="cerrarModales">
            <X :size="21" />
          </button>
        </div>

        <div class="modal-cuerpo">
          <div class="detalle-destacado">
            <ClipboardList :size="25" />
            <div>
              <h4>{{ servicioSeleccionado.nombre }}</h4>
              <span>{{ servicioSeleccionado.id }}</span>
            </div>
          </div>

          <p class="detalle-descripcion">{{ servicioSeleccionado.descripcion }}</p>

          <div class="detalle-datos">
            <div>
              <Clock3 :size="17" />
              <span>Duración</span>
              <strong>{{ servicioSeleccionado.duracion }} minutos</strong>
            </div>
            <div>
              <Wallet :size="17" />
              <span>Precio</span>
              <strong>{{ formatoPrecio(servicioSeleccionado.precio) }}</strong>
            </div>
          </div>

          <div class="detalle-estado">
            <span>Estado del servicio</span>
            <span
              class="estado"
              :class="servicioSeleccionado.estado === 'ACTIVO' ? 'activo' : 'inactivo'"
            >
              {{ servicioSeleccionado.estado }}
            </span>
          </div>

          <div class="modal-acciones">
            <button class="boton-secundario" type="button" @click="cerrarModales">
              Cerrar
            </button>
            <button class="boton-primario" type="button" @click="abrirEditar(servicioSeleccionado)">
              <Pencil :size="16" />
              Editar servicio
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.servicios-admin {
  color: #40333d;
}

.encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 30px;
}

.etiqueta {
  color: #a58f9e;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.encabezado h2 {
  margin: 16px 0 10px;
  color: #40333d;
  font-family: var(--font-heading, Georgia, serif);
  font-size: clamp(32px, 4vw, 44px);
  font-weight: 400;
}

.encabezado p {
  margin: 0;
  color: #927f8b;
  font-size: 13px;
  line-height: 1.7;
}

button {
  font-family: inherit;
}

.boton-primario,
.boton-secundario {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 44px;
  padding: 11px 19px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.boton-primario {
  border: 1px solid #76566e;
  background: #76566e;
  color: white;
}

.boton-primario:hover {
  background: #63465d;
}

.boton-secundario {
  border: 1px solid #eadfe5;
  background: white;
  color: #76566e;
}

.mensaje {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 14px 17px;
  border-radius: 9px;
  font-size: 12px;
}

.mensaje.exito {
  background: #eaf5ed;
  color: #38764b;
}

.mensaje button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.resumen {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.tarjeta-resumen {
  display: flex;
  align-items: center;
  gap: 17px;
  min-height: 115px;
  padding: 21px;
  border: 1px solid #ede4e8;
  border-radius: 12px;
  background: white;
}

.resumen-icono {
  display: grid;
  place-items: center;
  width: 49px;
  height: 49px;
  flex-shrink: 0;
  border-radius: 11px;
  background: #f1e7ed;
  color: #76566e;
}

.tarjeta-resumen > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tarjeta-resumen span {
  color: #927f8b;
  font-size: 11px;
}

.tarjeta-resumen strong {
  font-family: var(--font-heading, Georgia, serif);
  font-size: 25px;
  font-weight: 400;
}

.tarjeta-resumen small {
  color: #aa96a3;
  font-size: 10px;
}

.panel {
  padding: 26px;
  border: 1px solid #ede4e8;
  border-radius: 13px;
  background: white;
}

.panel-encabezado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 23px;
}

.panel-encabezado h3 {
  margin: 9px 0 0;
  color: #40333d;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 28px;
  font-weight: 400;
}

.contador {
  color: #a58f9e;
  font-size: 11px;
}

.filtros {
  display: flex;
  gap: 12px;
  margin-bottom: 22px;
}

.campo-busqueda {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  padding: 0 14px;
  border: 1px solid #eadfe5;
  border-radius: 8px;
  color: #a58f9e;
}

.campo-busqueda input {
  flex: 1;
  min-width: 0;
  height: 43px;
  border: none;
  outline: none;
  background: transparent;
  color: #40333d;
  font-size: 12px;
}

.filtros select {
  width: 190px;
  padding: 0 12px;
  border: 1px solid #eadfe5;
  border-radius: 8px;
  background: white;
  color: #76566e;
  font-size: 12px;
}

.tabla-contenedor {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

thead {
  background: #faf6f8;
}

th {
  padding: 14px 12px;
  color: #987f90;
  font-size: 10px;
  font-weight: 700;
}

td {
  padding: 17px 12px;
  border-bottom: 1px solid #f0e8ec;
  color: #806b79;
  font-size: 12px;
}

.codigo,
.precio {
  color: #76566e;
  font-weight: 700;
}

.nombre-servicio {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 220px;
}

.mini-icono {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #f2e8ee;
  color: #76566e;
}

.nombre-servicio strong,
.nombre-servicio small {
  display: block;
}

.nombre-servicio strong {
  margin-bottom: 5px;
  color: #40333d;
  font-size: 12px;
}

.nombre-servicio small {
  max-width: 280px;
  overflow: hidden;
  color: #a58f9e;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.estado {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
}

.estado.activo {
  background: #eaf5ed;
  color: #38764b;
}

.estado.inactivo {
  background: #f6e8e8;
  color: #a25b5b;
}

.acciones {
  display: flex;
  gap: 7px;
}

.acciones button,
.cerrar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid #eadfe5;
  border-radius: 7px;
  background: white;
  color: #76566e;
  cursor: pointer;
}

.acciones button:hover {
  background: #f2e8ee;
}

.sin-resultados {
  padding: 35px;
  text-align: center;
  color: #a58f9e;
}

.modal-fondo {
  position: fixed;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(45, 32, 43, 0.52);
}

.modal {
  width: min(100%, 650px);
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 15px;
  background: white;
  box-shadow: 0 20px 65px rgba(40, 20, 35, 0.18);
}

.modal-detalle {
  width: min(100%, 560px);
}

.modal-encabezado {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 25px 28px;
  border-bottom: 1px solid #f0e8ec;
}

.modal-encabezado h3 {
  margin: 8px 0 0;
  color: #40333d;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 29px;
  font-weight: 400;
}

.cerrar {
  width: 35px;
  height: 35px;
  border: 0;
  border-radius: 50%;
  background: #f6eff3;
}

.modal-cuerpo {
  display: flex;
  flex-direction: column;
  gap: 19px;
  padding: 25px 28px 28px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.campo label {
  color: #705d6b;
  font-size: 12px;
  font-weight: 700;
}

.campo input,
.campo textarea,
.campo select {
  width: 100%;
  min-height: 44px;
  padding: 11px 13px;
  border: 1px solid #eadfe5;
  border-radius: 8px;
  outline: none;
  background: white;
  color: #40333d;
  font-size: 12px;
}

.campo textarea {
  resize: vertical;
}

.campo input:focus,
.campo textarea:focus,
.campo select:focus {
  border-color: #76566e;
}

.campo-con-icono {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-left: 12px;
  border: 1px solid #eadfe5;
  border-radius: 8px;
  color: #a58f9e;
}

.campo-con-icono input {
  border: 0;
}

.dos-columnas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
}

.error {
  color: #b64e5b;
  font-size: 11px;
}

.modal-acciones {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #f0e8ec;
}

.detalle-destacado {
  display: flex;
  align-items: center;
  gap: 17px;
  padding: 20px;
  border-radius: 11px;
  background: #f7f0f4;
  color: #76566e;
}

.detalle-destacado h4 {
  margin: 0 0 5px;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 23px;
  font-weight: 400;
}

.detalle-destacado span {
  font-size: 11px;
}

.detalle-descripcion {
  color: #806b79;
  font-size: 13px;
  line-height: 1.8;
}

.detalle-datos {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.detalle-datos > div {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 17px;
  border: 1px solid #ede4e8;
  border-radius: 10px;
  color: #76566e;
}

.detalle-datos span,
.detalle-estado > span:first-child {
  color: #927f8b;
  font-size: 11px;
}

.detalle-datos strong {
  color: #40333d;
  font-size: 14px;
}

.detalle-estado {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 0;
}

@media (max-width: 900px) {
  .resumen {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 650px) {
  .encabezado {
    align-items: stretch;
    flex-direction: column;
  }

  .filtros {
    flex-direction: column;
  }

  .filtros select {
    width: 100%;
    min-height: 44px;
  }

  .panel {
    padding: 17px;
  }

  .dos-columnas,
  .detalle-datos {
    grid-template-columns: 1fr;
  }

  .modal-encabezado,
  .modal-cuerpo {
    padding-left: 19px;
    padding-right: 19px;
  }
}
</style>
