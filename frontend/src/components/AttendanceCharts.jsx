import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabaseClient';
import { toast } from 'react-toastify';

const AttendanceCharts = ({ user }) => {
  const [trendData, setTrendData] = useState([]);
  const [subjectData, setSubjectData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!user?.id) return;

      try {
        // Fetch all sessions and related attendance for this teacher
        const { data, error } = await supabase
          .from('sessions')
          .select(`*`)
          .eq('teacher_id', user.id);

        if (error) throw error;

        // Manually fetch attendance counts for each session since there's no direct FK relationship for count()
        const sessionsWithCounts = await Promise.all(data.map(async (session) => {
          const { count, error: countError } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('session_code', session.session_code);
          
          return { ...session, attendance_count: countError ? 0 : count };
        }));

        if (error) throw error;

        // Process data for Attendance Trends chart (by date)
        const trends = data.reduce((acc, session) => {
          const date = new Date(session.created_at).toLocaleDateString();
          if (!acc[date]) {
            acc[date] = { date, attendance: 0 };
          }
          acc[date].attendance += session.attendance_count || 0;
          return acc;
        }, {});
        setTrendData(Object.values(trends).sort((a, b) => new Date(a.date) - new Date(b.date)));

        // Process data for Top Subjects chart
        const subjects = data.reduce((acc, session) => {
          if (!acc[session.subject]) {
            acc[session.subject] = { subject: session.subject, attendance: 0 };
          }
          acc[session.subject].attendance += session.attendance_count || 0;
          return acc;
        }, {});
        setSubjectData(Object.values(subjects).sort((a, b) => b.attendance - a.attendance).slice(0, 5)); // Top 5

      } catch (err) {
        toast.error('Failed to load chart data.');
        console.error('Error fetching chart data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [user]);

  if (loading) {
    return <div className="text-center p-4">Loading charts...</div>;
  }

  return (
    <div className="mt-10 pt-6 border-t border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Dashboard Analytics</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-4">Attendance Trends Over Time</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-4">Top Subjects by Attendance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="subject" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="attendance" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCharts;