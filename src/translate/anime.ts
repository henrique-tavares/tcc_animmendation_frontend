import type {
  AnimeAgeClassification,
  AnimeMediaType,
  AnimeRelation,
  AnimeSeason,
  AnimeStatus,
} from "@/graphql/gen/generated";

export function releasedSeasonTranslator(releasedSeason: string) {
  const map = {
    fall: "primavera",
    spring: "outono",
    summer: "inverno",
    winter: "verão",
  } as const;

  const [season, year] = releasedSeason.split(", ");

  return `${map[season as keyof typeof map]} de ${year}`;
}

export function seasonTranslator(season: AnimeSeason) {
  const map: Record<AnimeSeason, string> = {
    FALL: "primavera",
    SPRING: "outono",
    SUMMER: "inverno",
    WINTER: "verão",
  };

  return map[season];
}

export function genresTranslator(genre: string) {
  const map: Record<string, string> = {
    Comedy: "comédia",
    Action: "ação",
    Fantasy: "fantasia",
    Adventure: "aventura",
    Shounen: "shounen",
    School: "escola",
    Supernatural: "sobrenatural",
    "Slice of Life": "slice of life",
    Kids: "infantil",
    Historical: "histórico",
    Mystery: "mistério",
    Music: "música",
    Sports: "esportes",
    "Super Power": "super poderes",
    Military: "militar",
    Parody: "paródia",
    Space: "espaço",
    Horror: "terror",
    "Martial Arts": "artes marciais",
    "Strategy game": "jogo de estratégia",
    "Team Sports": "esportes de equipe",
    Psychological: "psicológico",
    Detective: "detetive",
    "Gap Humor": "humor de piada",
  };

  return map[genre] ?? genre.toLowerCase();
}

export function mediaTypeTranslator(mediaType: AnimeMediaType) {
  const map: Record<AnimeMediaType, string> = {
    MOVIE: "Filme",
    ONA: "ONA",
    OVA: "OVA",
    TV: "TV",
    SPECIAL: "Especial",
  };

  return map[mediaType];
}

export function sourcesTranslator(source: string) {
  const map: Record<string, string> = {
    manga: "mangá",
    visual_novel: "visual novel",
    light_novel: "light novel",
    game: "jogo",
    novel: "novel",
    other: "outro",
    "4_koma_manga": "mangá 4-koma",
    web_maga: "mangá web",
    book: "livro",
    card_game: "jogo de cartas",
  };

  return map[source] ?? source.replaceAll("_", " ");
}

export function ageTranslator(age: AnimeAgeClassification) {
  const map: Record<AnimeAgeClassification, string> = {
    G: "Livre",
    PG: "10 anos",
    PG_13: "13 anos",
    R: "16 anos",
    R_PLUS: "16 anos",
    RX: "18 anos",
  };

  return map[age];
}

export function statusTranslator(status: AnimeStatus) {
  const map: Record<AnimeStatus, string> = {
    AIRING: "em andamento",
    FINISHED: "terminado",
  };

  return map[status];
}

export function relationTranslator(relation: AnimeRelation) {
  const map: Record<AnimeRelation, string> = {
    alternative_setting: "versão alternativa",
    alternative_version: "versão alternativa",
    other: "outro",
    character: "personagem",
    full_story: "história completa",
    parent_story: "história original",
    prequel: "prequel",
    sequel: "sequência",
    side_story: "história paralela",
    spin_off: "spin off",
    summary: "resumo",
  };

  return map[relation];
}
