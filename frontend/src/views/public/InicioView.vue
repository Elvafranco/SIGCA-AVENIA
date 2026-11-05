<script setup>
import {
  ArrowUpRight,
  ArrowRight,
  Waves
} from 'lucide-vue-next'
</script>

<template>
  <div class="inicio-avenia">

    <!-- PORTADA PRINCIPAL -->
    <section class="hero">

      <div class="hero-imagen"></div>
      <div class="hero-degradado"></div>

      <div class="container hero-contenido">
        <div class="hero-texto">

          <span class="etiqueta">
            AVENIA / CENTRO DE ATENCIÓN INTEGRAL
          </span>

          <h1>
            Hay historias que
            <em>necesitan ser escuchadas.</em>
          </h1>

          <p class="descripcion">
            En AVENIA, cada proceso comienza con la disposición
            de comprender a la persona detrás de cada consulta.
          </p>

          <div class="acciones">

            <RouterLink
              to="/servicios"
              class="boton-principal"
            >
              Explorar nuestros servicios
              <ArrowUpRight :size="18" />
            </RouterLink>

            <RouterLink
              to="/contacto"
              class="enlace-secundario"
            >
              Conversemos
              <ArrowRight :size="17" />
            </RouterLink>

          </div>

          <div class="valores">

            <div class="valor">
              <Waves :size="26" :stroke-width="1.4" />
              <span>ESCUCHAR</span>
            </div>

            <div class="valor">
              <span class="numero">02</span>
              <span>COMPRENDER</span>
            </div>

            <div class="valor">
              <span class="numero">03</span>
              <span>ACOMPAÑAR</span>
            </div>

          </div>

        </div>
      </div>

      <span class="indicador">01 / AVENIA</span>

    </section>

    <!-- PRESENTACIÓN INSTITUCIONAL -->
    <section class="presentacion">

      <div class="container presentacion-grid">

        <div class="presentacion-etiqueta">
          <span>01 — NUESTRA ESENCIA</span>
          <div class="linea"></div>
        </div>

        <div class="presentacion-texto">

          <h2>
            Comprender también es
            <em>una forma de cuidar.</em>
          </h2>

          <p>
            Creemos que una atención significativa comienza
            reconociendo que cada persona tiene experiencias,
            necesidades y maneras distintas de relacionarse
            con el mundo.
          </p>

          <RouterLink
            to="/nosotros"
            class="enlace-presentacion"
          >
            Conocer nuestra forma de trabajar
            <ArrowUpRight :size="18" />
          </RouterLink>

        </div>

      </div>

    </section>

    <!-- SECCIÓN NUESTROS SERVICIOS -->
    <section class="servicios-inicio">

      <div class="container">

        <div class="servicios-encabezado">

          <div>
            <span class="servicios-etiqueta">
              02 — LO QUE HACEMOS
            </span>

            <h2>
              Cada proceso merece
              <em>su propio espacio.</em>
            </h2>
          </div>

          <p>
            Acompañamos diferentes necesidades a través
            de una atención cercana, respetuosa y adaptada
            a cada persona.
          </p>

        </div>

        <div class="servicios-grid">

          <!-- SERVICIO 1: PSICOLOGÍA -->
          <article class="servicio-card">

            <div class="servicio-imagen imagen-psicologia">
              <span class="servicio-numero">01</span>
            </div>

            <div class="servicio-informacion">

              <h3>Psicología</h3>

              <p>
                Un espacio de escucha y acompañamiento
                para comprender emociones, experiencias
                y procesos personales.
              </p>

              <RouterLink
                to="/servicios"
                class="servicio-enlace"
              >
                Conocer el servicio
                <ArrowUpRight :size="18" />
              </RouterLink>

            </div>

          </article>

          <!-- SERVICIO 2: ESTIMULACIÓN -->
          <article class="servicio-card">

            <div class="servicio-imagen imagen-estimulacion">
              <span class="servicio-numero">02</span>
            </div>

            <div class="servicio-informacion">

              <h3>Estimulación auditivo-verbal</h3>

              <p>
                Actividades orientadas a favorecer
                habilidades de escucha, lenguaje
                y comunicación.
              </p>

              <RouterLink
                to="/servicios"
                class="servicio-enlace"
              >
                Conocer el servicio
                <ArrowUpRight :size="18" />
              </RouterLink>

            </div>

          </article>

          <!-- SERVICIO 3: DESARROLLO -->
          <article class="servicio-card">

            <div class="servicio-imagen imagen-desarrollo">
              <span class="servicio-numero">03</span>
            </div>

            <div class="servicio-informacion">

              <h3>Apoyo al desarrollo</h3>

              <p>
                Acompañamiento de procesos de aprendizaje,
                interacción y desarrollo de habilidades
                según las necesidades individuales.
              </p>

              <RouterLink
                to="/servicios"
                class="servicio-enlace"
              >
                Conocer el servicio
                <ArrowUpRight :size="18" />
              </RouterLink>

            </div>

          </article>

        </div>

        <div class="servicios-pie">

          <span>
            Atención que reconoce las diferencias
            de cada persona.
          </span>

          <RouterLink
            to="/servicios"
            class="todos-servicios"
          >
            Explorar todos los servicios
            <ArrowRight :size="18" />
          </RouterLink>

        </div>

      </div>

    </section>

  </div>
</template>

<style scoped>

/* =========================================
   CONFIGURACIÓN GENERAL
========================================= */

.inicio-avenia {
  width: 100%;
  overflow: hidden;
}

/* =========================================
   1. PORTADA PRINCIPAL
========================================= */

.hero {
  position: relative;
  min-height: 690px;
  display: flex;
  align-items: center;
  isolation: isolate;
  background: #EAD9CD;
}

.hero-imagen {
  position: absolute;
  inset: 0;
  z-index: -3;

  background-image: url('../../assets/hero-avenia.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero-degradado {
  position: absolute;
  inset: 0;
  z-index: -2;

  background: linear-gradient(
    90deg,
    rgba(252, 249, 246, 0.78) 0%,
    rgba(252, 249, 246, 0.40) 35%,
    rgba(252, 249, 246, 0.08) 65%,
    rgba(252, 249, 246, 0) 100%
  );
}

.hero::after {
  content: '';
  position: absolute;
  width: 410px;
  height: 950px;
  top: -160px;
  right: 20%;
  border: 1px solid rgba(118, 86, 110, 0.35);
  border-radius: 50%;
  transform: rotate(25deg);
  pointer-events: none;
  z-index: -1;
}

.hero-contenido {
  position: relative;
  padding-top: 90px;
  padding-bottom: 90px;
}

.hero-texto {
  max-width: 670px;
}

.etiqueta {
  display: block;
  margin-bottom: 36px;
  color: #76566E;
  font-family: var(--font-ui);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 3px;
}

.hero h1 {
  margin: 0 0 30px;
  font-family: var(--font-heading);
  font-size: clamp(58px, 6.4vw, 100px);
  font-weight: 400;
  line-height: 0.96;
  letter-spacing: -2px;
  color: #40333D;
}

.hero h1 em {
  display: block;
  color: #76566E;
  font-weight: 400;
}

.descripcion {
  max-width: 445px;
  color: #62545C;
  font-size: 15px;
  line-height: 1.9;
}

.acciones {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 28px;
  margin-top: 35px;
}

.boton-principal {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  padding: 17px 25px;
  background: #76566E;
  color: white;
  border-radius: 4px 20px 4px 20px;
  text-decoration: none;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  transition: background 0.2s, transform 0.2s;
}

.boton-principal:hover {
  background: #63465C;
  transform: translateY(-2px);
}

.enlace-secundario {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #40333D;
  text-decoration: none;
  border-bottom: 1px solid #76566E;
  padding-bottom: 7px;
  font-size: 12px;
  font-weight: 600;
}

.valores {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 35px;
  margin-top: 75px;
}

.valor {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #76566E;
  font-family: var(--font-ui);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.5px;
}

.numero {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid #B99CAB;
  border-radius: 50%;
}

.indicador {
  position: absolute;
  right: 35px;
  bottom: 30px;
  color: #76566E;
  font-size: 10px;
  letter-spacing: 2px;
}

/* =========================================
   2. PRESENTACIÓN INSTITUCIONAL
========================================= */

.presentacion {
  padding: 110px 0 125px;
  background: #FCF9F6;
}

.presentacion-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 60px;
}

.presentacion-etiqueta {
  color: #76566E;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
}

.linea {
  width: 75px;
  height: 1px;
  margin-top: 22px;
  background: #76566E;
}

.presentacion-texto h2 {
  font-family: var(--font-heading);
  font-size: clamp(42px, 5vw, 68px);
  font-weight: 400;
  line-height: 1.05;
  color: #40333D;
  margin: 0 0 25px;
}

.presentacion-texto h2 em {
  color: #76566E;
  font-weight: 400;
}

.presentacion-texto p {
  max-width: 570px;
  font-size: 15px;
  line-height: 2;
  color: #6B5B64;
}

.enlace-presentacion {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 22px;
  padding-bottom: 8px;
  border-bottom: 1px solid #76566E;
  color: #76566E;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
}

/* =========================================
   3. SECCIÓN NUESTROS SERVICIOS
========================================= */

.servicios-inicio {
  padding: 110px 0 120px;
  background: #F2EAE5;
}

.servicios-encabezado {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 70px;
  margin-bottom: 55px;
}

.servicios-etiqueta {
  display: block;
  margin-bottom: 25px;
  color: #76566E;
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.servicios-encabezado h2 {
  max-width: 690px;
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(45px, 5vw, 72px);
  font-weight: 400;
  line-height: 1.05;
  color: #40333D;
}

.servicios-encabezado h2 em {
  display: block;
  color: #76566E;
  font-weight: 400;
}

.servicios-encabezado > p {
  max-width: 310px;
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.9;
  color: #6B5B64;
}

/* =========================================
   4. TARJETAS DE SERVICIOS
========================================= */

.servicios-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 26px;
}

.servicio-card {
  min-width: 0;
}

.servicio-imagen {
  position: relative;
  height: 360px;
  overflow: hidden;
  background-color: #EAD9CD;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 150px 150px 5px 5px;
  transition: transform 0.3s ease;
}

.servicio-card:hover .servicio-imagen {
  transform: translateY(-5px);
}

/* IMÁGENES LOCALES DE AVENIA */

.imagen-psicologia {
  background-image: url('../../assets/psicologia.png');
}

.imagen-estimulacion {
  background-image: url('../../assets/estimulacion.png');
}

.imagen-desarrollo {
  background-image: url('../../assets/desarrollo.png');
}

.servicio-numero {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(252, 249, 246, 0.93);
  color: #76566E;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 700;
}

.servicio-informacion {
  padding: 25px 4px 10px;
}

.servicio-informacion h3 {
  min-height: 66px;
  margin: 0 0 12px;
  font-family: var(--font-heading);
  font-size: 34px;
  font-weight: 500;
  line-height: 1.1;
  color: #40333D;
}

.servicio-informacion p {
  min-height: 92px;
  margin: 0 0 22px;
  color: #6B5B64;
  font-size: 14px;
  line-height: 1.8;
}

.servicio-enlace {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #B99CAB;
  color: #76566E;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
}

.servicio-enlace:hover {
  border-color: #76566E;
}

/* =========================================
   5. PIE DE LA SECCIÓN SERVICIOS
========================================= */

.servicios-pie {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 25px;
  margin-top: 60px;
  padding-top: 25px;
  border-top: 1px solid rgba(118, 86, 110, 0.22);
}

.servicios-pie > span {
  color: #76566E;
  font-family: var(--font-heading);
  font-size: 24px;
  font-style: italic;
}

.todos-servicios {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: #76566E;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

/* =========================================
   6. DISEÑO RESPONSIVE
========================================= */

@media (max-width: 900px) {

  .servicios-encabezado {
    align-items: flex-start;
    flex-direction: column;
    gap: 20px;
  }

  .servicios-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .servicio-informacion h3,
  .servicio-informacion p {
    min-height: 0;
  }

}

@media (max-width: 768px) {

  .hero {
    min-height: 650px;
  }

  .hero-imagen {
    background-position: 65% center;
  }

  .hero-contenido {
    padding-top: 75px;
    padding-bottom: 75px;
  }

  .hero h1 {
    font-size: clamp(48px, 11vw, 72px);
  }

  .hero-degradado {
    background: linear-gradient(
      90deg,
      rgba(252, 249, 246, 0.97),
      rgba(252, 249, 246, 0.78)
    );
  }

  .hero::after {
    right: -250px;
  }

  .valores {
    gap: 18px;
    margin-top: 55px;
  }

  .valor {
    font-size: 9px;
  }

  .presentacion {
    padding: 75px 0;
  }

  .presentacion-grid {
    grid-template-columns: 1fr;
    gap: 35px;
  }

  .indicador {
    display: none;
  }

}

@media (max-width: 600px) {

  .servicios-inicio {
    padding: 75px 0;
  }

  .servicios-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .servicio-imagen {
    height: 330px;
  }

  .servicios-pie {
    flex-direction: column;
    align-items: flex-start;
  }

}

@media (max-width: 420px) {

  .hero h1 {
    font-size: 46px;
  }

  .acciones {
    align-items: flex-start;
    flex-direction: column;
    gap: 22px;
  }

  .valores {
    gap: 14px;
  }

  .valor {
    letter-spacing: 0.5px;
  }

  .servicios-encabezado h2 {
    font-size: 43px;
  }

}

</style>
