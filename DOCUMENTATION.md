# 📚 Documentation Backend PokéDex - Guide Complet

## Table des matières
1. [Installation et démarrage](#installation-et-démarrage)
2. [Architecture du projet](#architecture-du-projet)
3. [Endpoints API](#endpoints-api)
4. [Authentification JWT](#authentification-jwt)
5. [Intégration Frontend](#intégration-frontend)
6. [Importer les Pokémons](#importer-les-pokémons)
7 [Gestion des erreurs](#gestion-des-erreurs)
8. [Variables d'environnement](#variables-denvironnement)

---

## Installation et démarrage

### Prérequis
- **Node.js** (v18+) installé
- **MongoDB** lancé sur `localhost:27017`
- **npm** ou **yarn**

### Installation
```bash
cd tp-partie-back-Alexia-554
npm install
```

### Démarrer le serveur
```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
node index.js
```

Le serveur démarre sur **http://localhost:3000**

---

## Architecture du projet

```
tp-partie-back-Alexia-554/
├── index.js                  # Fichier principal (point d'entrée)
├── connect.js               # Connexion à MongoDB
├── package.json             # Dépendances du projet
├── .env                     # Variables d'environnement
│
├── schema/                  # Définition des modèles de données
│   ├── pokemon.js          # Schéma Pokémon
│   ├── user.js             # Schéma Utilisateur
│   └── favorite.js         # Schéma Favoris
│
├── routes/                  # Endpoints API
│   ├── pokemon.js          # Récupérer/filtrer Pokémons
│   ├── auth.js             # Authentification (register/login)
│   └── favorites.js        # Gestion des favoris
│
├── middleware/              # Fonctionnalités transversales
│   └── auth.js             # Authentification JWT
│
└── data/                    # Données
    ├── pokemonsList.js     # Liste des Pokémons à importer
    └── pokemons.json       # (optionnel) Format JSON
```

---

## Endpoints API

### 🏠 Racine

#### GET `/`
Vérifie que le serveur est actif
```bash
curl http://localhost:3000
```
**Réponse:**
```json
{
  "message": "🎮 Serveur PokéDex actif et prêt",
  "version": "1.0.0",
  "endpoints": {
    "pokemon": "/pokemons",
    "auth": "/auth",
    "favorites": "/favorites"
  }
}
```

---

### 👤 Authentification (`/auth`)

#### POST `/auth/register`
Créer un nouvel utilisateur

**Données requises:**
```json
{
  "email": "user@example.com",
  "username": "monnom",
  "password": "monmotdepasse"
}
```

**Réponse (201):**
```json
{
  "message": "✅ Utilisateur créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "monnom"
  }
}
```

**Erreur (400):**
```json
{
  "error": "Email déjà utilisé",
  "message": "Un compte avec cet email existe déjà"
}
```

---

#### POST `/auth/login`
Se connecter avec ses identifiants

**Données requises:**
```json
{
  "email": "user@example.com",
  "password": "monmotdepasse"
}
```

**Réponse (200):**
```json
{
  "message": "✅ Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "monnom"
  }
}
```

---

#### POST `/auth/logout`
Se déconnecter (confirmation côté serveur)

**Réponse (200):**
```json
{
  "message": "✅ Déconnexion réussie. Supprimez le token côté client."
}
```

---

### 🎮 Pokémons (`/pokemons`)

#### GET `/pokemons`
Récupérer tous les Pokémons avec pagination, filtres et recherche

**Paramètres de requête (optionnels):**
| Paramètre | Type | Défaut | Description |
|-----------|------|--------|-------------|
| page | number | 1 | Numéro de page |
| limit | number | 12 | Pokémons par page |
| type | string | - | Filtrer par type (ex: "Fire") |
| search | string | - | Rechercher par nom |

**Exemples:**
```bash
# Récupérer la page 1 avec 12 Pokémons
curl http://localhost:3000/pokemons

# Page 2 avec 20 Pokémons par page
curl http://localhost:3000/pokemons?page=2&limit=20

# Filtrer par type "Fire"
curl http://localhost:3000/pokemons?type=Fire

# Rechercher "pikachu"
curl http://localhost:3000/pokemons?search=pikachu

# Combiner plusieurs filtres
curl http://localhost:3000/pokemons?type=Water&search=squir&page=1&limit=10
```

**Réponse (200):**
```json
{
  "pokemons": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "id": 1,
      "name": {
        "english": "Bulbasaur",
        "french": "Bulbizarre",
        "japanese": "フシギダネ",
        "chinese": "妙蛙种子"
      },
      "type": ["Grass", "Poison"],
      "base": {
        "HP": 45,
        "Attack": 49,
        "Defense": 49,
        "SpecialAttack": 65,
        "SpecialDefense": 65,
        "Speed": 45
      },
      "image": "http://localhost:3000/assets/pokemons/1.png"
    },
    ...
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 67,
    "totalPokemons": 800,
    "pokemonsPerPage": 12
  }
}
```

---

#### GET `/pokemons/:id`
Récupérer un Pokémon spécifique par son ID

```bash
curl http://localhost:3000/pokemons/25  # Pikachu
```

**Réponse (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id": 25,
  "name": {
    "english": "Pikachu",
    "french": "Pikachu",
    "japanese": "ピカチュウ",
    "chinese": "皮卡丘"
  },
  "type": ["Electric"],
  "base": {
    "HP": 35,
    "Attack": 55,
    "Defense": 40,
    "SpecialAttack": 50,
    "SpecialDefense": 50,
    "Speed": 90
  },
  "image": "http://localhost:3000/assets/pokemons/25.png"
}
```

---

#### GET `/pokemons/types/all`
Récupérer la liste de tous les types disponibles (pour les filtres)

```bash
curl http://localhost:3000/pokemons/types/all
```

**Réponse (200):**
```json
{
  "types": [
    "Bug",
    "Dark",
    "Dragon",
    "Electric",
    "Fairy",
    "Fighting",
    "Fire",
    "Flying",
    "Ghost",
    "Grass",
    "Ground",
    "Ice",
    "Normal",
    "Poison",
    "Psychic",
    "Rock",
    "Steel",
    "Water"
  ]
}
```

---

#### POST `/pokemons/import`
Importer tous les Pokémons du fichier JSON dans la base de données
⚠️ **À faire une seule fois après la création de la base de données !**

```bash
curl -X POST http://localhost:3000/pokemons/import
```

**Réponse (201):**
```json
{
  "message": "✅ 800 Pokémons importés avec succès",
  "count": 800
}
```

---

#### DELETE `/pokemons/clear`
Supprimer TOUS les Pokémons (à utiliser avec prudence en développement)

```bash
curl -X DELETE http://localhost:3000/pokemons/clear
```

---

### ⭐ Favoris (`/favorites`) - AUTHENTIFICATION REQUISE

Tous les endpoints `/favorites` nécessitent un **token JWT** valide dans l'entête `Authorization`.

#### GET `/favorites`
Récupérer les Pokémons favoris de l'utilisateur connecté

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/favorites
```

**Réponse (200):**
```json
{
  "favorites": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "pokemonId": 25,
      "pokemonName": "Pikachu",
      "addedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439011",
      "pokemonId": 6,
      "pokemonName": "Charizard",
      "addedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "count": 2
}
```

---

#### POST `/favorites`
Ajouter un Pokémon aux favoris

**Données requises:**
```json
{
  "pokemonId": 25,
  "pokemonName": "Pikachu"
}
```

**Commande:**
```bash
curl -X POST http://localhost:3000/favorites \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pokemonId": 25, "pokemonName": "Pikachu"}'
```

**Réponse (201):**
```json
{
  "message": "✅ Pikachu ajouté aux favoris",
  "favorite": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "pokemonId": 25,
    "pokemonName": "Pikachu",
    "addedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

#### DELETE `/favorites/:pokemonId`
Supprimer un Pokémon des favoris

```bash
curl -X DELETE http://localhost:3000/favorites/25 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Réponse (200):**
```json
{
  "message": "✅ Pikachu supprimé des favoris"
}
```

---

#### GET `/favorites/check/:pokemonId`
Vérifier si un Pokémon est dans les favoris

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:3000/favorites/check/25
```

**Réponse (200):**
```json
{
  "isFavorite": true,
  "pokemonId": 25
}
```

---

## Authentification JWT

### Qu'est-ce que JWT?
JWT = JSON Web Token  
C'est un standard sécurisé pour authentifier les utilisateurs sans conserver une session côté serveur.

### Flux d'authentification

```
1. L'utilisateur se connecte (POST /auth/login)
   ↓
2. Le serveur crée un token JWT et le retourne
   ↓
3. Le client stocke le token (généralement dans localStorage)
   ↓
4. Pour chaque requête protégée, le client envoie le token dans l'entête Authorization
   ↓
5. Le serveur vérifie le token et traite la requête
```

### Utiliser le token dans les requêtes

**Format de l'entête:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Exemple avec fetch (JavaScript):**
```javascript
const token = localStorage.getItem('token');

fetch('http://localhost:3000/favorites', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log(data));
```

**Exemple avec curl:**
```bash
curl http://localhost:3000/favorites \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Durée de validité du token
- Les tokens expirent après **24 heures**
- Après expiration, l'utilisateur doit se reconnecter
- À améliorer en production avec un système de refresh tokens

---

## Intégration Frontend

### 1. Configuration du frontend (React)

Créer un fichier `src/api/api.js` pour configurer les appels API:

```javascript
// src/api/api.js

const API_URL = "http://localhost:3000";

// récupérer token JWT depuis localStorage
const getToken = () => localStorage.getItem('token');

// Fonction pour faire des requêtes GET
export const getPokemons = async (page = 1, limit = 12, type = "", search = "") => {
  const params = new URLSearchParams({ page, limit, type, search });
  const response = await fetch(`${API_URL}/pokemons?${params}`);
  if (!response.ok) throw new Error("Erreur réseau");
  return response.json();
};

// Fonction pour récupérer un Pokémon
export const getPokemonById = async (id) => {
  const response = await fetch(`${API_URL}/pokemons/${id}`);
  if (!response.ok) throw new Error("Pokémon non trouvé");
  return response.json();
};

// Fonction pour récupérer tous les types
export const getTypes = async () => {
  const response = await fetch(`${API_URL}/pokemons/types/all`);
  if (!response.ok) throw new Error("Erreur réseau");
  return response.json();
};

// Inscription
export const register = async (email, username, password) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password })
  });
  if (!response.ok) throw new Error("Erreur lors de l'inscription");
  return response.json();
};

// Connexion
export const login = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error("Identifiants invalides");
  const data = await response.json();
  localStorage.setItem('token', data.token); // Sauvegarder le token
  return data;
};

// Récupérer les favoris (authentifié)
export const getFavorites = async () => {
  const response = await fetch(`${API_URL}/favorites`, {
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error("Erreur réseau");
  return response.json();
};

// Ajouter un favori (authentifié)
export const addFavorite = async (pokemonId, pokemonName) => {
  const response = await fetch(`${API_URL}/favorites`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${getToken()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ pokemonId, pokemonName })
  });
  if (!response.ok) throw new Error("Erreur lors de l'ajout");
  return response.json();
};

// Supprimer un favori (authentifié)
export const removeFavorite = async (pokemonId) => {
  const response = await fetch(`${API_URL}/favorites/${pokemonId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!response.ok) throw new Error("Erreur lors de la suppression");
  return response.json();
};

// Vérifier si un Pokémon est favori
export const isFavorite = async (pokemonId) => {
  const response = await fetch(`${API_URL}/favorites/check/${pokemonId}`, {
    headers: { "Authorization": `Bearer ${getToken()}` }
  });
  if (!response.ok) return { isFavorite: false };
  return response.json();
};
```

### 2. Intégrer dans un composant React

```javascript
// src/components/PokemonList/PokemonList.jsx

import { useEffect, useState } from 'react';
import { getPokemons, getTypes, addFavorite, removeFavorite, isFavorite } from '../../api/api';

export default function PokemonList() {
  const [pokemons, setPokemons] = useState([]);
  const [types, setTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState({});

  useEffect(() => {
    // Récupérer les Pokémons au chargement ou quand les filtres changent
    loadPokemons();
    loadTypes();
  }, [page, selectedType, search]);

  const loadPokemons = async () => {
    try {
      const data = await getPokemons(page, 12, selectedType, search);
      setPokemons(data.pokemons);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const loadTypes = async () => {
    try {
      const data = await getTypes();
      setTypes(data.types);
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleToggleFavorite = async (pokemonId, pokemonName) => {
    try {
      if (favorites[pokemonId]) {
        await removeFavorite(pokemonId);
        setFavorites({ ...favorites, [pokemonId]: false });
      } else {
        await addFavorite(pokemonId, pokemonName);
        setFavorites({ ...favorites, [pokemonId]: true });
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  return (
    <div>
      <h1>PokéDex</h1>
      
      {/* Filtres */}
      <div>
        <input 
          type="text" 
          placeholder="Rechercher un Pokémon..." 
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        
        <select value={selectedType} onChange={(e) => {
          setSelectedType(e.target.value);
          setPage(1);
        }}>
          <option value="">Tous les types</option>
          {types.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Liste des Pokémons */}
      <div className="pokemon-grid">
        {pokemons.map(pokemon => (
          <div key={pokemon.id} className="pokemon-card">
            <img src={pokemon.image} alt={pokemon.name.english} />
            <h3>{pokemon.name.french}</h3>
            <p>{pokemon.type.join(', ')}</p>
            <button onClick={() => handleToggleFavorite(pokemon.id, pokemon.name.english)}>
              {favorites[pokemon.id] ? '⭐ Retirer des favoris' : '☆ Ajouter aux favoris'}
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Précédent</button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Suivant</button>
      </div>
    </div>
  );
}
```

---

## Importer les Pokémons

### Étape 1: S'assurer que MongoDB est lancé
```bash
# Sur Windows avec MongoDB installé
mongod

# Ou avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Étape 2: Démarrer le serveur backend
```bash
npm run dev
```

### Étape 3: Faire la requête d'import
```bash
curl -X POST http://localhost:3000/pokemons/import
```

**Réponse attendue:**
```json
{
  "message": "✅ 800 Pokémons importés avec succès",
  "count": 800
}
```

### Vérifier l'import
```bash
# Récupérer les 3 premiers Pokémons
curl http://localhost:3000/pokemons?limit=3
```

---

## Gestion des erreurs

### Erreurs courantes

| Code HTTP | Erreur | Cause | Solution |
|-----------|--------|-------|----------|
| 400 | Bad Request | Données manquantes ou invalides | Vérifier le format JSON |
| 401 | Unauthorized | Token manquant ou expiré | Se reconnecter |
| 403 | Forbidden | Token invalide | Utiliser un token valide |
| 404 | Not Found | Route n'existe pas | Vérifier l'URL |
| 500 | Server Error | Erreur serveur | Vérifier les logs du serveur |

### Format d'erreur standard
```json
{
  "error": "Nom de l'erreur",
  "message": "Description détaillée"
}
```

---

## Variables d'environnement

Le fichier `.env` contient les variables de configuration:

```env
# Port du serveur
PORT=3000

# URL de l'API
API_URL=http://localhost:3000

# Clé secrète JWT (CHANGE EN PRODUCTION!)
JWT_SECRET=votre_super_secret_jwt_pokemondex_2024

# URL MongoDB
MONGODB_URL=mongodb://localhost:27017/pokemon-db

# Environnement
NODE_ENV=development

# URL du frontend (pour CORS)
FRONTEND_URL=http://localhost:5173
```

**⚠️ IMPORTANT:**
- Ne **JAMAIS** committer le `.env` en production
- Utiliser des valeurs sécurisées pour `JWT_SECRET`
- Changer `FRONTEND_URL` si votre frontend est sur un autre port

---

## Checklist de déploiement

- [ ] MongoDB est lancé et accessible
- [ ] `npm install` a été exécuté
- [ ] Les variables `.env` sont configurées
- [ ] Le serveur démarre sans erreur (`npm run dev`)
- [ ] Les endpoints répondent sur `http://localhost:3000`
- [ ] Les Pokémons ont été importés (`POST /pokemons/import`)
- [ ] Le frontend est configuré pour appeler `http://localhost:3000`
- [ ] CORS est activé pour le frontend sur le port 5173

---

## Support et dépannage

**Le serveur ne démarre pas?**
- Vérifier que le port 3000 est libre
- Vérifier que MongoDB est lancé
- Vérifier les logs pour les erreurs

**Les requêtes échouent?**
- Vérifier que le serveur est lancé (`npm run dev`)
- Vérifier l'URL exacte et la méthode HTTP
- Regarder les erreurs dans la console du serveur

**Les images ne s'affichent pas?**
- Vérifier que les fichiers existent dans `assets/pokemons/`
- Vérifier que le chemin dans `pokemonsList.js` est correct

---

**Bon développement! 🚀 May the code be with you!**