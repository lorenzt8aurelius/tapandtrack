import { useState, useEffect } from 'react';

function LiveCounter({ sessionCode, initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/Attendance/session/${sessionCode}`);
        const data = await response.json();
        if (data.attendance) {
          const newCount = data.attendance.length;
          if (newCount !== count) {
            setAnimating(true);
            setTimeout(() => setAnimating(false), 500);
          }
          setCount(newCount);
        }
      } catch (error) {
        console.error('Failed to fetch attendance count:', error);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 3000);

    return () => clearInterval(interval);
  }, [sessionCode, count]);

  return (
    <div className={`text-center transition-all duration-500 ${animating ? 'scale-110' : ''}`}>
      <div className="text-6xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        {count}
      </div>
      <p className="text-gray-600 mt-2">Students Attended</p>
    </div>
  );
}

export default LiveCounter;
