/**
 * ========================================
 * SERVEUR BACKEND - PokéDex Full Stack
 * ========================================
 * 
 * Ce fichier est le point d'entrée principal du serveur Express
 * Il configure l'application, les routes, et démarre le serveur sur le port 3000
 * 
 * Installation des dépendances :
 * npm install
 * 
 * Démarrer le serveur en développement :
 * npm run dev
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importer la connexion MongoDB
import './connect.js';

// Importer les routes
import authRoutes from './routes/auth.js';
import pokemonRoutes from './routes/pokemon.js';
import favoritesRoutes from './routes/favorites.js';

// Charger les variables d'environnement du fichier .env
dotenv.config();

// Créer l'application Express
const app = express();

// ========================================
// MIDDLEWARES
// ========================================

/**
 * Middleware CORS (Cross-Origin Resource Sharing)
 * Permet au frontend de faire des requêtes vers ce backend
 * origin: URL du frontend
 * credentials: permet d'envoyer les cookies/tokens
 */
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));

/**
 * Middleware pour parser le JSON
 * Convertit les corps de requête JSON en objets JavaScript
 */
app.use(express.json());

/**
 * Middleware pour parser les données URL-encoded
 * Supporte les formulaires traditionnels
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Middleware pour servir les fichiers statiques (images, CSS, etc.)
 * Les fichiers dans le dossier "assets" sont accessibles publiquement
 */

//app.use(express.static('assets'));

/*
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './connect.js';
import pokemon from './schema/pokemon.js';

const app = express();

//app.use(cors());             // Autorise le Frontend à se connecter
app.use(express.json());     // Permet de lire le body des requêtes POST/PUT
*/
app.use('/assets', express.static('assets'));



// ========================================
// ROUTES
// ========================================

/**
 * Route de test : GET /
 * Simple vérification que le serveur est en ligne
 */
app.get('/', (req, res) => {
  res.json({ 
    message: '🎮 Serveur PokéDex actif et prêt',
    version: '1.0.0',
    endpoints: {
      pokemon: '/pokemons',
      auth: '/auth',
      favorites: '/favorites'
    }
  });
});

/**
 * Routes d'authentification
 * POST /auth/register - Créer un compte
 * POST /auth/login - Se connecter
 * POST /auth/logout - Se déconnecter
 */
app.use('/auth', authRoutes);

/**
 * Routes Pokémon
 * GET /pokemons - Récupérer tous les Pokémons avec pagination/filtres
 * GET /pokemons/:id - Récupérer un Pokémon spécifique
 * GET /pokemons/types/all - Récupérer tous les types disponibles
 * POST /pokemons/import - Importer les Pokémons du JSON
 * DELETE /pokemons/clear - Supprimer tous les Pokémons (dev only)
 */
app.use('/pokemons', pokemonRoutes);

/**
 * Routes Favoris (authentifiées)
 * GET /favorites - Récupérer les favoris de l'utilisateur
 * POST /favorites - Ajouter un Pokémon aux favoris
 * DELETE /favorites/:pokemonId - Supprimer des favoris
 * GET /favorites/check/:pokemonId - Vérifier si c'est un favori
 */
app.use('/favorites', favoritesRoutes);

// ========================================
// GESTION DES ERREURS
// ========================================

/**
 * Route 404 - Endpoint non trouvé
 * Retourne une erreur si la route n'existe pas
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.path} n'existe pas`,
    method: req.method
  });
});

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════╗
║  🎮 Serveur PokéDex en écoute!    ║
║  Port: ${PORT}                        ║
║  URL: http://localhost:${PORT}        ║
╚════════════════════════════════════╝
  `);
  console.log('💡 Conseil : Utilisez "npm run dev" pour le développement avec auto-reload');


});

//connectDB();


