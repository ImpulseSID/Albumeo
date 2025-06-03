import { Download, ExternalLink } from "lucide-react";
import { musicService } from "../services/musicService";
import type { Album } from "../services/dataTransformService";

interface AlbumCardProps {
  album: Album;
}

const AlbumCard = ({ album }: AlbumCardProps) => {
  const imageUrl = musicService.getImageUrl(album.image);

  const handleDownloadArt = async () => {
    const highQualityUrl = musicService.getHighQualityImageUrl(album.image);

    if (highQualityUrl) {
      try {
        const response = await fetch(highQualityUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${album.artist} - ${album.name}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error downloading image:", error);
      }
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
      <div className="relative mb-4">
        <img
          src={imageUrl}
          alt={`${album.name} by ${album.artist}`}
          className="w-full h-48 object-cover rounded-xl"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop";
          }}
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center space-x-4">
          <button
            onClick={handleDownloadArt}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full transition-colors duration-300"
            title="Download Album Art"
          >
            <Download className="h-5 w-5" />
          </button>
          <a
            href={album.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors duration-300"
            title="View on MusicBrainz"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
      </div>

      <h3 className="text-white font-semibold text-lg mb-2 truncate">
        {album.name}
      </h3>
      <p className="text-gray-400 text-sm">
        by {album.artist}
        {album.releaseDate && (
          <p className="text-gray-500 text-xs mt-1">
            Released: {new Date(album.releaseDate).getFullYear()}
          </p>
        )}
      </p>
    </div>
  );
};

export default AlbumCard;
