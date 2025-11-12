import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import Card from '../ui/Card';
import { motion } from 'framer-motion';
import { getAllUsers } from '../../services/firebase/firestore';
import Spinner from '../ui/Spinner';

interface LeaderboardViewProps {
  currentUser: User;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const allUsers = await getAllUsers();
        const sortedUsers = allUsers.sort((a, b) => b.progress.points - a.progress.points);
        setUsers(sortedUsers);
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-yellow-400';
    if (rank === 1) return 'text-gray-400';
    if (rank === 2) return 'text-yellow-600';
    return 'text-gray-500';
  }

  const getRankIcon = (rank: number) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `${rank + 1}`;
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Leaderboard</h1>
      <p className="text-lg text-gray-500 mb-8">See where you rank among your peers. Keep learning to climb to the top!</p>

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner />
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {users.map((user, index) => (
              <motion.li
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 flex items-center justify-between ${user.id === currentUser.id ? 'bg-blue-50 rounded-lg' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  <span className={`text-2xl font-bold w-10 text-center ${getRankColor(index)}`}>
                    {getRankIcon(index)}
                  </span>
                  <div className="w-12 h-12 bg-gray-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 text-xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                      <p className="font-bold text-lg text-gray-900">{user.name}</p>
                      {user.id === currentUser.id && <p className="text-sm text-gray-500">(You)</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-xl text-blue-600">{user.progress.points} pts</p>
                  <p className="text-sm text-gray-500">{user.progress.quizzesTaken} quizzes taken</p>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default LeaderboardView;