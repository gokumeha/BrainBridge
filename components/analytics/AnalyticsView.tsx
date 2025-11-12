import React from 'react';
import { UserProgress } from '../../types';
import Card from '../ui/Card';
// FIX: Removed 'Defs', 'linearGradient', and 'Stop' from the import as they are not exported from 'recharts'.
// They are standard SVG elements and can be used directly in JSX.
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AnalyticsViewProps {
  progress: UserProgress;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ progress }) => {
  const formattedQuizData = progress.quizScores.map(score => ({
    ...score,
    date: score.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
  }));

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Your Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center">
          <h3 className="text-lg text-gray-500">Total Points</h3>
          <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-sky-500">{progress.points} ✨</p>
        </Card>
        <Card className="text-center">
          <h3 className="text-lg text-gray-500">Focus Sessions</h3>
          <p className="text-4xl font-bold text-green-500">{progress.pomodoroSessions}</p>
        </Card>
        <Card className="text-center">
          <h3 className="text-lg text-gray-500">Quizzes Taken</h3>
          <p className="text-4xl font-bold text-sky-500">{progress.quizzesTaken}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Quiz Score History</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={formattedQuizData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.5}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem' }}
                labelStyle={{ color: '#111827' }}
              />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="url(#colorScore)" strokeWidth={3} name="Score (%)" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Scores by Subject</h2>
         <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={formattedQuizData}>
                 <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.8}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="subject" stroke="#6b7280" angle={-10} textAnchor="end" height={50} />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '1rem' }}
                  labelStyle={{ color: '#111827' }}
                />
                <Legend />
                <Bar dataKey="score" fill="url(#colorBar)" name="Score" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
         </div>
      </Card>
    </div>
  );
};

export default AnalyticsView;