

import React, { useState, useCallback, useMemo } from 'react';
import { Source } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import SourceView from './SourceView';
import { motion, AnimatePresence } from 'framer-motion';

interface LibraryViewProps {
    sources: Source[];
    setSources: React.Dispatch<React.SetStateAction<Source[]>>;
    activeSource: Source | null;
    setActiveSource: (source: Source | null) => void;
    onQuizComplete: (subject: string, score: number) => void;
    addPoints: (amount: number) => void;
    onAddNewSource: () => void;
}

const SourceCard: React.FC<{ source: Source, onClick: () => void, onDelete: () => void }> = ({ source, onClick, onDelete }) => {
    const getIcon = (type: Source['type']) => {
        switch (type) {
            case 'pdf': return '📄';
            case 'youtube': return '▶️';
            case 'text': return '📝';
            default: return '📁';
        }
    };
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete "${source.name}"?`)) {
            onDelete();
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="relative group"
        >
            <div onClick={onClick} className="cursor-pointer h-full">
                <Card className="h-full flex flex-col hover:border-blue-400/50 transition-colors duration-300">
                    <div className="flex-grow">
                        <span className="text-4xl">{getIcon(source.type)}</span>
                        <h3 className="text-lg font-bold mt-4 text-gray-900 truncate">{source.name}</h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-4 flex-grow">
                            {source.summary}
                        </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 self-start">{new Date(source.createdAt).toLocaleDateString()}</p>
                </Card>
            </div>
             <button onClick={handleDelete} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/50 hover:bg-red-100 text-gray-700 hover:text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                🗑️
            </button>
        </motion.div>
    );
};

const LibraryView: React.FC<LibraryViewProps> = (props) => {
    const { sources, setSources, activeSource, setActiveSource, onQuizComplete, addPoints, onAddNewSource } = props;
    const [searchTerm, setSearchTerm] = useState('');

    const handleDeleteSource = (idToDelete: string) => {
        setSources(prev => prev.filter(s => s.id !== idToDelete));
    };
    
    const filteredSources = useMemo(() => 
        sources
            .filter(source => source.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        [sources, searchTerm]
    );

    if (activeSource) {
        return <SourceView 
                    source={activeSource} 
                    onBack={() => setActiveSource(null)}
                    onQuizComplete={onQuizComplete}
                    addPoints={addPoints}
                />;
    }

    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
                <Button onClick={onAddNewSource}>
                    <span className="mr-2">➕</span> Add New Source
                </Button>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Search library..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900"
                />
            </div>
            
            <AnimatePresence>
                {filteredSources.length > 0 ? (
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSources.map(source => (
                            <SourceCard 
                                key={source.id} 
                                source={source} 
                                onClick={() => setActiveSource(source)}
                                onDelete={() => handleDeleteSource(source.id)}
                            />
                        ))}
                    </motion.div>
                ) : (
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card className="text-center py-20">
                            <h3 className="text-2xl font-semibold text-gray-900">Your library is empty</h3>
                            <p className="text-gray-500 mt-2 mb-6">Click "Add New Source" to upload your first document.</p>
                            <Button onClick={onAddNewSource}>Get Started</Button>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LibraryView;