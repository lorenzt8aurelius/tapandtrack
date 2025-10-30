import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient';

function Scanner({ userId, onClose }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    // This check ensures we only create the scanner once.
    if (scannerRef.current) {
      return;
    }

    const scanner = new Html5QrcodeScanner(
      'qr-reader', 
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        // By removing 'supportedScanTypes', both camera and file scanning are enabled by default.
      },
      false // verbose
    );
    scannerRef.current = scanner;

    async function onScanSuccess(decodedText, decodedResult) {
      console.log(`[Scanner] Scan successful, result: ${decodedText}`);
      
      // Stop scanning to prevent multiple submissions
      scanner.clear();

      // --- FIX: More robust session check to prevent 'expiresAt' error ---
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session || !session.user) {
        toast.error("Your session is invalid or has expired. Please log in again.");
        return;
      }

      try {
        const session_code = decodedText;

        const { data, error } = await supabase.functions.invoke('record-attendance', {
          // The studentId is retrieved from the auth token in the function.
          // The body must match the function's expectation.
          body: { session_code },
        });

        if (error) {
          // --- FIX: Safely handle the error object ---
          if (error.context && typeof error.context.json === 'function') {
            const errorData = await error.context.json();
            throw new Error(errorData.error || 'An error occurred while recording attendance.');
          } else {
            // Fallback for generic network errors (like CORS or function not found)
            throw new Error(error.message || 'A network error occurred. Please check your connection or backend function logs.');
          }
        }

        toast.success(data.message || 'Attendance recorded successfully!');
        onClose(); // Close the scanner on success
      } catch (err) {
        console.error("Error recording attendance:", err);
        toast.error(err.message || 'Failed to record attendance.');
        // Optionally restart the scanner after a delay
        setTimeout(() => {
          if (document.getElementById('qr-reader')) {
             scanner.render(onScanSuccess, onScanFailure);
          }
        }, 2000);
      }
    }

    function onScanFailure(error) {
      // This callback is called frequently, so it's best to keep it quiet.
    }

    scanner.render(onScanSuccess, onScanFailure);

    // This cleanup function is critical. It runs when the component is unmounted.
    return () => {
      // We need to check if the scanner is still active before trying to clear it.
      if (scannerRef.current) {
        scanner.clear().catch(error => {
          // It's okay if this fails, it might have already been cleared.
          console.error("Failed to clear scanner on unmount. This can sometimes be ignored.", error);
        });
        // Important: nullify the ref so a new scanner can be created if the component remounts.
        scannerRef.current = null; 
      }
    };
    // By removing dependencies, we ensure this effect runs only ONCE on mount.
  }, []);

  return (
    <div>
      <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
      <button 
        onClick={onClose} 
        className="mt-4 w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
      >
        Close Scanner
      </button>
    </div>
  );
}

export default Scanner;