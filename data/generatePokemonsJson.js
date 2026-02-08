import fs from 'fs';
import { connectDB } from '../connect.js';
import pokemonModel from '../schema/pokemon.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generatePokemonsJson = async () => {
    try {
        // Se connecter à la base de données et récupérer tous les Pokémons
        await connectDB();
        const pokemons = await pokemonModel.find({}).sort({ id: 1 }).lean();

        // Convertir en JSON formaté
        const pokemonsJson = JSON.stringify(pokemons, null, 2);

        // Utiliser un chemin absolu pour écrire le fichier
        const filePath = new URL('./pokemons.json', import.meta.url);

        // Écrire le fichier JSON
        fs.writeFileSync(filePath, pokemonsJson);

        console.log('Le fichier pokemons.json a été généré depuis MongoDB avec succès !');
    } catch (error) {
        console.error('Erreur lors de la génération du fichier JSON depuis MongoDB :', error);
    }
};

// Exécuter la fonction si le fichier est appelé directement
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    generatePokemonsJson();
}

export default generatePokemonsJson; 