# Albumeo 🎵

A modern music search application that helps you discover albums and download high-quality album artwork. Built with React, TypeScript, and powered by MusicBrainz and Cover Art Archive.

## Features

- **Smart Album Search**: Search for any song or album name and get relevant album results
- **High-Quality Artwork**: Download album covers in high resolution
- **Artist Quick Search**: One-click search for popular artists
- **Responsive Design**: Beautiful, modern interface that works on all devices
- **Open Source Data**: Powered by MusicBrainz and Cover Art Archive

## How It Works

Albumeo uses an intelligent search approach:

- **Song Search**: When you search for a song title, it finds the albums that contain that track
- **Album Search**: When you search for an album name, it returns matching albums directly
- **Artist Search**: Search by artist name to discover their discography

All results are albums, making it easy to discover and download complete album artwork collections.

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Data Sources**:
  - [MusicBrainz](https://musicbrainz.org/) for music metadata
  - [Cover Art Archive](https://coverartarchive.org/) for album artwork
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd albumeo
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```


### Building for Production

```bash
npm run build
```

The built application will be available in the `dist` directory.

## Usage

1. **Search**: Enter any song name, album title, or artist name in the search bar
2. **Browse Results**: View album results with cover art and metadata
3. **Download Artwork**: Click the download button on any album card to save high-quality artwork
4. **Explore**: Use the quick search buttons for popular artists or click external links to learn more

## API Credits

This application uses data from:

- **MusicBrainz**: An open music encyclopedia that collects music metadata
- **Cover Art Archive**: A joint project between the Internet Archive and MusicBrainz that provides album cover art

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.
