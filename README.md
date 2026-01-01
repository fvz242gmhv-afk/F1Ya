# HCEMetterDPS - Página de Descarga

Página web de descarga para **HCEMetterDPS**, un medidor de DPS en tiempo real para Albion Online.

## 🚀 Características de la Web

- **Diseño Moderno**: Interfaz premium con gradientes, animaciones y efectos visuales
- **Responsive**: Adaptable a todos los dispositivos (móvil, tablet, desktop)
- **Animaciones Suaves**: Efectos de scroll, hover y transiciones fluidas
- **SEO Optimizado**: Meta tags y estructura semántica para mejor posicionamiento
- **Performance**: Optimizado para carga rápida

## 📁 Estructura del Proyecto

```
HCEMetterDPS-Website/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # JavaScript interactivo
├── game-screenshot.jpg # Imagen del juego
└── README.md          # Este archivo
```

## 🛠️ Cómo Usar

1. **Abrir localmente**: Simplemente abre `index.html` en tu navegador
2. **Servidor local**: Para mejor experiencia, usa un servidor local:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   ```
3. **Visita**: Abre `http://localhost:8000` en tu navegador

## 📝 Personalización

### Cambiar el enlace de descarga

En `script.js`, busca la línea:
```javascript
// TODO: Replace with actual download link
// window.location.href = 'path/to/your/download/file.zip';
```

Reemplázala con la ruta real de tu archivo:
```javascript
window.location.href = 'https://tu-servidor.com/HCEMetterDPS.zip';
```

### Actualizar versión

En `index.html`, busca:
```html
<p class="download-description">
    Versión 1.0.0 - Compatible con Windows 10/11
</p>
```

### Cambiar colores

En `styles.css`, modifica las variables CSS en `:root`:
```css
--primary-color: #667eea;
--secondary-color: #764ba2;
--accent-color: #f5576c;
```

## 🎨 Tecnologías Utilizadas

- **HTML5**: Estructura semántica
- **CSS3**: Diseño moderno con variables CSS, gradientes y animaciones
- **JavaScript**: Interactividad y efectos dinámicos
- **Google Fonts**: Tipografías Inter y Outfit

## 📱 Secciones de la Web

1. **Hero**: Presentación principal con imagen del juego
2. **Características**: 6 características principales del programa
3. **Cómo Funciona**: Guía de 3 pasos para usar el programa
4. **Descarga**: Sección con botón de descarga y detalles
5. **Footer**: Enlaces y información adicional

## 🚀 Próximos Pasos

- [ ] Subir el archivo ejecutable a un servidor
- [ ] Actualizar el enlace de descarga en `script.js`
- [ ] Considerar agregar capturas de pantalla del programa
- [ ] Agregar sección de FAQ (preguntas frecuentes)
- [ ] Implementar analytics para rastrear descargas

## 📄 Licencia

Este proyecto es de código abierto para la comunidad de Albion Online.

---

Desarrollado con ❤️ para la comunidad de Albion Online
