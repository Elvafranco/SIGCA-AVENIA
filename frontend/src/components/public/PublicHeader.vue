
<script setup>
import { Waves, ArrowUpRight } from 'lucide-vue-next'
</script>

<template>
  <header class="header">
    <div class="container header-inner">

      <RouterLink to="/" class="logo">
        <Waves :size="32" :stroke-width="1.5" />

        <div class="logo-text">
          <strong>AVENIA</strong>
          <span>CENTRO DE ATENCIÓN INTEGRAL</span>
        </div>
      </RouterLink>

      <nav class="nav">
        <RouterLink to="/">Inicio</RouterLink>
        <RouterLink to="/nosotros">Nosotros</RouterLink>
        <RouterLink to="/servicios">Servicios</RouterLink>
        <RouterLink to="/articulos">Artículos</RouterLink>
        <RouterLink to="/contacto">Contacto</RouterLink>
      </nav>

      <RouterLink to="/login" class="login">
        Acceso personal
        <ArrowUpRight :size="17" />
      </RouterLink>

    </div>
  </header>
</template>

<style scoped>
.header {
  background: #FCF9F6;
  border-bottom: 1px solid #EAD9CD;
}

.header-inner {
  min-height: 94px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #76566E;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-text strong {
  font-family: var(--font-heading);
  font-size: 29px;
  font-weight: 500;
  letter-spacing: 2px;
}

.logo-text span {
  font-size: 9px;
  letter-spacing: 1.2px;
}

.nav {
  display: flex;
  gap: 25px;
}

.nav a {
  font-family: var(--font-ui);
  font-size: 12px;
  text-decoration: none;
  color: #40333D;
}

.nav a:hover {
  color: #76566E;
}

.login {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #76566E;
  text-decoration: none;
  border-bottom: 1px solid #76566E;
  padding-bottom: 5px;
  white-space: nowrap;
}

@media (max-width: 900px) {
  .header-inner {
    flex-wrap: wrap;
    padding-top: 18px;
    padding-bottom: 18px;
  }

  .nav {
    order: 3;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 15px;
  }
}
</style>
