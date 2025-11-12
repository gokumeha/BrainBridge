import React from 'react';
import { User } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
  onClearData: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout, onClearData }) => {
  const { progress } = user;
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900">Profile & Settings</h1>
      
      {/* User Info Card */}
      <Card className="flex items-center space-x-6">
        <div className="w-20 h-20 bg-gray-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-500">{user.email}</p>
          <p className="mt-2 text-lg font-semibold text-blue-600">{progress.points} Points ✨</p>
        </div>
      </Card>

      {/* History Card */}
      <Card>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Activity History</h2>
        
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Quiz History</h3>
        {progress.quizScores.length > 0 ? (
          <div className="max-h-64 overflow-y-auto pr-2 space-y-3">
            {progress.quizScores.slice().reverse().map((quiz, index) => (
              <div key={index} className="bg-gray-100/70 p-3 rounded-md flex justify-between items-center border border-gray-200">
                <div>
                  <p className="font-semibold text-gray-800">{quiz.subject}</p>
                  <p className="text-sm text-gray-500">{quiz.date.toLocaleDateString()}</p>
                </div>
                <p className={`font-bold text-lg ${quiz.score > 80 ? 'text-green-600' : quiz.score > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {quiz.score}%
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No quizzes taken yet.</p>
        )}
        
        <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Focus Sessions</h3>
        <div className="bg-gray-100/70 p-3 rounded-md flex justify-between items-center border border-gray-200">
          <p className="font-semibold text-gray-800">Completed Pomodoro Sessions</p>
          <p className="font-bold text-lg text-green-600">{progress.pomodoroSessions}</p>
        </div>
      </Card>
      
      {/* Actions Card */}
      <Card>
        <h2 className="text-xl font-bold mb-4 text-gray-900">Actions</h2>
        <div className="space-y-6">
            {/* Log Out Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-800">Log Out</h3>
                <p className="text-gray-600 mb-3">
                    This will end your current session and return you to the home screen. Your progress will be saved for your next visit.
                </p>
                <Button onClick={onLogout} variant="secondary" className="w-full md:w-auto">
                    Log Out
                </Button>
            </div>
            
            <div className="border-t border-gray-200"></div>

            {/* Clear Data Section */}
            <div>
                <h3 className="text-lg font-semibold text-red-600">Delete Account</h3>
                <p className="text-gray-600 mb-3">
                    This will permanently delete your account and all associated data, including progress and sources. This action cannot be undone.
                </p>
                <Button onClick={() => { if(window.confirm('Are you sure you want to permanently delete your account?')) onClearData() }} variant="secondary" className="w-full md:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white">
                    Delete My Account
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileView;
