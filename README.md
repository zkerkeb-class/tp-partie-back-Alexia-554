# 🎮 Backend PokéDex - Guide Rapide

## 🚀 Démarrage rapide

### 1. Installation
```bash
npm install
```

### 2. Vérifier que MongoDB est lancé
```bash
# Avec MongoDB installé en local
mongod

# Avec Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 3. Démarrer le serveur
```bash
npm run dev
```

Le serveur tourne sur **http://localhost:3000**

### 4. Importer les Pokémons
```bash
curl -X POST http://localhost:3000/pokemons/import
```

## 📚 Documentation complète

Voir le fichier **[DOCUMENTATION.md](./DOCUMENTATION.md)** pour:
- Détails de tous les endpoints
- Comment intégrer avec le frontend
- Exemples complets
- Gestion des erreurs

## 🔗 Connexion au frontend

Le frontend (port 5173) doit appeler:
```
http://localhost:3000
```

**Exemple de requête depuis React:**
```javascript
const response = await fetch('http://localhost:3000/pokemons?page=1&limit=12');
const data = await response.json();
```

## 📝 Structure principale

| Fichier/Dossier | Description |
|---|---|
| `index.js` | Point d'entrée principal |
| `connect.js` | Connexion MongoDB |
| `.env` | Variables d'environnement |
| `routes/` | Endpoints API |
| `schema/` | Modèles de données |
| `middleware/` | Authentification JWT |
| `data/pokemonsList.js` | Les 800+ Pokémons à importer |

## 🔐 Ports utilisés

- **Backend**: 3000
- **Frontend**: 5173
- **MongoDB**: 27017

## 🐛 Dépannage

**Erreur de connexion à MongoDB?**
- Vérifiez que MongoDB tourne sur le port 27017

**Les images ne s'affichent pas?**
- Vérifiez que `API_URL` dans `.env` est correct
- Les fichiers image doivent être dans `assets/pokemons/ID.png`

**CORS erreur?**
- Vérifiez que `FRONTEND_URL` dans `.env` correspond à votre URL frontend

## 📖 Endpoints principaux

```
GET    /pokemons                    # Lister avec pagination
GET    /pokemons/:id               # Un Pokémon spécifique
GET    /pokemons/types/all         # Tous les types
POST   /pokemons/import            # Importer les données
POST   /auth/register              # Créer un compte
POST   /auth/login                 # Se connecter
GET    /favorites                  # Mes favoris (authentifié)
POST   /favorites                  # Ajouter un favori
DELETE /favorites/:pokemonId       # Supprimer un favori
```

## 📧 Variables d'environnement (`.env`)

```env
PORT=3000
API_URL=http://localhost:3000
JWT_SECRET=votre_cle_secrete
MONGODB_URL=mongodb://localhost:27017/pokemon-db
FRONTEND_URL=http://localhost:5173
```

---

**Pour plus d'informations, consulte DOCUMENTATION.md** 📚