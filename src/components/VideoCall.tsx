import React, { useState, useRef, useEffect } from 'react';
import { Phone, Video, VideoOff, Mic, MicOff, Maximize, X } from 'lucide-react';

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  contactName: string;
}

const VideoCall: React.FC<VideoCallProps> = ({ isOpen, onClose, contactName }) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRinging, setIsRinging] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLocalVideoMain, setIsLocalVideoMain] = useState(false);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoMainRef = useRef<HTMLVideoElement>(null);
  const localVideoPreviewRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const ringtoneIntervalRef = useRef<number | null>(null);

  // Create ringtone using Web Audio API
  const createRingtone = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator1.start();
    oscillator2.start();
    oscillator1.stop(audioContext.currentTime + 0.5);
    oscillator2.stop(audioContext.currentTime + 0.5);
  };

  const startRingtone = () => {
    const playRingtone = () => {
      createRingtone();
    };

    playRingtone();
    ringtoneIntervalRef.current = window.setInterval(playRingtone, 2000);
  };

  const stopRingtone = () => {
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
  };

  // Initialize media when component opens
  useEffect(() => {
    if (isOpen) {
      initializeMedia();
      startRingtone();
      
      // Simulate connection after 3 seconds
      setTimeout(() => {
        setIsRinging(false);
        stopRingtone();
      }, 3000);
    }

    return () => {
      stopRingtone();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  // Ensure video elements are properly set up when stream changes
  useEffect(() => {
    if (stream) {
      const videoElements = [
        localVideoRef.current,
        localVideoMainRef.current,
        localVideoPreviewRef.current
      ].filter(Boolean);
      
      videoElements.forEach(video => {
        if (video && !video.srcObject) {
          console.log('VideoCall: Setting up video element with stream');
          video.srcObject = stream;
          video.play().catch(e => {
            console.error('VideoCall: Error playing video:', e);
          });
        }
      });
    }
  }, [stream]);

  const initializeMedia = async () => {
    console.log('VideoCall: Initializing media...');
    setIsMediaLoading(true);
    
    try {
      // Check if we're in a secure context
      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        throw new Error('Camera access requires HTTPS or localhost');
      }

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera and microphone access is not supported in this browser');
      }

      console.log('VideoCall: Requesting camera and microphone access...');
      
      // Request camera and microphone permissions with fallback options
      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true
          }
        });
      } catch (videoError) {
        console.log('VideoCall: High quality video failed, trying basic settings...');
        // Try with basic video settings
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: true
        });
      }
      
      console.log('VideoCall: Media stream obtained, setting up video...');
      setStream(mediaStream);
      setIsMediaLoading(false);
      
      // Wait a bit for the component to render
      setTimeout(() => {
        console.log('VideoCall: Setting video sources...');
        
        // Set up main video element
        if (localVideoMainRef.current) {
          localVideoMainRef.current.srcObject = mediaStream;
          localVideoMainRef.current.play().catch(e => {
            console.error('VideoCall: Error playing main video:', e);
          });
        }
        
        // Set up preview video element
        if (localVideoPreviewRef.current) {
          localVideoPreviewRef.current.srcObject = mediaStream;
          localVideoPreviewRef.current.play().catch(e => {
            console.error('VideoCall: Error playing preview video:', e);
          });
        }
        
        // Keep the original ref for backward compatibility
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
          localVideoRef.current.play().catch(e => {
            console.error('VideoCall: Error playing video:', e);
          });
        }
      }, 100);

      console.log('VideoCall: Camera and microphone access granted successfully');
    } catch (error) {
      console.error('VideoCall: Error accessing camera/microphone:', error);
      setIsMediaLoading(false);
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          alert('Camera and microphone access was denied. Please allow access and try again.');
        } else if (error.name === 'NotFoundError') {
          alert('No camera or microphone found. Please check your devices.');
        } else if (error.name === 'NotReadableError') {
          alert('Camera or microphone is already in use by another application.');
        } else if (error.name === 'OverconstrainedError') {
          alert('Camera settings are not supported. Please try again.');
        } else {
          alert(`Unable to access camera and microphone: ${error.message}`);
        }
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
        
        // Update all video elements
        const videoElements = [
          localVideoRef.current,
          localVideoMainRef.current,
          localVideoPreviewRef.current
        ].filter(Boolean);
        
        videoElements.forEach(video => {
          if (video) {
            video.style.display = !isVideoEnabled ? 'none' : 'block';
          }
        });
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const endCall = () => {
    stopRingtone();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsMediaLoading(false);
    onClose();
  };

  const retryCamera = () => {
    console.log('VideoCall: Retrying camera access...');
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    initializeMedia();
  };

  const switchVideoViews = () => {
    console.log('VideoCall: Switching video views...');
    setIsLocalVideoMain(!isLocalVideoMain);
    
    // Ensure both video elements have the stream
    if (stream) {
      setTimeout(() => {
        const videoElements = [
          localVideoMainRef.current,
          localVideoPreviewRef.current
        ].filter(Boolean);
        
        videoElements.forEach(video => {
          if (video && !video.srcObject) {
            console.log('VideoCall: Reassigning stream to video element');
            video.srcObject = stream;
            video.play().catch(e => {
              console.error('VideoCall: Error playing video after switch:', e);
            });
          }
        });
      }, 50);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full max-w-6xl max-h-full">
        {/* Remote Video (Main) */}
        <div className="w-full h-full bg-gray-900 rounded-lg overflow-hidden relative">
          {isRinging ? (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <div className="relative">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
                  <Phone className="w-12 h-12" />
                </div>
                <div className="absolute inset-0 w-24 h-24 border-4 border-blue-400 rounded-full animate-ping"></div>
              </div>
              <h2 className="text-2xl font-semibold mt-6">Calling {contactName}...</h2>
              <p className="text-gray-300 mt-2">Please wait while we connect you</p>
              
              <button
                onClick={endCall}
                className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center space-x-2 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>Decline Call</span>
              </button>
            </div>
          ) : (
            <>
              {/* Main Video Area */}
              <div className="w-full h-full relative">
                {/* Main Video (Remote or Local based on isLocalVideoMain) */}
                {isLocalVideoMain ? (
                  <div className="w-full h-full bg-gray-800 rounded-lg overflow-hidden relative">
                    {isMediaLoading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                          <p>Loading camera...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <video
                          ref={localVideoMainRef}
                          autoPlay
                          muted
                          playsInline
                          className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                        />
                        {!isVideoEnabled && (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <VideoOff className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center relative">
                    <div className="text-center text-white">
                      <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl font-bold">
                          {contactName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold">{contactName}</h3>
                      <p className="text-gray-300">Connected</p>
                    </div>
                    
                    {/* Main view indicator for remote video */}
                    <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      {contactName} (Main)
                    </div>
                  </div>
                )}

                {/* Preview Video (Picture-in-Picture) - Clickable */}
                <div 
                  className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden border-2 border-white cursor-pointer hover:border-blue-400 transition-colors"
                  onClick={switchVideoViews}
                  title="Click to switch video views"
                >
                  {isLocalVideoMain ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-lg font-bold">
                            {contactName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs">{contactName}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {isMediaLoading ? (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <>
                          <video
                            ref={localVideoPreviewRef}
                            autoPlay
                            muted
                            playsInline
                            className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                          />
                          {!isVideoEnabled && (
                            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                              <VideoOff className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                  
                  {/* Switch indicator */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Click to switch
                  </div>
                  
                  {/* Main view indicator */}
                  {isLocalVideoMain && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      You (Main)
                    </div>
                  )}
                </div>
              </div>

              {/* Call Controls */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-4 bg-black bg-opacity-50 rounded-full px-6 py-4">
                  {!stream && !isMediaLoading && (
                    <button
                      onClick={retryCamera}
                      className="p-3 rounded-full bg-yellow-600 hover:bg-yellow-700 text-white transition-colors"
                      title="Retry Camera"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}

                  <button
                    onClick={toggleAudio}
                    className={`p-3 rounded-full transition-colors ${
                      isAudioEnabled
                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  </button>

                  <button
                    onClick={toggleVideo}
                    className={`p-3 rounded-full transition-colors ${
                      isVideoEnabled
                        ? 'bg-gray-600 hover:bg-gray-500 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-colors"
                  >
                    <Maximize className="w-6 h-6" />
                  </button>

                  <button
                    onClick={endCall}
                    className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    <Phone className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={endCall}
                className="absolute top-4 left-4 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCall;
