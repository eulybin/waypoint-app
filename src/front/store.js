export const actionTypes = {
  TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE',
  OPEN_REPORT_MODAL: 'OPEN_REPORT_MODAL',
  CLOSE_REPORT_MODAL: 'CLOSE_REPORT_MODAL',
  OPEN_THANK_YOU_MODAL: 'OPEN_THANK_YOU_MODAL',
  CLOSE_THANK_YOU_MODAL: 'CLOSE_THANK_YOU_MODAL',
};

export const initialStore = () => {
  const localStorageDarkMode = localStorage.getItem('isDarkMode');

  return {
    isDarkMode: localStorageDarkMode ? JSON.parse(localStorageDarkMode) : false,
    showReportModal: false,
    showThankYouModal: false,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case actionTypes.TOGGLE_DARK_MODE:
      return { ...store, isDarkMode: !store.isDarkMode };

    case actionTypes.OPEN_REPORT_MODAL:
      return { ...store, showReportModal: true };

    case actionTypes.CLOSE_REPORT_MODAL:
      return { ...store, showReportModal: false };

    case actionTypes.OPEN_THANK_YOU_MODAL:
      return { ...store, showThankYouModal: true };

    case actionTypes.CLOSE_THANK_YOU_MODAL:
      return { ...store, showThankYouModal: false };

    default:
      throw Error('Unknown action.');
  }
}
