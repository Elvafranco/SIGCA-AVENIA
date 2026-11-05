<script setup>
import { ref, computed } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import {
  LayoutDashboard,
  UsersRound,
  CalendarDays,
  ClipboardList,
  Package,
  Wallet,
  Receipt,
  UserCog,
  FileBarChart,
  Menu,
  X,
  ChevronRight,
  LogOut,
  ExternalLink,
  Waves
} from 'lucide-vue-next'

const route = useRoute()
const menuAbierto = ref(false)

const opciones = [
  {
    titulo: 'Dashboard',
    ruta: '/admin',
    icono: LayoutDashboard
  },
  {
    titulo: 'Pacientes',
    ruta: '/admin/pacientes',
    icono: UsersRound
  },
  {
    titulo: 'Citas',
    ruta: '/admin/citas',
    icono: CalendarDays
  },
  {
    titulo: 'Servicios',
    ruta: '/admin/servicios',
    icono: ClipboardList
  },
  {
    titulo: 'Materiales',
    ruta: '/admin/materiales',
    icono: Package
  },
  {
    titulo: 'Pagos y saldos',
    ruta: '/admin/pagos',
    icono: Wallet
  },
  {
    titulo: 'Caja diaria',
    ruta: '/admin/caja',
    icono: Receipt
  },
  {
    titulo: 'Usuarios',
    ruta: '/admin/usuarios',
    icono: UserCog
  },
  {
    titulo: 'Reportes',
    ruta: '/admin/reportes',
    icono: FileBarChart
  }
]

const tituloActual = computed(() => {
  const opcion = opciones.find(
    item => item.ruta === route.path
  )

  return opcion?.titulo || 'Panel administrativo'
})

function cerrarMenu() {
  menuAbierto.value = false
}
</script>

<template>
  <div class="admin-layout">

    <!-- MENÚ LATERAL -->
    <aside
      class="sidebar"
      :class="{ 'sidebar-abierto': menuAbierto }"
    >
      <div class="sidebar-marca">
        <div class="marca-icono">
          <Waves :size="25" :stroke-width="1.5" />
        </div>

        <div class="marca-texto">
          <strong>AVENIA</strong>
          <span>SIGCA / ADMINISTRACIÓN</span>
        </div>

        <button
          class="cerrar-menu"
          type="button"
          aria-label="Cerrar menú"
          @click="cerrarMenu"
        >
          <X :size="21" />
        </button>
      </div>

      <div class="sidebar-contenido">
        <p class="menu-etiqueta">ESPACIO DE TRABAJO</p>

        <nav class="menu-navegacion" aria-label="Menú administrativo">
          <RouterLink
            v-for="opcion in opciones"
            :key="opcion.ruta"
            :to="opcion.ruta"
            class="menu-enlace"
            :class="{ activo: route.path === opcion.ruta }"
            @click="cerrarMenu"
          >
            <component
              :is="opcion.icono"
              :size="19"
              :stroke-width="1.7"
            />

            <span>{{ opcion.titulo }}</span>

            <ChevronRight
              v-if="route.path === opcion.ruta"
              :size="15"
              class="menu-flecha"
            />
          </RouterLink>
        </nav>
      </div>

      <div class="sidebar-inferior">
        <RouterLink
          to="/"
          class="enlace-portal"
          @click="cerrarMenu"
        >
          <ExternalLink :size="17" />
          <span>Ver portal público</span>
        </RouterLink>

        <div class="sidebar-usuario">
          <div class="usuario-avatar">A</div>

          <div class="usuario-datos">
            <strong>Administración</strong>
            <span>Acceso de demostración</span>
          </div>

          <RouterLink
            to="/login"
            class="salir-enlace"
            aria-label="Ir a inicio de sesión"
          >
            <LogOut :size="18" />
          </RouterLink>
        </div>
      </div>
    </aside>

    <!-- FONDO PARA MENÚ MÓVIL -->
    <button
      v-if="menuAbierto"
      class="menu-overlay"
      type="button"
      aria-label="Cerrar menú"
      @click="cerrarMenu"
    ></button>

    <!-- CONTENIDO PRINCIPAL -->
    <div class="admin-principal">

      <header class="admin-header">
        <div class="header-izquierda">
          <button
            class="abrir-menu"
            type="button"
            aria-label="Abrir menú"
            @click="menuAbierto = true"
          >
            <Menu :size="23" />
          </button>

          <div class="header-titulos">
            <span>SIGCA / AVENIA</span>
            <h1>{{ tituloActual }}</h1>
          </div>
        </div>

        <div class="header-derecha">
          <span class="header-entorno">
            ENTORNO ADMINISTRATIVO
          </span>

          <div class="header-avatar">A</div>
        </div>
      </header>

      <main class="admin-contenido">
        <RouterView />
      </main>

      <footer class="admin-footer">
        <span>© 2026 AVENIA</span>
        <span>Sistema Integral de Gestión de Citas y Atención</span>
      </footer>

    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  --admin-primary: #76566E;
  --admin-primary-soft: #B99CAB;
  --admin-champagne: #EAD9CD;
  --admin-ivory: #FCF9F6;
  --admin-text: #40333D;

  display: flex;
  min-height: 100vh;
  background: #F8F5F3;
  color: var(--admin-text);
  font-family: var(--font-body, 'DM Sans', sans-serif);
}

/* MENÚ LATERAL */

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  width: 265px;
  background: #FFFFFF;
  border-right: 1px solid #EDE4E8;
}

.sidebar-marca {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 92px;
  padding: 22px;
  border-bottom: 1px solid #F0E9EC;
}

.marca-icono {
  display: grid;
  place-items: center;
  width: 43px;
  height: 43px;
  flex-shrink: 0;
  background: #76566E;
  color: #FFFFFF;
  border-radius: 12px;
}

.marca-texto {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.marca-texto strong {
  color: #76566E;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 25px;
  font-weight: 500;
  letter-spacing: 1px;
}

.marca-texto span {
  color: #9B8594;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
}

.sidebar-contenido {
  flex: 1;
  overflow-y: auto;
  padding: 28px 14px;
}

.menu-etiqueta {
  margin: 0 12px 18px;
  color: #A58F9E;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.menu-navegacion {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.menu-enlace {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 46px;
  padding: 0 14px;
  color: #71636D;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  border-radius: 9px;
  transition: background 0.2s, color 0.2s;
}

.menu-enlace:hover {
  background: #F8F2F5;
  color: #76566E;
}

.menu-enlace.activo {
  background: #F2E8EE;
  color: #76566E;
  font-weight: 700;
}

.menu-flecha {
  margin-left: auto;
}

.sidebar-inferior {
  padding: 15px;
  border-top: 1px solid #F0E9EC;
}

.enlace-portal {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 13px;
  color: #76566E;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
}

.enlace-portal:hover {
  background: #F8F2F5;
  border-radius: 8px;
}

.sidebar-usuario {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
  padding: 15px 8px 5px;
  border-top: 1px solid #F0E9EC;
}

.usuario-avatar,
.header-avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: #EAD9CD;
  color: #76566E;
  border-radius: 50%;
  font-weight: 700;
}

.usuario-datos {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.usuario-datos strong {
  font-size: 12px;
  color: #40333D;
}

.usuario-datos span {
  font-size: 10px;
  color: #9B8594;
}

.salir-enlace {
  color: #76566E;
  padding: 5px;
}

.cerrar-menu,
.abrir-menu {
  display: none;
}

/* ÁREA PRINCIPAL */

.admin-principal {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 100vh;
  margin-left: 265px;
}

.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 92px;
  padding: 18px 35px;
  background: #FFFFFF;
  border-bottom: 1px solid #EDE4E8;
}

.header-izquierda,
.header-derecha {
  display: flex;
  align-items: center;
  gap: 18px;
}

.header-titulos span {
  color: #A58F9E;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.header-titulos h1 {
  margin: 6px 0 0;
  color: #40333D;
  font-family: var(--font-heading, Georgia, serif);
  font-size: 30px;
  font-weight: 500;
}

.header-entorno {
  color: #9B8594;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

.admin-contenido {
  flex: 1;
  width: 100%;
  padding: 35px;
}

.admin-footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 35px;
  border-top: 1px solid #EDE4E8;
  color: #A58F9E;
  font-size: 11px;
}

/* TABLET */

@media (max-width: 1100px) {
  .sidebar {
    width: 230px;
  }

  .admin-principal {
    margin-left: 230px;
  }

  .admin-header,
  .admin-contenido {
    padding-left: 24px;
    padding-right: 24px;
  }
}

/* MÓVIL */

@media (max-width: 768px) {
  .sidebar {
    width: 270px;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
  }

  .sidebar.sidebar-abierto {
    transform: translateX(0);
  }

  .menu-overlay {
    position: fixed;
    inset: 0;
    z-index: 90;
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    background: rgba(40, 30, 38, 0.45);
    cursor: pointer;
  }

  .cerrar-menu,
  .abrir-menu {
    display: grid;
    place-items: center;
    border: none;
    background: transparent;
    color: #76566E;
    cursor: pointer;
  }

  .cerrar-menu {
    margin-left: auto;
  }

  .admin-principal {
    margin-left: 0;
  }

  .admin-header {
    min-height: 75px;
    padding: 15px 20px;
  }

  .header-titulos h1 {
    font-size: 25px;
  }

  .header-entorno {
    display: none;
  }

  .admin-contenido {
    padding: 20px;
  }

  .admin-footer {
    flex-direction: column;
    gap: 8px;
    padding: 20px;
  }
}
</style>
