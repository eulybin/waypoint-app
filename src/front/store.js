export const actionTypes = {
  TOGGLE_DARK_MODE: 'TOGGLE_DARK_MODE',
};

export const initialStore = () => {
  const localStorageDarkMode = localStorage.getItem('isDarkMode');

  return {
    isDarkMode: localStorageDarkMode ? JSON.parse(localStorageDarkMode) : false,
    // TEMPORARY SOLUTION to component render based on whether a user has logged in or not
    userIsLoggedIn: false,
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case actionTypes.TOGGLE_DARK_MODE:
      return { ...store, isDarkMode: !store.isDarkMode };

    default:
      throw Error('Unknown action.');
  }
}
