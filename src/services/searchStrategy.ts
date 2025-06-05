import { musicbrainzService } from "./musicbrainzService";
import { dataTransformService } from "./dataTransformService";
import type { Album } from "./dataTransformService";
import type { ParsedQuery, SearchStrategy } from "./queryParser";

export interface SearchResult {
  albums: Album[];
  strategy: SearchStrategy;
  confidence: number;
}

class SearchStrategyService {
  async executeStrategy(
    parsedQuery: ParsedQuery,
    strategy: SearchStrategy,
    limit: number = 25
  ): Promise<SearchResult> {
    switch (strategy) {
      case "exact":
        return this.exactMatchStrategy(parsedQuery.original, limit);

      case "title_artist":
        return this.titleArtistStrategy(parsedQuery, limit);

      case "artist_title":
        return this.artistTitleStrategy(parsedQuery, limit);

      case "artist_only":
        return this.artistOnlyStrategy(parsedQuery, limit);

      case "title_only":
        return this.titleOnlyStrategy(parsedQuery, limit);

      case "fuzzy":
        return this.fuzzyStrategy(parsedQuery.original, limit);

      default:
        return { albums: [], strategy, confidence: 0 };
    }
  }

  private async exactMatchStrategy(
    query: string,
    limit: number
  ): Promise<SearchResult> {
    try {
      const releases = await musicbrainzService.searchReleases(query, limit);
      const albums = dataTransformService.transformReleasesToAlbums(releases);

      return {
        albums,
        strategy: "exact" as SearchStrategy,
        confidence: 0.9,
      };
    } catch (error) {
      return { albums: [], strategy: "exact" as SearchStrategy, confidence: 0 };
    }
  }

  private async titleArtistStrategy(
    parsedQuery: ParsedQuery,
    limit: number
  ): Promise<SearchResult> {
    if (!parsedQuery.possibleTitle || !parsedQuery.possibleArtist) {
      return {
        albums: [],
        strategy: "title_artist" as SearchStrategy,
        confidence: 0,
      };
    }

    try {
      // Search for releases with specific title and artist
      const releaseQuery = `release:"${parsedQuery.possibleTitle}" AND artist:"${parsedQuery.possibleArtist}"`;
      const releases = await musicbrainzService.searchReleases(
        releaseQuery,
        limit
      );
      let albums = dataTransformService.transformReleasesToAlbums(releases);

      // Also search for recordings and extract their albums
      const recordingQuery = `recording:"${parsedQuery.possibleTitle}" AND artist:"${parsedQuery.possibleArtist}"`;
      const recordings = await musicbrainzService.searchRecordings(
        recordingQuery,
        limit
      );
      const tracks =
        dataTransformService.transformRecordingsToTracks(recordings);

      // Extract albums from tracks
      const albumsFromTracks: Album[] = [];
      const seenIds = new Set<string>();

      tracks.forEach((track) => {
        if (track.album && !seenIds.has(track.album.id)) {
          seenIds.add(track.album.id);
          albumsFromTracks.push({
            id: track.album.id,
            name: track.album.title,
            artist: track.artist.name,
            artistId: track.artist.id,
            url: `https://musicbrainz.org/release/${track.album.id}`,
            image: [track.album.id],
            releaseDate: undefined,
          });
        }
      });

      albums = [...albums, ...albumsFromTracks];

      return {
        albums: this.deduplicateAlbums(albums),
        strategy: "title_artist" as SearchStrategy,
        confidence: 0.85,
      };
    } catch (error) {
      return {
        albums: [],
        strategy: "title_artist" as SearchStrategy,
        confidence: 0,
      };
    }
  }

  private async artistTitleStrategy(
    parsedQuery: ParsedQuery,
    limit: number
  ): Promise<SearchResult> {
    if (!parsedQuery.possibleTitle || !parsedQuery.possibleArtist) {
      return {
        albums: [],
        strategy: "artist_title" as SearchStrategy,
        confidence: 0,
      };
    }

    // Swap artist and title for this strategy
    const swappedQuery = {
      ...parsedQuery,
      possibleTitle: parsedQuery.possibleArtist,
      possibleArtist: parsedQuery.possibleTitle,
    };

    const result = await this.titleArtistStrategy(swappedQuery, limit);
    return {
      ...result,
      strategy: "artist_title" as SearchStrategy,
      confidence: result.confidence * 0.8, // Slightly lower confidence
    };
  }

  private async artistOnlyStrategy(
    parsedQuery: ParsedQuery,
    limit: number
  ): Promise<SearchResult> {
    if (!parsedQuery.possibleArtist) {
      return {
        albums: [],
        strategy: "artist_only" as SearchStrategy,
        confidence: 0,
      };
    }

    try {
      const query = `artist:"${parsedQuery.possibleArtist}"`;
      const releases = await musicbrainzService.searchReleases(query, limit);
      const albums = dataTransformService.transformReleasesToAlbums(releases);

      return {
        albums,
        strategy: "artist_only" as SearchStrategy,
        confidence: 0.7,
      };
    } catch (error) {
      return {
        albums: [],
        strategy: "artist_only" as SearchStrategy,
        confidence: 0,
      };
    }
  }

  private async titleOnlyStrategy(
    parsedQuery: ParsedQuery,
    limit: number
  ): Promise<SearchResult> {
    if (!parsedQuery.possibleTitle) {
      return {
        albums: [],
        strategy: "title_only" as SearchStrategy,
        confidence: 0,
      };
    }

    try {
      const query = `release:"${parsedQuery.possibleTitle}"`;
      const releases = await musicbrainzService.searchReleases(query, limit);
      const albums = dataTransformService.transformReleasesToAlbums(releases);

      return {
        albums,
        strategy: "title_only" as SearchStrategy,
        confidence: 0.6,
      };
    } catch (error) {
      return {
        albums: [],
        strategy: "title_only" as SearchStrategy,
        confidence: 0,
      };
    }
  }

  private async fuzzyStrategy(
    query: string,
    limit: number
  ): Promise<SearchResult> {
    try {
      // Use the original broad search as fuzzy fallback
      const releases = await musicbrainzService.searchReleases(
        query,
        Math.floor(limit / 2)
      );
      const recordings = await musicbrainzService.searchRecordings(
        query,
        Math.floor(limit / 2)
      );

      const directAlbums =
        dataTransformService.transformReleasesToAlbums(releases);
      const tracks =
        dataTransformService.transformRecordingsToTracks(recordings);

      const albumsFromTracks: Album[] = [];
      const seenIds = new Set<string>();

      tracks.forEach((track) => {
        if (track.album && !seenIds.has(track.album.id)) {
          seenIds.add(track.album.id);
          albumsFromTracks.push({
            id: track.album.id,
            name: track.album.title,
            artist: track.artist.name,
            artistId: track.artist.id,
            url: `https://musicbrainz.org/release/${track.album.id}`,
            image: [track.album.id],
            releaseDate: undefined,
          });
        }
      });

      const allAlbums = [...directAlbums, ...albumsFromTracks];

      return {
        albums: this.deduplicateAlbums(allAlbums),
        strategy: "fuzzy" as SearchStrategy,
        confidence: 0.4,
      };
    } catch (error) {
      return { albums: [], strategy: "fuzzy" as SearchStrategy, confidence: 0 };
    }
  }

  private deduplicateAlbums(albums: Album[]): Album[] {
    const uniqueAlbums = new Map<string, Album>();

    albums.forEach((album) => {
      if (!uniqueAlbums.has(album.id)) {
        uniqueAlbums.set(album.id, album);
      }
    });

    return Array.from(uniqueAlbums.values());
  }
}

export const searchStrategyService = new SearchStrategyService();
