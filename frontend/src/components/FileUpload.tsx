import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Alert,
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import { CloudUpload, Download } from 'lucide-react';
import { FileService, UploadConfig } from '../services/file.service';

interface UploadedFile {
  key: string;
  originalname: string;
  size: number;
  mimetype?: string; // Added mimetype based on usage in handleFileSelect
}

interface FileUploadProps {
  files: UploadedFile[];
  uploadConfig: UploadConfig | null;
  loading: boolean;
  error?: string | null; // Renamed from globalError to error to match original component's local error state
  onFilesChange: (files: UploadedFile[]) => void;
  onRefresh?: () => void; // Optional refresh function
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  uploadConfig,
  loading: parentLoading, // Renamed to avoid conflict with internal uploading state
  error: globalError,
  onFilesChange,
  onRefresh
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Local error state
  const [success, setSuccess] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const fileService = useMemo(() => new FileService(), []);

  // Local error state for this component, separate from globalError
  // The original component had local error state, so we maintain that.
  // The globalError from props is also displayed.

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!uploadConfig) {
      setError('Configurazione di upload non disponibile. Impossibile procedere con l\'upload.');
      return;
    }

    setUploading(true);
    setError(null); // Clear local error
    setSuccess(null);

    try {
      // Validate file on client side
      fileService.validateFile(file, uploadConfig);
      const result = await fileService.uploadFile(file);

      const newFile: UploadedFile = {
        key: result.key,
        originalname: result.originalname,
        size: result.size,
        mimetype: result.mimetype,
      };

      onFilesChange([...files, newFile]);
      setSuccess(`File "${result.originalname}" uploaded successfully!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      // Optionally, clear the success message if an error occurs
      setSuccess(null);
    } finally {
      setUploading(false);
      // Reset input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleDownload = (key: string, filename: string) => {
    try {
      const downloadUrl = fileService.getDownloadUrl(key);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to initiate download.');
      console.error('Download error:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileExtension = (filename: string | undefined): string => {
    if (!filename || typeof filename !== 'string') return 'Unknown';
    const ext = filename.split('.').pop();
    return ext ? ext.toUpperCase() : 'Unknown';
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h5" component="h1" gutterBottom>
          File Upload & Download
        </Typography>

        {/* Display configError if it exists */}
        {configError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Errore di Configurazione:</strong> {configError}
            </Typography>
          </Alert>
        )}

        {/* Display globalError from props if it exists and no local error */}
        {globalError && !error && !configError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Errore:</strong> {globalError}
            </Typography>
          </Alert>
        )}

        {/* Display uploadConfig information */}
        {uploadConfig && !configError && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>Upload Restrictions:</strong> Max size: {(uploadConfig.maxFileSize / (1024 * 1024))}MB |
              Allowed extensions: {uploadConfig.allowedExtensions.join(', ')}
            </Typography>
          </Alert>
        )}

        {/* Display local success message */}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {/* Display local error message */}
        {error && !configError && !globalError && ( // Only show local error if it's the primary error
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}


        <Box sx={{ mb: 3 }}>
          <input
            accept="*"
            style={{ display: 'none' }}
            id="file-upload-input"
            type="file"
            onChange={handleFileSelect}
            disabled={uploading || parentLoading}
          />
          <label htmlFor="file-upload-input">
            <Button
              variant="contained"
              component="span"
              disabled={uploading || parentLoading || !uploadConfig || !!configError || !!globalError}
              startIcon={<CloudUpload size={20} />}
              size="large"
              fullWidth
            >
              {uploading ? 'Uploading...' : configError || globalError ? 'Upload Non Disponibile' : 'Choose File to Upload'}
            </Button>
          </label>

          {uploading && <LinearProgress sx={{ mt: 2 }} />}
        </Box>

        {files.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Uploaded Files ({files.length})
            </Typography>

            <Stack spacing={1}>
              {files.map((file) => (
                <Card key={file.key} variant="outlined">
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                          {file.originalname}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                          <Chip label={formatFileSize(file.size)} size="small" />
                          <Chip label={getFileExtension(file.originalname)} size="small" variant="outlined" />
                        </Box>
                      </Box>

                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleDownload(file.key, file.originalname)}
                          title="Download"
                          aria-label="Download file"
                        >
                          <Download size={18} />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};