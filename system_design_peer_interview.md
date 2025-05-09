# System Design Implementation for Peer Interview Mode (InterviewPrep AI)

## High-Level Workflow

1. **Session Creation & Role Assignment**
   - One user (User A) creates a peer interview session.
   - Another user (User B) joins the session. Roles are assigned: interviewer and candidate.

2. **Session Storage**
   - Session details (participants, roles, status) are stored in Firebase.

3. **Question Selection/Generation**
   - The interviewer selects questions from a list or requests AI-generated questions (via a UI action).
   - If AI generation is requested, the backend prompts the LLM. Generated questions are stored in Firebase.

4. **Question Delivery**
   - The interviewer asks questions to the candidate. Questions are retrieved from Firebase.

5. **Answer Collection**
   - The candidate answers each question.
   - Answers are stored in Firebase.

6. **Peer Feedback**
   - The interviewer provides feedback and/or a score for each answer using structured forms.
   - Feedback is stored in Firebase.

7. **AI Insights (Optional)**
   - The interviewer can request AI insights on candidate answers.
   - The backend sends the answer (and question/context) to the LLM for evaluation.
   - AI-generated feedback is stored in Firebase.

8. **Feedback Delivery**
   - The candidate receives feedback (peer and/or AI) via the web interface.

---

## Sequence Diagram (Textual)

```
User A (Interviewer)   User B (Candidate)   Frontend      Firebase      Backend/API      AI LLM
        |                     |                |              |              |              |
--Create Session--------------|                |--Store------>|              |              |
        |<--Join Session------|                |--Update----->|              |              |
        |                     |                |<--Sync------>|              |              |
--Select/Gen Ques-------------|                |--Req Ques--->|--Prompt----->|              |
        |                     |                |<--Questions--|<--Questions--|              |
--Ask Ques------------------->|                |              |              |              |
        |<--Answer------------|                |--Store Ans-->|              |              |
--Give Feedback-------------->|                |--Store FB--->|              |              |
        |                     |                |              |              |              |
(Optional: AI Insights)        |                |--Eval Ans--->|--Prompt----->|              |
        |                     |                |<--AI FB------|<--Feedback---|              |
        |<--Get Feedback------|                |              |              |              |
```

---

## Component Roles

- **User A (Interviewer):** Selects or generates questions, asks them, provides feedback, and can request AI insights.
- **User B (Candidate):** Answers questions and receives feedback.
- **Frontend:** Manages session creation/joining, question/answer/feedback flow, and stores/retrieves data from Firebase.
- **Firebase:** Stores session data, questions, answers, and feedback. Synchronizes state between users.
- **Backend/API (Cloud Functions):** Handles AI question generation and answer evaluation for insights.
- **AI LLM (Groq/GPT/Llama):** Generates questions and evaluates answers for AI insights.

---

## Algorithms/Techniques Used

- **Session Management:** Real-time session state and role assignment managed in Firebase.
- **Prompt Engineering:** For AI-generated questions and answer evaluation.
- **Data Synchronization:** Ensures both users see the same questions, answers, and feedback in real time.
- **Structured Peer Feedback:** Interviewer uses guided forms for consistent, actionable feedback.
- **AI Insights:** Interviewer can request LLM-based evaluation for additional, unbiased feedback.

---

## Summary Table

| Step                  | Component(s) Involved                | Description                                         |
|-----------------------|--------------------------------------|-----------------------------------------------------|
| Session Creation      | User A, User B, Frontend, Firebase   | Create session, assign roles, sync state             |
| Question Selection    | User A, Frontend, Backend/API, AI LLM| Select or generate questions, store in Firebase      |
| Question Delivery     | User A, User B, Frontend, Firebase   | Interviewer asks questions, candidate receives them  |
| Answer Collection     | User B, Frontend, Firebase           | Candidate answers, answers stored in Firebase        |
| Peer Feedback         | User A, Frontend, Firebase           | Interviewer provides feedback, stored in Firebase    |
| AI Insights           | User A, Backend/API, AI LLM, Firebase| LLM evaluates answers, feedback stored in Firebase   |
| Feedback Delivery     | User B, Frontend, Firebase           | Candidate receives peer/AI feedback                  |

---

## Hardware and Software Requirements

### Server Side (Backend/API, AI Integration)

**Minimum Requirements:**
- OS: Ubuntu 20.04+ or Windows Server 2019+
- CPU: Quad-core processor
- RAM: 8 GB
- Storage: 50 GB free disk space
- Node.js: v18+
- Internet: Stable broadband connection
- Cloud Services: Access to Firebase (Firestore, Auth), Groq AI API (or equivalent LLM provider, if AI insights are used)

**Recommended Requirements:**
- OS: Ubuntu 22.04 LTS or latest Windows Server
- CPU: 8-core processor or higher
- RAM: 16 GB or more
- Storage: 100 GB SSD
- Node.js: v20+
- High-availability cloud infrastructure (AWS, GCP, Azure, or Vercel)

### Client Side (User/Browser)

**Minimum Requirements:**
- OS: Windows 10, macOS 11, or Ubuntu 20.04+
- CPU: Dual-core processor
- RAM: 4 GB
- Browser: Latest Chrome, Firefox, Edge, or Safari
- Internet: Stable broadband connection

**Recommended Requirements:**
- OS: Windows 11, macOS 13+, or latest Ubuntu
- CPU: Quad-core processor or higher
- RAM: 8 GB or more
- Browser: Latest version of Chrome or Firefox

**Note:** All AI/ML processing is handled server-side or via cloud APIs; no local GPU is required for users. 