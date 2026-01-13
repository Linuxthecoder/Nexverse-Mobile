import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Camera, X, RotateCcw, Video, Image, Send, Edit3, FileText } from "lucide-react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime, formatMessageStatus } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    autoMarkAsSeen,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messagesEndRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [dragFileType, setDragFileType] = useState(null);
  const dropZoneRef = useRef(null);

  // Camera interface state
  const [showCameraInterface, setShowCameraInterface] = useState(false);
  const [cameraMode, setCameraMode] = useState('photo'); // 'photo' or 'video'
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [recording, setRecording] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  
  // Flash and timer features
  const [flashMode, setFlashMode] = useState('auto'); // 'auto', 'on', 'off'
  const [timer, setTimer] = useState(0); // 0, 3, 10 seconds
  const [timerActive, setTimerActive] = useState(false);
  const [timerCount, setTimerCount] = useState(0);
  const [showFlashEffect, setShowFlashEffect] = useState(false);
  const [continuousFlash, setContinuousFlash] = useState(false); // For preview lighting
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const onPhotoCaptureRef = useRef(null);
  const onVideoCaptureRef = useRef(null);

  // Helper to validate user ID
  const isValidUserId = (id) =>
    typeof id === "string" && id.length === 24 && id !== "unread-counts";

  // Camera functions
  const startCamera = async () => {
    try {
      const constraints = {
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: cameraMode === 'video'
      };

      // Add flash/torch support for back camera
      if (facingMode === 'environment' && flashMode === 'on') {
        constraints.video.torch = true;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setCameraStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Enable torch for back camera if flash is on
      if (facingMode === 'environment' && flashMode === 'on') {
        const track = mediaStream.getVideoTracks()[0];
        if (track && track.getCapabilities && track.getCapabilities().torch) {
          await track.applyConstraints({ advanced: [{ torch: true }] });
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
    setShowCameraInterface(false);
    setCapturedPhoto(null);
    setRecordedVideo(null);
    
    // Turn off continuous flash when closing camera
    setContinuousFlash(false);
    setFlashMode('auto');
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newFacingMode }, 
        audio: cameraMode === 'video' 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setFacingMode(newFacingMode);
      
      // Show success message
      const cameraType = newFacingMode === 'user' ? 'Front' : 'Back';
      toast.success(`📷 Switched to ${cameraType} Camera`, {
        duration: 1500,
        position: 'top-center',
      });
      
    } catch (error) {
      console.error('Camera switch error:', error);
      
      // For laptops/devices without back camera, automatically switch back to front
      if (newFacingMode === 'environment') {
        console.log('Back camera not available, switching back to front camera');
        toast.error('📷 Back camera not available on this device', {
          duration: 2000,
          position: 'top-center',
        });
        
        try {
          // Switch back to front camera
          const frontStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' }, 
            audio: cameraMode === 'video' 
          });
          setCameraStream(frontStream);
          if (videoRef.current) {
            videoRef.current.srcObject = frontStream;
          }
          setFacingMode('user');
          
          setTimeout(() => {
            toast.success('📷 Using Front Camera', {
              duration: 1500,
              position: 'top-center',
            });
          }, 500);
          
        } catch (frontError) {
          console.error('Failed to switch back to front camera:', frontError);
          toast.error('Camera switching failed');
          setFacingMode(facingMode); // Revert to original
        }
      } else {
        toast.error('Failed to switch camera');
        setFacingMode(facingMode); // Revert to original
      }
    }
  };

  const capturePhoto = () => {
    if (timer > 0 && !timerActive) {
      // Start timer countdown
      setTimerActive(true);
      setTimerCount(timer);
      
      const countdown = setInterval(() => {
        setTimerCount((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setTimerActive(false);
            performCapture();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return;
    }
    
    performCapture();
  };

  const performCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      toast.error('Camera not ready. Please wait a moment.');
      return;
    }

    // Auto-detect camera and apply flash effect
    const isFrontCamera = facingMode === 'user';
    const shouldFlash = flashMode === 'on' || (flashMode === 'auto' && needsFlash());
    
    console.log(`Camera detected: ${isFrontCamera ? 'Front' : 'Back'} camera`);
    
    // Show camera detection toast
    const cameraType = isFrontCamera ? 'Front' : 'Back';
    const flashType = shouldFlash ? (isFrontCamera ? 'Screen Flash' : 'LED Flash') : 'No Flash';
    toast.success(`📷 ${cameraType} Camera • ${flashType}`, {
      duration: 1500,
      position: 'top-center',
    });
    
    if (shouldFlash) {
      if (isFrontCamera) {
        // Front camera: bright white screen flash
        console.log('Applying front camera flash effect');
        setShowFlashEffect(true);
        setTimeout(() => setShowFlashEffect(false), 300);
      } else {
        // Back camera: device LED flash
        console.log('Applying back camera LED flash');
        try {
          const track = cameraStream.getVideoTracks()[0];
          if (track && track.getCapabilities && track.getCapabilities().torch) {
            await track.applyConstraints({ advanced: [{ torch: true }] });
            setTimeout(async () => {
              await track.applyConstraints({ advanced: [{ torch: false }] });
            }, 300);
          } else {
            // Fallback: use screen flash for back camera if LED not available
            console.log('LED flash not available, using screen flash');
            setShowFlashEffect(true);
            setTimeout(() => setShowFlashEffect(false), 300);
          }
        } catch (error) {
          console.log('Flash not supported, using screen flash fallback:', error);
          // Fallback to screen flash
          setShowFlashEffect(true);
          setTimeout(() => setShowFlashEffect(false), 300);
        }
      }
    } else {
      // Always apply a subtle flash effect when capturing, regardless of flash setting
      if (isFrontCamera) {
        // Subtle white flash for front camera
        setShowFlashEffect(true);
        setTimeout(() => setShowFlashEffect(false), 150);
      }
    }
    
    // Small delay for flash effect
    setTimeout(() => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Failed to capture photo. Please try again.');
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => {
          setCapturedPhoto(reader.result);
          toast.success('Photo captured successfully!');
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.9);
    }, flashMode === 'on' || (flashMode === 'auto' && needsFlash()) ? 100 : 0);
  };

  const needsFlash = () => {
    // Simple logic to determine if flash is needed (in auto mode)
    // In a real app, you might analyze the video brightness
    return false; // For now, auto mode doesn't trigger flash
  };

  const toggleFlashMode = async () => {
    const newFlashMode = flashMode === 'auto' ? 'on' : flashMode === 'on' ? 'off' : 'auto';
    setFlashMode(newFlashMode);
    
    // Handle continuous flash for preview
    if (newFlashMode === 'on') {
      setContinuousFlash(true);
      
      // For front camera, show continuous bright overlay
      if (facingMode === 'user') {
        toast.success('💡 Screen Light ON', {
          duration: 1500,
          position: 'top-center',
        });
      } else {
        // For back camera, try to enable torch
        try {
          const track = cameraStream?.getVideoTracks()[0];
          if (track && track.getCapabilities && track.getCapabilities().torch) {
            await track.applyConstraints({ advanced: [{ torch: true }] });
            toast.success('🔦 Flash Light ON', {
              duration: 1500,
              position: 'top-center',
            });
          } else {
            // Fallback to screen light for back camera
            toast.success('💡 Screen Light ON', {
              duration: 1500,
              position: 'top-center',
            });
          }
        } catch (error) {
          console.log('Torch not supported, using screen light:', error);
          toast.success('💡 Screen Light ON', {
            duration: 1500,
            position: 'top-center',
          });
        }
      }
    } else {
      setContinuousFlash(false);
      
      // Turn off torch for back camera
      if (facingMode === 'environment') {
        try {
          const track = cameraStream?.getVideoTracks()[0];
          if (track && track.getCapabilities && track.getCapabilities().torch) {
            await track.applyConstraints({ advanced: [{ torch: false }] });
          }
        } catch (error) {
          console.log('Error turning off torch:', error);
        }
      }
      
      toast.success(`💡 Flash ${newFlashMode.toUpperCase()}`, {
        duration: 1500,
        position: 'top-center',
      });
    }
  };

  const startVideoRecording = () => {
    if (!cameraStream) return;
    
    try {
      const recorder = new MediaRecorder(cameraStream);
      const chunks = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        setRecordedChunks([]);
        toast.success('Video recorded successfully!');
      };
      
      setRecordedChunks(chunks);
      setMediaRecorder(recorder);
      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Error starting video recording:', error);
      toast.error('Failed to start video recording.');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  // --- Drag and Drop Handlers ---
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
    
    // Detect file type from drag event
    const items = Array.from(e.dataTransfer.items);
    const fileItem = items.find(item => item.kind === 'file');
    
    if (fileItem) {
      const fileType = fileItem.type;
      if (fileType.startsWith('image/')) {
        setDragFileType('image');
      } else if (fileType.startsWith('video/')) {
        setDragFileType('video');
      } else {
        setDragFileType('document');
      }
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only hide if leaving the drop zone completely
    if (!dropZoneRef.current?.contains(e.relatedTarget)) {
      setIsDragOver(false);
      setDragFileType(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragFileType(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    
    // Forward the file to MessageInput component
    const messageInput = document.querySelector('[data-message-input]');
    if (messageInput) {
      const event = new CustomEvent('fileDropped', { detail: { file } });
      messageInput.dispatchEvent(event);
    }
  };

  // Load messages and subscribe to updates
  useEffect(() => {
    if (selectedUser && isValidUserId(selectedUser._id)) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      autoMarkAsSeen(selectedUser._id);

      return () => unsubscribeFromMessages();
    }
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages, autoMarkAsSeen]);

  // Listen for camera interface events
  useEffect(() => {
    const handleOpenCamera = (event) => {
      console.log('Camera interface event received:', event.detail);
      const { onPhotoCapture, onVideoCapture } = event.detail;
      onPhotoCaptureRef.current = onPhotoCapture;
      onVideoCaptureRef.current = onVideoCapture;
      setShowCameraInterface(true);
    };

    window.addEventListener('openCameraInterface', handleOpenCamera);
    return () => window.removeEventListener('openCameraInterface', handleOpenCamera);
  }, []);

  // Start camera when interface opens
  useEffect(() => {
    if (showCameraInterface && !cameraStream) {
      startCamera();
    }
  }, [showCameraInterface, cameraStream]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark messages as seen when chat is opened or new messages arrive
  useEffect(() => {
    const userId = selectedUser?._id;
    if (isValidUserId(userId) && messages.length > 0) {
      // Auto-mark messages as seen when viewing the chat
      const timer = setTimeout(() => {
        autoMarkAsSeen();
      }, 1000); // Wait 1 second to ensure user is actively viewing
      
      return () => clearTimeout(timer);
    }
  }, [selectedUser?._id, messages, autoMarkAsSeen]);

  // Mark messages as seen when component becomes visible (window focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedUser?._id) {
        autoMarkAsSeen();
      }
    };

    const handleFocus = () => {
      if (selectedUser?._id) {
        autoMarkAsSeen();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedUser?._id, autoMarkAsSeen]);

  // No user selected
  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-base-100 text-gray-500">
        <p>Select a user to start chatting</p>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex flex-col overflow-auto bg-base-100 relative"
      ref={dropZoneRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Drag and Drop Overlay - Full Chat Coverage */}
      {isDragOver && (
        <div className="absolute inset-0 bg-base-100 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-50">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">
              {dragFileType === 'image' && '🖼️'}
              {dragFileType === 'video' && '🎥'}
              {dragFileType === 'document' && '📄'}
            </div>
            <p className="text-primary font-bold text-xl mb-2">
              Drop your {dragFileType} here
            </p>
            <p className="text-base-content/60">
              {dragFileType === 'image' && 'Max size: 2MB'}
              {dragFileType === 'video' && 'Max size: 25MB'}
              {dragFileType === 'document' && 'Max size: 50MB'}
            </p>
          </div>
        </div>
      )}
      
      {/* Apple-Style Camera Interface */}
      {showCameraInterface ? (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <style jsx>{`
            @keyframes flash {
              0% { 
                opacity: 0; 
                transform: scale(1);
              }
              20% { 
                opacity: 1; 
                transform: scale(1.01);
              }
              50% { 
                opacity: 0.95; 
                transform: scale(1.02);
              }
              80% { 
                opacity: 0.7; 
                transform: scale(1.01);
              }
              100% { 
                opacity: 0; 
                transform: scale(1);
              }
            }
            
            @keyframes borderFlash {
              0% { 
                opacity: 0;
                box-shadow: none;
                border-color: transparent;
              }
              25% { 
                opacity: 1;
                box-shadow: 
                  0 0 0 20px rgba(255,255,255,1),
                  0 0 0 40px rgba(255,255,255,0.9),
                  0 0 0 60px rgba(255,255,255,0.7),
                  0 0 0 80px rgba(255,255,255,0.5),
                  0 0 0 100px rgba(255,255,255,0.3),
                  inset 0 0 150px rgba(255,255,255,1);
                border-color: rgba(255,255,255,1);
              }
              60% { 
                opacity: 0.8;
                box-shadow: 
                  0 0 0 15px rgba(255,255,255,0.8),
                  0 0 0 30px rgba(255,255,255,0.6),
                  0 0 0 45px rgba(255,255,255,0.4),
                  0 0 0 60px rgba(255,255,255,0.2),
                  inset 0 0 100px rgba(255,255,255,0.7);
                border-color: rgba(255,255,255,0.8);
              }
              100% { 
                opacity: 0;
                box-shadow: none;
                border-color: transparent;
              }
            }
            
            @keyframes glow {
              0% { 
                opacity: 0;
                transform: scale(1);
              }
              30% { 
                opacity: 0.6;
                transform: scale(1.05);
              }
              70% { 
                opacity: 0.3;
                transform: scale(1.02);
              }
              100% { 
                opacity: 0;
                transform: scale(1);
              }
            }
            
            .bg-gradient-radial {
              background: radial-gradient(circle, currentColor 0%, transparent 70%);
            }
          `}</style>
          {/* Apple-style Top Bar */}
          <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-3">
              {/* Flash Control */}
              <button
                onClick={toggleFlashMode}
                className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${
                  flashMode === 'on' 
                    ? 'bg-yellow-400 text-black shadow-lg animate-pulse' 
                    : flashMode === 'auto'
                    ? 'bg-white/30 text-white'
                    : 'bg-black/30 text-white hover:bg-black/50'
                }`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                </svg>
              </button>

              {/* Timer Control */}
              <button
                onClick={() => setTimer(timer === 0 ? 3 : timer === 3 ? 10 : 0)}
                className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 ${
                  timer > 0 
                    ? 'bg-orange-500 text-white shadow-lg' 
                    : 'bg-black/30 text-white hover:bg-black/50'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12,6 12,12 16,14"/>
                </svg>
              </button>
            </div>
            
            <button
              onClick={stopCamera}
              className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-black/50"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Full-Screen Camera Preview */}
          <div className="relative w-full h-full bg-black">
            {!capturedPhoto && !recordedVideo ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.play().catch(console.error);
                    }
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Recording indicator */}
                {recording && (
                  <div className="absolute top-16 left-4 z-30 bg-red-500 text-white px-3 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    REC
                  </div>
                )}

                {/* Timer Countdown */}
                {timerActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-30">
                    <div className="text-white text-center">
                      <div className="text-8xl font-light animate-pulse mb-4">
                        {timerCount}
                      </div>
                      <p className="text-lg font-medium">Get Ready!</p>
                    </div>
                  </div>
                )}

                {/* Continuous Flash for Preview - Always ON when flash mode is ON */}
                {continuousFlash && flashMode === 'on' && (
                  <>
                    {/* Extreme bright white overlay */}
                    <div className="absolute inset-0 bg-white/85 z-20" />
                    
                    {/* Intense border glow - Always visible */}
                    <div className="absolute inset-0 z-20"
                         style={{ 
                           boxShadow: `
                             0 0 0 15px rgba(255,255,255,1),
                             0 0 0 30px rgba(255,255,255,0.9),
                             0 0 0 45px rgba(255,255,255,0.7),
                             0 0 0 60px rgba(255,255,255,0.5),
                             0 0 0 75px rgba(255,255,255,0.3),
                             0 0 0 90px rgba(255,255,255,0.1),
                             inset 0 0 80px rgba(255,255,255,0.8)
                           `,
                           border: '8px solid rgba(255,255,255,0.9)',
                         }} 
                    />
                    
                    {/* Outer glow effect */}
                    <div className="absolute -inset-6 z-19 bg-white/20 blur-2xl" />
                  </>
                )}

                {/* Enhanced Flash Effect - Full Screen Border (for photo capture) */}
                {showFlashEffect && (
                  <>
                    {/* Main flash overlay */}
                    <div className="absolute inset-0 bg-white z-20"
                         style={{ 
                           animation: 'flash 0.4s ease-out',
                           animationFillMode: 'forwards',
                         }} 
                    />
                    
                    {/* Bright white border effect */}
                    <div className="absolute inset-0 z-20"
                         style={{ 
                           animation: 'borderFlash 0.4s ease-out',
                           animationFillMode: 'forwards',
                           boxShadow: `
                             0 0 0 20px rgba(255,255,255,1),
                             0 0 0 40px rgba(255,255,255,0.8),
                             0 0 0 60px rgba(255,255,255,0.6),
                             0 0 0 80px rgba(255,255,255,0.4),
                             0 0 0 100px rgba(255,255,255,0.2),
                             inset 0 0 100px rgba(255,255,255,0.9)
                           `,
                           border: '10px solid rgba(255,255,255,1)',
                         }} 
                    />
                    
                    {/* Screen edge glow */}
                    <div className="absolute -inset-4 z-19 bg-white/30 blur-xl"
                         style={{ 
                           animation: 'glow 0.4s ease-out',
                           animationFillMode: 'forwards',
                         }} 
                    />
                  </>
                )}

                {/* Camera Detection Indicator */}
                <div className="absolute bottom-20 left-4 z-30">
                  <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white/80">
                    📷 {facingMode === 'user' ? 'Front' : 'Back'} Camera
                  </div>
                </div>

                {/* Loading overlay */}
                {!cameraStream && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="text-white text-center">
                      <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin mb-4 mx-auto"></div>
                      <p className="text-lg font-medium">Camera</p>
                    </div>
                  </div>
                )}

                {/* Flash Status Indicator */}
                {flashMode !== 'off' && (
                  <div className="absolute top-16 right-4 z-30">
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold shadow-lg ${
                      flashMode === 'on' 
                        ? 'bg-yellow-400 text-black' 
                        : 'bg-white/20 text-white backdrop-blur-sm'
                    }`}>
                      {flashMode === 'on' ? '⚡ ON' : '⚡ AUTO'}
                    </div>
                  </div>
                )}

                {/* Timer Status Indicator */}
                {timer > 0 && !timerActive && (
                  <div className="absolute top-16 left-4 z-30">
                    <div className="bg-orange-500 px-2 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
                      ⏱️ {timer}s
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center">
                {capturedPhoto ? (
                  <img
                    src={capturedPhoto}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={recordedVideo}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            )}
          </div>

          {/* Apple-style Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-sm">
            {!capturedPhoto && !recordedVideo ? (
              <div className="flex flex-col items-center pb-8 pt-6 px-6">
                {/* Photo/Video Mode Toggle */}
                <div className="flex bg-black/40 backdrop-blur-sm rounded-full p-1 mb-8">
                  <button
                    onClick={() => setCameraMode('photo')}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      cameraMode === 'photo' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    PHOTO
                  </button>
                  <button
                    onClick={() => setCameraMode('video')}
                    className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                      cameraMode === 'video' 
                        ? 'bg-white text-black shadow-lg' 
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    VIDEO
                  </button>
                </div>

                {/* Capture Controls */}
                <div className="flex justify-between items-center w-full max-w-sm">
                  {/* Gallery/Library */}
                  <button
                    className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-white/30 active:scale-95"
                  >
                    <Image className="w-6 h-6 text-white" />
                  </button>

                  {/* Capture/Record Button */}
                  {cameraMode === 'photo' ? (
                    <button
                      onClick={capturePhoto}
                      className="w-20 h-20 rounded-full border-4 border-white bg-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xl"
                      disabled={!cameraStream}
                    >
                      <div className="w-full h-full rounded-full bg-white" />
                    </button>
                  ) : (
                    <button
                      onClick={recording ? stopVideoRecording : startVideoRecording}
                      className={`w-20 h-20 rounded-full border-4 border-white transition-all duration-200 shadow-2xl ${
                        recording 
                          ? 'bg-red-500 scale-90' 
                          : 'bg-white hover:scale-105 active:scale-95'
                      }`}
                      disabled={!cameraStream}
                    >
                      {recording ? (
                        <div className="w-6 h-6 bg-white rounded-sm mx-auto" />
                      ) : (
                        <div className="w-16 h-16 bg-red-500 rounded-full mx-auto" />
                      )}
                    </button>
                  )}

                  {/* Switch Camera */}
                  <button
                    onClick={switchCamera}
                    className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:bg-white/30 active:scale-95"
                    disabled={!cameraStream}
                  >
                    <RotateCcw className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center gap-4 pb-8 pt-6 px-6">
                {/* Retake */}
                <button
                  onClick={() => {
                    setCapturedPhoto(null);
                    setRecordedVideo(null);
                  }}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium transition-all duration-200 hover:bg-white/30 active:scale-95"
                >
                  Retake
                </button>

                {/* Edit (only for photos) */}
                {capturedPhoto && (
                  <button
                    onClick={() => {
                      toast.info("Photo editor coming soon!");
                    }}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:bg-white/30 active:scale-95"
                  >
                    <Edit3 className="w-5 h-5 text-white" />
                  </button>
                )}

                {/* Use Photo/Video */}
                <button
                  onClick={() => {
                    if (capturedPhoto && onPhotoCaptureRef.current) {
                      onPhotoCaptureRef.current(capturedPhoto);
                    } else if (recordedVideo && onVideoCaptureRef.current) {
                      onVideoCaptureRef.current(recordedVideo);
                    }
                    stopCamera();
                  }}
                  className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-full text-white font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  Use {cameraMode === 'photo' ? 'Photo' : 'Video'}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {!showCameraInterface && (
        <>
          <ChatHeader />
          
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <p className="text-sm">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`chat ${
                    message.senderId === authUser._id ? "chat-end" : "chat-start"
                  }`}
                >
                  {/* Avatar */}
                  <div className="chat-image avatar">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-base-100">
                      <img
                        src={
                          message.senderId === authUser._id
                            ? authUser.profilePic || "/avatar.png"
                            : selectedUser.profilePic || "/avatar.png"
                        }
                        alt={
                          message.senderId === authUser._id
                            ? "Your profile picture"
                            : `${selectedUser.name || "User"}'s profile picture`
                        }
                        loading="lazy"
                      />
                    </div>
                  </div>

                  {/* Message time */}
                  <div className="chat-header text-xs opacity-60 mb-1">
                    {formatMessageTime(message.createdAt)}
                  </div>

                  {/* Message bubble */}
                  <div className="chat-bubble max-w-[80vw] sm:max-w-[400px] break-words">
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Attachment"
                        className="max-w-full sm:max-w-[200px] rounded-lg shadow-sm mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                        loading="lazy"
                        onClick={() => {
                          setSelectedMedia(message.image);
                          setMediaType('image');
                        }}
                      />
                    )}
                    {message.video && (
                      <video
                        src={message.video}
                        controls
                        className="max-w-full sm:max-w-[200px] rounded-lg shadow-sm mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          setSelectedMedia(message.video);
                          setMediaType('video');
                        }}
                      />
                    )}
                    {message.document && (
                      <div className="flex items-center gap-2 p-2 bg-base-200 rounded-lg mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-sm">{message.document.name || "Document"}</span>
                      </div>
                    )}
                    {message.text && <p className="text-sm sm:text-base">{message.text}</p>}
                    
                    {/* Message Status Indicator - Only for sent messages */}
                    {message.senderId === authUser._id && (
                      <div className="flex justify-end mt-1">
                        {message.status === "error" && (
                          <span className="text-error text-xs" title="Failed to send">Failed to send</span>
                        )}
                        {message.status === "sent" && (
                          <span className="text-gray-400 text-xs" title="Sent">Sent</span>
                        )}
                        {message.status === "delivered" && (
                          <span className="text-gray-400 text-xs" title="Delivered">Delivered</span>
                        )}
                        {message.status === "seen" && message.updatedAt && (
                          <span className="text-blue-500 text-xs" title="Seen">{formatMessageStatus(message.updatedAt)}</span>
                        )}
                        {/* Fallback to read field if status is not set */}
                        {!message.status && message.read && message.updatedAt && (
                          <span className="text-blue-500 text-xs" title="Seen">{formatMessageStatus(message.updatedAt)}</span>
                        )}
                        {!message.status && !message.read && (
                          <span className="text-gray-400 text-xs" title="Delivered">Delivered</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Invisible div for scrolling */}
            <div ref={messagesEndRef} aria-hidden="true" />
          </div>

          <MessageInput />
        </>
      )}

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedMedia(null);
            setMediaType(null);
          }}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            {mediaType === 'image' ? (
              <img
                src={selectedMedia}
                alt="Full size"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <video
                src={selectedMedia}
                controls
                autoPlay
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            {/* Close button */}
            <button
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition-all"
              onClick={() => {
                setSelectedMedia(null);
                setMediaType(null);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatContainer;