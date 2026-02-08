# 🔌 Fichiers à créer dans votre Frontend React

## 📍 Localisation des fichiers

Créez ces fichiers dans votre projet frontend (`tp-partie-front-Alexia-554/`):

```
tp-partie-front-Alexia-554/
└── src/
    ├── App.jsx (à modifier)
    └── services/
        └── pokemonApi.js (À CRÉER)
```

---

## 1️⃣ Fichier à CRÉER: `src/services/pokemonApi.js`

Copiez-collez ce contenu exactement:

```javascript
/**
 * Service API PokéDex
 * 
 * Tous les appels au backend
 * Les fonctions retournent des Promises (async/await compatible)
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ========== POKÉMONS ==========

/**
 * Récupère les Pokémons avec pagination et filtres
 * @param {number} page - Numéro de page (défaut: 1)
 * @param {number} limit - Pokémons par page (défaut: 12)
 * @param {string} type - Filtrer par type (optionnel)
 * @param {string} search - Rechercher par nom (optionnel)
 * @returns {Promise} { pokemons, pagination }
 */
export const fetchPokemons = async (page = 1, limit = 12, type = "", search = "") => {
  try {
    const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", limit);
    if (type) params.append("type", type);
    if (search) params.append("search", search);

    const response = await fetch(`${API_URL}/pokemons?${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error("Erreur réseau");
    return await response.json();
  } catch (error) {
    console.error("Erreur fetchPokemons:", error);
    throw error;
  }
};

/**
 * Récupère un Pokémon spécifique par son ID
 */
export const fetchPokemonById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/pokemons/${id}`);
    if (!response.ok) throw new Error("Pokémon non trouvé");
    return await response.json();
  } catch (error) {
    console.error("Erreur fetchPokemonById:", error);
    throw error;
  }
};

/**
 * Récupère tous les types disponibles
 */
export const fetchTypes = async () => {
  try {
    const response = await fetch(`${API_URL}/pokemons/types/all`);
    if (!response.ok) throw new Error("Erreur réseau");
    return await response.json();
  } catch (error) {
    console.error("Erreur fetchTypes:", error);
    throw error;
  }
};

// ========== AUTHENTIFICATION ==========

/**
 * S'inscrire - Créer un compte
 */
export const registerUser = async (email, username, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erreur lors de l'inscription");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  } catch (error) {
    console.error("Erreur registerUser:", error);
    throw error;
  }
};

/**
 * Se connecter
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Identifiants invalides");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  } catch (error) {
    console.error("Erreur loginUser:", error);
    throw error;
  }
};

/**
 * Se déconnecter
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * Récupérer l'utilisateur connecté
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/**
 * Vérifier si connecté
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// ========== FAVORIS ==========

const getToken = () => localStorage.getItem("token");

/**
 * Mes favoris
 */
export const fetchFavorites = async () => {
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${getToken()}` },
    });

    if (!response.ok) throw new Error("Erreur lors de la récupération");
    return await response.json();
  } catch (error) {
    console.error("Erreur fetchFavorites:", error);
    throw error;
  }
};

/**
 * Ajouter un favori
 */
export const addFavorite = async (pokemonId, pokemonName) => {
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pokemonId, pokemonName }),
    });

    if (!response.ok) throw new Error("Erreur lors de l'ajout");
    return await response.json();
  } catch (error) {
    console.error("Erreur addFavorite:", error);
    throw error;
  }
};

/**
 * Retirer un favori
 */
export const removeFavorite = async (pokemonId) => {
  try {
    const response = await fetch(`${API_URL}/favorites/${pokemonId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${getToken()}` },
    });

    if (!response.ok) throw new Error("Erreur lors de la suppression");
    return await response.json();
  } catch (error) {
    console.error("Erreur removeFavorite:", error);
    throw error;
  }
};

/**
 * Vérifier si c'est un favori
 */
export const checkIsFavorite = async (pokemonId) => {
  try {
    const response = await fetch(`${API_URL}/favorites/check/${pokemonId}`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${getToken()}` },
    });

    if (!response.ok) return { isFavorite: false, pokemonId };
    return await response.json();
  } catch (error) {
    console.error("Erreur checkIsFavorite:", error);
    return { isFavorite: false, pokemonId };
  }
};
```

---

## 2️⃣ Fichier `.env` frontend

Créez un fichier `.env` à la racine de `tp-partie-front-Alexia-554/`:

```env
VITE_API_URL=http://localhost:3000
```

---

## 3️⃣ Exemple d'utilisation dans `App.jsx`

```javascript
import { useState, useEffect } from 'react';
import { fetchPokemons, fetchTypes, addFavorite, removeFavorite, loginUser } from './services/pokemonApi';

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [types, setTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [favorites, setFavorites] = useState({});

  // Charger les Pokémons au démarrage
  useEffect(() => {
    loadPokemons();
    loadTypes();
  }, [page, search, selectedType]);

  const loadPokemons = async () => {
    try {
      const data = await fetchPokemons(page, 12, selectedType, search);
      setPokemons(data.pokemons);
    } catch (error) {
      console.log("Erreur:", error);
    }
  };

  const loadTypes = async () => {
    try {
      const data = await fetchTypes();
      setTypes(data.types || []);
    } catch (error) {
      console.log("Erreur types:", error);
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
      console.log("Erreur favori:", error);
    }
  };

  return (
    <div className="app">
      <h1>🎮 PokéDex</h1>

      {/* Recherche */}
      <input
        type="text"
        placeholder="Chercher..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />

      {/* Filtres type */}
      <select value={selectedType} onChange={(e) => {
        setSelectedType(e.target.value);
        setPage(1);
      }}>
        <option value="">Tous types</option>
        {types.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Grille Pokémons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
        {pokemons.map(poke => (
          <div key={poke.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
            <img src={poke.image} alt={poke.name.english} style={{ width: "100%" }} />
            <h2>{poke.name.french}</h2>
            <p>{poke.type.join(", ")}</p>
            <button onClick={() => handleToggleFavorite(poke.id, poke.name.english)}>
              {favorites[poke.id] ? "⭐ Aimé" : "☆ Aimer"}
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <button onClick={() => setPage(page - 1)} disabled={page === 1}>Précédent</button>
      <span>Page {page}</span>
      <button onClick={() => setPage(page + 1)}>Suivant</button>
    </div>
  );
}

export default App;
```

---

## 4️⃣ Exemple composant Login

```javascript
import { useState } from 'react';
import { loginUser, registerUser } from './services/pokemonApi';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await registerUser(email, username, password);
        alert("✅ Inscription réussie!");
      } else {
        await loginUser(email, password);
        alert("✅ Connexion réussie!");
      }
      // Recharger la page ou rediriger
      window.location.reload();
    } catch (error) {
      alert(`❌ ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{isRegister ? "S'inscrire" : "Se connecter"}</h2>

      {isRegister && (
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">
        {isRegister ? "S'inscrire" : "Se connecter"}
      </button>

      <button type="button" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Déjà inscrit?" : "Créer un compte"}
      </button>
    </form>
  );
}
```

---

## 5️⃣ Structure finale recommandée

```
tp-partie-front-Alexia-554/
├── .env                          ← CRÉER (VITE_API_URL=...)
├── src/
│   ├── App.jsx                   ← MODIFIER (ajouter logique)
│   ├── services/
│   │   └── pokemonApi.js         ← CRÉER (service API)
│   ├── components/
│   │   ├── PokemonList.jsx       (déjà existant)
│   │   ├── Login.jsx             ← À ajouter
│   │   └── Favorites.jsx         ← À ajouter
│   └── ...
└── ...
```

---

## ✅ Checklist intégration

- [ ] Créer `src/services/pokemonApi.js`
- [ ] Créer `.env` avec VITE_API_URL
- [ ] Modifier `App.jsx` pour utiliser le service
- [ ] Tester avec `npm run dev`
- [ ] Vérifier les appels réseau (DevTools → Network)
- [ ] Afficher les Pokémons
- [ ] Ajouter formulaire login
- [ ] Tester authentification
- [ ] Implémenter favoris
- [ ] Tester favoris avec token

---

## 🔗 Vérifier que tout fonctionne

Ouvrez la console navigateur (F12) et testez:

```javascript
// Importer le service
import { fetchPokemons } from './services/pokemonApi';

// Appeler une fonction
fetchPokemons(1, 12).then(console.log);
```

You should voir:
```
{
  pokemons: [...],
  pagination: { ... }
}
```

---

## 🚨 Erreurs fréquentes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `CORS error` | API_URL incorrect | Vérifier `.env` |
| `undefined` | import oublié | `import { ... } from ...` |
| `404` | Serveur pas lancé | `npm run dev` dans backend |
| `401` | Token manquant | Login d'abord |

---

**C'est tout! Votre frontend est maintenant connecté! 🎉**