import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'

// Estilos globales de SIGCA — AVENIA
import './assets/styles/global.css'
import './style.css'

// Inicialización de la aplicación
const app = createApp(App)

// Configuración de navegación
app.use(router)

// Montaje de la aplicación
app.mount('#app')
