import { useState, useEffect } from "react";
import PokedexLogo from "./assets/components/Image/Pokedex_logo.png";

export default function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPokemon, setNewPokemon] = useState({
    name: "",
    hp: 50,
    attack: 50,
    description: "",
  });

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
        if (!response.ok) throw new Error("Failed to fetch Pokémon");
        const data = await response.json();

        const pokemonDetails = await Promise.all(
          data.results.map(async (pokemon, index) => {
            const res = await fetch(pokemon.url);
            const details = await res.json();
            return {
              id: index + 1,
              name: pokemon.name,
              image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`,
              description: details.species.url,
            };
          })
        );

        const customPokemons = JSON.parse(localStorage.getItem("customPokemons") || "[]");
        const allPokemons = [...pokemonDetails, ...customPokemons];

        setPokemonList(allPokemons);
        setFilteredPokemon(allPokemons);
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
      pokemonList.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, pokemonList]);

  const fetchDescription = async (url) => {
    if (!url.startsWith("http")) return url;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const flavor = data.flavor_text_entries?.find((e) => e.language.name === "en");
      return flavor?.flavor_text || "No description available.";
    } catch {
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
    const hp = pokemon.hp ?? getRandomValue();
    const attack = pokemon.attack ?? getRandomValue();
    setSelectedPokemon({ ...pokemon, description, hp, attack });
  };

  const handleCreatePokemon = (e) => {
  e.preventDefault();
  if (!newPokemon.name.trim()) return;

  const currentCustoms = JSON.parse(localStorage.getItem("customPokemons") || "[]");
  const nextId = currentCustoms.length > 0 
    ? Math.max(...currentCustoms.map(p => p.id)) + 1 
    : 152;

  const customPokemon = {
    id: nextId,
    name: newPokemon.name.trim().toLowerCase(),
    image: "https://via.placeholder.com/96?text=?",
    description: newPokemon.description.trim() || "A mysterious custom Pokémon.",
    hp: Number(newPokemon.hp) || 50,
    attack: Number(newPokemon.attack) || 50,
  };

  const updated = [...currentCustoms, customPokemon];
  localStorage.setItem("customPokemons", JSON.stringify(updated));

  setPokemonList((prev) => [...prev, customPokemon]);
  setFilteredPokemon((prev) => [...prev, customPokemon]);

  setNewPokemon({ name: "", hp: 50, attack: 50, description: "" });
  setShowCreateForm(false);
};

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-red-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <img src={PokedexLogo} alt="Logo Pokédex" className="h-12 mr-4" />
          <p className="font-semibold">A digital encyclopedia of Pokémon species</p>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
        >
          + Créer Pokémon
        </button>
      </header>

      <div className="px-4 flex justify-center py-5">
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleCreatePokemon}
            className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl"
          >
            <h2 className="text-2xl font-bold mb-4 text-center">Nouveau Pokémon</h2>

            <input
              type="text"
              placeholder="Nom du Pokémon"
              value={newPokemon.name}
              onChange={(e) => setNewPokemon({ ...newPokemon, name: e.target.value })}
              className="w-full p-2 mb-3 border rounded"
              required
            />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block mb-1">HP</label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={newPokemon.hp}
                  onChange={(e) => setNewPokemon({ ...newPokemon, hp: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block mb-1">Attack</label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={newPokemon.attack}
                  onChange={(e) => setNewPokemon({ ...newPokemon, attack: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <textarea
              placeholder="Description..."
              value={newPokemon.description}
              onChange={(e) => setNewPokemon({ ...newPokemon, description: e.target.value })}
              className="w-full p-2 mb-4 border rounded h-24"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Créer
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-4">
        {loading && <p className="text-center text-gray-600">Loading...</p>}
        {error && <p className="text-center text-red-500">Erreur : {error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredPokemon.map((pokemon) => (
              <div
                key={pokemon.id}
                onClick={() => handlePokemonClick(pokemon)}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer transition hover:scale-105"
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

      {selectedPokemon && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 sm:p-8 rounded-2xl max-w-lg w-full relative shadow-2xl">
            <button
              onClick={() => setSelectedPokemon(null)}
              className="absolute top-3 right-3 bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-700"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold capitalize text-center mb-4">
              {selectedPokemon.name}
            </h2>

            <img
              src={selectedPokemon.image}
              alt={selectedPokemon.name}
              className="h-40 mx-auto mb-6"
            />

            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Stats</h3>
                <p>HP: <strong className="text-red-600">{selectedPokemon.hp}</strong></p>
                <p>Attack: <strong className="text-blue-700">{selectedPokemon.attack}</strong></p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-700">{selectedPokemon.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}