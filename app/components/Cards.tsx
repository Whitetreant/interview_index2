type Props = {
  pokemon: {
    name: string;
    sprites: {
      front_default: string;
    };
    abilities: {
      ability: { name: string };
    }[];
  };
};

export default function PokemonCard({ pokemon }: Props) {
  return (
    <div className="border p-2 text-center">
      <img
        src={pokemon.sprites.front_default}
        alt={pokemon.name}
        className="mx-auto"
      />

      <p className="font-semibold capitalize"> {pokemon.name} </p>

      <div className="text-xd mt-1">
        <p className="font-bold"> Ability </p>
        {pokemon.abilities.map((a) => (
          <p key={a.ability.name}>{a.ability.name}</p>
        ))}
      </div>
    </div>
  );
}
