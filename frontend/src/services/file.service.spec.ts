import { FileService, UploadConfig } from './file.service';

// Mock fetch globally
global.fetch = jest.fn();

describe('FileService', () => {
  let fileService: FileService;
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    fileService = new FileService();
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUploadConfig', () => {
    it('should fetch the upload configuration successfully', async () => {
      const mockConfig: UploadConfig = {
        maxFileSize: 10485760,
        allowedExtensions: ['PDF', 'JPG', 'JPEG', 'PNG', 'DOC', 'DOCX']
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockConfig,
      } as Response);

      const config = await fileService.getUploadConfig();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/files/config');
      expect(config).toEqual(mockConfig);
      expect(config.maxFileSize).toBe(10485760);
      expect(config.allowedExtensions).toContain('PDF');
    });
  });

  describe('validateFile', () => {
    const uploadConfig: UploadConfig = {
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedExtensions: ['PDF', 'JPG', 'JPEG', 'PNG', 'DOC', 'DOCX']
    };

    it('should validate a valid file correctly', () => {
      const file = new File([''], 'document.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 5 * 1024 * 1024 }); // 5MB

      expect(() => fileService.validateFile(file, uploadConfig)).not.toThrow();
    });

    it('should throw error for file size exceeding limit', () => {
      const file = new File([''], 'large-file.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 15 * 1024 * 1024 }); // 15MB

      expect(() => fileService.validateFile(file, uploadConfig)).toThrow('File size exceeds maximum allowed size of 10MB');
    });

    it('should throw error for disallowed file extension', () => {
      const file = new File([''], 'script.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: 1024 }); // 1KB

      expect(() => fileService.validateFile(file, uploadConfig)).toThrow('File extension not allowed. Allowed extensions: PDF, JPG, JPEG, PNG, DOC, DOCX');
    });
  });

  describe('getFiles', () => {
    it('should fetch list of files successfully', async () => {
      const mockFiles = [
        {
          key: 'test-key-1',
          originalname: 'document.pdf',
          size: 1024
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFiles,
      } as Response);

      const files = await fileService.getFiles();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/files');
      expect(Array.isArray(files)).toBe(true);
      expect(files).toHaveLength(1);
      expect(files[0]).toHaveProperty('key');
      expect(files[0]).toHaveProperty('originalname');
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const mockResponse = {
        key: 'uploaded-file-key',
        originalname: 'test.pdf',
        size: 1024,
        mimetype: 'application/pdf'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      const result = await fileService.uploadFile(file);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/files', {
        method: 'POST',
        body: expect.any(FormData),
      });
      expect(result).toEqual(mockResponse);
    });
  });
});