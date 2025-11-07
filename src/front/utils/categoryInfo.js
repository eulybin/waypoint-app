// Mapeo de categorías a nombres legibles (singular - for popups)
export const CATEGORY_NAMES = {
  attraction: 'Attraction',
  museum: 'Museum',
  restaurant: 'Restaurant',
  cafe: 'Café',
  bar: 'Bar',
  park: 'Park',
  monument: 'Monument',
  church: 'Church',
  hotel: 'Hotel',
  lookouts: 'Lookout',
  viewpoint: 'Viewpoint',
};

// Mapeo de categorías a nombres legibles (plural - for loading/lists)
export const CATEGORY_NAMES_PLURAL = {
  attraction: 'Attractions',
  museum: 'Museums',
  restaurant: 'Restaurants',
  cafe: 'Cafés',
  bar: 'Bars',
  park: 'Parks',
  monument: 'Monuments',
  church: 'Churches',
  hotel: 'Hotels',
  lookouts: 'Lookouts',
  viewpoint: 'Viewpoints',
};

// Mapeo de categorías a colores (Bootstrap classes and hex values)
export const CATEGORY_COLORS = {
  attraction: { class: 'primary', hex: '#0d6efd' },
  museum: { class: 'info', hex: '#0dcaf0' },
  restaurant: { class: 'danger', hex: '#dc3545' },
  cafe: { class: 'warning', hex: '#ffc107' },
  bar: { class: 'success', hex: '#198754' },
  park: { class: 'success', hex: '#198754' },
  monument: { class: 'secondary', hex: '#6c757d' },
  church: { class: 'info', hex: '#0dcaf0' },
  hotel: { class: 'primary', hex: '#0d6efd' },
  viewpoint: { class: 'success', hex: '#198754' },
  lookouts: { class: 'success', hex: '#198754' },
};

// Helper function to get POI color (Bootstrap class)
export const getPOIColor = (type) => {
  return CATEGORY_COLORS[type]?.class || 'primary';
};

// Helper function to get POI hex color
export const getPOIHexColor = (type) => {
  return CATEGORY_COLORS[type]?.hex || '#0d6efd';
};
