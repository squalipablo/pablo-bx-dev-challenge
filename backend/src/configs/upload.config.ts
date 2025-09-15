
export interface UploadConfig {
  maxFileSize: number; // in bytes
  allowedExtensions: string[];
}

function getUploadConfig(): { uploadConfig: UploadConfig } {
  const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);
  
  if (isNaN(maxFileSizeMB) || maxFileSizeMB <= 0) {
    throw new Error('Invalid MAX_FILE_SIZE_MB configuration. Must be a positive number.');
  }
  
  const allowedExtensionsEnv = process.env.ALLOWED_EXTENSIONS;
  if (!allowedExtensionsEnv || allowedExtensionsEnv.trim() === '') {
    throw new Error('ALLOWED_EXTENSIONS configuration is missing or empty. Upload configuration cannot be loaded.');
  }
  
  const allowedExtensions = allowedExtensionsEnv
    .split(',')
    .map(ext => ext.trim().toLowerCase())
    .filter(ext => ext.length > 0);
    
  if (allowedExtensions.length === 0) {
    throw new Error('No valid file extensions found in ALLOWED_EXTENSIONS configuration.');
  }

  return {
    uploadConfig: {
      maxFileSize: maxFileSizeMB * 1024 * 1024, // Convert MB to bytes
      allowedExtensions,
    },
  };
}

export default getUploadConfig;
