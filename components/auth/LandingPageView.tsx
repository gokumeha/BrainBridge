import React, { useState, useRef, useEffect } from 'react';
import Button from '../ui/Button';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';

interface LandingPageProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
}

// --- Reusable Animated Components ---

const AnimatedSection: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <motion.section
            ref={ref}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.section>
    );
};

const AnimatedCounter: React.FC<{ to: number, children: React.ReactNode }> = ({ to, children }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView && ref.current) {
            const node = ref.current;
            const controls = animate(0, to, {
                duration: 2,
                onUpdate: (value) => {
                    node.textContent = Math.floor(value).toLocaleString();
                }
            });
            return () => controls.stop();
        }
    }, [isInView, to]);

    return (
        <p className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-sky-500">
            <span ref={ref}>0</span>{children}
        </p>
    );
};

type NavItem = {
    icon: React.ReactNode;
    label: string;
    description: string;
    target: string;
    detailContent?: React.ReactNode;
};

const navItems: { features: NavItem[], solutions: NavItem[], resources: NavItem[], company: NavItem[] } = {
    features: [
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>, 
            label: 'AI Notes', 
            description: 'Intelligent note-taking and summarization.', 
            target: 'detail-features-notes',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">BrainBridge's AI Notes feature is your secret weapon against information overload. It intelligently transforms dense documents, lecture notes, or articles into concise, structured summaries. Instead of spending hours manually highlighting and rewriting, you get the core concepts and key points presented in a clean, digestible format, ready for review.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1524678606370-a47625cb810c?q=80&w=2070&auto=format&fit=crop" alt="AI Notes feature in action" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">How It Works</h3>
                    <ol className="list-decimal list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Upload Your Material:</strong> Simply upload any PDF, text file, or paste text directly into BrainBridge.</li>
                        <li><strong>AI Analysis:</strong> Our advanced AI reads and understands the content, identifying main ideas, key terms, and important definitions.</li>
                        <li><strong>Instant Summary:</strong> In seconds, receive a perfectly formatted summary. You can then chat with the AI tutor to dive deeper into any part of the notes.</li>
                    </ol>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Key Benefits</h3>
                    <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Massive Time Savings:</strong> Condense hours of reading into minutes of focused review.</li>
                        <li><strong>Improved Comprehension:</strong> By focusing on the essentials, you'll grasp complex topics faster.</li>
                        <li><strong>Organized & Searchable:</strong> All your notes are stored in your library, easy to find and review anytime.</li>
                    </ul>
                </>
            )
        },
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>, 
            label: 'AI Web Search', 
            description: 'Context-aware search for relevant information.',
            target: 'detail-features-websearch',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">Go beyond standard search engines. Our AI Web Search understands the context of your study materials to find the most relevant, reliable, and academically-sound information on the web. It's like having a research assistant who knows exactly what you're looking for.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?q=80&w=2070&auto=format&fit=crop" alt="AI Web Search interface" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Why It's Different</h3>
                    <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Contextual Understanding:</strong> The AI uses your document's content to refine search queries, eliminating irrelevant results.</li>
                        <li><strong>Source Vetting:</strong> It prioritizes academic journals, educational websites, and reputable sources to ensure you get high-quality information.</li>
                        <li><strong>Integrated Experience:</strong> Seamlessly pull information from the web directly into your study notes within BrainBridge.</li>
                    </ul>
                </>
            )
        },
        {
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
            label: 'AI Quizzes',
            description: 'Test your knowledge with auto-generated quizzes.',
            target: 'detail-features-quizzes',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">Turn passive reading into active learning. BrainBridge generates challenging quizzes directly from your study materials, helping you solidify your knowledge and prepare for exams. It’s the most effective way to test your comprehension and identify areas that need more focus.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2128&auto=format&fit=crop" alt="Student taking a quiz" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Features</h3>
                    <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Instant Generation:</strong> Create a quiz with a single click, anytime you need to study.</li>
                        <li><strong>Customizable Length:</strong> Choose how many questions you want to test your knowledge.</li>
                        <li><strong>AI-Powered Feedback:</strong> Get detailed explanations for incorrect answers to understand where you went wrong.</li>
                    </ul>
                </>
            )
        },
        {
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V4a2 2 0 012-2h8a2 2 0 012 2v4z"></path></svg>,
            label: 'AI Tutor',
            description: 'Get 24/7 help from your personal AI tutor.',
            target: 'detail-features-tutor',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">Never get stuck on a concept again. Our AI Tutor provides instant, one-on-one help based on your uploaded materials. Ask complex questions, request examples, or have it explain topics in a different way. It's like having a teaching assistant available 24/7.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1531482615713-2c6596908c07?q=80&w=1974&auto=format&fit=crop" alt="AI Tutor helping a student" className="rounded-xl shadow-2xl w-full" /></div>
                     <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">How it Helps</h3>
                     <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Instant Clarification:</strong> Get answers to your questions immediately, without waiting for office hours.</li>
                        <li><strong>Deeper Understanding:</strong> Ask follow-up questions until you fully grasp the material.</li>
                        <li><strong>Personalized Pace:</strong> Learn at your own speed, with a tutor that never gets tired.</li>
                    </ul>
                </>
            )
        },
         {
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7"></path></svg>,
            label: 'AI Summarization',
            description: 'Condense long documents into key points.',
            target: 'detail-features-summarization',
             detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">The core of smart studying is efficiency. Our AI Summarization tool reads entire documents—textbooks, articles, research papers—and extracts the most critical information. It delivers a concise summary that captures the essence of the material, saving you hours of reading.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2072&auto=format&fit=crop" alt="Summarized notes on a clipboard" className="rounded-xl shadow-2xl w-full" /></div>
                     <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Perfect For</h3>
                     <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Quick Previews:</strong> Understand what a document is about before diving in.</li>
                        <li><strong>Exam Review:</strong> Quickly refresh your memory on key topics from all your sources.</li>
                        <li><strong>Research:</strong> Rapidly assess the relevance of multiple papers or articles.</li>
                    </ul>
                </>
            )
        },
        {
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>,
            label: 'AI Flashcards',
            description: 'Create flashcard decks automatically.',
            target: 'detail-features-flashcards',
             detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">Active recall is scientifically proven to boost memory retention. BrainBridge's AI automatically creates flashcard decks from your notes, identifying key terms and definitions. Ditch the tedious process of manual card creation and start memorizing what matters.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?q=80&w=2076&auto=format&fit=crop" alt="Flashcards on a board" className="rounded-xl shadow-2xl w-full" /></div>
                     <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Features</h3>
                     <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>One-Click Creation:</strong> Instantly generate a deck of flashcards from any document.</li>
                        <li><strong>Interactive Studying:</strong> Flip cards to reveal definitions and test your memory.</li>
                        <li><strong>Focused Learning:</strong> Reinforce key concepts and vocabulary efficiently.</li>
                    </ul>
                </>
            )
        },
    ],
    solutions: [
         { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>, 
            label: 'For Students', 
            description: 'Ace your exams and understand complex topics.',
            target: 'detail-solutions-students',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">BrainBridge is the ultimate tool for students looking to excel. Whether you're in high school or university, our AI companion helps you cut through the noise, focus on what's important, and study more effectively. Stop cramming and start learning with confidence.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" alt="Group of students studying together" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Transform Your Study Habits</h3>
                    <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Prepare for Exams:</strong> Instantly create summaries, flashcards, and practice quizzes for any subject.</li>
                        <li><strong>Write Better Essays:</strong> Use the AI Tutor to understand complex sources and clarify your arguments.</li>
                        <li><strong>Manage Your Time:</strong> Stay on track with the built-in Focus Timer and boost your productivity.</li>
                    </ul>
                </>
            )
        },
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>, 
            label: 'For Professionals', 
            description: 'Master new skills and stay ahead in your career.',
            target: 'detail-solutions-professionals',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">In a fast-paced world, continuous learning is key to professional growth. BrainBridge helps you quickly digest reports, articles, and training materials. Get the insights you need to make informed decisions and master new skills without sacrificing your valuable time.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" alt="Professionals in a meeting" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Enhance Your Workflow</h3>
                    <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Meeting Preparation:</strong> Summarize long reports and briefs in minutes to be fully prepared.</li>
                        <li><strong>Skill Development:</strong> Quickly learn from online courses, documentation, and industry articles.</li>
                        <li><strong>Knowledge Management:</strong> Build a personal library of summarized content for easy reference.</li>
                    </ul>
                </>
            )
        },
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>, 
            label: 'For Creators', 
            description: 'Accelerate your research and content creation.',
            target: 'detail-solutions-creators',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">Content creation starts with great research. BrainBridge is the perfect partner for writers, YouTubers, and podcasters. Rapidly analyze sources, gather key information, and find inspiration for your next masterpiece. Spend less time researching and more time creating.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop" alt="Creator planning content on a wall" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Streamline Your Creative Process</h3>
                    <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Effortless Research:</strong> Summarize articles, studies, and videos to quickly gather facts and ideas.</li>
                        <li><strong>Beat Writer's Block:</strong> Use the AI Tutor to brainstorm and explore different angles on a topic.</li>
                        <li><strong>Fact-Checking:</strong> Quickly reference your summarized sources to ensure accuracy in your content.</li>
                    </ul>
                </>
            )
        },
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>, 
            label: 'For Educators', 
            description: 'Create engaging materials and support students.',
            target: 'detail-solutions-educators',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">Empower your teaching with AI. BrainBridge helps educators create high-quality learning materials, from lecture summaries to practice quizzes, in a fraction of the time. It's a powerful tool for differentiating instruction and providing supplementary support for your students.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop" alt="Educator presenting to a group" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Innovate in the Classroom</h3>
                    <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Lesson Planning:</strong> Quickly summarize core texts and articles to build your lesson plans.</li>
                        <li><strong>Material Creation:</strong> Generate quizzes and flashcards to supplement your teaching.</li>
                        <li><strong>Student Support:</strong> Recommend BrainBridge to students as a tool for independent study and revision.</li>
                    </ul>
                </>
            )
        },
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>, 
            label: 'For Business', 
            description: 'Drive productivity and informed decision-making.',
            target: 'detail-solutions-business',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">BrainBridge for Business empowers your teams to work smarter. From onboarding new hires with training materials to keeping stakeholders informed with concise reports, our platform streamlines knowledge sharing and boosts productivity across your entire organization.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1887&auto=format&fit=crop" alt="Business team collaborating" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Unlock Your Team's Potential</h3>
                    <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Efficient Onboarding:</strong> Summarize documentation and training manuals for new employees.</li>
                        <li><strong>Market Research:</strong> Quickly analyze industry reports, competitor analyses, and articles.</li>
                        <li><strong>Internal Communication:</strong> Create executive summaries of long documents for faster decision-making.</li>
                    </ul>
                </>
            )
        },
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>, 
            label: 'For Institutions', 
            description: 'Provide campus-wide AI learning support.',
            target: 'detail-solutions-institutions',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">Equip your entire campus with a cutting-edge AI learning tool. BrainBridge offers institutional packages that provide students and faculty with access to our powerful study companion. Enhance your academic offerings and support student success at scale.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1974&auto=format&fit=crop" alt="University campus building" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">A Partner in Education</h3>
                    <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Campus-Wide Access:</strong> Provide a valuable resource to every student and faculty member.</li>
                        <li><strong>Improve Learning Outcomes:</strong> Support diverse learning styles and help students study more effectively.</li>
                        <li><strong>Promote Academic Integrity:</strong> The AI Tutor is designed to explain, not plagiarize, fostering true understanding.</li>
                    </ul>
                </>
            )
        },
    ],
    resources: [
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>, 
            label: 'FAQ', 
            description: 'Find answers to common questions.',
            target: 'detail-resources-faq',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">Have questions? We've got answers. Browse our Frequently Asked Questions to find information about our features, account management, and how to get the most out of BrainBridge.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1553775282-20af807797d5?q=80&w=1932&auto=format&fit=crop" alt="Question marks" className="rounded-xl shadow-2xl w-full" /></div>
                    <div className="space-y-6 text-lg text-gray-700">
                        <div>
                            <h3 className="font-semibold text-gray-900">What types of files can I upload?</h3>
                            <p>You can upload PDF and TXT files, paste in text directly, or provide a YouTube video URL.</p>
                        </div>
                         <div>
                            <h3 className="font-semibold text-gray-900">Is my data secure?</h3>
                            <p>Yes, we prioritize your privacy. All your uploaded documents and data are stored securely and are only accessible by you.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Can the AI Tutor help with any subject?</h3>
                            <p>The AI Tutor's knowledge is based on the document you provide it, so it can help with virtually any subject as long as you upload the relevant material!</p>
                        </div>
                    </div>
                </>
            )
        },
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>, 
            label: 'Blog', 
            description: 'Read articles on learning and productivity.',
            target: 'detail-resources-blog',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">Explore our blog for the latest tips on effective studying, productivity hacks, and how to leverage AI in your learning journey. Our articles are written to help you succeed both in and out of the classroom.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop" alt="Person writing on a laptop at a coffee shop" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Featured Topics</h3>
                     <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li>The Science of Active Recall</li>
                        <li>How to Beat Procrastination with the Pomodoro Technique</li>
                        <li>5 Ways AI is Revolutionizing Education</li>
                    </ul>
                </>
            )
        },
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>, 
            label: 'Help Center', 
            description: 'Get support and find tutorials.',
            target: 'detail-resources-help',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">Welcome to the BrainBridge Help Center. Here you can find step-by-step tutorials, video guides, and detailed documentation to help you master every feature of the platform. If you can't find what you're looking for, our support team is just a click away.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1559526324-c1f275fbfa32?q=80&w=2070&auto=format&fit=crop" alt="Customer support setting" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Support Categories</h3>
                     <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li>Getting Started</li>
                        <li>Managing Your Library</li>
                        <li>Using the AI Tools</li>
                        <li>Account & Billing</li>
                    </ul>
                </>
            )
        },
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>, 
            label: 'Community', 
            description: 'Connect with other learners.',
            target: 'detail-resources-community',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">Join the BrainBridge community to connect with thousands of other students, professionals, and lifelong learners. Share study tips, discuss interesting topics, and collaborate with others on your learning journey.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" alt="Community of learners" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Get Involved</h3>
                     <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li>Join our Discord Server</li>
                        <li>Follow us on Social Media</li>
                        <li>Participate in community challenges and events</li>
                    </ul>
                </>
            )
        },
    ],
    company: [
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>, 
            label: 'Contact Us', 
            description: 'Get in touch with the BrainBridge team.',
            target: 'detail-company-contact',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">We'd love to hear from you! Whether you have a question, a suggestion, or a partnership inquiry, our team is ready to help. Reach out to us and we'll get back to you as soon as possible.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=1974&auto=format&fit=crop" alt="Contact icons" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Contact Channels</h3>
                     <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>General Inquiries:</strong> hello@brainbridge.ai</li>
                        <li><strong>Support:</strong> support@brainbridge.ai</li>
                        <li><strong>Press & Media:</strong> press@brainbridge.ai</li>
                    </ul>
                </>
            )
        },
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>, 
            label: 'Our Values', 
            description: 'The principles that guide our work.',
            target: 'detail-company-values',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">At BrainBridge, we are driven by a passion for education and technology. Our mission is to make learning more accessible, effective, and enjoyable for everyone. These core values guide every decision we make.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1542626991-a2f5752b4129?q=80&w=2070&auto=format&fit=crop" alt="Inspirational words on sticky notes" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Our Core Principles</h3>
                     <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Empower Learners:</strong> We build tools that put the power of learning directly in the user's hands.</li>
                        <li><strong>Innovate Responsibly:</strong> We are committed to developing AI ethically and for the benefit of education.</li>
                        <li><strong>Strive for Simplicity:</strong> Powerful technology should be easy and intuitive to use.</li>
                    </ul>
                </>
            )
        },
        { 
            icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>, 
            label: 'Affiliate Program', 
            description: 'Partner with us and earn rewards.',
            target: 'detail-company-affiliate',
            detailContent: (
                <>
                    <p className="lead text-xl md:text-2xl text-gray-600 mb-8">Love BrainBridge? Join our Affiliate Program and earn rewards for spreading the word! Our program is perfect for educators, content creators, and anyone passionate about the future of learning.</p>
                    <div className="my-12"><img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=2070&auto=format&fit=crop" alt="Partners shaking hands" className="rounded-xl shadow-2xl w-full" /></div>
                    <h3 className="text-3xl font-bold mt-12 mb-4 text-gray-800">Program Benefits</h3>
                     <ul className="list-disc list-inside space-y-4 text-lg text-gray-700">
                        <li><strong>Generous Commissions:</strong> Earn a competitive commission for every new user you refer.</li>
                        <li><strong>Marketing Resources:</strong> Get access to a library of banners, links, and content to help you promote BrainBridge.</li>
                        <li><strong>Dedicated Support:</strong> Our affiliate team is here to help you succeed.</li>
                    </ul>
                </>
            )
        },
    ]
};

const allNavItems = [...navItems.features, ...navItems.solutions, ...navItems.resources, ...navItems.company];

// --- Sub-Pages Components ---

const DetailPage: React.FC<{item: NavItem, onLoginClick: () => void}> = ({ item, onLoginClick }) => {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
             <AnimatedSection>
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">{item.label}</h1>
                <h2 className="text-xl text-gray-500">{item.description}</h2>
             </AnimatedSection>
             <AnimatedSection className="mt-12">
                {item.detailContent}
             </AnimatedSection>
             <AnimatedSection className="mt-20 text-center">
                 <h2 className="text-3xl font-bold text-gray-800">Ready to transform your learning?</h2>
                <p className="text-lg text-gray-600 mt-2 mb-6">Would you like to see for yourself?</p>
                <Button onClick={onLoginClick} className="px-8 py-3 text-lg">
                    Log in to Get Started
                </Button>
            </AnimatedSection>
        </div>
    )
}

const OverviewPage: React.FC<{
    title: string;
    description: string;
    items: NavItem[];
    onItemClick: (target: string) => void;
}> = ({ title, description, items, onItemClick }) => {
    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <AnimatedSection className="text-center mb-12">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-4">{title}</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">{description}</p>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map((item, index) => (
                    <motion.div
                        key={item.target}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                         <div onClick={() => onItemClick(item.target)} className="h-full bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer border border-gray-100 flex flex-col">
                            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">{item.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">{item.label}</h3>
                            <p className="text-gray-600 flex-grow">{item.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

// --- Main Page Components ---

const HomePage: React.FC<{ onSignUpClick: () => void }> = ({ onSignUpClick }) => {
    return (
        <>
            <AnimatedSection className="text-center pt-20 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
                        Your Personal AI <br/>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-sky-500">
                            Study Companion
                        </span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-600">
                        Learn faster, retain more, and ace your classes. BrainBridge transforms your documents into interactive notes, quizzes, and a 24/7 AI tutor.
                    </p>
                    <div className="mt-10 flex justify-center items-center gap-4">
                        <Button onClick={onSignUpClick} className="px-8 py-4 text-lg">
                            Get Started Free
                        </Button>
                    </div>
                    <p className="mt-4 text-sm text-gray-500">Trusted by students and professionals worldwide.</p>
                </motion.div>
            </AnimatedSection>

            <AnimatedSection className="text-center py-16 px-4">
                 <h2 className="text-4xl font-bold text-gray-900 mb-4">See BrainBridge in Action</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
                    From a dense PDF to a dynamic learning experience. Watch how our AI transforms your study materials in seconds.
                </p>
                <div className="mt-10 max-w-5xl mx-auto">
                    <img
                        src="https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2231&auto=format&fit=crop"
                        alt="BrainBridge application dashboard"
                        className="rounded-2xl shadow-2xl shadow-gray-300/60 border border-gray-200"
                    />
                </div>
            </AnimatedSection>
            
            <AnimatedSection className="py-20 px-4">
                 <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-900">How It Works in 3 Simple Steps</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-2 mb-12">Unlock a smarter way to learn with a seamless workflow designed for efficiency.</p>
                 </div>
                 <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                     <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg">
                         <div className="text-5xl mb-4">📤</div>
                         <h3 className="text-2xl font-bold mb-2">1. Upload Anything</h3>
                         <p>Upload PDFs, paste text, or link a YouTube video. Your entire course material, ready in one place.</p>
                     </div>
                     <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg">
                         <div className="text-5xl mb-4">✨</div>
                         <h3 className="text-2xl font-bold mb-2">2. Get Instant Insights</h3>
                         <p>Our AI instantly generates summaries, flashcards, and quizzes from your content.</p>
                     </div>
                     <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg">
                         <div className="text-5xl mb-4">🧠</div>
                         <h3 className="text-2xl font-bold mb-2">3. Master Your Subjects</h3>
                         <p>Chat with your AI tutor and take practice quizzes until you've mastered the topic.</p>
                     </div>
                 </div>
            </AnimatedSection>

            <AnimatedSection className="py-20 px-4">
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                    <div>
                         <h2 className="text-4xl font-bold text-gray-900 mb-4">Stop Cramming, Start Understanding</h2>
                        <p className="text-lg text-gray-600 space-y-4">
                            Traditional studying is inefficient. You spend hours reading and re-reading, only to forget most of it.
                            <br/><br/>
                            BrainBridge uses proven learning techniques like active recall and spaced repetition, all powered by AI. It helps you focus on understanding the core concepts, not just memorizing facts for an exam.
                        </p>
                    </div>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg text-center">
                            <AnimatedCounter to={90}>%</AnimatedCounter>
                            <p className="font-semibold text-gray-600">Improved Test Scores</p>
                        </div>
                         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg text-center mt-6">
                            <AnimatedCounter to={10}>x</AnimatedCounter>
                            <p className="font-semibold text-gray-600">Faster Than Traditional Study</p>
                        </div>
                         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg text-center">
                            <AnimatedCounter to={50}>%</AnimatedCounter>
                            <p className="font-semibold text-gray-600">Less Study Time Required</p>
                        </div>
                         <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg text-center mt-6">
                            <AnimatedCounter to={1000}>+</AnimatedCounter>
                             <p className="font-semibold text-gray-600">Hours Saved by Students</p>
                        </div>
                    </div>
                </div>
            </AnimatedSection>
            
             <AnimatedSection className="py-20 px-4">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-900">Who is BrainBridge For?</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-2 mb-12">Our platform is designed to help anyone who wants to learn more effectively.</p>
                </div>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div whileHover={{y: -10}} className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg text-center">
                        <div className="text-4xl mb-4">🎓</div>
                        <h3 className="text-xl font-bold mb-2">Students</h3>
                        <p>Ace exams, write better papers, and understand complex topics with ease.</p>
                    </motion.div>
                    <motion.div whileHover={{y: -10}} className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg text-center">
                        <div className="text-4xl mb-4">💼</div>
                        <h3 className="text-xl font-bold mb-2">Professionals</h3>
                        <p>Master new skills, prepare for meetings, and stay ahead in your career.</p>
                    </motion.div>
                     <motion.div whileHover={{y: -10}} className="bg-white p-8 rounded-xl border border-gray-100 shadow-lg text-center">
                        <div className="text-4xl mb-4">💡</div>
                        <h3 className="text-xl font-bold mb-2">Lifelong Learners</h3>
                        <p>Explore new interests and digest books and articles more efficiently than ever.</p>
                    </motion.div>
                </div>
            </AnimatedSection>
            
             <AnimatedSection className="py-20 px-4">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-2 mb-12">Have questions? We have answers. Here are some common things people ask.</p>
                </div>
                <div className="max-w-3xl mx-auto space-y-4">
                    {[
                        { q: "What types of files can I upload?", a: "You can upload PDF and TXT files, paste in text directly, or provide a YouTube video URL for summarization." },
                        { q: "Is my data private and secure?", a: "Absolutely. We prioritize your privacy and security. Your data is encrypted and never shared. You own your content." },
                        { q: "How does the AI Tutor work?", a: "The AI Tutor is a conversational AI that has 'read' your uploaded document. You can ask it questions, request examples, or ask for explanations, and it will answer based only on the context of your material." },
                        { q: "Can I use BrainBridge on my phone?", a: "Yes! BrainBridge is fully responsive and works beautifully on desktops, tablets, and mobile phones, so you can study anywhere." }
                    ].map((faq, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                             <h3 className="font-semibold text-lg text-gray-900">{faq.q}</h3>
                            <p className="text-gray-600 mt-1">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </AnimatedSection>

            <AnimatedSection className="text-center py-20 px-4">
                <h2 className="text-4xl font-bold text-gray-900">Ready to Revolutionize Your Studying?</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                    Join thousands of learners who are already studying smarter, not harder. Get started for free today.
                </p>
                <div className="mt-8">
                    <Button onClick={onSignUpClick} className="px-10 py-4 text-xl">
                        Sign Up for Free
                    </Button>
                </div>
            </AnimatedSection>
        </>
    );
};


// --- Main Landing Page Component ---
const LandingPageView: React.FC<LandingPageProps> = ({ onLoginClick, onSignUpClick }) => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  
  const handleSetPage = (page: string) => {
    if (page !== currentPage) {
      setPageHistory(prev => [...prev, currentPage]);
      setCurrentPage(page);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (pageHistory.length > 0) {
      const previousPage = pageHistory[pageHistory.length - 1];
      setPageHistory(prev => prev.slice(0, -1));
      setCurrentPage(previousPage);
      window.scrollTo(0, 0);
    }
  };
  
  const renderCurrentPage = () => {
    if (currentPage === 'home') {
        return <HomePage onSignUpClick={onSignUpClick} />;
    }
    if (currentPage === 'features') {
        return <OverviewPage title="Features" description="Explore the powerful AI tools that make BrainBridge the ultimate study companion." items={navItems.features} onItemClick={handleSetPage} />;
    }
    if (currentPage === 'solutions') {
        return <OverviewPage title="Solutions" description="Discover how BrainBridge can be tailored to your specific learning and professional needs." items={navItems.solutions} onItemClick={handleSetPage} />;
    }
    if (currentPage === 'resources') {
        return <OverviewPage title="Resources" description="Find helpful articles, guides, and support to get the most out of your experience." items={navItems.resources} onItemClick={handleSetPage} />;
    }
    if (currentPage === 'company') {
        return <OverviewPage title="Company" description="Learn more about our mission, our values, and how you can get in touch with the BrainBridge team." items={navItems.company} onItemClick={handleSetPage} />;
    }
    const detailItem = allNavItems.find(item => item.target === currentPage);
    if (detailItem) {
        return <DetailPage item={detailItem} onLoginClick={onLoginClick} />;
    }
    return <HomePage onSignUpClick={onSignUpClick} />; // Fallback
  };
  
  const Dropdown: React.FC<{ items: NavItem[], title: string, onOverviewClick: (target: string) => void }> = ({ items, title, onOverviewClick }) => (
    <div className="group relative">
      <button onClick={() => onOverviewClick(title.toLowerCase())} className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors">{title}</button>
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-80 bg-white rounded-xl shadow-2xl p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto z-50 border border-gray-100">
        <div className="font-bold text-gray-900 mb-2 px-3 py-1 text-sm cursor-pointer hover:text-blue-600 hover:bg-gray-100 rounded-md" onClick={(e) => { e.stopPropagation(); onOverviewClick(title.toLowerCase()); }}>View All {title}</div>
        <div className="space-y-1">
          {items.map(item => (
            <div key={item.target} onClick={() => handleSetPage(item.target)} className="flex items-start p-3 rounded-lg hover:bg-gray-100 cursor-pointer">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">{item.icon}</div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans">
        <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
            <motion.div 
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                className="flex items-center justify-between p-2 bg-white/70 backdrop-blur-xl rounded-full shadow-lg border border-gray-200/80"
            >
                <div className="flex items-center">
                    <AnimatePresence>
                     {pageHistory.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            onClick={handleBack}
                            className="p-2 rounded-full hover:bg-gray-200 transition-colors mx-1"
                            aria-label="Go back"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                          </svg>
                        </motion.button>
                     )}
                    </AnimatePresence>
                    <Button variant="secondary" onClick={onLoginClick} className="ml-2">Log In</Button>
                </div>
                <nav className="hidden md:flex">
                  <Dropdown items={navItems.features} title="Features" onOverviewClick={handleSetPage} />
                  <Dropdown items={navItems.solutions} title="Solutions" onOverviewClick={handleSetPage} />
                  <Dropdown items={navItems.resources} title="Resources" onOverviewClick={handleSetPage} />
                  <Dropdown items={navItems.company} title="Company" onOverviewClick={handleSetPage} />
                </nav>
                <div onClick={() => handleSetPage('home')} className="flex items-center space-x-2 cursor-pointer pr-3">
                    <div className="bg-blue-600 p-2 rounded-full shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22V2M12 2H8a4 4 0 00-4 4v4a4 4 0 004 4h4zm0 0h4a4 4 0 004-4V6a4 4 0 00-4-4h-4" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg text-gray-900 hidden sm:block">BrainBridge</span>
                </div>
            </motion.div>
        </header>

        <main className="pt-24">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                    {renderCurrentPage()}
                </motion.div>
            </AnimatePresence>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-20">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                     <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Features</h3>
                         <ul className="mt-4 space-y-4">
                            {navItems.features.map(item => <li key={item.target}><button onClick={() => handleSetPage(item.target)} className="text-base text-gray-500 hover:text-gray-900">{item.label}</button></li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Solutions</h3>
                         <ul className="mt-4 space-y-4">
                            {navItems.solutions.map(item => <li key={item.target}><button onClick={() => handleSetPage(item.target)} className="text-base text-gray-500 hover:text-gray-900">{item.label}</button></li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
                         <ul className="mt-4 space-y-4">
                            {navItems.resources.map(item => <li key={item.target}><button onClick={() => handleSetPage(item.target)} className="text-base text-gray-500 hover:text-gray-900">{item.label}</button></li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
                         <ul className="mt-4 space-y-4">
                            {navItems.company.map(item => <li key={item.target}><button onClick={() => handleSetPage(item.target)} className="text-base text-gray-500 hover:text-gray-900">{item.label}</button></li>)}
                        </ul>
                    </div>
                </div>
                <div className="mt-8 border-t border-gray-200 pt-8 flex items-center justify-between">
                    <p className="text-base text-gray-400">&copy; {new Date().getFullYear()} BrainBridge. All rights reserved.</p>
                </div>
            </div>
        </footer>
    </div>
  );
};

export default LandingPageView;