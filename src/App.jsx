import { useState, useEffect } from 'react';
import PokedexLogo from './assets/components/Image/Pokedex_logo.png';

export default function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
        if (!response.ok) throw new Error('Failed to fetch Pokémon');
        const data = await response.json();

        const pokemonDetails = await Promise.all(
          data.results.map(async (pokemon, index) => {
            const res = await fetch(pokemon.url);
            const details = await res.json();

            return {
              id: index + 1,
              name: pokemon.name,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
              description: details.species.url
            };
          })
        );

        setPokemonList(pokemonDetails);
        setFilteredPokemon(pokemonDetails);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPokemon();
  }, []);

  useEffect(() => {
    setFilteredPokemon(
      pokemonList.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, pokemonList]);

  const fetchDescription = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      const flavorText = data.flavor_text_entries.find(
        entry => entry.language.name === 'en'
      );
      return flavorText ? flavorText.flavor_text : 'No description available.';
    } catch (err) {
      return 'Failed to load description.';
    }
  };

  const handlePokemonClick = async (pokemon) => {
    const description = await fetchDescription(pokemon.description);
    setSelectedPokemon({ ...pokemon, description });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-yellow-400 text-white p-4 flex items-center">
         <img
          src={PokedexLogo} // Utilisez la variable importée ici
          alt="Logo Pokédex"
          className="h-10 mr-4"
        />
        <p className="ml-4 text-lg">A digital encyclopedia of Pokémon species</p>
      </header>

      {/* Search Bar */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-600"
        />
      </div>

      {/* Grid */}
      <div className="p-4">
        {loading && <p className="text-center text-gray-600">Loading Pokémon...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredPokemon.map(pokemon => (
              <div
                key={pokemon.id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg cursor-pointer transition"
                onClick={() => handlePokemonClick(pokemon)}
              >
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="w-24 h-24 mx-auto"
                />
                <h2 className="text-center text-lg font-semibold capitalize">{pokemon.name}</h2>
                <p className="text-center text-gray-500">#{pokemon.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPokemon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full shadow-lg">
            <h2 className="text-2xl font-bold capitalize mb-2">{selectedPokemon.name}</h2>
            <img
              src={selectedPokemon.image}
              alt={selectedPokemon.name}
              className="w-32 h-32 mx-auto mb-4"
            />
            <p className="text-gray-700 mb-4">{selectedPokemon.description}</p>
            <button
              onClick={() => setSelectedPokemon(null)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
