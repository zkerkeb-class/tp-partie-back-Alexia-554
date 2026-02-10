import express from "express";
import pokemon from "../schema/pokemon.js";
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
        const limit = parseInt(req.query.limit) || 20; // Pokémons par page (défaut: 20)
        const typeFilter = req.query.type; // Type de Pokémon (optionnel)
        const searchQuery = req.query.search; // Recherche par nom (optionnel)

        // Construire les filtres pour MongoDB
        let filter = {};

        // Filtre par type si fourni
        if (typeFilter) {
            // Supporte plusieurs types fournis en string comma-separated ou en tableau
            let types = typeFilter;
            if (typeof typeFilter === 'string') {
                types = typeFilter.split(',').map(t => t.trim()).filter(Boolean);
            }
            // Rechercher les Pokémons ayant au moins un des types demandés
            filter.type = { $in: types };
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
 * Route : POST /pokemons
 * Description : Créer un nouveau Pokémon
 * 
 * Body attendu :
 * {
 *   "id": 152,
 *   "name": { "french": "Chikorita", "english": "Chikorita", "japanese": "チコリータ", "chinese": "菊草叶" },
 *   "type": ["Grass"],
 *   "base": { "HP": 45, "Attack": 49, "Defense": 65, "SpecialAttack": 49, "SpecialDefense": 65, "Speed": 45 },
 *   "image": "/pokemons/152.png"
 * }
 */
router.post("/", async (req, res) => {
    try {
        const newPokemon = req.body;

        // Validation basique
        if (!newPokemon.id || !newPokemon.name || !newPokemon.type || !newPokemon.base) {
            return res.status(400).json({
                error: "Données manquantes",
                message: "Les champs id, name, type et base sont obligatoires"
            });
        }

        // Vérifier que le pokemon n'existe pas déjà
        const existing = await pokemon.findOne({ id: newPokemon.id });
        if (existing) {
            return res.status(409).json({
                error: "Pokémon déjà existant",
                message: `Un Pokémon avec l'ID ${newPokemon.id} existe déjà`
            });
        }

        // Créer le nouveau Pokémon
        const created = await pokemon.create(newPokemon);

        res.status(201).json({
            message: "✅ Pokémon créé avec succès",
            pokemon: created
        });
    } catch (error) {
        console.error("Erreur lors de la création du Pokémon:", error);
        res.status(500).json({ 
            error: "Erreur lors de la création",
            message: error.message 
        });
    }
});

/**
 * Route : PUT /pokemons/:id
 * Description : Mettre à jour un Pokémon existant
 * 
 * Paramètres :
 * - id : ID du Pokémon à modifier
 * 
 * Body attendu : les champs à modifier (au moins un)
 */
router.put("/:id", async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.id);
        const updates = req.body;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                error: "Aucune donnée à mettre à jour"
            });
        }

        // Trouver et mettre à jour le Pokémon
        const updated = await pokemon.findOneAndUpdate(
            { id: pokemonId },
            updates,
            { new: true, runValidators: true } // new: true retourne le document mis à jour
        );

        if (!updated) {
            return res.status(404).json({
                error: "Pokémon non trouvé"
            });
        }

        res.json({
            message: "✅ Pokémon mis à jour avec succès",
            pokemon: updated
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du Pokémon:", error);
        res.status(500).json({ 
            error: "Erreur lors de la mise à jour",
            message: error.message 
        });
    }
});

/**
 * Route : DELETE /pokemons/:id
 * Description : Supprimer un Pokémon spécifique
 * 
 * Paramètres :
 * - id : ID du Pokémon à supprimer
 */
router.delete("/:id", async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.id);

        const deleted = await pokemon.findOneAndDelete({ id: pokemonId });

        if (!deleted) {
            return res.status(404).json({
                error: "Pokémon non trouvé"
            });
        }

        res.json({
            message: "✅ Pokémon supprimé avec succès",
            pokemon: deleted
        });
    } catch (error) {
        console.error("Erreur lors de la suppression du Pokémon:", error);
        res.status(500).json({ 
            error: "Erreur lors de la suppression",
            message: error.message 
        });
    }
});

/*
 * Attendu : fournir un tableau `pokemons` dans le corps de la requête (JSON)
 * Exemple de body : { "pokemons": [ { id: 1, name: {...}, type: [...], base: {...}, image: "..." }, ... ] }
 * Si aucun tableau n'est fourni, la route renvoie une instruction pour utiliser le script de seed (`npm run seed`).
 */
router.post("/import", async (req, res) => {
    try {
        const pokemons = req.body && req.body.pokemons;

        // Si aucun tableau fourni, indiquer la méthode de seed
        if (!pokemons || !Array.isArray(pokemons) || pokemons.length === 0) {
            return res.status(400).json({
                error: "Aucun tableau de Pokémons fourni",
                message: "Fournissez un tableau JSON 'pokemons' dans le body ou exécutez 'npm run seed' pour initialiser la base de données."
            });
        }

        // Vérifier si des Pokémons existent déjà
        const existingCount = await pokemon.countDocuments();
        if (existingCount > 0) {
            return res.status(400).json({
                error: "Pokémons déjà importés",
                message: `Il y a déjà ${existingCount} Pokémons en base de données. Supprimez-les d'abord si vous voulez réimporter.`
            });
        }

        // Insérer les Pokémons fournis dans la base de données
        const result = await pokemon.insertMany(pokemons);

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