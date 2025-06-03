import { musicbrainzService } from "./musicbrainzService";
import { dataTransformService } from "./dataTransformService";
import type { Album } from "./dataTransformService";

class MusicService {
  async searchAlbums(query: string, limit: number = 25): Promise<Album[]> {
    try {
      // Search for releases (albums) directly
      const releases = await musicbrainzService.searchReleases(query, limit);
      const directAlbums =
        dataTransformService.transformReleasesToAlbums(releases);

      // Also search for recordings (songs) and extract their albums
      const recordings = await musicbrainzService.searchRecordings(
        query,
        limit
      );
      const tracksWithAlbums =
        dataTransformService.transformRecordingsToTracks(recordings);

      // Extract unique albums from the tracks
      const albumsFromTracks: Album[] = [];
      const seenAlbumIds = new Set<string>();

      tracksWithAlbums.forEach((track) => {
        if (track.album && !seenAlbumIds.has(track.album.id)) {
          seenAlbumIds.add(track.album.id);
          albumsFromTracks.push({
            id: track.album.id,
            name: track.album.title,
            artist: track.artist.name,
            artistId: track.artist.id,
            url: `https://musicbrainz.org/release/${track.album.id}`,
            image: [track.album.id],
            releaseDate: undefined, // Will be populated if available
          });
        }
      });

      // Combine and deduplicate results, prioritizing direct album matches
      const allAlbums = [...directAlbums, ...albumsFromTracks];
      const uniqueAlbums = new Map<string, Album>();

      allAlbums.forEach((album) => {
        if (!uniqueAlbums.has(album.id)) {
          uniqueAlbums.set(album.id, album);
        }
      });

      return Array.from(uniqueAlbums.values()).slice(0, limit);
    } catch (error) {
      console.error("Error searching albums:", error);
      return [];
    }
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
