import express from "express";
import bcryptjs from "bcryptjs";
import User from "../schema/user.js";
import { generateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * Route : POST /auth/register
 * Description : Créer un nouvel utilisateur et l'enregistrer dans la base de données
 * 
 * Données requises (JSON body) :
 * {
 *   "email": "example@example.com",
 *   "username": "monnom",
 *   "password": "monmotdepasse"
 * }
 * 
 * Réponse si succès (201) :
 * {
 *   "message": "Utilisateur créé avec succès",
 *   "token": "eyJhbGciOiJIUzI1NiIs..."
 * }
 */
router.post("/register", async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Vérifier que tous les champs sont fournis
        if (!email || !username || !password) {
            return res.status(400).json({ 
                error: "Champs manquants",
                message: "Email, username et password sont requis"
            });
        }

        // Vérifier si l'email existe déjà
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ 
                error: "Email déjà utilisé",
                message: "Un compte avec cet email existe déjà"
            });
        }

        // Vérifier si le username existe déjà
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ 
                error: "Username déjà utilisé",
                message: "Ce nom d'utilisateur est déjà pris"
            });
        }

        // Hasher le mot de passe avec bcryptjs (plus sécurisé que du texte clair)
        // L'argument 10 définit le "salt round" (plus élevé = plus sécurisé mais plus lent)
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Créer le nouvel utilisateur dans la base de données
        const newUser = new User({
            email,
            username,
            password: hashedPassword,
        });

        // Sauvegarder l'utilisateur dans MongoDB
        await newUser.save();

        // Générer un token JWT pour l'utilisateur (connexion automatique après inscription)
        const token = generateToken(newUser);

        // Retourner le token et les informations utilisateur
        res.status(201).json({
            message: "✅ Utilisateur créé avec succès",
            token,
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
            },
        });
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        res.status(500).json({ 
            error: "Erreur serveur",
            message: error.message 
        });
    }
});

/**
 * Route : POST /auth/login
 * Description : Connecter un utilisateur existant
 * 
 * Données requises (JSON body) :
 * {
 *   "email": "example@example.com",
 *   "password": "monmotdepasse"
 * }
 * 
 * Réponse si succès (200) :
 * {
 *   "message": "Connexion réussie",
 *   "token": "eyJhbGciOiJIUzI1NiIs...",
 *   "user": { ... }
 * }
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier que l'email et le mot de passe sont fournis
        if (!email || !password) {
            return res.status(400).json({ 
                error: "Champs manquants",
                message: "Email et password sont requis"
            });
        }

        // Chercher l'utilisateur avec cet email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                error: "Identifiants invalides",
                message: "Email ou mot de passe incorrect"
            });
        }

        // Comparer le mot de passe fourni avec le mot de passe hashé en base de données
        const passwordMatch = await bcryptjs.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ 
                error: "Identifiants invalides",
                message: "Email ou mot de passe incorrect"
            });
        }

        // Mettre à jour la date de dernière connexion
        user.lastLogin = new Date();
        await user.save();

        // Générer un token JWT pour cette session
        const token = generateToken(user);

        // Retourner le token et les informations utilisateur
        res.status(200).json({
            message: "✅ Connexion réussie",
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
            },
        });
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        res.status(500).json({ 
            error: "Erreur serveur",
            message: error.message 
        });
    }
});

/**
 * Route : POST /auth/logout
 * Description : Déconnecter l'utilisateur (côté client, il faut supprimer le token)
 * Cette route est optionnelle car les tokens JWT n'ont pas besoin d'être "déactivés" côté serveur
 * (ils expirent automatiquement). C'est juste une confirmation côté serveur.
 */
router.post("/logout", (req, res) => {
    res.status(200).json({
        message: "✅ Déconnexion réussie. Supprimez le token côté client."
    });
});

export default router;