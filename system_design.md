# System Design Implementation for InterviewPrep AI

## High-Level Workflow

1. **User Requirement Input**
   - The user states their interview requirements (e.g., "I want frontend questions for a junior role") to the Vapi interface (voice or text).

2. **Requirement Storage**
   - Vapi sends the user's requirement to Firebase, where it is stored as a new interview session/request.

3. **Prompting the LLM**
   - The backend (or a cloud function) detects the new requirement in Firebase and sends it as a prompt to the AI LLM (e.g., GPT or Llama 3.3 70B) via the Groq API.

4. **Question Generation**
   - The LLM generates a set of interview questions based on the requirement.
   - These questions are stored in Firebase under the user's session.

5. **Question Delivery**
   - Vapi retrieves the questions from Firebase and presents them to the user (via voice or text).
   - Vapi is integrated with GPT for conversational flow and delivery.

6. **Answer Collection**
   - The user answers each question through Vapi.
   - Vapi collects the answers and stores them in Firebase.

7. **Answer Evaluation**
   - The backend (or a cloud function) monitors Firebase for new answers.
   - Each answer is sent as a prompt (along with the question and context) to the LLM for evaluation.

8. **Feedback Generation**
   - The LLM returns a score and feedback for each answer.
   - This feedback is stored in Firebase.

9. **Feedback Delivery**
   - Vapi retrieves the feedback from Firebase and delivers it to the user (voice or text).

---

## Sequence Diagram (Textual)

```
User         Vapi         Firebase         Backend/API         AI LLM
 |            |               |                 |                |
 |--Speak Req->|              |                 |                |
 |            |--Store Req--->|                 |                |
 |            |               |--Trigger------->|                |
 |            |               |                 |--Prompt------->|
 |            |               |                 |<--Questions----|
 |            |               |<--Store Ques----|                |
 |            |<--Get Ques----|                 |                |
 |<--Ask Ques-|               |                 |                |
 |--Answer--->|               |                 |                |
 |            |--Store Ans--->|                 |                |
 |            |               |--Trigger------->|                |
 |            |               |                 |--Eval Ans----->|
 |            |               |                 |<--Feedback-----|
 |            |               |<--Store FB------|                |
 |            |<--Get FB------|                 |                |
 |<--Feedback-|               |                 |                |
```

---

## Component Roles

- **User:** Interacts via Vapi (voice/text).
- **Vapi:** Handles user interaction, stores/retrieves data from Firebase, and manages conversational flow (integrated with GPT for dialogue).
- **Firebase:** Central data store for requirements, questions, answers, and feedback. Also acts as a trigger for backend processing.
- **Backend/API (Cloud Functions):** Listens for new requirements/answers in Firebase, sends prompts to the LLM, and stores results.
- **AI LLM (Groq/GPT/Llama):** Generates questions and evaluates answers, returning structured feedback.

---

## Algorithms/Techniques Used

- **Prompt Engineering:** User requirements and answers are formatted as prompts for the LLM to ensure relevant question generation and accurate evaluation.
- **Event-Driven Processing:** Firebase triggers backend functions when new data (requirements or answers) is added.
- **Data Synchronization:** All questions, answers, and feedback are stored and synchronized in Firebase for real-time access by Vapi and the user.
- **Conversational AI:** Vapi uses GPT for natural, interactive dialogue with the user.

---

## Summary Table

| Step                | Component(s) Involved         | Description                                      |
|---------------------|------------------------------|--------------------------------------------------|
| Requirement Input   | User, Vapi, Firebase         | User states requirement, stored in Firebase       |
| Question Generation | Backend/API, AI LLM, Firebase| LLM generates questions, stored in Firebase       |
| Question Delivery   | Vapi, Firebase               | Vapi retrieves and asks questions                |
| Answer Collection   | User, Vapi, Firebase         | User answers, Vapi stores in Firebase            |
| Answer Evaluation   | Backend/API, AI LLM, Firebase| LLM evaluates answers, feedback stored in Firebase|
| Feedback Delivery   | Vapi, Firebase               | Vapi delivers feedback to user                   |

---

## Hardware and Software Requirements

### Hardware Requirements

#### Server Side
- CPU: Quad-core processor (minimum), 8-core or higher (recommended)
- RAM: 8 GB (minimum), 16 GB or more (recommended)
- Storage: 50 GB free disk space (minimum), 100 GB SSD (recommended)
- Internet: Stable broadband connection

#### Client Side
- CPU: Dual-core processor (minimum), Quad-core or higher (recommended)
- RAM: 4 GB (minimum), 8 GB or more (recommended)
- Microphone (for voice features, recommended)
- Headphones (for best audio experience, recommended)
- Internet: Stable broadband connection

### Software Requirements

#### Server Side
- OS: Ubuntu 20.04+ or Windows Server 2019+ (minimum), Ubuntu 22.04 LTS or latest Windows Server (recommended)
- Node.js: v18+ (minimum), v20+ (recommended)
- Cloud Services/APIs: Firebase (Firestore, Auth), Groq AI API (or equivalent LLM provider), Deepgram API, Eleven Labs API
- High-availability cloud infrastructure (AWS, GCP, Azure, or Vercel) (recommended)

#### Client Side
- OS: Windows 10, macOS 11, or Ubuntu 20.04+ (minimum), Windows 11, macOS 13+, or latest Ubuntu (recommended)
- Browser: Latest Chrome, Firefox, Edge, or Safari (minimum), Latest version of Chrome or Firefox (recommended)

**Note:** All AI/ML processing is handled server-side or via cloud APIs; no local GPU is required for users.

---

## Tools, Technologies, and Algorithms Used

### Tools & Technologies

- **Frontend:**
  - Next.js 15 (React framework for SSR and routing)
  - TypeScript (type safety)
  - Tailwind CSS (utility-first CSS framework)
  - Shadcn UI (UI component library)

- **Backend/API:**
  - Next.js API routes (serverless functions)
  - Node.js (JavaScript runtime)

- **Authentication & Database:**
  - Firebase Authentication (user auth)
  - Firebase Firestore (NoSQL cloud database)

- **AI/ML Integration:**
  - Groq AI SDK (for LLM access)
  - Llama 3.3 70B (main LLM for question generation, evaluation, and feedback)
  - Deepgram API (voice-to-text transcription)
  - Eleven Labs API (text-to-speech for realistic AI interviewer voices)

- **Cloud/Hosting:**
  - Vercel, AWS, GCP, or Azure (recommended for deployment)

### Algorithms & Techniques

- **Prompt Engineering:**
  - Carefully crafted prompts for LLM to generate relevant questions and evaluate answers.

- **Event-Driven Processing:**
  - Backend/cloud functions triggered by changes in Firestore (e.g., new requirements or answers).

- **Data Synchronization:**
  - Real-time updates and state management using Firestore for seamless user experience.

- **Conversational AI:**
  - Use of LLMs (Llama 3.3 70B) for natural language understanding and generation.

- **Structured Feedback Aggregation:**
  - Aggregating ratings, notes, and answers for comprehensive feedback.

- **Rate Limiting & Caching:**
  - In-memory caching and per-user request throttling to ensure performance and prevent abuse.

**Note:** No code execution or automated code grading is performed; all evaluation is based on natural language processing and AI-driven analysis.