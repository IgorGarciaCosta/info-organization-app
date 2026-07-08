/**
 * App configuration constants.
 *
 * API_BASE_URL points to the Python (FastAPI) backend that returns transcripts.
 *
 * IMPORTANT — you are testing on a physical phone with Expo Go:
 * The phone is a DIFFERENT device from your computer. Using "localhost" here
 * would mean "the phone itself" and the request would fail. You must use your
 * computer's LAN IP address, and both devices must be on the same Wi-Fi.
 *
 * How to find your computer's IP (Windows):
 *   1. Open PowerShell and run: ipconfig
 *   2. Look for "IPv4 Address" (usually something like 192.168.x.x)
 *   3. Replace the value below with http://<that-ip>:8000
 *
 * NOTE: When running in a web browser on the same computer as the backend,
 * "localhost" is correct. On a physical phone (Expo Go) we must use the LAN IP.
 */
import { Platform } from 'react-native';

const LAN_IP = 'http://192.168.0.7:8000';

export const API_BASE_URL =
  Platform.OS === 'web' ? 'http://localhost:8000' : LAN_IP;
