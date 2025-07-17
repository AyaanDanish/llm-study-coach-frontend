// Simple test to verify blob upload service
// Run this in the browser console to test the blob functionality

import { blobUploadService } from './blobUploadService';

async function testBlobUpload() {
  console.log("🧪 Testing Blob Upload Service...");
  
  // Check if blob support is available
  const blobSupported = await blobUploadService.checkBlobSupport();
  console.log("Blob support:", blobSupported ? "✅ Available" : "❌ Not available");
  
  // Test file size threshold
  const smallFile = 2 * 1024 * 1024; // 2MB
  const largeFile = 6 * 1024 * 1024; // 6MB
  
  console.log("Small file (2MB) should use blob:", blobUploadService.shouldUseBlobUpload(smallFile));
  console.log("Large file (6MB) should use blob:", blobUploadService.shouldUseBlobUpload(largeFile));
  
  return {
    blobSupported,
    smallFileUsesBlob: blobUploadService.shouldUseBlobUpload(smallFile),
    largeFileUsesBlob: blobUploadService.shouldUseBlobUpload(largeFile)
  };
}

// Export for browser testing
if (typeof window !== 'undefined') {
  (window as any).testBlobUpload = testBlobUpload;
  console.log("💡 Test function available: window.testBlobUpload()");
}

export { testBlobUpload };
