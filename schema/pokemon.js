import mongoose from "mongoose";

/**
 * Schéma Pokémon pour MongoDB
 * Définit la structure et les validations pour les Pokémons
 * Chaque champ a des règles spécifiques pour assurer la qualité des données
 */
const pokemonSchema = new mongoose.Schema({
    // Identifiant unique du Pokémon (ex: 1 pour Bulbasaur)
    id: {
        type: Number,
        required: true, // Obligatoire
        unique: true, // Doit être unique (pas de doublons)
    },

    // Noms du Pokémon dans différentes langues
    name: {
        english: { type: String, required: true }, // Nom anglais (ex: "Bulbasaur")
        japanese: { type: String, required: true }, // Nom japonais (ex: "フシギダネ")
        chinese: { type: String, required: true }, // Nom chinois (ex: "妙蛙种子")
        french: { type: String, required: true }, // Nom français (ex: "Bulbizarre")
    },

    // Types du Pokémon (un Pokémon peut avoir jusqu'à 2 types)
    // Exemples : ["Grass"], ["Fire", "Water"], etc.
    type: {
        type: [String],
        required: true,
    },

    // Statistiques de base du Pokémon
    base: {
        HP: { type: Number, required: true }, // Points de vie
        Attack: { type: Number, required: true }, // Attaque
        Defense: { type: Number, required: true }, // Défense
        SpecialAttack: { type: Number, required: true }, // Attaque spéciale
        SpecialDefense: { type: Number, required: true }, // Défense spéciale
        Speed: { type: Number, required: true }, // Vitesse
    },

    // URL de l'image du Pokémon
    image: {
        type: String,
        required: true,
    },
});

/**
 * Export du modèle Pokémon
 * "pokemon" est le nom de la collection dans MongoDB (sera créée automatiquement)
 * Ce modèle est utilisé pour créer, lire, mettre à jour et supprimer des Pokémons
 */
export default mongoose.model("pokemon", pokemonSchema);
