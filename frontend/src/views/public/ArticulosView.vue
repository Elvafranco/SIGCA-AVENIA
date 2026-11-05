<script setup>
import { computed, ref } from 'vue'
import {
  ArrowUpRight,
  ArrowRight,
  BookOpen,
  CalendarDays
} from 'lucide-vue-next'

import emocionesImg from '../../assets/articulo-emociones.png'
import lenguajeImg from '../../assets/articulo-lenguaje.png'
import desarrolloImg from '../../assets/articulo-desarrollo.png'
import familiaImg from '../../assets/articulo-familia.png'
import escuchaImg from '../../assets/articulo-escucha.png'
import juegoImg from '../../assets/articulo-juego.png'

const categoriaActiva = ref('Todos')

const categorias = [
  'Todos',
  'Bienestar emocional',
  'Comunicación y lenguaje',
  'Desarrollo infantil',
  'Familias'
]

const articulos = [
  {
    id: 1,
    categoria: 'Bienestar emocional',
    fecha: '20 OCT 2026',
    titulo: 'La importancia de escuchar nuestras emociones',
    descripcion:
      'Reconocer lo que sentimos es un primer paso para comprender nuestras experiencias y cuidar nuestro bienestar.',
    imagen: emocionesImg,
    destacado: true
  },
  {
    id: 2,
    categoria: 'Comunicación y lenguaje',
    fecha: '18 OCT 2026',
    titulo: 'El lenguaje se construye en los pequeños momentos',
    descripcion:
      'Las conversaciones, los juegos y las rutinas cotidianas ofrecen oportunidades para estimular la comunicación.',
    imagen: lenguajeImg
  },
  {
    id: 3,
    categoria: 'Desarrollo infantil',
    fecha: '15 OCT 2026',
    titulo: 'Cada niño aprende a su propio ritmo',
    descripcion:
      'Comprender las diferencias individuales permite acompañar el aprendizaje con paciencia y respeto.',
    imagen: desarrolloImg
  },
  {
    id: 4,
    categoria: 'Familias',
    fecha: '12 OCT 2026',
    titulo: 'Acompañar también significa estar presentes',
    descripcion:
      'La escucha, la atención y el tiempo compartido fortalecen los vínculos y la confianza familiar.',
    imagen: familiaImg
  },
  {
    id: 5,
    categoria: 'Bienestar emocional',
    fecha: '10 OCT 2026',
    titulo: 'Crear espacios para hablar de lo que sentimos',
    descripcion:
      'Un entorno de confianza facilita la expresión de emociones y el diálogo respetuoso.',
    imagen: escuchaImg
  },
  {
    id: 6,
    categoria: 'Desarrollo infantil',
    fecha: '08 OCT 2026',
    titulo: 'El juego como oportunidad de aprendizaje',
    descripcion:
      'Explorar, imaginar y compartir experiencias contribuye al desarrollo de distintas habilidades.',
    imagen: juegoImg
  }
]

const articulosFiltrados = computed(() => {
  if (categoriaActiva.value === 'Todos') return articulos

  return articulos.filter(
    articulo => articulo.categoria === categoriaActiva.value
  )
})

const articuloDestacado = computed(() =>
  articulos.find(articulo => articulo.destacado)
)
</script>

<template>
  <main class="pagina-articulos">

    <!-- PORTADA -->
    <section class="portada">
      <div class="container">
        <span class="etiqueta">AVENIA / CONOCIMIENTO Y ACOMPAÑAMIENTO</span>

        <div class="portada-contenido">
          <h1>
            Ideas para comprender,
            <em>aprender y acompañar.</em>
          </h1>

          <p>
            Un espacio para compartir reflexiones,
            información y herramientas relacionadas
            con el bienestar, la comunicación y el desarrollo.
          </p>
        </div>

        <div class="portada-pie">
          <span>01 — ARTÍCULOS Y REFLEXIONES</span>
          <span>UN ESPACIO PARA SEGUIR APRENDIENDO</span>
        </div>
      </div>
    </section>

    <!-- ARTÍCULO DESTACADO -->
    <section v-if="articuloDestacado" class="destacado">
      <div class="container">
        <span class="etiqueta">02 — LECTURA DESTACADA</span>

        <div class="destacado-grid">
          <div class="destacado-imagen">
            <img
              :src="articuloDestacado.imagen"
              :alt="articuloDestacado.titulo"
            />
          </div>

          <div class="destacado-texto">
            <span class="categoria">
              {{ articuloDestacado.categoria }}
            </span>

            <h2>{{ articuloDestacado.titulo }}</h2>

            <p>{{ articuloDestacado.descripcion }}</p>

            <div class="fecha">
              <CalendarDays :size="16" />
              {{ articuloDestacado.fecha }}
            </div>

            <a href="#publicaciones" class="enlace">
              Explorar publicaciones
              <ArrowUpRight :size="18" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- PUBLICACIONES -->
    <section id="publicaciones" class="publicaciones">
      <div class="container">

        <div class="publicaciones-encabezado">
          <div>
            <span class="etiqueta">03 — NUESTRAS PUBLICACIONES</span>

            <h2>
              Historias, ideas
              <em>y aprendizajes.</em>
            </h2>
          </div>

          <p>
            Explora contenidos preparados para acompañar
            diferentes etapas y necesidades.
          </p>
        </div>

        <!-- CATEGORÍAS -->
        <div class="filtros">
          <button
            v-for="categoria in categorias"
            :key="categoria"
            type="button"
            :class="{ activo: categoriaActiva === categoria }"
            @click="categoriaActiva = categoria"
          >
            {{ categoria }}
          </button>
        </div>

        <!-- TARJETAS -->
        <div class="articulos-grid">
          <article
            v-for="articulo in articulosFiltrados"
            :key="articulo.id"
            class="articulo"
          >
            <div class="articulo-imagen">
              <img
                :src="articulo.imagen"
                :alt="articulo.titulo"
                loading="lazy"
              />

              <span class="numero">
                {{ String(articulo.id).padStart(2, '0') }}
              </span>
            </div>

            <div class="articulo-meta">
              <span>{{ articulo.categoria }}</span>
              <span>{{ articulo.fecha }}</span>
            </div>

            <h3>{{ articulo.titulo }}</h3>
            <p>{{ articulo.descripcion }}</p>

            <div class="articulo-pie">
              <span>AVENIA / PUBLICACIÓN</span>
              <BookOpen :size="19" :stroke-width="1.4" />
            </div>
          </article>
        </div>

        <p
          v-if="articulosFiltrados.length === 0"
          class="sin-resultados"
        >
          Todavía no hay publicaciones en esta categoría.
        </p>
      </div>
    </section>

    <!-- CIERRE -->
    <section class="cierre">
      <div class="container cierre-contenido">
        <span>AVENIA / ESTAMOS PARA ESCUCHARTE</span>

        <h2>
          El conocimiento acompaña.
          <em>La escucha transforma.</em>
        </h2>

        <p>
          Si tienes preguntas sobre nuestros servicios,
          podemos orientarte.
        </p>

        <RouterLink to="/contacto" class="boton-cierre">
          Conversemos
          <ArrowRight :size="18" />
        </RouterLink>
      </div>
    </section>

  </main>
</template>

<style scoped>
.pagina-articulos {
  background: #FCF9F6;
  color: #40333D;
  overflow: hidden;
}

.etiqueta {
  display: block;
  color: #76566E;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
}

.portada {
  padding: 115px 0 45px;
  background: #F2EAE5;
}

.portada-contenido {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 60px;
  margin: 45px 0 100px;
}

.portada h1 {
  max-width: 850px;
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(55px, 6vw, 90px);
  font-weight: 400;
  line-height: 1;
}

.portada h1 em {
  display: block;
  color: #76566E;
  font-weight: 400;
}

.portada-contenido p {
  max-width: 300px;
  color: #6B5B64;
  font-size: 14px;
  line-height: 1.9;
}

.portada-pie {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-top: 25px;
  border-top: 1px solid #D8C4CC;
  color: #76566E;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.destacado {
  padding: 110px 0 120px;
}

.destacado-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 85px;
  align-items: center;
  margin-top: 45px;
}

.destacado-imagen {
  overflow: hidden;
  border-radius: 250px 250px 5px 5px;
}

.destacado-imagen img {
  display: block;
  width: 100%;
  height: 530px;
  object-fit: cover;
}

.categoria {
  color: #76566E;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}

.destacado-texto h2 {
  margin: 25px 0;
  font-family: var(--font-heading);
  font-size: clamp(42px, 4.5vw, 65px);
  font-weight: 400;
  line-height: 1.08;
}

.destacado-texto p {
  color: #6B5B64;
  font-size: 14px;
  line-height: 2;
}

.fecha {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 30px;
  color: #76566E;
  font-size: 11px;
  font-weight: 600;
}

.enlace {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 35px;
  padding-bottom: 8px;
  border-bottom: 1px solid #76566E;
  color: #76566E;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
}

.publicaciones {
  padding: 110px 0 125px;
  background: #F2EAE5;
}

.publicaciones-encabezado {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 50px;
  margin-bottom: 45px;
}

.publicaciones-encabezado h2 {
  margin: 25px 0 0;
  font-family: var(--font-heading);
  font-size: clamp(45px, 5vw, 70px);
  font-weight: 400;
  line-height: 1.05;
}

.publicaciones-encabezado h2 em {
  display: block;
  color: #76566E;
  font-weight: 400;
}

.publicaciones-encabezado > p {
  max-width: 310px;
  color: #6B5B64;
  font-size: 14px;
  line-height: 1.9;
}

.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 45px;
}

.filtros button {
  padding: 12px 18px;
  border: 1px solid #D8C4CC;
  border-radius: 30px;
  background: transparent;
  color: #76566E;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.filtros button:hover,
.filtros button.activo {
  background: #76566E;
  border-color: #76566E;
  color: white;
}

.articulos-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 55px 28px;
}

.articulo {
  min-width: 0;
}

.articulo-imagen {
  position: relative;
  overflow: hidden;
  border-radius: 170px 170px 5px 5px;
}

.articulo-imagen img {
  display: block;
  width: 100%;
  height: 330px;
  object-fit: cover;
  transition: transform 0.35s;
}

.articulo:hover .articulo-imagen img {
  transform: scale(1.04);
}

.numero {
  position: absolute;
  right: 15px;
  bottom: 15px;
  display: grid;
  place-items: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #FCF9F6;
  color: #76566E;
  font-size: 11px;
  font-weight: 700;
}

.articulo-meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 25px;
  color: #76566E;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.articulo h3 {
  margin: 18px 0 15px;
  font-family: var(--font-heading);
  font-size: 34px;
  font-weight: 500;
  line-height: 1.15;
}

.articulo > p {
  color: #6B5B64;
  font-size: 13px;
  line-height: 1.9;
}

.articulo-pie {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 25px;
  padding-top: 15px;
  border-top: 1px solid #D8C4CC;
  color: #76566E;
}

.articulo-pie span {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

.sin-resultados {
  padding: 40px 0;
  color: #6B5B64;
  text-align: center;
}

.cierre {
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

.cierre h2 {
  margin: 30px 0 25px;
  color: white;
  font-family: var(--font-heading);
  font-size: clamp(50px, 6vw, 80px);
  font-weight: 400;
  line-height: 1;
}

.cierre h2 em {
  display: block;
  color: #EAD9CD;
  font-weight: 400;
}

.cierre p {
  max-width: 480px;
  color: #F2EAE5;
  font-size: 14px;
  line-height: 1.9;
}

.boton-cierre {
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

@media (max-width: 1000px) {
  .destacado-grid {
    gap: 45px;
  }

  .articulos-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .portada {
    padding: 75px 0 35px;
  }

  .portada-contenido,
  .publicaciones-encabezado {
    flex-direction: column;
    align-items: flex-start;
    gap: 25px;
  }

  .portada-contenido {
    margin-bottom: 65px;
  }

  .portada-pie {
    flex-direction: column;
    gap: 10px;
  }

  .destacado,
  .publicaciones {
    padding: 75px 0;
  }

  .destacado-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .destacado-imagen img {
    height: 400px;
  }

  .articulos-grid {
    grid-template-columns: 1fr;
  }

  .articulo-imagen img {
    height: 350px;
  }

  .cierre {
    padding: 80px 0;
  }
}

@media (max-width: 480px) {
  .portada h1 {
    font-size: 44px;
  }

  .articulo-imagen img {
    height: 300px;
  }
}
</style>
