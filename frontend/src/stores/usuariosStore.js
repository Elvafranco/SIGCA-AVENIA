import { ref, computed, watch } from 'vue'

const CLAVE_USUARIOS = 'sigca_avenia_usuarios'

function cargarUsuarios() {
  try {
    const datos = JSON.parse(
      localStorage.getItem(CLAVE_USUARIOS) || '[]'
    )
    return Array.isArray(datos) ? datos : []
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
    return []
  }
}

const usuarios = ref(cargarUsuarios())

watch(
  usuarios,
  datos => {
    localStorage.setItem(
      CLAVE_USUARIOS,
      JSON.stringify(datos)
    )
  },
  { deep: true }
)

function siguienteId() {
  const numeros = usuarios.value
    .map(usuario =>
      Number(String(usuario.id).replace('USR-', ''))
    )
    .filter(numero => Number.isInteger(numero) && numero > 0)

  const siguiente = Math.max(0, ...numeros) + 1

  return `USR-${String(siguiente).padStart(4, '0')}`
}

function registrarUsuario(datos) {
  const nombre = String(datos.nombre || '').trim()
  const correo = String(datos.correo || '').trim().toLowerCase()
  const rol = String(datos.rol || '').toUpperCase()

  if (!nombre || !correo) {
    return {
      ok: false,
      mensaje: 'Complete el nombre y correo electrónico.'
    }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return {
      ok: false,
      mensaje: 'Ingrese un correo electrónico válido.'
    }
  }

  if (!['ADMINISTRADOR', 'RECEPCIONISTA'].includes(rol)) {
    return {
      ok: false,
      mensaje: 'Seleccione un rol válido.'
    }
  }

  if (usuarios.value.some(usuario => usuario.correo === correo)) {
    return {
      ok: false,
      mensaje: 'Ya existe un usuario con ese correo.'
    }
  }

  const usuario = {
    id: siguienteId(),
    nombre,
    correo,
    rol,
    estado: 'ACTIVO',
    fechaRegistro: new Date().toISOString()
  }

  usuarios.value.push(usuario)

  return {
    ok: true,
    mensaje: 'Usuario registrado correctamente.',
    usuario
  }
}

function editarUsuario(id, datos) {
  const usuario = usuarios.value.find(
    item => item.id === String(id)
  )

  if (!usuario) {
    return { ok: false, mensaje: 'El usuario no existe.' }
  }

  const nombre = String(datos.nombre || '').trim()
  const correo = String(datos.correo || '').trim().toLowerCase()
  const rol = String(datos.rol || '').toUpperCase()

  if (!nombre || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return { ok: false, mensaje: 'Revise el nombre y correo.' }
  }

  if (!['ADMINISTRADOR', 'RECEPCIONISTA'].includes(rol)) {
    return { ok: false, mensaje: 'El rol no es válido.' }
  }

  if (usuarios.value.some(
    item => item.id !== usuario.id && item.correo === correo
  )) {
    return { ok: false, mensaje: 'El correo ya está registrado.' }
  }

  usuario.nombre = nombre
  usuario.correo = correo
  usuario.rol = rol

  return {
    ok: true,
    mensaje: 'Usuario actualizado correctamente.',
    usuario
  }
}

function cambiarEstadoUsuario(id) {
  const usuario = usuarios.value.find(
    item => item.id === String(id)
  )

  if (!usuario) {
    return { ok: false, mensaje: 'El usuario no existe.' }
  }

  usuario.estado =
    usuario.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'

  return {
    ok: true,
    mensaje: `Usuario ${usuario.estado.toLowerCase()} correctamente.`,
    usuario
  }
}

export function useUsuariosStore() {
  const usuariosActivos = computed(() =>
    usuarios.value.filter(usuario => usuario.estado === 'ACTIVO')
  )

  const administradores = computed(() =>
    usuarios.value.filter(usuario => usuario.rol === 'ADMINISTRADOR')
  )

  return {
    usuarios,
    usuariosActivos,
    administradores,
    registrarUsuario,
    editarUsuario,
    cambiarEstadoUsuario
  }
}
