const MUSICBRAINZ_BASE = "https://musicbrainz.org/ws/2";
const CAA_BASE = "https://coverartarchive.org/release";

export interface Recording {
  id: string;
  title: string;
  length?: number;
  "artist-credit": {
    name: string;
    artist: {
      name: string;
      id: string;
    };
  }[];
  releases: {
    id: string;
    title: string;
    date?: string;
  }[];
}

export interface Release {
  id: string;
  title: string;
  "artist-credit": {
    name: string;
    artist: {
      id: string;
      name: string;
    };
  }[];
  date?: string;
  "cover-art-archive"?: {
    artwork: boolean;
    count: number;
    front: boolean;
    back: boolean;
  };
}

export interface Artist {
  id: string;
  name: string;
  "sort-name": string;
  disambiguation?: string;
}

class MusicBrainzService {
  private async fetchJSON(url: string) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Albumeo/1.0 (https://albumeo.lovable.app)",
      },
    });

    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status}`);
    }

    return response.json();
  }

  async searchRecordings(
    query: string,
    limit: number = 25
  ): Promise<Recording[]> {
    const encodedQuery = encodeURIComponent(query);
    const url = `${MUSICBRAINZ_BASE}/recording?query=${encodedQuery}&limit=${limit}&inc=releases+artist-credits&fmt=json`;

    const data = await this.fetchJSON(url);
    return data.recordings || [];
  }

  async searchReleases(query: string, limit: number = 25): Promise<Release[]> {
    const encodedQuery = encodeURIComponent(query);
    const url = `${MUSICBRAINZ_BASE}/release?query=${encodedQuery}&limit=${limit}&inc=artist-credits+cover-art-archive&fmt=json`;

    const data = await this.fetchJSON(url);
    return data.releases || [];
  }

  async searchArtists(query: string, limit: number = 25): Promise<Artist[]> {
    const encodedQuery = encodeURIComponent(query);
    const url = `${MUSICBRAINZ_BASE}/artist?query=${encodedQuery}&limit=${limit}&fmt=json`;

    const data = await this.fetchJSON(url);
    return data.artists || [];
  }

  async getRelease(releaseId: string): Promise<Release | null> {
    try {
      const url = `${MUSICBRAINZ_BASE}/release/${releaseId}?inc=artist-credits+cover-art-archive&fmt=json`;
      const data = await this.fetchJSON(url);
      return data || null;
    } catch (error) {
      console.error(`Error fetching release ${releaseId}:`, error);
      return null;
    }
  }

  async getRecording(recordingId: string): Promise<Recording | null> {
    try {
      const url = `${MUSICBRAINZ_BASE}/recording/${recordingId}?inc=releases+artist-credits&fmt=json`;
      const data = await this.fetchJSON(url);
      return data || null;
    } catch (error) {
      console.error(`Error fetching recording ${recordingId}:`, error);
      return null;
    }
  }

  getCoverArtUrl(releaseId: string, size: "small" | "large" = "large"): string {
    const base = `${CAA_BASE}/${releaseId}/front`;
    return size === "small" ? `${base}-250.jpg` : `${base}.jpg`;
  }

  async checkCoverArtExists(releaseId: string): Promise<boolean> {
    try {
      const response = await fetch(`${CAA_BASE}/${releaseId}`, {
        method: "HEAD",
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  getPlaceholderImageUrl(): string {
    return "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop";
  }
}

export const musicbrainzService = new MusicBrainzService();
