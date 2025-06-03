import type { Recording, Release } from "./musicbrainzService";

export interface Track {
  id: string;
  name: string;
  artist: {
    name: string;
    id: string;
  };
  album?: {
    title: string;
    id: string;
  };
  url: string;
  image: string[];
  duration?: number;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  artistId: string;
  url: string;
  image: string[];
  releaseDate?: string;
}

class DataTransformService {
  transformRecordingToTrack(recording: Recording): Track {
    const primaryArtist = recording["artist-credit"]?.[0];
    const primaryRelease = recording.releases?.[0];

    return {
      id: recording.id,
      name: recording.title,
      artist: {
        name: primaryArtist?.name || "Unknown Artist",
        id: primaryArtist?.artist?.id || "",
      },
      album: primaryRelease
        ? {
            title: primaryRelease.title,
            id: primaryRelease.id,
          }
        : undefined,
      url: `https://musicbrainz.org/recording/${recording.id}`,
      image: primaryRelease ? [primaryRelease.id] : [],
      duration: recording.length,
    };
  }

  transformReleaseToAlbum(release: Release): Album {
    const primaryArtist = release["artist-credit"]?.[0];

    return {
      id: release.id,
      name: release.title,
      artist: primaryArtist?.name || "Unknown Artist",
      artistId: primaryArtist?.artist?.id || "",
      url: `https://musicbrainz.org/release/${release.id}`,
      image: [release.id],
      releaseDate: release.date,
    };
  }

  transformRecordingsToTracks(recordings: Recording[]): Track[] {
    return recordings.map((recording) =>
      this.transformRecordingToTrack(recording)
    );
  }

  transformReleasesToAlbums(releases: Release[]): Album[] {
    return releases.map((release) => this.transformReleaseToAlbum(release));
  }
}

export const dataTransformService = new DataTransformService();
