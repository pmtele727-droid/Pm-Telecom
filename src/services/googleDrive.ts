import { AppBackupData, DriveBackupFile } from '../types/inventory';
import { getAccessToken } from './firebaseAuth';

/**
 * Uploads a complete backup JSON file to the user's Google Drive.
 */
export async function uploadBackupToDrive(backupData: AppBackupData): Promise<DriveBackupFile> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('গুগল অ্যাকাউন্ট সাইন-ইন করা নেই। অনুগ্রহ করে প্রথমে সাইন ইন করুন।');
  }

  const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `Irfan_Creation_Backup_${dateStr}.json`;
  const fileContent = JSON.stringify(backupData, null, 2);

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description: `Irfan Creation Inventory Backup (${backupData.totalItemsCount} items, ${backupData.totalStockUnits} pcs, ৳${backupData.totalInvestment} purchase value)`,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime,size,description',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`গুগল ড্রাইভে ব্যাকআপ রাখতে ব্যর্থ হয়েছে: ${errorText}`);
  }

  const result = await response.json();
  return {
    id: result.id,
    name: result.name,
    createdTime: result.createdTime || new Date().toISOString(),
    size: result.size,
    description: result.description,
  };
}

/**
 * Lists inventory backup files found in the user's Google Drive.
 */
export async function listDriveBackups(): Promise<DriveBackupFile[]> {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }

  const query = encodeURIComponent("name contains 'Irfan_Creation_Backup' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&pageSize=20&fields=files(id,name,createdTime,size,description)`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error fetching drive files:', errorText);
    return [];
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Downloads and parses backup data from a Google Drive file.
 */
export async function downloadBackupFromDrive(fileId: string): Promise<AppBackupData> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('গুগল অ্যাকাউন্ট সাইন-ইন করা নেই।');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('গুগল ড্রাইভ থেকে ফাইল নামাতে সমস্যা হয়েছে');
  }

  const data = await response.json();
  return data as AppBackupData;
}

/**
 * Deletes a backup file from Google Drive.
 * (Note: Destructive action requiring user confirmation dialog in UI as per guidelines).
 */
export async function deleteBackupFromDrive(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('গুগল অ্যাকাউন্ট সাইন-ইন করা নেই।');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error('ফাইল মুছে ফেলতে সমস্যা হয়েছে');
  }
}
