// Seed script for Gram Sahayak (College Mini Project)
// Populates 5 core modules: Users, Schemes, Applications, Complaints, Krishi Products, and Notices
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Scheme = require('./models/Scheme');
const Application = require('./models/Application');
const Complaint = require('./models/Complaint');
const Product = require('./models/Product');
const Notice = require('./models/Notice');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/gram_sahayak';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for Mini Project seeding...');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Scheme.deleteMany({}),
      Application.deleteMany({}),
      Complaint.deleteMany({}),
      Product.deleteMany({}),
      Notice.deleteMany({})
    ]);
    console.log('Cleared existing data.');

    // 1. Seed Users (1 Panchayat Admin, 2 Villagers)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const [admin, ramesh, anil] = await User.create([
      {
        name: 'Gram Panchayat Officer',
        username: 'panchayat_admin',
        password: hashedPassword,
        role: 'panchayat'
      },
      {
        name: 'Ramesh Kumar (Farmer)',
        username: 'ramesh_kumar',
        password: hashedPassword,
        role: 'villager'
      },
      {
        name: 'Anil Singh (Villager)',
        username: 'anil_farmer',
        password: hashedPassword,
        role: 'villager'
      }
    ]);
    console.log('Seeded 3 Users (1 Panchayat Admin, 2 Villagers).');

    // 2. Seed Welfare Schemes (6 Government Schemes matching Schema)
    const schemes = await Scheme.create([
      {
        name: 'PM Kisan Samman Nidhi Yojana',
        description: 'Direct income support of Rs. 6,000 per year in three 4-monthly installments to farmer families having cultivable land.',
        category: 'farmer',
        documentsRequired: ['Aadhaar Card', 'Land Khasra/Khatauni', 'Active Bank Passbook'],
        minAge: 18,
        maxIncome: 300000,
        applyLink: 'https://pmkisan.gov.in'
      },
      {
        name: 'Pradhan Mantri Awas Yojana - Gramin',
        description: 'Financial assistance for the construction of pucca houses with basic amenities to all homeless households and those living in kutcha houses.',
        category: 'housing',
        documentsRequired: ['Aadhaar Card', 'Ration Card', 'BPL Certificate', 'Bank Passbook'],
        minAge: 21,
        maxIncome: 200000,
        applyLink: 'https://pmayg.nic.in'
      },
      {
        name: 'Ayushman Bharat PM-JAY',
        description: 'Government healthcare scheme providing health insurance cover of Rs. 5 Lakhs for secondary and tertiary hospitalization.',
        category: 'health',
        documentsRequired: ['Aadhaar Card', 'Ration Card', 'Mobile Number'],
        minAge: 0,
        maxIncome: 250000,
        applyLink: 'https://pmjay.gov.in'
      },
      {
        name: 'Indira Gandhi National Old Age Pension',
        description: 'Monthly pension of Rs. 1,000 provided to elderly citizens living below the poverty line to ensure social security.',
        category: 'pension',
        documentsRequired: ['Aadhaar Card', 'Age Certificate (60+)', 'BPL Card', 'Bank Passbook'],
        minAge: 60,
        maxIncome: 100000,
        applyLink: 'https://nsap.nic.in'
      },
      {
        name: 'Mukhyamantri Kanya Sumangala Yojana',
        description: 'Conditional cash transfers to ensure girl child welfare and education from birth through graduation in six progressive stages.',
        category: 'education',
        documentsRequired: ['Birth Certificate', 'Aadhaar Card of Parents', 'Income Certificate', 'Bank Passbook'],
        minAge: 0,
        maxIncome: 300000,
        applyLink: 'https://mksy.up.gov.in'
      },
      {
        name: 'Pradhan Mantri Fasal Bima Yojana',
        description: 'Comprehensive risk insurance against crop failure due to drought, floods, and natural calamities.',
        category: 'farmer',
        documentsRequired: ['Land Records', 'Sowing Certificate', 'Bank Passbook', 'Aadhaar Card'],
        minAge: 18,
        maxIncome: 500000,
        applyLink: 'https://pmfby.gov.in'
      }
    ]);
    console.log(`Seeded ${schemes.length} Schemes.`);

    // 3. Seed Scheme Applications (3 Applications)
    await Application.create([
      {
        user: ramesh._id,
        scheme: schemes[0]._id, // PM Kisan
        fullName: 'Ramesh Kumar',
        age: 42,
        income: 95000,
        landAcres: 2.5,
        status: 'approved',
        remark: 'Land verification complete. Approved for upcoming installment.'
      },
      {
        user: ramesh._id,
        scheme: schemes[1]._id, // PM Awas
        fullName: 'Ramesh Kumar',
        age: 42,
        income: 95000,
        landAcres: 0,
        status: 'pending',
        remark: ''
      },
      {
        user: anil._id,
        scheme: schemes[5]._id, // Fasal Bima
        fullName: 'Anil Singh',
        age: 38,
        income: 140000,
        landAcres: 4.0,
        status: 'rejected',
        remark: 'Sowing certificate was missing. Please re-apply with required documents.'
      }
    ]);
    console.log('Seeded 3 Applications.');

    // 4. Seed Grievance Complaints (3 Complaints)
    await Complaint.create([
      {
        user: ramesh._id,
        title: 'Broken Handpump in Ward 3',
        category: 'water',
        description: 'The community handpump near Primary School has been leaking and producing muddy water for the past 4 days.',
        status: 'in_progress',
        panchayatReply: 'Mechanic scheduled to inspect and replace the washer valve tomorrow morning.'
      },
      {
        user: anil._id,
        title: 'Streetlight Not Working at Main Chowk',
        category: 'electricity',
        description: 'The solar streetlight at Main Chauraha has been flickering and remains dark all night, creating safety issues.',
        status: 'resolved',
        panchayatReply: 'LED bulb and solar battery replaced on Friday by the electrical maintenance team.'
      },
      {
        user: ramesh._id,
        title: 'Deep Potholes on Gaon Link Road',
        category: 'road',
        description: 'Recent rains caused major potholes on the approach road to the market, making tractor travel dangerous.',
        status: 'open',
        panchayatReply: ''
      }
    ]);
    console.log('Seeded 3 Complaints.');

    // 5. Seed Krishi Market Products (6 Produce items with direct contact phone and location)
    await Product.create([
      {
        seller: ramesh._id,
        name: 'Fresh Desi Tomatoes (देसी टमाटर)',
        category: 'vegetables',
        price: 25,
        quantity: 150,
        unit: 'kg',
        location: 'Ward 3, Rampur Farm',
        contactPhone: '9876543210',
        description: 'Naturally grown, pesticide-free fresh desi tomatoes harvested this morning.',
        isAvailable: true
      },
      {
        seller: ramesh._id,
        name: 'Golden Basmati Wheat (गेहूं 1544)',
        category: 'grains',
        price: 28,
        quantity: 500,
        unit: 'kg',
        location: 'Khet No. 14, Gram Rampur',
        contactPhone: '9876543210',
        description: 'High quality cleaned Sharbati wheat, perfect for flour and chapati.',
        isAvailable: true
      },
      {
        seller: anil._id,
        name: 'Pure Buffalo Fresh Milk (ताजा भैंस का दूध)',
        category: 'dairy',
        price: 65,
        quantity: 40,
        unit: 'litre',
        location: 'Dairy Farm, Purana Gaon',
        contactPhone: '9812345678',
        description: 'Fresh raw milk with 7.0+ fat, delivered fresh every morning and evening.',
        isAvailable: true
      },
      {
        seller: ramesh._id,
        name: 'Organic Alphonso Mangoes (ताजे आम)',
        category: 'fruits',
        price: 90,
        quantity: 80,
        unit: 'kg',
        location: 'Bagicha Ward 2, Rampur',
        contactPhone: '9876543210',
        description: 'Sweet and juicy orchard ripe mangoes, chemical-free ripening.',
        isAvailable: true
      },
      {
        seller: anil._id,
        name: 'Green Spicy Chilies (हरी मिर्च)',
        category: 'vegetables',
        price: 45,
        quantity: 60,
        unit: 'kg',
        location: 'Plot 4, Purana Gaon',
        contactPhone: '9812345678',
        description: 'Pungent fresh green chilies harvested directly from farm beds.',
        isAvailable: true
      },
      {
        seller: anil._id,
        name: 'Cold Pressed Mustard Oil (सरसों का तेल)',
        category: 'other',
        price: 160,
        quantity: 50,
        unit: 'litre',
        location: 'Purana Gaon Kolhu',
        contactPhone: '9812345678',
        description: '100% pure kachi ghani unrefined mustard oil pressed from local sarson seeds.',
        isAvailable: true
      }
    ]);
    console.log('Seeded 6 Krishi Market Products.');

    // 6. Seed Village Notices (4 Notices)
    await Notice.create([
      {
        title: 'Gram Sabha Special Meeting Regarding Road Repair',
        body: 'All village residents are requested to attend the monthly Gram Sabha gathering at the Panchayat Bhawan this Sunday at 10:00 AM to finalize the new concrete road plan.',
        type: 'meeting',
        date: new Date()
      },
      {
        title: 'Pulse Polio Immunization Drive for Children (0-5 Years)',
        body: 'Government Primary Health Centre is conducting a nationwide pulse polio vaccination camp at the Anganwadi Centre from 9 AM to 4 PM. Please bring your toddlers.',
        type: 'camp',
        date: new Date()
      },
      {
        title: 'Canal Water Supply Schedule for Rabi Irrigation',
        body: 'Irrigation canal water will be released to Western fields on Monday and Thursday between 6:00 AM and 6:00 PM. Please schedule your field watering accordingly.',
        type: 'water',
        date: new Date()
      },
      {
        title: 'Free Soil Health Card Distribution Camp',
        body: 'Agriculture department officers will be testing soil samples and distributing free Soil Health Cards to all registered farmers on Wednesday at the Panchayat Bhawan.',
        type: 'general',
        date: new Date()
      }
    ]);
    console.log('Seeded 4 Village Notices.');

    console.log('Mini Project database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
