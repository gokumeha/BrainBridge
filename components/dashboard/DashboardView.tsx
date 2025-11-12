import React from 'react';
import { Source, View, User } from '../../types';
import Card from '../ui/Card';
import { motion } from 'framer-motion';

interface DashboardViewProps {
  user: User;
  setActiveSource: (source: Source) => void;
  setCurrentView: (view: View) => void;
  onAddNewSource: () => void;
}

const SourceCard: React.FC<{ source: Source, onClick: () => void }> = ({ source, onClick }) => {
    const getIcon = (type: Source['type']) => {
        switch (type) {
            case 'pdf': return '📄';
            case 'youtube': return '▶️';
            case 'text': return '📝';
            default: return '📁';
        }
    }

    return (
        <motion.div
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="cursor-pointer h-full"
            onClick={onClick}
        >
            <Card className="h-full flex flex-col">
                <div className="flex-grow">
                    <span className="text-3xl">{getIcon(source.type)}</span>
                    <h3 className="text-lg font-bold mt-3 text-gray-900 truncate">{source.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-3">
                        {source.summary}
                    </p>
                </div>
                <p className="text-xs text-gray-400 mt-4">{new Date(source.createdAt).toLocaleDateString()}</p>
            </Card>
        </motion.div>
    );
};

const DashboardView: React.FC<DashboardViewProps> = ({ user, setActiveSource, setCurrentView, onAddNewSource }) => {
  const recentSources = user.sources.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Welcome Back, {user.name}!</h1>
        <p className="text-lg text-gray-500 mt-2">Ready to dive back into your studies?</p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Recent Files</h2>
        {recentSources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSources.map(source => (
              <SourceCard key={source.id} source={source} onClick={() => setActiveSource(source)} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900">Your library is empty</h3>
            <p className="text-gray-500 mt-2">Go to your Library to add your first study source.</p>
          </Card>
        )}
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">Quick Actions</h2>
                <div className="flex space-x-4">
                     <button onClick={onAddNewSource} className="flex-1 text-center bg-gray-100 hover:bg-gray-200 p-4 rounded-lg transition-colors text-gray-800">
                        <span className="text-2xl">➕</span>
                        <p className="mt-1 font-semibold">New Source</p>
                    </button>
                    <button onClick={() => setCurrentView(View.Pomodoro)} className="flex-1 text-center bg-gray-100 hover:bg-gray-200 p-4 rounded-lg transition-colors text-gray-800">
                        <span className="text-2xl">⏱️</span>
                        <p className="mt-1 font-semibold">Start Focus</p>
                    </button>
                </div>
            </Card>
            <Card>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">Goal for the Week</h2>
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 flex items-center justify-center font-bold text-2xl text-white">
                       75%
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800">Complete 3 quizzes with a score over 80%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className="bg-gradient-to-r from-blue-500 to-sky-500 h-2.5 rounded-full" style={{width: '75%'}}></div>
                        </div>
                    </div>
                </div>
            </Card>
       </div>
    </div>
  );
};

export default DashboardView;
