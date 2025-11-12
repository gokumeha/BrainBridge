
import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroTimerProps {
  mode: TimerMode;
  time: number;
  isActive: boolean;
  cycles: number;
  onToggle: () => void;
  onReset: () => void;
  notificationPermission: NotificationPermission;
  onRequestNotificationPermission: () => void;
}

const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ mode, time, isActive, cycles, onToggle, onReset, notificationPermission, onRequestNotificationPermission }) => {
  const minutes = Math.floor(time / 60).toString().padStart(2, '0');
  const seconds = (time % 60).toString().padStart(2, '0');

  const modeInfo = {
      work: { text: 'Focus Session', gradient: 'from-blue-500 to-sky-500' },
      shortBreak: { text: 'Short Break', gradient: 'from-green-400 to-cyan-400' },
      longBreak: { text: 'Long Break', gradient: 'from-sky-400 to-indigo-400' }
  }

  const renderNotificationUI = () => {
    if (notificationPermission === 'default') {
      return (
        <Button onClick={onRequestNotificationPermission} variant="ghost" className="mt-4 text-sm w-full">
          Enable Browser Notifications
        </Button>
      );
    }
    if (notificationPermission === 'denied') {
      return (
        <p className="mt-4 text-xs text-gray-500">
          Notifications are blocked. You can enable them in your browser settings.
        </p>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <h2 className={`text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${modeInfo[mode].gradient}`}>{modeInfo[mode].text}</h2>
        <div className="w-64 h-64 mx-auto rounded-full flex items-center justify-center mb-6 relative">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${modeInfo[mode].gradient} blur-xl opacity-30`}></div>
            <div className="w-full h-full rounded-full bg-white/80 flex items-center justify-center ring-1 ring-inset ring-gray-200">
                 <p className="text-6xl font-mono text-gray-900">{minutes}:{seconds}</p>
            </div>
        </div>
        <div className="flex justify-center space-x-4">
            <Button onClick={onToggle} className="w-32">{isActive ? 'Pause' : 'Start'}</Button>
            <Button onClick={onReset} variant="secondary" className="w-32">Reset</Button>
        </div>
        <p className="mt-6 text-gray-500">Completed cycles: {cycles}</p>
        <div className="mt-4 border-t border-gray-200 pt-4">
            {renderNotificationUI()}
        </div>
      </Card>
    </div>
  );
};

export default PomodoroTimer;