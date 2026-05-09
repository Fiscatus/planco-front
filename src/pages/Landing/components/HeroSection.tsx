import { useEffect, useRef, useState } from 'react';
import { Box, IconButton } from '@mui/material';
import {
  BLUE_500, INK_100, INK_500, INK_600, INK_900, INK_25, SHADOW_XL, DARK,
} from '../constants';
import { useLandingTheme } from '../LandingThemeContext';

const CONTAINER = { width: '100%', maxWidth: '1200px', mx: 'auto', px: { xs: '20px', sm: '32px' } };

const IconShield = () => (
  <svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z'/>
  </svg>
);

const PlayIcon = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M8 5v14l11-7z'/>
  </svg>
);

const PauseIcon = () => (
  <svg width='20' height='20' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M6 4h4v16H6zM14 4h4v16h-4z'/>
  </svg>
);

const FullscreenIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3'/>
  </svg>
);

const ExitFullscreenIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3'/>
  </svg>
);

const MuteIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M11 5 6 9H2v6h4l5 4V5z'/><line x1='23' y1='9' x2='17' y2='15'/><line x1='17' y1='9' x2='23' y2='15'/>
  </svg>
);

const VolumeIcon = () => (
  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
    <path d='M11 5 6 9H2v6h4l5 4V5z'/><path d='M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.08'/>
  </svg>
);

const VIDEO_URL = 'https://tutorialagentes.s3.us-east-1.amazonaws.com/2026-05-08+22-40-42.mp4';

const HeroSection = () => {
  const { mode } = useLandingTheme();
  const dark = mode === 'dark';
  const orb1Ref = useRef<HTMLDivElement>(null!);
  const orb2Ref = useRef<HTMLDivElement>(null!);
  const videoRef = useRef<HTMLVideoElement>(null!);
  const containerRef = useRef<HTMLDivElement>(null!);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showVolume, setShowVolume] = useState(false);
  const [ended, setEnded] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (orb1Ref.current) orb1Ref.current.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
      if (orb2Ref.current) orb2Ref.current.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const val = Number(e.target.value);
    setVolume(val);
    videoRef.current.volume = val / 100;
    if (val === 0) {
      videoRef.current.muted = true;
      setMuted(true);
    } else if (muted) {
      videoRef.current.muted = false;
      setMuted(false);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pct * videoRef.current.duration;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => setShowControls(false), 2500);
  };

  const btnSx = {
    color: '#fff',
    width: 36,
    height: 36,
    '&:hover': { background: 'rgba(255,255,255,0.15)' },
  };

  return (
    <Box
      component='section'
      sx={{
        position: 'relative',
        pt: { xs: '80px', sm: '104px' },
        pb: '64px',
        overflow: 'hidden',
        background: dark
          ? `radial-gradient(900px 400px at 50% -80px, rgba(25,118,210,0.12), transparent 60%), linear-gradient(180deg, ${DARK.surface} 0%, ${DARK.bg} 75%)`
          : `radial-gradient(900px 400px at 50% -80px, rgba(25,118,210,0.08), transparent 60%), linear-gradient(180deg, ${INK_25} 0%, #fff 75%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: dark
            ? `linear-gradient(${DARK.border} 1px, transparent 1px), linear-gradient(90deg, ${DARK.border} 1px, transparent 1px)`
            : `linear-gradient(${INK_100} 1px, transparent 1px), linear-gradient(90deg, ${INK_100} 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          backgroundPosition: '-1px -1px',
          maskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, black 0%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 55% at 50% 0%, black 0%, transparent 70%)',
          opacity: 0.55,
          pointerEvents: 'none',
        },
      }}
    >
      {/* Parallax orbs */}
      <Box ref={orb1Ref} sx={{ position: 'absolute', width: 420, height: 420, borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', opacity: 0.55, background: 'radial-gradient(circle, rgba(25,118,210,0.35), transparent 60%)', top: -80, left: -120 }} />
      <Box ref={orb2Ref} sx={{ position: 'absolute', width: 360, height: 360, borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none', opacity: 0.55, background: 'radial-gradient(circle, rgba(100,181,246,0.35), transparent 60%)', top: 40, right: -100 }} />

      {/* Hero text */}
      <Box sx={{ ...CONTAINER, position: 'relative' }}>
        <Box sx={{ textAlign: 'center', maxWidth: 820, mx: 'auto' }}>
          <Box
            component='h1'
            sx={{
              fontSize: 'clamp(38px, 5.4vw, 62px)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              color: dark ? DARK.text : INK_900,
              fontWeight: 600,
              m: 0,
              mb: '22px',
            }}
          >
            O sistema operacional
            <br />
            da{' '}
            <Box component='span' sx={{ color: BLUE_500, fontWeight: 600 }}>
              contratação pública.
            </Box>
          </Box>

          <Box
            component='p'
            sx={{
              fontSize: 'clamp(16px, 1.4vw, 19px)',
              lineHeight: 1.55,
              color: dark ? DARK.textMuted : INK_600,
              maxWidth: 640,
              mx: 'auto',
              mb: '36px',
              fontWeight: 400,
            }}
          >
            Planco reúne os processos administrativos e de contratação pública em um único ambiente
            rastreável, desde a formalização da demanda até a assinatura do contrato.
          </Box>

          {/* Meta */}
          <Box sx={{ fontSize: '13px', color: dark ? DARK.textSubtle : INK_500, display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 400 }}>
            <Box sx={{ color: BLUE_500, display: 'flex' }}><IconShield /></Box>
            Aderente à Lei 14.133/2021 · LGPD · Hospedagem em solo nacional
          </Box>
        </Box>
      </Box>

      {/* ──────────── VIDEO SECTION ──────────── */}
      <Box id='produto' sx={{ ...CONTAINER, position: 'relative', mt: '64px', pb: '32px' }}>
        {/* Glow behind video */}
        <Box sx={{ position: 'absolute', inset: '40px 10% auto 10%', height: '60%', background: 'radial-gradient(ellipse at center, rgba(25,118,210,0.18), transparent 70%)', filter: 'blur(60px)', zIndex: 0, pointerEvents: 'none' }} />

        <Box
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setShowControls(false)}
          sx={{
            position: 'relative',
            zIndex: 1,
            background: '#000',
            border: `1px solid ${dark ? DARK.border : INK_100}`,
            borderRadius: isFullscreen ? 0 : '14px',
            boxShadow: isFullscreen ? 'none' : SHADOW_XL,
            overflow: 'hidden',
            maxWidth: isFullscreen ? '100%' : '960px',
            mx: 'auto',
            aspectRatio: '16 / 9',
            cursor: 'pointer',
          }}
        >
          <Box
            component='video'
            ref={videoRef}
            muted={muted}
            playsInline
            preload='none'
            onTimeUpdate={handleTimeUpdate}
            onClick={ended ? undefined : togglePlay}
            onEnded={() => { setPlaying(false); setEnded(true); }}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          >
            <source src={VIDEO_URL} type='video/mp4' />
          </Box>

          {/* Play overlay when paused */}
          {!playing && !ended && (
            <Box
              onClick={togglePlay}
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.4)',
                zIndex: 3,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Box sx={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1976d2' }}>
                  <svg width='32' height='32' viewBox='0 0 24 24' fill='currentColor'><path d='M8 5v14l11-7z'/></svg>
                </Box>
                <Box sx={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Assistir demonstração</Box>
              </Box>
            </Box>
          )}

          {/* Replay overlay when ended */}
          {ended && (
            <Box
              onClick={() => {
                if (!videoRef.current) return;
                videoRef.current.currentTime = 0;
                videoRef.current.play();
                setPlaying(true);
                setEnded(false);
              }}
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.5)',
                zIndex: 3,
                cursor: 'pointer',
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Box sx={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1976d2' }}>
                  <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M1 4v6h6'/><path d='M3.51 15a9 9 0 1 0 2.13-9.36L1 10'/>
                  </svg>
                </Box>
                <Box sx={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>Repetir</Box>
              </Box>
            </Box>
          )}

          {/* Custom controls bar */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              p: '24px 16px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              opacity: showControls || !playing ? 1 : 0,
              transition: 'opacity .3s',
              zIndex: 4,
            }}
          >
            {/* Progress bar */}
            <Box
              onClick={handleSeek}
              sx={{
                width: '100%',
                height: '4px',
                background: 'rgba(255,255,255,0.3)',
                borderRadius: '2px',
                cursor: 'pointer',
                '&:hover': { height: '6px' },
                transition: 'height .15s',
              }}
            >
              <Box sx={{ width: `${progress}%`, height: '100%', background: BLUE_500, borderRadius: '2px', transition: 'width .1s linear' }} />
            </Box>

            {/* Buttons row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IconButton onClick={togglePlay} size='small' sx={btnSx}>
                {playing ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <Box
                onMouseEnter={() => setShowVolume(true)}
                onMouseLeave={() => setShowVolume(false)}
                sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <IconButton onClick={toggleMute} size='small' sx={btnSx}>
                  {muted || volume === 0 ? <MuteIcon /> : <VolumeIcon />}
                </IconButton>
                <Box
                  component='input'
                  type='range'
                  min={0}
                  max={100}
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  sx={{
                    width: showVolume ? '80px' : '0px',
                    opacity: showVolume ? 1 : 0,
                    transition: 'width .2s, opacity .2s',
                    overflow: 'hidden',
                    accentColor: BLUE_500,
                    cursor: 'pointer',
                    height: '4px',
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }} />
              <IconButton onClick={toggleFullscreen} size='small' sx={btnSx}>
                {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export { HeroSection };
