require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Country = require('../models/Country');
const City = require('../models/City');
const Address = require('../models/Address');
const Language = require('../models/Language');
const Category = require('../models/Category');
const Actor = require('../models/Actor');
const Movie = require('../models/Movie');
const Store = require('../models/Store');
const Customer = require('../models/Customer');
const Inventory = require('../models/Inventory');
const Rental = require('../models/Rental');
const Payment = require('../models/Payment');

const pick = (arr, count) => arr.slice(0, count);

const run = async () => {
  await connectDB();
  await Promise.all([User, Country, City, Address, Language, Category, Actor, Movie, Store, Customer, Inventory, Rental, Payment].map(m => m.deleteMany({})));

  const countries = await Country.insertMany(['India', 'United States', 'United Kingdom'].map(name => ({ name })));
  const cities = await City.insertMany([
    { name: 'Ahmedabad', country: countries[0]._id }, { name: 'Mumbai', country: countries[0]._id },
    { name: 'Bengaluru', country: countries[0]._id }, { name: 'New York', country: countries[1]._id },
    { name: 'London', country: countries[2]._id }
  ]);
  const addresses = await Address.insertMany(Array.from({ length: 18 }).map((_, i) => ({
    line1: `${101 + i} Market Street`, line2: i % 2 ? 'Near City Mall' : '',
    district: ['West', 'Central', 'North'][i % 3], city: cities[i % cities.length]._id,
    postalCode: `3800${(10 + i).toString().slice(-2)}`, phone: `98765432${(10 + i).toString().slice(-2)}`
  })));

  const admin = await User.create({ firstName: 'Admin', lastName: 'Manager', email: 'admin@movierental.com', username: 'admin', password: 'Admin@123', role: 'Admin', phone: '9876543210', address: addresses[0]._id });
  const staff = await User.create({ firstName: 'Riya', lastName: 'Shah', email: 'staff@movierental.com', username: 'riya', password: 'Staff@123', role: 'Staff', phone: '9876543211', address: addresses[1]._id });
  const stores = await Store.insertMany([
    { name: 'CineLedger Downtown', manager: admin._id, address: addresses[0]._id },
    { name: 'CineLedger West Hub', manager: staff._id, address: addresses[1]._id }
  ]);
  await User.findByIdAndUpdate(admin._id, { store: stores[0]._id });
  await User.findByIdAndUpdate(staff._id, { store: stores[1]._id });

  const languages = await Language.insertMany(['English', 'Hindi', 'Gujarati', 'Tamil', 'Spanish'].map(name => ({ name })));
  const categories = await Category.insertMany(['Action', 'Comedy', 'Drama', 'Thriller', 'Sci-Fi', 'Romance', 'Family', 'Documentary'].map(name => ({ name, description: `${name} films and audience favorites.` })));
  const actorNames = ['Aarav Mehta', 'Maya Kapoor', 'Daniel Brooks', 'Nisha Rao', 'Kabir Khan', 'Emma Clarke', 'Vikram Sethi', 'Olivia Stone', 'Ryan Patel', 'Sara Lewis', 'Priya Desai', 'Noah Grant', 'Isha Nair', 'Liam Carter', 'Zoya Mir'];
  const actors = await Actor.insertMany(actorNames.map(n => ({ firstName: n.split(' ')[0], lastName: n.split(' ').slice(1).join(' '), bio: `${n} is known for versatile performances across commercial and independent cinema.` })));

  const titles = ['Metro Chase', 'The Last Archive', 'Silent Harbor', 'Laughing Friday', 'Northern Lights', 'Code Horizon', 'Monsoon Hearts', 'Family Table', 'Night Signal', 'Desert Run', 'Ocean House', 'The Startup', 'Royal Street', 'Second Chance', 'Galaxy Route', 'Hidden Ledger', 'Summer Tune', 'Final Witness', 'Village Hero', 'Blue Notebook', 'City of Glass'];
  const movies = [];
  for (let i = 0; i < titles.length; i++) {
    movies.push(await Movie.create({
      title: titles[i],
      description: `${titles[i]} is a polished feature film with strong rental demand and repeat customer interest.`,
      releaseYear: 2002 + (i % 22),
      language: languages[i % languages.length]._id,
      rentalDuration: 3 + (i % 5),
      rentalRate: 49 + (i % 6) * 10,
      length: 95 + (i % 8) * 12,
      replacementCost: 399 + (i % 8) * 60,
      rating: ['G', 'PG', 'PG-13', 'R'][i % 4],
      specialFeatures: ['Trailers', 'Deleted Scenes'].slice(0, 1 + (i % 2)),
      actors: pick(actors.slice(i % actors.length).concat(actors), 3).map(a => a._id),
      categories: [categories[i % categories.length]._id, categories[(i + 2) % categories.length]._id],
      poster: `https://picsum.photos/seed/movie-${i}/500/750`
    }));
  }
  for (const movie of movies) await Actor.updateMany({ _id: { $in: movie.actors } }, { $addToSet: { movies: movie._id } });

  const customers = await Customer.insertMany(Array.from({ length: 12 }).map((_, i) => ({
    firstName: ['Dev', 'Anika', 'Jay', 'Neha', 'Vivaan', 'Aisha', 'Rohan', 'Meera', 'Karan', 'Tara', 'Yash', 'Diya'][i],
    lastName: ['Patel', 'Shah', 'Desai', 'Mehta'][i % 4],
    email: `customer${i + 1}@example.com`,
    phone: `90000000${(10 + i).toString().slice(-2)}`,
    address: addresses[2 + i]._id,
    store: stores[i % stores.length]._id,
    active: i !== 11
  })));

  const inventory = [];
  let sku = 1000;
  for (const movie of movies) {
    for (const store of stores) inventory.push(await Inventory.create({ movie: movie._id, store: store._id, sku: `CL-${sku++}`, status: 'Available' }));
  }

  for (let i = 0; i < 10; i++) {
    const inv = inventory[i];
    const rental = await Rental.create({ customer: customers[i % customers.length]._id, inventory: inv._id, staff: i % 2 ? staff._id : admin._id, rentalAmount: movies[i].rentalRate, status: i < 5 ? 'Returned' : 'Active', returnDate: i < 5 ? new Date(Date.now() - i * 86400000) : undefined });
    await Payment.create({ customer: rental.customer, rental: rental._id, staff: rental.staff, amount: rental.rentalAmount, paymentMethod: ['Cash', 'Card', 'UPI'][i % 3], status: 'Paid', paymentDate: new Date(Date.now() - i * 86400000) });
    if (i >= 5) await Inventory.findByIdAndUpdate(inv._id, { status: 'Rented', available: false });
  }

  console.log('Seed completed');
  console.log('Admin: admin@movierental.com / Admin@123');
  console.log('Staff: staff@movierental.com / Staff@123');
  await mongoose.disconnect();
};

run().catch(async error => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
