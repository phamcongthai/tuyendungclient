// Deprecated: CV uploads moved to BE endpoint /applications/upload-resume
export const uploadToCloudinary = async (_file: File): Promise<string> => {
  throw new Error('Deprecated: FE should upload via BE /applications/upload-resume');
};
