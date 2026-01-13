import { useRef, useState, useEffect } from "react";
import { useNotificationStore } from "../store/useNotificationStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { Plus, Send, X, Camera, Image, Video, FileText, Upload, RotateCcw, Zap, Grid3X3, Timer, Download, Settings, Edit3, Type, Square, Smile, Crop, Palette, Brush, Eraser, Undo, Redo, MoreHorizontal } from "lucide-react";
import toast from "react-hot-toast";

// Apple-style Tooltip Component
const AppleTooltip = ({ children, tooltip, position = 'top' }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      {showTooltip && (
        <div className={`absolute z-50 px-2 py-1 text-xs text-white bg-black bg-opacity-80 rounded backdrop-blur-sm transition-opacity duration-200 whitespace-nowrap ${
          position === 'top' ? '-top-8 left-1/2 transform -translate-x-1/2' :
          position === 'bottom' ? '-bottom-8 left-1/2 transform -translate-x-1/2' :
          position === 'left' ? 'top-1/2 -left-2 transform -translate-y-1/2 -translate-x-full' :
          'top-1/2 -right-2 transform -translate-y-1/2 translate-x-full'
        }`}>
          {tooltip}
          <div className={`absolute w-1 h-1 bg-black bg-opacity-80 transform rotate-45 ${
            position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-0.5' :
            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-0.5' :
            position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-0.5' :
            'right-full top-1/2 -translate-y-1/2 -mr-0.5'
          }`} />
        </div>
      )}
    </div>
  );
};

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [videoFacingMode, setVideoFacingMode] = useState('user');
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragFileType, setDragFileType] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // Enhanced camera features
  const [showGrid, setShowGrid] = useState(false);
  const [flash, setFlash] = useState('auto');
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [mediaType, setMediaType] = useState('photo'); // 'photo' or 'video'
  
  // Photo editing features
  const [showPhotoEditor, setShowPhotoEditor] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(null);
  const [editTool, setEditTool] = useState(null);
  const [editHistory, setEditHistory] = useState([]);
  const [editHistoryIndex, setEditHistoryIndex] = useState(-1);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#ff0000');
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [textSize, setTextSize] = useState(24);
  const [textColor, setTextColor] = useState('#ffffff');
  const [cropArea, setCropArea] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const textareaRef = useRef(null);
  const uploadMenuRef = useRef(null);
  const videoRef = useRef(null);
  const videoRecordRef = useRef(null);
  const canvasRef = useRef(null);
  const dropZoneRef = useRef(null);
  const editCanvasRef = useRef(null);
  const editImageRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  const typingTimeoutRef = useRef(null);

  // --- Handle file drops from ChatContainer ---
  useEffect(() => {
    const handleFileDropped = async (event) => {
      const { file } = event.detail;
      
      if (file.type.startsWith('image/')) {
        // Handle image drop
        if (file.size > 2 * 1024 * 1024) {
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
        
      } else if (file.type.startsWith('video/')) {
        // Handle video drop
        if (file.size > 25 * 1024 * 1024) {
          return;
        }
        
        const url = URL.createObjectURL(file);
        setVideoPreview(url);
        
      } else {
        // Handle document drop
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/plain',
          'text/csv',
          'application/json',
          'application/xml',
          'text/xml',
          'application/zip',
          'application/x-rar-compressed',
          'application/x-tar',
          'application/gzip',
          'application/x-msdownload',
          'application/vnd.android.package-archive'
        ];

        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(exe|apk|txt|csv|json|xml|zip|rar|tar|gz)$/i)) {
          return;
        }

        if (file.size > 50 * 1024 * 1024) {
          return;
        }

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreview({
            name: file.name,
            size: file.size,
            type: file.type,
            data: reader.result
          });
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      }
    };

    const messageInputElement = document.querySelector('[data-message-input]');
    if (messageInputElement) {
      messageInputElement.addEventListener('fileDropped', handleFileDropped);
      return () => messageInputElement.removeEventListener('fileDropped', handleFileDropped);
    }
  }, []);

  // --- Close upload menu when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target)) {
        setShowUploadMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Auto-Resize Textarea ---
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`; // Set height to match content
    }
  }, [text]);

  // --- Typing Indicator ---
  const emitTyping = () => {
    if (!socket || !selectedUser?._id) return;
    socket.emit("typing", {
      to: selectedUser._id,
      from: useAuthStore.getState().authUser._id,
      isTyping: true,
    });
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Emit typing
    emitTyping();

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        to: selectedUser._id,
        from: useAuthStore.getState().authUser._id,
        isTyping: false,
      });
    }, 3000);
  };

  // Handle Enter key to send message
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Prevent sending if already sending or uploading
      if (!isSending && !isUploading) {
        handleSendMessage(e);
      }
    }
  };

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // --- Image Upload & Resize ---
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB.");
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let { width, height } = img;
      const maxSize = 1280;
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob.size > 2 * 1024 * 1024) {
            toast.error("Resized image is still too large (max 2MB)");
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => setImagePreview(reader.result);
          reader.readAsDataURL(blob);
        },
        "image/jpeg",
        0.9
      );
    };

    const reader = new FileReader();
    reader.onload = (e) => (img.src = e.target.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Document Upload ---
  const handleDocumentChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/json',
      'application/xml',
      'text/xml',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-tar',
      'application/gzip',
      'application/x-msdownload',
      'application/vnd.android.package-archive'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(exe|apk|txt|csv|json|xml|zip|rar|tar|gz)$/i)) {
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocumentPreview({
        name: file.name,
        size: file.size,
        type: file.type,
        data: reader.result
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeDocument = () => {
    setDocumentPreview(null);
    if (documentInputRef.current) documentInputRef.current.value = "";
  };

  // --- Camera Controls ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode }, 
        audio: false 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to load
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current.play();
        });
      }
      setShowCameraModal(true);
      setShowUploadMenu(false);
      toast.success('Camera ready!');
    } catch (error) {
      console.error('Camera error:', error);
      const errorMessage = {
        'NotAllowedError': 'Camera access denied. Please allow camera access.',
        'NotFoundError': 'No camera found on this device.',
        'NotSupportedError': 'Camera not supported on this browser.',
        'NotReadableError': 'Camera is being used by another application.'
      }[error.name] || 'Could not access camera. Please try again.';
      toast.error(errorMessage);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraModal(false);
  };

  // --- Video Recording Modal Controls ---
  const startVideoModal = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: videoFacingMode }, 
        audio: true 
      });
      setVideoStream(stream);
      if (videoRecordRef.current) {
        videoRecordRef.current.srcObject = stream;
        // Wait for video to load
        videoRecordRef.current.addEventListener('loadedmetadata', () => {
          videoRecordRef.current.play();
        });
      }
      setShowVideoModal(true);
      setShowUploadMenu(false);
      toast.success('Video camera ready!');
    } catch (error) {
      console.error('Video camera error:', error);
      const errorMessage = {
        'NotAllowedError': 'Camera access denied. Please allow camera access.',
        'NotFoundError': 'No camera found on this device.',
        'NotSupportedError': 'Camera not supported on this browser.',
        'NotReadableError': 'Camera is being used by another application.'
      }[error.name] || 'Could not access camera for video recording.';
      toast.error(errorMessage);
    }
  };

  const stopVideoModal = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
    setShowVideoModal(false);
  };

  const switchVideoCamera = async () => {
    const newFacingMode = videoFacingMode === 'user' ? 'environment' : 'user';
    setVideoFacingMode(newFacingMode);
    
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newFacingMode }, 
        audio: true 
      });
      setVideoStream(stream);
      if (videoRecordRef.current) {
        videoRecordRef.current.srcObject = stream;
        // Wait for video to load
        videoRecordRef.current.addEventListener('loadedmetadata', () => {
          videoRecordRef.current.play();
        });
      }
      toast.success(`Switched to ${newFacingMode === 'user' ? 'front' : 'back'} camera`);
    } catch (error) {
      console.error('Video camera switch error:', error);
      toast.error('Failed to switch camera. This device may only have one camera.');
      // Revert to previous facing mode if switch fails
      setVideoFacingMode(videoFacingMode);
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: newFacingMode }, 
        audio: false 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for video to load
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current.play();
        });
      }
      toast.success(`Switched to ${newFacingMode === 'user' ? 'front' : 'back'} camera`);
    } catch (error) {
      console.error('Camera switch error:', error);
      toast.error('Failed to switch camera. This device may only have one camera.');
      // Revert to previous facing mode if switch fails
      setFacingMode(facingMode);
    }
  };

  const capturePhoto = () => {
    if (timer > 0 && !timerActive) {
      // Start timer countdown
      setTimerActive(true);
      let countdown = timer;
      
      const timerInterval = setInterval(() => {
        countdown--;
        setTimer(countdown);
        
        if (countdown <= 0) {
          clearInterval(timerInterval);
          setTimerActive(false);
          setTimer(timer); // Reset to original timer value
          performCapture();
        }
      }, 1000);
      
      return;
    }
    
    performCapture();
  };

  const performCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Ensure video is ready
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      toast.error('Camera not ready. Please wait a moment.');
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error('Failed to capture photo. Please try again.');
        return;
      }
      
      if (blob.size > 2 * 1024 * 1024) {
        toast.error('Photo too large. Please try again.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedPhoto(reader.result);
        toast.success('Photo captured successfully!');
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.9);
  };

  // --- Photo Editing Functions ---
  const openPhotoEditor = (photoUrl) => {
    setEditingPhoto(photoUrl);
    setShowPhotoEditor(true);
    setEditHistory([photoUrl]);
    setEditHistoryIndex(0);
    setCapturedPhoto(null);
  };

  const closePhotoEditor = () => {
    setShowPhotoEditor(false);
    setEditingPhoto(null);
    setEditTool(null);
    setEditHistory([]);
    setEditHistoryIndex(-1);
  };

  const saveEditedPhoto = () => {
    if (editingPhoto) {
      setImagePreview(editingPhoto);
      closePhotoEditor();
      toast.success("Photo edited and added to message");
    }
  };

  const undoEdit = () => {
    if (editHistoryIndex > 0) {
      setEditHistoryIndex(editHistoryIndex - 1);
      setEditingPhoto(editHistory[editHistoryIndex - 1]);
    }
  };

  const redoEdit = () => {
    if (editHistoryIndex < editHistory.length - 1) {
      setEditHistoryIndex(editHistoryIndex + 1);
      setEditingPhoto(editHistory[editHistoryIndex + 1]);
    }
  };

  const addToHistory = (newPhoto) => {
    const newHistory = editHistory.slice(0, editHistoryIndex + 1);
    newHistory.push(newPhoto);
    setEditHistory(newHistory);
    setEditHistoryIndex(newHistory.length - 1);
    setEditingPhoto(newPhoto);
  };

  const applyFilter = (filterType) => {
    if (!editCanvasRef.current || !editImageRef.current) return;
    
    const canvas = editCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = editImageRef.current;
    
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Apply filter based on type
    switch (filterType) {
      case 'brightness':
        ctx.filter = `brightness(${brightness}%)`;
        break;
      case 'contrast':
        ctx.filter = `contrast(${contrast}%)`;
        break;
      case 'saturation':
        ctx.filter = `saturate(${saturation}%)`;
        break;
      case 'grayscale':
        ctx.filter = 'grayscale(100%)';
        break;
      case 'sepia':
        ctx.filter = 'sepia(100%)';
        break;
      case 'blur':
        ctx.filter = 'blur(2px)';
        break;
      default:
        ctx.filter = 'none';
    }
    
    ctx.drawImage(img, 0, 0);
    const newPhotoUrl = canvas.toDataURL('image/jpeg', 0.9);
    addToHistory(newPhotoUrl);
  };

  // --- Camera Capture (emit event to parent) ---
  const handleCameraCapture = () => {
    // Check if it's desktop/laptop (has getUserMedia support)
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Emit custom event to notify ChatContainer to open camera
      window.dispatchEvent(new CustomEvent('openCameraInterface', {
        detail: { 
          onPhotoCapture: (photoUrl) => {
            setImagePreview(photoUrl);
            toast.success("Photo added to message");
          },
          onVideoCapture: (videoUrl) => {
            setVideoPreview(videoUrl);
            toast.success("Video added to message");
          }
        }
      }));
      setShowUploadMenu(false);
    } else {
      // Fallback to file input for older browsers
      cameraInputRef.current?.click();
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
    
    if (file.type.startsWith('image/')) {
      // Handle image drop
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be less than 2MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      toast.success("Image loaded");
      
    } else if (file.type.startsWith('video/')) {
      // Handle video drop
      if (file.size > 25 * 1024 * 1024) {
        toast.error("Video must be less than 25MB.");
        return;
      }
      
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
      toast.success("Video loaded");
      
    } else {
      // Handle document drop
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'application/json',
        'application/xml',
        'text/xml',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-tar',
        'application/gzip',
        'application/x-msdownload',
        'application/vnd.android.package-archive'
      ];

      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(exe|apk|txt|csv|json|xml|zip|rar|tar|gz)$/i)) {
        toast.error("File type not supported. Please select a valid document.");
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error("Document must be less than 50MB.");
        return;
      }

      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setDocumentPreview({
            name: file.name,
            size: file.size,
            type: file.type,
            data: reader.result
          });
          setIsUploading(false);
          toast.success("Document loaded");
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setIsUploading(false);
        toast.error("Failed to load document");
      }
    }
  };

  // --- Video Upload with auto-stop for max size ---
  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file.");
      return;
    }

    const maxSize = 25 * 1024 * 1024; // 25MB limit
    if (file.size > maxSize) {
      toast.error("Video must be less than 25MB.");
      return;
    }

    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    setShowUploadMenu(false);
    toast.success("Video loaded");
  };

  // --- Video Recording with auto-stop ---
  const startVideoRecording = async () => {
    // Use the modal version instead
    startVideoModal();
  };

  // --- Video Recording with Modal ---
  const startVideoRecordingInModal = async () => {
    if (!videoStream) {
      toast.error('Video camera not ready');
      return;
    }

    try {
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : MediaRecorder.isTypeSupported('video/webm')
        ? 'video/webm'
        : 'video/mp4';

      const recorder = new MediaRecorder(videoStream, { mimeType });
      const chunks = [];
      const maxSize = 25 * 1024 * 1024; // 25MB
      let currentSize = 0;
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          currentSize += e.data.size;
          
          // Auto-stop if approaching max size
          if (currentSize > maxSize * 0.9) {
            recorder.stop();
            toast.info('Recording stopped - maximum size reached');
          }
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setVideoPreview(url);
        setRecording(false);
        stopVideoModal();
        toast.success('Video recorded successfully!');
      };
      
      recorder.onerror = () => {
        toast.error('Recording failed. Please try again.');
        setRecording(false);
      };
      
      recorder.start(1000);
      setRecording(true);
      setMediaRecorder(recorder);
      setRecordedChunks(chunks);
      
      // Auto-stop after 2 minutes
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          toast.info('Recording stopped - maximum duration reached');
        }
      }, 120000);
      
    } catch (error) {
      console.error('Video recording error:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopVideoRecordingInModal = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  // --- Video Recording ---
  const handleStartRecording = async () => {
    setRecording(true);
    setVideoPreview(null);
    setRecordedChunks([]);
    setMediaRecorder(null);

    try {
      const constraints = {
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: { echoCancellation: true, noiseSuppression: true },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      let mimeType = "video/webm;codecs=vp8,opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/mp4";
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "";

      const recorder = new MediaRecorder(stream, { mimeType });
      setMediaRecorder(recorder);

      recorder.ondataavailable = (e) => e.data.size > 0 && setRecordedChunks((prev) => [...prev, e.data]);

      recorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: mimeType || "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoPreview(url);
        stream.getTracks().forEach((track) => track.stop());
        toast.success("Recording complete");
      };

      recorder.onerror = () => {
        toast.error("Recording failed. Please try again.");
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
      };

      recorder.start(1000);
    } catch (err) {
      console.error("Camera error:", err);
      setRecording(false);
      const errorMsg = {
        NotAllowedError: "Camera access denied.",
        NotFoundError: "No camera found.",
        NotSupportedError: "Camera not supported.",
      }[err.name] || "Could not access camera.";
      toast.error(errorMsg);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const handleSendVideo = async () => {
    if (!videoPreview) return;
    try {
      const res = await fetch(videoPreview);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = async () => {
        await sendMessage({ text: text.trim(), video: reader.result });
        setVideoPreview(null);
        setText("");
        toast.success("Video sent");
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      toast.error("Failed to send video");
    }
  };

  // --- Send Message ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Prevent spam clicking - return if already sending
    if (isSending || isUploading) {
      console.log('⚠️ Already sending/uploading, ignoring click');
      return;
    }
    
    if (!text.trim() && !imagePreview && !videoPreview && !documentPreview) return;

    try {
      // Set sending state to prevent spam
      setIsSending(true);
      setUploadError(null);
      
      // Store values before clearing (to prevent duplicate text issue)
      const messageText = text.trim();
      const messageImage = imagePreview;
      const messageDocument = documentPreview;
      
      // Clear input immediately for better UX
      setText("");
      setImagePreview(null);
      setVideoPreview(null);
      setDocumentPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (videoInputRef.current) videoInputRef.current.value = "";
      if (documentInputRef.current) documentInputRef.current.value = "";
      
      // Reset textarea height immediately
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      
      let videoBase64 = null;
      
      // Convert video blob URL to base64 if present
      if (videoPreview) {
        const res = await fetch(videoPreview);
        const blob = await res.blob();
        
        // Check video size before converting
        if (blob.size > 25 * 1024 * 1024) {
          setUploadError("Video file is too large. Please send a video under 25MB.");
          setIsSending(false);
          toast.error("Video file is too large (max 25MB)");
          return;
        }
        
        videoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }

      await sendMessage({
        text: messageText,
        image: messageImage,
        video: videoBase64,
        document: messageDocument,
      });

      // Close any open camera streams after sending
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
        setShowCameraModal(false);
      }
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        setVideoStream(null);
        setShowVideoModal(false);
      }

      toast.success("Message sent");
      setIsSending(false);
    } catch (error) {
      setIsSending(false);
      const errorMsg = error.response?.data?.message || error.message || "Failed to send message";
      setUploadError(errorMsg);
      toast.error(errorMsg);
      console.error("Send error:", error);
    }
  };

  return (
    <div className="p-4 w-full relative" data-message-input>
      {/* Upload Error Message */}
      {uploadError && (
        <div className="mb-3 p-3 bg-error/10 border border-error/30 rounded-lg flex items-start gap-2">
          <X className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-error font-medium">Upload Error</p>
            <p className="text-xs text-error/80 mt-1">{uploadError}</p>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="btn btn-xs btn-ghost text-error"
            aria-label="Dismiss error"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-primary/30"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-error text-white flex items-center justify-center"
              aria-label="Remove image"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Document Preview */}
      {documentPreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative bg-base-200 p-3 rounded-lg border border-primary/30 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium truncate max-w-48">{documentPreview.name}</p>
              <p className="text-xs text-base-content/60">
                {(documentPreview.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={removeDocument}
              className="w-5 h-5 rounded-full bg-error text-white flex items-center justify-center ml-2"
              aria-label="Remove document"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="flex items-center gap-3 p-3 bg-base-200/50 rounded-2xl border border-base-300/50 backdrop-blur-sm">
        {/* Plus Button with Upload Menu */}
        <div className="relative" ref={uploadMenuRef}>
          <button
            type="button"
            onClick={() => setShowUploadMenu(!showUploadMenu)}
            className={`btn btn-circle btn-sm border-0 ${showUploadMenu ? "bg-primary text-primary-content" : "bg-transparent text-base-content/60 hover:bg-base-300/50"}`}
            aria-label="Upload options"
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="loading loading-spinner loading-xs"></div>
            ) : (
              <Plus size={20} />
            )}
          </button>

          {/* Upload Menu */}
          {showUploadMenu && (
            <div className="absolute bottom-full mb-2 left-0 bg-base-100 border border-base-300 rounded-lg shadow-lg p-2 min-w-48 z-50">
              <div className="space-y-1">
                {/* Camera */}
                <button
                  type="button"
                  onClick={handleCameraCapture}
                  className="w-full flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg text-left"
                >
                  <Camera className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Camera</span>
                </button>

                {/* Gallery Photo */}
                <button
                  type="button"
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowUploadMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg text-left"
                >
                  <Image className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Gallery Photo</span>
                </button>

                {/* Gallery Video */}
                <button
                  type="button"
                  onClick={() => {
                    videoInputRef.current?.click();
                    setShowUploadMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg text-left"
                >
                  <Video className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">Gallery Video</span>
                </button>

                {/* Documents */}
                <button
                  type="button"
                  onClick={() => {
                    documentInputRef.current?.click();
                    setShowUploadMenu(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg text-left"
                >
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span className="text-sm">Document</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Field */}
        <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-3">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-0 outline-0 resize-none text-base-content placeholder-base-content/50 leading-6"
            style={{
              minHeight: "1.5rem",
              maxHeight: "8rem",
              overflowY: "auto",
            }}
            rows={1}
          />

          {/* Send Button */}
          <button
            type="submit"
            className={`btn btn-circle btn-sm border-0 ${
              isSending || isUploading
                ? "bg-primary/50 text-primary-content cursor-wait"
                : text.trim() || imagePreview || videoPreview || documentPreview
                ? "bg-primary text-primary-content hover:bg-primary/80"
                : "bg-transparent text-base-content/40 cursor-not-allowed"
            }`}
            disabled={!text.trim() && !imagePreview && !videoPreview && !documentPreview || isSending || isUploading}
            aria-label="Send message"
          >
            {isSending || isUploading ? (
              <div className="loading loading-spinner loading-xs"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </form>

        {/* Hidden Inputs */}
        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
        <input type="file" accept="video/*" className="hidden" ref={videoInputRef} onChange={handleVideoChange} />
        <input 
          type="file" 
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json,.xml,.zip,.rar,.tar,.gz,.exe,.apk" 
          className="hidden" 
          ref={documentInputRef} 
          onChange={handleDocumentChange} 
        />
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleImageChange} />
      </div>

      {/* Video Preview */}
      {videoPreview && (
        <div className="mt-3 flex flex-col items-start gap-2">
          <video src={videoPreview} controls className="w-40 rounded-lg border border-primary/30" />
          {recording ? (
            <button className="btn btn-error btn-xs gap-1" onClick={handleStopRecording}>
              <X size={12} />
              Stop
            </button>
          ) : (
            <button className="btn btn-primary btn-xs gap-1" onClick={handleSendVideo}>
              <Send size={12} />
              Send
            </button>
          )}
        </div>
      )}



      {/* Apple-style Photo Editor */}
      {showPhotoEditor && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Editor Header */}
          <div className="flex justify-between items-center p-4 bg-black bg-opacity-40 backdrop-blur-md">
            <AppleTooltip tooltip="Close Editor">
              <button
                onClick={closePhotoEditor}
                className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-all duration-200"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </AppleTooltip>

            <div className="flex items-center gap-2">
              <AppleTooltip tooltip="Undo">
                <button
                  onClick={undoEdit}
                  disabled={editHistoryIndex <= 0}
                  className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 flex items-center justify-center transition-all duration-200"
                >
                  <Undo className="w-4 h-4 text-white" />
                </button>
              </AppleTooltip>

              <AppleTooltip tooltip="Redo">
                <button
                  onClick={redoEdit}
                  disabled={editHistoryIndex >= editHistory.length - 1}
                  className="w-10 h-10 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 flex items-center justify-center transition-all duration-200"
                >
                  <Redo className="w-4 h-4 text-white" />
                </button>
              </AppleTooltip>
            </div>

            <AppleTooltip tooltip="Save & Use Photo">
              <button
                onClick={saveEditedPhoto}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white font-semibold transition-all duration-200"
              >
                Done
              </button>
            </AppleTooltip>
          </div>

          {/* Photo Canvas */}
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="relative max-w-full max-h-full">
              <img
                ref={editImageRef}
                src={editingPhoto}
                alt="Editing"
                className="max-w-full max-h-full object-contain"
                onLoad={() => {
                  if (editCanvasRef.current && editImageRef.current) {
                    const canvas = editCanvasRef.current;
                    const img = editImageRef.current;
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                  }
                }}
              />
              <canvas
                ref={editCanvasRef}
                className="hidden"
              />
            </div>
          </div>

          {/* Editing Tools Bar */}
          <div className="p-4 bg-black bg-opacity-40 backdrop-blur-md">
            <div className="flex justify-center items-center gap-2 overflow-x-auto pb-2">
              {/* Crop Tool */}
              <AppleTooltip tooltip="Crop" position="top">
                <button
                  onClick={() => setEditTool(editTool === 'crop' ? null : 'crop')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    editTool === 'crop' 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  <Crop className="w-5 h-5" />
                </button>
              </AppleTooltip>

              {/* Brush Tool */}
              <AppleTooltip tooltip="Draw" position="top">
                <button
                  onClick={() => setEditTool(editTool === 'brush' ? null : 'brush')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    editTool === 'brush' 
                      ? 'bg-red-500 text-white shadow-lg' 
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  <Brush className="w-5 h-5" />
                </button>
              </AppleTooltip>

              {/* Text Tool */}
              <AppleTooltip tooltip="Add Text" position="top">
                <button
                  onClick={() => setEditTool(editTool === 'text' ? null : 'text')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    editTool === 'text' 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  <Type className="w-5 h-5" />
                </button>
              </AppleTooltip>

              {/* Shapes Tool */}
              <AppleTooltip tooltip="Shapes" position="top">
                <button
                  onClick={() => setEditTool(editTool === 'shapes' ? null : 'shapes')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    editTool === 'shapes' 
                      ? 'bg-purple-500 text-white shadow-lg' 
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  <Square className="w-5 h-5" />
                </button>
              </AppleTooltip>

              {/* Stickers/Emoji Tool */}
              <AppleTooltip tooltip="Stickers" position="top">
                <button
                  onClick={() => setEditTool(editTool === 'stickers' ? null : 'stickers')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    editTool === 'stickers' 
                      ? 'bg-yellow-500 text-black shadow-lg' 
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  <Smile className="w-5 h-5" />
                </button>
              </AppleTooltip>

              {/* Filters Tool */}
              <AppleTooltip tooltip="Filters" position="top">
                <button
                  onClick={() => setEditTool(editTool === 'filters' ? null : 'filters')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    editTool === 'filters' 
                      ? 'bg-pink-500 text-white shadow-lg' 
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  <Palette className="w-5 h-5" />
                </button>
              </AppleTooltip>

              {/* More Tools */}
              <AppleTooltip tooltip="More Tools" position="top">
                <button
                  onClick={() => setEditTool(editTool === 'more' ? null : 'more')}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    editTool === 'more' 
                      ? 'bg-gray-500 text-white shadow-lg' 
                      : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                  }`}
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </AppleTooltip>
            </div>

            {/* Tool Options Panel */}
            {editTool && (
              <div className="mt-4 p-4 bg-black bg-opacity-60 rounded-lg">
                {editTool === 'brush' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm">Size:</span>
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={brushSize}
                        onChange={(e) => setBrushSize(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-white text-sm w-8">{brushSize}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm">Color:</span>
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-8 h-8 rounded border-none"
                      />
                      <div className="flex gap-2">
                        {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff', '#000000'].map(color => (
                          <button
                            key={color}
                            onClick={() => setBrushColor(color)}
                            className="w-6 h-6 rounded-full border-2 border-white"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {editTool === 'text' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Enter text..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="w-full p-2 bg-white bg-opacity-20 text-white placeholder-gray-300 rounded border-none"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm">Size:</span>
                      <input
                        type="range"
                        min="12"
                        max="72"
                        value={textSize}
                        onChange={(e) => setTextSize(e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-white text-sm w-8">{textSize}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white text-sm">Color:</span>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-8 h-8 rounded border-none"
                      />
                    </div>
                  </div>
                )}

                {editTool === 'filters' && (
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      onClick={() => applyFilter('none')}
                      className="p-2 bg-white bg-opacity-20 text-white rounded text-sm hover:bg-opacity-30"
                    >
                      Original
                    </button>
                    <button
                      onClick={() => applyFilter('grayscale')}
                      className="p-2 bg-white bg-opacity-20 text-white rounded text-sm hover:bg-opacity-30"
                    >
                      B&W
                    </button>
                    <button
                      onClick={() => applyFilter('sepia')}
                      className="p-2 bg-white bg-opacity-20 text-white rounded text-sm hover:bg-opacity-30"
                    >
                      Sepia
                    </button>
                    <button
                      onClick={() => applyFilter('blur')}
                      className="p-2 bg-white bg-opacity-20 text-white rounded text-sm hover:bg-opacity-30"
                    >
                      Blur
                    </button>
                  </div>
                )}

                {editTool === 'stickers' && (
                  <div className="grid grid-cols-8 gap-2">
                    {['😀', '😂', '😍', '🤔', '😎', '😢', '😡', '🤯', '❤️', '👍', '👎', '🔥', '💯', '⭐', '✨', '🎉'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => {
                          // Add emoji to photo logic here
                          toast.success(`Added ${emoji} to photo`);
                        }}
                        className="p-2 text-2xl hover:bg-white hover:bg-opacity-20 rounded transition-all duration-200"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageInput;