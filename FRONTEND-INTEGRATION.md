# 🔌 Guide Connexion Frontend-Backend

## 📋 Résumé

Votre **backend (Node.js/Express)** tourne sur le port **3000**  
Votre **frontend (React/Vite)** tourne sur le port **5173**

Ils communiquent via **HTTP requests** en JSON.

---

## 1️⃣ Configuration du .env frontend

Créez un fichier `.env` dans le dossier frontend:

```env
VITE_API_URL=http://localhost:3000
```

Ou modifiez directement dans votre code:
```javascript
const API_URL = "http://localhost:3000";
```

---

## 2️⃣ Créer un fichier de configuration API (Frontend)

**Fichier:** `src/services/pokemonApi.js`

```javascript
/**
 * Service API pour communiquer avec le backend
 * Toutes les requêtes HTTP au serveur
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// ========== UTILITAIRES ==========

/**
 * Récupère le token JWT depuis localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Crée les entêtes HTTP standard pour les requêtes
 */
const createHeaders = (includeAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// ========== POKÉMONS ==========

/**
 * Récupère la liste des Pokémons avec pagination et filtres
 */
export const fetchPokemons = async (page = 1, limit = 12, type = '', search = '') => {
  try {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('limit', limit);
    if (type) params.append('type', type);
    if (search) params.append('search', search);

    const response = await fetch(`${API_URL}/pokemons?${params}`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) throw new Error('Erreur réseau');
    return await response.json();
  } catch (error) {
    console.error('Erreur fetchPokemons:', error);
    throw error;
  }
};

/**
 * Récupère un Pokémon spécifique par son ID
 */
export const fetchPokemonById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/pokemons/${id}`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) throw new Error('Pokémon non trouvé');
    return await response.json();
  } catch (error) {
    console.error('Erreur fetchPokemonById:', error);
    throw error;
  }
};

/**
 * Récupère tous les types de Pokémon disponibles
 */
export const fetchTypes = async () => {
  try {
    const response = await fetch(`${API_URL}/pokemons/types/all`, {
      method: 'GET',
      headers: createHeaders(),
    });

    if (!response.ok) throw new Error('Erreur réseau');
    return await response.json();
  } catch (error) {
    console.error('Erreur fetchTypes:', error);
    throw error;
  }
};

// ========== AUTHENTIFICATION ==========

/**
 * Enregistre un nouvel utilisateur
 */
export const registerUser = async (email, username, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }

    const data = await response.json();
    // Sauvegarder le token localement
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    console.error('Erreur registerUser:', error);
    throw error;
  }
};

/**
 * Connecte un utilisateur existant
 */
export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Identifiants invalides');
    }

    const data = await response.json();
    // Sauvegarder le token localement
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    console.error('Erreur loginUser:', error);
    throw error;
  }
};

/**
 * Déconnecte l'utilisateur
 */
export const logoutUser = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Récupère l'utilisateur actuellement connecté
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Vérifie si un utilisateur est connecté
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('authToken');
};

// ========== FAVORIS ==========

/**
 * Récupère les favoris de l'utilisateur connecté
 */
export const fetchFavorites = async () => {
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      method: 'GET',
      headers: createHeaders(true), // Nécessite authentification
    });

    if (!response.ok) throw new Error('Erreur lors de la récupération des favoris');
    return await response.json();
  } catch (error) {
    console.error('Erreur fetchFavorites:', error);
    throw error;
  }
};

/**
 * Ajoute un Pokémon aux favoris
 */
export const addFavorite = async (pokemonId, pokemonName) => {
  try {
    const response = await fetch(`${API_URL}/favorites`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ pokemonId, pokemonName }),
    });

    if (!response.ok) throw new Error('Erreur lors de l\'ajout aux favoris');
    return await response.json();
  } catch (error) {
    console.error('Erreur addFavorite:', error);
    throw error;
  }
};

/**
 * Supprime un Pokémon des favoris
 */
export const removeFavorite = async (pokemonId) => {
  try {
    const response = await fetch(`${API_URL}/favorites/${pokemonId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });

    if (!response.ok) throw new Error('Erreur lors de la suppression');
    return await response.json();
  } catch (error) {
    console.error('Erreur removeFavorite:', error);
    throw error;
  }
};

/**
 * Vérifie si un Pokémon est dans les favoris
 */
export const checkIsFavorite = async (pokemonId) => {
  try {
    const response = await fetch(`${API_URL}/favorites/check/${pokemonId}`, {
      method: 'GET',
      headers: createHeaders(true),
    });

    if (!response.ok) return { isFavorite: false, pokemonId };
    return await response.json();
  } catch (error) {
    console.error('Erreur checkIsFavorite:', error);
    return { isFavorite: false, pokemonId };
  }
};
```

---

## 3️⃣ Utiliser dans vos composants React

### Exemple 1: Afficher la liste des Pokémons

```javascript
// src/components/PokemonList.jsx

import { useState, useEffect } from 'react';
import { fetchPokemons, fetchTypes, addFavorite, removeFavorite } from '../services/pokemonApi';

export default function PokemonList() {
  const [pokemons, setPokemons] = useState([]);
  const [types, setTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState({});

  // Charger les Pokémons au montage ou quand les filtres changent
  useEffect(() => {
    loadPokemons();
    loadTypes();
  }, [page, selectedType, search]);

  const loadPokemons = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPokemons(page, 12, selectedType, search);
      setPokemons(data.pokemons);
    } catch (err) {
      setError('Erreur lors du chargement des Pokémons');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTypes = async () => {
    try {
      const data = await fetchTypes();
      setTypes(data.types);
    } catch (err) {
      console.error('Erreur lors du chargement des types:', err);
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
    } catch (err) {
      console.error('Erreur avec les favoris:', err);
    }
  };

  return (
    <div className="pokemon-container">
      <h1>🎮 PokéDex</h1>

      {/* Filtres */}
      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher un Pokémon..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tous les types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Affichage des erreurs */}
      {error && <div className="error">{error}</div>}

      {/* Chargement */}
      {loading && <div className="loading">Chargement...</div>}

      {/* Grille des Pokémons */}
      <div className="pokemon-grid">
        {pokemons.map((pokemon) => (
          <div key={pokemon.id} className="pokemon-card">
            <img src={pokemon.image} alt={pokemon.name.english} />
            <h2>{pokemon.name.french}</h2>
            <p className="types">{pokemon.type.join(', ')}</p>
            <div className="stats">
              <span>♥ {pokemon.base.HP}</span>
              <span>⚡ {pokemon.base.Speed}</span>
            </div>
            <button
              onClick={() => handleToggleFavorite(pokemon.id, pokemon.name.english)}
              className={favorites[pokemon.id] ? 'favorite active' : 'favorite'}
            >
              {favorites[pokemon.id] ? '⭐ Favori' : '☆ Ajouter'}
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          ← Précédent
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>
          Suivant →
        </button>
      </div>
    </div>
  );
}
```

### Exemple 2: Formulaire de connexion

```javascript
// src/components/LoginForm.jsx

import { useState } from 'react';
import { loginUser, registerUser } from '../services/pokemonApi';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await registerUser(email, username, password);
        alert('✅ Inscription réussie! Vous êtes connecté.');
      } else {
        await loginUser(email, password);
        alert('✅ Connexion réussie!');
      }
      // Rediriger ou mettre à jour l'interface
    } catch (err) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>{isRegister ? 'Inscription' : 'Connexion'}</h2>

      {error && <div className="error">{error}</div>}

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

      <button type="submit" disabled={loading}>
        {loading ? 'Chargement...' : isRegister ? 'S\'inscrire' : 'Se connecter'}
      </button>

      <button
        type="button"
        onClick={() => setIsRegister(!isRegister)}
      >
        {isRegister ? 'Déjà inscrit? Se connecter' : 'Créer un compte'}
      </button>
    </form>
  );
}
```

---

## 4️⃣ Mettre en place l'authentification globale

### Avec un Context React

```javascript
// src/context/AuthContext.jsx

import { createContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, logoutUser } from '../services/pokemonApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    if (isAuthenticated()) {
      setUser(getCurrentUser());
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Utiliser le Context dans App.jsx

```javascript
// src/App.jsx

import { AuthProvider } from './context/AuthContext';
import PokemonList from './components/PokemonList';
import LoginForm from './components/LoginForm';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <PokemonList />
      </div>
    </AuthProvider>
  );
}

export default App;
```

---

## 5️⃣ Gestion des erreurs et états

```javascript
// Hook personnalisé pour les requêtes API

import { useState, useCallback } from 'react';

export function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return { data, loading, error, execute };
}

// Utilisation dans un composant
const { data: pokemons, loading, error, execute: loadPokemons } = useApi(fetchPokemons);
```

---

## 🚀 Démarrage complet du projet

### Terminal 1: Démarrer MongoDB
```bash
mongod
```

### Terminal 2: Démarrer le backend
```bash
cd tp-partie-back-Alexia-554
npm run dev
```

### Terminal 3: Démarrer le frontend
```bash
cd tp-partie-front-Alexia-554
npm run dev
```

Maintenant:
- ✅ Backend: http://localhost:3000
- ✅ Frontend: http://localhost:5173
- ✅ MongoDB: http://localhost:27017

---

## 📝 Checklist intégration

- [ ] Fichier `.env` créé au frontend
- [ ] Service API `pokemonApi.js` créé
- [ ] Composant `PokemonList` affiche les Pokémons
- [ ] Formulaire de connexion fonctionne
- [ ] Favoris fonctionnent (avec token)
- [ ] Recherche et filtres fonctionnent
- [ ] Gestion des erreurs en place
- [ ] Pagination fonctionne
- [ ] Style adapté responsive

---

**Bon codage! 🚀**