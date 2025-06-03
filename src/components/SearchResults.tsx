import type { Album } from "../services/dataTransformService";
import AlbumCard from "./AlbumCard";

interface SearchResultsProps {
  albums: Album[];
  isLoading: boolean;
  searchQuery: string;
}

const SearchResults = ({
  albums,
  isLoading,
  searchQuery,
}: SearchResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (!searchQuery) return null;

  if (albums.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">
          No albums found for "{searchQuery}"
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Try searching for different keywords, song titles, or artist names
        </p>
      </div>
    );
  }

  return (
    <div className="py-16 px-6">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Albums ({albums.length} found)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album, index) => (
            <AlbumCard
              key={`${album.artist}-${album.name}-${album.id}-${index}`}
              album={album}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
