# 📋 Exemples d'utilisation de l'API PokéDex

## Prérequis
- Serveur backend lancé: `npm run dev` sur le port 3000
- MongoDB lancé sur le port 27017
- Pokémons importés: `curl -X POST http://localhost:3000/pokemons/import`

---

## 🔐 Authentification

### 1️⃣ Inscription (Créer un compte)

**URL:** `POST http://localhost:3000/auth/register`

**Curl:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alexia@example.com",
    "username": "alexia_dex",
    "password": "SuuperMotDePasse123!"
  }'
```

**Response:**
```json
{
  "message": "✅ Utilisateur créé avec succès",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YTEyMzQ1Njc4OTBhYmMxMjM0NTY3OCIsImVtYWlsIjoiYWxleGlhQGV4YW1wbGUuY29tIiwidXNlcm5hbWUiOiJhbGV4aWFfZGV4IiwiaWF0IjoxNzA1MzM4MzAwLCJleHAiOjE3MDU0MjQ3MDB9.xxx",
  "user": {
    "id": "65a1234567890abc123456378",
    "email": "alexia@example.com",
    "username": "alexia_dex"
  }
}
```

💾 **Sauvegardez le token** - vous en aurez besoin pour les requêtes protégées

---

### 2️⃣ Connexion (Login)

**URL:** `POST http://localhost:3000/auth/login`

**Curl:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alexia@example.com",
    "password": "SuuperMotDePasse123!"
  }'
```

**Response:**
```json
{
  "message": "✅ Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1234567890abc123456378",
    "email": "alexia@example.com",
    "username": "alexia_dex"
  }
}
```

---

### 3️⃣ Déconnexion (Logout)

**URL:** `POST http://localhost:3000/auth/logout`

**Curl:**
```bash
curl -X POST http://localhost:3000/auth/logout
```

**Response:**
```json
{
  "message": "✅ Déconnexion réussie. Supprimez le token côté client."
}
```

💡 **Conseil:** Supprimez le token de localStorage côté frontend après cette requête

---

## 🎮 Pokémons

### 1️⃣ Récupérer tous les Pokémons (avec pagination)

**URL:** `GET http://localhost:3000/pokemons?page=1&limit=12`

**Curl:**
```bash
curl http://localhost:3000/pokemons
```

**Avec pagination (page 2, 20 par page):**
```bash
curl "http://localhost:3000/pokemons?page=2&limit=20"
```

**Response:**
```json
{
  "pokemons": [
    {
      "_id": "65a1234567890abc123456370",
      "id": 1,
      "name": {
        "english": "Bulbasaur",
        "japanese": "フシギダネ",
        "chinese": "妙蛙种子",
        "french": "Bulbizarre"
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

### 2️⃣ Rechercher un Pokémon par nom

**URL:** `GET http://localhost:3000/pokemons?search=pikachu`

**Curl:**
```bash
curl "http://localhost:3000/pokemons?search=pikachu"
```

**Response:**
```json
{
  "pokemons": [
    {
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
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalPokemons": 1,
    "pokemonsPerPage": 12
  }
}
```

---

### 3️⃣ Filtrer par type

**URL:** `GET http://localhost:3000/pokemons?type=Fire`

**Curl:**
```bash
curl "http://localhost:3000/pokemons?type=Fire"
```

**Résultats:** Tous les Pokémons de type Feu

---

### 4️⃣ Combiner filtres et recherche

**URL:** `GET http://localhost:3000/pokemons?type=Water&search=squir&page=1&limit=10`

**Curl:**
```bash
curl "http://localhost:3000/pokemons?type=Water&search=squir&page=1&limit=10"
```

---

### 5️⃣ Récupérer les types disponibles

**URL:** `GET http://localhost:3000/pokemons/types/all`

**Curl:**
```bash
curl http://localhost:3000/pokemons/types/all
```

**Response:**
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

### 6️⃣ Récupérer un Pokémon spécifique

**URL:** `GET http://localhost:3000/pokemons/:id`

**Curl:**
```bash
# Pikachu (ID 25)
curl http://localhost:3000/pokemons/25

# Charizard (ID 6)
curl http://localhost:3000/pokemons/6

# Mewtwo (ID 150)
curl http://localhost:3000/pokemons/150
```

**Response:**
```json
{
  "_id": "65a1234567890abc123456392",
  "id": 25,
  "name": {
    "english": "Pikachu",
    "japanese": "ピカチュウ",
    "chinese": "皮卡丘",
    "french": "Pikachu"
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

### 7️⃣ Importer les Pokémons (UNE SEULE FOIS!)

**URL:** `POST http://localhost:3000/pokemons/import`

**Curl:**
```bash
curl -X POST http://localhost:3000/pokemons/import
```

**Response:**
```json
{
  "message": "✅ 800 Pokémons importés avec succès",
  "count": 800
}
```

⚠️ **Important:** Cette requête ne fonctionne qu'une seule fois. Si vous avez une erreur "Pokémons déjà importés", c'est normal.

---

### 8️⃣ Supprimer tous les Pokémons (⚠️ DANGEREUX!)

**URL:** `DELETE http://localhost:3000/pokemons/clear`

**Curl:**
```bash
curl -X DELETE http://localhost:3000/pokemons/clear
```

**Response:**
```json
{
  "message": "✅ 800 Pokémons supprimés",
  "deletedCount": 800
}
```

⚠️ **Attention:** Cette opération supprime TOUS les Pokémons. À utiliser uniquement en développement!

---

## ⭐ Favoris (AUTHENTIFICATION REQUISE)

💡 **Important:** Remplacez `YOUR_TOKEN` par le token obtenu lors de la connexion

### 1️⃣ Récupérer mes favoris

**URL:** `GET http://localhost:3000/favorites`

**Curl:**
```bash
curl http://localhost:3000/favorites \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "favorites": [
    {
      "_id": "65a1234567890abc123456400",
      "userId": "65a1234567890abc123456378",
      "pokemonId": 25,
      "pokemonName": "Pikachu",
      "addedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "65a1234567890abc123456401",
      "userId": "65a1234567890abc123456378",
      "pokemonId": 6,
      "pokemonName": "Charizard",
      "addedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "count": 2
}
```

---

### 2️⃣ Ajouter un Pokémon aux favoris

**URL:** `POST http://localhost:3000/favorites`

**Curl:**
```bash
curl -X POST http://localhost:3000/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pokemonId": 25,
    "pokemonName": "Pikachu"
  }'
```

**Response:**
```json
{
  "message": "✅ Pikachu ajouté aux favoris",
  "favorite": {
    "_id": "65a1234567890abc123456400",
    "userId": "65a1234567890abc123456378",
    "pokemonId": 25,
    "pokemonName": "Pikachu",
    "addedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### 3️⃣ Retirer un Pokémon des favoris

**URL:** `DELETE http://localhost:3000/favorites/:pokemonId`

**Curl:**
```bash
curl -X DELETE http://localhost:3000/favorites/25 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "message": "✅ Pikachu supprimé des favoris"
}
```

---

### 4️⃣ Vérifier si un Pokémon est un favori

**URL:** `GET http://localhost:3000/favorites/check/:pokemonId`

**Curl:**
```bash
curl http://localhost:3000/favorites/check/25 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "isFavorite": true,
  "pokemonId": 25
}
```

---

## 🧪 Workflow complet d'exemple

### Scénario: L'utilisateur Alexia aime Pikachu

**Étape 1:** Inscription
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alexia@test.com","username":"alexia","password":"Pass123"}' \
  | jq -r '.token')

echo "Token: $TOKEN"
```

**Étape 2:** Récupérer Pikachu
```bash
curl "http://localhost:3000/pokemons?search=pikachu"
```

**Étape 3:** Ajouter Pikachu aux favoris
```bash
curl -X POST http://localhost:3000/favorites \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pokemonId": 25, "pokemonName": "Pikachu"}'
```

**Étape 4:** Vérifier les favoris
```bash
curl http://localhost:3000/favorites \
  -H "Authorization: Bearer $TOKEN"
```

**Étape 5:** Supprimer Pikachu des favoris
```bash
curl -X DELETE http://localhost:3000/favorites/25 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📌 Notes importantes

### Token JWT
- **Durée de validité:** 24 heures
- **Format:** Bearer token dans l'entête `Authorization`
- **Exemples d'erreurs:**
  - `401 Unauthorized`: Token manquant
  - `403 Forbidden`: Token invalide ou expiré

### Pagination
- Par défaut: page 1, 12 Pokémons par page
- **Limites conseillées:** 
  - Min: 1 Pokémon par page
  - Max: 100 Pokémons par page

### Recherche
- Insensible à la casse (majuscules/minuscules)
- Recherche sur les noms en anglais, français et japonais

### Filtres
- Vous pouvez combiner: type + search + page + limit
- Types valides: voir l'endpoint `/pokemons/types/all`

---

## 🧩 Collection Postman

Vous pouvez importer ces exemples dans Postman pour les tester facilement.

[Lien vers la collection Postman] (À créer si nécessaire)

---

**Besoin d'aide?** Consultez la [DOCUMENTATION.md](./DOCUMENTATION.md) pour plus de détails. 🚀