
<script setup>
import {
  ArrowUpRight,
  ArrowRight,
  HeartHandshake,
  Ear,
  UsersRound,
  Sprout,
  ShieldCheck,
  Sparkles
} from 'lucide-vue-next'

import nosotrosImg from '../../assets/nosotros-avenia.png'
import psicologiaImg from '../../assets/psicologia.png'
import estimulacionImg from '../../assets/estimulacion.png'
import desarrolloImg from '../../assets/desarrollo.png'

const valores = [
  {
    numero: '01',
    nombre: 'Empatía',
    descripcion:
      'Escuchamos y comprendemos las experiencias de cada persona con sensibilidad y respeto.',
    icono: HeartHandshake
  },
  {
    numero: '02',
    nombre: 'Escucha',
    descripcion:
      'Reconocemos la importancia de prestar atención a las necesidades y perspectivas individuales.',
    icono: Ear
  },
  {
    numero: '03',
    nombre: 'Respeto',
    descripcion:
      'Valoramos las diferencias y promovemos una atención digna, inclusiva y sin prejuicios.',
    icono: ShieldCheck
  },
  {
    numero: '04',
    nombre: 'Compromiso',
    descripcion:
      'Trabajamos con responsabilidad, dedicación y disposición para acompañar cada proceso.',
    icono: Sparkles
  }
]

const areas = [
  {
    nombre: 'Acompañamiento psicológico',
    descripcion: 'Bienestar emocional y orientación personal.',
    imagen: psicologiaImg
  },
  {
    nombre: 'Comunicación y lenguaje',
    descripcion: 'Estimulación de habilidades auditivas y verbales.',
    imagen: estimulacionImg
  },
  {
    nombre: 'Desarrollo y aprendizaje',
    descripcion: 'Fortalecimiento de capacidades y habilidades.',
    imagen: desarrolloImg
  }
]
</script>

<template>
  <main class="pagina-nosotros">

    <!-- PORTADA INSTITUCIONAL -->
    <section class="nosotros-portada">
      <div class="container">

        <span class="etiqueta">
          AVENIA / CENTRO DE ATENCIÓN INTEGRAL
        </span>

        <div class="portada-contenido">
          <h1>
            Creemos en el valor
            <em>de cada historia.</em>
          </h1>

          <p>
            Somos un espacio de acompañamiento que reconoce
            la individualidad, las experiencias y las
            necesidades de cada persona.
          </p>
        </div>

        <div class="portada-pie">
          <span>01 — CONOCE AVENIA</span>
          <span>ESCUCHAR · COMPRENDER · ACOMPAÑAR</span>
        </div>

      </div>
    </section>

    <!-- NUESTRA ESENCIA -->
    <section class="esencia">
      <div class="container esencia-grid">

        <div class="esencia-imagen">
          <img
            :src="nosotrosImg"
            alt="Consultorio de atención integral de AVENIA"
          />

          <span class="imagen-detalle">
            AVENIA / NUESTRA ESENCIA
          </span>
        </div>

        <div class="esencia-texto">
          <span class="seccion-etiqueta">
            02 — QUIÉNES SOMOS
          </span>

          <h2>
            Un lugar para
            <em>sentirse comprendido.</em>
          </h2>

          <p>
            AVENIA nace como una propuesta de atención integral
            orientada a ofrecer espacios de escucha, orientación
            y acompañamiento respetuoso.
          </p>

          <p>
            Entendemos que cada persona tiene su propio ritmo,
            sus propias experiencias y necesidades. Por ello,
            promovemos una atención cercana que reconoce
            las diferencias individuales.
          </p>

          <p>
            Nuestra propuesta reúne distintas áreas de atención
            para acompañar procesos relacionados con el bienestar
            emocional, la comunicación y el desarrollo.
          </p>

          <RouterLink to="/servicios" class="enlace-texto">
            Descubrir nuestros servicios
            <ArrowUpRight :size="18" />
          </RouterLink>
        </div>

      </div>
    </section>

    <!-- MISIÓN Y VISIÓN -->
    <section class="proposito">
      <div class="container">

        <div class="proposito-encabezado">
          <span class="seccion-etiqueta">
            03 — NUESTRO PROPÓSITO
          </span>

          <h2>
            Lo que nos inspira
            <em>y nos guía.</em>
          </h2>
        </div>

        <div class="proposito-grid">

          <article class="proposito-card">
            <span class="card-numero">
              01 / MISIÓN
            </span>

            <h3>Nuestra misión</h3>

            <p>
              Brindar atención integral y personalizada
              mediante espacios de escucha, orientación
              y acompañamiento que promuevan el bienestar,
              la comunicación y el desarrollo de habilidades,
              respetando las necesidades individuales.
            </p>

            <div class="card-decoracion">
              <HeartHandshake
                :size="36"
                :stroke-width="1.2"
              />
            </div>
          </article>

          <article class="proposito-card vision">
            <span class="card-numero">
              02 / VISIÓN
            </span>

            <h3>Nuestra visión</h3>

            <p>
              Ser un centro de atención integral reconocido
              por su trato humano, compromiso profesional
              y capacidad para acompañar diferentes procesos
              de desarrollo y bienestar, promoviendo una
              atención cercana e inclusiva.
            </p>

            <div class="card-decoracion">
              <Sprout
                :size="36"
                :stroke-width="1.2"
              />
            </div>
          </article>

        </div>

      </div>
    </section>

    <!-- VALORES INSTITUCIONALES -->
    <section class="valores-seccion">
      <div class="container">

        <div class="valores-encabezado">
          <div>
            <span class="seccion-etiqueta">
              04 — LO QUE NOS DEFINE
            </span>

            <h2>
              Valores que se reflejan
              <em>en cada encuentro.</em>
            </h2>
          </div>

          <p>
            Nuestra manera de acompañar se construye
            sobre principios que orientan cada interacción.
          </p>
        </div>

        <div class="valores-grid">

          <article
            v-for="valor in valores"
            :key="valor.numero"
            class="valor-card"
          >
            <div class="valor-superior">
              <span>{{ valor.numero }}</span>

              <component
                :is="valor.icono"
                :size="29"
                :stroke-width="1.3"
              />
            </div>

            <h3>{{ valor.nombre }}</h3>
            <p>{{ valor.descripcion }}</p>
          </article>

        </div>

      </div>
    </section>

    <!-- ÁREAS DE ATENCIÓN -->
    <section class="equipo">
      <div class="container">

        <div class="equipo-encabezado">
          <span class="seccion-etiqueta">
            05 — ACOMPAÑAMIENTO PROFESIONAL
          </span>

          <h2>
            Diferentes especialidades,
            <em>un mismo propósito.</em>
          </h2>

          <p>
            La atención integral reúne diferentes áreas
            de acompañamiento que responden a las
            necesidades de cada persona.
          </p>
        </div>

        <div class="areas-grid">

          <article
            v-for="area in areas"
            :key="area.nombre"
            class="area-card"
          >
            <div class="area-imagen">
              <img
                :src="area.imagen"
                :alt="area.nombre"
              />
            </div>

            <h3>{{ area.nombre }}</h3>
            <p>{{ area.descripcion }}</p>
          </article>

        </div>

        <div class="equipo-nota">
          <UsersRound
            :size="22"
            :stroke-width="1.5"
          />

          <p>
            La información de los profesionales, sus perfiles
            y especialidades podrá incorporarse cuando se
            registren los integrantes del equipo de AVENIA.
          </p>
        </div>

      </div>
    </section>

    <!-- INVITACIÓN FINAL -->
    <section class="nosotros-cierre">
      <div class="container cierre-contenido">

        <span>
          AVENIA / ESTAMOS PARA ACOMPAÑARTE
        </span>

        <h2>
          Cada historia merece
          <em>ser escuchada.</em>
        </h2>

        <p>
          Conoce nuestros espacios de atención
          y encuentra el acompañamiento que necesitas.
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

/* CONFIGURACIÓN GENERAL */

.pagina-nosotros {
  width: 100%;
  overflow: hidden;
  background: #FCF9F6;
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

/* PORTADA */

.nosotros-portada {
  padding: 115px 0 45px;
  background: #F2EAE5;
}

.etiqueta {
  margin-bottom: 45px;
}

.portada-contenido {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 60px;
  margin-bottom: 100px;
}

.portada-contenido h1 {
  max-width: 850px;
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(55px, 6vw, 90px);
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

/* NUESTRA ESENCIA */

.esencia {
  padding: 120px 0;
}

.esencia-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 100px;
  align-items: center;
}

.esencia-imagen {
  position: relative;
}

.esencia-imagen img {
  display: block;
  width: 100%;
  height: 580px;
  object-fit: cover;
  object-position: center;
  border-radius: 260px 260px 8px 8px;
}

.imagen-detalle {
  position: absolute;
  right: 20px;
  bottom: 20px;
  padding: 13px 18px;
  background: #FCF9F6;
  color: #76566E;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.esencia-texto h2,
.proposito-encabezado h2,
.valores-encabezado h2,
.equipo-encabezado h2 {
  margin: 25px 0;
  color: #40333D;
  font-family: var(--font-heading);
  font-size: clamp(45px, 5vw, 70px);
  font-weight: 400;
  line-height: 1.05;
}

.esencia-texto h2 em,
.proposito-encabezado h2 em,
.valores-encabezado h2 em,
.equipo-encabezado h2 em {
  display: block;
  color: #76566E;
  font-weight: 400;
}

.esencia-texto p {
  margin-bottom: 18px;
  color: #6B5B64;
  font-size: 14px;
  line-height: 2;
}

.enlace-texto {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 25px;
  padding-bottom: 8px;
  border-bottom: 1px solid #76566E;
  color: #76566E;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
}

/* MISIÓN Y VISIÓN */

.proposito {
  padding: 110px 0 120px;
  background: #F2EAE5;
}

.proposito-encabezado {
  margin-bottom: 55px;
}

.proposito-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.proposito-card {
  position: relative;
  min-height: 370px;
  padding: 48px;
  background: #FCF9F6;
  border-radius: 5px;
}

.proposito-card.vision {
  background: #76566E;
}

.card-numero {
  color: #76566E;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.proposito-card h3 {
  margin: 35px 0 20px;
  color: #40333D;
  font-family: var(--font-heading);
  font-size: 45px;
  font-weight: 400;
}

.proposito-card p {
  max-width: 440px;
  color: #6B5B64;
  font-size: 14px;
  line-height: 2;
}

.card-decoracion {
  position: absolute;
  right: 35px;
  bottom: 30px;
  color: #B99CAB;
}

.vision .card-numero,
.vision h3,
.vision p,
.vision .card-decoracion {
  color: #FFFFFF;
}

/* VALORES */

.valores-seccion {
  padding: 120px 0;
}

.valores-encabezado {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 50px;
  margin-bottom: 55px;
}

.valores-encabezado p {
  max-width: 300px;
  color: #6B5B64;
  font-size: 14px;
  line-height: 1.9;
}

.valores-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
}

.valor-card {
  min-height: 290px;
  padding: 28px;
  background: #F7F1ED;
  border: 1px solid #EADFE4;
  border-radius: 5px;
}

.valor-superior {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #76566E;
}

.valor-superior span {
  font-size: 11px;
  font-weight: 700;
}

.valor-card h3 {
  margin: 55px 0 15px;
  color: #40333D;
  font-family: var(--font-heading);
  font-size: 34px;
  font-weight: 500;
}

.valor-card p {
  color: #6B5B64;
  font-size: 13px;
  line-height: 1.8;
}

/* ÁREAS PROFESIONALES */

.equipo {
  padding: 115px 0 125px;
  background: #F2EAE5;
}

.equipo-encabezado {
  max-width: 850px;
  margin-bottom: 55px;
}

.equipo-encabezado p {
  max-width: 530px;
  color: #6B5B64;
  font-size: 14px;
  line-height: 1.9;
}

.areas-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
}

.area-imagen {
  overflow: hidden;
  border-radius: 180px 180px 5px 5px;
}

.area-imagen img {
  display: block;
  width: 100%;
  height: 360px;
  object-fit: cover;
}

.area-card h3 {
  margin: 25px 0 10px;
  color: #40333D;
  font-family: var(--font-heading);
  font-size: 30px;
  font-weight: 500;
}

.area-card p {
  color: #6B5B64;
  font-size: 13px;
  line-height: 1.8;
}

.equipo-nota {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  margin-top: 65px;
  padding: 25px;
  border-top: 1px solid #D8C4CC;
  color: #76566E;
}

.equipo-nota p {
  max-width: 700px;
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
}

/* CIERRE */

.nosotros-cierre {
  padding: 110px 0;
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
  margin: 30px 0 25px;
  color: #FFFFFF;
  font-family: var(--font-heading);
  font-size: clamp(50px, 6vw, 85px);
  font-weight: 400;
  line-height: 1;
}

.cierre-contenido h2 em {
  display: block;
  color: #EAD9CD;
  font-weight: 400;
}

.cierre-contenido p {
  max-width: 480px;
  color: #F2EAE5;
  font-size: 14px;
  line-height: 1.9;
}

.cierre-boton {
  display: inline-flex;
  align-items: center;
  gap: 13px;
  margin-top: 25px;
  padding: 17px 28px;
  background: #FCF9F6;
  color: #76566E;
  border-radius: 4px 20px 4px 20px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
}

/* RESPONSIVE */

@media (max-width: 1000px) {
  .esencia-grid {
    gap: 50px;
  }

  .valores-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .nosotros-portada {
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

  .esencia,
  .proposito,
  .valores-seccion,
  .equipo {
    padding: 75px 0;
  }

  .esencia-grid,
  .proposito-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .esencia-imagen img {
    height: 430px;
  }

  .valores-encabezado {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .areas-grid {
    grid-template-columns: 1fr;
    gap: 45px;
  }

  .area-imagen img {
    height: 360px;
  }

  .nosotros-cierre {
    padding: 80px 0;
  }
}

@media (max-width: 480px) {
  .portada-contenido h1 {
    font-size: 44px;
  }

  .valores-grid {
    grid-template-columns: 1fr;
  }

  .proposito-card {
    padding: 30px;
  }

  .esencia-imagen img {
    height: 340px;
  }
}

</style>
