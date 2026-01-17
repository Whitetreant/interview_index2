import { nextImageLoaderRegex } from "next/dist/build/webpack-config";
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

/* Try to get name and url of specific pokemon generation */
async function getGeneration(gen: number) {
  const responseGen = await fetch(
    `https://pokeapi.co/api/v2/generation/${gen}`,
    { cache: "no-store" }
  );

  if (!responseGen.ok) {
    throw new Error("Failed to fetch generation data");
  }

  return responseGen.json() as Promise<SpeciesResponse>;
}

/* Try to get Pokemon data */
async function getPokemonData(name: string, retry = 2) {
  try {
    const pokemonData = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${name}`,
      { cache: "no-store" }
    );
    if (!pokemonData.ok) {
      if (retry > 0) {
        await new Promise((r) => setTimeout(r, 500));
        return getPokemonData(name, retry - 1);
      }
      return null;
    }

    return pokemonData.json();
  } catch {
    return null;
  }
}

async function getBatchPokemon(names: string[]) {
  const BATCH_SIZE = 5;
  const results: Pokemon[] = [];
  for (let i = 0; i < names.length; i += BATCH_SIZE) {
    const batch = names.slice(i, i + BATCH_SIZE);
    const data = await Promise.all(batch.map((name) => getPokemonData(name)));
    results.push(...(data.filter(Boolean) as Pokemon[]));
  }
  return results;
}

export default async function Home() {
  const species = await getGeneration(2);
  const names = species.pokemon_species.map((pokemon) => pokemon.name);
  const pokemons = await getBatchPokemon(names);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Generation 2 Pokémon</h1>

      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}
      >
        {pokemons.map((pokemon) => (
          <PokemonCard key={pokemon.id} pokemon={pokemon} />
        ))}
      </div>
    </main>
  );
}
