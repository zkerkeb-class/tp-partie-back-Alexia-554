# ⚡ Quick Start - 5 minutes pour démarrer

## 🚀 Les 4 étapes d'or

### 1️⃣ Installer (1 min)
```bash
cd tp-partie-back-Alexia-554
npm install
```

### 2️⃣ Lancer MongoDB (1 min)
```bash
# Option A: Avec Docker (recommandé)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Option B: Lancé localement
mongod
```

### 3️⃣ Démarrer le serveur (< 1 min)
```bash
npm run dev
```
✅ Vous devriez voir: "Serveur PokéDex en écoute! Port: 3000"

### 4️⃣ Importer les Pokémons (1 min)
```bash
curl -X POST http://localhost:3000/pokemons/import
```
✅ Réponse: "✅ 800 Pokémons importés avec succès"

---

## ✅ Vérification rapide

```bash
# Test simple
curl http://localhost:3000

# Afficher les Pokémons
curl http://localhost:3000/pokemons

# Chercher Pikachu
curl "http://localhost:3000/pokemons?search=pikachu"

# Voir les types
curl http://localhost:3000/pokemons/types/all
```

---

## 🔗 Frontière connecter au backend

**Créer ce fichier:** `src/services/api.js` (frontend)

```javascript
const API_URL = 'http://localhost:3000';

export const getPokemons = (page = 1) =>
  fetch(`${API_URL}/pokemons?page=${page}`).then(r => r.json());

export const loginUser = (email, password) =>
  fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  }).then(r => r.json());

export const addFavorite = (token, pokemonId, name) =>
  fetch(`${API_URL}/favorites`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ pokemonId, pokemonName: name })
  }).then(r => r.json());
```

**Utiliser dans React:**
```javascript
import { getPokemons } from './services/api';

useEffect(() => {
  getPokemons().then(data => setPokemons(data.pokemons));
}, []);
```

---

## 📝 Test complet (5 min)

### 1️⃣ Créer un compte
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "username": "testuser",
    "password": "Password123"
  }'
```
💾 **Copier le token retourné**

### 2️⃣ Ajouter un Pokémon en favori
```bash
TOKEN="votre_token_ici"

curl -X POST http://localhost:3000/favorites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pokemonId": 25,
    "pokemonName": "Pikachu"
  }'
```

### 3️⃣ Voir mes Pokémons favoris
```bash
curl http://localhost:3000/favorites \
  -H "Authorization: Bearer $TOKEN"
```

### 4️⃣ Rechercher des Pokémons
```bash
curl "http://localhost:3000/pokemons?search=char&type=Fire"
```

---

## 🆘 Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Cannot find module 'express'` | npm install not run | `npm install` |
| `connection refused 27017` | MongoDB not running | `mongod` ou Docker |
| `EADDRINUSE: port 3000` | Port déjà utilisé | Changer PORT dans .env |
| `401 Unauthorized` | No token | Se connecter d'abord |
| `Pokémons déjà importés` | Import déjà fait | Utiliser les données existantes |

---

## 📚 Documentation

Pour approfondir:
- **Tous les endpoints:** [DOCUMENTATION.md](./DOCUMENTATION.md)
- **Exemples complets:** [EXAMPLES.md](./EXAMPLES.md)
- **Intégration React:** [FRONTEND-INTEGRATION.md](./FRONTEND-INTEGRATION.md)
- **Architecture détaillée:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Améliorations futures:** [IMPROVEMENTS.md](./IMPROVEMENTS.md)

---

## 🎮 Endpoints rapides

**Sans authentification:**
```
GET   /pokemons                    # Tous les Pokémons
GET   /pokemons/25                 # Pikachu
GET   /pokemons?search=pikachu     # Rechercher
GET   /pokemons?type=Fire          # Filtrer
POST  /auth/register               # Créer compte
POST  /auth/login                  # Se connecter
```

**Avec authentification (ajouter header: Authorization: Bearer TOKEN):**
```
GET   /favorites                   # Mes favoris
POST  /favorites                   # Ajouter un favori
DELETE /favorites/25               # Retirer un favori
```

---

## ✨ Bon à savoir

- 🔄 **Auto-reload:** `npm run dev` relance automatiquement
- 📝 **Logs:** Les messages du serveur vous aident à debug
- 🔐 **Token JWT:** Valide 24 heures, à sauvegarder en localStorage
- 📊 **Pagination par défaut:** 12 Pokémons par page
- 🎨 **Images:** http://localhost:3000/assets/pokemons/ID.png

---

## 🎯 Prochaines étapes

1. Tester tous les endpoints
2. Créer le service API côté frontend
3. Afficher les Pokémons dans React
4. Ajouter l'authentification au frontend
5. Implémenter les favoris

---

**C'est tout! Vous avez un backend complètement fonctionnel! 🎉**

Pour plus de détails, consultez les fichiers .md