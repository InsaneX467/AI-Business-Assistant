# AI Business Assistant — Coaching Institute Sales Demo Script & Walkthrough

This document provides a concise, structured **10-minute customer-facing demonstration script**, technical setup checklist, objection handling, and safety guidelines for presenting the **AI Business Assistant** to a **Coaching Institute Owner** (NEET & JEE Coaching focus).

---

## 🎯 1. Coaching Institute Value Proposition

Coaching institutes spend significant marketing budgets attracting student & parent traffic to their website. However:
1. **Lost After-Hours Enquiries**: Most parents and students browse after school or evening hours (8:00 PM – 11:00 PM) when front-desk counselors are offline.
2. **Repetitive Basic Queries**: Staff spends hours repeatedly answering basic questions about batch timings, fees, scholarship exams (ATSE), and hostel facilities instead of conducting high-value counseling.
3. **Lead Capture Friction**: Prospective students hesitate to call directly or fill out long static forms without receiving immediate value or course clarity.
4. **Instant Conversion**: The **AI Business Assistant** acts as a 24/7 AI Admissions Counselor on your website that accurately answers NEET/JEE questions, builds multi-turn trust, and captures qualified callbacks straight into your Admissions Admin Dashboard.

---

## 📋 2. Pre-Demo Technical Checklist

Before starting the customer meeting, confirm all 4 microservices are active:

| Service | Port / URL | Health Check / Status |
|---|---|---|
| **MongoDB** | `localhost:27017` | Running (`net start MongoDB`) |
| **Python AI Service** | `http://127.0.0.1:8000` | `GET /health` -> `status: OK, cuda: True, lora: True` |
| **Node API Backend** | `http://localhost:5000` | `GET /api/health` -> `status: OK` |
| **React Vite Client** | `http://localhost:5173` | Accessible in browser |

---

## 🗣️ 3. 10-Minute Coaching Institute Owner Demo Script

### **[0:00 - 2:00] Step 1: Context & The High-Cost Admission Problem**
- **Presenter**:
  > *"Every admission season, your institute invests heavily in flyers, social media, and Google ads to get parents and students to visit your website. But what happens when an anxious parent visits at 10 PM on a Sunday looking for Class 11 NEET batch timings?*
  > 
  > *If they don't get immediate answers, they open another tab and check your competitor's website.*
  > 
  > *Today, I want to show you how our **AI Admissions Assistant** solves this. It gives parents instant, accurate answers about your NEET & JEE courses, batch timings, and scholarship policies, and captures their contact details directly for your counseling team."*

---

### **[2:00 - 4:00] Step 2: The Modern Institute Landing Page & Chatbot Experience**
- **Action**: Open `http://localhost:5173` in your browser. Point out the professional design, trust credentials, and the visible AI Counselor widget.
- **Presenter**:
  > *"Notice how the website is designed specifically for an entrance coaching institute. Right here on the landing page, students and parents see your core programs, batch start dates, and this intelligent AI Counselor widget on the right.*
  > 
  > *Notice the 'Demo Mode' banner at the top—ensuring nobody mistakes sample fees for actual quotations during our presentation."*
- **Action**: Click the quick prompt chip: **"What courses do you offer?"** (or type it).
- **AI Counselor**:
  > *"ABC Academy offers specialized coaching for NEET and JEE: 2-Year Integrated NEET (Class 11-12), 2-Year Integrated JEE (Class 11-12), 1-Year NEET Droppers Batch, 1-Year JEE Droppers Batch, and Class 9-10 Foundation & Olympiad programs. [Sample Demo Data]"*
- **Presenter**:
  > *"Notice how fast and precise the response is. It introduces your exact cohorts and clarifies that all batches have classroom and hybrid options."*

---

### **[4:00 - 6:00] Step 3: Demonstrating Multi-Turn Conversation Memory**
- **Presenter**:
  > *"A real parent doesn't ask robotic queries; they have continuous follow-up questions. Watch how the assistant maintains multi-turn conversation memory."*
- **Action**: Type into the chat:
  > *"Tell me more about the 2-year NEET medical program"*
- **AI Counselor**:
  > *"The NEET-UG 2-Year Medical Master Program covers Physics, Chemistry, and NCERT Biology line-by-line with 120+ weekly mock tests, Daily Practice Problems (DPP), and personalized doubt clearance desks..."*
- **Presenter**:
  > *"Now, let's ask a pronoun follow-up without mentioning NEET again."*
- **Action**: Type into the chat:
  > *"What are the batch timings and fee for it?"*
- **AI Counselor**:
  > *"The NEET-UG 2-Year Medical Master Program offers Morning Batches (8:00 AM - 12:30 PM), Evening Batches (4:00 PM - 7:30 PM), and Weekend Intensive sessions. Sample tuition fee is ₹1,35,000/year, and students can earn up to 90% scholarship through the ATSE scholarship test."*
- **Presenter**:
  > *"The AI understood that 'it' referred to the 2-Year NEET Medical program from the previous turn and pulled the exact timings from your verified institute profile without hallucinating."*

---

### **[6:00 - 7:30] Step 4: Live Lead Capture & Multi-Turn Callback Flow**
- **Presenter**:
  > *"Now, when the parent is engaged and wants personal guidance, the AI gently transitions into lead capture."*
- **Action**: Type:
  > *"Can an admissions counselor call me?"*
- **AI Counselor**:
  > *"I'd be happy to arrange a callback from our admissions team! May I know your name?"*
- **Action**: Type:
  > *"My name is Demo Student Rohan"*
- **AI Counselor**:
  > *"Thanks, Rohan! What phone number should our admissions team use to call you back?"*
- **Action**: Type dummy 10-digit number:
  > *"9876543210"*
- **AI Counselor**:
  > *"Thank you, Rohan! I have recorded your request. Our admissions counselor will call you back at 9876543210 regarding NEET-UG 2-Year Medical Master Program within 24 business hours."*
- **Presenter**:
  > *"In less than 30 seconds, an anonymous website visitor has become a warm, high-intent lead with their name, verified phone number, and exact target course captured."*

---

### **[7:30 - 9:00] Step 5: Admin Dashboard & Real-Time Status Updates**
- **Presenter**:
  > *"Now, let's see where this lead goes instantly."*
- **Action**: Click the **"Admin Dashboard"** tab in the top navigation. Enter the admin security key (`admin_secret_key_12345`) if prompted.
- **Presenter**:
  > *"Here is your Admissions Management Dashboard. Notice the top lead row:"*
- **Action**: Point to `Rohan` | `9876543210` | `Callback requested. Interested course: NEET-UG...` | Status: `New`.
- **Presenter**:
  > *"Rohan's enquiry is right here with an exact timestamp. Your counseling team can now call Rohan. When they complete the call, they update the status right here in the dropdown:"*
- **Action**: Change status from **`New`** ➔ **`Contacted`**, then **`Qualified`**, then **`Converted`**. Point out the instant green confirmation banner and how the metric counter for `Converted` updates in real-time.
- **Presenter**:
  > *"Your entire admissions pipeline is synchronized with your MongoDB database in real-time without needing expensive external CRM software."*

---

### **[9:00 - 10:00] Step 6: Customization, Safe Demo Guidelines & Next Steps**
- **Presenter**:
  > *"We can configure this entire system for your institute in less than 48 hours:
  > 1. Your institute name, branding, and color palette.
  > 2. Your exact NEET, JEE, and Foundation course brochures.
  > 3. Your specific batch timings, scholarship criteria, and campus locations.
  > 
  > Would you like to schedule a 30-minute onboarding session to tailor this with your upcoming batch calendar?"*

---

## 🛡️ 4. Demo Safety & Security Reminders

1. **Clearly Flagged Demo Mode**: Every page (Navbar, Hero, Batches, Modal, Admin Dashboard) displays prominent `DEMO MODE` notices so visitors never mistake sample fees for final quotations.
2. **Fictional Data Only**: Always use names like `Demo Student Rohan` or `Test Student Alex` and dummy numbers (`9876543210`).
3. **No Secrets Exposed**: Never display `.env` files, API keys, terminal windows, or database connection strings to the client.
4. **Zero Hallucination Boundary**: The system operates with strict business knowledge constraints to avoid quoting unverified fees or inventing non-existent scholarships.
