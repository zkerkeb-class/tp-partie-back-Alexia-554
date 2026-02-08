import mongoose from "mongoose";

/**
 * Connexion à la base de données MongoDB
 * Cette fonction établit la connexion avec la base de données locale MongoDB
 * MongoDB doit être lancé sur le port 27017 (par défaut)
 */
export const connectDB = async () => {
    try {
        // Se connecter à MongoDB sur localhost (votre machine) avec le nom de base "pokemon-db"
        await mongoose.connect("mongodb://localhost:27017/pokemon-db");
        console.log("✅ Connecté à MongoDB avec succès");
    } catch (error) {
        console.error("❌ Erreur de connexion à MongoDB:", error);
        process.exit(1);
    }
};

// Établir la connexion au démarrage de l'application
connectDB();