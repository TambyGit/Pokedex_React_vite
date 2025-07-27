import { useState, useEffect } from "react";
import PokedexLogo from "./assets/components/Image/Pokedex_logo.png";

export default function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=151"
        );
        if (!response.ok) throw new Error("Failed to fetch Pokémon");
        const data = await response.json();

        const pokemonDetails = await Promise.all(
          data.results.map(async (pokemon, index) => {
            const res = await fetch(pokemon.url);
            const details = await res.json();

            return {
              id: index + 1,
              name: pokemon.name,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                index + 1
              }.png`,
              description: details.species.url,
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
      pokemonList.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, pokemonList]);

  const fetchDescription = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      const flavorText = data.flavor_text_entries.find(
        (entry) => entry.language.name === "en"
      );
      return flavorText ? flavorText.flavor_text : "No description available.";
    } catch (err) {
      return "Failed to load description.";
    }
  };

const getRandomValue = () => {
  let value;
  do {
    value = Math.floor(Math.random() * 100) + 1;
  } while (value === 59 || value === 63);
  return value;
};

const handlePokemonClick = async (pokemon) => {
  const description = await fetchDescription(pokemon.description);
  const hp = getRandomValue();
  const attack = getRandomValue();
  setSelectedPokemon({ ...pokemon, description, hp, attack });
};

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-600 text-white p-4 flex justify-between">
        <img
          src={PokedexLogo}
          alt="Logo Pokédex"
          className="h-12 mr-4"
        />
        <paragraphe className="ml-4 font-semibold mr-7 mt-1.5">
          A digital encyclopedia of Pokémon species
        </paragraphe>
      </header>

      {/* Search Bar */}
      <div className="px-4 flex justify-center py-5">
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mx-auto"
        />
      </div>

      {/* Grid */}
      <div className="p-4 bg">
        {loading && (
          <p className="text-center text-gray-600">Loading Pokémon...</p>
        )}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ">
            {filteredPokemon.map((pokemon) => (
              <div
                key={pokemon.id}
                className="bg-white p-4 rounded-lg shadow-md hover:scale-106 hover:bg-amber-300 cursor-pointer transition"
                onClick={() => handlePokemonClick(pokemon)}
              >
                <img
                  src={pokemon.image}
                  alt={pokemon.name}
                  className="w-24 h-24 mx-auto"
                />
                <h2 className="text-center text-lg font-semibold capitalize">
                  {pokemon.name}
                </h2>
                <p className="text-center text-gray-500">#{pokemon.id}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
     {selectedPokemon && (
  <div className="fixed inset-0 bg-gradient-to-b from-gray-900/90 to-gray-700/90 flex items-center justify-center p-4 z-50 animate-fade-in">
    <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl max-w-lg w-full shadow-2xl transform transition-all duration-500 ease-out scale-95 hover:scale-100">
      <button
        onClick={() => setSelectedPokemon(null)}
        className="absolute top-4 right-4 bg-red-600 text-white text-lg font-bold w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-700 hover:scale-110 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
      >
        X
      </button>
      <h2 className="text-3xl font-extrabold capitalize text-gray-900 mb-4 tracking-tight">
        {selectedPokemon.name}
      </h2>
      <img
        src={selectedPokemon.image}
        alt={selectedPokemon.name}
        className="h-48 mx-auto mb-6 rounded-lg border-4 border-gray-200/50 shadow-md hover:shadow-amber-400 hover:-translate-y-1 transition-all duration-300 ease-in-out"
      />
      <div className="grid grid-cols-2 gap-4 justify-center">
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner ">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex justify-center">Statut</h3>
          <p className="text-gray-600 flex justify-center py-1">
            Health
          </p>
            <span className="font-bold text-red-600 flex justify-center text-xl">{selectedPokemon.hp}</span>
          <p className="text-gray-600 flex justify-center py-1.5">
            Attack
          </p>
            <span className="font-bold text-blue-800 flex justify-center text-xl">{selectedPokemon.attack}</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex justify-center">Hability</h3>
          <p className="text-gray-600 flex text-center">{selectedPokemon.description}</p>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
