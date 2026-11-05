
<script setup>
import { Waves } from 'lucide-vue-next'
</script>

<template>
  <footer class="footer">
    <div class="container footer-content">

      <div class="footer-brand">
        <div class="brand">
          <Waves :size="30" />
          <strong>AVENIA</strong>
        </div>

        <p>
          Comprender es el principio de acompañar.
        </p>
      </div>

      <div class="footer-links">
        <h3>Explorar</h3>
        <RouterLink to="/">Inicio</RouterLink>
        <RouterLink to="/servicios">Servicios</RouterLink>
        <RouterLink to="/articulos">Artículos</RouterLink>
        <RouterLink to="/contacto">Contacto</RouterLink>
      </div>

      <div class="footer-contact">
        <h3>Atención</h3>
        <p>Centro de Atención Integral</p>
        <p>Información y solicitudes de citas</p>
      </div>

    </div>

    <div class="container footer-bottom">
      <span>© {{ new Date().getFullYear() }} AVENIA</span>
      <span>Centro de Atención Integral</span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #493847;
  color: #FCF9F6;
  padding: 65px 0 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr;
  gap: 50px;
  padding-bottom: 50px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #EAD9CD;
}

.brand strong {
  font-family: var(--font-heading);
  font-size: 34px;
  font-weight: 500;
  letter-spacing: 2px;
}

.footer-brand p {
  font-family: var(--font-heading);
  font-size: 23px;
  font-style: italic;
  line-height: 1.3;
}

.footer h3 {
  color: #EAD9CD;
  font-size: 13px;
  margin-bottom: 20px;
}

.footer-links a {
  display: block;
  color: #FCF9F6;
  text-decoration: none;
  margin-bottom: 13px;
  font-size: 13px;
}

.footer-contact p {
  font-size: 13px;
  line-height: 1.8;
}

.footer-bottom {
  border-top: 1px solid rgba(255,255,255,.2);
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #EAD9CD;
}

@media (max-width: 700px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 25px;
  }
}
</style>
