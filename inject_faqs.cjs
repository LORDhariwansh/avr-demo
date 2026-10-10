const fs = require('fs');
const path = require('path');

const industriesDir = path.join(__dirname, 'src', 'industries');
const files = fs.readdirSync(industriesDir).filter(f => f !== 'index.ts' && f.endsWith('.ts'));

const defaultFaqs = {
  'healthcare.ts': `  faqs: {
    "clinic timings": "Our clinic is open Mon-Sat from 9:00 AM to 8:00 PM. Sunday is closed.",
    "consultation fees": "Consultation fees start from ₹500 depending on the department.",
    "departments": "We have Dermatology, Cardiology, Pediatrics, and General Medicine departments."
  },`,
  'automotive.ts': `  faqs: {
    "showroom timings": "Our showroom is open from 9:00 AM to 8:00 PM all days.",
    "vehicle models": "We offer the latest Sedans, SUVs, and Electric Vehicles.",
    "servicing": "Yes, we have a fully equipped service center. You can book an appointment here."
  },`,
  'education.ts': `  faqs: {
    "courses": "We offer undergraduate and postgraduate programs in Engineering, Business, and Arts.",
    "eligibility": "Eligibility criteria vary by course. Generally, a minimum of 60% in high school is required for UG courses.",
    "fees": "Fee structures depend on the program. Please consult with our admission team for detailed breakdowns."
  },`,
  'hospitality.ts': `  faqs: {
    "room types": "We offer Standard, Deluxe, and Suite rooms.",
    "check-in": "Check-in time is 2:00 PM and check-out is 11:00 AM.",
    "amenities": "All rooms include complimentary Wi-Fi, breakfast, and access to the pool and gym."
  },`,
  'logistics.ts': `  faqs: {
    "delivery timings": "Deliveries are made between 8:00 AM and 8:00 PM.",
    "pickup": "You can schedule a pickup online. Pickups are usually completed within 24 hours.",
    "tracking": "You can track your shipment using the tracking number provided via email or SMS."
  },`,
  'manufacturing.ts': `  faqs: {
    "bulk orders": "We accept bulk orders with a minimum quantity of 100 units.",
    "specifications": "Detailed product specifications can be downloaded from our catalog.",
    "quotation": "Please provide your requirements, and our sales team will share a quotation within 24 hours."
  },`,
  'professionalServices.ts': `  faqs: {
    "consultation": "We offer initial 30-minute free consultations to understand your project.",
    "services": "We provide legal, financial, and strategic business consulting.",
    "pricing": "Our projects are billed hourly or on a fixed-bid basis depending on the scope."
  },`,
  'realEstate.ts': `  faqs: {
    "property types": "We offer 2BHK, 3BHK, and luxury villas.",
    "site visits": "Site visits can be scheduled any day between 10:00 AM and 6:00 PM.",
    "locations": "We have active projects in the city center, suburbs, and coastal areas."
  },`,
  'restaurant.ts': `  faqs: {
    "menu": "We serve authentic Italian cuisine. Vegetarian and vegan options are available.",
    "timings": "We are open for lunch (12 PM - 3 PM) and dinner (7 PM - 11 PM).",
    "reservations": "Table reservations can be made for groups of up to 20 people."
  },`,
  'retail.ts': `  faqs: {
    "return policy": "We offer a 30-day no-questions-asked return policy for unused items.",
    "shipping": "Standard shipping takes 3-5 business days. Express shipping is available.",
    "sizes": "Our clothing is available in sizes XS through XXL."
  },`
};

files.forEach(file => {
  const filePath = path.join(industriesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('faqs: {')) return;
  
  const faqText = defaultFaqs[file] || `  faqs: {
    "hours": "We are open 9 AM to 6 PM.",
  },`;
  
  content = content.replace('quickReplies: [', faqText + '\n  quickReplies: [');
  fs.writeFileSync(filePath, content);
  console.log('Updated', file);
});
