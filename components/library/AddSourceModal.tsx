import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Source, SourceType } from '../../types';
import { summarizeForSource } from '../../services/geminiService';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import * as pdfjsLib from "https://aistudiocdn.com/pdfjs-dist@^4.6.0";

// Set worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://aistudiocdn.com/pdfjs-dist@^4.6.0/build/pdf.worker.mjs";


interface AddSourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSourceAdded: (source: Source) => void;
}

const AddSourceModal: React.FC<AddSourceModalProps> = ({ isOpen, onClose, onSourceAdded }) => {
    const [activeTab, setActiveTab] = useState<'upload' | 'text'>('upload');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // State for inputs
    const [pastedText, setPastedText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const resetState = useCallback(() => {
        setActiveTab('upload');
        setIsLoading(false);
        setError('');
        setPastedText('');
        setFile(null);
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain') {
                setFile(selectedFile);
                setError('');
            } else {
                setError('Please upload a PDF or TXT file.');
                setFile(null);
            }
        }
    };
    
    const parsePdf = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
        }
        return fullText;
    };

    const handleSubmit = async () => {
        let name: string = '';
        let type: SourceType | null = null;
        let content: string = '';

        setIsLoading(true);
        setError('');
        
        try {
            switch(activeTab) {
                case 'upload':
                    if (!file) throw new Error('No file selected.');
                    name = file.name;
                    type = file.type === 'application/pdf' ? 'pdf' : 'text';
                    content = file.type === 'application/pdf' 
                        ? await parsePdf(file)
                        : await file.text();
                    break;
                case 'text':
                    if (!pastedText.trim()) throw new Error('Pasted text is empty.');
                    name = `Pasted Text - ${new Date().toLocaleString()}`;
                    type = 'text';
                    content = pastedText;
                    break;
            }

            if (type && content) {
                const summary = await summarizeForSource(content, type, name);

                const newSource: Source = {
                    id: `source-${Date.now()}`,
                    name,
                    type,
                    content,
                    summary,
                    createdAt: new Date().toISOString()
                };
                onSourceAdded(newSource);
            }

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const TabButton: React.FC<{tab: 'upload' | 'text', children: React.ReactNode}> = ({tab, children}) => (
        <button 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
            {children}
            {activeTab === tab && 
                <motion.div layoutId="active-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"/>
            }
        </button>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="bg-white/80 backdrop-blur-xl border border-gray-200/80 rounded-2xl shadow-2xl w-full max-w-2xl text-gray-800"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Add New Source</h2>
                            <p className="text-sm text-gray-500">Upload a file or paste text to get started.</p>
                        </div>
                        
                        <div className="p-6">
                            <div className="flex border-b border-gray-200 mb-6">
                                <TabButton tab="upload">📄 Upload File</TabButton>
                                <TabButton tab="text">📝 Paste Text</TabButton>
                            </div>

                            {activeTab === 'upload' && (
                                <div className="flex flex-col items-center justify-center w-full p-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100/50 transition-colors">
                                    <label htmlFor="file-upload" className="flex flex-col items-center justify-center cursor-pointer">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-400">PDF or TXT files</p>
                                    </label>
                                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt" />
                                    {file && <p className="mt-4 text-sm text-green-600">Selected: {file.name}</p>}
                                </div>
                            )}

                             {activeTab === 'text' && (
                                <textarea
                                    value={pastedText}
                                    onChange={(e) => setPastedText(e.target.value)}
                                    placeholder="Paste your article, notes, or any other text here..."
                                    className="w-full h-48 bg-gray-100 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            )}
                            
                            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50/50 rounded-b-2xl">
                            <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isLoading} className="min-w-[120px]">
                                {isLoading ? <Spinner size="sm"/> : 'Add and Summarize'}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddSourceModal;