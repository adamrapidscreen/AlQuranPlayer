import { createAudioPlayer, AudioPlayer as ExpoAudioPlayer, setAudioModeAsync } from 'expo-audio';

let player: ExpoAudioPlayer | null = null;
let isPlaying = false;
let sleepTimerId: NodeJS.Timeout | null = null;

// Initialize audio mode once
let audioModeInitialized = false;
const initializeAudioMode = async () => {
  if (audioModeInitialized) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix', // Prevent overlapping audio
      interruptionModeAndroid: 'doNotMix', // Prevent overlapping on Android
    });
    audioModeInitialized = true;
  } catch (error) {
    console.error('Error setting up audio mode:', error);
  }
};

export const audioPlayer = {
  async loadAudio(uri: string): Promise<void> {
    try {
      // Initialize audio mode if not already done
      await initializeAudioMode();

      // Stop and clean up existing player FIRST to prevent overlapping
      if (player) {
        try {
          // Stop playback if playing
          if (player.playing) {
            player.pause();
            // Use seekTo to reset position (currentTime is read-only)
            try {
              await player.seekTo(0);
            } catch (seekError) {
              // If seek fails, that's OK - we still paused
            }
          }
          // Remove the player to free resources
          player.remove();
        } catch (error) {
          console.warn('Error stopping previous player:', error);
        }
        player = null;
        isPlaying = false;
      }

      // Ensure URI is properly formatted (file:// for local files)
      let finalUri = uri;
      if (uri.startsWith('file://') === false && !uri.startsWith('http://') && !uri.startsWith('https://')) {
        // If it's a local file path without file:// prefix, add it
        finalUri = uri.startsWith('/') ? `file://${uri}` : `file:///${uri}`;
      }

      // Create new player with the audio URI
      
      // For remote URLs, download first to ensure file is available
      // For local files, we can stream directly
      const isRemoteUrl = finalUri.startsWith('http://') || finalUri.startsWith('https://');
      
      player = createAudioPlayer(finalUri, {
        updateInterval: 100,
        downloadFirst: isRemoteUrl, // Download remote files first, stream local files
      });
      
      isPlaying = false;
      
      // Wait for audio to be loaded with optimized polling
      let attempts = 0;
      const maxAttempts = 300; // 30 seconds max wait
      const pollInterval = 100; // Check every 100ms
      
      while (!player.isLoaded && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
      }
      
      if (!player.isLoaded) {
        throw new Error('Audio failed to load within timeout (30 seconds). The file may be corrupted or the network connection is too slow.');
      }
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  },

  async play(): Promise<void> {
    try {
      if (!player) {
        throw new Error('No audio loaded');
      }
      
      // Ensure audio is loaded before playing
      if (!player.isLoaded) {
        let attempts = 0;
        const maxAttempts = 50;
        while (!player.isLoaded && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!player.isLoaded) {
          throw new Error('Audio not loaded, cannot play');
        }
      }
      
      player.play();
      isPlaying = true;
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  },

  async pause(): Promise<void> {
    try {
      if (!player) {
        throw new Error('No audio loaded');
      }
      player.pause();
      isPlaying = false;
    } catch (error) {
      console.error('Error pausing audio:', error);
      throw error;
    }
  },

  async stop(): Promise<void> {
    try {
      if (!player) {
        // No player loaded, nothing to stop - this is OK
        isPlaying = false;
        return;
      }
      if (player.playing) {
        player.pause();
        // Use seekTo to reset position (currentTime is read-only)
        try {
          await player.seekTo(0);
        } catch (seekError) {
          // If seek fails, that's OK - we still paused
        }
      }
      isPlaying = false;
    } catch (error) {
      console.warn('Error stopping audio (non-critical):', error);
      // Don't throw - cleanup should be graceful
      isPlaying = false;
    }
  },

  async unload(): Promise<void> {
    try {
      if (player) {
        // Stop playback first if playing
        if (player.playing) {
          player.pause();
        }
        player.remove();
        player = null;
        isPlaying = false;
      }
    } catch (error) {
      console.warn('Error unloading audio (non-critical):', error);
      // Ensure state is reset even if remove() fails
      player = null;
      isPlaying = false;
    }
  },

  async getStatus(): Promise<{
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isLoaded: boolean;
  } | null> {
    if (!player) {
      return null;
    }
    return {
      isPlaying: player.playing,
      currentTime: player.currentTime,
      duration: player.duration,
      isLoaded: player.isLoaded,
    };
  },

  async setSleepTimer(minutes: number): Promise<void> {
    try {
      if (minutes <= 0) {
        throw new Error('Sleep timer must be greater than 0');
      }
      
      // Cancel any existing sleep timer
      if (sleepTimerId) {
        clearTimeout(sleepTimerId);
        sleepTimerId = null;
      }
      
      // Stop audio after specified minutes
      const stopFn = async () => {
        try {
          if (player) {
            if (player.playing) {
              player.pause();
              try {
                await player.seekTo(0);
              } catch (seekError) {
                // Ignore seek errors
              }
            }
            isPlaying = false;
          }
        } catch (error) {
          console.warn('Error stopping audio from sleep timer:', error);
        }
      };
      
      sleepTimerId = setTimeout(async () => {
        await stopFn();
        sleepTimerId = null;
      }, minutes * 60 * 1000);
    } catch (error) {
      console.error('Error setting sleep timer:', error);
      throw error;
    }
  },

  async cancelSleepTimer(): Promise<void> {
    if (sleepTimerId) {
      clearTimeout(sleepTimerId);
      sleepTimerId = null;
    }
  },

  getIsPlaying(): boolean {
    return isPlaying;
  },
};
