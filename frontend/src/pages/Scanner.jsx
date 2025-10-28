import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { toast } from 'react-toastify';
import { attendanceAPI } from '../api';
import Logo from '../components/Logo';

function Scanner({ user }) {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(err => console.log(err));
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      html5QrCodeRef.current = new Html5Qrcode("scanner-container", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
      });

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText, decodedResult) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      );
      setScanning(true);
    } catch (err) {
      toast.error('Failed to start camera. Please ensure camera permissions are granted.');
      console.error(err);
    }
  };

  const stopScanning = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
      setScanning(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScanSuccess = async (sessionCode) => {
    if (scannedData === sessionCode) return;

    setSuccessAnimation(true);
    
    try {
      setScannedData(sessionCode);
      await attendanceAPI.record({
        sessionCode: sessionCode,
        studentId: user.id
      });
      
      toast.success('✅ Attendance recorded successfully!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: true,
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record attendance');
      setScannedData(null);
      setSuccessAnimation(false);
    }
  };

  const handleBack = async () => {
    await stopScanning();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-6 animate-fadeIn">
          <div className="flex justify-center mb-4">
            <Logo size="small" showText={false} />
          </div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <svg className="w-7 h-7 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" clipRule="evenodd"/>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              QR Scanner
            </h1>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition duration-200 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>

          {successAnimation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
              <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 animate-bounce-custom">
                <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
                <p className="text-gray-600">Attendance recorded successfully</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {!scanning ? (
              <div className="text-center">
                <div className="mb-6 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full blur-3xl opacity-50 animate-pulse-custom"></div>
                  </div>
                  <div className="relative">
                    <svg className="mx-auto h-32 w-32 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2.01M5 16h2m13-8h-1.01M19 16h1.01M12 7h-1.01M12 17h-1.01" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to scan</h3>
                <p className="text-gray-600 mb-6">Point your camera at the QR code</p>
                <button
                  onClick={startScanning}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition duration-200 text-lg font-semibold flex items-center justify-center shadow-lg transform hover:scale-105"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Start Scanner
                </button>
              </div>
            ) : (
              <div>
                <div id="scanner-container" className="w-full rounded-lg overflow-hidden mb-4 border-4 border-indigo-500"></div>
                <button
                  onClick={stopScanning}
                  className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200 text-lg font-semibold flex items-center justify-center shadow-lg"
                >
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Stop Scanner
                </button>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">💡 How to use</p>
                  <p className="text-sm text-blue-800">
                    Point your camera at the QR code shown by your teacher. Make sure the entire QR code is visible and well-lit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scanner;