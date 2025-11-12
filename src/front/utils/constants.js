//----------- ICONS -----------

export const NAVBAR_LOGO_SIZE = '48';

export const HEADER_ICON_SIZE = 54;

export const SETTINGS_ICON_SIZE = 30;

export const SEARCH_ICON_SIZE = 28;

export const NAVBAR_ICON_SIZE = 24;

export const CLOSE_WEATHER_ICON_SIZE = 21;

export const STANDARD_ICON_SIZE = 20;

export const HIDE_OR_SHOW_PASSWORD_ICON_SIZE = 18;

export const WEATHER_ICON_SIZE = 16;

export const FOOTER_ICON_SIZE = 14;

export const FORGOT_PASS_HEADER_ICON_SIZE = 40;

export const CHECKMARK_HEADER_ICON_SIZE = 56;

export const RESET_PASSWORD_HEADER_ICON_DIV_SIZE = {
  width: '80px',
  height: '80px',
  borderColor: 'var(--app-border-accent) !important',
};

export const INPUT_ICON_POSITION = {
  left: '12px',
  top: '12px',
  zIndex: 5,
  pointerEvents: 'none',
};

//----------- DIV SIZES -----------

export const NAVBAR_WIDTH = '250px';

export const WEATHER_WIDGET_WIDTH = '320px';

export const NAVBAR_CHILD_DIV_WIDTH = '220px';

export const AUTH_FORM_WIDTH = '450px';

export const SEARCH_BAR_MAX_WIDTH = '600px';

export const MAP_HEIGHT = '600px';

export const DROPDOWN_MAX_HEIGHT = '300px';

export const POI_CARD_IMAGE_HEIGHT = '180px';

export const SUGGESTION_ITEM_IMAGE_HEIGHT = '120px';

export const PROFILE_CARD_MAX_WIDTH = '600px';

export const ROUTE_CARD_IMAGE_HEIGHT = '150px';

export const TRENDING_CARD_IMAGE_HEIGHT = '120px';

export const POI_CARD_CONTENT_HEIGHT = '200px';

export const POI_PREVIEW_IMAGE_HEIGHT = '100px';

export const CLOSE_BUTTON_SIZE = '32px';

//----------- SPACING -----------

export const POPUP_MIN_WIDTH = '220px';

export const PAGINATION_MIN_WIDTH = '40px';

//----------- BORDER RADIUS -----------

export const BORDER_RADIUS_SM = '8px';

export const BORDER_RADIUS_MD = '12px';

export const BORDER_RADIUS_LG = '15px';

export const BORDER_RADIUS_CIRCLE = '50%';

//----------- MARKER SIZES -----------

export const MARKER_ICON_SIZE = 36;

export const MARKER_ICON_SIZE_SELECTED = 40;

export const ROUTE_POINT_SIZE = 20;

export const CLUSTER_SIZE = 40;

//----------- FONT SIZES -----------

export const CREATE_ROUTE_FONT_SIZE = '1.1rem';

export const NOT_FOUND_FONT_SIZE = '7rem';

export const POI_CATEGORY_BADGE_FONT_SIZE = '0.7rem';

export const POI_DESCRIPTION_FONT_SIZE = '0.8rem';

export const POI_NAME_FONT_SIZE = '0.95rem';

export const ROUTE_POINT_NUMBER_FONT_SIZE = '12px';

//----------- BACKGROUNDS -----------

export const MODAL_BACKGROUND = 'rgba(0,0,0,0.5)';

//----------- Z-INDEX ----------------

export const NAVBAR_Z_INDEX = 1000;

export const WEATHER_WIDGET_Z_INDEX = 1100;

//----------- PAGINATION ----------------

export const ITEMS_PER_PAGE = 8;

//----------- IMAGES ----------------

export const WEATHER_WIDGET_OPACITY = 0.9;

// CONSTANTE PARA OMITIR LAS TILDES Y MAYÚSCULAS/ MINÚSCULAS EN STRINGS

export const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD') // Descomponer caracteres con tildes
    .replace(/[\u0300-\u036f]/g, ''); // Eliminar marcas diacríticas (tildes)
};

// CONSTANTE PARA PAGINACION

export const goToNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};

export const goToPrevPage = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }
};

export const goToPage = (pageNumber) => {
  setCurrentPage(pageNumber);
};
