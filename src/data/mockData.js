const areaConfig = {
  'Downtown Dubai': {
    pricePerSqm: [18000, 35000],
    rentPerSqm: [900, 2000],
    metro: 'Burj Khalifa/Dubai Mall',
  },
  'Dubai Marina': {
    pricePerSqm: [14000, 28000],
    rentPerSqm: [700, 1500],
    metro: 'DMCC Metro Station',
  },
  JVC: {
    pricePerSqm: [8000, 14000],
    rentPerSqm: [450, 900],
    metro: 'Dubai Internet City',
  },
  'Business Bay': {
    pricePerSqm: [13000, 24000],
    rentPerSqm: [650, 1400],
    metro: 'Business Bay',
  },
  'Palm Jumeirah': {
    pricePerSqm: [22000, 60000],
    rentPerSqm: [1200, 4000],
    metro: 'Nakheel',
  },
};

const buildingsByArea = {
  'Downtown Dubai': [
    { name: 'Burj Khalifa Residences', maxFloors: 50 },
    { name: 'Address Downtown', maxFloors: 40 },
    { name: 'Boulevard Heights', maxFloors: 35 },
    { name: 'Act One Act Two', maxFloors: 30 },
    { name: 'The Address Residences', maxFloors: 45 },
  ],
  'Dubai Marina': [
    { name: 'Marina Gate', maxFloors: 45 },
    { name: 'Cayan Tower', maxFloors: 73 },
    { name: 'Princess Tower', maxFloors: 101 },
    { name: 'Marina Pinnacle', maxFloors: 40 },
    { name: 'Grosvenor House', maxFloors: 45 },
  ],
  JVC: [
    { name: 'Belgravia Heights', maxFloors: 20 },
    { name: 'Bloom Towers', maxFloors: 22 },
    { name: 'La Residence', maxFloors: 15 },
    { name: 'Queue Point', maxFloors: 18 },
    { name: 'Fortunato', maxFloors: 12 },
  ],
  'Business Bay': [
    { name: 'Executive Towers', maxFloors: 35 },
    { name: 'Damac Maison', maxFloors: 40 },
    { name: 'Aykon City', maxFloors: 65 },
    { name: 'The Opus', maxFloors: 20 },
    { name: 'Millennium Binghatti', maxFloors: 30 },
  ],
  'Palm Jumeirah': [
    { name: 'Signature Villas', maxFloors: 3 },
    { name: 'Shoreline Apartments', maxFloors: 10 },
    { name: 'Azure Residences', maxFloors: 8 },
    { name: 'One Palm', maxFloors: 25 },
    { name: 'Atlantis The Royal Residences', maxFloors: 43 },
  ],
};

const roomsByArea = {
  'Downtown Dubai': ['Studio', '1 B/R', '2 B/R', '3 B/R', '4 B/R'],
  'Dubai Marina': ['Studio', '1 B/R', '2 B/R', '3 B/R', '4 B/R'],
  JVC: ['Studio', '1 B/R', '2 B/R', '3 B/R'],
  'Business Bay': ['Studio', '1 B/R', '2 B/R', '3 B/R', '4 B/R'],
  'Palm Jumeirah': ['2 B/R', '3 B/R', '4 B/R', '5 B/R+'],
};

const areaSqmByRoom = {
  Studio: [40, 70],
  '1 B/R': [65, 100],
  '2 B/R': [95, 155],
  '3 B/R': [140, 260],
  '4 B/R': [220, 420],
  '5 B/R+': [380, 650],
};

const propTypeByArea = {
  'Downtown Dubai': 'Apartment',
  'Dubai Marina': 'Apartment',
  JVC: 'Apartment',
  'Business Bay': 'Apartment',
  'Palm Jumeirah': 'Apartment',
};

// Palm villas override
const villaBuildings = new Set(['Signature Villas']);

const regTypes = ['Off-Plan', 'Ready'];
const transGroups = ['Sales', 'Mortgage'];
const propertyUsages = ['Residential', 'Commercial'];

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randDate(year, idx) {
  // Spread across the year using idx to avoid clustering
  const dayOfYear = Math.floor((idx / 10) * 365) + rand(1, 30);
  const d = new Date(year, 0, dayOfYear);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

let txnId = 1;

function generateBuildingTransactions(areaName, building) {
  const cfg = areaConfig[areaName];
  const isVillaBuilding = villaBuildings.has(building.name);
  const propType = isVillaBuilding ? 'Villa' : 'Apartment';
  const rooms = isVillaBuilding
    ? ['3 B/R', '4 B/R', '5 B/R+']
    : roomsByArea[areaName];

  // 10 transactions: 3 in 2022, 3 in 2023, 4 in 2024
  const yearSlots = [2022, 2022, 2022, 2023, 2023, 2023, 2024, 2024, 2024, 2024];

  return yearSlots.map((year, idx) => {
    const floor = rand(1, building.maxFloors);
    // Floor premium: +0.3% per floor
    const floorMultiplier = 1 + floor * 0.003;
    const basePrice = rand(cfg.pricePerSqm[0], cfg.pricePerSqm[1]);
    const pricePerSqm = Math.round(basePrice * floorMultiplier);
    const room = pick(rooms);
    const [minSqm, maxSqm] = areaSqmByRoom[room] || [60, 150];
    const areaSqm = rand(minSqm, maxSqm);
    const actualWorth = pricePerSqm * areaSqm;
    const rentPerSqm = rand(cfg.rentPerSqm[0], cfg.rentPerSqm[1]);
    const rentValue = rentPerSqm * areaSqm;
    const regType = pick(regTypes);
    const transGroup = pick(transGroups);
    const id = txnId++;

    return {
      transaction_id: `TXN-${year}-${String(id).padStart(5, '0')}`,
      instance_date: randDate(year, idx),
      trans_group_en: transGroup,
      procedure_name_en: transGroup === 'Sales' ? 'Sale' : 'Mortgage',
      property_type_en: propType,
      property_sub_type_en: isVillaBuilding ? 'Villa' : 'Flat',
      property_usage_en: pick(propertyUsages),
      reg_type_en: regType,
      area_name_en: areaName,
      building_name_en: building.name,
      project_name_en: building.name,
      master_project_en: areaName === 'Palm Jumeirah' ? 'Palm Jumeirah' : areaName,
      nearest_metro_en: cfg.metro,
      rooms_en: room,
      has_parking: Math.random() > 0.3 ? 'Yes' : 'No',
      floor_number: floor,
      procedure_area: areaSqm,
      actual_worth: actualWorth,
      meter_sale_price: pricePerSqm,
      rent_value: rentValue,
      meter_rent_price: rentPerSqm,
    };
  });
}

const transactions = [];

for (const [areaName, buildings] of Object.entries(buildingsByArea)) {
  for (const building of buildings) {
    transactions.push(...generateBuildingTransactions(areaName, building));
  }
}

export const mockTransactions = transactions;
