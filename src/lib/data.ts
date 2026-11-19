export const CATEGORIES = [
  { slug: "seeds", icon: "Sprout", en: "Seeds", hi: "बीज", mr: "बियाणे" },
  { slug: "fertilizers", icon: "Leaf", en: "Fertilizers", hi: "उर्वरक", mr: "खते" },
  { slug: "pesticides", icon: "Shield", en: "Crop Protection", hi: "फसल सुरक्षा", mr: "पीक संरक्षण" },
  { slug: "tractors", icon: "Truck", en: "Tractors", hi: "ट्रैक्टर", mr: "ट्रॅक्टर" },
  { slug: "equipment", icon: "Cog", en: "Farming Equipment", hi: "कृषि उपकरण", mr: "शेती उपकरणे" },
  { slug: "irrigation", icon: "Droplets", en: "Irrigation Systems", hi: "सिंचाई प्रणाली", mr: "सिंचन प्रणाली" },
  { slug: "harvesting", icon: "Wheat", en: "Harvesting Machines", hi: "कटाई मशीन", mr: "कापणी यंत्रे" },
  { slug: "organic", icon: "Recycle", en: "Organic Farming", hi: "जैविक खेती", mr: "सेंद्रिय शेती" },
  { slug: "animal", icon: "Beef", en: "Animal Husbandry", hi: "पशुपालन", mr: "पशुपालन" },
  { slug: "tools", icon: "Wrench", en: "Agricultural Tools", hi: "कृषि औज़ार", mr: "शेती अवजारे" },
  { slug: "sprayers", icon: "SprayCan", en: "Sprayers", hi: "स्प्रेयर", mr: "फवारणी यंत्रे" },
  { slug: "pumps", icon: "Zap", en: "Water Pumps", hi: "वाटर पंप", mr: "पाणी पंप" },
];

export const STATES: Record<string, string[]> = {
  Maharashtra: ["Pune", "Nashik", "Nagpur", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Thane"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Anand"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
  Punjab: ["Ludhiana", "Amritsar", "Patiala", "Bathinda", "Mohali"],
  Haryana: ["Hisar", "Karnal", "Ambala", "Rohtak", "Gurugram"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Allahabad"],
  Karnataka: ["Bengaluru", "Mysuru", "Hubballi", "Mangalore", "Belagavi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Trichy"],
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur"],
  "West Bengal": ["Kolkata", "Siliguri", "Durgapur", "Howrah"],
  Kerala: ["Kochi", "Kozhikode", "Thrissur", "Kannur"],
  "Himachal Pradesh": ["Shimla", "Mandi", "Kullu", "Dharamshala"],
  Uttarakhand: ["Dehradun", "Haridwar", "Nainital"],
  Odisha: ["Bhubaneswar", "Cuttack", "Rourkela"],
  Assam: ["Guwahati", "Dibrugarh", "Jorhat"],
  Chhattisgarh: ["Raipur", "Bilaspur", "Durg"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad"],
};

export const UNITS = ["piece", "kg", "quintal", "ton", "litre", "acre", "hour", "day", "week", "bag", "dozen", "bunch"];
export const USER_TYPES = ["farmer", "supplier", "equipment_owner", "dealer"];
export const LISTING_TYPES = ["sell", "rent", "exchange", "free", "wanted"];

export const HERO_IMG = "https://images.pexels.com/photos/20445169/pexels-photo-20445169.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
export const IMG = {
  tractor: "https://images.pexels.com/photos/34997937/pexels-photo-34997937.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  harvester: "https://images.pexels.com/photos/31732904/pexels-photo-31732904.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  harvester2: "https://images.pexels.com/photos/21630806/pexels-photo-21630806.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  field: "https://images.pexels.com/photos/19137268/pexels-photo-19137268.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  tractor2: "https://images.pexels.com/photos/13459278/pexels-photo-13459278.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};
export function fmtINR(n: number | string) {
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}
