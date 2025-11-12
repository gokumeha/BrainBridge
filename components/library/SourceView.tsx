import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Source, ChatMessage, QuizQuestion, UserAnswer, Flashcard as FlashcardType } from '../../types';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Card from '../ui/Card';
import { generateChatResponse, generateQuiz, generateFlashcards } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import QuizResults from '../quiz/QuizResults';
import Flashcard from '../flashcards/Flashcard';
import { motion, AnimatePresence } from 'framer-motion';

// Chat Component (Internal to SourceView)
const Chat: React.FC<{source: Source}> = ({ source }) => {
    const getStorageKey = (sourceId: string) => `sourceChatHistory_${sourceId}`;
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(getStorageKey(source.id));
            if (savedHistory) {
                setMessages(JSON.parse(savedHistory));
            } else {
                 setMessages([{
                    id: `ai-initial-${Date.now()}`,
                    sender: 'ai',
                    text: `I'm ready to answer questions about "${source.name}". What would you like to know?`
                }]);
            }
        } catch(e) { console.error("Failed to load chat history:", e); }
    }, [source.id, source.name]);

    useEffect(() => {
        // Do not save the very first initial message if there is no conversation yet
        if (messages.length > 1) {
            localStorage.setItem(getStorageKey(source.id), JSON.stringify(messages));
        }
    }, [messages, source.id]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = useCallback(async () => {
        if (input.trim() === '' || isLoading) return;
        const currentInput = input;
        const userMessage: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text: currentInput };
        
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await generateChatResponse(messages, currentInput, source.content, source.name);
            const aiMessage: ChatMessage = { id: `ai-${Date.now()}`, sender: 'ai', text: aiResponse };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { id: `ai-error-${Date.now()}`, sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, source]);

    const handleClearChat = useCallback(() => {
        if (window.confirm("Are you sure you want to clear this conversation? This action cannot be undone.")) {
            localStorage.removeItem(getStorageKey(source.id));
            setMessages([{
                id: `ai-initial-${Date.now()}`,
                sender: 'ai',
                text: `I'm ready to answer questions about "${source.name}". What would you like to know?`
            }]);
        }
    }, [source.id, source.name]);
    
    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2">
                {messages.map((msg) => (
                    <motion.div
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex w-full mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-xl rounded-lg px-4 py-3 shadow-md ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <div className="prose max-w-none prose-p:my-2">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                            </div>
                        </div>
                    </motion.div>
                ))}
                 {isLoading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-4">
                        <div className="max-w-xl px-4 py-3 rounded-lg bg-gray-200 text-gray-800 flex items-center space-x-2">
                        <Spinner size="sm" /> <span>Thinking...</span>
                        </div>
                    </motion.div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-4 border-t border-gray-200/80 pt-4 shrink-0">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2 ring-1 ring-transparent focus-within:ring-blue-500 transition border border-gray-200">
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}} placeholder={`Ask about ${source.name}...`} className="flex-1 bg-transparent focus:outline-none p-2 resize-none" rows={1} disabled={isLoading} />
                    {messages.length > 1 && (
                         <Button onClick={handleClearChat} variant="ghost" className="p-2 aspect-square" aria-label="Clear chat">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </Button>
                    )}
                    <Button onClick={handleSend} disabled={isLoading || input.trim() === ''}>Send</Button>
                </div>
            </div>
        </div>
    );
};

// Quiz Component (Internal to SourceView)
const Quiz: React.FC<{source: Source; onQuizComplete: (subject: string, score: number) => void}> = ({ source, onQuizComplete }) => {
    const [numQuestions, setNumQuestions] = useState(5);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [results, setResults] = useState<UserAnswer[] | null>(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [answers, setAnswers] = useState<string[]>([]);
    const [quizHistory, setQuizHistory] = useState<string[]>([]);

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(`quizHistory_${source.id}`);
            if (savedHistory) {
                setQuizHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Failed to load quiz history:", e);
            setQuizHistory([]);
        }
    }, [source.id]);
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setQuestions([]);
        setResults(null);
        try {
            const generated = await generateQuiz(source.content, source.name, numQuestions, quizHistory);
            if(generated.length > 0) {
                setQuestions(generated);
                const newQuestions = generated.map(q => q.question);
                const updatedHistory = [...quizHistory, ...newQuestions];
                setQuizHistory(updatedHistory);
                localStorage.setItem(`quizHistory_${source.id}`, JSON.stringify(updatedHistory));
            } else {
                setError('Could not generate a new quiz from this source. You may have exhausted all the unique questions.');
            }
        } catch (e) {
            setError('An error occurred while generating the quiz.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextQuestion = () => {
        if (!selectedOption) return;
        const newAnswers = [...answers, selectedOption];
        setAnswers(newAnswers);
        setSelectedOption(null);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            const finalResults = questions.map((q, i) => ({...q, userAnswer: newAnswers[i], isCorrect: q.correctAnswer === newAnswers[i]}));
            setResults(finalResults);
            const score = Math.round(finalResults.filter(r => r.isCorrect).length / finalResults.length * 100);
            onQuizComplete(source.name, score);
        }
    };

    const resetQuiz = () => {
        setQuestions([]);
        setResults(null);
        setCurrentQuestionIndex(0);
        setAnswers([]);
        setSelectedOption(null);
    }
    
    if (results) {
        return <div className="p-4"><QuizResults results={results} onRetry={resetQuiz} analysisContext={source.content} /></div>
    }

    if (questions.length > 0) {
        const q = questions[currentQuestionIndex];
        return <div className="p-4 max-w-3xl mx-auto">
            <Card>
                <div className="mb-4 text-sm text-gray-500">Question {currentQuestionIndex + 1} of {questions.length}</div>
                <h3 className="text-xl font-semibold mb-6 text-gray-900">{q.question}</h3>
                <div className="space-y-3">
                    {q.options.map(option => (
                        <button key={option} onClick={() => setSelectedOption(option)} className={`w-full text-left p-3 rounded-md border-2 transition-colors ${selectedOption === option ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-100 border-gray-200 hover:bg-gray-200 text-gray-800'}`}>
                            {option}
                        </button>
                    ))}
                </div>
                <Button onClick={handleNextQuestion} disabled={!selectedOption} className="mt-8 w-full">
                    {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
                </Button>
            </Card>
        </div>
    }

    return <div className="p-4 flex items-center justify-center h-full">
        <Card className="max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Generate Quiz</h2>
            <p className="text-gray-500 mb-6">Create a quiz based on the content of "{source.name}".</p>
             <div>
              <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 mb-2">Number of Questions: {numQuestions}</label>
              <input type="range" id="numQuestions" min="3" max="10" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full mt-6">
                {isLoading ? <Spinner size="sm"/> : "Generate"}
            </Button>
            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </Card>
    </div>
};


// Flashcards Component (Internal to SourceView)
const Flashcards: React.FC<{source: Source; addPoints: (amount: number) => void}> = ({ source, addPoints }) => {
    const [numCards, setNumCards] = useState(5);
    const [cards, setCards] = useState<FlashcardType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flashcardHistory, setFlashcardHistory] = useState<string[]>([]);
    
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(`flashcardHistory_${source.id}`);
            if (savedHistory) {
                setFlashcardHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Failed to load flashcard history:", e);
            setFlashcardHistory([]);
        }
    }, [source.id]);

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setCards([]);
        try {
            const generated = await generateFlashcards(source.content, source.name, numCards, flashcardHistory);
            if(generated.length > 0) {
                setCards(generated);
                addPoints(generated.length * 2);
                const newTerms = generated.map(c => c.term);
                const updatedHistory = [...flashcardHistory, ...newTerms];
                setFlashcardHistory(updatedHistory);
                localStorage.setItem(`flashcardHistory_${source.id}`, JSON.stringify(updatedHistory));
            } else {
                setError('Could not generate new flashcards from this source. You may have exhausted all the unique terms.');
            }
        } catch (e) {
            setError('An error occurred while generating flashcards.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (cards.length > 0) {
        return (
            <div className="p-4 h-full flex flex-col items-center justify-center">
                <div className="w-full max-w-2xl">
                    <Flashcard key={currentIndex} term={cards[currentIndex].term} definition={cards[currentIndex].definition} />
                    <div className="flex justify-between items-center mt-6">
                        <Button onClick={() => setCurrentIndex(p => (p - 1 + cards.length) % cards.length)}>Previous</Button>
                        <span className="text-gray-500">{currentIndex + 1} / {cards.length}</span>
                        <Button onClick={() => setCurrentIndex(p => (p + 1) % cards.length)}>Next</Button>
                    </div>
                    <Button onClick={() => setCards([])} variant="secondary" className="w-full mt-4">Create New Deck</Button>
                </div>
            </div>
        );
    }

     return <div className="p-4 flex items-center justify-center h-full">
        <Card className="max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Generate Flashcards</h2>
            <p className="text-gray-500 mb-6">Create flashcards from key terms in "{source.name}".</p>
             <div>
              <label htmlFor="numCards" className="block text-sm font-medium text-gray-700 mb-2">Number of Cards: {numCards}</label>
              <input type="range" id="numCards" min="3" max="15" value={numCards} onChange={(e) => setNumCards(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full mt-6">
                {isLoading ? <Spinner size="sm"/> : "Generate"}
            </Button>
            {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
        </Card>
    </div>
};

// Main SourceView Component
interface SourceViewProps {
  source: Source;
  onBack: () => void;
  onQuizComplete: (subject: string, score: number) => void;
  addPoints: (amount: number) => void;
}

const SourceView: React.FC<SourceViewProps> = ({ source, onBack, onQuizComplete, addPoints }) => {
  const [activeTool, setActiveTool] = useState<'summary' | 'chat' | 'quiz' | 'flashcards'>('summary');

  const renderTool = () => {
    switch (activeTool) {
      case 'summary':
        return <div className="p-4 md:p-6 prose max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{source.summary}</ReactMarkdown></div>;
      case 'chat':
        return <div className="p-4 md:p-6 h-full"><Chat source={source} /></div>;
       case 'quiz':
        return <Quiz source={source} onQuizComplete={onQuizComplete}/>
       case 'flashcards':
        return <Flashcards source={source} addPoints={addPoints} />
      default:
        return null;
    }
  };
  
  const TabButton: React.FC<{tool: 'summary' | 'chat' | 'quiz' | 'flashcards', children: React.ReactNode}> = ({tool, children}) => (
      <button onClick={() => setActiveTool(tool)} className={`px-4 py-2.5 text-sm font-semibold transition-colors relative ${activeTool === tool ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>
          {children}
          {activeTool === tool && <motion.div layoutId="tool-active-pill" className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-600" />}
      </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center space-x-4 shrink-0">
        <Button onClick={onBack} variant="secondary">← Back</Button>
        <div>
          <h1 className="text-xl font-bold truncate text-gray-900">{source.name}</h1>
          <p className="text-sm text-gray-500">Created on {new Date(source.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
      
      {/* Tool Tabs */}
      <div className="px-2 border-b border-gray-200 flex items-center space-x-2 shrink-0">
          <TabButton tool="summary">Summary</TabButton>
          <TabButton tool="chat">Chat</TabButton>
          <TabButton tool="quiz">Quiz</TabButton>
          <TabButton tool="flashcards">Flashcards</TabButton>
      </div>
      
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        <AnimatePresence mode="wait">
            <motion.div
                key={activeTool}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
            >
                {renderTool()}
            </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SourceView;