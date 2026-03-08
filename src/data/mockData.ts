// Mock data for LODR application

export const mockRideStats = {
  totalRides: 47,
  completedRides: 42,
  activeRide: 1,
  savedAmount: 2850,
};

export const mockCurrentRide = {
  id: "LODR-2024-001",
  pickup: "Sadar Bazaar, Delhi",
  drop: "Chandni Chowk, Delhi",
  vehicle: "Tempo",
  fare: 280,
  status: "in_progress", // requested | assigned | in_progress | completed
  driver: {
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    vehicleNumber: "DL 4C AB 1234",
    rating: 4.8,
  },
};

export const mockRideHistory = [
  {
    id: "LODR-2024-047",
    date: "2024-01-15",
    pickup: "Karol Bagh",
    drop: "Connaught Place",
    vehicle: "Auto",
    fare: 120,
    status: "completed",
  },
  {
    id: "LODR-2024-046",
    date: "2024-01-14",
    pickup: "Lajpat Nagar",
    drop: "South Extension",
    vehicle: "Mini Truck",
    fare: 450,
    status: "completed",
  },
  {
    id: "LODR-2024-045",
    date: "2024-01-13",
    pickup: "Nehru Place",
    drop: "Okhla Industrial Area",
    vehicle: "Tempo",
    fare: 320,
    status: "completed",
  },
];

export const mockSuppliers = [
  {
    id: 1,
    name: "Sharma Grocery Store",
    category: "Grocery",
    phone: "+91 98765 12345",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Gupta Hardware",
    category: "Hardware",
    phone: "+91 98765 23456",
    rating: 4.7,
  },
  {
    id: 3,
    name: "Singh Electronics",
    category: "Electronics",
    phone: "+91 98765 34567",
    rating: 4.3,
  },
  {
    id: 4,
    name: "Patel Textile House",
    category: "Textiles",
    phone: "+91 98765 45678",
    rating: 4.6,
  },
  {
    id: 5,
    name: "Kumar Medical Supplies",
    category: "Medical",
    phone: "+91 98765 56789",
    rating: 4.8,
  },
  {
    id: 6,
    name: "Agarwal Stationery",
    category: "Stationery",
    phone: "+91 98765 67890",
    rating: 4.4,
  },
];

export const vehicles = [
  {
    id: "bike",
    name: "Bike",
    baseFare: 35,
    perKm: 9,
    waitingPerMin: 1,
    capacity: "Up to 20 kg",
  },
  {
    id: "tempo",
    name: "Tempo / Auto Cargo",
    baseFare: 80,
    perKm: 16,
    waitingPerMin: 2,
    capacity: "200–500 kg",
  },
  {
    id: "mini-truck",
    name: "Mini Truck",
    baseFare: 250,
    perKm: 25,
    waitingPerMin: 3,
    capacity: "500–1000 kg",
  },
];
