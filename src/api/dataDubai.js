import { mockTransactions } from '../data/mockData.js';

// Live endpoint (swap in when API keys arrive):
// GET https://apis.data.dubai/open/dld/dld_transactions-open
// Headers: { Authorization: 'Bearer <YOUR_TOKEN>' }
// Query params map 1-to-1 with the filters object below.
// Replace the mock return in fetchTransactions() with:
//
//   const params = new URLSearchParams();
//   if (filters.area)         params.set('area_name_en', filters.area);
//   if (filters.propertyType) params.set('property_type_en', filters.propertyType);
//   if (filters.bedrooms)     params.set('rooms_en', filters.bedrooms);
//   if (filters.minPrice)     params.set('actual_worth_min', filters.minPrice);
//   if (filters.maxPrice)     params.set('actual_worth_max', filters.maxPrice);
//   if (filters.dateFrom)     params.set('instance_date_from', filters.dateFrom);
//   if (filters.dateTo)       params.set('instance_date_to', filters.dateTo);
//   if (filters.regType)      params.set('reg_type_en', filters.regType);
//   if (filters.transGroup)   params.set('trans_group_en', filters.transGroup);
//
//   const response = await fetch(
//     `https://apis.data.dubai/open/dld/dld_transactions-open?${params}`,
//     { headers: { Authorization: `Bearer ${import.meta.env.VITE_DLD_API_KEY}` } }
//   );
//   if (!response.ok) throw new Error(`DLD API error: ${response.status}`);
//   return response.json();

export async function fetchTransactions(filters = {}) {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 400));

  let data = [...mockTransactions];

  if (filters.area && filters.area !== 'All') {
    data = data.filter((t) => t.area_name_en === filters.area);
  }
  if (filters.propertyType && filters.propertyType !== 'All') {
    data = data.filter((t) => t.property_type_en === filters.propertyType);
  }
  if (filters.bedrooms && filters.bedrooms !== 'All') {
    data = data.filter((t) => t.rooms_en === filters.bedrooms);
  }
  if (filters.minPrice) {
    data = data.filter((t) => t.actual_worth >= Number(filters.minPrice));
  }
  if (filters.maxPrice) {
    data = data.filter((t) => t.actual_worth <= Number(filters.maxPrice));
  }
  if (filters.dateFrom) {
    data = data.filter((t) => t.instance_date >= filters.dateFrom);
  }
  if (filters.dateTo) {
    data = data.filter((t) => t.instance_date <= filters.dateTo);
  }
  if (filters.regType && filters.regType !== 'All') {
    data = data.filter((t) => t.reg_type_en === filters.regType);
  }
  if (filters.transGroup && filters.transGroup !== 'All') {
    data = data.filter((t) => t.trans_group_en === filters.transGroup);
  }

  return data;
}
