export function decodeDeviceIdForDisplay(deviceId: string): string {
  try {
    return decodeURIComponent(deviceId);
  } catch {
    return deviceId;
  }
}
