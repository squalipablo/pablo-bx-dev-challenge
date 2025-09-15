
interface FileUploadResponse {
  key: string;
  bucket: string;
  size: number;
  originalname: string;
}

export interface UploadConfig {
  maxFileSize: number;
  allowedExtensions: string[];
}

export class FileService {
  private readonly apiUrl = '/api/v1';

  async getUploadConfig(): Promise<UploadConfig> {
    console.log('FileService: Fetching upload config from:', `${this.apiUrl}/files/config`);
    const response = await fetch(`${this.apiUrl}/files/config`);
    console.log('FileService: Upload config response status:', response.status);
    if (!response.ok) {
      console.error('FileService: Failed to fetch upload config - status:', response.status, 'statusText:', response.statusText);
      throw new Error('Failed to fetch upload configuration');
    }
    const data = await response.json();
    console.log('FileService: Upload config data:', data);
    return data;
  }

  validateFile(file: File, config: UploadConfig): void {
    // Validate file size
    if (file.size > config.maxFileSize) {
      const maxFileSizeMB = config.maxFileSize / (1024 * 1024);
      throw new Error(`File size exceeds maximum allowed size of ${maxFileSizeMB}MB`);
    }

    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toUpperCase();
    if (!fileExtension || !config.allowedExtensions.includes(fileExtension)) {
      throw new Error(`File extension not allowed. Allowed extensions: ${config.allowedExtensions.join(', ')}`);
    }
  }

  async getFiles(): Promise<Array<{
    key: string;
    originalname: string;
    size: number;
  }>> {
    console.log('FileService: Fetching files from:', '/api/v1/files');
    const response = await fetch('/api/v1/files');
    console.log('FileService: Files response status:', response.status);
    if (!response.ok) {
      console.error('FileService: Failed to fetch files - status:', response.status, 'statusText:', response.statusText);
      try {
        const errorData = await response.text();
        console.error('FileService: Error response body:', errorData);
      } catch (e) {
        console.error('FileService: Could not read error response body');
      }
      throw new Error('Failed to fetch files');
    }
    const data = await response.json();
    console.log('FileService: Files data:', data);
    return data;
  }

  async uploadFile(file: File): Promise<{
    key: string;
    originalname: string;
    size: number;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/v1/files', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Upload failed: ${response.status}`);
    }

    return response.json();
  }

  getDownloadUrl(key: string): string {
    return `/api/v1/files/${encodeURIComponent(key)}/download`;
  }
}
