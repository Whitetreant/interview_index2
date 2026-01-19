"use client";

import { useEffect, useState } from "react";
import PokemonCard from "./components/Cards";

type SpeciesResponse = {
  pokemon_species: {
    name: string;
    url: string;
  }[];
};

type Pokemon = {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  abilities: {
    ability: { name: string };
  }[];
};

async function getGeneration(gen: number): Promise<SpeciesResponse> {
  const res = await fetch(`https://pokeapi.co/api/v2/generation/${gen}`);

  if (!res.ok) {
    throw new Error("Failed to fetch generation");
  }

  return res.json();
}

async function getPokemonData(
  name: string,
  retry = 2,
): Promise<Pokemon | null> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

    if (!res.ok) {
      if (retry > 0) {
        await new Promise((r) => setTimeout(r, 500));
        return getPokemonData(name, retry - 1);
      }
      return null;
    }

    return res.json();
  } catch {
    return null;
  }
}

async function getBatchPokemon(names: string[]) {
  const BATCH_SIZE = 5;
  const results: Pokemon[] = [];

  for (let i = 0; i < names.length; i += BATCH_SIZE) {
    const batch = names.slice(i, i + BATCH_SIZE);
    const data = await Promise.all(batch.map(getPokemonData));
    results.push(...(data.filter(Boolean) as Pokemon[]));
  }

  return results;
}

export default function PokemonPageClient() {
  const [generation, setGeneration] = useState(2);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const species = await getGeneration(generation);
        const names = species.pokemon_species.map((p) => p.name);
        const data = await getBatchPokemon(names);

        setPokemons(data);
      } catch {
        setError("Failed to load pokemon");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [generation]); // ⭐ เปลี่ยน gen = fetch ใหม่

  return (
    <main className="p-6">
      {/* Generation Selector */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Generation:</label>
        <select
          value={generation}
          onChange={(e) => setGeneration(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
            <option key={gen} value={gen}>
              Gen {gen}
            </option>
          ))}
        </select>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        Generation {generation} Pokemon
      </h1>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
        >
          {pokemons.map((pokemon) => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} />
          ))}
        </div>
      )}
    </main>
  );
}
