
<script setup>
import { computed, ref } from 'vue'
import {
  ArrowUpRight,
  ArrowRight,
  Mail,
  Phone,
  CalendarDays,
  Clock3,
  MessageCircle,
  CheckCircle2
} from 'lucide-vue-next'

const tipoSolicitud = ref('cita')
const enviando = ref(false)
const enviado = ref(false)
const error = ref('')

const formulario = ref({
  nombre: '',
  telefono: '',
  correo: '',
  servicio: '',
  fechaPreferida: '',
  horarioPreferido: '',
  mensaje: '',
  aceptaPrivacidad: false
})

const servicios = [
  'Psicología',
  'Estimulación auditivo-verbal',
  'Apoyo al desarrollo',
  'Orientación general'
]

const fechaMinima = computed(() => {
  const fecha = new Date()
  const anio = fecha.getFullYear()
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
})

function cambiarTipo(tipo) {
  tipoSolicitud.value = tipo
  error.value = ''
  enviado.value = false
}

function limpiarFormulario() {
  formulario.value = {
    nombre: '',
    telefono: '',
    correo: '',
    servicio: '',
    fechaPreferida: '',
    horarioPreferido: '',
    mensaje: '',
    aceptaPrivacidad: false
  }
}

async function enviarFormulario() {
  error.value = ''
  enviado.value = false

  if (!formulario.value.aceptaPrivacidad) {
    error.value = 'Debes aceptar el aviso de privacidad.'
    return
  }

  if (
    tipoSolicitud.value === 'cita' &&
    (!formulario.value.fechaPreferida ||
      !formulario.value.horarioPreferido)
  ) {
    error.value = 'Selecciona una fecha y un horario preferido.'
    return
  }

  enviando.value = true

  try {
    // Este formulario se conectará a la API de SIGCA.
    // Por ahora evitamos simular que se guardó una solicitud.
    error.value =
      'El formulario está preparado, pero todavía falta conectar ' +
      'el servidor para recibir y guardar las solicitudes.'
  } catch (err) {
    error.value = 'No fue posible procesar la solicitud.'
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <main class="pagina-contacto">

    <!-- PORTADA -->
    <section class="contacto-portada">
      <div class="container">

        <span class="etiqueta">
          AVENIA / CENTRO DE ATENCIÓN INTEGRAL
        </span>

        <div class="portada-contenido">
          <h1>
            Toda historia comienza
            <em>con una conversación.</em>
          </h1>

          <p>
            Estamos aquí para escucharte. Puedes escribirnos
            para resolver tus dudas o solicitar una cita
            con nuestro equipo.
          </p>
        </div>

        <div class="portada-pie">
          <span>03 — CONTACTO Y ATENCIÓN</span>
          <span>UN ESPACIO PARA CONECTAR</span>
        </div>

      </div>
    </section>

    <!-- CONTENIDO PRINCIPAL -->
    <section class="contacto-contenido">
      <div class="container contacto-grid">

        <!-- COLUMNA INFORMATIVA -->
        <aside class="contacto-informacion">

          <span class="seccion-etiqueta">
            01 — ESTAMOS PARA TI
          </span>

          <h2>
            El primer paso
            <em>es acercarnos.</em>
          </h2>

          <p class="introduccion">
            Cada consulta es importante. Nuestro equipo
            puede orientarte sobre los servicios disponibles
            y ayudarte a iniciar tu proceso de atención.
          </p>

          <div class="informacion-lista">

            <div class="informacion-item">
              <div class="informacion-icono">
                <MessageCircle :size="22" :stroke-width="1.5" />
              </div>

              <div>
                <h3>Consultas generales</h3>
                <p>
                  Escríbenos para conocer nuestros servicios
                  y resolver tus inquietudes.
                </p>
              </div>
            </div>

            <div class="informacion-item">
              <div class="informacion-icono">
                <CalendarDays :size="22" :stroke-width="1.5" />
              </div>

              <div>
                <h3>Solicitud de citas</h3>
                <p>
                  Indícanos el servicio, la fecha y el horario
                  de tu preferencia.
                </p>
              </div>
            </div>

            <div class="informacion-item">
              <div class="informacion-icono">
                <Clock3 :size="22" :stroke-width="1.5" />
              </div>

              <div>
                <h3>Confirmación de disponibilidad</h3>
                <p>
                  El equipo revisará tu solicitud antes
                  de confirmar una cita.
                </p>
              </div>
            </div>

          </div>

          <div class="contacto-nota">
            <span>AVENIA</span>
            <p>
              Escuchar con atención es el inicio
              de un acompañamiento significativo.
            </p>
          </div>

        </aside>

        <!-- FORMULARIO -->
        <div class="formulario-panel">

          <div class="formulario-encabezado">
            <span>02 — ESCRÍBENOS</span>
            <h2>¿Cómo podemos ayudarte?</h2>
            <p>
              Completa los siguientes datos para preparar
              tu solicitud.
            </p>
          </div>

          <!-- SELECCIÓN DE TIPO -->
          <div class="tipo-selector">

            <button
              type="button"
              :class="{ activo: tipoSolicitud === 'cita' }"
              @click="cambiarTipo('cita')"
            >
              <CalendarDays :size="17" />
              Solicitar una cita
            </button>

            <button
              type="button"
              :class="{ activo: tipoSolicitud === 'consulta' }"
              @click="cambiarTipo('consulta')"
            >
              <Mail :size="17" />
              Consulta general
            </button>

          </div>

          <form @submit.prevent="enviarFormulario">

            <div class="campos-grid">

              <div class="campo">
                <label for="nombre">Nombre completo *</label>
                <input
                  id="nombre"
                  v-model.trim="formulario.nombre"
                  type="text"
                  placeholder="Escribe tu nombre"
                  autocomplete="name"
                  maxlength="120"
                  required
                />
              </div>

              <div class="campo">
                <label for="telefono">Teléfono *</label>
                <input
                  id="telefono"
                  v-model.trim="formulario.telefono"
                  type="tel"
                  placeholder="Número de contacto"
                  autocomplete="tel"
                  maxlength="20"
                  required
                />
              </div>

              <div class="campo ancho-completo">
                <label for="correo">Correo electrónico *</label>
                <input
                  id="correo"
                  v-model.trim="formulario.correo"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  autocomplete="email"
                  maxlength="150"
                  required
                />
              </div>

              <div class="campo ancho-completo">
                <label for="servicio">Servicio de interés *</label>
                <select
                  id="servicio"
                  v-model="formulario.servicio"
                  required
                >
                  <option value="" disabled>
                    Selecciona un servicio
                  </option>

                  <option
                    v-for="servicio in servicios"
                    :key="servicio"
                    :value="servicio"
                  >
                    {{ servicio }}
                  </option>
                </select>
              </div>

              <!-- CAMPOS SOLO PARA CITAS -->
              <template v-if="tipoSolicitud === 'cita'">

                <div class="campo">
                  <label for="fecha">
                    Fecha preferida *
                  </label>

                  <input
                    id="fecha"
                    v-model="formulario.fechaPreferida"
                    type="date"
                    :min="fechaMinima"
                    required
                  />
                </div>

                <div class="campo">
                  <label for="horario">
                    Horario preferido *
                  </label>

                  <select
                    id="horario"
                    v-model="formulario.horarioPreferido"
                    required
                  >
                    <option value="" disabled>
                      Selecciona un horario
                    </option>
                    <option value="manana">
                      Por la mañana
                    </option>
                    <option value="tarde">
                      Por la tarde
                    </option>
                    <option value="indistinto">
                      Cualquier horario
                    </option>
                  </select>
                </div>

              </template>

              <div class="campo ancho-completo">
                <label for="mensaje">
                  Mensaje
                </label>

                <textarea
                  id="mensaje"
                  v-model.trim="formulario.mensaje"
                  rows="5"
                  maxlength="1500"
                  placeholder="Cuéntanos brevemente cómo podemos ayudarte..."
                ></textarea>
              </div>

            </div>

            <div class="aviso">
              <CalendarDays :size="18" />

              <p v-if="tipoSolicitud === 'cita'">
                La fecha seleccionada es una preferencia,
                no una reserva confirmada. El equipo deberá
                verificar la disponibilidad.
              </p>

              <p v-else>
                Tu consulta será revisada por el equipo
                cuando el sistema de recepción esté habilitado.
              </p>
            </div>

            <label class="privacidad">
              <input
                v-model="formulario.aceptaPrivacidad"
                type="checkbox"
                required
              />

              <span>
                Acepto que mis datos de contacto sean utilizados
                para atender esta solicitud.
              </span>
            </label>

            <p
              v-if="error"
              class="mensaje-error"
              role="alert"
            >
              {{ error }}
            </p>

            <p
              v-if="enviado"
              class="mensaje-exito"
              role="status"
            >
              <CheckCircle2 :size="18" />
              Tu solicitud fue recibida.
            </p>

            <button
              class="boton-enviar"
              type="submit"
              :disabled="enviando"
            >
              {{ enviando ? 'Procesando...' : 'Continuar con mi solicitud' }}
              <ArrowUpRight :size="19" />
            </button>

          </form>

        </div>

      </div>
    </section>

    <!-- CIERRE -->
    <section class="contacto-cierre">
      <div class="container cierre-contenido">

        <span>AVENIA / ACOMPAÑAMIENTO INTEGRAL</span>

        <h2>
          Un espacio para
          <em>sentirte escuchado.</em>
        </h2>

        <RouterLink to="/servicios" class="enlace-servicios">
          Conocer nuestros servicios
          <ArrowRight :size="18" />
        </RouterLink>

      </div>
    </section>

  </main>
</template>

<style scoped>

/* CONFIGURACIÓN GENERAL */

.pagina-contacto {
  width: 100%;
  overflow: hidden;
  background: #FCF9F6;
}

/* PORTADA */

.contacto-portada {
  padding: 110px 0 45px;
  background: #F2EAE5;
}

.etiqueta,
.seccion-etiqueta {
  display: block;
  color: #76566E;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.etiqueta {
  margin-bottom: 45px;
}

.portada-contenido {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 60px;
  margin-bottom: 95px;
}

.portada-contenido h1 {
  max-width: 850px;
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(55px, 6vw, 88px);
  font-weight: 400;
  line-height: 0.98;
  color: #40333D;
}

.portada-contenido h1 em {
  display: block;
  color: #76566E;
  font-weight: 400;
}

.portada-contenido p {
  max-width: 310px;
  margin: 0 0 8px;
  color: #6B5B64;
  font-size: 14px;
  line-height: 1.9;
}

.portada-pie {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-top: 25px;
  border-top: 1px solid rgba(118, 86, 110, 0.25);
}

.portada-pie span {
  color: #76566E;
  font-family: var(--font-ui);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
}

/* CONTENIDO PRINCIPAL */

.contacto-contenido {
  padding: 115px 0 130px;
}

.contacto-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 90px;
  align-items: start;
}

/* COLUMNA IZQUIERDA */

.contacto-informacion h2 {
  margin: 28px 0;
  color: #40333D;
  font-family: var(--font-heading);
  font-size: clamp(43px, 4.5vw, 67px);
  font-weight: 400;
  line-height: 1.05;
}

.contacto-informacion h2 em {
  display: block;
  color: #76566E;
  font-weight: 400;
}

.introduccion {
  max-width: 440px;
  margin-bottom: 45px;
  color: #6B5B64;
  font-size: 15px;
  line-height: 1.95;
}

.informacion-lista {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.informacion-item {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.informacion-icono {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid #D8C4CC;
  border-radius: 50%;
  color: #76566E;
}

.informacion-item h3 {
  margin: 0 0 8px;
  color: #40333D;
  font-size: 14px;
  font-weight: 700;
}

.informacion-item p {
  max-width: 350px;
  margin: 0;
  color: #6B5B64;
  font-size: 13px;
  line-height: 1.8;
}

.contacto-nota {
  margin-top: 60px;
  padding: 28px;
  background: #F2EAE5;
  border-left: 3px solid #76566E;
}

.contacto-nota span {
  color: #76566E;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.contacto-nota p {
  margin: 15px 0 0;
  color: #76566E;
  font-family: var(--font-heading);
  font-size: 27px;
  font-style: italic;
  line-height: 1.2;
}

/* FORMULARIO */

.formulario-panel {
  padding: 48px;
  background: #FFFFFF;
  border: 1px solid #EADFE4;
  border-radius: 5px;
  box-shadow: 0 18px 55px rgba(64, 51, 61, 0.04);
}

.formulario-encabezado > span {
  color: #76566E;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.formulario-encabezado h2 {
  margin: 15px 0 10px;
  color: #40333D;
  font-family: var(--font-heading);
  font-size: 43px;
  font-weight: 400;
}

.formulario-encabezado p {
  margin: 0;
  color: #6B5B64;
  font-size: 13px;
  line-height: 1.8;
}

/* SELECTOR DE SOLICITUD */

.tipo-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin: 32px 0;
}

.tipo-selector button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 52px;
  padding: 12px;
  background: #FCF9F6;
  border: 1px solid #EADFE4;
  border-radius: 5px;
  color: #76566E;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.tipo-selector button.activo {
  background: #76566E;
  border-color: #76566E;
  color: #FFFFFF;
}

/* CAMPOS */

.campos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px 18px;
}

.campo {
  display: flex;
  flex-direction: column;
  gap: 9px;
  min-width: 0;
}

.ancho-completo {
  grid-column: 1 / -1;
}

.campo label {
  color: #40333D;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 700;
}

.campo input,
.campo select,
.campo textarea {
  width: 100%;
  min-width: 0;
  padding: 15px 14px;
  border: 1px solid #DED2D8;
  border-radius: 4px;
  outline: none;
  background: #FCF9F6;
  color: #40333D;
  font-family: var(--font-body);
  font-size: 13px;
  transition: border-color 0.2s;
}

.campo input:focus,
.campo select:focus,
.campo textarea:focus {
  border-color: #76566E;
}

.campo textarea {
  resize: vertical;
  min-height: 120px;
}

.campo input::placeholder,
.campo textarea::placeholder {
  color: #A597A0;
}

/* AVISO */

.aviso {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-top: 25px;
  padding: 18px;
  background: #F2EAE5;
  border-radius: 4px;
  color: #76566E;
}

.aviso svg {
  flex-shrink: 0;
}

.aviso p {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
}

/* PRIVACIDAD */

.privacidad {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  margin-top: 24px;
  color: #6B5B64;
  font-size: 12px;
  line-height: 1.7;
  cursor: pointer;
}

.privacidad input {
  margin-top: 4px;
  accent-color: #76566E;
}

/* MENSAJES */

.mensaje-error {
  margin-top: 20px;
  padding: 14px;
  border-radius: 4px;
  background: #FFF0F0;
  color: #9D4040;
  font-size: 12px;
  line-height: 1.7;
}

.mensaje-exito {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  color: #38694E;
  font-size: 13px;
}

/* BOTÓN PRINCIPAL */

.boton-enviar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
  margin-top: 28px;
  padding: 18px 22px;
  background: #76566E;
  border: none;
  border-radius: 4px 20px 4px 20px;
  color: #FFFFFF;
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.boton-enviar:hover:not(:disabled) {
  background: #63465C;
}

.boton-enviar:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* CIERRE */

.contacto-cierre {
  padding: 95px 0;
  background: #76566E;
  text-align: center;
}

.cierre-contenido {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cierre-contenido > span {
  color: #EAD9CD;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.cierre-contenido h2 {
  margin: 25px 0 35px;
  color: #FFFFFF;
  font-family: var(--font-heading);
  font-size: clamp(45px, 6vw, 75px);
  font-weight: 400;
  line-height: 1;
}

.cierre-contenido h2 em {
  display: block;
  color: #EAD9CD;
  font-weight: 400;
}

.enlace-servicios {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #EAD9CD;
  color: #FFFFFF;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}

/* RESPONSIVE */

@media (max-width: 1000px) {
  .contacto-grid {
    gap: 45px;
  }

  .formulario-panel {
    padding: 30px;
  }
}

@media (max-width: 768px) {
  .contacto-portada {
    padding: 75px 0 35px;
  }

  .portada-contenido {
    flex-direction: column;
    align-items: flex-start;
    gap: 25px;
    margin-bottom: 65px;
  }

  .portada-contenido h1 {
    font-size: clamp(45px, 9vw, 65px);
  }

  .portada-pie {
    flex-direction: column;
    gap: 10px;
  }

  .contacto-contenido {
    padding: 75px 0;
  }

  .contacto-grid {
    grid-template-columns: 1fr;
    gap: 55px;
  }
}

@media (max-width: 480px) {
  .formulario-panel {
    padding: 24px 18px;
  }

  .campos-grid,
  .tipo-selector {
    grid-template-columns: 1fr;
  }

  .formulario-encabezado h2 {
    font-size: 37px;
  }

  .contacto-informacion h2 {
    font-size: 45px;
  }
}

</style>
