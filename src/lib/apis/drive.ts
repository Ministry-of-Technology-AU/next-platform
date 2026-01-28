import { google } from 'googleapis';
import { Readable } from 'stream';

// Google Drive OAuth2 Configuration
const DRIVE_CLIENT_ID = process.env.DRIVE_CLIENT_ID;
const DRIVE_CLIENT_SECRET = process.env.DRIVE_CLIENT_SECRET;
const DRIVE_REDIRECT_URI = "https://developers.google.com/oauthplayground";
const DRIVE_REFRESH_TOKEN = process.env.DRIVE_REFRESH_TOKEN;

const oauth2Client = new google.auth.OAuth2(
  DRIVE_CLIENT_ID,
  DRIVE_CLIENT_SECRET,
  DRIVE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: DRIVE_REFRESH_TOKEN,
});

// Initialize Google Drive API
const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});

export interface DriveFile {
    filename: string;
    content: Buffer;
    contentType: string;
}

export interface UploadedFile {
    id: string;
    name: string;
    webViewLink: string;
    webContentLink: string;
}

/**
 * Upload a file to Google Drive
 */
export async function uploadToDrive(file: DriveFile): Promise<UploadedFile> {
    try {
        // Convert Buffer to Stream for Google Drive API
        const bufferStream = new Readable();
        bufferStream.push(file.content);
        bufferStream.push(null); // End the stream
        
        const response = await drive.files.create({
            requestBody: {
                name: file.filename,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID!],
            },
            media: {
                mimeType: file.contentType,
                body: bufferStream,
            },
        });

        // Make the file publicly accessible
        await drive.permissions.create({
            fileId: response.data.id!,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });

        // Get file links
        const fileData = await drive.files.get({
            fileId: response.data.id!,
            fields: 'webViewLink, webContentLink, name',
        });

        return {
            id: response.data.id!,
            name: fileData.data.name!,
            webViewLink: fileData.data.webViewLink!,
            webContentLink: fileData.data.webContentLink!,
        };
    } catch (error) {
        throw new Error(`Failed to upload file to Drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Extract file IDs from Google Drive links
 */
export function extractFileIds(attachmentPath: string): string[] {
    if (!attachmentPath) return [];

    const links = attachmentPath.split(',');

    return links
        .map((link) => {
            // Extract file ID from various forms of Google Drive links
            const patterns = [
                /\/file\/d\/([^\/]+)/, // matches /file/d/{fileId}
                /id=([^&]+)/, // matches id={fileId}
                /\/([^\/]+)\/view/, // matches /{fileId}/view
            ];

            for (const pattern of patterns) {
                const match = link.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }

            console.warn(`Could not extract file ID from link: ${link}`);
            return null;
        })
        .filter((id): id is string => id !== null);
}

/**
 * Download file from Google Drive
 */
export async function downloadFromDrive(fileId: string): Promise<DriveFile> {
    try {
        // Get file metadata
        const fileMetadata = await drive.files.get({
            fileId: fileId,
            fields: 'name, mimeType',
        });

        // Get file content
        const response = await drive.files.get(
            { fileId: fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        // Convert stream to buffer
        const buffers: Buffer[] = [];
        for await (const chunk of response.data) {
            buffers.push(chunk);
        }
        const fileBuffer = Buffer.concat(buffers);

        return {
            filename: fileMetadata.data.name!,
            content: fileBuffer,
            contentType: fileMetadata.data.mimeType!,
        };
    } catch (error) {
        throw new Error(`Failed to download file from Drive: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Delete file from Google Drive
 */
export async function deleteFromDrive(fileId: string): Promise<void> {
    try {
        await drive.files.delete({ fileId });
        console.log(`File ${fileId} deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting file ${fileId}:`, error instanceof Error ? error.message : 'Unknown error');
        throw error;
    }
}

/**
 * Get file attachments for email from Drive
 */
export async function getEmailAttachments(attachmentPath: string): Promise<DriveFile[]> {
    if (!attachmentPath) return [];

    const attachmentIds = extractFileIds(attachmentPath);
    
    const attachments = await Promise.all(
        attachmentIds.map(async (fileId) => {
            try {
                return await downloadFromDrive(fileId);
            } catch (error) {
                console.error(`Error fetching attachment ${fileId}:`, error instanceof Error ? error.message : 'Unknown error');
                return null;
            }
        })
    );

    // Filter out any null attachments (failed downloads)
    return attachments.filter((attachment): attachment is DriveFile => attachment !== null);
}

/**
 * Get public embed link from Drive file ID
 * Returns a URL that can be used directly in HTML img src
 */
export function getPublicEmbedLink(fileId: string): string {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

/**
 * Upload image file to Drive and return public embed link
 */
export async function uploadImageAndGetEmbedLink(
    file: File | Buffer,
    filename: string
): Promise<string> {
    try {
        // Convert File to Buffer if needed
        let buffer: Buffer;
        if (file instanceof File) {
            const arrayBuffer = await file.arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
        } else {
            buffer = file;
        }

        const driveFile: DriveFile = {
            filename,
            content: buffer,
            contentType: file instanceof File ? file.type : 'image/jpeg',
        };

        const uploadedFile = await uploadToDrive(driveFile);
        return getPublicEmbedLink(uploadedFile.id);
    } catch (error) {
        throw new Error(`Failed to upload image and get embed link: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export { drive };
