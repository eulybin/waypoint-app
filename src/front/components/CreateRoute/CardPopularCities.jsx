// ============================================================================
// CIUDADES MÁS VISITADAS POR PAÍS
// ============================================================================
export const POPULAR_CITIES_BY_COUNTRY = {
  'ES': [
    { name: 'Barcelona', lat: 41.3851, lon: 2.1734, image: 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=300&h=200&fit=crop' },
    { name: 'Madrid', lat: 40.4168, lon: -3.7038, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300&h=200&fit=crop' },
    { name: 'Sevilla', lat: 37.3891, lon: -5.9845, image: 'https://images.unsplash.com/photo-1688404808661-92f72f2ea258?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2676' },
    { name: 'Valencia', lat: 39.4699, lon: -0.3763, image: 'https://plus.unsplash.com/premium_photo-1697729423504-70c4c9d87033?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1738' },
  ],
  'FR': [
    { name: 'París', lat: 48.8566, lon: 2.3522, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=200&fit=crop' },
    { name: 'Lyon', lat: 45.7640, lon: 4.8357, image: 'https://images.unsplash.com/photo-1710635851336-82ede6083db9?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2340' },
    { name: 'Marsella', lat: 43.2965, lon: 5.3698, image: 'https://images.unsplash.com/photo-1739353190153-f857475cf242?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2340' },
    { name: 'Niza', lat: 43.7102, lon: 7.2620, image: 'https://images.unsplash.com/photo-1562450254-3c4225aa1bcd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1364' },
  ],
  'IT': [
    { name: 'Roma', lat: 41.9028, lon: 12.4964, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&h=200&fit=crop' },
    { name: 'Venecia', lat: 45.4408, lon: 12.3155, image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2340' },
    { name: 'Florencia', lat: 43.7696, lon: 11.2558, image: 'https://images.unsplash.com/photo-1476362174823-3a23f4aa6d76?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2340' },
    { name: 'Milán', lat: 45.4642, lon: 9.1900, image: 'https://images.unsplash.com/photo-1567760855784-589f09ed5dc6?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8bWlsYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900' },
  ],
  'US': [
    { name: 'Nueva York', lat: 40.7128, lon: -74.0060, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&h=200&fit=crop' },
    { name: 'Los Ángeles', lat: 34.0522, lon: -118.2437, image: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNpdWRhZHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900' },
    { name: 'Las Vegas', lat: 36.1699, lon: -115.1398, image: 'https://images.unsplash.com/photo-1581351721010-8cf859cb14a4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFzJTIwdmVnYXN8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900' },
    { name: 'San Francisco', lat: 37.7749, lon: -122.4194, image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=200&fit=crop' },
  ],
  'GB': [
    { name: 'Londres', lat: 51.5074, lon: -0.1278, image: 'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1365' },
    { name: 'Edimburgo', lat: 55.9533, lon: -3.1883, image: 'https://images.unsplash.com/photo-1571044880241-95d4c9aa06f5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8RURJTUJVUkdPfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=900' },
    { name: 'Manchester', lat: 53.4808, lon: -2.2426, image: 'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TUFOQ0hFU1RFUnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900' },
    { name: 'Liverpool', lat: 53.4084, lon: -2.9916, image: 'https://images.unsplash.com/photo-1726410238762-2388af04eadb?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2743' },
  ],
  'DE': [
    { name: 'Berlín', lat: 52.5200, lon: 13.4050, image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=300&h=200&fit=crop' },
    { name: 'Múnich', lat: 48.1351, lon: 11.5820, image: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=300&h=200&fit=crop' },
    { name: 'Hamburgo', lat: 53.5511, lon: 9.9937, image: 'https://images.unsplash.com/photo-1569150216991-aba1feb19ac5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2340' },
    { name: 'Frankfurt', lat: 50.1109, lon: 8.6821, image: 'https://images.unsplash.com/photo-1626447637943-4c9d412fa8cf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1974' },
  ],
  'MX': [
    { name: 'Ciudad de México', lat: 19.4326, lon: -99.1332, image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=300&h=200&fit=crop' },
    { name: 'Cancún', lat: 21.1619, lon: -86.8515, image: 'https://images.unsplash.com/photo-1630252452598-56d592ceec50?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2FuYyVDMyVCQW4lMkMlMjBtJUMzJUE5eGljb3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900' },
    { name: 'Guadalajara', lat: 20.6597, lon: -103.3496, image: 'https://images.unsplash.com/photo-1565670105658-ea35d27f7de7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8R1VBREFMQUpBUkF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900' },
    { name: 'Playa del Carmen', lat: 20.6296, lon: -87.0739, image: 'https://images.unsplash.com/photo-1635283270352-d820f3018d91?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8UExBWUElMjBERUwuJTIwQ0FSTUVOJTIwTUVYSUNPfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=900' },
  ],
  'JP': [
    { name: 'Tokio', lat: 35.6762, lon: 139.6503, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop' },
    { name: 'Kioto', lat: 35.0116, lon: 135.7681, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=200&fit=crop' },
    { name: 'Osaka', lat: 34.6937, lon: 135.5023, image: 'https://images.unsplash.com/photo-1491884592576-38221bd4314a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fE9TQUtBfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=900' },
    { name: 'Hiroshima', lat: 34.3853, lon: 132.4553, image: 'https://images.unsplash.com/photo-1589935525482-047064b3796c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1974' },
  ],
};