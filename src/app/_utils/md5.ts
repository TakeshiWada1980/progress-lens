import CryptoJS from "crypto-js";

export const calculateMD5Hash = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
      const hash = CryptoJS.MD5(wordArray).toString();
      resolve(hash);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsArrayBuffer(file);
  });
};
