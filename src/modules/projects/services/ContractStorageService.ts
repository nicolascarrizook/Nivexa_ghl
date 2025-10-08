import { supabase } from '@/config/supabase';
import type { ProjectFormData } from '../types/project.types';
import { contractPdfService } from './ContractPdfService';

class ContractStorageService {
  private readonly BUCKET_NAME = 'project-contracts';

  /**
   * Ensure the contracts bucket exists
   */
  private async ensureBucketExists(): Promise<void> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);

      if (!bucketExists) {
        await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      throw error;
    }
  }

  /**
   * Upload contract PDF to Supabase Storage
   */
  async uploadContract(
    projectId: string,
    formData: ProjectFormData
  ): Promise<{ path: string; url: string }> {
    try {
      // Ensure bucket exists
      await this.ensureBucketExists();

      // Generate PDF blob
      const pdfBlob = await contractPdfService.generatePDF(formData);

      // Create file path: contracts/{projectId}/contract-signed.pdf
      const fileName = `contract-${Date.now()}.pdf`;
      const filePath = `${projectId}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL (even though bucket is private, we'll use signed URLs)
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        path: filePath,
        url: urlData.publicUrl,
      };
    } catch (error) {
      console.error('Error uploading contract:', error);
      throw error;
    }
  }

  /**
   * Get a signed URL for accessing the contract
   * @param filePath - The path to the contract file
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   */
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        throw error;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  }

  /**
   * Download contract from storage
   */
  async downloadContract(filePath: string): Promise<Blob> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .download(filePath);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error downloading contract:', error);
      throw error;
    }
  }

  /**
   * Delete contract from storage
   */
  async deleteContract(filePath: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }

  /**
   * List all contracts for a project
   */
  async listProjectContracts(projectId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(projectId);

      if (error) {
        throw error;
      }

      return data?.map(file => `${projectId}/${file.name}`) || [];
    } catch (error) {
      console.error('Error listing contracts:', error);
      throw error;
    }
  }
}

export const contractStorageService = new ContractStorageService();
