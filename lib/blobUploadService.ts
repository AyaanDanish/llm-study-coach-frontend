// Blob upload service for handling large file uploads via Vercel Blob
import config from './config';

export interface BlobUploadResult {
  success: boolean;
  blob_url?: string;
  filename?: string;
  error?: string;
}

export interface ProcessResult {
  success: boolean;
  content?: string;
  content_hash?: string;
  model_used?: string;
  generated_at?: string;
  error?: string;
}

export class BlobUploadService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl;
  }

  private getHeaders(userId: string) {
    return {
      'X-User-ID': userId,
    };
  }

  private getJsonHeaders(userId: string) {
    return {
      'Content-Type': 'application/json',
      'X-User-ID': userId,
    };
  }

  /**
   * Upload file to Vercel Blob storage
   * This is the first step for large file uploads
   */
  async uploadFileToBlob(file: File, userId: string): Promise<BlobUploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/api/upload-to-blob`, {
        method: 'POST',
        headers: this.getHeaders(userId),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        blob_url: result.blob_url,
        filename: result.filename,
      };
    } catch (error: any) {
      console.error('Blob upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload file to blob storage',
      };
    }
  }

  /**
   * Generate content hash from blob URL
   * This is used to check if notes already exist for this content
   */
  async generateHashFromBlob(blobUrl: string, userId: string): Promise<{ success: boolean; content_hash?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate-hash-from-blob`, {
        method: 'POST',
        headers: this.getJsonHeaders(userId),
        body: JSON.stringify({ blob_url: blobUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Hash generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        content_hash: result.content_hash,
      };
    } catch (error: any) {
      console.error('Hash generation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate content hash',
      };
    }
  }

  /**
   * Process PDF from blob URL and generate study notes
   * This is the final step that creates the actual notes
   */
  async processPdfFromBlob(
    blobUrl: string,
    subject: string,
    contentHash: string,
    userId: string
  ): Promise<ProcessResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/process-pdf-from-blob`, {
        method: 'POST',
        headers: this.getJsonHeaders(userId),
        body: JSON.stringify({
          blob_url: blobUrl,
          subject: subject,
          content_hash: contentHash,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `PDF processing failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        content: result.content,
        content_hash: result.content_hash,
        model_used: result.model_used,
        generated_at: result.generated_at,
      };
    } catch (error: any) {
      console.error('PDF processing error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process PDF',
      };
    }
  }

  /**
   * Complete workflow: Upload -> Hash -> Process
   * This is a convenience method that handles the entire blob upload workflow
   */
  async processFileWithBlob(file: File, subject: string, userId: string): Promise<ProcessResult & { blob_url?: string }> {
    try {
      console.log('Starting blob upload workflow...');

      // Step 1: Upload to blob
      console.log('Step 1: Uploading to blob storage...');
      const uploadResult = await this.uploadFileToBlob(file, userId);
      if (!uploadResult.success || !uploadResult.blob_url) {
        return {
          success: false,
          error: uploadResult.error || 'Failed to upload file',
        };
      }

      // Step 2: Generate hash
      console.log('Step 2: Generating content hash...');
      const hashResult = await this.generateHashFromBlob(uploadResult.blob_url, userId);
      if (!hashResult.success || !hashResult.content_hash) {
        return {
          success: false,
          error: hashResult.error || 'Failed to generate content hash',
        };
      }

      // Step 3: Process PDF
      console.log('Step 3: Processing PDF...');
      const processResult = await this.processPdfFromBlob(
        uploadResult.blob_url,
        subject,
        hashResult.content_hash,
        userId
      );

      if (!processResult.success) {
        return {
          success: false,
          error: processResult.error || 'Failed to process PDF',
        };
      }

      return {
        success: true,
        blob_url: uploadResult.blob_url,
        content: processResult.content,
        content_hash: processResult.content_hash,
        model_used: processResult.model_used,
        generated_at: processResult.generated_at,
      };
    } catch (error: any) {
      console.error('Complete workflow error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process file',
      };
    }
  }

  /**
   * Check if the backend supports blob uploads
   */
  async checkBlobSupport(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      if (response.ok) {
        const health = await response.json();
        return health.blob_configured === true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Determine the best upload method based on file size and blob support
   */
  shouldUseBlobUpload(fileSize: number): boolean {
    const maxDirectUploadSize = 4 * 1024 * 1024; // 4MB threshold
    return fileSize > maxDirectUploadSize;
  }
}

// Export a singleton instance
export const blobUploadService = new BlobUploadService();
