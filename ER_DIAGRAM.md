# Entity Relationship Diagram - Interview Prep Project

## Database Schema Overview

This project uses **Firebase Firestore** (NoSQL) as the database. The following diagram represents the logical entity relationships:

### UML Class Diagram (PlantUML)

```plantuml
@startuml

class User {
  + id : string <<PK>>
  + name : string
  + email : string
}

class Interview {
  + id : string <<PK>>
  + userId : string <<FK>>
  + role : string
  + level : string
  + type : string
  + techstack : string[]
  + questions : string[]
  + finalized : boolean
  + createdAt : string
}

class Feedback {
  + id : string <<PK>>
  + interviewId : string <<FK>>
  + userId : string <<FK>>
  + totalScore : number
  + categoryScores : CategoryScore[]
  + strengths : string[]
  + areasForImprovement : string[]
  + finalAssessment : string
  + createdAt : string
}

class PeerInterview {
  + id : string <<PK>>
  + userId : string <<FK>>
  + interviewerId : string <<FK>> {nullable}
  + role : string
  + level : string
  + techstack : string[]
  + status : string
  + roomId : string
  + createdAt : string
  + updatedAt : string
}

class PeerInterviewFeedback {
  + id : string <<PK>>
  + interviewId : string <<FK>>
  + interviewerId : string <<FK>>
  + intervieweeId : string <<FK>>
  + rating : number
  + feedback : string
  + createdAt : string
}

class CategoryScore {
  + name : string
  + score : number
  + comment : string
}

User ||--o{ Interview : creates
User ||--o{ PeerInterview : creates_as_interviewee
User ||--o{ PeerInterview : joins_as_interviewer
User ||--o{ Feedback : receives
User ||--o{ PeerInterviewFeedback : receives_as_interviewee
User ||--o{ PeerInterviewFeedback : gives_as_interviewer

Interview ||--|| Feedback : has
PeerInterview ||--|| PeerInterviewFeedback : has

Feedback ||--o{ CategoryScore : contains

note right of User
  **Collection:** users
  **Primary Key:** id (Firebase UID)
end note

note right of Interview
  **Collection:** interviews
  **Mode:** AI Interview
end note

note right of Feedback
  **Collection:** feedback
  **Type:** AI-generated feedback
end note

note right of PeerInterview
  **Collection:** peer-interviews
  **Mode:** Peer Interview
end note

note right of PeerInterviewFeedback
  **Collection:** peer-interview-feedback
  **Type:** Peer-provided feedback
end note

@enduml
```

### Standard UML Class Diagram Notation

```
┌─────────────────────────────────────────────────────────────┐
│                        USER                                 │
├─────────────────────────────────────────────────────────────┤
│ + id : string {PK}                                          │
│ + name : string                                              │
│ + email : string                                             │
└─────────────────────────────────────────────────────────────┘
         │
         │ 1
         │
         ├─────────────────────┐
         │                     │
         │ *                   │ *
         ▼                     ▼
┌──────────────────┐  ┌──────────────────────┐
│   INTERVIEW      │  │  PEER_INTERVIEW      │
├──────────────────┤  ├──────────────────────┤
│ + id : string {PK}│  │ + id : string {PK}   │
│ + userId : string│  │ + userId : string    │
│   {FK}           │  │   {FK}               │
│ + role : string  │  │ + interviewerId :    │
│ + level : string │  │   string {FK, null}  │
│ + type : string  │  │ + role : string       │
│ + techstack[]    │  │ + level : string      │
│ + questions[]    │  │ + techstack[]         │
│ + finalized :    │  │ + status : enum       │
│   boolean        │  │ + roomId : string     │
│ + createdAt :    │  │ + createdAt : string │
│   string         │  │ + updatedAt : string │
└──────────────────┘  └──────────────────────┘
         │                     │
         │ 1                   │ 1
         │                     │
         ▼                     ▼
┌──────────────────┐  ┌──────────────────────────┐
│    FEEDBACK      │  │ PEER_INTERVIEW_FEEDBACK  │
├──────────────────┤  ├──────────────────────────┤
│ + id : string {PK}│  │ + id : string {PK}       │
│ + interviewId :  │  │ + interviewId : string   │
│   string {FK}    │  │   {FK}                   │
│ + userId : string│  │ + interviewerId : string │
│   {FK}           │  │   {FK}                   │
│ + totalScore :   │  │ + intervieweeId : string │
│   number         │  │   {FK}                   │
│ + categoryScores:│  │ + rating : number        │
│   CategoryScore[]│  │ + feedback : string      │
│ + strengths[]    │  │ + createdAt : string     │
│ + areasFor       │  └──────────────────────────┘
│   Improvement[]  │
│ + finalAssessment│
│   : string       │
│ + createdAt :    │
│   string         │
└──────────────────┘

Legend:
PK = Primary Key
FK = Foreign Key
* = Many (0 or more)
1 = One
```

### Visual ER Diagram (Mermaid)

```mermaid
erDiagram
    USER ||--o{ INTERVIEW : creates
    USER ||--o{ PEER_INTERVIEW : creates_as_interviewee
    USER ||--o{ PEER_INTERVIEW : joins_as_interviewer
    USER ||--o{ FEEDBACK : receives
    USER ||--o{ PEER_FEEDBACK : receives_as_interviewee
    USER ||--o{ PEER_FEEDBACK : gives_as_interviewer
    
    INTERVIEW ||--|| FEEDBACK : has
    PEER_INTERVIEW ||--|| PEER_FEEDBACK : has
    
    USER {
        string id PK
        string name
        string email
    }
    
    INTERVIEW {
        string id PK
        string userId FK
        string role
        string level
        string type
        array techstack
        array questions
        boolean finalized
        string createdAt
    }
    
    FEEDBACK {
        string id PK
        string interviewId FK
        string userId FK
        number totalScore
        array categoryScores
        array strengths
        array areasForImprovement
        string finalAssessment
        string createdAt
    }
    
    PEER_INTERVIEW {
        string id PK
        string userId FK
        string interviewerId FK "nullable"
        string role
        string level
        array techstack
        string status
        string roomId
        string createdAt
        string updatedAt
    }
    
    PEER_FEEDBACK {
        string id PK
        string interviewId FK
        string interviewerId FK
        string intervieweeId FK
        number rating
        string feedback
        string createdAt
    }
```

### ASCII ER Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         INTERVIEW PREP DATABASE                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│    USER      │
├──────────────┤
│ id (PK)      │◄──────┐
│ name         │       │
│ email        │       │
└──────────────┘       │
                       │
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        │              │              │
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  INTERVIEW   │ │ PEER_INTERVIEW   │ │     USER         │
│  (AI Mode)   │ │  (Peer Mode)     │ │   (Profile)      │
├──────────────┤ ├──────────────────┤ ├──────────────────┤
│ id (PK)      │ │ id (PK)          │ │ (same as User)   │
│ userId (FK)  │◄─┤ userId (FK)     │◄─┤                  │
│ role         │ │ interviewerId    │ │                  │
│ level        │ │   (FK, nullable) │ │                  │
│ type         │ │ role             │ │                  │
│ techstack[]  │ │ level            │ │                  │
│ questions[]  │ │ techstack[]      │ │                  │
│ finalized    │ │ status           │ │                  │
│ createdAt    │ │ roomId           │ │                  │
└──────────────┘ │ createdAt        │ │                  │
        │        │ updatedAt        │ │                  │
        │        └──────────────────┘ └──────────────────┘
        │                  │
        │                  │
        ▼                  ▼
┌──────────────┐ ┌──────────────────────┐
│   FEEDBACK   │ │ PEER_INTERVIEW_      │
│  (AI Mode)   │ │    FEEDBACK          │
├──────────────┤ ├──────────────────────┤
│ id (PK)      │ │ id (PK)              │
│ interviewId  │◄─┤ interviewId (FK)    │◄─┐
│   (FK)       │ │ interviewerId (FK)   │  │
│ userId (FK)  │◄─┤ intervieweeId (FK)  │  │
│ totalScore   │ │ rating               │  │
│ categoryScores│ │ feedback             │  │
│   []         │ │ createdAt            │  │
│ strengths[]  │ └──────────────────────┘  │
│ areasFor     │                          │
│ Improvement[]│                          │
│ finalAssessment│                        │
│ createdAt    │                          │
└──────────────┘                          │
                                          │
                                          │
                                          │
                    ┌─────────────────────┘
                    │
                    │ (references PeerInterview)
                    │
                    └─────────────────────┐
                                          │
                                          │
                    ┌─────────────────────┘
                    │
                    │ (references User as interviewer)
                    │
                    └─────────────────────┐
                                          │
                                          │
                    ┌─────────────────────┘
                    │
                    │ (references User as interviewee)
                    │
                    └─────────────────────┐
                                          │
                                          │
                                          ▼
```

## Entity Details

### 1. **USER** (users collection)
- **Primary Key**: `id` (Firebase UID)
- **Attributes**:
  - `id`: string (Firebase UID)
  - `name`: string
  - `email`: string
- **Relationships**:
  - One-to-Many with `INTERVIEW` (creates interviews)
  - One-to-Many with `PEER_INTERVIEW` (creates peer interviews)
  - One-to-Many with `FEEDBACK` (receives feedback)
  - One-to-Many with `PEER_INTERVIEW_FEEDBACK` (as interviewer or interviewee)

### 2. **INTERVIEW** (interviews collection) - AI Interview Mode
- **Primary Key**: `id` (Firestore document ID)
- **Attributes**:
  - `id`: string
  - `userId`: string (FK → User.id)
  - `role`: string (e.g., "Frontend Developer")
  - `level`: string (e.g., "Junior", "Senior")
  - `type`: string (e.g., "technical", "behavioral")
  - `techstack`: string[] (array of technologies)
  - `questions`: string[] (array of interview questions)
  - `finalized`: boolean
  - `createdAt`: string (ISO timestamp)
- **Relationships**:
  - Many-to-One with `USER` (created by user)
  - One-to-One with `FEEDBACK` (has feedback after completion)

### 3. **FEEDBACK** (feedback collection) - AI Interview Feedback
- **Primary Key**: `id` (Firestore document ID)
- **Attributes**:
  - `id`: string
  - `interviewId`: string (FK → Interview.id)
  - `userId`: string (FK → User.id)
  - `totalScore`: number (0-100)
  - `categoryScores`: Array<{name: string, score: number, comment: string}>
    - Categories: Communication Skills, Technical Knowledge, Problem Solving, Cultural Fit, Confidence and Clarity
  - `strengths`: string[]
  - `areasForImprovement`: string[]
  - `finalAssessment`: string
  - `createdAt`: string (ISO timestamp)
- **Relationships**:
  - Many-to-One with `INTERVIEW` (belongs to interview)
  - Many-to-One with `USER` (belongs to user)

### 4. **PEER_INTERVIEW** (peer-interviews collection) - Peer Interview Mode
- **Primary Key**: `id` (Firestore document ID)
- **Attributes**:
  - `id`: string
  - `userId`: string (FK → User.id, the interviewee/creator)
  - `interviewerId`: string | null (FK → User.id, nullable until someone joins)
  - `role`: string (job role)
  - `level`: string (experience level)
  - `techstack`: string[] (array of technologies)
  - `status`: 'pending' | 'active' | 'completed'
  - `roomId`: string (unique room ID for video call)
  - `createdAt`: string (ISO timestamp)
  - `updatedAt`: string (ISO timestamp)
- **Relationships**:
  - Many-to-One with `USER` (created by user as interviewee)
  - Many-to-One with `USER` (interviewerId references User as interviewer)
  - One-to-One with `PEER_INTERVIEW_FEEDBACK` (has feedback after completion)

### 5. **PEER_INTERVIEW_FEEDBACK** (peer-interview-feedback collection)
- **Primary Key**: `id` (Firestore document ID)
- **Attributes**:
  - `id`: string
  - `interviewId`: string (FK → PeerInterview.id)
  - `interviewerId`: string (FK → User.id)
  - `intervieweeId`: string (FK → User.id)
  - `rating`: number (rating score)
  - `feedback`: string (text feedback)
  - `createdAt`: string (ISO timestamp)
- **Relationships**:
  - Many-to-One with `PEER_INTERVIEW` (belongs to peer interview)
  - Many-to-One with `USER` (interviewerId references User as interviewer)
  - Many-to-One with `USER` (intervieweeId references User as interviewee)

## Relationship Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| User → Interview | One-to-Many | A user can create multiple AI interviews |
| User → PeerInterview | One-to-Many | A user can create multiple peer interviews |
| Interview → Feedback | One-to-One | Each AI interview can have one feedback |
| PeerInterview → PeerFeedback | One-to-One | Each peer interview can have one feedback |
| User → Feedback | One-to-Many | A user can receive multiple feedbacks |
| User → PeerFeedback (as interviewer) | One-to-Many | A user can give multiple peer feedbacks |
| User → PeerFeedback (as interviewee) | One-to-Many | A user can receive multiple peer feedbacks |
| User → PeerInterview (as interviewer) | One-to-Many | A user can join multiple peer interviews as interviewer |

## Collection Names in Firestore

1. **users** - User profiles
2. **interviews** - AI-generated interviews
3. **feedback** - AI interview feedback
4. **peer-interviews** - Peer interview sessions
5. **peer-interview-feedback** - Peer interview feedback

## Notes

- Firebase Firestore is a NoSQL database, so relationships are maintained through foreign key references (document IDs)
- The `interviewerId` in `PEER_INTERVIEW` is nullable initially (null when status is 'pending')
- When a peer interview is completed, the status changes to 'completed' and feedback is created
- Both AI and Peer interview modes have separate feedback systems
- The `roomId` in `PEER_INTERVIEW` is used for video call integration (e.g., Zego)

---

## Sequence Diagrams

### 1. AI Interview Flow - Complete Interview Process

```plantuml
@startuml AI Interview Flow

actor User
participant Frontend
participant "Next.js API" as API
participant Firestore
participant "Groq AI\n(Llama 3.3 70B)" as AI

== Interview Creation ==
User -> Frontend: Fill interview form\n(role, level, type, techstack)
Frontend -> API: POST /api/vapi/generate\n{type, role, level, techstack, amount, userid}
API -> AI: Generate questions\n(prompt with requirements)
AI --> API: Return questions array
API -> Firestore: Store interview document\n(questions, metadata)
Firestore --> API: Interview ID
API --> Frontend: Success response
Frontend --> User: Show interview created

== Interview Execution ==
User -> Frontend: Start interview
Frontend -> Firestore: Fetch interview questions
Firestore --> Frontend: Return questions
Frontend --> User: Display questions\n(Agent component)

loop For each question
    User -> Frontend: Answer question
    Frontend -> Frontend: Store answer in transcript
end

== Feedback Generation ==
User -> Frontend: Complete interview
Frontend -> API: POST /api/interviews/[id]/complete\n{transcript}
API -> AI: Generate feedback\n(prompt with transcript)
AI --> API: Return structured feedback\n(categoryScores, strengths, improvements)
API -> Firestore: Store feedback document
Firestore --> API: Feedback ID
API -> Firestore: Update interview status\n(finalized: true)
API --> Frontend: Success response
Frontend --> User: Display feedback

@enduml
```

### 2. Peer Interview Flow - Session Creation and Interview

```plantuml
@startuml Peer Interview Flow

actor "User A\n(Interviewee)" as UserA
actor "User B\n(Interviewer)" as UserB
participant Frontend
participant "Next.js API" as API
participant Firestore
participant "Groq AI\n(Llama 3.3 70B)" as AI
participant "Video Call\n(Zego)" as Video

== Session Creation ==
UserA -> Frontend: Create peer interview\n(role, level, techstack)
Frontend -> API: POST createPeerInterview\n{userId, role, level, techstack}
API -> Firestore: Create peer-interview document\n(status: pending, roomId)
Firestore --> API: Interview ID
API --> Frontend: Return interview ID
Frontend --> UserA: Show interview created\n(share room ID)

== Session Joining ==
UserB -> Frontend: Browse available interviews
Frontend -> API: GET getPeerInterviews\n(exclude own interviews)
API -> Firestore: Query peer-interviews\n(status: pending)
Firestore --> API: Return available interviews
API --> Frontend: Return interviews list
Frontend --> UserB: Display available interviews

UserB -> Frontend: Join interview
Frontend -> API: POST updatePeerInterview\n{interviewId, interviewerId, status: active}
API -> Firestore: Update peer-interview\n(interviewerId, status: active)
Firestore --> API: Success
API --> Frontend: Success response
Frontend -> Video: Initialize video call\n(roomId)
Frontend --> UserA: Notify interviewer joined
Frontend --> UserB: Show interview ready

== Question Selection/Generation ==
UserB -> Frontend: Request AI questions\n(optional)
Frontend -> API: POST /api/vapi/generate\n{role, level, techstack}
API -> AI: Generate questions
AI --> API: Return questions array
API -> Firestore: Store questions\n(in interview or separate)
API --> Frontend: Return questions
Frontend --> UserB: Display questions

== Interview Execution ==
loop For each question
    UserB -> Frontend: Ask question
    Frontend -> Video: Transmit audio/video
    Video --> UserA: Receive question
    UserA -> Frontend: Answer question
    Frontend -> Video: Transmit audio/video
    Video --> UserB: Receive answer
    Frontend -> Firestore: Store Q&A transcript
end

== Feedback Submission ==
UserB -> Frontend: Submit peer feedback\n{rating, feedback}
Frontend -> API: POST createPeerFeedback\n{interviewId, interviewerId, intervieweeId, rating, feedback}
API -> Firestore: Store peer-interview-feedback
API -> Firestore: Update peer-interview\n(status: completed)
Firestore --> API: Success
API --> Frontend: Success response
Frontend --> UserA: Display feedback received
Frontend --> UserB: Confirm feedback sent

== Optional: AI Insights ==
UserB -> Frontend: Request AI insights
Frontend -> API: POST evaluate answer\n{transcript, question}
API -> AI: Evaluate answer\n(prompt with context)
AI --> API: Return AI feedback
API -> Firestore: Store AI insights
API --> Frontend: Return AI feedback
Frontend --> UserB: Display AI insights
Frontend --> UserA: Show AI insights\n(if shared)

@enduml
```

### 3. User Authentication Flow

```plantuml
@startuml Authentication Flow

actor User
participant Frontend
participant "Firebase Auth" as Auth
participant "Next.js API" as API
participant Firestore

== Sign Up ==
User -> Frontend: Fill sign-up form\n(name, email, password)
Frontend -> Auth: Create user account\n(email, password)
Auth --> Frontend: User UID + idToken
Frontend -> API: POST signUp\n{uid, name, email}
API -> Firestore: Check if user exists
alt User does not exist
    API -> Firestore: Create user document\n{name, email}
    Firestore --> API: Success
    API --> Frontend: Success response
    Frontend --> User: Account created\n(redirect to sign-in)
else User already exists
    API --> Frontend: Error: User exists
    Frontend --> User: Show error message
end

== Sign In ==
User -> Frontend: Fill sign-in form\n(email, password)
Frontend -> Auth: Sign in user\n(email, password)
Auth --> Frontend: idToken
Frontend -> API: POST signIn\n{email, idToken}
API -> Auth: Verify idToken
Auth --> API: User record
API -> API: Create session cookie
API -> Firestore: Get user document
Firestore --> API: User data
API --> Frontend: Set session cookie\n+ user data
Frontend --> User: Signed in\n(redirect to dashboard)

== Session Validation ==
User -> Frontend: Access protected route
Frontend -> API: GET /api/auth/session
API -> API: Verify session cookie
API -> Firestore: Get user document
Firestore --> API: User data
API --> Frontend: Return user data
Frontend --> User: Show protected content

@enduml
```

### 4. Interview Generation Flow (Detailed)

```plantuml
@startuml Interview Generation Flow

actor User
participant Frontend
participant "Next.js API\n/api/vapi/generate" as API
participant "Groq AI SDK" as Groq
participant "Llama 3.3 70B" as LLM
participant Firestore

User -> Frontend: Submit interview form
activate Frontend

Frontend -> API: POST /api/vapi/generate\n{\n  type: "technical",\n  role: "Frontend Developer",\n  level: "Junior",\n  techstack: "React,TypeScript",\n  amount: 5,\n  userid: "user123"\n}
activate API

API -> Groq: generateText({\n  model: "llama-3.3-70b-versatile",\n  prompt: "Prepare questions for..."\n})
activate Groq

Groq -> LLM: Send prompt
activate LLM
LLM --> Groq: Return questions JSON array
deactivate LLM

Groq --> API: questions: ["Q1", "Q2", ...]
deactivate Groq

API -> API: Parse questions\nValidate format

API -> Firestore: collection("interviews").add({\n  role: "Frontend Developer",\n  type: "technical",\n  level: "Junior",\n  techstack: ["React", "TypeScript"],\n  questions: [...],\n  userId: "user123",\n  finalized: true,\n  createdAt: ISO timestamp\n})
activate Firestore
Firestore --> API: Document ID
deactivate Firestore

API --> Frontend: { success: true }
deactivate API

Frontend --> User: Show success message\nRedirect to interview page
deactivate Frontend

@enduml
```

### 5. Feedback Generation Flow (Detailed)

```plantuml
@startuml Feedback Generation Flow

actor User
participant Frontend
participant "Next.js API\ncreateFeedback" as API
participant "Groq AI SDK" as Groq
participant "Llama 3.3 70B" as LLM
participant Firestore

User -> Frontend: Complete interview\n(transcript available)
activate Frontend

Frontend -> API: createFeedback({\n  interviewId: "int123",\n  userId: "user123",\n  transcript: [\n    {role: "interviewer", content: "Q1"},\n    {role: "candidate", content: "A1"},\n    ...\n  ]\n})
activate API

API -> API: Format transcript\nConvert to string format

API -> Groq: generateObject({\n  model: "llama-3.3-70b-versatile",\n  schema: feedbackSchema,\n  prompt: "Evaluate candidate...",\n  system: "You are a professional interviewer..."\n})
activate Groq

Groq -> LLM: Send evaluation prompt\nwith transcript
activate LLM

LLM --> Groq: Return structured object:\n{\n  totalScore: 85,\n  categoryScores: [\n    {name: "Communication", score: 90, comment: "..."},\n    {name: "Technical", score: 80, comment: "..."},\n    ...\n  ],\n  strengths: [...],\n  areasForImprovement: [...],\n  finalAssessment: "..."\n}
deactivate LLM

Groq --> API: Structured feedback object
deactivate Groq

API -> API: Compute totalScore\n(average of category scores)

API -> Firestore: collection("feedback").add({\n  interviewId: "int123",\n  userId: "user123",\n  totalScore: 85,\n  categoryScores: [...],\n  strengths: [...],\n  areasForImprovement: [...],\n  finalAssessment: "...",\n  createdAt: ISO timestamp\n})
activate Firestore
Firestore --> API: Feedback document ID
deactivate Firestore

API --> Frontend: { success: true, feedbackId: "fb123" }
deactivate API

Frontend -> Firestore: Fetch feedback document
Firestore --> Frontend: Return feedback data
Frontend --> User: Display feedback\nwith scores and insights
deactivate Frontend

@enduml
```

### 6. Peer Interview Join Flow

```plantuml
@startuml Peer Interview Join Flow

actor "Interviewee" as Interviewee
actor "Interviewer" as Interviewer
participant Frontend
participant "Next.js API" as API
participant Firestore
participant "Video Service\n(Zego)" as Video

== Interviewee Creates Session ==
Interviewee -> Frontend: Create peer interview
Frontend -> API: createPeerInterview()
API -> Firestore: Create document\nstatus: "pending"
Firestore --> API: interviewId
API -> API: Generate roomId
API -> Firestore: Update roomId
API --> Frontend: { interviewId, roomId }
Frontend --> Interviewee: Show interview created\nWaiting for interviewer...

== Interviewer Joins ==
Interviewer -> Frontend: Browse available interviews
Frontend -> API: getPeerInterviews(userId)
API -> Firestore: Query peer-interviews\nwhere status = "pending"\nand userId != currentUserId
Firestore --> API: Return available interviews
API --> Frontend: Return interviews list
Frontend --> Interviewer: Display interviews

Interviewer -> Frontend: Select interview to join
Frontend -> API: updatePeerInterview({\n  interviewId,\n  interviewerId: currentUserId,\n  status: "active"\n})
API -> Firestore: Update document\ninterviewerId, status: "active"
Firestore --> API: Success
API --> Frontend: Success

Frontend -> Video: Initialize video call\n(roomId)
activate Video
Video --> Frontend: Video connection ready
deactivate Video

Frontend --> Interviewee: Notify: Interviewer joined
Frontend --> Interviewer: Show interview ready\nVideo connected

== Interview Starts ==
Interviewer -> Frontend: Start interview
Frontend -> Firestore: Update status: "active"
Frontend --> Interviewee: Interview started
Frontend --> Interviewer: Interview started

@enduml
```

