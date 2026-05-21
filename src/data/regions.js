export const STATES = [
  { id: 'andhra-pradesh', name: 'Andhra Pradesh', shortName: 'AP', type: 'state' },
  { id: 'arunachal-pradesh', name: 'Arunachal Pradesh', shortName: 'AR', type: 'state' },
  { id: 'assam', name: 'Assam', shortName: 'AS', type: 'state' },
  { id: 'bihar', name: 'Bihar', shortName: 'BR', type: 'state' },
  { id: 'chhattisgarh', name: 'Chhattisgarh', shortName: 'CG', type: 'state' },
  { id: 'goa', name: 'Goa', shortName: 'GA', type: 'state' },
  { id: 'gujarat', name: 'Gujarat', shortName: 'GJ', type: 'state' },
  { id: 'haryana', name: 'Haryana', shortName: 'HR', type: 'state' },
  { id: 'himachal-pradesh', name: 'Himachal Pradesh', shortName: 'HP', type: 'state' },
  { id: 'jharkhand', name: 'Jharkhand', shortName: 'JH', type: 'state' },
  { id: 'karnataka', name: 'Karnataka', shortName: 'KA', type: 'state' },
  { id: 'kerala', name: 'Kerala', shortName: 'KL', type: 'state' },
  { id: 'madhya-pradesh', name: 'Madhya Pradesh', shortName: 'MP', type: 'state' },
  { id: 'maharashtra', name: 'Maharashtra', shortName: 'MH', type: 'state' },
  { id: 'manipur', name: 'Manipur', shortName: 'MN', type: 'state' },
  { id: 'meghalaya', name: 'Meghalaya', shortName: 'ML', type: 'state' },
  { id: 'mizoram', name: 'Mizoram', shortName: 'MZ', type: 'state' },
  { id: 'nagaland', name: 'Nagaland', shortName: 'NL', type: 'state' },
  { id: 'odisha', name: 'Odisha', shortName: 'OD', type: 'state' },
  { id: 'punjab', name: 'Punjab', shortName: 'PB', type: 'state' },
  { id: 'rajasthan', name: 'Rajasthan', shortName: 'RJ', type: 'state' },
  { id: 'sikkim', name: 'Sikkim', shortName: 'SK', type: 'state' },
  { id: 'tamil-nadu', name: 'Tamil Nadu', shortName: 'TN', type: 'state' },
  { id: 'telangana', name: 'Telangana', shortName: 'TG', type: 'state' },
  { id: 'tripura', name: 'Tripura', shortName: 'TR', type: 'state' },
  { id: 'uttar-pradesh', name: 'Uttar Pradesh', shortName: 'UP', type: 'state' },
  { id: 'uttarakhand', name: 'Uttarakhand', shortName: 'UK', type: 'state' },
  { id: 'west-bengal', name: 'West Bengal', shortName: 'WB', type: 'state' },
]

export const UNION_TERRITORIES = [
  { id: 'andaman-nicobar', name: 'Andaman and Nicobar Islands', shortName: 'AN', type: 'ut' },
  { id: 'chandigarh', name: 'Chandigarh', shortName: 'CH', type: 'ut' },
  { id: 'dadra-nagar-haveli-daman-diu', name: 'Dadra and Nagar Haveli and Daman and Diu', shortName: 'DN', type: 'ut' },
  { id: 'delhi', name: 'Delhi (NCT)', shortName: 'DL', type: 'ut' },
  { id: 'jammu-kashmir', name: 'Jammu and Kashmir', shortName: 'JK', type: 'ut' },
  { id: 'ladakh', name: 'Ladakh', shortName: 'LA', type: 'ut' },
  { id: 'lakshadweep', name: 'Lakshadweep', shortName: 'LD', type: 'ut' },
  { id: 'puducherry', name: 'Puducherry', shortName: 'PY', type: 'ut' },
]

export const CENTRAL_GOVERNMENT = 'Central Government'

export const ALLOWED_SOURCE_DOMAINS = [
  'meity.gov.in',
  'startupindia.gov.in',
  'dpiit.gov.in',
  'tdb.gov.in',
  'indiaai.gov.in',
  'cert-in.org.in',
  'mha.gov.in',
  'niti.gov.in',
  'nasscom.in',
  'cyseck.in',
  'gov.in',
  'nic.in',
]

export function isOfficialHostname(hostname) {
  const host = hostname.replace(/^www\./, '').toLowerCase()
  if (host === 'gov.in' || host.endsWith('.gov.in')) return true
  if (host === 'nic.in' || host.endsWith('.nic.in')) return true
  if (host === 'cert-in.org.in' || host.endsWith('.cert-in.org.in')) return true
  return ALLOWED_SOURCE_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`))
}
