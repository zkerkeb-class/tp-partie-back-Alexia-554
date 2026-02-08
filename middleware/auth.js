import jwt from "jsonwebtoken";

/**
 * Middleware d'authentification JWT
 * Vérifie que l'utilisateur a fourni un token JWT valide dans les entêtes
 * 
 * Utilisation dans les routes protégées :
 *   router.get('/protected-route', authenticateToken, (req, res) => { ... })
 */
export const authenticateToken = (req, res, next) => {
    // Récupérer le token JWT de l'entête Authorization
    // Format attendu : "Bearer <token>"
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Récupérer la partie après "Bearer "

    // Si aucun token n'est fourni, retourner une erreur 401 (Non authentifié)
    if (!token) {
        return res.status(401).json({ 
            error: "Accès refusé. Token manquant.",
            message: "Vous devez fournir un token JWT valide"
        });
    }

    // Vérifier et décoder le token JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        // Si le token est invalide ou expiré
        if (err) {
            return res.status(403).json({ 
                error: "Token invalide ou expiré",
                message: "Veuillez vous reconnecter"
            });
        }

        // Si le token est valide, ajouter les informations utilisateur à la requête
        // Cela permet aux fonctions suivantes d'accéder à req.user
        req.user = user;
        next(); // Continuer vers la fonction suivante
    });
};

/**
 * Fonction pour créer un token JWT
 * @param {Object} user - Objet utilisateur contenant l'ID et email
 * @returns {string} Token JWT valide
 */
export const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, username: user.username }, // Données encodées dans le token
        process.env.JWT_SECRET, // Clé secrète pour signer le token
        { expiresIn: "24h" } // Le token expire après 24 heures
    );
};