import { GoogleGenAI, Type, Modality, Blob, LiveServerMessage } from "@google/genai";
import { ChatMessage, QuizQuestion, Flashcard, UserAnswer, Subject } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const QUIZ_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      correctAnswer: { type: Type.STRING },
    },
    required: ["question", "options", "correctAnswer"],
  },
};

const FLASHCARD_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      term: { type: Type.STRING },
      definition: { type: Type.STRING },
    },
    required: ["term", "definition"],
  },
};

export const analyzeAssignment = async (content: string, subject: Subject | 'Other', fileName: string): Promise<string> => {
    try {
        const model = 'gemini-2.5-flash';
        let subjectSpecificInstructions = '';

        switch (subject) {
            case Subject.DataStructures:
                subjectSpecificInstructions = `Since the subject is Data Structures & Applications, pay close attention to the code. Specifically analyze:
                - **Algorithmic Complexity:** Evaluate the time and space complexity (Big O notation) of the solution.
                - **Correctness & Edge Cases:** Identify any logical bugs, errors, or unhandled edge cases.
                - **Best Practices:** Comment on coding style, variable naming, and use of appropriate data structures.
                - **Optimization:** Suggest more efficient algorithms or data structures if applicable.`;
                break;
            case Subject.ResearchMethodology:
                subjectSpecificInstructions = `Since the subject is Research Methodology and IPR, focus your analysis on the academic and structural aspects of the document. Specifically analyze:
                - **Research Question:** Is the research question clear, focused, and answerable?
                - **Literature Review:** Does the work show an understanding of existing literature? (Acknowledge this might be a brief review).
                - **Methodology:** Is the chosen methodology appropriate for the research question?
                - **IPR Considerations:** Briefly mention any potential Intellectual Property Rights considerations like plagiarism, proper citation, or data ownership that might be relevant.`;
                break;
            case Subject.DiscreteMath:
                subjectSpecificInstructions = `Since the subject is Discrete Mathematical Structures, focus on logical and mathematical correctness. Specifically analyze:
                - **Proof & Logic:** Is the logical flow of proofs or solutions sound? Are there any logical fallacies?
                - **Correctness:** Are the calculations and application of theorems correct?
                - **Clarity & Notation:** Is the mathematical notation used correctly and is the explanation clear?
                - **Problem-Solving Approach:** Comment on the method used to solve the problems.`;
                break;
            default:
                subjectSpecificInstructions = `The subject is not one of the core areas, so provide general-purpose feedback. Focus on clarity, structure, and the main arguments or points made in the document.`;
        }

        const prompt = `You are an expert AI academic advisor providing feedback on a student's assignment.
        Your tone should be encouraging, constructive, and actionable. You are a helpful guide, not a harsh critic.

        The student has uploaded a file named "${fileName}" for the subject "${subject}".

        **Your Task:**
        1.  Carefully analyze the content of the file provided below.
        2.  Apply the following subject-specific instructions:
            ${subjectSpecificInstructions}
        3.  Structure your feedback using the following markdown format:

        ### Overall Feedback
        Start with a brief, encouraging summary of the work.

        ### ✅ Strengths
        - List 2-3 specific things the student did well. Be positive and specific.

        ### 💡 Areas for Improvement
        - List 2-3 areas where the student could improve. Frame these constructively.

        ###  actionable="" suggestions="">
        - Provide clear, specific, and actionable suggestions for improvement based on the points above.
        - If applicable, include references to key concepts or provide a small example.

        ---
        **FILE CONTENT TO ANALYZE:**
        \`\`\`
        ${content}
        \`\`\`
        `;

        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;

    } catch (error) {
        console.error("Error analyzing assignment:", error);
        return "I'm sorry, I encountered an error while analyzing your assignment. Please try again.";
    }
};

export const summarizeForSource = async (content: string, type: 'pdf' | 'text', name: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const contentType = 'document';
    const prompt = `Summarize the following ${contentType} titled "${name}" into concise key points and definitions suitable for a student's study notes. Structure the output as clean markdown. Start with a heading, use bullet points for key concepts, and bold important terms.\n\nDOCUMENT CONTENT:\n${content.substring(0, 30000)}`;
    
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error generating source summary:", error);
    return "Could not generate a summary for this source.";
  }
}

export const generateChatResponse = async (history: ChatMessage[], newMessage: string, sourceContent: string, sourceName: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are an expert AI tutor. Your knowledge is strictly limited to the provided document. Answer the user's questions based *only* on the following content. Do not use any external knowledge. If the answer is not in the document, say "I can only answer questions based on the provided document." The document is titled "${sourceName}".\n\nDOCUMENT CONTENT:\n${sourceContent}`;

    const contents = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    const response = await ai.models.generateContent({
      model,
      contents: contents,
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating chat response:", error);
    return "I'm sorry, I encountered an error. Please try again.";
  }
};

export const generateAssistantResponse = async (history: ChatMessage[], newMessage: string, subject: Subject | 'Other'): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    let systemInstruction = '';

    switch (subject) {
        case Subject.DataStructures:
            systemInstruction = `You are a chatbot specialising in Data Structures & Applications (DSA). When a student asks a question, explain clearly, give a code example (in Python or Java), highlight common mistakes, and propose a small practice problem at the end. Maintain a friendly tone. If the question is outside DSA, respond with: ‘That falls under Other Subjects — here’s a quick answer, but for a deep dive please use the Other Subjects category.’`;
            break;
        case Subject.ResearchMethodology:
            systemInstruction = `You are a chatbot specialising in Research Methodology and Intellectual Property Rights (RMI). When a student asks a question, explain the concept clearly, provide a real-world example of its application, highlight common misunderstandings or ethical considerations, and propose a small thought-provoking question at the end. Maintain a professional, academic tone. If the question is outside RMI, respond with: ‘That falls under Other Subjects — here’s a quick answer, but for a deep dive please use the Other Subjects category.’`;
            break;
        case Subject.DiscreteMath:
            systemInstruction = `You are a chatbot specialising in Discrete Mathematical Structures (DMS). When a student asks a question, explain the mathematical concept clearly, provide a step-by-step example or proof, highlight common pitfalls in logic or calculation, and propose a related practice problem at the end. Maintain a clear and logical tone. If the question is outside DMS, respond with: ‘That falls under Other Subjects — here’s a quick answer, but for a deep dive please use the Other Subjects category.’`;
            break;
        case 'Other':
        default:
            systemInstruction = `You are BrainBridge, a friendly, encouraging, and knowledgeable AI assistant. Your primary goal is to help students with their studies and answer their general questions. Be versatile, helpful, and maintain a positive and supportive tone. Format your answers clearly using markdown where appropriate.`;
            break;
    }


    const contents = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: msg.text }]
    }));
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    const response = await ai.models.generateContent({
      model,
      contents: contents,
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error generating assistant response:", error);
    return "I'm sorry, I encountered an error. Please try again.";
  }
};

export const generateSubjectQuiz = async (subject: Subject, topic: string, difficulty: string, count: number): Promise<QuizQuestion[]> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `You are an expert academic question generator for the university-level subject: "${subject}".
    Your task is to create a multiple-choice quiz.

    Instructions:
    1.  Generate exactly ${count} questions.
    2.  The questions must cover these specific topics: ${topic}.
    3.  The difficulty level must be "${difficulty}" for an undergraduate student.
    4.  Each question must have exactly four unique options.
    5.  One option must be the single, unambiguously correct answer.
    6.  The correct answer must be present within the options list.
    
    Do not generate questions outside of the specified topics or subject.`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUIZ_SCHEMA,
      }
    });
    
    const parsedResponse = JSON.parse(response.text);
    return parsedResponse.slice(0, count);
  } catch (error) {
    console.error("Error generating subject quiz:", error);
    return [];
  }
};

export const generateSubjectFlashcards = async (subject: Subject, topic: string, difficulty: string, count: number): Promise<Flashcard[]> => {
    try {
        const model = 'gemini-2.5-flash';
        const prompt = `You are an expert academic content creator for the university-level subject: "${subject}".
        Your task is to create a set of flashcards.

        Instructions:
        1.  Generate exactly ${count} flashcards.
        2.  The flashcards must cover these specific topics: ${topic}.
        3.  The difficulty level should be "${difficulty}" for an undergraduate student.
        4.  Each flashcard must have a 'term' (a question or concept) and a 'definition' (a concise, accurate answer).
        
        Do not generate flashcards outside of the specified topics or subject.`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: FLASHCARD_SCHEMA,
            }
        });

        const parsedResponse = JSON.parse(response.text);
        return parsedResponse.slice(0, count);
    } catch (error) {
        console.error("Error generating subject flashcards:", error);
        return [];
    }
};

export const generateQuiz = async (sourceContent: string, sourceName: string, numQuestions: number, history: string[] = []): Promise<QuizQuestion[]> => {
  try {
    const model = 'gemini-2.5-flash';
    let prompt = `Generate a ${numQuestions}-question multiple-choice quiz based *exclusively* on the following document content, which is from a source titled "${sourceName}". The questions should cover key concepts from the text. The options should be challenging but fair. Ensure one option is clearly the correct answer, and the correct answer must be one of the provided options.`;

    if (history.length > 0) {
      prompt += `\n\nIMPORTANT: Avoid generating questions that are the same as or very similar to the questions in the following list of previously asked questions:\n\nPREVIOUS QUESTIONS:\n- ${history.join('\n- ')}`;
    }

    prompt += `\n\nDOCUMENT CONTENT:\n${sourceContent}`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: QUIZ_SCHEMA,
      }
    });
    
    const parsedResponse = JSON.parse(response.text);
    return parsedResponse.slice(0, numQuestions);
  } catch (error) {
    console.error("Error generating quiz:", error);
    return [];
  }
};

export const generateFlashcards = async (sourceContent: string, sourceName: string, numCards: number, history: string[] = []): Promise<Flashcard[]> => {
  try {
    const model = 'gemini-2.5-flash';
    let prompt = `Generate ${numCards} flashcards based *only* on the key terms and concepts found in the following document titled "${sourceName}". For each card, provide a key term and a concise, clear definition derived directly from the text.`;

    if (history.length > 0) {
      prompt += `\n\nIMPORTANT: Avoid generating flashcards for terms that are the same as or very similar to the terms in the following list of previously generated terms:\n\nPREVIOUS TERMS:\n- ${history.join('\n- ')}`;
    }

    prompt += `\n\nDOCUMENT CONTENT:\n${sourceContent}`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: FLASHCARD_SCHEMA,
      }
    });

    const parsedResponse = JSON.parse(response.text);
    return parsedResponse.slice(0, numCards);
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return [];
  }
};

export const analyzeQuizResults = async (incorrectAnswers: UserAnswer[], analysisContext: string): Promise<string> => {
  if (incorrectAnswers.length === 0) {
    return "Excellent work! You got all the questions right. Keep up the great momentum!";
  }

  try {
    const model = 'gemini-2.5-flash';
    const prompt = `A student made the following mistakes on a quiz. The context for the quiz is: "${analysisContext}". 
For each mistake, explain why their answer was incorrect and what the correct answer is and why, using your academic knowledge of the subject. 
Provide a summary of the key concepts they should review. Be encouraging and provide actionable advice for improvement.

Mistakes:
${incorrectAnswers.map((item, index) => `
${index + 1}. Question: ${item.question}
   - Student's Answer: ${item.userAnswer}
   - Correct Answer: ${item.correctAnswer}
`).join('')}

CONTEXT FOR THE QUIZ:
${analysisContext}
`;

    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error analyzing quiz results:", error);
    return "I'm sorry, I couldn't analyze your results due to an error.";
  }
};

// --- Audio Transcription Service (remains unchanged) ---

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

export class AudioTranscriber {
    private sessionPromise: Promise<any> | null = null;
    private mediaStream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private scriptProcessor: ScriptProcessorNode | null = null;
    private source: MediaStreamAudioSourceNode | null = null;
    private onTranscriptionUpdate: (text: string) => void;

    constructor(onTranscriptionUpdate: (text: string) => void) {
        this.onTranscriptionUpdate = onTranscriptionUpdate;
    }
    
    async start() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });

            this.sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        this.audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                        this.source = this.audioContext.createMediaStreamSource(this.mediaStream!);
                        this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);
                        
                        this.scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            this.sessionPromise?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        this.source.connect(this.scriptProcessor);
                        this.scriptProcessor.connect(this.audioContext.destination);
                    },
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent.inputTranscription.text;
                            this.onTranscriptionUpdate(text);
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                    },
                    onclose: (e: CloseEvent) => {
                        console.debug('Live session closed');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                },
            });

        } catch (error) {
            console.error("Failed to get media devices or start session:", error);
            this.stop();
            throw error;
        }
    }

    async stop() {
        if (this.sessionPromise) {
            this.sessionPromise.then(session => session.close());
            this.sessionPromise = null;
        }
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        if (this.scriptProcessor) {
            this.scriptProcessor.disconnect();
            this.scriptProcessor = null;
        }
        if (this.source) {
            this.source.disconnect();
            this.source = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
}