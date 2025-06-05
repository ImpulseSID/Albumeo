import { queryParser } from "./queryParser";
import { searchStrategyService } from "./searchStrategy";
import { musicbrainzService } from "./musicbrainzService";
import type { Album } from "./dataTransformService";

class MusicService {
  async searchAlbums(query: string, limit: number = 25): Promise<Album[]> {
    try {
      console.log("Starting intelligent search for:", query);

      // Parse the query to understand intent
      const parsedQuery = queryParser.parseQuery(query);
      console.log("Parsed query:", parsedQuery);

      const allResults: Array<{ albums: Album[]; confidence: number }> = [];

      // Execute search strategies in order of preference
      for (const strategy of parsedQuery.searchStrategies) {
        console.log(`Trying strategy: ${strategy}`);

        const result = await searchStrategyService.executeStrategy(
          parsedQuery,
          strategy,
          limit
        );

        console.log(
          `Strategy ${strategy} returned ${result.albums.length} albums with confidence ${result.confidence}`
        );

        if (result.albums.length > 0) {
          allResults.push({
            albums: result.albums,
            confidence: result.confidence,
          });

          // If we get high confidence results, we can stop early
          if (result.confidence >= 0.8 && result.albums.length >= 5) {
            console.log("High confidence results found, stopping early");
            break;
          }
        }
      }

      // Combine and score results
      const combinedResults = this.combineAndScoreResults(allResults);
      const finalResults = combinedResults.slice(0, limit);

      console.log(`Final results: ${finalResults.length} albums`);

      return finalResults;
    } catch (error) {
      console.error("Error in intelligent search:", error);
      return [];
    }
  }

  private combineAndScoreResults(
    results: Array<{ albums: Album[]; confidence: number }>
  ): Album[] {
    const albumScores = new Map<string, { album: Album; score: number }>();

    results.forEach(({ albums, confidence }) => {
      albums.forEach((album, index) => {
        const positionScore = 1 - (index / albums.length) * 0.3; // Position matters
        const finalScore = confidence * positionScore;

        const existing = albumScores.get(album.id);
        if (!existing || existing.score < finalScore) {
          albumScores.set(album.id, { album, score: finalScore });
        }
      });
    });

    // Sort by score and return albums
    return Array.from(albumScores.values())
      .sort((a, b) => b.score - a.score)
      .map((item) => item.album);
  }

  getImageUrl(imageData: string[]): string {
    if (!imageData || imageData.length === 0) {
      return musicbrainzService.getPlaceholderImageUrl();
    }

    const releaseId = imageData[0];
    return musicbrainzService.getCoverArtUrl(releaseId, "large");
  }

  getHighQualityImageUrl(imageData: string[]): string | null {
    if (!imageData || imageData.length === 0) {
      return null;
    }

    const releaseId = imageData[0];
    return musicbrainzService.getCoverArtUrl(releaseId, "large");
  }
}

export const musicService = new MusicService();
