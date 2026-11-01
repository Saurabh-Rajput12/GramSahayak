// Seed script to populate initial sample data for Gram Sahayak portal
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Import all required models
const User = require('./models/User');
const Scheme = require('./models/Scheme');
const Complaint = require('./models/Complaint');
const CropPrice = require('./models/CropPrice');
const Notice = require('./models/Notice');
const Product = require('./models/Product');
const Event = require('./models/Event');
const Helpline = require('./models/Helpline');
const Feedback = require('./models/Feedback');
const Member = require('./models/Member');
const Application = require('./models/Application');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gram_sahayak';

// Helper function to hash plain passwords using bcryptjs
const hashPassword = async (plainPassword) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

// Main seed function to clear and insert database records
const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database.');

    // Step 1: Clear existing data from all collections
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await Scheme.deleteMany({});
    await Complaint.deleteMany({});
    await CropPrice.deleteMany({});
    await Notice.deleteMany({});
    await Product.deleteMany({});
    await Event.deleteMany({});
    await Helpline.deleteMany({});
    await Feedback.deleteMany({});
    await Member.deleteMany({});
    await Application.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});

    // Step 2: Seed Users (1 Panchayat Admin + 3 Villagers)
    console.log('Seeding users...');
    const defaultPassword = await hashPassword('password123');

    const adminUser = await User.create({
      name: 'Gram Sachiv (Panchayat Admin)',
      username: 'panchayat_admin',
      password: defaultPassword,
      role: 'panchayat',
      isBlocked: false
    });

    const villager1 = await User.create({
      name: 'Ramesh Kumar',
      username: 'ramesh_kumar',
      password: defaultPassword,
      role: 'villager',
      isBlocked: false
    });

    const villager2 = await User.create({
      name: 'Sita Devi',
      username: 'sita_devi',
      password: defaultPassword,
      role: 'villager',
      isBlocked: false
    });

    const villager3 = await User.create({
      name: 'Anil Verma',
      username: 'anil_farmer',
      password: defaultPassword,
      role: 'villager',
      isBlocked: false
    });

    console.log(`Created 4 users (1 panchayat + 3 villagers).`);

    // Step 3: Seed 10 Real Government & Panchayat Schemes
    console.log('Seeding 10 schemes...');
    const schemesData = [
      {
        name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        description: 'Direct income support of ₹6,000 per year transferred in three equal four-monthly installments to bank accounts of landholder farmer families.',
        category: 'farmer',
        documentsRequired: ['Aadhaar Card', 'Land Ownership Records (Khatauni)', 'Active Bank Account Passbook'],
        minAge: 18,
        maxIncome: 0,
        applyLink: 'https://pmkisan.gov.in'
      },
      {
        name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        description: 'Comprehensive financial support and crop insurance coverage to farmers suffering crop loss or damage arising out of unforeseen natural calamities.',
        category: 'farmer',
        documentsRequired: ['Aadhaar Card', 'Land Sowing Certificate', 'Bank Passbook Copy', 'Crop Sowing Declaration'],
        minAge: 18,
        maxIncome: 0,
        applyLink: 'https://pmfby.gov.in'
      },
      {
        name: 'Ayushman Bharat (PM-JAY)',
        description: 'World largest government-funded healthcare scheme providing health insurance cover of up to ₹5,00,000 per family per year for secondary and tertiary care hospitalization.',
        category: 'health',
        documentsRequired: ['Ration Card', 'Aadhaar Card', 'Income Certificate', 'Family Photo'],
        minAge: 0,
        maxIncome: 250000,
        applyLink: 'https://pmjay.gov.in'
      },
      {
        name: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
        description: 'Social security monthly financial pension assistance for elderly citizens aged 60 years and above belonging to Below Poverty Line (BPL) families.',
        category: 'pension',
        documentsRequired: ['Age Proof / Birth Certificate', 'BPL Ration Card', 'Aadhaar Card', 'Bank Passbook'],
        minAge: 60,
        maxIncome: 200000,
        applyLink: 'https://nsap.nic.in'
      },
      {
        name: 'Kisan Credit Card (KCC) Scheme',
        description: 'Timely and hassle-free institutional short-term credit to farmers for purchase of agricultural inputs like seeds, fertilizers, and pesticides at subsidized interest rates.',
        category: 'farmer',
        documentsRequired: ['Land Revenue Records', 'Aadhaar Card', 'PAN Card', 'Passport Sized Photo'],
        minAge: 18,
        maxIncome: 0,
        applyLink: 'https://www.myscheme.gov.in'
      },
      {
        name: 'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
        description: 'Financial assistance of ₹1,20,000 in plains and ₹1,30,000 in hilly areas to houseless and kutcha house living families for building a durable pucca house with toilet.',
        category: 'housing',
        documentsRequired: ['SECC Registration ID', 'Aadhaar Card', 'Bank Passbook Copy', 'MGNREGA Job Card'],
        minAge: 18,
        maxIncome: 180000,
        applyLink: 'https://pmayg.nic.in'
      },
      {
        name: 'Jal Jeevan Mission (Har Ghar Nal Se Jal)',
        description: 'Central flagship program aimed at providing safe and adequate drinking water through individual household tap connections to all rural homes.',
        category: 'health',
        documentsRequired: ['Aadhaar Card', 'House Tax Receipt or Panchayat ID'],
        minAge: 18,
        maxIncome: 0,
        applyLink: 'https://jaljeevanmission.gov.in'
      },
      {
        name: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
        description: 'Provides clean LPG cooking fuel connections with cash assistance to adult women belonging to poor households to safeguard health against firewood smoke.',
        category: 'health',
        documentsRequired: ['BPL Ration Card', 'Aadhaar Card of Woman Applicant', 'Bank Account Details'],
        minAge: 18,
        maxIncome: 200000,
        applyLink: 'https://www.pmuy.gov.in'
      },
      {
        name: 'Sukanya Samriddhi Yojana (SSY)',
        description: 'Government-backed small deposit savings scheme targeted at girl children with high interest rates and tax exemptions to fund future education and marriage.',
        category: 'education',
        documentsRequired: ['Girl Child Birth Certificate', 'Guardian Aadhaar Card', 'Proof of Residence'],
        minAge: 0,
        maxIncome: 0,
        applyLink: 'https://www.indiapost.gov.in'
      },
      {
        name: 'National Rural Livelihoods Mission (DAY-NRLM)',
        description: 'Empowers rural women by organizing them into Self-Help Groups (SHGs), providing revolving funds, skill training, and credit linkages for micro-enterprises.',
        category: 'education',
        documentsRequired: ['Aadhaar Card', 'SHG Membership Certificate', 'Bank Passbook'],
        minAge: 18,
        maxIncome: 250000,
        applyLink: 'https://aajeevika.gov.in'
      }
    ];

    const createdSchemes = await Scheme.create(schemesData);
    console.log(`Created ${createdSchemes.length} schemes.`);

    // Step 4: Seed 20 Agricultural Mandi Crop Prices
    console.log('Seeding 20 crop prices...');
    const pricesData = [
      { crop: 'Wheat (Sharbati)', market: 'Sehore Krishi Mandi', district: 'Sehore', price: 2750 },
      { crop: 'Wheat (Lokwan)', market: 'Indore Mandi', district: 'Indore', price: 2450 },
      { crop: 'Paddy (Basmati)', market: 'Karnal Grain Market', district: 'Karnal', price: 3850 },
      { crop: 'Paddy (Common)', market: 'Raipur Krishi Upaj Mandi', district: 'Raipur', price: 2200 },
      { crop: 'Mustard (Yellow)', market: 'Bharatpur Mandi', district: 'Bharatpur', price: 5650 },
      { crop: 'Gram (Desi Chana)', market: 'Bikaner Mandi', district: 'Bikaner', price: 5900 },
      { crop: 'Soybean (Yellow)', market: 'Ujjain Krishi Upaj Mandi', district: 'Ujjain', price: 4750 },
      { crop: 'Cotton (Kapas)', market: 'Rajkot APMC Mandi', district: 'Rajkot', price: 7100 },
      { crop: 'Maize (Yellow Makka)', market: 'Chhindwara Mandi', district: 'Chhindwara', price: 2150 },
      { crop: 'Bajra (Pearl Millet)', market: 'Jaipur Grain Mandi', district: 'Jaipur', price: 2250 },
      { crop: 'Potato (Jyoti)', market: 'Agra Mandi', district: 'Agra', price: 1350 },
      { crop: 'Onion (Nashik Red)', market: 'Lasalgaon Mandi', district: 'Nashik', price: 1800 },
      { crop: 'Tomato (Hybrid)', market: 'Kolar APMC Mandi', district: 'Kolar', price: 1600 },
      { crop: 'Garlic (Desi)', market: 'Mandsaur Mandi', district: 'Mandsaur', price: 11500 },
      { crop: 'Sugarcane', market: 'Muzaffarnagar Mandi', district: 'Muzaffarnagar', price: 380 },
      { crop: 'Turmeric (Haldi)', market: 'Nizamabad Mandi', district: 'Nizamabad', price: 14200 },
      { crop: 'Moong (Green Gram)', market: 'Akola Mandi', district: 'Akola', price: 8100 },
      { crop: 'Groundnut (Moongphali)', market: 'Junagadh APMC', district: 'Junagadh', price: 6350 },
      { crop: 'Barley (Jau)', market: 'Sri Ganganagar Mandi', district: 'Sri Ganganagar', price: 1950 },
      { crop: 'Coriander (Dhaniya)', market: 'Kota Mandi', district: 'Kota', price: 7400 }
    ];

    await CropPrice.create(pricesData);
    console.log(`Created 20 crop price entries.`);

    // Step 5: Seed 5 Village Notices
    console.log('Seeding 5 notices...');
    const noticesData = [
      {
        title: 'Monthly Gram Sabha General Assembly Meeting',
        body: 'The monthly Gram Sabha meeting will be held this Saturday at 10:00 AM at the Panchayat Bhawan. Key discussions include road construction, pipeline repairs, and new scheme approvals. All villagers are cordially requested to participate.',
        type: 'meeting',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Free Cattle Foot & Mouth Disease Vaccination Camp',
        body: 'Animal Husbandry Department veterinary doctors will conduct a free vaccination drive for all village cattle and buffaloes on Wednesday from 9:00 AM to 3:00 PM at the Community Dairy Shed.',
        type: 'camp',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Canal Irrigation Water Release Schedule - Rabi Crop',
        body: 'Sub-branch canal water will be released for 12 continuous days starting this Monday for wheat and mustard field watering. Farmers are requested to clean their field drainage channels.',
        type: 'water',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Special Pension & Ration Aadhaar Linking Drive',
        body: 'Tehsil revenue officials and CSC operators will verify BPL ration cards and bank Aadhaar seeds at the Primary School from 10:00 AM to 4:00 PM this Friday.',
        type: 'general',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Swachh Gram Cleanliness & Dustbin Distribution Campaign',
        body: 'Join the community cleanliness shramdaan drive this Sunday at 7:00 AM. Free biodegradable and non-biodegradable waste bins will be distributed to every household.',
        type: 'general',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];

    await Notice.create(noticesData);
    console.log(`Created 5 notices.`);

    // Step 6: Seed 3 Complaints
    console.log('Seeding 3 complaints...');
    const complaintsData = [
      {
        user: villager1._id,
        title: 'Broken drinking water pipeline near Ward 4 handpump',
        category: 'water',
        description: 'The underground PVC pipe supplying water to Ward 4 has burst near the community handpump, creating water shortage and road waterlogging.',
        status: 'in_progress',
        panchayatReply: 'Panchayat technician inspected the leak. New pipe parts have been ordered and will be replaced tomorrow.'
      },
      {
        user: villager2._id,
        title: 'Street lights not glowing on Main Road to School',
        category: 'electricity',
        description: 'Three solar street lights between the village gate and the girls primary school have not been functioning for the last two weeks.',
        status: 'open',
        panchayatReply: ''
      },
      {
        user: villager3._id,
        title: 'Garbage accumulation near community pond embankment',
        category: 'sanitation',
        description: 'Unchecked littering and dry agricultural residue had piled up on the eastern bank of the pond, choking rainwater inflow.',
        status: 'resolved',
        panchayatReply: 'Panchayat cleanliness staff cleared the waste on 28th October and installed warning signboards against littering.'
      }
    ];

    await Complaint.create(complaintsData);
    console.log(`Created 3 complaints.`);

    // Step 7: Seed 8 Rural Market Products
    console.log('Seeding 8 market products...');
    const productsData = [
      {
        seller: villager1._id,
        name: 'Fresh Organic Desi Tomatoes',
        category: 'vegetables',
        price: 30,
        quantity: 50,
        unit: 'kg',
        description: 'Farm-fresh chemical-free desi tomatoes handpicked this morning. Juicy and full of flavour.',
        isAvailable: true
      },
      {
        seller: villager2._id,
        name: 'Pure Fresh Gir Cow Milk',
        category: 'dairy',
        price: 60,
        quantity: 25,
        unit: 'litre',
        description: 'Unprocessed pure fresh morning milk from grass-fed cows. High cream and wholesome nutrition.',
        isAvailable: true
      },
      {
        seller: villager3._id,
        name: 'Premium Sharbati Wheat Grains',
        category: 'grains',
        price: 35,
        quantity: 300,
        unit: 'kg',
        description: 'Sorted and sundried premium Sharbati golden wheat grains directly from the farm.',
        isAvailable: true
      },
      {
        seller: villager1._id,
        name: 'Cold-Pressed Kachi Ghani Mustard Oil',
        category: 'other',
        price: 180,
        quantity: 30,
        unit: 'litre',
        description: 'Wood-pressed authentic mustard oil made from organic black mustard seeds without any additives.',
        isAvailable: true
      },
      {
        seller: villager2._id,
        name: 'Handcrafted Bamboo Storage Baskets',
        category: 'handicrafts',
        price: 150,
        quantity: 15,
        unit: 'piece',
        description: 'Traditional durable handcrafted bamboo storage baskets woven by local village artisans.',
        isAvailable: true
      },
      {
        seller: villager3._id,
        name: 'Farm Fresh Organic Red Potatoes',
        category: 'vegetables',
        price: 25,
        quantity: 120,
        unit: 'kg',
        description: 'Freshly harvested soil-cleaned organic potatoes suitable for long storage.',
        isAvailable: true
      },
      {
        seller: villager1._id,
        name: 'Raw Forest Wild Honey',
        category: 'other',
        price: 450,
        quantity: 12,
        unit: 'kg',
        description: 'Natural unprocessed sweet raw honey extracted carefully from wild neem and acacia groves.',
        isAvailable: true
      },
      {
        seller: villager2._id,
        name: 'Homestyle Spicy Mango Pickle',
        category: 'other',
        price: 220,
        quantity: 20,
        unit: 'kg',
        description: 'Traditional spicy sundried mango pickle made using cold-pressed mustard oil and grandmother recipe.',
        isAvailable: true
      }
    ];

    await Product.create(productsData);
    console.log(`Created 8 products.`);

    // Step 8: Seed 4 Village Events
    console.log('Seeding 4 events...');
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const inTwoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const inThreeWeeks = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
    const inFourWeeks = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);

    const eventsData = [
      {
        title: 'Free Village Eye Checkup & Cataract Screening Camp',
        description: 'Visiting ophthalmologists from District Civil Hospital will conduct free vision tests, cataract screening, and distribute free reading spectacles to registered senior villagers.',
        type: 'health camp',
        date: nextWeek,
        venue: 'Primary Health Sub-Centre, Ward 2',
        seatLimit: 50,
        registeredUsers: [villager1._id, villager2._id]
      },
      {
        title: 'Cattle Vaccination & Deworming Campaign',
        description: 'Veterinary officers will provide compulsory deworming tablets and foot-and-mouth vaccinations for cattle, goats, and buffaloes free of charge.',
        type: 'vaccination',
        date: inTwoWeeks,
        venue: 'Veterinary Shed, Near Village Pond',
        seatLimit: 40,
        registeredUsers: [villager3._id]
      },
      {
        title: 'Gram Sabha Development & Annual Budget Assembly',
        description: 'Public meeting to finalize village infrastructure proposals for roads, solar street lights, and tap water connections for the upcoming financial year.',
        type: 'meeting',
        date: inThreeWeeks,
        venue: 'Panchayat Bhawan Main Hall',
        seatLimit: 120,
        registeredUsers: [villager1._id, villager2._id, villager3._id]
      },
      {
        title: 'Organic Farming & Solar Drip Irrigation Workshop',
        description: 'Agricultural scientists from Krishi Vigyan Kendra will demonstrate preparation of Jeevamrit organic fertilizers, bio-pesticides, and PM-KUSUM solar pump subsidy procedures.',
        type: 'training',
        date: inFourWeeks,
        venue: 'Kisan Seva Kendra, Village Market Chowk',
        seatLimit: 45,
        registeredUsers: [villager3._id]
      }
    ];

    await Event.create(eventsData);
    console.log(`Created 4 events.`);

    // Step 9: Seed 8 Village Helplines
    console.log('Seeding 8 helplines...');
    const helplinesData = [
      {
        name: 'Primary Health Sub-Centre (PHC) Emergency',
        category: 'hospital',
        phone: '0755-2741122',
        address: 'Opposite Panchayat Bhawan, Main Road',
        timings: '24x7'
      },
      {
        name: 'Gram Panchayat Police Beat Chowki',
        category: 'police',
        phone: '112',
        address: 'Old Bus Stand Junction',
        timings: '24x7'
      },
      {
        name: 'Tehsil Fire & Emergency Service Station',
        category: 'fire',
        phone: '101',
        address: 'Tehsil Headquarters Road, Block Office',
        timings: '24x7'
      },
      {
        name: 'Free 108 Rural Ambulance Emergency Service',
        category: 'ambulance',
        phone: '108',
        address: 'Community Health Centre Base Station',
        timings: '24x7'
      },
      {
        name: 'Village Patwari / Lekhpal (Land Records)',
        category: 'patwari',
        phone: '+91 94251 12345',
        address: 'Panchayat Revenue Room No. 2',
        timings: '10:00 AM - 05:00 PM (Mon-Sat)'
      },
      {
        name: 'Electricity Board (MPPKVVCL) Rural Fault Centre',
        category: 'electricity',
        phone: '1912',
        address: '33/11 KV Substation, Village Link Road',
        timings: '24x7'
      },
      {
        name: 'Gram Jal Purti (Water Supply Maintenance)',
        category: 'water',
        phone: '+91 98260 54321',
        address: 'Water Works Office, Near Community Tank',
        timings: '08:00 AM - 07:00 PM'
      },
      {
        name: 'Madhyanchal Gramin Bank Customer Support',
        category: 'bank',
        phone: '1800 425 2407',
        address: 'Bazar Chowk Branch, Main Market',
        timings: '10:00 AM - 04:00 PM (Mon-Fri)'
      }
    ];

    await Helpline.create(helplinesData);
    console.log(`Created 8 helplines.`);

    // Step 10: Seed 5 Panchayat Members
    console.log('Seeding 5 panchayat members...');
    const membersData = [
      {
        name: 'Smt. Shanti Devi',
        post: 'Sarpanch (Village Head)',
        ward: 'Gram Panchayat Executive',
        contactNote: 'Available at Panchayat Bhawan on weekdays 10:00 AM - 02:00 PM',
        since: 2020
      },
      {
        name: 'Shri Mahendra Pratap Singh',
        post: 'Up-Sarpanch (Deputy Head)',
        ward: 'Ward 5',
        contactNote: 'In-charge of village roads, drainage, and public utility repairs',
        since: 2020
      },
      {
        name: 'Shri Rajeshwar Rao',
        post: 'Gram Panchayat Secretary (Sachiv)',
        ward: 'Administrative Office',
        contactNote: 'State government liaison for welfare schemes and village certificates',
        since: 2018
      },
      {
        name: 'Shri Balram Yadav',
        post: 'Ward Panch',
        ward: 'Ward 3',
        contactNote: 'Elected ward member overseeing drinking water distribution',
        since: 2022
      },
      {
        name: 'Smt. Sunita Lodhi',
        post: 'Gram Rozgar Sahayak (MNREGA)',
        ward: 'NREGA Cell',
        contactNote: 'Assists villagers with job cards, muster rolls, and rural wages',
        since: 2021
      }
    ];

    await Member.create(membersData);
    console.log(`Created 5 panchayat members.`);

    // Step 11: Seed 2 Feedback Entries
    console.log('Seeding 2 feedback entries...');
    const feedbackData = [
      {
        user: villager1._id,
        subject: 'Commendable quick repair of the canal approach road',
        message: 'The gravel road leading to the west agricultural canal was repaired within three days of our application. Very thankful to the Panchayat team.',
        type: 'appreciation',
        rating: 5,
        isRead: true
      },
      {
        user: villager2._id,
        subject: 'Request for solar street lamp near girls upper primary school',
        message: 'The street connecting the girls school to Ward 2 gets completely dark after sunset. Please consider sanctioning a solar light on pole number 12.',
        type: 'suggestion',
        rating: 4,
        isRead: false
      }
    ];

    await Feedback.create(feedbackData);
    console.log(`Created 2 feedback entries.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database seeding:', error.message);
    process.exit(1);
  }
};

// Execute seeding process
seedDatabase();
