import { StreamChat } from 'stream-chat';
import { STREAM_CONFIG } from './config.js';
import multer from 'multer';
import path from 'path';

// Initialize Stream Chat server client
const serverClient = StreamChat.getInstance(STREAM_CONFIG.api_key, STREAM_CONFIG.api_secret);

// Configure multer for temporary file handling
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow images, videos, audio files, and documents
  const allowedTypes = [
    'image/', 'video/', 'audio/', 
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Only image, video, audio, and document files are allowed'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

// Upload file to Stream.io CDN
export const uploadFileToStream = async (file, userId) => {
  try {
    // Stream.io user IDs must be alphanumeric, underscore, dash only, 1-64 chars
    const streamUserId = userId.toString().replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 64);
    
    console.log(`Converting userId ${userId} to streamUserId: ${streamUserId}`);
    
    // Ensure user exists in Stream with proper format
    await serverClient.upsertUser({
      id: streamUserId,
      name: `User_${streamUserId}`,
    });

    // Use direct file upload API instead of channel-based upload
    const formData = new FormData();
    formData.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
    
    // Use Stream's direct file upload endpoint
    const uploadResponse = await serverClient.post(`files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: {
        user_id: streamUserId,
      },
    });

    console.log(`File uploaded to Stream CDN: ${uploadResult.file}`);

    // Clean up the temporary channel
    try {
      await channel.delete();
    } catch (deleteError) {
      console.warn('Could not delete temporary channel:', deleteError.message);
    }

    return {
      url: uploadResult.file,
      name: file.originalname,
      type: file.mimetype,
      size: file.size
    };
  } catch (error) {
    console.error('Error uploading file to Stream:', error);
    
    // Fallback: save locally if Stream fails
    const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${file.originalname}`;
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const uploadsDir = path.join(__dirname, '../../uploads');
    const filePath = path.join(uploadsDir, filename);
    
    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Write file to local storage
    fs.writeFileSync(filePath, file.buffer);
    
    console.log(`Fallback: File saved locally as ${filename}`);
    
    return {
      url: `/uploads/${filename}`,
      name: file.originalname,
      type: file.mimetype,
      size: file.size
    };
  }
};

// Generate Stream user token
export const generateStreamToken = (userId) => {
  return serverClient.createToken(userId);
};

// Create or update Stream user
export const createStreamUser = async (userId, userData) => {
  try {
    await serverClient.upsertUser({
      id: userId,
      name: userData.fullName,
      image: userData.profilePic || '/avatar.png',
    });
    return generateStreamToken(userId);
  } catch (error) {
    console.error('Error creating Stream user:', error);
    throw error;
  }
};
