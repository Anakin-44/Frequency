import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Search,
  Compass,
  Home,
  Music2,
  Heart,
  Volume2,
  Disc3,
  AudioWaveform,
} from "lucide-react";
import "./App.css";

const API = `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "")}/songs`;
const ITUNES_API = "https://itunes.apple.com/search";

function App() {
  const [songs, setSongs] = useState([]);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("home");

  const audioRef = useRef(null);
  const currentSong = queue[currentIndex];

  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("frequency-favorites") || "[]");
    } catch {
      return [];
    }
  });

  const toggleFavorite = (songId) => {
    setFavorites((previous) => {
      const updated = previous.includes(songId)
        ? previous.filter((id) => id !== songId)
        : [...previous, songId];

      localStorage.setItem("frequency-favorites", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    fetch(API)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch songs");
        return res.json();
      })
      .then((data) => {
        setSongs(data);
        setQueue(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Search Apple's music catalogue when Discover is open.
  useEffect(() => {
    if (activeView !== "discover" || !search.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setSearching(true);

      try {
        const url = `${ITUNES_API}?term=${encodeURIComponent(search)}&entity=song&limit=30`;

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Music search failed");

        const data = await response.json();

        setResults(
          data.results
            .filter((track) => track.previewUrl)
            .map((track) => ({
              _id: `itunes-${track.trackId}`,
              title: track.trackName,
              artist: track.artistName,
              album: track.collectionName || "",
              coverUrl: track.artworkUrl100?.replace("100x100", "300x300"),
              audioUrl: track.previewUrl,
              isPreview: true,
            })),
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Search error:", error);
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, activeView]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    audioRef.current.load();

    if (playing) {
      audioRef.current.play().catch((err) => {
        console.error("Playback failed:", err);
        setPlaying(false);
      });
    }
  }, [currentIndex, queue]);

  const playSong = (index, list = songs) => {
    setQueue(list);
    setCurrentIndex(index);
    setProgress(0);
    setDuration(0);
    setPlaying(true);
  };

  const togglePlay = () => {
    if (!currentSong || !audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Playback failed:", err);
        setPlaying(false);
      });
    }
  };

  const nextSong = () => {
    if (!queue.length) return;
    setCurrentIndex((prev) => (prev + 1) % queue.length);
    setPlaying(true);
  };

  const previousSong = () => {
    if (!queue.length) return;
    setCurrentIndex((prev) => (prev - 1 + queue.length) % queue.length);
    setPlaying(true);
  };

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const value = Number(e.target.value);
    audioRef.current.currentTime = value;
    setProgress(value);
  };

  const formatTime = (time) => {
    if (!Number.isFinite(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const changeView = (view) => {
    setActiveView(view);
    setSearch("");
    setResults([]);
  };

  const filteredSongs = songs
    .filter((song) =>
      activeView === "library" ? favorites.includes(song._id) : true,
    )
    .filter((song) =>
      `${song.title} ${song.artist} ${song.album || ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    );

  const displayedSongs = activeView === "discover" ? results : filteredSongs;

  const playDisplayedSong = (song) => {
    const list = displayedSongs;
    const index = list.findIndex((item) => item._id === song._id);
    playSong(index, list);
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <AudioWaveform size={32} />
          <span>FREQUENCY</span>
        </div>

        <div className="nav-label">MENU</div>

        <button
          className={`nav-item ${activeView === "home" ? "active" : ""}`}
          onClick={() => changeView("home")}
        >
          <Home size={19} /> Home
        </button>

        <button
          className={`nav-item ${activeView === "discover" ? "active" : ""}`}
          onClick={() => changeView("discover")}
        >
          <Compass size={19} /> Discover
        </button>

        <button
          className={`nav-item ${activeView === "library" ? "active" : ""}`}
          onClick={() => changeView("library")}
        >
          <Music2 size={19} /> Your Library
        </button>

        <div className="sidebar-bottom">
          <Disc3 size={22} />
          <p>Feel every frequency.</p>
          <span>Your music, your world.</span>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="eyebrow">YOUR PERSONAL MUSIC SPACE</span>
            <h1>Good music. Good mood.</h1>
          </div>

          <div className="search-box">
            <Search size={18} />
            <input
              placeholder={
                activeView === "discover"
                  ? "Search any song or artist..."
                  : "Search your songs..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

        {activeView === "home" && (
          <section className="hero">
            <div className="hero-content">
              <span className="hero-tag">WELCOME TO FREQUENCY</span>
              <h2>
                Find your
                <br />
                own rhythm.
              </h2>
              <p>Music that moves with you.</p>
              <button
                className="hero-button"
                onClick={() => {
                  if (songs.length) playSong(0, songs);
                }}
              >
                <Play size={17} fill="currentColor" /> Start listening
              </button>
            </div>

            <div className="hero-art">
              <AudioWaveform size={115} strokeWidth={1} />
              <div className="art-circle"></div>
            </div>
          </section>
        )}

        <section className="songs-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {activeView === "home"
                  ? "YOUR COLLECTION"
                  : activeView === "discover"
                    ? "SEARCH THE MUSIC CATALOGUE"
                    : "YOUR SAVED MUSIC"}
              </span>

              <h2>
                {activeView === "home"
                  ? "All Songs"
                  : activeView === "discover"
                    ? "Discover Music"
                    : "Your Library"}
              </h2>
            </div>

            <span className="song-count">{displayedSongs.length} TRACKS</span>
          </div>

          {activeView === "discover" && !search.trim() ? (
            <p className="message">
              Search for any song or artist to discover music.
            </p>
          ) : searching ? (
            <p className="message">Searching for music...</p>
          ) : loading && activeView !== "discover" ? (
            <p className="message">Loading your music...</p>
          ) : displayedSongs.length === 0 ? (
            <p className="message">
              {activeView === "library"
                ? "No favourites yet. Tap the heart on a song to save it."
                : "No songs found. Try another search."}
            </p>
          ) : (
            <div className="song-grid">
              {displayedSongs.map((song) => {
                const isFavorite = favorites.includes(song._id);
                const isCurrent = currentSong?._id === song._id;

                return (
                  <div className="song-card" key={song._id}>
                    <div className="cover">
                      {song.coverUrl ? (
                        <img src={song.coverUrl} alt={song.title} />
                      ) : (
                        <div className="cover-placeholder">
                          <Disc3 size={65} />
                        </div>
                      )}

                      <button
                        className="card-play"
                        onClick={() => playDisplayedSong(song)}
                      >
                        {isCurrent && playing ? (
                          <Pause fill="currentColor" />
                        ) : (
                          <Play fill="currentColor" />
                        )}
                      </button>
                    </div>

                    <button
                      className="favorite-toggle"
                      onClick={() => toggleFavorite(song._id)}
                      title="Toggle favourite"
                    >
                      <Heart
                        size={18}
                        fill={isFavorite ? "currentColor" : "none"}
                      />
                    </button>

                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>

                    {song.isPreview && (
                      <small className="preview-label">30-SECOND PREVIEW</small>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <footer className="player">
        <div className="now-playing">
          {currentSong ? (
            <>
              <div className="mini-cover">
                {currentSong.coverUrl ? (
                  <img src={currentSong.coverUrl} alt="" />
                ) : (
                  <Disc3 size={27} />
                )}
              </div>

              <div className="track-info">
                <strong>{currentSong.title}</strong>
                <span>{currentSong.artist}</span>
              </div>

              <button
                className="heart"
                onClick={() => toggleFavorite(currentSong._id)}
                title="Toggle favourite"
              >
                <Heart
                  size={19}
                  fill={
                    favorites.includes(currentSong._id)
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            </>
          ) : (
            <span>Select a song to start listening</span>
          )}
        </div>

        <div className="player-center">
          <div className="controls">
            <button onClick={previousSong}>
              <SkipBack fill="currentColor" />
            </button>

            <button className="main-play" onClick={togglePlay}>
              {playing ? (
                <Pause fill="currentColor" />
              ) : (
                <Play fill="currentColor" />
              )}
            </button>

            <button onClick={nextSong}>
              <SkipForward fill="currentColor" />
            </button>
          </div>

          <div className="progress-area">
            <span>{formatTime(progress)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={Math.min(progress, duration || 100)}
              onChange={handleSeek}
              className="progress"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="volume-area">
          <Volume2 size={20} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </div>
      </footer>

      <audio
        ref={audioRef}
        src={currentSong?.audioUrl}
        onTimeUpdate={(e) => setProgress(e.target.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.target.duration);
          setProgress(0);
        }}
        onEnded={nextSong}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          console.error("Could not load this audio file.");
          setPlaying(false);
        }}
      />
    </div>
  );
}

export default App;
