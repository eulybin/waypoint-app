// ============================================================================
// IMAGE IMPORTS
// ============================================================================
import sevillaImg from '../../assets/cities/sevilla.jpg';
import lyonImg from '../../assets/cities/lyon.jpg';
import marseilleImg from '../../assets/cities/marseille.jpg';
import florenceImg from '../../assets/cities/florence.jpg';
import lasVegasImg from '../../assets/cities/las vegas.jpg';
import edinburghImg from '../../assets/cities/edinburgh.jpg';
import manchesterImg from '../../assets/cities/manchester.jpg';
import liverpoolImg from '../../assets/cities/liverpool.jpg';
import hamburgImg from '../../assets/cities/hamburg.jpg';
import cancunImg from '../../assets/cities/cancun.jpg';
import guadalajaraImg from '../../assets/cities/guadalajara.jpg';
import playaDelCarmenImg from '../../assets/cities/playa del carmen.jpg';
import osakaImg from '../../assets/cities/osaka.jpg';
import hiroshimaImg from '../../assets/cities/hiroshima.jpg';

// ============================================================================
// MOST VISITED CITIES BY COUNTRY
// ============================================================================
export const POPULAR_CITIES_BY_COUNTRY = {
  'ES': [
    { name: 'Barcelona', lat: 41.3851, lon: 2.1734, image: 'https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=300&h=200&fit=crop' },
    { name: 'Madrid', lat: 40.4168, lon: -3.7038, image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=300&h=200&fit=crop' },
    { name: 'Seville', lat: 37.3891, lon: -5.9845, image: sevillaImg },
    { name: 'Valencia', lat: 39.4699, lon: -0.3763, image: 'https://images.unsplash.com/photo-1529437971227-3344caa48ce2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1740' },
  ],
  'FR': [
    { name: 'Paris', lat: 48.8566, lon: 2.3522, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=300&h=200&fit=crop' },
    { name: 'Lyon', lat: 45.7640, lon: 4.8357, image: lyonImg },
    { name: 'Marseille', lat: 43.2965, lon: 5.3698, image: marseilleImg },
    { name: 'Nice', lat: 43.7102, lon: 7.2620, image: 'https://images.unsplash.com/photo-1643914729809-4aa59fdc4c17?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1548' },
  ],
  'IT': [
    { name: 'Rome', lat: 41.9028, lon: 12.4964, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=300&h=200&fit=crop' },
    { name: 'Venice', lat: 45.4408, lon: 12.3155, image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300&h=200&fit=crop' },
    { name: 'Florence', lat: 43.7696, lon: 11.2558, image: florenceImg },
    { name: 'Milan', lat: 45.4642, lon: 9.1900, image: 'https://images.unsplash.com/photo-1610016302534-6f67f1c968d8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1075' },
  ],
  'US': [
    { name: 'New York', lat: 40.7128, lon: -74.0060, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=300&h=200&fit=crop' },
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, image: 'https://images.unsplash.com/photo-1544413526-87d1ea5ccc41?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bG9zJTIwYW5nZWxlcyUyMGNpdHl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=900' },
    { name: 'Las Vegas', lat: 36.1699, lon: -115.1398, image: lasVegasImg },
    { name: 'San Francisco', lat: 37.7749, lon: -122.4194, image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=200&fit=crop' },
  ],
  'GB': [
    { name: 'London', lat: 51.5074, lon: -0.1278, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300&h=200&fit=crop' },
    { name: 'Edinburgh', lat: 55.9533, lon: -3.1883, image: edinburghImg },
    { name: 'Manchester', lat: 53.4808, lon: -2.2426, image: manchesterImg },
    { name: 'Liverpool', lat: 53.4084, lon: -2.9916, image: liverpoolImg },
  ],
  'DE': [
    { name: 'Berlin', lat: 52.5200, lon: 13.4050, image: 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=300&h=200&fit=crop' },
    { name: 'Munich', lat: 48.1351, lon: 11.5820, image: 'https://images.unsplash.com/photo-1595867818082-083862f3d630?w=300&h=200&fit=crop' },
    { name: 'Hamburg', lat: 53.5511, lon: 9.9937, image: hamburgImg },
    { name: 'Frankfurt', lat: 50.1109, lon: 8.6821, image: 'https://images.unsplash.com/photo-1650024001493-1c060d666102?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZnJhbmtmdXJ0JTIwZ2VybWFueXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=900' },
  ],
  'MX': [
    { name: 'Mexico City', lat: 19.4326, lon: -99.1332, image: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=300&h=200&fit=crop' },
    { name: 'Cancun', lat: 21.1619, lon: -86.8515, image: cancunImg },
    { name: 'Guadalajara', lat: 20.6597, lon: -103.3496, image: guadalajaraImg },
    { name: 'Playa del Carmen', lat: 20.6296, lon: -87.0739, image: playaDelCarmenImg },
  ],
  'JP': [
    { name: 'Tokyo', lat: 35.6762, lon: 139.6503, image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=300&h=200&fit=crop' },
    { name: 'Kyoto', lat: 35.0116, lon: 135.7681, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=300&h=200&fit=crop' },
    { name: 'Osaka', lat: 34.6937, lon: 135.5023, image: osakaImg },
    { name: 'Hiroshima', lat: 34.3853, lon: 132.4553, image: hiroshimaImg },
  ],
};