import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, Subject, QuizQuestion, UserAnswer, Flashcard as FlashcardType } from '../../types';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { generateAssistantResponse, generateSubjectQuiz, generateSubjectFlashcards } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import QuizResults from '../quiz/QuizResults';
import Flashcard from '../flashcards/Flashcard';

type ChatSubject = Subject | 'Other';
type AssistantTool = 'hub' | 'chat' | 'quiz' | 'flashcards';

// Sub-component for the Quiz Generator and Viewer
const SubjectQuiz: React.FC<{ subject: Subject, onBack: () => void }> = ({ subject, onBack }) => {
  const [numQuestions, setNumQuestions] = useState(10);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<UserAnswer[] | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
        setError('Please specify the topics to cover.');
        return;
    }
    setIsLoading(true);
    setError('');
    setQuestions([]);
    setResults(null);
    try {
      const generated = await generateSubjectQuiz(subject, topic, difficulty, numQuestions);
      if (generated.length > 0) {
        setQuestions(generated);
      } else {
        setError('Could not generate a quiz. Please try refining your topics or check the console for errors.');
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
      const finalResults = questions.map((q, i) => ({ ...q, userAnswer: newAnswers[i], isCorrect: q.correctAnswer === newAnswers[i] }));
      setResults(finalResults);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setResults(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
  };
  
  if (results) {
    const analysisContext = `This quiz was about the subject "${subject}" covering topics: ${topic}.`;
    return <div className="p-4"><QuizResults results={results} onRetry={resetQuiz} analysisContext={analysisContext} /></div>
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
    </div>;
  }

  return (
    <div className="p-4 flex items-center justify-center h-full">
      <Card className="max-w-lg w-full">
        <Button onClick={onBack} variant="ghost" className="mb-4 -ml-4">← Back to Hub</Button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Generate Quiz for {subject}</h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">Topics to Cover</label>
            <input type="text" id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., sets, relations, graph theory" className="w-full bg-gray-100 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select id="difficulty" value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-gray-100 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div>
            <label htmlFor="numQuestions" className="block text-sm font-medium text-gray-700 mb-2">Number of Questions: {numQuestions}</label>
            <input type="range" id="numQuestions" min="5" max="20" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Spinner size="sm" /> : "Generate Quiz"}
          </Button>
          {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
        </form>
      </Card>
    </div>
  );
};


// Sub-component for the Flashcard Generator and Viewer
const SubjectFlashcards: React.FC<{ subject: Subject, onBack: () => void }> = ({ subject, onBack }) => {
    const [numCards, setNumCards] = useState(10);
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [cards, setCards] = useState<FlashcardType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('Please specify the topics to cover.');
            return;
        }
        setIsLoading(true);
        setError('');
        setCards([]);
        try {
            const generated = await generateSubjectFlashcards(subject, topic, difficulty, numCards);
            if(generated.length > 0) {
                setCards(generated);
                setCurrentIndex(0);
            } else {
                setError('Could not generate flashcards. Please try refining your topics.');
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
                <Button onClick={() => setCards([])} variant="ghost" className="mb-4 self-start">← Generate New Deck</Button>
                <div className="w-full max-w-2xl">
                    <Flashcard key={currentIndex} term={cards[currentIndex].term} definition={cards[currentIndex].definition} />
                    <div className="flex justify-between items-center mt-6">
                        <Button onClick={() => setCurrentIndex(p => (p - 1 + cards.length) % cards.length)}>Previous</Button>
                        <span className="text-gray-500">{currentIndex + 1} / {cards.length}</span>
                        <Button onClick={() => setCurrentIndex(p => (p + 1) % cards.length)}>Next</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 flex items-center justify-center h-full">
            <Card className="max-w-lg w-full">
                <Button onClick={onBack} variant="ghost" className="mb-4 -ml-4">← Back to Hub</Button>
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Generate Flashcards for {subject}</h2>
                <form onSubmit={handleGenerate} className="space-y-4">
                    <div>
                        <label htmlFor="topic-fc" className="block text-sm font-medium text-gray-700 mb-2">Topics to Cover</label>
                        <input type="text" id="topic-fc" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., sets, relations, logic" className="w-full bg-gray-100 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="difficulty-fc" className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                        <select id="difficulty-fc" value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full bg-gray-100 border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option>Easy</option>
                            <option>Medium</option>
                            <option>Hard</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="numCards" className="block text-sm font-medium text-gray-700 mb-2">Number of Cards: {numCards}</label>
                        <input type="range" id="numCards" min="5" max="25" value={numCards} onChange={(e) => setNumCards(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <Button type="submit" disabled={isLoading} className="w-full">
                        {isLoading ? <Spinner size="sm"/> : "Generate Flashcards"}
                    </Button>
                    {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
                </form>
            </Card>
        </div>
    );
};


const AssistantChat: React.FC<{ subject: ChatSubject, onBackToHub?: () => void, onBackToSubjects: () => void }> = ({ subject, onBackToHub, onBackToSubjects }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const getStorageKey = (sub: ChatSubject) => `assistantChatHistory_${sub}`;

    const getInitialMessage = useCallback(() => {
        const initialMessageText = subject === 'Other' 
            ? "Great! What problem can I help you with?"
            : `I'm ready to help you with ${subject}. Ask me anything!`;
        return { id: `ai-initial-${Date.now()}`, sender: 'ai' as const, text: initialMessageText };
    }, [subject]);

    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem(getStorageKey(subject));
            if (savedHistory) {
                setMessages(JSON.parse(savedHistory));
            } else {
                setMessages([getInitialMessage()]);
            }
        } catch (e) {
            console.error("Failed to load chat history:", e);
        }
    }, [subject, getInitialMessage]);

    useEffect(() => {
        if (messages.length > 1) {
            localStorage.setItem(getStorageKey(subject), JSON.stringify(messages));
        }
    }, [messages, subject]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const handleClearChat = useCallback(() => {
        if (window.confirm("Are you sure you want to clear this conversation? This action cannot be undone.")) {
            setMessages([getInitialMessage()]);
            localStorage.removeItem(getStorageKey(subject));
        }
    }, [subject, getInitialMessage]);

    const handleSend = useCallback(async () => {
        if (input.trim() === '' || isLoading) return;
        const userMessage: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await generateAssistantResponse(newMessages, currentInput, subject);
            const aiMessage: ChatMessage = { id: `ai-${Date.now()}`, sender: 'ai', text: aiResponse };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { id: `ai-error-${Date.now()}`, sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    }, [input, isLoading, messages, subject]);

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto p-4">
             <div className="flex items-center mb-4 shrink-0">
                {subject !== 'Other' 
                    ? <Button variant="secondary" onClick={onBackToHub}>← Back to Hub</Button>
                    : <Button variant="secondary" onClick={onBackToSubjects}>← Back to Subjects</Button>
                }
                <h2 className="text-lg font-bold text-gray-700 ml-4">{subject}</h2>
                {messages.length > 1 && (
                    <Button variant="ghost" onClick={handleClearChat} className="ml-auto text-sm text-gray-500 hover:text-red-600">
                        Clear Chat
                    </Button>
                )}
            </div>
            <div className="flex-1 overflow-y-auto pr-2 pb-4 border-t border-gray-200 pt-4">
                {messages.map((msg) => (
                    <motion.div key={msg.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex w-full mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xl rounded-lg px-4 py-3 shadow-md ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                            <div className="prose max-w-none prose-p:my-2"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown></div>
                        </div>
                    </motion.div>
                ))}
                {isLoading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-4">
                        <div className="max-w-xl px-4 py-3 rounded-lg bg-gray-200 text-gray-800 flex items-center space-x-2"><Spinner size="sm" /> <span>Thinking...</span></div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-auto pt-4 shrink-0">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2 ring-1 ring-transparent focus-within:ring-blue-500 transition border border-gray-200">
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder={`Ask about ${subject}...`} className="flex-1 bg-transparent focus:outline-none p-2 resize-none" rows={1} disabled={isLoading}/>
                    <Button onClick={handleSend} disabled={isLoading || input.trim() === ''}>Send</Button>
                </div>
            </div>
        </div>
    );
};

// Main AssistantView Component
const AssistantView: React.FC = () => {
    const [selectedSubject, setSelectedSubject] = useState<ChatSubject | null>(null);
    const [activeTool, setActiveTool] = useState<AssistantTool | null>(null);

    const subjectOptions: { label: ChatSubject, icon: string }[] = [
        { label: Subject.ResearchMethodology, icon: '🔬' },
        { label: Subject.DataStructures, icon: '💻' },
        { label: Subject.DiscreteMath, icon: '🧮' },
        { label: 'Other', icon: '🌍' },
    ];

    const handleSelectSubject = (subject: ChatSubject) => {
        setSelectedSubject(subject);
        setActiveTool(subject === 'Other' ? 'chat' : 'hub');
    };

    if (!selectedSubject) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <Card className="max-w-2xl w-full text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Hello! I'm BrainBridge</h1>
                    <p className="text-lg text-gray-600 mt-2">Your personal AI assistant. How can I help you with your studies or any other questions you have today?</p>
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjectOptions.map(({ label, icon }) => (
                            <motion.button key={label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleSelectSubject(label)}
                                className="p-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors flex items-center space-x-4">
                                <span className="text-3xl">{icon}</span>
                                <span className="font-semibold text-gray-800">{label}</span>
                            </motion.button>
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    if (selectedSubject !== 'Other' && activeTool === 'hub') {
        const toolOptions = [
            { tool: 'chat' as AssistantTool, label: 'AI Tutor Chat', icon: '💬' },
            { tool: 'quiz' as AssistantTool, label: 'Generate Quiz', icon: '❓' },
            { tool: 'flashcards' as AssistantTool, label: 'Generate Flashcards', icon: '🃏' }
        ];

        return (
            <div className="flex flex-col items-center justify-center h-full p-4">
                <Card className="max-w-2xl w-full">
                    <Button onClick={() => setSelectedSubject(null)} variant="ghost" className="mb-4 -ml-4">← Back to Subjects</Button>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">{selectedSubject}</h1>
                        <p className="text-lg text-gray-600 mt-2">What would you like to do?</p>
                        <div className="mt-8 grid grid-cols-1 gap-4">
                            {toolOptions.map(({ tool, label, icon }) => (
                                <motion.button key={tool} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTool(tool)}
                                    className="p-6 bg-gray-100 hover:bg-gray-200 rounded-lg text-left transition-colors flex items-center space-x-4">
                                    <span className="text-3xl">{icon}</span>
                                    <span className="font-semibold text-gray-800">{label}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    switch(activeTool) {
        case 'chat':
            return <AssistantChat subject={selectedSubject} onBackToHub={() => setActiveTool('hub')} onBackToSubjects={() => setSelectedSubject(null)} />;
        case 'quiz':
            return <SubjectQuiz subject={selectedSubject as Subject} onBack={() => setActiveTool('hub')} />;
        case 'flashcards':
            return <SubjectFlashcards subject={selectedSubject as Subject} onBack={() => setActiveTool('hub')} />;
        default:
            setSelectedSubject(null);
            return null;
    }
};

export default AssistantView;