import { createRouter, createWebHistory } from 'vue-router'

// Diseños principales
import PublicLayout from '../layouts/PublicLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

// Portal público
import InicioView from '../views/public/InicioView.vue'
import NosotrosView from '../views/public/NosotrosView.vue'
import ServiciosView from '../views/public/ServiciosView.vue'
import ArticulosView from '../views/public/ArticulosView.vue'
import ContactoView from '../views/public/ContactoView.vue'

// Acceso
import LoginView from '../views/auth/LoginView.vue'

// Administración
import DashboardView from '../views/admin/DashboardView.vue'
import PacientesView from '../views/admin/PacientesView.vue'
import CitasView from '../views/admin/CitasView.vue'
import ServiciosAdminView from '../views/admin/ServiciosAdminView.vue'
import MaterialesAdminView from '../views/admin/MaterialesAdminView.vue'
import PagosView from '../views/admin/PagosView.vue'
import CajaDiariaView from '../views/admin/CajaDiariaView.vue'
import UsuariosView from '../views/admin/UsuariosView.vue'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      {
        path: '',
        name: 'inicio',
        component: InicioView
      },
      {
        path: 'nosotros',
        name: 'nosotros',
        component: NosotrosView
      },
      {
        path: 'servicios',
        name: 'servicios',
        component: ServiciosView
      },
      {
        path: 'articulos',
        name: 'articulos',
        component: ArticulosView
      },
      {
        path: 'contacto',
        name: 'contacto',
        component: ContactoView
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: DashboardView
      },
      {
        path: 'pacientes',
        name: 'admin-pacientes',
        component: PacientesView
      },
      {
        path: 'citas',
        name: 'admin-citas',
        component: CitasView
      },
      {
        path: 'servicios',
        name: 'admin-servicios',
        component: ServiciosAdminView
      },
      {
        path: 'materiales',
        name: 'admin-materiales',
        component: MaterialesAdminView
      },
      {
        path: 'pagos',
        name: 'admin-pagos',
        component: PagosView
      },
      {
        path: 'caja',
        name: 'admin-caja',
        component: CajaDiariaView
      },
      {
        path: 'usuarios',
        name: 'admin-usuarios',
        component: UsuariosView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
