import express from "express";
import Favorite from "../schema/favorite.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * Route : GET /favorites
 * Description : Récupérer la liste des Pokémons favoris de l'utilisateur connecté
 * 
 * Authentification : REQUISE (token JWT dans l'entête Authorization)
 * 
 * Header requis :
 * Authorization: Bearer <votre_token_jwt>
 * 
 * Réponse exemple :
 * {
 *   "favorites": [
 *     { "pokemonId": 25, "pokemonName": "Pikachu", ... },
 *     { "pokemonId": 39, "pokemonName": "Jigglypuff", ... }
 *   ]
 * }
 */
router.get("/", authenticateToken, async (req, res) => {
    try {
        // Récupérer tous les favoris de l'utilisateur connecté
        // req.user.id provient du token JWT décrypté
        const favorites = await Favorite.find({ userId: req.user.id }).sort({ addedAt: -1 });

        res.json({ 
            favorites,
            count: favorites.length 
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des favoris:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Route : POST /favorites
 * Description : Ajouter un Pokémon aux favoris de l'utilisateur
 * 
 * Authentification : REQUISE (token JWT dans l'entête Authorization)
 * 
 * Données requises (JSON body) :
 * {
 *   "pokemonId": 25,
 *   "pokemonName": "Pikachu"
 * }
 * 
 * Réponse si succès (201) :
 * {
 *   "message": "Pikachu ajouté aux favoris",
 *   "favorite": { ... }
 * }
 */
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { pokemonId, pokemonName } = req.body;

        // Vérifier que les données requises sont fournies
        if (!pokemonId || !pokemonName) {
            return res.status(400).json({
                error: "Données manquantes",
                message: "pokemonId et pokemonName sont requis"
            });
        }

        // Vérifier si ce Pokémon est déjà en favoris
        const existing = await Favorite.findOne({
            userId: req.user.id,
            pokemonId: pokemonId
        });

        if (existing) {
            return res.status(400).json({
                error: "Déjà en favoris",
                message: "Ce Pokémon est déjà dans votre liste de favoris"
            });
        }

        // Créer un nouveau favori
        const favorite = new Favorite({
            userId: req.user.id,
            pokemonId,
            pokemonName,
        });

        // Sauvegarder dans la base de données
        await favorite.save();

        res.status(201).json({
            message: `✅ ${pokemonName} ajouté aux favoris`,
            favorite,
        });
    } catch (error) {
        console.error("Erreur lors de l'ajout aux favoris:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Route : DELETE /favorites/:pokemonId
 * Description : Supprimer un Pokémon des favoris de l'utilisateur
 * 
 * Authentification : REQUISE (token JWT dans l'entête Authorization)
 * 
 * Paramètres :
 * - pokemonId : ID du Pokémon à supprimer des favoris
 * 
 * Exemple : DELETE /favorites/25
 */
router.delete("/:pokemonId", authenticateToken, async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.pokemonId);

        // Supprimer le favori
        const result = await Favorite.findOneAndDelete({
            userId: req.user.id,
            pokemonId: pokemonId
        });

        if (!result) {
            return res.status(404).json({
                error: "Favori non trouvé",
                message: "Ce Pokémon n'est pas dans votre liste de favoris"
            });
        }

        res.json({
            message: `✅ ${result.pokemonName} supprimé des favoris`,
        });
    } catch (error) {
        console.error("Erreur lors de la suppression du favori:", error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Route : GET /favorites/check/:pokemonId
 * Description : Vérifier si un Pokémon est dans les favoris de l'utilisateur
 * 
 * Authentification : REQUISE (token JWT dans l'entête Authorization)
 * 
 * Réponse exemple :
 * {
 *   "isFavorite": true,
 *   "pokemonId": 25
 * }
 */
router.get("/check/:pokemonId", authenticateToken, async (req, res) => {
    try {
        const pokemonId = parseInt(req.params.pokemonId);

        const favorite = await Favorite.findOne({
            userId: req.user.id,
            pokemonId: pokemonId
        });

        res.json({
            isFavorite: !!favorite,
            pokemonId
        });
    } catch (error) {
        console.error("Erreur lors de la vérification du favori:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;