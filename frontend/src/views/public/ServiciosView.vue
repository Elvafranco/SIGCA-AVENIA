
<script setup>
import { ArrowUpRight, ArrowRight } from 'lucide-vue-next'

// IMPORTACIÓN DE LAS FOTOGRAFÍAS DE AVENIA
import psicologiaImg from '../../assets/psicologia.png'
import estimulacionImg from '../../assets/estimulacion.png'
import desarrolloImg from '../../assets/desarrollo.png'

// INFORMACIÓN DE LOS SERVICIOS
const servicios = [
  {
    numero: '01',
    nombre: 'Psicología',
    subtitulo: 'Un espacio para ser escuchado.',
    descripcion:
      'En AVENIA ofrecemos un espacio de escucha, orientación y acompañamiento emocional. Nuestro enfoque reconoce que cada persona tiene experiencias, emociones y necesidades diferentes, por lo que promovemos una atención cercana, respetuosa e individualizada.',
    imagen: psicologiaImg
  },
  {
    numero: '02',
    nombre: 'Estimulación auditivo-verbal',
    subtitulo: 'Escuchar, comunicar y conectar.',
    descripcion:
      'Acompañamos el desarrollo de habilidades de escucha, lenguaje y comunicación mediante actividades adaptadas a las necesidades de cada persona. Buscamos favorecer la participación y la interacción en diferentes entornos.',
    imagen: estimulacionImg
  },
  {
    numero: '03',
    nombre: 'Apoyo al desarrollo',
    subtitulo: 'Cada avance tiene su propio ritmo.',
    descripcion:
      'Brindamos acompañamiento en procesos de aprendizaje, interacción y desarrollo de habilidades. A través de actividades individualizadas, buscamos fortalecer capacidades y reconocer los avances de cada persona.',
    imagen: desarrolloImg
  }
]
</script>

<template>
  <main class="pagina-servicios">

    <!-- PORTADA DE LA PÁGINA -->
    <section class="servicios-portada">
      <div class="container">

        <span class="etiqueta">
          AVENIA / CENTRO DE ATENCIÓN INTEGRAL
        </span>

        <div class="portada-contenido">

          <h1>
            Acompañamiento para
            <em>cada etapa y necesidad.</em>
          </h1>

          <p>
            Cada persona tiene una historia diferente.
            Por eso, ofrecemos espacios de atención
            cercanos, respetuosos y personalizados.
          </p>

        </div>

        <div class="portada-pie">
          <span>01 — NUESTROS SERVICIOS</span>
          <span>ESCUCHAR · COMPRENDER · ACOMPAÑAR</span>
        </div>

      </div>
    </section>

    <!-- LISTADO DE SERVICIOS -->
    <section class="servicios-contenido">

      <div class="container">

        <article
          v-for="servicio in servicios"
          :key="servicio.numero"
          class="servicio-bloque"
        >

          <!-- FOTOGRAFÍA -->
          <div class="servicio-fotografia">

            <img
              :src="servicio.imagen"
              :alt="servicio.nombre"
            />

            <span class="foto-numero">
              {{ servicio.numero }}
            </span>

          </div>

          <!-- INFORMACIÓN -->
          <div class="servicio-informacion">

            <span class="servicio-etiqueta">
              {{ servicio.numero }} / AVENIA
            </span>

            <h2>{{ servicio.nombre }}</h2>

            <h3>{{ servicio.subtitulo }}</h3>

            <p>{{ servicio.descripcion }}</p>

            <RouterLink
              to="/contacto"
              class="servicio-boton"
            >
              Solicitar información
              <ArrowUpRight :size="18" />
            </RouterLink>

          </div>

        </article>

      </div>

    </section>

    <!-- INVITACIÓN FINAL -->
    <section class="servicios-cierre">

      <div class="container cierre-contenido">

        <span class="cierre-etiqueta">
          ESTAMOS PARA ACOMPAÑARTE
        </span>

        <h2>
          Todo comienza
          <em>con una conversación.</em>
        </h2>

        <p>
          Si deseas conocer más sobre nuestros servicios
          o recibir orientación, estaremos encantados
          de escucharte.
        </p>

        <RouterLink
          to="/contacto"
          class="cierre-boton"
        >
          Conversemos
          <ArrowRight :size="18" />
        </RouterLink>

      </div>

    </section>

  </main>
</template>

<style scoped>

/* =========================================
   CONFIGURACIÓN GENERAL
========================================= */

.pagina-servicios {
  width: 100%;
  overflow: hidden;
  background: #FCF9F6;
}

/* =========================================
   1. PORTADA
========================================= */

.servicios-portada {
  padding: 115px 0 45px;
  background: #F2EAE5;
}

.etiqueta {
  display: block;
  margin-bottom: 45px;
  color: #76566E;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
}

.portada-contenido {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 70px;
  margin-bottom: 100px;
}

.portada-contenido h1 {
  max-width: 850px;
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(55px, 6vw, 90px);
  font-weight: 400;
  line-height: 0.98;
  letter-spacing: -1.5px;
  color: #40333D;
}

.portada-contenido h1 em {
  display: block;
  color: #76566E;
  font-weight: 400;
}

.portada-contenido p {
  max-width: 300px;
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

/* =========================================
   2. LISTADO DE SERVICIOS
========================================= */

.servicios-contenido {
  padding: 115px 0 30px;
}

.servicio-bloque {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 90px;
  margin-bottom: 125px;
}

/* ALTERNAR FOTOGRAFÍAS */

.servicio-bloque:nth-child(even) .servicio-fotografia {
  order: 2;
}

/* =========================================
   3. FOTOGRAFÍAS
========================================= */

.servicio-fotografia {
  position: relative;
  min-width: 0;
}

.servicio-fotografia img {
  display: block;
  width: 100%;
  height: 470px;
  object-fit: cover;
  object-position: center;
  border-radius: 230px 230px 8px 8px;
}

.foto-numero {
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: grid;
  place-items: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: #FCF9F6;
  color: #76566E;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 700;
}

/* =========================================
   4. INFORMACIÓN DE CADA SERVICIO
========================================= */

.servicio-informacion {
  min-width: 0;
}

.servicio-etiqueta {
  color: #76566E;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.servicio-informacion h2 {
  margin: 25px 0 15px;
  color: #40333D;
  font-family: var(--font-heading);
  font-size: clamp(40px, 4.5vw, 67px);
  font-weight: 400;
  line-height: 1.05;
}

.servicio-informacion h3 {
  margin: 0 0 25px;
  color: #76566E;
  font-family: var(--font-heading);
  font-size: 29px;
  font-weight: 400;
  font-style: italic;
}

.servicio-informacion p {
  max-width: 500px;
  color: #6B5B64;
  font-size: 15px;
  line-height: 2;
}

.servicio-boton {
  display: inline-flex;
  align-items: center;
  gap: 13px;
  margin-top: 30px;
  padding-bottom: 9px;
  border-bottom: 1px solid #76566E;
  color: #76566E;
  text-decoration: none;
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 700;
}

.servicio-boton:hover {
  color: #40333D;
  border-color: #40333D;
}

/* =========================================
   5. INVITACIÓN FINAL
========================================= */

.servicios-cierre {
  padding: 110px 0;
  background: #76566E;
  text-align: center;
}

.cierre-contenido {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cierre-etiqueta {
  color: #EAD9CD;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
}

.servicios-cierre h2 {
  max-width: 800px;
  margin: 30px 0 25px;
  color: #FFFFFF;
  font-family: var(--font-heading);
  font-size: clamp(50px, 6vw, 85px);
  font-weight: 400;
  line-height: 1;
}

.servicios-cierre h2 em {
  display: block;
  color: #EAD9CD;
  font-weight: 400;
}

.servicios-cierre p {
  max-width: 490px;
  margin: 0;
  color: #F2EAE5;
  font-size: 15px;
  line-height: 1.9;
}

.cierre-boton {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  margin-top: 35px;
  padding: 17px 28px;
  background: #FCF9F6;
  color: #76566E;
  border-radius: 4px 20px 4px 20px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
}

.cierre-boton:hover {
  background: #EAD9CD;
}

/* =========================================
   6. DISEÑO RESPONSIVE
========================================= */

@media (max-width: 900px) {

  .portada-contenido {
    flex-direction: column;
    align-items: flex-start;
    gap: 25px;
    margin-bottom: 65px;
  }

  .servicio-bloque {
    gap: 40px;
  }

  .servicio-fotografia img {
    height: 390px;
  }

}

@media (max-width: 768px) {

  .servicios-portada {
    padding: 75px 0 35px;
  }

  .portada-contenido h1 {
    font-size: clamp(45px, 9vw, 65px);
  }

  .portada-pie {
    flex-direction: column;
    gap: 10px;
  }

  .servicios-contenido {
    padding: 75px 0 10px;
  }

  .servicio-bloque {
    grid-template-columns: 1fr;
    gap: 35px;
    margin-bottom: 85px;
  }

  .servicio-bloque:nth-child(even) .servicio-fotografia {
    order: 0;
  }

  .servicio-fotografia img {
    height: 360px;
  }

  .servicio-informacion h2 {
    font-size: 48px;
  }

  .servicios-cierre {
    padding: 80px 0;
  }

}

@media (max-width: 420px) {

  .portada-contenido h1 {
    font-size: 44px;
  }

  .servicio-fotografia img {
    height: 310px;
  }

  .servicio-informacion h2 {
    font-size: 42px;
  }

  .servicios-cierre h2 {
    font-size: 46px;
  }

}

</style>
