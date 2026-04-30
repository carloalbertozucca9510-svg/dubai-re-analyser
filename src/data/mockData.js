const areas = [
  'Downtown Dubai',
  'Dubai Marina',
  'JVC',
  'Business Bay',
  'Palm Jumeirah',
];

const areaConfig = {
  'Downtown Dubai': {
    priceRange: [1500000, 5000000],
    pricePerSqm: [18000, 35000],
    rentRange: [90000, 300000],
    rentPerSqm: [900, 2000],
  },
  'Dubai Marina': {
    priceRange: [900000, 3500000],
    pricePerSqm: [14000, 28000],
    rentRange: [65000, 220000],
    rentPerSqm: [700, 1500],
  },
  JVC: {
    priceRange: [400000, 1200000],
    pricePerSqm: [8000, 14000],
    rentRange: [35000, 90000],
    rentPerSqm: [450, 900],
  },
  'Business Bay': {
    priceRange: [800000, 2500000],
    pricePerSqm: [13000, 24000],
    rentRange: [60000, 180000],
    rentPerSqm: [650, 1400],
  },
  'Palm Jumeirah': {
    priceRange: [3000000, 15000000],
    pricePerSqm: [22000, 60000],
    rentRange: [180000, 900000],
    rentPerSqm: [1200, 4000],
  },
};

const roomTypes = ['Studio', '1 B/R', '2 B/R', '3 B/R', '4 B/R', '5 B/R+'];
const propertyTypes = ['Apartment', 'Villa'];
const propertySubTypes = {
  Apartment: ['Flat', 'Penthouse', 'Duplex'],
  Villa: ['Villa', 'Townhouse'],
};
const propertyUsages = ['Residential', 'Commercial'];
const regTypes = ['Off-Plan', 'Ready'];
const transGroups = ['Sales', 'Mortgage'];
const procedureNames = ['Sale', 'Mortgage', 'Gift', 'Transfer'];
const buildings = {
  'Downtown Dubai': ['Burj Vista', 'The Address', 'Boulevard Heights', 'Act One'],
  'Dubai Marina': ['Marina Gate', 'Cayan Tower', 'JBR Residences', 'Infinity Tower'],
  JVC: ['Bloom Towers', 'Belgravia', 'Seasons', 'Oxford Residency'],
  'Business Bay': ['Executive Bay', 'Bay Square', 'Aykon City', 'DAMAC Maison'],
  'Palm Jumeirah': ['Signature Villas', 'Atlantis Residences', 'One Palm', 'Palme Couture'],
};
const metroStations = {
  'Downtown Dubai': 'Burj Khalifa/Dubai Mall',
  'Dubai Marina': 'DMCC Metro Station',
  JVC: 'Dubai Internet City',
  'Business Bay': 'Business Bay',
  'Palm Jumeirah': 'Nakheel',
};

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randDate(year) {
  const month = rand(1, 12);
  const day = rand(1, 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateTransaction(id, year) {
  const area = pick(areas);
  const config = areaConfig[area];
  const propType = pick(propertyTypes);
  const isVilla = propType === 'Villa';
  const area_sqm = isVilla ? rand(200, 600) : rand(50, 200);
  const pricePerSqm = rand(config.pricePerSqm[0], config.pricePerSqm[1]);
  const actualWorth = Math.min(
    Math.max(pricePerSqm * area_sqm, config.priceRange[0]),
    config.priceRange[1]
  );
  const rentPerSqm = rand(config.rentPerSqm[0], config.rentPerSqm[1]);
  const rentValue = rentPerSqm * area_sqm;
  const regType = pick(regTypes);
  const transGroup = pick(transGroups);
  const buildingName = pick(buildings[area]);
  const rooms = isVilla ? pick(['3 B/R', '4 B/R', '5 B/R+']) : pick(['Studio', '1 B/R', '2 B/R', '3 B/R']);

  return {
    transaction_id: `TXN-${year}-${String(id).padStart(5, '0')}`,
    instance_date: randDate(year),
    trans_group_en: transGroup,
    procedure_name_en: transGroup === 'Sales' ? 'Sale' : 'Mortgage',
    property_type_en: propType,
    property_sub_type_en: pick(propertySubTypes[propType]),
    property_usage_en: pick(propertyUsages),
    reg_type_en: regType,
    area_name_en: area,
    building_name_en: buildingName,
    project_name_en: buildingName,
    master_project_en: area === 'Palm Jumeirah' ? 'Palm Jumeirah' : area,
    nearest_metro_en: metroStations[area],
    rooms_en: rooms,
    has_parking: Math.random() > 0.3 ? 'Yes' : 'No',
    procedure_area: area_sqm,
    actual_worth: actualWorth,
    meter_sale_price: pricePerSqm,
    rent_value: rentValue,
    meter_rent_price: rentPerSqm,
  };
}

const transactions = [];
let id = 1;
const years = [2022, 2023, 2024];

for (const year of years) {
  const count = year === 2024 ? 40 : year === 2023 ? 35 : 30;
  for (let i = 0; i < count; i++) {
    transactions.push(generateTransaction(id++, year));
  }
}

export const mockTransactions = transactions;
