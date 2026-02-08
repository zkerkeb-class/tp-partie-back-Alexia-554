import { connectDB } from '../connect.js';
import pokemonModel from '../schema/pokemon.js';

const inspect = async () => {
  try {
    await connectDB();
    const count = await pokemonModel.countDocuments();
    console.log(`Pokémons en base: ${count}`);
    const one = await pokemonModel.findOne({}).lean();
    console.log('Exemple de document (premier trouvé):');
    console.log(JSON.stringify(one, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Erreur d\'inspection DB:', err);
    process.exit(1);
  }
};

inspect();
