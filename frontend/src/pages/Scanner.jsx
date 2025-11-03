import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { toast } from 'react-toastify';
import { supabase } from '../supabaseClient';

function Scanner({ userId, onClose = () => {} }) {
  const scannerRef = useRef(null);

  useEffect(() => {
    // This check ensures we only create the scanner once.
    if (scannerRef.current) {
      return;
    }

    const qrReaderElement = document.getElementById('qr-reader');
    if (!qrReaderElement) {
      console.error('[Scanner] QR reader element not found');
      return;
    }

    const scanner = new Html5QrcodeScanner(
      'qr-reader', 
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true,
        supportedScanTypes: [
          Html5QrcodeScanType.SCAN_TYPE_CAMERA,
          Html5QrcodeScanType.SCAN_TYPE_FILE
        ]
      },
      false // verbose
    );
    scannerRef.current = scanner;

    async function onScanSuccess(decodedText, decodedResult) {
      console.log(`[Scanner] Scan successful, result: ${decodedText}`);
      
      // Stop scanning temporarily to prevent multiple scans
      if (scannerRef.current) {
        scannerRef.current.clear();
      }

      try {
        const session_code = decodedText.trim();

        // First, verify the session exists and is active
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('id, subject, is_active, session_code')
          .eq('session_code', session_code)
          .single();

        if (sessionError || !sessionData) {
          throw new Error('Invalid session code. Please scan a valid QR code.');
        }

        if (!sessionData.is_active) {
          throw new Error('This session has ended. Please contact your teacher.');
        }

        // Check if student has already recorded attendance for this session
        const { data: existingAttendance, error: checkError } = await supabase
          .from('attendance')
          .select('id')
          .eq('session_code', session_code)
          .eq('student_id', userId)
          .maybeSingle();

        if (checkError) {
          throw new Error('Error checking existing attendance.');
        }

        if (existingAttendance) {
          throw new Error('You have already recorded attendance for this session.');
        }

        // Insert attendance record
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('attendance')
          .insert([
            {
              student_id: userId,
              session_code: session_code,
              time_in: new Date().toISOString()
            }
          ])
          .select()
          .single();

        if (attendanceError) {
          console.error("Attendance insertion error:", attendanceError);
          throw new Error(attendanceError.message || 'Failed to record attendance.');
        }

        toast.success(`Attendance recorded successfully for ${sessionData.subject}!`);
        onClose(true); // Close the scanner on success and trigger refresh
      } catch (err) {
        console.error("Error recording attendance:", err);
        toast.error(err.message || 'Failed to record attendance.');
        // Restart the scanner after a delay
        setTimeout(() => {
          const qrReaderElement = document.getElementById('qr-reader');
          if (qrReaderElement && scannerRef.current) {
            try {
              scannerRef.current.render(onScanSuccess, onScanFailure);
            } catch (renderError) {
              console.error('[Scanner] Failed to restart scanner:', renderError);
              // Try to recreate the scanner
              scannerRef.current = null;
              if (qrReaderElement) {
                const newScanner = new Html5QrcodeScanner(
                  'qr-reader',
                  {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    rememberLastUsedCamera: true,
                    supportedScanTypes: [
                      Html5QrcodeScanType.SCAN_TYPE_CAMERA,
                      Html5QrcodeScanType.SCAN_TYPE_FILE
                    ]
                  },
                  false
                );
                newScanner.render(onScanSuccess, onScanFailure);
                scannerRef.current = newScanner;
              }
            }
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
        onClick={() => onClose(false)} 
        className="mt-4 w-full py-2 px-4 bg-gray-600 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition"
      >
        Close Scanner
      </button>
    </div>
  );
}

export default Scanner;