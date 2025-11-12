import React, { useState, useCallback } from 'react';
import { Subject } from '../../types';
import { analyzeAssignment } from '../../services/geminiService';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import * as pdfjsLib from "https://aistudiocdn.com/pdfjs-dist@^4.6.0";

// Set worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://aistudiocdn.com/pdfjs-dist@^4.6.0/build/pdf.worker.mjs";


const AssignmentAnalyzerView: React.FC = () => {
    const [subject, setSubject] = useState<Subject | 'Other'>(Subject.DataStructures);
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFeedback('');
            setError('');
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

    const handleAnalyze = useCallback(async () => {
        if (!file) {
            setError('Please upload a file first.');
            return;
        }

        setIsLoading(true);
        setFeedback('');
        setError('');

        try {
            let content = '';
            const fileType = file.type;
            
            if (fileType === 'application/pdf') {
                content = await parsePdf(file);
            } else if (fileType.startsWith('text/') || file.name.endsWith('.py') || file.name.endsWith('.js') || file.name.endsWith('.java') || file.name.endsWith('.c') || file.name.endsWith('.cpp')) {
                content = await file.text();
            } else {
                 throw new Error(`Unsupported file type: ${fileType}. Please upload a code file, a TXT file, or a PDF.`);
            }

            const analysisResult = await analyzeAssignment(content, subject, file.name);
            setFeedback(analysisResult);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }

    }, [file, subject]);

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-4xl font-bold text-gray-900">Assignment Analyzer</h1>
                <p className="text-lg text-gray-500 mt-2">Get instant, AI-powered feedback on your assignments and code.</p>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="md:col-span-1">
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">1. Select Subject</label>
                        <select
                            id="subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value as Subject | 'Other')}
                            className="w-full bg-gray-100 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={Subject.DataStructures}>Data Structures & Applications</option>
                            <option value={Subject.ResearchMethodology}>Research Methodology & IPR</option>
                            <option value={Subject.DiscreteMath}>Discrete Mathematical Structures</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                         <label htmlFor="file-upload-analyzer" className="block text-sm font-medium text-gray-700 mb-2">2. Upload Your File</label>
                         <div className="flex items-center">
                            <label htmlFor="file-upload-analyzer" className="cursor-pointer bg-white border border-gray-300 rounded-md px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                                Choose File
                            </label>
                            <input id="file-upload-analyzer" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.txt,.py,.js,.java,.c,.cpp,.md" />
                            {file && <p className="ml-4 text-sm text-gray-600 truncate">{file.name}</p>}
                         </div>
                    </div>
                </div>
                <div className="mt-6 border-t border-gray-200 pt-6">
                    <Button onClick={handleAnalyze} disabled={isLoading || !file} className="w-full md:w-auto">
                        {isLoading ? <Spinner size="sm" /> : 'Analyze My Work'}
                    </Button>
                </div>
            </Card>

            {error && (
                <Card>
                    <p className="text-red-600 font-semibold">{error}</p>
                </Card>
            )}

            {isLoading && (
                <Card className="flex flex-col items-center justify-center text-center p-12">
                    <Spinner size="lg" />
                    <h3 className="text-xl font-semibold mt-6 text-gray-800">Analyzing your work...</h3>
                    <p className="text-gray-500 mt-2">This may take a moment. Our AI is reviewing your document in detail.</p>
                </Card>
            )}

            {feedback && !isLoading && (
                <Card>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback Report</h2>
                    <div className="prose max-w-none text-gray-700 bg-gray-50/70 p-4 rounded-md border border-gray-200">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {feedback}
                        </ReactMarkdown>
                    </div>
                </Card>
            )}

        </div>
    );
};

export default AssignmentAnalyzerView;