import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import pokemonModel from '../schema/pokemon.js';
import User from '../schema/user.js';
import pokemonsList from '../data/pokemonsList.js';
import { connectDB } from '../connect.js';
import bcryptjs from 'bcryptjs';

const runSeed = async () => {
  try {
    await connectDB();

    console.log('--- Vérification des Pokémons existants ---');
    const existing = await pokemonModel.countDocuments();
    if (existing > 0) {
      console.log(`Il y a déjà ${existing} Pokémons en base. Suppression préalable non effectuée.`);
    } else {
      console.log('Import des Pokémons depuis data/pokemonsList.js ...');
      const res = await pokemonModel.insertMany(pokemonsList);
      console.log(`✅ Import terminé : ${res.length} Pokémons ajoutés.`);
    }

    // Créer un utilisateur de test si non existant
    const testEmail = process.env.SEED_TEST_EMAIL || 'test@example.com';
    const testUser = await User.findOne({ email: testEmail });
    if (testUser) {
      console.log(`Utilisateur de test déjà présent : ${testEmail}`);
    } else {
      const pwd = process.env.SEED_TEST_PASSWORD || 'password123';
      const hashed = await bcryptjs.hash(pwd, 10);
      const newUser = new User({ email: testEmail, username: 'testuser', password: hashed });
      await newUser.save();
      console.log(`✅ Utilisateur de test créé : ${testEmail} / mot de passe: ${pwd}`);
    }

    console.log('\n--- Seed terminé ---');
    process.exit(0);
  } catch (err) {
    console.error('Erreur pendant le seed :', err);
    process.exit(1);
  }
};

runSeed();
