import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import pokemonModel from '../schema/pokemon.js';
import User from '../schema/user.js';
import { connectDB } from '../connect.js';
import bcryptjs from 'bcryptjs';
import fetch from 'node-fetch';

const runSeed = async () => {
  try {
    await connectDB();

    console.log('--- Vérification des Pokémons existants ---');
    const existing = await pokemonModel.countDocuments();
    if (existing > 0) {
      console.log(`Il y a déjà ${existing} Pokémons en base. Suppression préalable non effectuée.`);
    } else {
      // On accepte plusieurs sources pour le seed :
      // - Fichier local via SEED_FILE_PATH
      // - URL distante via SEED_REMOTE_URL
      // Si aucune source fournie, on explique la marche à suivre.
      const filePath = process.env.SEED_FILE_PATH;
      const remoteUrl = process.env.SEED_REMOTE_URL;

      let pokemons = null;

      if (filePath) {
        const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
        if (!fs.existsSync(abs)) {
          console.error(`Fichier de seed introuvable: ${abs}`);
          process.exit(1);
        }
        const raw = fs.readFileSync(abs, 'utf-8');
        pokemons = JSON.parse(raw);
        console.log(`Import des Pokémons depuis le fichier ${abs} ...`);
      } else if (remoteUrl) {
        console.log(`Récupération des Pokémons depuis ${remoteUrl} ...`);
        const res = await fetch(remoteUrl);
        if (!res.ok) throw new Error(`Échec de récupération: ${res.status} ${res.statusText}`);
        pokemons = await res.json();
      } else {
        console.error('Aucune source de seed fournie. Définissez SEED_FILE_PATH ou SEED_REMOTE_URL, ou importez via POST /pokemons/import.');
        process.exit(1);
      }

      if (!Array.isArray(pokemons) || pokemons.length === 0) {
        console.error('La source fournie ne contient pas un tableau de Pokémons valide.');
        process.exit(1);
      }

      const res = await pokemonModel.insertMany(pokemons);
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
