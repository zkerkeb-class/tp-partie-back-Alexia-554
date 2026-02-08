# 📖 Guide d'Installation Complet - Backend PokéDex

## 🎯 Vue d'ensemble

Ce backend est une API REST complète pour une application PokéDex avec:
- ✅ Authentification par JWT
- ✅ Gestion des favoris
- ✅ Pagination et filtres
- ✅ Recherche multilingue
- ✅ Base de données MongoDB
- ✅ CORS activé pour le frontend

---

## 📋 Checklist d'installation

### Étape 1: Vérifier les prérequis
- [ ] Node.js 18+ installé
- [ ] npm installé
- [ ] MongoDB installé ou accessible

### Étape 2: Cloner/récupérer les fichiers
```bash
cd tp-partie-back-Alexia-554
```

### Étape 3: Installer les dépendances
```bash
npm install
```

### Étape 4: Configurer MongoDB
```bash
# Option 1: MongoDB en local
mongod

# Option 2: Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Étape 5: Configurer les variables d'environnement
- Vérifier/modifier le fichier `.env`
- Port: `3000` (ne pas changer)
- MongoDB: `mongodb://localhost:27017/pokemon-db`

### Étape 6: Démarrer le serveur
```bash
npm run dev
```

### Étape 7: Importer les Pokémons
```bash
curl -X POST http://localhost:3000/pokemons/import
```

### Étape 8: Tester l'API
```bash
curl http://localhost:3000  # doit retourner un message de bienvenue
```

---

## 📁 Structure des fichiers

```
tp-partie-back-Alexia-554/
│
├── 📄 index.js                    ← Point d'entrée (configuration Express)
├── 📄 connect.js                  ← Connexion MongoDB
├── 📄 package.json                ← Dépendances du projet
├── 📄 .env                        ← Variables d'environnement (À NE PAS COMMITTER)
├── 📄 .gitignore                  ← Fichiers à ignorer par Git
│
├── 📁 routes/                     ← Endpoints API
│   ├── 📄 pokemon.js             ← Routes pour les Pokémons
│   ├── 📄 auth.js                ← Routes pour l'authentification
│   └── 📄 favorites.js           ← Routes pour les favoris
│
├── 📁 schema/                     ← Modèles de données MongoDB
│   ├── 📄 pokemon.js             ← Structure d'un Pokémon
│   ├── 📄 user.js                ← Structure d'un utilisateur
│   └── 📄 favorite.js            ← Structure d'un favori
│
├── 📁 middleware/                 ← Logique transversale
│   └── 📄 auth.js                ← Authentification JWT
│
├── 📁 data/                       ← Données à importer
│   ├── 📄 pokemonsList.js        ← Liste de 800+ Pokémons
│   └── 📄 pokemons.json          ← Base JSON (optionnel)
│
├── 📁 assets/                     ← Fichiers statiques
│   └── 📁 pokemons/
│       ├── 1.png, 2.png, ...     ← Images des Pokémons
│       └── shiny/                 ← Versions brillantes (optionnel)
│
├── 📄 README.md                   ← Guide rapide
├── 📄 DOCUMENTATION.md            ← Documentation complète
├── 📄 EXAMPLES.md                 ← Exemples d'utilisation
└── 📄 INFO-INSTALLATION.md        ← Ce fichier
```

---

## 🔄 Flux de l'application

```
Frontend (React sur port 5173)
       ↓
    HTTP Request (GET, POST, DELETE)
       ↓
Express Server (port 3000)
       ├── Middleware CORS (vérifie l'origine)
       ├── Middleware JWT (vérifie l'authentification si nécessaire)
       ├── Routes (traite la requête)
       └── MongoDB (stocke/récupère les données)
       ↓
    JSON Response
       ↓
Frontend affiche les données
```

---

## 🔐 Systèmes d'authentification

### Sans authentification (public)
```
Routes accessibles sans token:
- GET  /pokemons
- GET  /pokemons/:id
- GET  /pokemons/types/all
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /pokemons/import (à protéger en production)
```

### Avec authentification (privé)
```
Routes nécessitant un token JWT:
- GET    /favorites
- POST   /favorites
- DELETE /favorites/:pokemonId
- GET    /favorites/check/:pokemonId
```

### Comment fonctionne JWT?

1. **Utilisateur se connecte**
   ```
   POST /auth/login → Serveur crée un token → Token renvoyé au client
   ```

2. **Client stocke le token**
   ```javascript
   localStorage.setItem('token', token);
   ```

3. **Client envoie le token dans les entêtes**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

4. **Serveur vérifie le token**
   ```
   Middleware auth.js décode le token
   Si valide → req.user contient les infos utilisateur
   Si invalide → Erreur 403
   ```

---

## 🗄️ Structure MongoDB

### Collection: users
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "username": "monuser",
  "password": "hashedPassword...",
  "createdAt": Date,
  "lastLogin": Date
}
```

### Collection: pokemons
```json
{
  "_id": ObjectId,
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
    ...
  },
  "image": "http://localhost:3000/assets/pokemons/1.png"
}
```

### Collection: favorites
```json
{
  "_id": ObjectId,
  "userId": ObjectId,
  "pokemonId": 25,
  "pokemonName": "Pikachu",
  "addedAt": Date
}
```

---

## 🛠️ Commandes utiles

### Démarrage
```bash
npm install              # Installer les dépendances
npm run dev             # Lancer le serveur en développement
node index.js           # Lancer en production
```

### Tester l'API
```bash
curl http://localhost:3000                     # Test simple
curl http://localhost:3000/pokemons            # Récupérer les Pokémons
curl -X POST http://localhost:3000/pokemons/import  # Importer
```

### MongoDB
```bash
mongod                  # Lancer MongoDB (si local)
mongo                   # Accéder à la console MongoDB
db.pokemons.count()    # Compter les Pokémons
db.users.find()        # Voir les utilisateurs
```

---

## 🚨 Erreurs courantes et solutions

### ❌ "Cannot find module 'express'"
**Cause:** Les dépendances ne sont pas installées  
**Solution:** `npm install`

### ❌ "Error connecting to MongoDB"
**Cause:** MongoDB n'est pas lancé  
**Solution:** 
```bash
mongod  # ou docker run -d -p 27017:27017 mongo:latest
```

### ❌ "EADDRINUSE: address already in use :::3000"
**Cause:** Le port 3000 est déjà utilisé  
**Solution:** 
```bash
# Trouver le processus qui utilise le port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Tuer le processus ou changer le port dans .env
```

### ❌ "Pokémons déjà importés"
**Cause:** Les Pokémons ont déjà été importés  
**Solution:** Soit utiliser directement `DELETE /pokemons/clear` pour réimporter

### ❌ "CORS error: Origin not allowed"
**Cause:** Le frontend appelle depuis une autre URL  
**Solution:** Mettre à jour `FRONTEND_URL` dans `.env`

### ❌ "Token expired / Unauthorized"
**Cause:** Le token JWT a expiré  
**Solution:** L'utilisateur doit se reconnecter (24h de validité)

---

## 🔗 Intégration avec le Frontend

### Configuration côté React

```javascript
// src/services/api.js
const API_URL = 'http://localhost:3000';

export const fetchPokemons = async (page, type, search) => {
  const params = new URLSearchParams({ page, type, search });
  const response = await fetch(`${API_URL}/pokemons?${params}`);
  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

export const addFavorite = async (pokemonId, pokemonName) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/favorites`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pokemonId, pokemonName })
  });
  return response.json();
};
```

### Fichier .env.example (pour documentation)
```env
# À copier et adapter dans .env
VITE_API_URL=http://localhost:3000
```

---

## 📊 Performance et scalabilité

### Optimisations actuelles
- ✅ Pagination pour éviter de charger tous les Pokémons
- ✅ Indexes MongoDB sur les champs recherchés
- ✅ CORS uniquement pour le frontend autorisé
- ✅ Validation des données entrantes

### À ajouter en production
- ⚠️ Validation plus stricte avec Joi ou Zod
- ⚠️ Rate limiting pour éviter les abus
- ⚠️ Logging des erreurs
- ⚠️ HTTPS au lieu de HTTP
- ⚠️ Refresh tokens pour JWT
- ⚠️ Compression gzip des réponses
- ⚠️ Cache Redis pour les requêtes

---

## 📚 Fichiers de documentation

| Fichier | Contenu |
|---------|---------|
| **README.md** | Guide rapide (à lire en premier) |
| **DOCUMENTATION.md** | Doc exhaustive avec tous les endpoints |
| **EXAMPLES.md** | Exemples d'appels curl et code |
| **INFO-INSTALLATION.md** | Ce fichier - guide complet |

---

## ✅ Checklist finale avant production

- [ ] MongoDB configuré avec mot de passe
- [ ] `JWT_SECRET` changé (clé ultime fort)
- [ ] `FRONTEND_URL` défini correctement
- [ ] HTTPS activé
- [ ] Rate limiting ajouté
- [ ] Validation des données renforcée
- [ ] Tests API effectués
- [ ] Erreurs loggées
- [ ] Base de données sauvegardée
- [ ] Documentation à jour

---

## 🎓 Points clés à comprendre

1. **Express:** Framework pour créer les endpoints
2. **MongoDB:** Base de données NoSQL qui stocke les données
3. **JWT:** Système d'authentification sécurisé
4. **CORS:** Permet au frontend d'appeler le backend
5. **Middleware:** Code qui s'exécute avant les routes (vérifie authentification, etc.)

---

## 📞 Support

Si vous avez des questions:
1. Consulter **DOCUMENTATION.md**
2. Vérifier les exemples dans **EXAMPLES.md**
3. Vérifier les logs du serveur (`npm run dev`)
4. Vérifier les erreurs MongoDB

---

**Bon développement! 🚀 N'hésitez pas à explorer et modifier le code selon vos besoins!**