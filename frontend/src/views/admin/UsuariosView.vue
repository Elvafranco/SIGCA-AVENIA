<script setup>
import { ref, computed } from 'vue'
import {
  Users,
  UserPlus,
  ShieldCheck,
  Search,
  Pencil,
  Power,
  X,
  CheckCircle2,
  UserRound,
  Mail,
  AlertCircle
} from 'lucide-vue-next'

import { useUsuariosStore } from '../../stores/usuariosStore'

const {
  usuarios,
  usuariosActivos,
  registrarUsuario,
  editarUsuario,
  cambiarEstadoUsuario
} = useUsuariosStore()

const busqueda = ref('')
const filtroRol = ref('')
const filtroEstado = ref('')
const mostrarFormulario = ref(false)
const usuarioEditando = ref(null)
const mensaje = ref('')
const tipoMensaje = ref('exito')
const errorFormulario = ref('')

const formulario = ref({
  nombre: '',
  correo: '',
  rol: 'RECEPCIONISTA'
})

const usuariosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  return [...usuarios.value]
    .filter(usuario => {
      const coincideTexto =
        !texto ||
        usuario.nombre.toLowerCase().includes(texto) ||
        usuario.correo.toLowerCase().includes(texto) ||
        usuario.id.toLowerCase().includes(texto)

      const coincideRol =
        !filtroRol.value || usuario.rol === filtroRol.value

      const coincideEstado =
        !filtroEstado.value || usuario.estado === filtroEstado.value

      return coincideTexto && coincideRol && coincideEstado
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre))
})

function mostrarMensaje(texto, tipo = 'exito') {
  mensaje.value = texto
  tipoMensaje.value = tipo
}

function abrirNuevoUsuario() {
  usuarioEditando.value = null
  errorFormulario.value = ''
  formulario.value = {
    nombre: '',
    correo: '',
    rol: 'RECEPCIONISTA'
  }
  mostrarFormulario.value = true
}

function abrirEditarUsuario(usuario) {
  usuarioEditando.value = usuario.id
  errorFormulario.value = ''

  formulario.value = {
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol
  }

  mostrarFormulario.value = true
}

function cerrarFormulario() {
  mostrarFormulario.value = false
  usuarioEditando.value = null
  errorFormulario.value = ''
}

function guardarUsuario() {
  errorFormulario.value = ''

  const resultado = usuarioEditando.value
    ? editarUsuario(usuarioEditando.value, formulario.value)
    : registrarUsuario(formulario.value)

  if (!resultado.ok) {
    errorFormulario.value = resultado.mensaje
    return
  }

  cerrarFormulario()
  mostrarMensaje(resultado.mensaje)
}

function alternarEstado(usuario) {
  const accion =
    usuario.estado === 'ACTIVO' ? 'desactivar' : 'activar'

  if (!window.confirm(
    `¿Deseas ${accion} la cuenta de ${usuario.nombre}?`
  )) {
    return
  }

  const resultado = cambiarEstadoUsuario(usuario.id)

  mostrarMensaje(
    resultado.mensaje,
    resultado.ok ? 'exito' : 'error'
  )
}

function formatearRol(rol) {
  return rol === 'ADMINISTRADOR'
    ? 'Administrador'
    : 'Recepcionista'
}

function formatearFecha(fecha) {
  if (!fecha) return '—'

  const valor = new Date(fecha)

  return Number.isNaN(valor.getTime())
    ? '—'
    : valor.toLocaleDateString('es-GT')
}
</script>

<template>
  <section class="usuarios-admin">
    <div class="usuarios-encabezado">
      <div>
        <span class="usuarios-etiqueta">
          SIGCA / CONTROL DE ACCESOS
        </span>

        <h1>Gestión de usuarios.</h1>

        <p>
          Administra las cuentas, responsabilidades y permisos
          del personal de AVENIA.
        </p>
      </div>

      <button
        type="button"
        class="usuarios-boton-principal"
        @click="abrirNuevoUsuario"
      >
        <UserPlus :size="17" />
        Nuevo usuario
      </button>
    </div>

    <div
      v-if="mensaje"
      class="usuarios-alerta"
      :class="tipoMensaje"
      role="status"
    >
      <CheckCircle2 v-if="tipoMensaje === 'exito'" :size="17" />
      <AlertCircle v-else :size="17" />
      <span>{{ mensaje }}</span>
      <button type="button" @click="mensaje = ''">
        <X :size="16" />
      </button>
    </div>

    <div class="usuarios-resumen">
      <article class="usuarios-tarjeta">
        <div class="usuarios-icono">
          <Users :size="22" />
        </div>
        <div>
          <span>Usuarios registrados</span>
          <strong>{{ usuarios.length }}</strong>
          <small>Cuentas creadas</small>
        </div>
      </article>

      <article class="usuarios-tarjeta">
        <div class="usuarios-icono">
          <CheckCircle2 :size="22" />
        </div>
        <div>
          <span>Usuarios activos</span>
          <strong>{{ usuariosActivos.length }}</strong>
          <small>Con estado activo</small>
        </div>
      </article>

      <article class="usuarios-tarjeta">
        <div class="usuarios-icono">
          <ShieldCheck :size="22" />
        </div>
        <div>
          <span>Roles disponibles</span>
          <strong>2</strong>
          <small>Administrador y Recepcionista</small>
        </div>
      </article>
    </div>

    <div class="usuarios-panel">
      <div class="usuarios-panel-titulo">
        <div>
          <span class="usuarios-etiqueta">
            01 — CUENTAS
          </span>
          <h2>Usuarios del sistema</h2>
        </div>
        <span class="usuarios-contador">
          {{ usuariosFiltrados.length }} resultados
        </span>
      </div>

      <div class="usuarios-filtros">
        <label class="usuarios-busqueda">
          <Search :size="17" />
          <input
            v-model="busqueda"
            type="search"
            placeholder="Buscar por nombre, correo o código..."
          />
        </label>

        <select v-model="filtroRol" aria-label="Filtrar por rol">
          <option value="">Todos los roles</option>
          <option value="ADMINISTRADOR">Administrador</option>
          <option value="RECEPCIONISTA">Recepcionista</option>
        </select>

        <select v-model="filtroEstado" aria-label="Filtrar por estado">
          <option value="">Todos los estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
      </div>

      <div class="usuarios-tabla-contenedor">
        <table class="usuarios-tabla">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo electrónico</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="usuario in usuariosFiltrados"
              :key="usuario.id"
            >
              <td>
                <div class="usuarios-persona">
                  <div class="usuarios-avatar">
                    {{ usuario.nombre.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <strong>{{ usuario.nombre }}</strong>
                    <small>{{ usuario.id }}</small>
                  </div>
                </div>
              </td>

              <td>{{ usuario.correo }}</td>

              <td>
                <span
                  class="usuarios-rol"
                  :class="usuario.rol.toLowerCase()"
                >
                  {{ formatearRol(usuario.rol) }}
                </span>
              </td>

              <td>
                <span
                  class="usuarios-estado"
                  :class="usuario.estado.toLowerCase()"
                >
                  {{ usuario.estado === 'ACTIVO'
                    ? 'Activo'
                    : 'Inactivo' }}
                </span>
              </td>

              <td>{{ formatearFecha(usuario.fechaRegistro) }}</td>

              <td>
                <div class="usuarios-acciones">
                  <button
                    type="button"
                    title="Editar usuario"
                    @click="abrirEditarUsuario(usuario)"
                  >
                    <Pencil :size="16" />
                  </button>

                  <button
                    type="button"
                    :title="usuario.estado === 'ACTIVO'
                      ? 'Desactivar usuario'
                      : 'Activar usuario'"
                    @click="alternarEstado(usuario)"
                  >
                    <Power :size="16" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="usuariosFiltrados.length === 0">
              <td colspan="6" class="usuarios-vacio">
                <div class="usuarios-vacio-contenido">
                  <div class="usuarios-vacio-icono">
                    <UserRound :size="27" />
                  </div>

                  <h3>
                    {{ usuarios.length === 0
                      ? 'Aún no hay usuarios registrados.'
                      : 'No encontramos coincidencias.' }}
                  </h3>

                  <p>
                    {{ usuarios.length === 0
                      ? 'Registra al personal que administrará las actividades de AVENIA.'
                      : 'Prueba con otros términos o modifica los filtros.' }}
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="usuarios-nota">
      <ShieldCheck :size="18" />
      <p>
        Los roles y estados registrados permitirán preparar
        los controles de acceso del sistema.
        La autenticación y autorización real se integrarán
        posteriormente con el servidor.
      </p>
    </div>

    <!-- Formulario de registro y edición -->
    <div
      v-if="mostrarFormulario"
      class="usuarios-modal-fondo"
      @click.self="cerrarFormulario"
    >
      <div
        class="usuarios-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="usuarios-modal-titulo"
      >
        <div class="usuarios-modal-encabezado">
          <div>
            <span class="usuarios-etiqueta">
              AVENIA / CONTROL DE ACCESOS
            </span>

            <h2 id="usuarios-modal-titulo">
              {{ usuarioEditando
                ? 'Editar usuario'
                : 'Nuevo usuario' }}
            </h2>
          </div>

          <button
            type="button"
            class="usuarios-cerrar"
            aria-label="Cerrar formulario"
            @click="cerrarFormulario"
          >
            <X :size="19" />
          </button>
        </div>

        <form @submit.prevent="guardarUsuario">
          <div class="usuarios-modal-cuerpo">
            <div
              v-if="errorFormulario"
              class="usuarios-error"
              role="alert"
            >
              <AlertCircle :size="17" />
              {{ errorFormulario }}
            </div>

            <label class="usuarios-campo">
              <span>Nombre completo *</span>
              <div class="usuarios-input-icono">
                <UserRound :size="17" />
                <input
                  v-model="formulario.nombre"
                  type="text"
                  placeholder="Nombre y apellido"
                  maxlength="100"
                  required
                />
              </div>
            </label>

            <label class="usuarios-campo">
              <span>Correo electrónico *</span>
              <div class="usuarios-input-icono">
                <Mail :size="17" />
                <input
                  v-model="formulario.correo"
                  type="email"
                  placeholder="usuario@avenia.com"
                  maxlength="150"
                  required
                />
              </div>
            </label>

            <label class="usuarios-campo">
              <span>Rol asignado *</span>
              <select v-model="formulario.rol" required>
                <option value="ADMINISTRADOR">
                  Administrador
                </option>
                <option value="RECEPCIONISTA">
                  Recepcionista
                </option>
              </select>
            </label>

            <div class="usuarios-aviso">
              <ShieldCheck :size="17" />
              <p>
                El usuario se registrará inicialmente como
                <strong>Activo</strong>. Las credenciales
                de acceso se configurarán cuando integremos
                la autenticación del sistema.
              </p>
            </div>
          </div>

          <div class="usuarios-modal-pie">
            <button
              type="button"
              class="usuarios-boton-secundario"
              @click="cerrarFormulario"
            >
              Cancelar
            </button>

            <button
              type="submit"
              class="usuarios-boton-principal"
            >
              {{ usuarioEditando
                ? 'Guardar cambios'
                : 'Registrar usuario' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.usuarios-admin {
  min-height: 100%;
  padding: 36px 32px 52px;
  background: #fcf9f6;
  color: #40333d;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
}

.usuarios-encabezado,
.usuarios-panel-titulo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.usuarios-encabezado {
  margin-bottom: 28px;
}

.usuarios-etiqueta {
  color: #98758b;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.usuarios-encabezado h1,
.usuarios-panel h2,
.usuarios-modal h2,
.usuarios-vacio h3 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 500;
}

.usuarios-encabezado h1 {
  font-size: 46px;
  margin: 14px 0 8px;
}

.usuarios-encabezado p {
  color: #987f8e;
  font-size: 13px;
  line-height: 1.7;
}

.usuarios-boton-principal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  border-radius: 9px;
  background: #76566e;
  color: #fff;
  padding: 13px 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.usuarios-boton-principal:hover {
  background: #61465b;
}

.usuarios-resumen {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.usuarios-tarjeta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 23px 20px;
  background: #fff;
  border: 1px solid #ecdee5;
  border-radius: 13px;
}

.usuarios-icono {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 47px;
  height: 47px;
  border-radius: 12px;
  background: #f2e8ee;
  color: #76566e;
}

.usuarios-tarjeta span,
.usuarios-tarjeta small {
  display: block;
  font-size: 11px;
  color: #a18a99;
}

.usuarios-tarjeta strong {
  display: block;
  margin: 7px 0;
  font-family: Georgia, serif;
  font-size: 25px;
  font-weight: 400;
}

.usuarios-panel {
  margin-bottom: 22px;
  padding: 26px;
  background: #fff;
  border: 1px solid #ecdee5;
  border-radius: 14px;
}

.usuarios-panel-titulo {
  margin-bottom: 24px;
}

.usuarios-panel h2 {
  margin: 8px 0 0;
  font-size: 30px;
}

.usuarios-contador {
  font-size: 11px;
  color: #a18a99;
}

.usuarios-filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.usuarios-busqueda {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1 1 280px;
  padding: 0 13px;
  border: 1px solid #eadde4;
  border-radius: 8px;
  color: #a18a99;
}

.usuarios-busqueda input {
  width: 100%;
  height: 42px;
  border: 0;
  outline: 0;
  background: transparent;
  color: #40333d;
  font-size: 12px;
}

.usuarios-filtros select,
.usuarios-campo select {
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid #eadde4;
  border-radius: 8px;
  background: #fff;
  color: #76566e;
  font: inherit;
  font-size: 12px;
}

.usuarios-tabla-contenedor {
  overflow-x: auto;
}

.usuarios-tabla {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12px;
}

.usuarios-tabla th {
  padding: 14px 12px;
  background: #faf6f9;
  color: #a18a99;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.usuarios-tabla td {
  padding: 16px 12px;
  border-bottom: 1px solid #f0e6eb;
}

.usuarios-persona {
  display: flex;
  align-items: center;
  gap: 11px;
}

.usuarios-avatar {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #f0e2e9;
  color: #76566e;
  font-weight: 700;
}

.usuarios-persona strong,
.usuarios-persona small {
  display: block;
}

.usuarios-persona small {
  margin-top: 4px;
  color: #a18a99;
  font-size: 10px;
}

.usuarios-rol,
.usuarios-estado {
  display: inline-block;
  padding: 6px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.usuarios-rol.administrador {
  background: #f0e5ec;
  color: #76566e;
}

.usuarios-rol.recepcionista {
  background: #f7eee6;
  color: #94745e;
}

.usuarios-estado.activo {
  background: #eaf5ed;
  color: #287744;
}

.usuarios-estado.inactivo {
  background: #f8e9eb;
  color: #a34b5b;
}

.usuarios-acciones {
  display: flex;
  gap: 8px;
}

.usuarios-acciones button,
.usuarios-cerrar {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid #eadde4;
  border-radius: 7px;
  background: #fff;
  color: #76566e;
  cursor: pointer;
}

.usuarios-acciones button:hover,
.usuarios-cerrar:hover {
  background: #f6edf2;
}

.usuarios-vacio {
  padding: 50px 20px !important;
  text-align: center;
}

.usuarios-vacio-contenido {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.usuarios-vacio-icono {
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  margin-bottom: 15px;
  border-radius: 15px;
  background: #f2e8ee;
  color: #76566e;
}

.usuarios-vacio h3 {
  margin: 0 0 8px;
  font-size: 24px;
}

.usuarios-vacio p {
  max-width: 350px;
  color: #a18a99;
  font-size: 12px;
  line-height: 1.7;
}

.usuarios-nota,
.usuarios-aviso {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 15px 18px;
  border: 1px solid #e8dce3;
  border-radius: 10px;
  background: #f7eff4;
  color: #76566e;
}

.usuarios-nota p,
.usuarios-aviso p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}

.usuarios-alerta,
.usuarios-error {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding: 13px 15px;
  border-radius: 9px;
  font-size: 12px;
}

.usuarios-alerta.exito {
  background: #eaf5ed;
  color: #287744;
}

.usuarios-alerta.error,
.usuarios-error {
  background: #fff0ee;
  color: #b14b46;
}

.usuarios-alerta span {
  flex: 1;
}

.usuarios-alerta button {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.usuarios-modal-fondo {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(38, 30, 37, 0.48);
}

.usuarios-modal {
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 22px 70px rgba(38, 30, 37, 0.18);
}

.usuarios-modal-encabezado {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  padding: 26px;
  border-bottom: 1px solid #f0e6eb;
}

.usuarios-modal h2 {
  margin: 9px 0 0;
  font-size: 32px;
}

.usuarios-modal-cuerpo {
  display: flex;
  flex-direction: column;
  gap: 19px;
  padding: 26px;
}

.usuarios-campo {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.usuarios-campo > span {
  color: #76566e;
  font-size: 12px;
  font-weight: 700;
}

.usuarios-input-icono {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  border: 1px solid #eadde4;
  border-radius: 8px;
  color: #a18a99;
}

.usuarios-input-icono input {
  width: 100%;
  height: 44px;
  border: 0;
  outline: 0;
  background: transparent;
  color: #40333d;
  font: inherit;
  font-size: 13px;
}

.usuarios-campo select {
  width: 100%;
  height: 44px;
}

.usuarios-modal-pie {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 26px;
  border-top: 1px solid #f0e6eb;
}

.usuarios-boton-secundario {
  padding: 12px 18px;
  border: 1px solid #eadde4;
  border-radius: 9px;
  background: #fff;
  color: #76566e;
  font-size: 12px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .usuarios-resumen {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 750px) {
  .usuarios-admin {
    padding: 22px 15px;
  }

  .usuarios-encabezado {
    align-items: flex-start;
    flex-direction: column;
  }

  .usuarios-encabezado h1 {
    font-size: 38px;
  }

  .usuarios-panel {
    padding: 17px;
  }

  .usuarios-panel-titulo {
    align-items: flex-start;
    flex-direction: column;
  }

  .usuarios-modal-encabezado,
  .usuarios-modal-cuerpo,
  .usuarios-modal-pie {
    padding: 18px;
  }
}
</style>
