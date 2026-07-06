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
 */
export const API_BASE_URL = 'http://192.168.0.10:8000';
