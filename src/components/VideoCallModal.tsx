import React, { useEffect, useState } from 'react';
import { Phone, PhoneOff, Video, Mic, MicOff, Camera, CameraOff } from 'lucide-react';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callerName: string;
  callerEmail: string;
  isIncoming: boolean; // true for incoming call, false for outgoing call
  onAnswer?: () => void;
  onDecline?: () => void;
  onEndCall?: () => void;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({
  isOpen,
  onClose,
  callerName,
  callerEmail,
  isIncoming,
  onAnswer,
  onDecline,
  onEndCall
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallActive, setIsCallActive] = useState(false);

  // Timer for call duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = () => {
    setIsCallActive(true);
    if (onAnswer) onAnswer();
  };

  const handleDecline = () => {
    if (onDecline) onDecline();
    onClose();
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    if (onEndCall) onEndCall();
    onClose();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-white text-center ${
          isIncoming && !isCallActive 
            ? 'bg-gradient-to-r from-green-500 to-blue-600 animate-pulse' 
            : 'bg-gradient-to-r from-blue-500 to-purple-600'
        }`}>
          <div className="flex items-center justify-center mb-4">
            <div className={`w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center ${
              isIncoming && !isCallActive ? 'animate-bounce' : ''
            }`}>
              <Video className="w-10 h-10" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isIncoming ? '📞 Incoming Video Call' : '📹 Video Call'}
          </h2>
          <p className="text-blue-100">
            {isIncoming ? `${callerName} is calling you` : `Calling ${callerName}`}
          </p>
          {isIncoming && !isCallActive && (
            <p className="text-green-100 mt-2 text-sm animate-pulse">
              🔔 Answer or decline the call
            </p>
          )}
          {isCallActive && (
            <p className="text-blue-100 mt-2 font-mono text-lg">
              {formatDuration(callDuration)}
            </p>
          )}
        </div>

        {/* Video Preview Area */}
        <div className="p-6">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-48 flex items-center justify-center mb-6">
            {isVideoOff ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                    {callerName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {isCallActive ? 'Video is off' : 'Video preview'}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  {isCallActive ? 'Video call active' : 'Starting video call...'}
                </p>
              </div>
            )}
          </div>

          {/* Call Controls */}
          {isIncoming && !isCallActive ? (
            // Incoming call controls
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDecline}
                className="flex items-center justify-center w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                title="Decline call"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              <button
                onClick={handleAnswer}
                className="flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                title="Answer call"
              >
                <Phone className="w-6 h-6" />
              </button>
            </div>
          ) : (
            // Active call controls
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleMute}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  isMuted 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <button
                onClick={toggleVideo}
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                  isVideoOff 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200'
                }`}
                title={isVideoOff ? 'Turn on video' : 'Turn off video'}
              >
                {isVideoOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              </button>
              
              <button
                onClick={handleEndCall}
                className="flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                title="End call"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Call Status */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isIncoming && !isCallActive && 'Tap to answer or decline'}
              {!isIncoming && !isCallActive && 'Waiting for answer...'}
              {isCallActive && 'Call in progress'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Caller: {callerEmail}</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallModal;
