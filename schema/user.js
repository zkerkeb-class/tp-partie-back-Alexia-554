import mongoose from "mongoose";

/**
 * Schéma utilisateur pour la base de données MongoDB
 * Contient les informations d'authentification et de profil de l'utilisateur
 */
const userSchema = new mongoose.Schema({
    // Email unique pour chaque utilisateur
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    
    // Mot de passe hashé avec bcryptjs (jamais stocké en texte clair)
    password: {
        type: String,
        required: true,
    },

    // Nom d'utilisateur unique
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },

    // Date de création du compte
    createdAt: {
        type: Date,
        default: Date.now,
    },

    // Dernier accès à l'application
    lastLogin: {
        type: Date,
        default: null,
    },
});

/**
 * Export du modèle utilisateur
 * Ce modèle est utilisé pour créer, lire, mettre à jour et supprimer des utilisateurs
 */
export default mongoose.model("User", userSchema);