import { google } from 'googleapis';

// Google Service Account Credentials
const credentials = {
  type: "service_account",
  project_id: "vapi-bot-manager",
  private_key_id: "6333b51ca9665f716cbaadc3a92bbe7cbdd11bbe",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCjjZrcQvN0xjCf\nvA+V4OJUMlNJ7A+aWsKQ+A6jHuDgcSuS3w3OFIX/6DJioljtzFkVxKBGBptrP31k\nN6w7S2ChhZ/5NXeGUf1DX6IuBawtbVc0MYYa5xr9a1qmpDisMSjvHmI1KUUiMsdm\nAx0C7f+RoeUa9p118e9ct2mEJOTcP6icW4db5zjRSEchPDYDyJTkJSrYDbQv+O4t\nApFYH+0cXyiyYZMCNGUgC49PHKvINmEWJuWS41n047IFz0vFOKUQFFkgKPnLR5oF\n/6UnommS7N/SUJU9QcmRpc+cxBMvacAQDQ+mNNw6Z27fBmlhHbt1nlq3BnIwAyvk\nlHvrT7pdAgMBAAECggEAClMBCJBtX9y26w5rCXIFt3zpxwvQvFSoXZBbFC750REz\nx/SuoWioQMw+if1nkbNJmFcuKt116CI83xuokqGieu+9dnTKk78PNraNvUv8X228\niH3r0jzudjrVoRlSvoPn6phHaMWvKIZ+EdF2fl3ZuS64EKiqrexUyMyHK6FMlR6R\nt4PIMiCEmTAUEReUqc/0n2lwdZh2MXVtpFSrBqdCUjopBZEXxKTdgHPx+hKgUn9h\nrIZsIbMNM0lSkSEsCoqIlO5e5KEU5YdIRpK0DOwWjMC3ssue6x+CdiBXG3YD4L4X\n9TVlIlWZU4V7PNzmEOYQApNteWCb+B0Y/Ja+IOOHgQKBgQDbfsR+Esj5SEAVXbUC\nI4JC5YeDB0uA3aNRwtmrK84swcTosXQpDK0za7YSb/Iqsni9CEWr7uVFnbqCcytW\n1RE1n7w8iyOn007cojAwdl26kn+fc74yK/D2/U1j3IeUBnZbU0fwWbuWfRLGa/j2\naKkV1t3BKBwYjjlwFt3Er8s/IQKBgQC+wQwxswN4i6anosDUH1rGneSESzmkoUFu\ng6KodVIfzjpCAC2AYEt4agywinnfYh6os3deY990a4yTPAYWvh50e/sN2sMDd19p\nbUeHCEOKYNH3EjEBMDrBxT5K920dJ/Zh30cM4AN5B/h4iFS9bOgvBHT6iYbTHugM\ng+gtA5k/vQKBgGUkUfjiQReVcmomBv2YTTL0P3BiUSlteA954QFeKyA2nby34JX1\n0G3MaVavnQCNwtMgV7J1X9KnbsUjusnFXqu+Emg3mVOBLGrAlcIPGPua/BIGrJLD\n6sJ1UE7+1L6iB7Hne1PGlYkv0xH5uPwamCeHHiIekGvERbVf5Ar5EofhAoGASPF/\nXT3sNNuKNg5pmHQI/WyBZwlxGIBFiiIyQCLk7Z6p7nUs8SthkMFU6ul5Iy/dM3u1\nSNX+LAG4dtD8LxQyhy6l2S1vZ1LtnF4afQtu8GqHv+gn7yFnRpPLd1VYV07hy5lb\nDRRYn56pqEXRycHso5YbuXZ/pRnreGW0kgoPPy0CgYEAiiH0OcOiccszDfgJYREp\nHcRjZbSzxI7cimqfSHd6sDXU7ZBDfMQTxSUe9nFXaDl9h4re1NBnGBJybDlLnyv7\nfE8wTtiAlVjZ99wrhhniK0ahZ2qjTZ5f7HwpWk1XHeXW8Wrhq73ePXrDUF1DT3aR\nfaQDgOXbEGqXw7a9IGA6z2o=\n-----END PRIVATE KEY-----\n",
  client_email: "vapi-bot-manager@vapi-bot-manager.iam.gserviceaccount.com",
  client_id: "114785735774098127008",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/vapi-bot-manager%40vapi-bot-manager.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

// Google Sheets and Drive configuration
const GOOGLE_SHEET_ID = '1wshZeDhdqst5FhuR7ZPvneu9p_M80zOMszV_gUfW5_A';
const GOOGLE_DRIVE_FOLDER_ID = '1LfjialAjLtwVDVEt-7_79whJHWRBKgqW';

// Initialize Google Auth
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ],
});

// Initialize Google Services
const sheets = google.sheets({ version: 'v4', auth });
const drive = google.drive({ version: 'v3', auth });

// Interface for simplified bot data (5 columns)
interface BotData {
  creationDateTime: string;
  botName: string;
  knowledgeBaseType: string;
  knowledgeBaseContent: string;
  driveFolderLink: string;
}

// Save bot data to Google Sheets (5 columns)
export async function saveBotToSheets(botData: BotData): Promise<void> {
  try {
    console.log('📊 Saving bot data to Google Sheets (5 columns)...');
    
    const values = [
      [
        botData.creationDateTime,
        botData.botName,
        botData.knowledgeBaseType,
        botData.knowledgeBaseContent,
        botData.driveFolderLink
      ]
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Sheet1!A:E',
      valueInputOption: 'RAW',
      requestBody: {
        values,
      },
    });

    console.log('✅ Bot data saved to Google Sheets successfully');
  } catch (error) {
    console.error('❌ Error saving to Google Sheets:', error);
    throw error;
  }
}

// Create folder in Google Drive for bot files
export async function createBotFolder(botName: string): Promise<string> {
  try {
    console.log('📁 Creating Google Drive folder for bot...');
    
    const folderMetadata = {
      name: `${botName} - ${new Date().toISOString().split('T')[0]}`,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    const folderId = folder.data.id!;
    const folderLink = `https://drive.google.com/drive/folders/${folderId}`;
    
    console.log('✅ Google Drive folder created:', folderLink);
    return folderLink;
  } catch (error) {
    console.error('❌ Error creating Google Drive folder:', error);
    throw error;
  }
}

// Upload file to Google Drive
export async function uploadFileToGoogleDrive(
  fileName: string,
  fileContent: Buffer,
  mimeType: string,
  driveFolderId: string
): Promise<string> {
  try {
    console.log('📤 Uploading file to Google Drive:', fileName);
    
    const fileMetadata = {
      name: fileName,
      parents: [driveFolderId],
    };

    const media = {
      mimeType,
      body: fileContent,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id',
    });

    const fileId = file.data.id!;
    const fileLink = `https://drive.google.com/file/d/${fileId}/view`;
    
    console.log('✅ File uploaded to Google Drive:', fileLink);
    return fileLink;
  } catch (error) {
    console.error('❌ Error uploading file to Google Drive:', error);
    throw error;
  }
}

// Extract folder ID from Google Drive link
export function extractFolderIdFromLink(driveLink: string): string {
  const match = driveLink.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : '';
}

// Set up Google Sheets headers (run once to initialize)
export async function setupSheetsHeaders(): Promise<void> {
  try {
    console.log('📊 Setting up Google Sheets headers...');

    const headers = [
      ['Creation Date & Time', 'Bot Name', 'Knowledge Base Type', 'Knowledge Base Content', 'Drive Folder Link']
    ];

    await sheets.spreadsheets.values.update({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Sheet1!A1:E1',
      valueInputOption: 'RAW',
      requestBody: {
        values: headers,
      },
    });

    console.log('✅ Google Sheets headers set up successfully');
  } catch (error) {
    console.error('❌ Error setting up Google Sheets headers:', error);
    throw error;
  }
}
