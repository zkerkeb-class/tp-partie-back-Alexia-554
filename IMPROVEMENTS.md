# 🚀 Améliorations Futures & Bonnes Pratiques

## 📋 Améliorations à court terme (rapide)

### 1. Validation des données (Joi ou Zod)
```javascript
// À ajouter dans chaque route POST/PUT
import Joi from 'joi';

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
});

// Dans la route
const { error, value } = registerSchema.validate(req.body);
if (error) return res.status(400).json({ error: error.details[0].message });
```

### 2. Rate limiting
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite à 100 requêtes par IP
});

app.use(limiter);
app.post('/auth/login', limiter, authRoutes);
```

### 3. Logging des erreurs
```bash
npm install winston
```

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Utiliser: logger.error('Erreur:', error);
```

---

## 📊 Améliorations à moyen terme

### 1. Pagination améliorée
```javascript
// Cursors au lieu de page/limit (plus efficace pour les grandes données)
export const getPokemonsCursor = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const cursor = req.query.cursor; // dernière clé vue

  let query = {};
  if (cursor) {
    query._id = { $gt: cursor };
  }

  const pokemons = await pokemon
    .find(query)
    .limit(limit + 1)
    .sort({ _id: 1 });

  const hasMore = pokemons.length > limit;
  const results = hasMore ? pokemons.slice(0, -1) : pokemons;
  const nextCursor = hasMore ? results[results.length - 1]._id : null;

  return { results, nextCursor, hasMore };
};
```

### 2. Système de favoris amélioré
```javascript
// Ajouter des notes/commentaires sur les favoris
const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pokemonId: { type: Number, required: true },
  pokemonName: { type: String, required: true },
  comment: { type: String, maxlength: 500 }, // Nouveau
  rating: { type: Number, min: 1, max: 5 }, // Nouveau
  addedAt: { type: Date, default: Date.now },
});
```

### 3. Images optimisées avec Cloudinary
```bash
npm install cloudinary
```

```javascript
// Uploader les images en cloud au lieu de les stocker localement
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

---

## 🔒 Sécurité

### 1. Refresh tokens JWT
```javascript
// Générer un refresh token longue durée
export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Court terme
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Long terme
  );

  return { accessToken, refreshToken };
};

// Route pour rafraîchir le token
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ error: 'Refresh token invalide' });
  }
});
```

### 2. Helmet (en-têtes de sécurité)
```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

### 3. Protection contre les injections NoSQL
```javascript
// ✅ BON
const search = req.query.search.trim();
const filter = { name: { $regex: search, $options: 'i' } };

// ❌ MAUVAIS
const filter = req.query; // Directement sans validation
```

---

## 🧪 Tests

### Tests unitaires avec Jest
```bash
npm install --save-dev jest supertest
```

```javascript
// __tests__/pokemon.test.js
import request from 'supertest';
import app from '../index';

describe('Pokemon API', () => {
  test('GET /pokemons should return pokemons', async () => {
    const response = await request(app)
      .get('/pokemons')
      .expect(200);

    expect(response.body.pokemons).toBeDefined();
    expect(Array.isArray(response.body.pokemons)).toBe(true);
  });

  test('GET /pokemons/25 should return Pikachu', async () => {
    const response = await request(app)
      .get('/pokemons/25')
      .expect(200);

    expect(response.body.name.english).toBe('Pikachu');
  });
});
```

**Package.json:**
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 📈 Performance

### 1. Compression gzip
```bash
npm install compression
```

```javascript
import compression from 'compression';
app.use(compression());
```

### 2. Cache Redis
```bash
npm install redis
```

```javascript
import redis from 'redis';

const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
});

// Cache les résultats des Pokémons
router.get('/pokemons', async (req, res) => {
  const cacheKey = JSON.stringify(req.query);

  // Vérifier le cache
  const cached = await redisClient.get(cacheKey);
  if (cached) return res.json(JSON.parse(cached));

  // Si pas en cache, récupérer et stocker
  const data = await pokemon.find(/* ... */);
  await redisClient.setex(cacheKey, 3600, JSON.stringify(data)); // Cache 1h

  res.json(data);
});
```

### 3. Lazy loading des images
```javascript
// Frontend: <img src={pokemon.image} loading="lazy" />

// Backend: Renvoyer des images petites par défaut
const pokemonSchema = new mongoose.Schema({
  image: String,
  imageThumbnail: String, // Petite version
  imageFull: String, // Haute résolution
});
```

---

## 🗄️ Base de données

### 1. Indexes MongoDB
```javascript
// Ajouter dans le schéma
const pokemonSchema = new mongoose.Schema({
  // ... champs
});

// Indexes pour les performances
pokemonSchema.index({ type: 1 }); // Pour les filtres par type
pokemonSchema.index({ "name.english": "text" }); // Recherche textuelle
pokemonSchema.index({ id: 1 }); // ID déjà unique par défaut
```

### 2. Sauvegarde automatique
```bash
# MongoDB Atlas cloud (recommandé pour la production)
MONGODB_URL=mongodb+srv://user:password@cluster.mongodb.net/pokemon-db
```

### 3. Transactions (Multiple Collections)
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  await User.create(newUser, { session });
  await Favorite.create(newFavorite, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

---

## 🌐 Déploiement

### Hébergement recommandé
- **Backend:** 
  - Heroku (gratuit mais lent)
  - Railway
  - Render
  - DigitalOcean
  - AWS
  
- **Base de données:**
  - MongoDB Atlas (cloud gratuit)
  - AWS RDS
  
- **Frontend:**
  - Vercel
  - Netlify
  - GitHub Pages

### Déploiement sur Render.com
```bash
# Créer Procfile
echo "web: npm start" > Procfile

# Configurer dans Render
# - Repository: GitHub
# - Branch: main
# - Build: npm install
# - Start: npm start
# - Environment variables: JWT_SECRET, MONGODB_URL, etc.
```

---

## 📱 Features futures (Bonus)

### 1. WebSocket pour temps réel
```bash
npm install socket.io
```

```javascript
import io from 'socket.io';

const socketIO = io(app, {
  cors: { origin: process.env.FRONTEND_URL },
});

// Notifications temps réel des favoris
socketIO.on('connection', (socket) => {
  socket.on('favoriteAdded', (data) => {
    socketIO.emit('favoriteNotification', { user: data.username, pokemon: data.pokemonName });
  });
});
```

### 2. Comparateur de Pokémons avancé
```javascript
// Route pour comparer deux Pokémons
router.post('/compare', async (req, res) => {
  const { id1, id2 } = req.body;
  const [poke1, poke2] = await Promise.all([
    pokemon.findOne({ id: id1 }),
    pokemon.findOne({ id: id2 }),
  ]);

  const comparison = {
    pokemon1: poke1,
    pokemon2: poke2,
    winner: poke1.base.Attack + poke1.base.Speed > poke2.base.Attack + poke2.base.Speed ? 'pokemon1' : 'pokemon2',
  };

  res.json(comparison);
});
```

### 3. Système d'évolution
```javascript
const evolutionSchema = new mongoose.Schema({
  fromId: Number,
  toId: Number,
  method: String, // 'level', 'stone', 'trade', etc.
  requirement: String, // 'level 16', 'thunder stone', etc.
});
```

### 4. Statistiques utilisateur
```javascript
// Endpoint pour voir les stats
router.get('/user/stats', authenticateToken, async (req, res) => {
  const favoriteCount = await Favorite.countDocuments({ userId: req.user.id });
  const typePreferences = await Favorite.aggregate([
    { $match: { userId: req.user.id } },
    // Grouper par type...
  ]);

  res.json({ favoriteCount, typePreferences });
});
```

---

## 📚 Ressources d'apprentissage

- **Express:** https://expressjs.com/
- **MongoDB:** https://docs.mongodb.com/
- **JWT:** https://jwt.io/
- **JavaScript async/await:** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
- **REST API Best Practices:** https://restfulapi.net/

---

## ✅ Checklist avant production

- [ ] Tests unitaires écrits et passants
- [ ] Validation des données en place
- [ ] Rate limiting activé
- [ ] HTTPS configuré
- [ ] Logging des erreurs en place
- [ ] Base de données sauvegardée
- [ ] Variables d'environnement sécurisées
- [ ] Performance testée (Lighthouse)
- [ ] Sécurité testée (OWASP Top 10)
- [ ] Documentation à jour
- [ ] Moniteurs d'erreurs en place (Sentry)
- [ ] CDN configuré pour les images

---

## 🎯 Roadmap suggérée

1. **Semaine 1:** Fonctionnalités de base ✅ (déjà fait)
2. **Semaine 2:** Validation des données + Tests
3. **Semaine 3:** Optimisations (cache, indexes)
4. **Semaine 4:** Déploiement en production
5. **Semaine 5:** Features bonus (WebSocket, évolutions)

---

**Bonne chance pour vos améliorations! 🚀**