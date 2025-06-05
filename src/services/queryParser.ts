export interface ParsedQuery {
  original: string;
  terms: string[];
  possibleArtist?: string;
  possibleTitle?: string;
  searchStrategies: SearchStrategy[];
}

export enum SearchStrategy {
  EXACT_MATCH = "exact",
  TITLE_ARTIST = "title_artist",
  ARTIST_TITLE = "artist_title",
  ARTIST_ONLY = "artist_only",
  TITLE_ONLY = "title_only",
  FUZZY = "fuzzy",
}

class QueryParser {
  private commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
  ]);
  private separators = [
    " - ",
    " by ",
    " from ",
    " feat ",
    " ft ",
    " featuring ",
  ];

  parseQuery(query: string): ParsedQuery {
    const cleanQuery = query.trim().toLowerCase();
    const terms = this.splitQuery(cleanQuery);

    const result: ParsedQuery = {
      original: query,
      terms,
      searchStrategies: [SearchStrategy.EXACT_MATCH],
    };

    // Try to identify artist and title patterns
    if (terms.length >= 2) {
      const { artist, title } = this.identifyArtistAndTitle(terms);
      result.possibleArtist = artist;
      result.possibleTitle = title;

      if (artist && title) {
        result.searchStrategies.push(
          SearchStrategy.TITLE_ARTIST,
          SearchStrategy.ARTIST_TITLE
        );
      }

      result.searchStrategies.push(
        SearchStrategy.ARTIST_ONLY,
        SearchStrategy.TITLE_ONLY
      );
    }

    result.searchStrategies.push(SearchStrategy.FUZZY);

    return result;
  }

  private splitQuery(query: string): string[] {
    // Try common separators first
    for (const sep of this.separators) {
      if (query.includes(sep)) {
        return query
          .split(sep)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);
      }
    }

    // Fall back to space separation, but try to be smart about it
    const words = query.split(" ").filter((w) => w.length > 0);

    if (words.length <= 2) {
      return words;
    }

    // For longer queries, try to identify the split point
    // Common pattern: longer first part (title) + shorter second part (artist)
    for (let i = 1; i < words.length; i++) {
      const firstPart = words.slice(0, i).join(" ");
      const secondPart = words.slice(i).join(" ");

      // If second part looks like an artist name (2-3 words max)
      if (words.slice(i).length <= 3 && secondPart.length >= 3) {
        return [firstPart, secondPart];
      }
    }

    return words;
  }

  private identifyArtistAndTitle(terms: string[]): {
    artist?: string;
    title?: string;
  } {
    if (terms.length === 2) {
      // For two terms, we'll try both combinations
      return {
        title: terms[0],
        artist: terms[1],
      };
    }

    // For more terms, use heuristics
    const allText = terms.join(" ");
    const words = allText.split(" ");

    // Look for artist names at the end (typically 1-2 words)
    if (words.length >= 3) {
      const lastTwo = words.slice(-2).join(" ");
      const remaining = words.slice(0, -2).join(" ");

      return {
        title: remaining,
        artist: lastTwo,
      };
    }

    return {};
  }
}

export const queryParser = new QueryParser();
