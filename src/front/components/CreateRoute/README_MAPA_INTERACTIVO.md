# 🗺️ Mapa Interactivo - CreateRoute

## ✨ Nueva Funcionalidad Implementada

Se ha agregado un **mapa interactivo** a la página de creación de rutas (`CreateRoute.jsx`) que permite a los usuarios seleccionar POIs (Puntos de Interés) directamente desde el mapa en lugar de usar solo las cards.

---

## 🎯 Características Principales

### 1. **Toggle Vista Mapa / Lista**

- Botones para cambiar entre vista de mapa y vista de grid de cards
- Vista por defecto: **Mapa**
- Permite filtrar y buscar en ambas vistas

### 2. **Mapa Interactivo con Leaflet**

- Componente: `CreateRouteMap.jsx`
- Tecnologías:
  - **React Leaflet** - Integración de Leaflet con React
  - **MarkerClusterGroup** - Agrupación inteligente de markers
  - **OpenStreetMap** - Tiles del mapa

### 3. **Markers Personalizados por Categoría**

- Cada tipo de POI tiene su propio emoji:
  - 🍴 Restaurantes → 🍽️ (seleccionado)
  - ☕ Cafés
  - 🍺 Bares → 🍻 (seleccionado)
  - 🏛️ Museos
  - 🌲 Parques → 🌳 (seleccionado)
  - 🗿 Monumentos → 🗽 (seleccionado)
  - ⛪ Iglesias
  - 🏨 Hoteles
  - 🎯 Atracciones → ⭐ (seleccionado)
  - 🔭 Miradores → 👁️ (seleccionado)

### 4. **Clusters Inteligentes**

- Agrupa markers cercanos automáticamente
- Muestra el número de POIs en cada cluster
- Color naranja corporativo (`#fd7e14`)
- Click en cluster → expande los markers

### 5. **Línea de Ruta**

- Conecta POIs seleccionados en orden
- Línea discontinua naranja
- Se actualiza en tiempo real al agregar/quitar POIs

### 6. **Popups Interactivos**

- Nombre del POI
- Tipo (badge)
- Dirección (si está disponible)
- Botón para agregar/quitar de la ruta
- Estado visual (verde si está seleccionado)

### 7. **Overlay de Información**

- Esquina superior derecha del mapa
- Muestra:
  - Total de POIs disponibles
  - Número de POIs seleccionados
  - Icono visual

---

## 📂 Archivos Modificados/Creados

### **Nuevos Archivos:**

1. **`src/front/components/CreateRoute/CreateRouteMap.jsx`**
   - Componente principal del mapa
   - 219 líneas
   - Incluye markers, clusters, popups y polylines

2. **`src/front/components/CreateRoute/CreateRouteMap.css`**
   - Estilos personalizados para el mapa
   - Animaciones
   - Responsive design
   - Dark mode support

### **Archivos Modificados:**

1. **`src/front/pages/CreateRoute.jsx`**
   - Agregados imports de `Map` y `LayoutGrid` de lucide-react
   - Nuevo estado: `mapCenter` y `viewMode`
   - Nueva función: `handleMapPOIClick()`
   - Toggle de vista mapa/grid
   - Integración del componente `CreateRouteMap`

2. **`package.json`** (dependencia instalada)
   - `react-leaflet-cluster: ^1.2.2`

---

## 🚀 Cómo Funciona

### **Flujo de Usuario:**

1. **Seleccionar País** → Carga ciudades
2. **Seleccionar Ciudad** → El mapa se centra automáticamente
3. **Seleccionar Categoría** (ej: Restaurantes) → Mapa muestra todos los restaurantes como markers
4. **Click en Marker del Mapa** → POI se agrega a la lista (marker cambia de color)
5. **Click nuevamente** → POI se quita de la lista
6. **Vista Lista** → Puede cambiar a grid de cards tradicional
7. **Submit** → Crea la ruta con los POIs seleccionados

### **Handlers Principales:**

```javascript
// Centra el mapa al seleccionar ciudad
const handleSelectCity = (city) => {
  setMapCenter([city.lat, city.lon]);
  // ...
};

// Toggle de selección desde el mapa
const handleMapPOIClick = (poi) => {
  const isSelected = formState.points_of_interest.some((p) => p.id === poi.id);

  if (isSelected) {
    handleRemovePOI(poi.id);
  } else {
    handleAddPOI(poi);
  }
};
```

---

## 🎨 Personalización

### **Cambiar Altura del Mapa:**

```javascript
// CreateRouteMap.jsx - línea 91
style={{ height: "600px", width: "100%" }}
```

### **Cambiar Zoom Inicial:**

```javascript
// CreateRouteMap.jsx - línea 92
zoom={13}  // Valores: 1 (mundo) a 18 (calle)
```

### **Deshabilitar Línea de Ruta:**

```javascript
// CreateRoute.jsx - donde se renderiza CreateRouteMap
<CreateRouteMap
  showRoute={false} // Cambia a false
  // ...
/>
```

### **Cambiar Color de Cluster:**

```javascript
// CreateRouteMap.jsx - línea 110
background-color: #fd7e14;  // Cambia este color
```

### **Radio de Clustering:**

```javascript
// CreateRouteMap.jsx - línea 107
maxClusterRadius={50}  // Valores: 10-100
```

---

## 📱 Responsive Design

- **Desktop:** Mapa de 600px de altura
- **Tablet:** Controles ajustados
- **Mobile:** Markers más pequeños (24px), controles optimizados

---

## 🌙 Dark Mode

El mapa tiene soporte completo para dark mode:

- Popups con fondo oscuro
- Texto adaptado
- Controles legibles

---

## 🐛 Troubleshooting

### **Problema: Markers no aparecen**

**Solución:** Asegúrate de que Leaflet CSS esté importado:

```javascript
import "leaflet/dist/leaflet.css";
```

### **Problema: Error de iconos por defecto**

**Solución:** El componente incluye un fix automático:

```javascript
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  /* ... */
});
```

### **Problema: Mapa no se centra en la ciudad**

**Solución:** Verifica que `mapCenter` tenga valores válidos:

```javascript
const mapCenter =
  center && center[0] && center[1] ? center : [40.4168, -3.7038];
```

---

## 🔄 Próximas Mejoras (Opcionales)

- [ ] Drag & drop markers para reordenar ruta
- [ ] Cálculo de distancia total de la ruta
- [ ] Exportar ruta a GPX/KML
- [ ] Street View integration
- [ ] Geocoding inverso (click en mapa → agregar POI custom)
- [ ] Filtros avanzados en el mapa
- [ ] Comparar múltiples rutas

---

## 👨‍💻 Autor

Implementado por el equipo de desarrollo de Waypoint App
Fecha: Octubre 2025

---

## 📚 Documentación Adicional

- [React Leaflet](https://react-leaflet.js.org/)
- [Leaflet](https://leafletjs.com/)
- [React Leaflet Cluster](https://github.com/yuzhva/react-leaflet-cluster)
- [OpenStreetMap](https://www.openstreetmap.org/)
