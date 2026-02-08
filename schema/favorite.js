import mongoose from "mongoose";

/**
 * Schéma pour les Pokémons favoris
 * Permet à chaque utilisateur d'avoir une liste de Pokémons qu'il aime
 */
const favoriteSchema = new mongoose.Schema({
    // Référence à l'utilisateur qui a mis ce Pokémon en favoris
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    
    // ID du Pokémon mis en favoris (correspond à l'ID dans le schéma pokemon)
    pokemonId: {
        type: Number,
        required: true,
    },

    // Nom du Pokémon (pour faciliter la recherche et l'affichage)
    pokemonName: {
        type: String,
        required: true,
    },

    // Date à laquelle le Pokémon a été ajouté en favoris
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

/**
 * Index unique pour éviter les doublons
 * Un utilisateur ne peut pas ajouter deux fois le même Pokémon en favoris
 */
favoriteSchema.index({ userId: 1, pokemonId: 1 }, { unique: true });

/**
 * Export du modèle pour les favoris
 * Ce modèle permet de gérer la liste des Pokémons favoris de chaque utilisateur
 */
export default mongoose.model("Favorite", favoriteSchema);