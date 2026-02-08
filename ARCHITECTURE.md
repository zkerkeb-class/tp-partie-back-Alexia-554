# 🏗️ Architecture & Flux de l'Application

## 📐 Diagramme de l'architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         INTERNET / NAVIGATEUR                       │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                ┌─────────▼──────────┐
                │   FRONTEND REACT   │
                │  (Port 5173)       │
                │                    │
                │ - Affichage        │
                │ - Formulaires      │
                │ - État local       │
                └─────────┬──────────┘
                          │
         ┌────────────────┼────────────────┐
         │   HTTP / REST API Calls        │
         │   (JSON + JWT Tokens)          │
         └────────────────┼────────────────┘
                          │
                ┌─────────▼──────────┐
                │  EXPRESS SERVER    │
                │  (Port 3000)       │
                │                    │
                │  MIDDLEWARE:       │
                │  ├─ CORS           │
                │  ├─ JSON Parser    │
                │  └─ JWT Auth       │
                └─────────┬──────────┘
                          │
         ┌────────────────┼────────────────┐
         │   ROUTING SYSTEM               │
         │                                │
         │  /auth        → auth.js        │
         │  /pokemons    → pokemon.js     │
         │  /favorites   → favorites.js   │
         │                                │
         └────────────────┼────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │   BUSINESS LOGIC              │
         │                                │
         │  • Validation                 │
         │  • Authentification            │
         │  • Recherche/Filtres          │
         │  • Favoris                    │
         │                                │
         └────────────────┼────────────────┘
                          │
                ┌─────────▼──────────┐
                │  MONGOOSE MODELS   │
                │                    │
                │  ├─ User           │
                │  ├─ Pokemon        │
                │  └─ Favorite       │
                └─────────┬──────────┘
                          │
                ┌─────────▼──────────┐
                │   MONGODB          │
                │  (Port 27017)      │
                │                    │
                │ Collections:       │
                │ ├─ users           │
                │ ├─ pokemons        │
                │ └─ favorites       │
                └────────────────────┘
```

---

## 🔄 Flux d'une requête (Request/Response)

### Exemple: Afficher les Pokémons

```
Timeline d'une requête:

User clicks "Afficher Pokémons"
    ↓
fetch('http://localhost:3000/pokemons?page=1&limit=12')
    ↓
Browser send HTTP GET
    ↓
Express reçoit la requête
    ├─ CORS middleware ✓
    ├─ JSON parser ✓
    └─ Route handler
        ↓
        router.get("/", async (req, res) => {
            // Construire les filtres
            // Compter le total
            // Récupérer les données DB
            // Retourner JSON response
        })
    ↓
MongoDB query retourne 12 Pokémons
    ↓
Express crée la réponse JSON:
{
  "pokemons": [...],
  "pagination": { ... }
}
    ↓
Frontend reçoit la réponse
    ↓
React affiche les Pokémons à l'utilisateur
```

---

## 🔐 Flux d'authentification

### Inscription (Register)

```
┌─────────────┐
│ User Form   │
│ Input:      │
│ ├─ Email    │
│ ├─ Username │
│ └─ Password │
└──────┬──────┘
       │
       │ POST /auth/register
       │ { email, username, password }
       ▼
┌──────────────────────┐
│ Express validate     │
│ ├─ Fields required?  │
│ ├─ Email exists?     │
│ └─ Username exists?  │
└──────┬───────────────┘
       │ ✓ Valid
       ▼
┌──────────────────────┐
│ Hash password        │
│ bcryptjs.hash()      │
│ ❌ Never store plain!│
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Save to MongoDB      │
│ users.create({       │
│   email,             │
│   username,          │
│   password: hash     │
│ })                   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Generate JWT Token   │
│ payload: {           │
│   id, email, username│
│   expiresIn: "24h"   │
│ }                    │
└──────┬───────────────┘
       │
       │ Response:
       │ {
       │   token: "...",
       │   user: { ... }
       │ }
       ▼
┌─────────────┐
│ Frontend    │
│ Save token  │
│ localStorage│
└─────────────┘
```

### Connexion (Login)

```
┌──────────────────────┐
│ User Input:          │
│ ├─ Email             │
│ └─ Password (plain)  │
└──────┬───────────────┘
       │
       │ POST /auth/login
       ▼
┌──────────────────────┐
│ Find user by email   │
│ in MongoDB           │
└──────┬───────────────┘
       │
       ├─ NOT FOUND ──→ 401 Unauthorized
       │
       ▼
┌──────────────────────┐
│ Compare passwords    │
│ bcryptjs.compare(    │
│   plainPassword,     │
│   hashedPassword     │
│ )                    │
└──────┬───────────────┘
       │
       ├─ NO MATCH ──→ 401 Unauthorized
       │
       ▼
┌──────────────────────┐
│ Generate JWT Token   │
│ Send to Frontend     │
└──────┬───────────────┘
       │
       ▼
┌─────────────┐
│ Frontend    │
│ Get token   │
│ Ready to    │
│ authenticate│
└─────────────┘
```

---

## 🎮 Flux d'une requête authentifiée

### Ajouter un favori

```
User clicks "⭐ Add favorite"
    │
    ├─ Get token: localStorage.getItem('token')
    │
    │ POST /favorites
    │ Header: Authorization: Bearer <token>
    │ Body: { pokemonId: 25, pokemonName: "Pikachu" }
    ▼
┌──────────────────────┐
│ Express Middleware   │
│ authenticateToken()  │
│                      │
│ 1. Get token from    │
│    Authorization     │
│    header            │
└──────┬───────────────┘
       │
       ├─ NO TOKEN ──→ 401 Unauthorized
       │
       ▼
┌──────────────────────┐
│ 2. Verify JWT Token  │
│ jwt.verify(          │
│   token,             │
│   JWT_SECRET         │
│ )                    │
└──────┬───────────────┘
       │
       ├─ INVALID/EXPIRED ──→ 403 Forbidden
       │
       ▼
┌──────────────────────┐
│ 3. Extract user info │
│ req.user = decoded   │
│ payload              │
│ ✓ User authenticated│
└──────┬───────────────┘
       │
       │ Proceed to route handler
       ▼
┌──────────────────────┐
│ route.post("/", ...) │
│                      │
│ 1. Validate data     │
│ 2. Check duplicate   │
│ 3. Create favorite   │
│ 4. Save to DB        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Response:            │
│ {                    │
│   message: "✅ ...",  │
│   favorite: { ... }  │
│ }                    │
└──────┬───────────────┘
       │
       ▼
┌─────────────┐
│ Frontend    │
│ Update UI   │
│ Show ⭐    │
└─────────────┘
```

---

## 📊 Flux de données - Pokémons

### Import initial

```
1. Fichier pokemonsList.js contient 800+ Pokémons
   ↓
2. POST /pokemons/import
   ↓
3. Express read JSON array
   ↓
4. pokemon.insertMany(pokemonsList)
   ↓
5. MongoDB créé une collection "pokemons" avec 800 documents
   ↓
6. Autres requêtes peuvent maintenant récupérer ces données
```

### Recherche avec filtres

```
User:
  Search: "pika"
  Type: "Electric"
  Page: 1

    ↓

Frontend: 
  fetch('/pokemons?search=pika&type=Electric&page=1&limit=12')

    ↓

Express route handler:
  1. Build MongoDB filter:
     {
       type: "Electric",
       $or: [
         { "name.english": /pika/i },
         { "name.french": /pika/i },
         { "name.japanese": /pika/i }
       ]
     }

  2. Count total: 5 Pokémons matchent

  3. Skip: (1-1) * 12 = 0
     Limit: 12
     Sort: { id: 1 }

    ↓

MongoDB returns:
  [
    { id: 25, name: { english: "Pikachu", ... }, ... }
  ]

    ↓

Express Response:
  {
    pokemons: [{ id: 25, ... }],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalPokemons: 1,
      pokemonsPerPage: 12
    }
  }

    ↓

Frontend displays 1 Pokémon (Pikachu)
```

---

## 🔑 Modèle de sécurité

### Protection des routes

```
Public Routes (Pas d'authentification requise):
  ├─ GET /pokemons
  ├─ GET /pokemons/:id
  ├─ GET /pokemons/types/all
  ├─ POST /pokemons/import (à protéger en production)
  ├─ POST /auth/register
  ├─ POST /auth/login
  └─ POST /auth/logout

Protected Routes (JWT Token requis):
  ├─ GET /favorites
  ├─ POST /favorites
  ├─ DELETE /favorites/:pokemonId
  └─ GET /favorites/check/:pokemonId

      Requête:
      GET /favorites
      Header: Authorization: Bearer eyJhbGc...

           ↓

      Middleware authenticateToken:
      • Extrait le token de l'entête
      • Vérifie la signature JWT
      • Décode le payload
      • Ajoute req.user
      • Permet d'accéder au userId
```

---

## 💾 Schéma de données MongoDB

### Collections et relations

```
Users Collection:
┌─────────────────────────┐
│ _id: ObjectId           │ ← Primary Key
│ email: string           │ ← Unique
│ username: string        │ ← Unique
│ password: string        │ ← Hashed
│ createdAt: Date         │
│ lastLogin: Date         │
└─────────────────────────┘
       │
       │ (One to Many)
       │
       └──→ Favorites Collection
            ┌─────────────────────────┐
            │ _id: ObjectId           │
            │ userId: ObjectId (ref)  │ ← FK vers Users
            │ pokemonId: number       │
            │ pokemonName: string     │
            │ addedAt: Date           │
            │                         │
            │ Index: {userId, pokemon}│
            │ Unique: true            │ ← Pas de doublons
            └─────────────────────────┘

Pokemon Collection:
┌─────────────────────────┐
│ _id: ObjectId           │
│ id: number              │ ← Unique, Indexed
│ name: {                 │
│   english: string       │ ← Searchable
│   french: string        │ ← Searchable
│   japanese: string      │ ← Searchable
│   chinese: string       │
│ }                       │
│ type: [string]          │ ← Indexed
│ base: {                 │
│   HP: number            │
│   Attack: number        │
│   Defense: number       │
│   ...                   │
│ }                       │
│ image: string           │
└─────────────────────────┘

Indexes:
  • pokemon.id (unique)
  • pokemon.type
  • pokemon.name (text search)
```

---

## 🔀 État du Frontend Storage

### LocalStorage (Client-side)

```
localStorage:
├─ authToken: "eyJhbGciOiJIUzI1NiIs..." (JWT)
│  └─ Utilisé dans: Authorization header de chaque requête
│
└─ user: JSON.stringify({
     id: "507f1f77bcf86cd799439011",
     email: "user@example.com",
     username: "alexia_dex"
   })
   └─ Utilisé dans: Afficher les infos utilisateur
```

### State Management (React)

```
App.jsx
├─ AuthContext
│  ├─ user: null | { id, email, username }
│  ├─ isLoading: boolean
│  └─ logout(): void
│
├─ PokemonList.jsx
│  ├─ pokemons: Array
│  ├─ page: number
│  ├─ types: Array
│  ├─ selectedType: string
│  ├─ search: string
│  ├─ loading: boolean
│  └─ favorites: { pokemonId: boolean }
│
└─ LoginForm.jsx
   ├─ email: string
   ├─ password: string
   ├─ username: string
   ├─ error: string
   └─ loading: boolean
```

---

## 📶 Flux de chargement d'une page Pokémon

```
1. Frontend charge
   ↓
2. Check localStorage for token
   ├─ Si token existe → User logged in
   └─ Si pas de token → User anonymous
   ↓
3. GET /pokemons (sans token = OK)
   ↓
4. Affiche 12 Pokémons de la page 1
   ↓
5. Si User logged in:
   GET /favorites (avec token)
   ↓
   Compare chaque pokemon ID avec favorites
   ↓
   Mark favorites avec ⭐
   ↓
6. User can:
   - Search/Filter (refetch avec nouveaux params)
   - Paginate (refetch page 2)
   - Click ⭐ Add (si authenticated)
```

---

## 🔄 Synchronisation Frontend-Backend

```
Frontend State Update:
Search Input change
    ↓
onChange → setState("pika")
    ↓
useEffect triggered
    ↓
fetch(/pokemons?search=pika&page=1)
    ↓
Response arrives
    ↓
setPokemons(data)
    ↓
Component re-renders
    ↓
User sees "Pikachu" in list
```

---

## ⚡ Flow de gestion des erreurs

```
Try-Catch à chaque niveau:

Frontend:
  try {
    const data = await fetch(url)
    setPokemons(data)
  } catch(err) {
    setError("Erreur réseau")
  }

         ↓

Express Route:
  try {
    const data = await pokemon.find(filter)
    res.json(data)
  } catch(err) {
    res.status(500).json({
      error: "Erreur serveur",
      message: err.message
    })
  }

         ↓

MongoDB Driver:
  try {
    db.collection.find()
  } catch(err) {
    throw new Error("DB connection failed")
  }
```

---

Ce diagramme montre l'architecture complète de votre application! 🚀