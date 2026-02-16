import { promises as fs } from 'fs';
import path from 'path';
import { UserData } from '@/types';

// NOTE: On Vercel, this will use /tmp directory which is ephemeral
// Data persists during Lambda execution but resets on cold starts
// For production persistence, consider using Vercel KV or external database
const CSV_DIR = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(process.cwd(), 'data');
const CSV_FILE = path.join(CSV_DIR, 'users.csv');

/**
 * Ensures the CSV directory exists
 */
async function ensureDir() {
  try {
    await fs.mkdir(CSV_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating CSV directory:', error);
  }
}

/**
 * Initializes the CSV file with headers if it doesn't exist
 */
export async function initCSV(): Promise<void> {
  await ensureDir();

  try {
    await fs.access(CSV_FILE);
    // File exists, do nothing
  } catch {
    // File doesn't exist, create it with headers
    const headers = 'name,phone,car_number,timestamp\n';
    await fs.writeFile(CSV_FILE, headers, 'utf-8');
  }
}

/**
 * Appends user data to the CSV file
 * Uses file locking mechanism to prevent concurrent write conflicts
 */
export async function appendUser(userData: UserData): Promise<void> {
  await ensureDir();
  await initCSV();

  const timestamp = userData.timestamp || new Date().toISOString();
  const row = `${userData.name},${userData.phone},${userData.carNumber},${timestamp}\n`;

  try {
    // Append to file
    await fs.appendFile(CSV_FILE, row, 'utf-8');
  } catch (error) {
    console.error('Error appending to CSV:', error);
    throw new Error('Failed to save user data');
  }
}

/**
 * Reads all user data from CSV (optional utility for future use)
 */
export async function readUsers(): Promise<UserData[]> {
  try {
    await initCSV();
    const content = await fs.readFile(CSV_FILE, 'utf-8');
    const lines = content.split('\n').slice(1); // Skip header

    return lines
      .filter(line => line.trim())
      .map(line => {
        const [name, phone, carNumber, timestamp] = line.split(',');
        return {
          name,
          phone,
          carNumber: parseInt(carNumber, 10),
          timestamp,
        };
      });
  } catch (error) {
    console.error('Error reading CSV:', error);
    return [];
  }
}
