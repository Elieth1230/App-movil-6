# 🦯 ClearPath - Aplicación para Bastón Inteligente

Una aplicación móvil desarrollada con Apache Cordova para la gestión de bastones inteligentes y asistencia a personas con discapacidad visual.

## 🎯 Características Principales

### 🔊 Sistema de Accesibilidad TalkBack
- **TalkBack personalizado** con botón flotante de activación/desactivación
- **Lectura de voz** en español para todos los elementos de la interfaz
- **Anuncios automáticos** de navegación, acciones y estados
- **Optimizado para personas ciegas** con feedback completo de audio

### 👥 Gestión de Contactos
- **Agregar contactos** con información completa (nombre, teléfono, relación)
- **Llamadas directas** con integración al teléfono nativo
- **Eliminación de contactos** con confirmación por voz
- **Interfaz simplificada** para fácil acceso

### 🔐 Sistema de Autenticación
- **Login y registro** completo con validaciones
- **Gestión de sesiones** persistentes
- **Recuperación de contraseña** (funcional)
- **Verificación de términos y condiciones**

### 🗺️ Funciones de Ubicación
- **Integración con mapas** para navegación
- **Geolocalización** en tiempo real
- **Rutas y recorridos** guardados

## 🛠️ Tecnologías Utilizadas

- **Apache Cordova/PhoneGap** 14.0.1
- **HTML5**, **CSS3**, **JavaScript ES6**
- **Android SDK** 35 (compatible con Android 12+)
- **Web Speech API** para TalkBack personalizado
- **LocalStorage** para persistencia de datos
- **CSS Flexbox** para layouts responsivos

## 📱 Requisitos del Sistema

- **Android 12+** (API Level 31+)
- **Permisos**: 
  - `CALL_PHONE` - Para realizar llamadas
  - `ACCESS_FINE_LOCATION` - Para geolocalización
  - `INTERNET` - Para conectividad

## 🚀 Instalación y Desarrollo

### Prerrequisitos
```bash
# Instalar Node.js y npm
npm install -g cordova

# Configurar Android SDK
export ANDROID_HOME=/path/to/android-sdk
```

### Compilación
```bash
# Instalar dependencias
npm install

# Agregar plataforma Android
cordova platform add android

# Compilar para Android
cordova build android

# Ejecutar en dispositivo
cordova run android --device
```

## 🎨 Estructura del Proyecto

```
Proyecto6/
├── www/                    # Código fuente web
│   ├── css/
│   │   └── estilo.css     # Estilos principales
│   ├── js/
│   │   ├── talkback.js    # Sistema de accesibilidad
│   │   ├── contactos.js   # Gestión de contactos
│   │   ├── login.js       # Autenticación
│   │   └── index.js       # Lógica principal
│   ├── img/               # Recursos gráficos
│   ├── index.html         # Página principal
│   ├── login.html         # Sistema de login
│   └── splash.html        # Pantalla de inicio
├── config.xml             # Configuración Cordova
└── package.json          # Dependencias del proyecto
```

## ♿ Accesibilidad

Este proyecto está especialmente diseñado para personas con discapacidad visual:

- **Navegación por voz** completa
- **Descripciones detalladas** de todos los elementos
- **Feedback auditivo** para todas las acciones
- **Interfaz simplificada** y intuitiva
- **Compatible con TalkBack nativo** de Android

## 🔧 Características Técnicas

### Sistema TalkBack Personalizado
- Síntesis de voz en español
- Priorización de mensajes (errores = alta prioridad)
- Persistencia de configuración
- Integración con todas las páginas

### Gestión de Contactos
- CRUD completo (Crear, Leer, Actualizar, Eliminar)
- Validación de datos de entrada
- Integración con aplicación de teléfono nativa
- Almacenamiento local seguro

### Autenticación Robusta
- Validación en tiempo real
- Cifrado de contraseñas
- Gestión de sesiones con expiración
- Recuperación de cuenta

## 🤝 Contribución

Este proyecto está abierto a contribuciones para mejorar la accesibilidad y funcionalidad para personas con discapacidad visual.

## 📄 Licencia

Proyecto desarrollado con fines educativos y de accesibilidad.

## 👨‍💻 Autor

Desarrollado por el equipo CodeHive para mejorar la calidad de vida de personas con discapacidad visual.

---

**¿Necesitas ayuda?** Este proyecto incluye TalkBack personalizado - activa el botón en la esquina superior derecha para navegación por voz completa.
