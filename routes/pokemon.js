import express from "express";
import pokemon from "../schema/pokemon.js";
import pokemonsList from "../data/pokemonsList.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * Route : GET /pokemons
 * Description : Récupérer tous les Pokémons avec pagination, filtres et recherche
 * 
 * Paramètres de requête (query parameters) :
 * - page (optionnel) : numéro de page (défaut: 1)
 * - limit (optionnel) : nombre de Pokémons par page (défaut: 12)
 * - type (optionnel) : filtrer par type (ex: "Fire", "Water")
 * - search (optionnel) : rechercher par nom (ex: "pikachu")
 * 
 * Exemples d'utilisation:
 * GET /pokemons                                    (tous les Pokémons, page 1, 12 par page)
 * GET /pokemons?page=2                             (page 2)
 * GET /pokemons?limit=20                           (20 Pokémons par page)
 * GET /pokemons?type=Fire                          (tous les Pokémons de type Feu)
 * GET /pokemons?search=char                        (cherche "char")
 * GET /pokemons?type=Grass&page=2&limit=15        (combinaison de plusieurs paramètres)
 */
router.get("/", async (req, res) => {
    try {
        // Récupérer les paramètres de requête
        const page = parseInt(req.query.page) || 1; // Numéro de page (défaut: 1)
        const limit = parseInt(req.query.limit) || 12; // Pokémons par page (défaut: 12)
        const typeFilter = req.query.type; // Type de Pokémon (optionnel)
        const searchQuery = req.query.search; // Recherche par nom (optionnel)

        // Construire les filtres pour MongoDB
        let filter = {};

        // Filtre par type si fourni
        if (typeFilter) {
            filter.type = typeFilter;
        }

        // Filtre par recherche si fournie
        // Utilise regex pour une recherche insensible à la casse (case-insensitive)
        if (searchQuery) {
            filter.$or = [
                { "name.english": { $regex: searchQuery, $options: "i" } },
                { "name.french": { $regex: searchQuery, $options: "i" } },
                { "name.japanese": { $regex: searchQuery, $options: "i" } },
            ];
        }

        // Calculer le nombre total de Pokémons correspondant aux filtres
        const total = await pokemon.countDocuments(filter);

        // Calculer le nombre de pages
        const pages = Math.ceil(total / limit);

        // Récupérer les Pokémons avec pagination
        // skip() : saute les Pokémons des pages précédentes
        // limit() : limite au nombre de Pokémons par page
        // sort({ id: 1 }) : trier par ID croissant
        const pokemons = await pokemon
            .find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ id: 1 });

        // Retourner les résultats avec les métadonnées de pagination
        res.json({
            pokemons,
            pagination: {
                currentPage: page,
                totalPages: pages,
                totalPokemons: total,
                pokemonsPerPage: limit,
            },
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des Pokémons:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Route : GET /pokemons/:id
 * Description : Récupérer les détails d'un Pokémon spécifique par son ID
 * 
 * Paramètres :
 * - id : ID du Pokémon (ex: 1 pour Bulbasaur)
 * 
 * Exemple : GET /pokemons/1
 */
router.get("/:id", async (req, res) => {
    try {
        const poke = await pokemon.findOne({ id: parseInt(req.params.id) });
        if (poke) {
            res.json(poke);
        } else {
            res.status(404).json({ error: "Pokémon non trouvé" });
        }
    } catch (error) {
        console.error("Erreur lors de la récupération du Pokémon:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Route : GET /pokemons/types/all
 * Description : Récupérer la liste de tous les types de Pokémon disponibles
 * Utile pour alimenter les filtres dans le frontend
 * 
 * Réponse exemple :
 * {
 *   "types": ["Normal", "Fire", "Water", "Grass", ...]
 * }
 */
router.get("/types/all", async (req, res) => {
    try {
        // Utiliser l'agrégation MongoDB pour récupérer les types uniques
        const types = await pokemon.aggregate([
            { $unwind: "$type" }, // Décomposer le tableau des types
            { $group: { _id: "$type" } }, // Grouper par type unique
            { $sort: { _id: 1 } }, // Trier alphabétiquement
            { $project: { _id: 0, type: "$_id" } } // Reformater la sortie
        ]);

        // Extraire juste les noms des types
        const typesList = types.map(t => t.type);

        res.json({ types: typesList });
    } catch (error) {
        console.error("Erreur lors de la récupération des types:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Route : POST /pokemons/import
 * Description : Importer tous les Pokémons du fichier JSON dans la base de données
 * Cette route doit être appelée une seule fois pour initialiser la base de données
 * 
 * Authentification : Optionnelle (à modifier en production)
 * 
 * Réponse exemple :
 * {
 *   "message": "800 Pokémons importés avec succès",
 *   "count": 800
 * }
 */
router.post("/import", async (req, res) => {
    try {
        // Vérifier si des Pokémons existent déjà dans la base de données
        const existingCount = await pokemon.countDocuments();
        
        if (existingCount > 0) {
            return res.status(400).json({
                error: "Pokémons déjà importés",
                message: `Il y a déjà ${existingCount} Pokémons en base de données. Supprimez-les d'abord si vous voulez réimporter.`
            });
        }

        // Importer tous les Pokémons du fichier JSON
        const result = await pokemon.insertMany(pokemonsList);

        res.status(201).json({
            message: `✅ ${result.length} Pokémons importés avec succès`,
            count: result.length,
        });
    } catch (error) {
        console.error("Erreur lors de l'import des Pokémons:", error);
        res.status(500).json({ 
            error: "Erreur lors de l'import",
            message: error.message 
        });
    }
});

/**
 * Route : DELETE /pokemons/clear
 * Description : Supprimer TOUS les Pokémons de la base de données
 * ⚠️ ATTENTION : Cette opération est irréversible !
 * À utiliser uniquement en développement
 */
router.delete("/clear", async (req, res) => {
    try {
        const result = await pokemon.deleteMany({});
        res.json({
            message: `✅ ${result.deletedCount} Pokémons supprimés`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;