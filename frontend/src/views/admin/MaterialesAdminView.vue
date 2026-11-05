<script setup>
import { ref, computed } from 'vue'
import {
  Package, Plus, Search, Pencil, Eye, X,
  AlertTriangle, ArrowDownToLine, ArrowUpFromLine,
  CheckCircle2, Power, Wallet, History
} from 'lucide-vue-next'
import { useMaterialesStore } from '../../stores/materialesStore'

const {
  materiales,
  totalMateriales,
  materialesBajoMinimo,
  valorInventario,
  historialMovimientos,
  agregarMaterial,
  actualizarMaterial,
  registrarMovimiento,
  cambiarEstado
} = useMaterialesStore()

const busqueda = ref('')
const filtro = ref('TODOS')
const filtroHistorial = ref('TODOS')
const modal = ref('')
const editandoId = ref(null)
const materialSeleccionado = ref(null)
const aviso = ref('')
const error = ref('')

const formulario = ref(formularioVacio())
const movimiento = ref({ tipo: 'ENTRADA', cantidad: '', observacion: '' })

function formularioVacio() {
  return {
    nombre: '',
    categoria: 'Material terapéutico',
    unidad: 'Unidad',
    existencia: 0,
    minimo: 5,
    costo: 0,
    descripcion: '',
    estado: 'ACTIVO'
  }
}

const materialesFiltrados = computed(() =>
  materiales.value.filter(material => {
    const texto = busqueda.value.toLowerCase().trim()
    const coincide = [material.nombre, material.id, material.categoria]
      .some(valor => String(valor || '').toLowerCase().includes(texto))

    const estado = filtro.value === 'TODOS' ||
      (filtro.value === 'BAJO' &&
        Number(material.existencia) <= Number(material.minimo)) ||
      material.estado === filtro.value

    return coincide && estado
  })
)

const movimientosFiltrados = computed(() =>
  historialMovimientos.value.filter(item =>
    filtroHistorial.value === 'TODOS' || item.tipo === filtroHistorial.value
  )
)

function fechaMovimiento(fecha) {
  const valor = new Date(fecha)
  return Number.isNaN(valor.getTime())
    ? 'Fecha no disponible'
    : new Intl.DateTimeFormat('es-GT', {
        dateStyle: 'short', timeStyle: 'short'
      }).format(valor)
}

function moneda(valor) {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ'
  }).format(Number(valor) || 0)
}

function notificar(texto) {
  aviso.value = texto
  error.value = ''
}

function nuevoMaterial() {
  formulario.value = formularioVacio()
  editandoId.value = null
  error.value = ''
  modal.value = 'formulario'
}

function editarMaterial(material) {
  formulario.value = { ...material }
  editandoId.value = material.id
  error.value = ''
  modal.value = 'formulario'
}

function verMaterial(material) {
  materialSeleccionado.value = material
  modal.value = 'detalle'
}

function guardarMaterial() {
  const datos = {
    ...formulario.value,
    nombre: formulario.value.nombre.trim(),
    existencia: Number(formulario.value.existencia),
    minimo: Number(formulario.value.minimo),
    costo: Number(formulario.value.costo)
  }

  if (!datos.nombre) {
    error.value = 'Ingresa el nombre del material.'
    return
  }

  if (
    ![datos.existencia, datos.minimo, datos.costo].every(Number.isFinite) ||
    datos.existencia < 0 || datos.minimo < 0 || datos.costo < 0
  ) {
    error.value = 'Las cantidades y el costo deben ser valores válidos.'
    return
  }

  if (editandoId.value) {
    actualizarMaterial(editandoId.value, datos)
    notificar('Material actualizado correctamente.')
  } else {
    agregarMaterial(datos)
    notificar('Material registrado correctamente.')
  }

  modal.value = ''
}

function abrirMovimiento(material, tipo) {
  materialSeleccionado.value = material
  movimiento.value = { tipo, cantidad: '', observacion: '' }
  error.value = ''
  modal.value = 'movimiento'
}

function guardarMovimiento() {
  const cantidad = Number(movimiento.value.cantidad)

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    error.value = 'Ingresa una cantidad mayor que cero.'
    return
  }

  const correcto = registrarMovimiento(
    materialSeleccionado.value.id,
    movimiento.value.tipo,
    cantidad,
    movimiento.value.observacion
  )

  if (!correcto) {
    error.value = 'No se pudo registrar el movimiento. Verifica las existencias.'
    return
  }

  notificar(
    movimiento.value.tipo === 'ENTRADA'
      ? 'Entrada registrada correctamente.'
      : 'Salida registrada correctamente.'
  )
  modal.value = ''
}

function alternarEstado(material) {
  cambiarEstado(material.id)
  notificar('Estado del material actualizado.')
}
</script>

<template>
  <section class="materiales-page">
    <div class="encabezado">
      <div>
        <span class="etiqueta">SIGCA / CONTROL DE MATERIALES</span>
        <h1>Materiales que acompañan cada atención.</h1>
        <p>Organiza los insumos del centro y controla sus existencias.</p>
      </div>

      <button class="btn-principal" @click="nuevoMaterial">
        <Plus :size="17" /> Nuevo material
      </button>
    </div>

    <div v-if="aviso" class="aviso">
      <CheckCircle2 :size="17" />
      <span>{{ aviso }}</span>
      <button @click="aviso = ''"><X :size="16" /></button>
    </div>

    <div class="indicadores">
      <div class="indicador">
        <div class="icono"><Package :size="22" /></div>
        <div>
          <span>Materiales registrados</span>
          <strong>{{ totalMateriales }}</strong>
          <small>Artículos en el catálogo</small>
        </div>
      </div>

      <div class="indicador">
        <div class="icono"><AlertTriangle :size="22" /></div>
        <div>
          <span>Existencias bajas</span>
          <strong>{{ materialesBajoMinimo.length }}</strong>
          <small>Requieren revisión</small>
        </div>
      </div>

      <div class="indicador">
        <div class="icono"><Wallet :size="22" /></div>
        <div>
          <span>Valor del inventario</span>
          <strong>{{ moneda(valorInventario) }}</strong>
          <small>Valor estimado en quetzales</small>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-titulo">
        <div>
          <span class="etiqueta">01 — INVENTARIO</span>
          <h2>Directorio de materiales</h2>
        </div>
        <span class="resultado">{{ materialesFiltrados.length }} resultados</span>
      </div>

      <div class="filtros">
        <div class="buscar">
          <Search :size="18" />
          <input v-model="busqueda" placeholder="Buscar por nombre, código o categoría..." />
        </div>

        <select v-model="filtro">
          <option value="TODOS">Todos los materiales</option>
          <option value="ACTIVO">Activos</option>
          <option value="INACTIVO">Inactivos</option>
          <option value="BAJO">Existencias bajas</option>
        </select>
      </div>

      <div class="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Material</th>
              <th>Existencia</th>
              <th>Mínimo</th>
              <th>Costo unitario</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="material in materialesFiltrados" :key="material.id">
              <td class="codigo">{{ material.id }}</td>
              <td>
                <strong>{{ material.nombre }}</strong>
                <small>{{ material.categoria }} · {{ material.unidad }}</small>
              </td>
              <td>
                <span :class="{ bajo: Number(material.existencia) <= Number(material.minimo) }">
                  {{ material.existencia }}
                </span>
              </td>
              <td>{{ material.minimo }}</td>
              <td>{{ moneda(material.costo) }}</td>
              <td>
                <span class="estado" :class="material.estado.toLowerCase()">
                  {{ material.estado === 'ACTIVO' ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="acciones">
                  <button title="Ver" @click="verMaterial(material)"><Eye :size="16" /></button>
                  <button title="Editar" @click="editarMaterial(material)"><Pencil :size="16" /></button>
                  <button title="Entrada" @click="abrirMovimiento(material, 'ENTRADA')"><ArrowDownToLine :size="16" /></button>
                  <button title="Salida" @click="abrirMovimiento(material, 'SALIDA')"><ArrowUpFromLine :size="16" /></button>
                  <button title="Cambiar estado" @click="alternarEstado(material)"><Power :size="16" /></button>
                </div>
              </td>
            </tr>
            <tr v-if="!materialesFiltrados.length">
              <td colspan="7" class="vacio">
                No hay materiales que coincidan con la búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Historial de movimientos de inventario -->
    <div class="panel historial-panel">
      <div class="panel-titulo">
        <div>
          <span class="etiqueta">02 — TRAZABILIDAD</span>
          <h2><History :size="22" class="historial-icono" /> Historial de movimientos</h2>
        </div>
        <span class="resultado">{{ movimientosFiltrados.length }} movimientos</span>
      </div>

      <div class="historial-filtros">
        <p>Consulta las entradas y salidas registradas en el inventario.</p>
        <select v-model="filtroHistorial" aria-label="Filtrar movimientos">
          <option value="TODOS">Todos los movimientos</option>
          <option value="ENTRADA">Solo entradas</option>
          <option value="SALIDA">Solo salidas</option>
        </select>
      </div>

      <div class="tabla-contenedor">
        <table>
          <thead>
            <tr>
              <th>Fecha y hora</th>
              <th>Material</th>
              <th>Movimiento</th>
              <th>Cantidad</th>
              <th>Existencia final</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in movimientosFiltrados" :key="item.id">
              <td>{{ fechaMovimiento(item.fecha) }}</td>
              <td>
                <strong>{{ item.materialNombre }}</strong>
                <small>{{ item.materialId }}</small>
              </td>
              <td>
                <span class="tipo-movimiento" :class="item.tipo.toLowerCase()">
                  {{ item.tipo === 'ENTRADA' ? 'Entrada' : 'Salida' }}
                </span>
              </td>
              <td class="codigo">{{ item.tipo === 'ENTRADA' ? '+' : '−' }}{{ item.cantidad }}</td>
              <td>{{ item.existenciaNueva }}</td>
              <td class="observaciones">{{ item.observaciones || 'Sin observaciones' }}</td>
            </tr>
            <tr v-if="!movimientosFiltrados.length">
              <td colspan="6" class="vacio">
                {{ historialMovimientos.length
                  ? 'No hay movimientos del tipo seleccionado.'
                  : 'Todavía no hay movimientos registrados. Las próximas entradas y salidas aparecerán aquí.' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-fondo" @click.self="modal = ''">
      <div class="modal">
        <div class="modal-cabecera">
          <div>
            <span class="etiqueta">AVENIA / INVENTARIO</span>
            <h2>
              {{
                modal === 'formulario'
                  ? (editandoId ? 'Editar material' : 'Nuevo material')
                  : modal === 'detalle'
                    ? 'Detalle del material'
                    : 'Movimiento de inventario'
              }}
            </h2>
          </div>
          <button class="cerrar" @click="modal = ''"><X :size="20" /></button>
        </div>

        <div class="modal-cuerpo">
          <p v-if="error" class="error">{{ error }}</p>

          <form v-if="modal === 'formulario'" id="form-material" @submit.prevent="guardarMaterial">
            <div class="campo">
              <label>Nombre del material *</label>
              <input v-model="formulario.nombre" required placeholder="Ej. Material didáctico" />
            </div>

            <div class="dos-columnas">
              <div class="campo">
                <label>Categoría</label>
                <select v-model="formulario.categoria">
                  <option>Material terapéutico</option>
                  <option>Material didáctico</option>
                  <option>Papelería</option>
                  <option>Limpieza</option>
                  <option>Equipo</option>
                  <option>Otros</option>
                </select>
              </div>
              <div class="campo">
                <label>Unidad de medida</label>
                <select v-model="formulario.unidad">
                  <option>Unidad</option>
                  <option>Caja</option>
                  <option>Paquete</option>
                  <option>Juego</option>
                  <option>Litro</option>
                  <option>Rollo</option>
                </select>
              </div>
            </div>

            <div class="dos-columnas">
              <div class="campo">
                <label>Existencia</label>
                <input v-model.number="formulario.existencia" type="number" min="0" step="1" required />
              </div>
              <div class="campo">
                <label>Existencia mínima</label>
                <input v-model.number="formulario.minimo" type="number" min="0" step="1" required />
              </div>
            </div>

            <div class="dos-columnas">
              <div class="campo">
                <label>Costo unitario (Q)</label>
                <input v-model.number="formulario.costo" type="number" min="0" step="0.01" required />
              </div>
              <div class="campo">
                <label>Estado</label>
                <select v-model="formulario.estado">
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            </div>

            <div class="campo">
              <label>Descripción</label>
              <textarea v-model="formulario.descripcion" rows="3" placeholder="Detalles del material..."></textarea>
            </div>
          </form>

          <div v-else-if="modal === 'detalle' && materialSeleccionado" class="detalle">
            <h3>{{ materialSeleccionado.nombre }}</h3>
            <p><b>Código:</b> {{ materialSeleccionado.id }}</p>
            <p><b>Categoría:</b> {{ materialSeleccionado.categoria }}</p>
            <p><b>Unidad:</b> {{ materialSeleccionado.unidad }}</p>
            <p><b>Existencia:</b> {{ materialSeleccionado.existencia }}</p>
            <p><b>Mínimo:</b> {{ materialSeleccionado.minimo }}</p>
            <p><b>Costo:</b> {{ moneda(materialSeleccionado.costo) }}</p>
            <p><b>Descripción:</b> {{ materialSeleccionado.descripcion || 'Sin descripción' }}</p>
          </div>

          <form v-else-if="modal === 'movimiento'" id="form-movimiento" @submit.prevent="guardarMovimiento">
            <p class="material-nombre">{{ materialSeleccionado?.nombre }}</p>
            <div class="campo">
              <label>Tipo de movimiento</label>
              <select v-model="movimiento.tipo">
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
              </select>
            </div>
            <div class="campo">
              <label>Cantidad *</label>
              <input v-model.number="movimiento.cantidad" type="number" min="1" step="1" required />
            </div>
            <div class="campo">
              <label>Observaciones</label>
              <textarea v-model="movimiento.observacion" rows="3"></textarea>
            </div>
          </form>
        </div>

        <div class="modal-pie">
          <button class="btn-secundario" @click="modal = ''">Cerrar</button>
          <button v-if="modal === 'formulario'" class="btn-principal" type="submit" form="form-material">
            {{ editandoId ? 'Guardar cambios' : 'Registrar material' }}
          </button>
          <button v-if="modal === 'movimiento'" class="btn-principal" type="submit" form="form-movimiento">
            Registrar movimiento
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.materiales-page {
  padding: 36px 32px 56px;
  color: #40333d;
  background: #fcf9f6;
  min-height: 100%;
}
.encabezado, .panel-titulo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.encabezado { margin-bottom: 30px; }
.etiqueta {
  display: block;
  color: #99768d;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.7px;
  margin-bottom: 14px;
}
h1, h2, h3 {
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
  color: #40333d;
}
h1 { font-size: clamp(30px, 3vw, 43px); margin: 0 0 12px; }
h2 { font-size: 27px; margin: 0; }
h3 { font-size: 23px; }
p { color: #897783; font-size: 13px; line-height: 1.7; }
button, input, select, textarea { font: inherit; }
button { cursor: pointer; }
.btn-principal {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  background: #76566e;
  color: white;
  border: 1px solid #76566e;
  border-radius: 9px;
  padding: 13px 20px;
  font-size: 12px;
  font-weight: 600;
}
.btn-secundario {
  background: white;
  color: #76566e;
  border: 1px solid #e9dce3;
  border-radius: 9px;
  padding: 12px 18px;
}
.indicadores {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.indicador {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  border: 1px solid #eee2e8;
  border-radius: 13px;
  padding: 23px 20px;
}
.icono {
  background: #f1e7ed;
  color: #76566e;
  border-radius: 11px;
  padding: 13px;
  display: flex;
}
.indicador span, .indicador small {
  display: block;
  color: #9b8794;
  font-size: 11px;
}
.indicador strong {
  display: block;
  font-family: Georgia, serif;
  font-size: 25px;
  font-weight: 400;
  margin: 8px 0;
}
.panel {
  background: white;
  border: 1px solid #eee2e8;
  border-radius: 14px;
  padding: 26px 24px;
}
.resultado { font-size: 11px; color: #a58298; }
.filtros {
  display: flex;
  gap: 12px;
  margin: 24px 0 20px;
}
.buscar {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e9dce3;
  border-radius: 9px;
  padding: 0 13px;
  color: #a58298;
}
.buscar input { border: 0; outline: none; width: 100%; }
.filtros select { width: 195px; }
input, select, textarea {
  width: 100%;
  background: white;
  color: #40333d;
  border: 1px solid #e9dce3;
  border-radius: 9px;
  padding: 12px;
  font-size: 12px;
}
.tabla-contenedor { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; }
th {
  background: #faf6f8;
  color: #a58298;
  font-size: 10px;
  font-weight: 600;
  padding: 15px 12px;
}
td {
  padding: 18px 12px;
  border-bottom: 1px solid #f0e6eb;
  font-size: 12px;
}
td strong, td small { display: block; }
td small { color: #a18d99; margin-top: 6px; }
.codigo { color: #76566e; font-weight: 700; }
.bajo { color: #c15d5d; font-weight: 700; }
.estado {
  display: inline-block;
  border-radius: 20px;
  padding: 6px 11px;
  font-size: 10px;
}
.estado.activo { background: #eaf4ed; color: #38754b; }
.estado.inactivo { background: #fae9e9; color: #a34d55; }
.acciones { display: flex; gap: 6px; }
.acciones button, .cerrar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #76566e;
  border: 1px solid #eadde4;
  border-radius: 7px;
  width: 31px;
  height: 31px;
}
.vacio { text-align: center; padding: 40px; color: #9b8794; }
.aviso {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #eaf4ed;
  color: #38754b;
  border-radius: 9px;
  padding: 14px;
  margin-bottom: 20px;
  font-size: 12px;
}
.aviso span { flex: 1; }
.aviso button { border: 0; background: transparent; color: inherit; }
.modal-fondo {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(39, 29, 38, .55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal {
  width: min(660px, 100%);
  max-height: 85vh;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-cabecera, .modal-pie {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 23px 27px;
  border-bottom: 1px solid #f0e6eb;
}
.modal-pie { border-top: 1px solid #f0e6eb; border-bottom: 0; justify-content: flex-end; gap: 10px; }
.modal-cuerpo { overflow-y: auto; padding: 25px 27px; }
.campo { margin-bottom: 18px; }
.campo label { display: block; margin-bottom: 8px; color: #76566e; font-size: 11px; font-weight: 600; }
.dos-columnas { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.error { background: #fff0f0; color: #b34e56; padding: 12px; border-radius: 8px; }
.detalle p { margin: 10px 0; }
.material-nombre { font-weight: 700; color: #76566e; }
/* Historial: mantiene la identidad visual del panel */
.historial-panel { margin-top: 24px; }
.historial-panel h2 { display: flex; align-items: center; gap: 10px; }
.historial-icono { color: #76566e; flex-shrink: 0; }
.historial-filtros {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 22px 0 18px;
}
.historial-filtros select { width: 215px; flex-shrink: 0; }
.tipo-movimiento {
  display: inline-block;
  padding: 6px 11px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
}
.tipo-movimiento.entrada { color: #38754b; background: #eaf4ed; }
.tipo-movimiento.salida { color: #a34d55; background: #fae9e9; }
.observaciones { min-width: 160px; max-width: 290px; overflow-wrap: anywhere; }

@media (max-width: 850px) {
  .materiales-page { padding: 24px 16px; }
  .encabezado { align-items: flex-start; flex-direction: column; }
  .indicadores { grid-template-columns: 1fr; }
  .filtros { flex-direction: column; }
  .filtros select { width: 100%; }
  .dos-columnas { grid-template-columns: 1fr; }
  .historial-filtros { align-items: stretch; flex-direction: column; }
  .historial-filtros select { width: 100%; }
}
</style>
