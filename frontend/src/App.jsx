import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Search,
  Home,
  Music2,
  Heart,
  Volume2,
  Disc3,
  AudioWaveform,
} from "lucide-react";
import "./App.css";

const API = "http://localhost:5000/api/songs";

function App() {
  const [songs, setSongs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [search, setSearch] = useState("");
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [loading, setLoading] = useState(true);

  const audioRef = useRef(null);

  const currentSong = songs[currentIndex];

  useEffect(() => {
    fetch(API)
      .then((res) => {
        if (!res.ok) throw new Error("Could not fetch songs");
        return res.json();
      })
      .then((data) => setSongs(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.load();

      if (playing) {
        audioRef.current.play().catch(() => setPlaying(false));
      }
    }
  }, [currentIndex, currentSong]);

  const playSong = (index) => {
    if (index === currentIndex && playing) {
      setPlaying(false);
      audioRef.current?.pause();
    } else {
      setCurrentIndex(index);
      setPlaying(true);
    }
  };

  const togglePlay = () => {
    if (!currentSong) return;

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch((err) => {
          console.error("Playback failed:", err);
          setPlaying(false);
        });
    }
  };

  const nextSong = () => {
    if (!songs.length) return;
    setCurrentIndex((prev) => (prev + 1) % songs.length);
    setPlaying(true);
  };

  const previousSong = () => {
    if (!songs.length) return;
    setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
    setPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e) => {
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

  const filteredSongs = songs.filter((song) =>
    `${song.title} ${song.artist} ${song.album}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <AudioWaveform size={32} />
          <span>FREQUENCY</span>
        </div>

        <div className="nav-label">MENU</div>

        <div className="nav-item active">
          <Home size={19} /> Home
        </div>

        <div className="nav-item">
          <Search size={19} /> Discover
        </div>

        <div className="nav-item">
          <Music2 size={19} /> Your Library
        </div>

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
              placeholder="Search songs or artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </header>

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
                if (songs.length) playSong(0);
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

        <section className="songs-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR COLLECTION</span>
              <h2>All Songs</h2>
            </div>
            <span className="song-count">{filteredSongs.length} TRACKS</span>
          </div>

          {loading ? (
            <p className="message">Loading your music...</p>
          ) : filteredSongs.length === 0 ? (
            <p className="message">No songs found.</p>
          ) : (
            <div className="song-grid">
              {filteredSongs.map((song) => {
                const index = songs.findIndex((item) => item._id === song._id);

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
                        onClick={() => playSong(index)}
                      >
                        {currentIndex === index && playing ? (
                          <Pause fill="currentColor" />
                        ) : (
                          <Play fill="currentColor" />
                        )}
                      </button>
                    </div>

                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
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
              <Heart size={19} className="heart" />
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
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
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
