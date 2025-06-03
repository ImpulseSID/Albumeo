import { useState } from "react";
import { Search, Music } from "lucide-react";
import { musicService } from "../services/musicService";
import type { Album } from "../services/dataTransformService";
import SearchResults from "../components/SearchResults";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      const albumResults = await musicService.searchAlbums(searchQuery, 12);
      setAlbums(albumResults);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleArtistSearch = (artist: string) => {
    setSearchQuery(artist);
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Find Your Music
          </h1>
          <p className="text-gray-400 text-lg">
            Search for any song or album to discover albums and download artwork
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-6 w-6" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for songs, albums, or artists..."
              className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl py-4 pl-12 pr-6 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
            />
          </div>

          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
          >
            <Music className="h-4 w-4" />
            <span>{isLoading ? "Searching..." : "Search"}</span>
          </button>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            "Taylor Swift",
            "The Beatles",
            "Drake",
            "Billie Eilish",
            "Ed Sheeran",
          ].map((artist) => (
            <button
              key={artist}
              onClick={() => handleArtistSearch(artist)}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-4 py-2 rounded-full transition-all duration-300 text-sm"
            >
              {artist}
            </button>
          ))}
        </div>

        {hasSearched && (
          <SearchResults
            albums={albums}
            isLoading={isLoading}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </div>
  );
};

export default SearchPage;
