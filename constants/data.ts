export interface Destination {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: any;
  distance: string;
  distanceKm: number;
  duration: string;
  basePrice: number;
  pricePerKm: number;
  rating: number;
  reviewCount: number;
  highlights: string[];
  popular: boolean;
  latitude: number;
  longitude: number;
}

export interface PickupLocation {
  id: string;
  name: string;
  area: string;
  latitude: number;
  longitude: number;
}

export const popularPickupLocations: PickupLocation[] = [
  { id: "p1", name: "Hazratganj", area: "Central Lucknow", latitude: 26.8500, longitude: 80.9430 },
  { id: "p2", name: "Gomti Nagar", area: "East Lucknow", latitude: 26.8560, longitude: 80.9820 },
  { id: "p3", name: "Aliganj", area: "North Lucknow", latitude: 26.8800, longitude: 80.9300 },
  { id: "p4", name: "Alambagh", area: "South Lucknow", latitude: 26.8100, longitude: 80.9100 },
  { id: "p5", name: "Charbagh Railway Station", area: "Central Lucknow", latitude: 26.8356, longitude: 80.9189 },
  { id: "p6", name: "Amausi Airport", area: "Lucknow Airport", latitude: 26.7606, longitude: 80.8893 },
  { id: "p7", name: "Indira Nagar", area: "East Lucknow", latitude: 26.8700, longitude: 80.9900 },
  { id: "p8", name: "Mahanagar", area: "Central Lucknow", latitude: 26.8700, longitude: 80.9350 },
  { id: "p9", name: "Rajajipuram", area: "West Lucknow", latitude: 26.8550, longitude: 80.9050 },
  { id: "p10", name: "Chinhat", area: "East Lucknow", latitude: 26.8800, longitude: 81.0200 },
];

export interface BookingData {
  id: string;
  userId: string;
  destinationId: string;
  destinationName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  vehicleType: "sedan" | "suv" | "luxury";
  passengers: number;
  fare: number;
  driverName?: string;
  driverPhone?: string;
  pickupLocation: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "driver" | "admin";
  walletBalance: number;
  totalTrips: number;
  memberSince: string;
}

export interface DriverData extends UserData {
  vehicle: string;
  vehicleNumber: string;
  rating: number;
  isAvailable: boolean;
  kycStatus: "pending" | "submitted" | "approved" | "rejected";
  totalEarnings: number;
  todayEarnings: number;
  completedTrips: number;
}

export const destinations: Destination[] = [
  {
    id: "1",
    name: "Ayodhya",
    tagline: "City of Lord Ram",
    description:
      "Ayodhya, the birthplace of Lord Ram, is a city of immense spiritual significance. Visit the grand Ram Mandir, explore ancient temples, and experience the divine evening aarti on the banks of the Saryu River.",
    image: require("@/assets/images/destinations/ayodhya.jpg"),
    distance: "134 km",
    distanceKm: 134,
    duration: "2h 30m",
    basePrice: 2499,
    pricePerKm: 18.6,
    rating: 4.8,
    reviewCount: 1247,
    highlights: [
      "Ram Mandir",
      "Saryu River Aarti",
      "Hanuman Garhi",
      "Kanak Bhawan",
    ],
    popular: true,
    latitude: 26.7922,
    longitude: 82.1998,
  },
  {
    id: "2",
    name: "Varanasi",
    tagline: "City of Light",
    description:
      "Varanasi, one of the oldest living cities in the world, offers a mesmerizing blend of spirituality and culture. Witness the iconic Ganga Aarti, explore narrow lanes filled with ancient temples, and take a sunrise boat ride.",
    image: require("@/assets/images/destinations/varanasi.jpg"),
    distance: "320 km",
    distanceKm: 320,
    duration: "5h 15m",
    basePrice: 4999,
    pricePerKm: 15.6,
    rating: 4.9,
    reviewCount: 3456,
    highlights: [
      "Ganga Aarti",
      "Kashi Vishwanath",
      "Boat Ride at Dawn",
      "Sarnath",
    ],
    popular: true,
    latitude: 25.3176,
    longitude: 82.9739,
  },
  {
    id: "3",
    name: "Lucknow",
    tagline: "City of Nawabs",
    description:
      "Experience the royal heritage of Lucknow with its magnificent Mughal architecture, legendary cuisine, and warm hospitality. From Bara Imambara to the bustling markets of Aminabad, every corner tells a story.",
    image: require("@/assets/images/destinations/lucknow.jpg"),
    distance: "0 km",
    distanceKm: 0,
    duration: "Local",
    basePrice: 999,
    pricePerKm: 20.0,
    rating: 4.7,
    reviewCount: 2189,
    highlights: [
      "Bara Imambara",
      "Chota Imambara",
      "Tunday Kebabs",
      "Rumi Darwaza",
    ],
    popular: false,
    latitude: 26.8467,
    longitude: 80.9462,
  },
  {
    id: "4",
    name: "Agra",
    tagline: "City of the Taj",
    description:
      "Home to the iconic Taj Mahal, Agra is a testament to Mughal grandeur. Beyond the Taj, discover the majestic Agra Fort, the exquisite Itimad-ud-Daulah, and savor the famous Agra Petha.",
    image: require("@/assets/images/destinations/agra.jpg"),
    distance: "335 km",
    distanceKm: 335,
    duration: "5h 30m",
    basePrice: 5499,
    pricePerKm: 16.4,
    rating: 4.9,
    reviewCount: 5672,
    highlights: [
      "Taj Mahal",
      "Agra Fort",
      "Mehtab Bagh",
      "Fatehpur Sikri",
    ],
    popular: true,
    latitude: 27.1767,
    longitude: 78.0081,
  },
  {
    id: "5",
    name: "Mathura",
    tagline: "Birthplace of Krishna",
    description:
      "Mathura, the birthplace of Lord Krishna, is a vibrant holy city filled with colorful temples, sacred ghats, and the joyous spirit of devotion. Experience the famous Holi celebrations and visit Vrindavan nearby.",
    image: require("@/assets/images/destinations/mathura.jpg"),
    distance: "280 km",
    distanceKm: 280,
    duration: "4h 45m",
    basePrice: 4299,
    pricePerKm: 15.4,
    rating: 4.6,
    reviewCount: 1834,
    highlights: [
      "Krishna Janmabhoomi",
      "Vrindavan Temples",
      "Vishram Ghat",
      "Govardhan Hill",
    ],
    popular: false,
    latitude: 27.4924,
    longitude: 77.6737,
  },
  {
    id: "6",
    name: "Prayagraj",
    tagline: "City of Confluence",
    description:
      "Prayagraj, where the sacred rivers Ganga, Yamuna, and the mythical Saraswati converge, is one of India's holiest cities. Visit the Triveni Sangam, Anand Bhawan, and experience the grandeur of the Kumbh Mela grounds.",
    image: require("@/assets/images/destinations/prayagraj.jpg"),
    distance: "198 km",
    distanceKm: 198,
    duration: "3h 30m",
    basePrice: 3499,
    pricePerKm: 17.7,
    rating: 4.5,
    reviewCount: 1456,
    highlights: [
      "Triveni Sangam",
      "Anand Bhawan",
      "Allahabad Fort",
      "Khusro Bagh",
    ],
    popular: false,
    latitude: 25.4358,
    longitude: 81.8463,
  },
];

export const LUCKNOW_CENTER = { latitude: 26.8467, longitude: 80.9462 };

export const simulatedDriverLocations = [
  { id: "d1", name: "Rajesh K.", vehicle: "Toyota Innova", latitude: 26.8550, longitude: 80.9550, rating: 4.8 },
  { id: "d2", name: "Amit S.", vehicle: "Maruti Ertiga", latitude: 26.8400, longitude: 80.9350, rating: 4.6 },
  { id: "d3", name: "Vikram P.", vehicle: "Mercedes V-Class", latitude: 26.8520, longitude: 80.9600, rating: 4.9 },
  { id: "d4", name: "Pradeep M.", vehicle: "Honda City", latitude: 26.8380, longitude: 80.9500, rating: 4.5 },
  { id: "d5", name: "Sunil R.", vehicle: "Hyundai Creta", latitude: 26.8600, longitude: 80.9400, rating: 4.7 },
];

export const vehicleTypes = {
  sedan: { name: "Sedan", multiplier: 1, capacity: 4, icon: "car-outline" as const },
  suv: { name: "SUV", multiplier: 1.4, capacity: 6, icon: "car-sport-outline" as const },
  luxury: { name: "Luxury", multiplier: 2.2, capacity: 4, icon: "diamond-outline" as const },
};

export const sampleBookings: BookingData[] = [
  {
    id: "b1",
    userId: "user1",
    destinationId: "2",
    destinationName: "Varanasi",
    date: "2026-02-25",
    time: "06:00 AM",
    status: "confirmed",
    vehicleType: "suv",
    passengers: 4,
    fare: 6999,
    driverName: "Rajesh Kumar",
    driverPhone: "+91 98765 43210",
    pickupLocation: "Hazratganj, Lucknow",
  },
  {
    id: "b2",
    userId: "user1",
    destinationId: "1",
    destinationName: "Ayodhya",
    date: "2026-02-10",
    time: "08:00 AM",
    status: "completed",
    vehicleType: "sedan",
    passengers: 2,
    fare: 2499,
    driverName: "Amit Singh",
    driverPhone: "+91 98765 12345",
    pickupLocation: "Gomti Nagar, Lucknow",
  },
  {
    id: "b3",
    userId: "user1",
    destinationId: "4",
    destinationName: "Agra",
    date: "2026-01-15",
    time: "05:30 AM",
    status: "completed",
    vehicleType: "luxury",
    passengers: 2,
    fare: 12098,
    driverName: "Vikram Patel",
    driverPhone: "+91 98765 67890",
    pickupLocation: "Aliganj, Lucknow",
  },
];

export const sampleDrivers: DriverData[] = [
  {
    id: "d1",
    name: "Rajesh Kumar",
    email: "rajesh@email.com",
    phone: "+91 98765 43210",
    role: "driver",
    walletBalance: 15400,
    totalTrips: 342,
    memberSince: "2024-03-15",
    vehicle: "Toyota Innova Crysta",
    vehicleNumber: "UP32 AB 1234",
    rating: 4.8,
    isAvailable: true,
    kycStatus: "approved",
    totalEarnings: 485000,
    todayEarnings: 3200,
    completedTrips: 342,
  },
  {
    id: "d2",
    name: "Amit Singh",
    email: "amit@email.com",
    phone: "+91 98765 12345",
    role: "driver",
    walletBalance: 8200,
    totalTrips: 156,
    memberSince: "2024-08-20",
    vehicle: "Maruti Suzuki Ertiga",
    vehicleNumber: "UP32 CD 5678",
    rating: 4.6,
    isAvailable: false,
    kycStatus: "approved",
    totalEarnings: 234000,
    todayEarnings: 0,
    completedTrips: 156,
  },
  {
    id: "d3",
    name: "Vikram Patel",
    email: "vikram@email.com",
    phone: "+91 98765 67890",
    role: "driver",
    walletBalance: 22100,
    totalTrips: 521,
    memberSince: "2023-11-10",
    vehicle: "Mercedes-Benz V-Class",
    vehicleNumber: "UP32 EF 9012",
    rating: 4.9,
    isAvailable: true,
    kycStatus: "approved",
    totalEarnings: 892000,
    todayEarnings: 5600,
    completedTrips: 521,
  },
  {
    id: "d4",
    name: "Suresh Yadav",
    email: "suresh@email.com",
    phone: "+91 98765 11111",
    role: "driver",
    walletBalance: 0,
    totalTrips: 0,
    memberSince: "2026-02-01",
    vehicle: "Hyundai Creta",
    vehicleNumber: "UP32 GH 3456",
    rating: 0,
    isAvailable: false,
    kycStatus: "submitted",
    totalEarnings: 0,
    todayEarnings: 0,
    completedTrips: 0,
  },
];
