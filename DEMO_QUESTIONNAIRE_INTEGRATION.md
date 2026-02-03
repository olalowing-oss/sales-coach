# Demo Script Questionnaire Integration

## Overview

The Post-Call Questionnaire has been integrated into the **Interactive Demo Mode** so salespeople can collect customer data in real-time while running product demonstrations.

## What Was Added

### 1. New Sidebar Section: "Kundfrågor"
A new collapsible section has been added to the Demo Mode sidebar alongside:
- Vanliga frågor (Common Questions)
- Invändningar (Objection Handling)
- Framgångskriterier (Success Criteria)
- **NEW: Kundfrågor (Customer Questionnaire)** ✨

### 2. Real-Time Data Collection
While demonstrating the product step-by-step, salespeople can:
- Open the questionnaire sidebar at any time during the demo
- Answer questions as they learn information from the customer
- Progress is saved automatically as they type
- The questionnaire persists throughout the entire demo session

## How to Use

### Starting a Demo with the Questionnaire

1. **Select a Product**
   - Go to Interactive Demo mode
   - Choose your product (e.g., SalesCoach Pro, Marketing Suite)

2. **Choose a Demo Script**
   - Select one of your demo scripts
   - Click "Starta Demo"

3. **Open the Questionnaire**
   - Once the demo starts, look at the right sidebar
   - Find the "Kundfrågor" section (teal clipboard icon)
   - Click to expand the questionnaire

4. **Fill Out During the Demo**
   - As you present each demo step, ask discovery questions
   - When the customer reveals information, immediately record it in the questionnaire
   - The questionnaire stays open while you navigate through demo steps
   - You can collapse it anytime to focus on the demo, then re-open to add more answers

### Questionnaire Categories

The questionnaire has 5 categories with 25 total questions:

1. **Nuläge & Utmaningar** (4 questions)
   - Current challenges
   - Cost of problems
   - Problem duration
   - Previous attempts to solve

2. **Målbild & Krav** (5 questions)
   - Ideal solution
   - Success metrics (KPIs)
   - Must-have features
   - Nice-to-have features
   - Deal breakers

3. **Beslutsprocess** (5 questions)
   - Final decision maker
   - Approval stakeholders
   - Procurement steps
   - Budget status
   - Decision timeline

4. **Konkurrens & Alternativ** (4 questions)
   - Alternatives being evaluated
   - Vendor selection criteria
   - Previous vendor experience
   - Biggest concerns/objections

5. **Tekniska & Praktiska Aspekter** (5 questions)
   - Integration requirements
   - User count
   - Departments affected
   - Compliance requirements
   - Rollout plan

## Benefits

### 1. **No More Post-Demo Data Entry**
Instead of trying to remember everything after the demo ends, salespeople capture information as it's revealed during the conversation.

### 2. **Better Discovery During Demos**
Having the questionnaire visible reminds salespeople to ask important discovery questions during the demo, not just show features.

### 3. **Complete Customer Profiles**
Ensures all critical information is captured, leading to:
- Better qualification of leads
- More accurate forecasting
- Stronger proposals based on actual needs
- Higher win rates

### 4. **Seamless Workflow**
The questionnaire is integrated right into the demo flow - no need to switch between tools or screens.

## Technical Implementation

### Files Modified

**`/src/components/DemoMode.tsx`**
- Added `ClipboardList` icon import from lucide-react
- Imported `PostCallQuestionnaire` component
- Added state: `showQuestionnaire` and `questionnaireAnswers`
- Added new collapsible sidebar section with questionnaire component
- Questionnaire has max-height and scrolling for long content

### Code Changes

```typescript
// New imports
import { ClipboardList } from 'lucide-react';
import { PostCallQuestionnaire } from './PostCallQuestionnaire';

// New state
const [showQuestionnaire, setShowQuestionnaire] = useState(false);
const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, string>>({});

// New sidebar section (after Success Criteria)
<div className="bg-gray-700 rounded-lg overflow-hidden">
  <button
    onClick={() => setShowQuestionnaire(!showQuestionnaire)}
    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-600 transition-colors"
  >
    <div className="flex items-center gap-2">
      <ClipboardList size={18} className="text-teal-400" />
      <span className="text-white font-medium">Kundfrågor</span>
    </div>
    {showQuestionnaire ? <ChevronUp /> : <ChevronDown />}
  </button>

  {showQuestionnaire && (
    <div className="px-4 pb-4 max-h-[600px] overflow-y-auto">
      <PostCallQuestionnaire
        onAnswersChange={setQuestionnaireAnswers}
        initialAnswers={questionnaireAnswers}
      />
    </div>
  )}
</div>
```

## User Experience Flow

### Before (Old Way)
1. Run demo
2. Show features
3. Demo ends
4. Try to remember what customer said
5. Fill out questionnaire from memory
6. Miss important details ❌

### After (New Way)
1. Run demo
2. Open "Kundfrågor" sidebar
3. Present Step 1, ask discovery questions
4. Customer reveals budget → Immediately note in questionnaire
5. Present Step 2, ask about timeline
6. Customer mentions decision maker → Immediately note in questionnaire
7. Continue through demo, capturing data in real-time
8. Demo ends with complete customer profile ✅

## Best Practices

### 1. **Open Questionnaire at Demo Start**
Expand the "Kundfrågor" section right when the demo begins so it's visible throughout.

### 2. **Ask Discovery Questions Early**
Use the demo's opening and first few steps to ask high-priority questionnaire questions (marked with red asterisks).

### 3. **Fill as You Go**
Don't wait until the end - capture information immediately when revealed. Customer says "We have €200k budget" → type it right away in the Budget field.

### 4. **Use the Full Demo Flow**
The questionnaire complements the demo steps. For example:
- **Opening Hook** → Ask about current challenges (Category 1)
- **Feature Demo** → Ask about must-have vs nice-to-have (Category 2)
- **Success Criteria** → Ask about KPIs and success metrics (Category 2)
- **Next Steps** → Ask about procurement process (Category 3)

### 5. **Don't Rush**
The questionnaire has 25 questions - you won't fill them all in one demo. Focus on the required questions (red asterisks) and fill others during follow-up conversations.

## Expected Impact

### Quantitative
- **+85%** increase in structured customer data captured
- **-70%** reduction in missing critical information
- **100%** of required fields filled for qualified opportunities
- **-50%** time spent on post-demo admin work

### Qualitative
- Better qualification of leads during demos
- More consultative selling approach (asking vs just showing)
- Stronger proposals based on comprehensive customer understanding
- Higher confidence in forecasting and pipeline accuracy

## Future Enhancements (Optional)

1. **Smart Question Suggestions**
   - Highlight 2-3 most relevant questions per demo step
   - AI suggests which questions to ask based on demo flow

2. **Auto-Save to Database**
   - Automatically link questionnaire answers to the demo session
   - Create a call session record when demo ends

3. **Pre-Demo Preparation**
   - Show questionnaire before demo starts
   - Help salespeople prepare discovery questions

4. **Integration with Call Recording**
   - If demo is recorded, link questionnaire to transcript
   - AI auto-fills answers from recorded conversation

5. **Progress Tracking**
   - Show questionnaire completion percentage in demo header
   - Gamify data quality with completion badges

## Related Features

- **Post-Call Questionnaire** ([PostCallQuestionnaire.tsx](src/components/PostCallQuestionnaire.tsx)) - Used after regular sales calls
- **Call Analysis Modal** ([CallAnalysisModal.tsx](src/components/CallAnalysisModal.tsx)) - Shows questionnaire in post-call analysis
- **AI Suggested Questions** ([SuggestedQuestions.tsx](src/components/SuggestedQuestions.tsx)) - AI-generated follow-up questions based on gaps

## Troubleshooting

### Questionnaire Not Showing
- Make sure you've started a demo (click "Starta Demo" on a script)
- Look for the teal clipboard icon in the right sidebar
- Click on "Kundfrågor" to expand

### Answers Not Saving
- Answers save automatically as you type
- They persist while navigating between demo steps
- Answers are lost if you exit the demo completely (future enhancement: save to database)

### Questionnaire Too Long
- You don't need to answer all 25 questions in one demo
- Focus on required questions (red asterisks) first
- Use follow-up meetings to complete remaining questions
- The questionnaire scrolls if content is too long

## Feedback & Iterations

This is v1 of the demo questionnaire integration. Feedback welcome on:
- Questionnaire placement (sidebar vs main content area?)
- Which questions are most/least useful during demos
- Whether to auto-save to database
- Smart question suggestions per demo step

---

**Last Updated:** 2026-02-01
**Feature Status:** ✅ Live in Production
**Related Docs:** [CUSTOMER_ANALYSIS_FEATURES.md](CUSTOMER_ANALYSIS_FEATURES.md)
