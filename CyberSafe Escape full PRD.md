# **Executive Summary**

**CyberSafe Escape** is a web-based gamified cybersecurity training platform designed to transform routine security awareness education into an immersive, escape-room-style game. Spanning six thematic “rooms” (modules), it engages users through interactive puzzles, collaborative challenges, and a narrative that simulates real cyber threat scenarios. The platform targets **students** (K-12, higher ed) and **employees** in enterprises, making critical cybersecurity concepts memorable through hands-on experience, while providing **administrators** (school leaders, CISOs, training managers) with robust tools to track progress and compliance.

This Product Requirements Document (PRD) details all aspects of CyberSafe Escape for implementation. It covers game design for each escape room module, a comprehensive gamification system (points, badges, leaderboards), real-time multiplayer features (team formation, video/audio/text chat via WebRTC), an administrator analytics dashboard, technical architecture (frontend, backend, database schemas, APIs), user experience flows, content management, third-party integrations (SSO, LMS/SCORM, Slack/Teams), compliance with privacy/security standards (GDPR, FERPA, SOC2, WCAG 2.1 AA), and a phased implementation roadmap. All requirements are specified with sufficient detail – including data models and acceptance criteria – to be **implementation-ready**.

**Core Value Proposition:** CyberSafe Escape motivates users to complete security training by making it *fun and engaging*, thereby improving knowledge retention and changing behaviors. Traditional security training often fails due to passive content; in contrast, our platform uses **experiential learning** and gamification. Users actively solve cyber puzzles under time pressure, mirroring real attack scenarios, which builds instinctive secure behaviors . Administrators benefit from higher completion rates, detailed risk analytics, and integration into existing LMS and compliance workflows. This PRD ensures that every feature from the game mechanics to the backend security is specified for a successful development and launch of CyberSafe Escape.

# **Product Overview**

CyberSafe Escape turns mandatory cybersecurity education into an interactive adventure. Through six progressively challenging escape rooms, users learn topics like password hygiene, phishing awareness, data protection, safe browsing, insider threat detection, and incident response. The experience blends **individual puzzles** and **team-based challenges** with real-time collaboration. A persistent gamification layer (points, XP, achievements, leaderboards) rewards engagement and reinforces learning over time. The platform is web-based (accessible via modern browsers) and is designed for **scalability** (from a single class of students to an entire global enterprise) and **accessibility** (WCAG 2.1 AA compliant).

Key product attributes:

* **Immersive Game-Based Learning:** Each room presents a storyline and set of puzzles that require applying cybersecurity concepts. Rather than reading policies, users learn by *doing* – e.g. spotting a phishing email in a mock inbox or configuring a virtual firewall in a network puzzle. Research shows such active learning in escape-room formats boosts motivation and real-world skill application .

* **Gamification & Motivation:** The platform incorporates points for completing challenges, badges for achievements, and leaderboards to spark friendly competition. Gamification has been demonstrated to improve user engagement and knowledge retention by tapping into intrinsic motivators (competition, achievement, mastery) . Users earn a “CyberSafe score” and collect digital trophies, making training feel like a game rather than a checkbox task.

* **Collaborative Multiplayer:** Certain rooms are designed for team play (2–6 players). Users can join colleagues or classmates in real time, communicating via integrated video/audio chat and text. This fosters teamwork and simulates collaborative defense scenarios. The system uses WebRTC for low-latency conferencing and shared puzzle interfaces to ensure **everyone** contributes to solving challenges together.

* **Admin Insights & Compliance:** Administrators get a dedicated dashboard to monitor training progress and measure security readiness. Granular analytics (e.g. who struggled with phishing puzzles, which teams excelled, overall completion rates) feed into a composite “organizational risk score.” Automated reports and alerts help ensure compliance (e.g. tracking completion for mandated trainings) and identify areas or individuals needing follow-up. The platform can integrate with enterprise systems (SSO for login, LMS for record tracking via SCORM/xAPI, Slack/Teams for notifications) to fit seamlessly into existing workflows.

* **Security & Privacy by Design:** As a cybersecurity training product, CyberSafe Escape *practices what it preaches*. All user data is protected with encryption in transit and at rest, and the application follows secure coding standards (preventing XSS, CSRF, SQL injection, etc.). The design conforms to GDPR/CCPA for personal data handling (with features like data export and the right to deletion) and to FERPA for student data privacy. Accessibility is treated as a first-class requirement, ensuring the platform is usable by people with disabilities (screen reader support, captions, high contrast mode, etc.).

In summary, CyberSafe Escape aims to **dramatically increase engagement** in cybersecurity training – turning what is usually a boring annual requirement into an interactive mission that users *want* to participate in. By blending proven gamification techniques with authentic cyber scenarios, the product helps organizations cultivate a security-aware culture, where lessons learned in-game translate into safer behavior in real life.

# **User Personas**

To design features and UX that meet stakeholder needs, we identify three primary personas:

## **Persona 1: “Student Sam” – K-12/Higher Ed Learner**

* **Profile:** 16-year-old high school student (or an 18-year-old college freshman). Fairly tech-savvy but with limited formal cybersecurity knowledge. Often distracted by other games/apps, so training must be engaging to hold interest.

* **Goals:** Learn basic cyber hygiene (passwords, phishing) in a fun way. Earn recognition (badges, good scores) to show off to peers. Possibly use the platform as part of a class assignment or cybersecurity club activity.

* **Pain Points:** Finds traditional lectures or reading on security boring. Will disengage if content is not interactive. Short attention span – needs quick feedback and a sense of progression. May also be competitive with friends.

* **Behavior:** Comfortable with games and social media; expects intuitive UI (will not read long instructions). Likely to try hints or trial-and-error if stuck rather than reading manuals. Expects *mobile-friendly* access (often on a tablet or Chromebook in class).

* **Key Needs:**

  * Quick onboarding without heavy technical jargon.

  * Engaging, game-like experience with visuals and rewards.

  * Clear indication of progress (levels, XP) and how much is left.

  * Ability to play with friends in team challenges.

  * Recognition for achievements (to share or compare on leaderboards).

## **Persona 2: “Employee Erin” – Busy Office Worker**

* **Profile:** 30-year-old non-IT employee at a mid-size company. Not deeply technical (role in HR department). Often required to complete annual security awareness training by her company’s policy. Initially skeptical of “mandatory fun” but open to something more interesting than slides.

* **Goals:** Complete required training efficiently, but also genuinely wants to avoid falling for scams at work or at home. Will appreciate practical tips (e.g. how to spot phishing) if delivered in a memorable way. Needs proof of completion (certificate) for HR records.

* **Pain Points:** Has little free time – training that drags on or feels irrelevant is frustrating. If the platform is too “gamey” or childish, might feel it’s a waste of time. Also cautious about sharing personal info online – will be sensitive to privacy.

* **Behavior:** Follows instructions carefully if provided. Likely uses a standard work laptop (Windows) with Chrome or Edge; possibly remote via VPN. May be less vocal in team settings (prefers structured tasks over chaotic collaboration).

* **Key Needs:**

  * A professional yet engaging training environment (balance fun with not feeling silly).

  * Clear instructions and helpful hints to avoid getting stuck (frustration could lead to disengagement).

  * Flexible pacing: ability to pause/resume if work interrupts.

  * Reassurance of data privacy and seriousness (e.g. corporate branding, not just kids’ game visuals).

  * Certificate of completion or badge that counts for compliance.

## **Persona 3: “Admin Alice” – School IT Director or Corporate Training Manager (CISO/HR)**

* **Profile:** 45-year-old Chief Information Security Officer at a company **or** a Technology Coordinator at a school district. Responsible for ensuring everyone completes cybersecurity training and for reducing human risk in the organization. Familiar with security concepts and compliance requirements.

* **Goals:** Deploy a training program that everyone actually completes and learns from. Track metrics like completion rates, scores, and identify who might be high-risk (e.g. repeatedly failing phishing challenges). Generate reports for upper management or regulators proving that training occurred and was effective. Possibly integrate the training with existing LMS or HR systems for user management and recordkeeping.

* **Pain Points:** Traditional training had low engagement – employees treated it as a checkbox. Hard to quantify if awareness actually improved. Also juggling multiple tools – prefers integration (one login via SSO, data feeding into one dashboard). Needs to ensure the solution meets legal requirements (privacy, accessibility, etc.).

* **Behavior:** Data-driven decision maker – will explore the admin dashboard for insights. Less concerned with the game’s play-by-play, more with outcomes and usage patterns. Likely coordinates with department managers or principals to roll out training in waves. Will test the platform themselves to ensure quality.

* **Key Needs:**

  * Easy user provisioning (upload CSV of users or sync with Active Directory; minimal manual effort to enroll hundreds or thousands of users).

  * Configurable training campaigns (set deadlines, reminders).

  * Visibility into progress: who completed, who is behind, aggregate scores, knowledge gaps.

  * Real-time alerts for critical events (e.g. a user fails phishing puzzles badly – might need extra training).

  * Exportable reports and compliance certificates.

  * Assurance that the platform is secure (would reflect poorly if the training platform itself is insecure).

  * Ability to customize content or add organization-specific info (for example, include their security policy reminders).

These personas drive our design: *Sam* needs an exciting, intuitive game; *Erin* needs a balance of fun and professionalism with convenience; *Alice* needs powerful admin tools and integration. The following requirements address their needs in detail.

# **Game Design Document (Escape Room Structure)**

CyberSafe Escape consists of **6 themed escape rooms** that users progress through. Each room corresponds to a critical cybersecurity domain. The room sequence forms a cohesive narrative (e.g., a storyline of investigating a cyber incident) but each has distinct objectives and puzzles. Users must complete Room 1 before Room 2, and so on, ensuring foundational concepts are learned first.

Each room is designed either as **Solo** (single-player) or **Team** (multiplayer) as specified. Solo rooms focus on individual skill-building, whereas team rooms emphasize collaboration and communication under pressure – reflecting real-world scenarios where teamwork is key (e.g. responding to an incident as a group). All rooms are timed (e.g. 15 minutes per room by default, adjustable by admins). Within that time, the user/team must solve all puzzles to “complete” the room. A *hint system* is available to nudge players if stuck, with penalties to score for using hints (to encourage perseverance but prevent frustration).

Below, we detail each room’s learning objectives, puzzle concepts, and design elements:

## **Room 1:** 

## **Password Fortress**

##  **(Solo)**

**Theme:** You are tasked with breaking into a secured system (“Fortress”) by correctly applying password security principles – ironically teaching that *strong passwords prevent* the very breach you’re simulating.

**Core Learning Objectives:**

* Understand what makes a strong password: length (passphrases), complexity (mix of characters), and uniqueness. Modern guidelines (e.g. NIST 800-63B) emphasize length over arbitrary complexity .

* Learn about password managers as a solution for using unique, complex passwords for every account (and the concept of a master password).

* Appreciate multi-factor authentication (MFA) – why a second factor (code or biometric) greatly improves security.

* Recognize common password attacks and pitfalls: brute-force, dictionary attacks, credential stuffing (using leaked passwords), and why not to reuse passwords.

**Puzzle/Challenge Concepts:**

* **Password Strength Meter:** The user is prompted to create a password for a fictitious account. As they type, a strength meter (using real rules) indicates strength. An initial puzzle might require adjusting a weak password into a strong one (e.g., turning “summer123” into a strong passphrase). Acceptance Criteria: *User must create a password that meets defined criteria (e.g. ≥12 characters, includes multiple character types or a multi-word phrase) to proceed.*

* **Cracking a Weak Password:** A puzzle presents an encrypted password file or a hash and a basic cracking tool. The user must perform a *dictionary attack* simulation – e.g., the game provides a list of candidate passwords and the user must pick which one likely succeeded based on hints. This demonstrates how quickly simple passwords fall. If the user picks a weak password (e.g. “password1”) the game “cracks” it in seconds, illustrating the risk.

* **MFA Code Challenge:** After “guessing” a password, the user is met with an MFA prompt (simulated phone or token interface). The puzzle teaches how MFA works: the user might have to retrieve a one-time code from a virtual phone. (We won’t send real SMS, but simulate TOTP). This challenge reinforces that even if a password is compromised, MFA can stop the breach.

* **Password Manager Vault:** The user finds a **password vault** interface with multiple accounts. One account is “locked” with a weak master password clue. The puzzle: use given hints to figure out the master password and reveal the vault’s contents. This demonstrates storing passwords in a manager. It also subtly teaches *not* to forget the master password (by making them work to figure it out).

**Game Mechanics & UI in Room 1:** A single-player dashboard with panels for hints and a “notepad” that teaches as you play. For example, when encountering the strength meter, a tooltip explains why certain passwords are weak. When the user solves a puzzle, an explanation dialog pops up: e.g. “Great\! You created a strong password. Remember: longer is stronger, and using a phrase you can remember is better than random gibberish as long as it’s long.” The room’s narrative might be framed as “assist the IT admin in securing a system by setting up a strong password and MFA before the hacker does”. On completion, show a summary of what was learned (list of takeaways about passwords and MFA).

## **Room 2:** 

## **Phishing Waters**

##  **(Team)**

**Theme:** The players are sailing through dangerous “phishing waters” as a crew. The storyline might be that they work in an office and receive various communications; they must identify the fraudulent ones (phish) among legitimate messages to avoid a “breach.” Collaboration is needed to discuss tricky examples.

**Core Learning Objectives:**

* Identify signs of phishing in emails: suspicious sender addresses, misleading hyperlinks, urgent or threatening language, unexpected attachments, etc.

* Recognize that phishing can occur via SMS (“smishing”) or voice calls (“vishing”), not just email.

* Understand social engineering tactics: pretexting, impersonation, creating a sense of urgency or fear.

* Know the proper actions when encountering a suspected phish: don’t click links or download attachments, report it to IT/security team. Also differentiate spear-phishing (targeted, personalized) vs. generic mass phishing.

**Puzzle/Challenge Concepts:**

* **Email Inbox Sorting:** The team is shown a simulated email inbox with \~10 emails. Some are legitimate office emails, others are phishing attempts. As a timed challenge, they must drag emails into either the “Safe” or “Phish” bucket. Each player can click an email to view its content. For example, an email from “IT Support” asking to reset your password with a weird URL is a phish. The team must discuss (via chat or audio) borderline cases. Acceptance Criteria: *All phishing emails must be correctly identified (e.g., at least 8/10 sorted correctly) to succeed.* After sorting, the game reveals the correct answers and key indicators (highlighting, for instance, the mismatched domain in the sender’s address).

* **URL Analysis Puzzle:** One puzzle focuses on URLs. The team is given a list of URLs and must determine which are malicious. They can “hover” (simulate hover) to see the actual link. For example, an email text shows http://www.microsoft.secure-login.com which on hover is clearly not a Microsoft domain. The team must pick out such deceptive links. This can be a multiple-choice question or a drag-drop match (match a URL to “legit” or “suspect”).

* **Suspicious Attachment Investigation:** The team receives a mock “attachment” (e.g., a PDF or DOC) from an email and has an analysis interface. Clues like the file name (“Invoice.exe” masquerading as PDF) or scanning results are provided. They must decide if it’s safe. This teaches not to open unexpected attachments.

* **Voice Phishing Scenario:** (Optional challenge if time permits) The game plays an audio clip (or text transcript if audio not accessible) of a phone voicemail from someone claiming to be tech support asking for a password. The team must spot the social engineering and decide how to respond (the correct action: do not give info, report the call).

**Team Collaboration Features:** In this room, all players see the same interface (shared inbox and clues). A **voting system** can be enabled for certain puzzles – e.g., each player tags an email as Phish or Safe, and the majority vote locks in the answer, or they must all agree before submitting. Real-time chat is critical: players will discuss why they think an email is phishing. The game encourages discussion by making some phish subtle (like a well-crafted spear-phish with correct logos but one letter off in the email address). This room leverages teamwork to simulate how employees might consult each other when unsure about an email. It also fosters *peer learning*: a savvier player can explain a clue to others, reinforcing it for themselves and teammates.

**Feedback & Learning Moments:** After each puzzle, provide immediate feedback. For example: if an email was incorrectly marked safe, highlight the red flag that was missed (“Notice the sender’s address was rnicrosoft.com not microsoft.com – a common trick\!”). If the team correctly finds all phish, they earn a **“Phish Finder”** badge. The narrative context: “You successfully navigated the Phishing Waters, steering your company’s ship clear of attacks.” A brief debrief lists top indicators of phishing that were learned.

## **Room 3:** 

## **Data Dungeon**

##  **(Solo)**

**Theme:** The user enters a “data dungeon” – a metaphorical vault where different types of data are stored. They must organize and protect the data correctly to escape. The scenario can be framed as helping a company organize a cluttered server room or document repository according to sensitivity. The atmosphere is puzzle-like (think sorting and classifying).

**Core Learning Objectives:**

* Learn data classification levels (e.g., Public, Internal, Confidential, Highly Restricted). Understand that not all data is equal – some data (PII, financial records, student records in a school, etc.) require stricter handling.

* Proper data handling practices: e.g., confidential data should be encrypted, not emailed in plain text, stored in approved locations; physical files should be locked.

* Basic data privacy regulations: introduce concepts like **GDPR/CCPA** that mandate protection of personal data, and possibly FERPA in a school context for student info. Not in depth, but enough that users know misuse has legal consequences.

* Clean desk and physical security: emphasize that securing data isn’t just digital – e.g., don’t leave printouts on your desk, lock your screen when away.

**Puzzle/Challenge Concepts:**

* **Data Classification Sorting:** The user is given a set of “files” (each labeled with a description, e.g. “Employee salaries Q4.xlsx” or “School lunch menu PDF”). There are four vaults or cabinets representing classification levels (Public, Internal, Confidential, Restricted). The puzzle is to drag each file to the appropriate vault. For tricky items, the user might need to click a file to read a snippet. Example: “Customer list with personal emails” should be Confidential (because it’s PII), whereas “Product brochure” is Public. Acceptance Criteria: *All items correctly classified.* If misclassified, hints explain (“Customer list contains personal data – that should be Confidential because of privacy laws”).

* **Secure the Document (Encryption) Puzzle:** Present a scenario: the user must send a file containing sensitive data. They have options like “send via encrypted channel” vs “send in plain email” vs “upload to public drive”. This could be a multiple-choice or interactive scenario. The correct “puzzle” solution is to choose the secure method (e.g., use company-approved encrypted file transfer). If they choose wrong, they get feedback about data leakage risk.

* **Privacy Regulation Quiz:** A short quiz integrated into the room narrative: e.g. a NPC (non-player character) asks questions: “Is an email address considered Personal Data under GDPR?” with options. Or present mini-scenarios: “A parent requests deletion of their child’s data – which law might apply?” (FERPA). The goal is not legal expertise, but awareness that laws exist and certain actions are required (like honoring deletion requests – the **“right to be forgotten”** ).

* **Clean Desk Challenge:** A point-and-click mini-game: a picture of an office desk where several security no-no’s are present (like a sticky note with a password, an unlocked computer, a USB stick labeled “Backup” left out, a confidential file open). The user must click all items that should be secured or removed. Time-limited to add urgency. Reward for finding all. This emphasizes physical security and tidiness.

**Design and Mechanics:** As a solo room, the interface might be styled like a file management system or dungeon inventory. For classification, might look like folders; for clean desk, an image with interactive spots. The *learning aspect* is enforced by showing explanations whenever the user makes a choice (e.g. if they put a file in “Internal” but it should be “Confidential,” a pop-up explains the sensitivity of that data type). The room’s completion yields a summary of “Data protection best practices you achieved” and perhaps an **“Data Defender”** badge for flawless classification.

## **Room 4:** 

## **Network Maze**

##  **(Team)**

**Theme:** A cooperative maze where the team must navigate safely through network threats. It simulates safe browsing and network use practices. Perhaps visualized as moving an avatar or pointer through a maze representing the internet, where certain paths have dangers (malware, unsafe Wi-Fi, etc.). Each decision point is a puzzle requiring knowledge of network security practices.

**Core Learning Objectives:**

* Safe browsing: identifying secure websites (HTTPS, valid certificates), avoiding malicious sites, understanding not to disable browser security warnings.

* Public Wi-Fi and VPN: know the risks of public Wi-Fi (eavesdropping) and the importance of using VPN or secure connections when remote.

* Malware awareness: types of malware (virus, ransomware, spyware) and how they can infect (drive-by downloads, malicious ads). Emphasize not clicking unknown links or downloading unverified software.

* Importance of software updates and patches: how outdated software can be exploited (so players should “patch” to proceed in a challenge).

**Puzzle/Challenge Concepts:**

* **Maze Navigation Game:** Represent the network as a series of connected nodes (like rooms in a maze). The team must choose paths: e.g., one node says “Connect to Public WiFi Hotspot – unencrypted” vs another “Use VPN to access work network”. If they choose the unsafe path, they trigger a trap (e.g., a man-in-the-middle attack icon pops up), and they lose time or points and have to backtrack. The correct path requires recognizing safer choices (use VPN, only visit known sites, etc.). This real-time puzzle fosters discussion (“Which route should we take?”). Possibly one player can be “navigator” but input from all helps.

* **Malware ID Matching:** The team is shown a set of malware names/descriptions and must match them to definitions or icons (e.g., match “ransomware” to an icon of locked files, “phishing” to an email icon, etc.). This can be done collaboratively: each player can drag a pair and the system confirms if correct. It reinforces terminology in a fun way.

* **Secure vs Insecure Settings:** A simulation of a web browser settings or operating system: players collectively must toggle settings to secure the system (e.g., ensure firewall on, auto-updates on, disable risky plugins). The puzzle is to find all the insecure settings in a list and fix them. It might be structured like “spot the 5 insecure configurations.” This encourages discussion (one might say “I recall we should turn on automatic updates”).

* **Team “Secure the Network” Strategy:** A higher-level challenge where the team is given a scenario (e.g. they are at a coffee shop needing to send a confidential report to office). They have tool cards like “Use VPN”, “Use a password-protected hotspot”, “Wait until on secure network”. They must pick the best strategy. This is more of a scenario discussion turned into a choice. If they choose a poor strategy (e.g., send via public WiFi without protection), the game enacts a consequence (like “Data sniffed by attacker – mission failed”). The correct strategy advances the story.

**Collaboration & Roles:** In this room, consider optional role assignments: e.g., one player is “Navigator” controlling the maze movement, another is “Analyst” reading threat descriptions, etc., to encourage everyone’s involvement. The communication system (video/audio) is crucial as teams reason out the safest path. The puzzles should be solvable in parallel or sequence – e.g., while one is toggling settings, others can be matching malware terms. Use WebSockets to sync puzzle state for all players. Anti-cheat: randomize maze layout and puzzle content per session so teams can’t just tell the next group the exact sequence.

When the team completes the Network Maze, they receive a **score** based on time and any wrong turns (fewer wrong turns \= bonus). A debrief highlights, for example, “You avoided 3 out of 4 threats. Remember to always verify a site’s security and use VPN on untrusted networks.” Perhaps award a **“Network Navigator”** badge for completing without triggering traps.

## **Room 5:** 

## **Insider Threat Theater**

##  **(Team)**

**Theme:** A role-playing mystery. The team enters a “theater” or office scenario where one person among the employees (simulated characters) is an insider threat causing issues. The team must piece together clues to identify the mole and learn about internal security practices in the process. It’s structured like a whodunit investigation.

**Core Learning Objectives:**

* Recognize indicators of insider threats: unusual data access patterns, policy violations, disgruntled behavior, etc. Both malicious insiders and well-meaning but negligent insiders are covered.

* Importance of access controls and the principle of least privilege (each person should only have necessary access). Understanding separation of duties to prevent collusion.

* Importance of reporting suspicious behavior (knowing how to discreetly escalate concerns if a coworker is doing something unsafe).

* Emphasize that threats aren’t only external – trust but verify internally, and maintain an open security culture where raising concerns is encouraged.

**Puzzle/Challenge Concepts:**

* **Scenario-Based Role Play:** The team is presented with a scenario narrative: e.g., “Confidential design documents have leaked from the company. Four employees had access. You must determine who, if anyone, intentionally or accidentally leaked them.” They have virtual profiles of these suspects (each with background info). Clues (like system logs, email snippets, chat messages, security camera images) are scattered around. The team must collaboratively analyze clues. For example, one clue might be a log showing one employee accessed the files at 2AM; another clue is an email from that person complaining about being passed up for promotion (potential motive). This is an open-ended puzzle where the team discusses and then must accuse someone or identify a cause (maybe it was accidental via a lost USB).

  * The system can offer a structured way to compile evidence: perhaps a collaborative whiteboard interface where players can drag clues or write notes. They ultimately must select one of the suspects and justify why. Acceptance Criteria: *Identify the correct insider or cause.* If incorrect, feedback explains what they missed.

* **“Spot the Red Flags” Game:** A series of short scenes or descriptions of employee behaviors. The team must quickly hit a “flag” button when they hear/see a red flag. Example: a video or cartoon plays showing an employee plugging in a personal USB drive to copy data – team should flag that. Or someone tailgating (following someone through a secure door without badging). This rapid-fire activity teaches vigilance. Score is based on flags correctly identified.

* **Access Permissions Puzzle:** A mini game where the team sees a list of employees and the resources they requested access to. They must approve or deny access based on principles (e.g., an accountant requesting access to developer code repository – deny as not needed). If they approve something they shouldn’t, an alert pops up (“This violates least privilege – why would accounting need code access?”). The goal is to only approve appropriate access.

* **Debrief Collaboration:** After identifying the culprit in the main scenario, the game can prompt the team to outline what steps the organization should take (a multiple-choice quiz or discussion points): e.g., “What is the first thing to do after discovering an insider leak? (A) Terminate the employee immediately, (B) Secure evidence and involve HR/legal, (C) Announce to all staff…”. They choose the best practice (which is usually secure evidence and follow incident response procedure). This ensures they think about proper process.

**Design Elements:** The Insider Threat room should feel like a detective game – possibly a virtual “office” environment to explore (e.g., click around an office for clues). The multiplayer aspect is crucial: divide tasks (one searches logs, another reads emails, etc.) and then they must discuss to form the full picture. To facilitate this, an **in-game notepad or case board** can let them compile findings. Real-time comms let them share “I found a suspicious email from Alice to a competitor, check the evidence folder”. The system can impose a time limit (maybe 20 minutes since it’s complex). If time runs out, the “insider” escapes, but they still get feedback and can retry.

**Outcome:** This room reinforces that internal vigilance is key. On success, the team is commended for catching the insider (or resolving the incident). A **“Trustworthy Teammate”** badge might be awarded to each for demonstrating the ability to spot insider threats and uphold security culture. They also see a summary: “Insider Threat Indicators you found: off-hours access, policy violations, unusual transfers. Always report these to your security team. Remember, security is everyone’s responsibility.”

## **Room 6:** 

## **Incident Response Command**

##  **(Final Boss – Team)**

**Theme:** The climax of the training – a simulated cybersecurity incident is underway (e.g., a ransomware outbreak or major breach), and the team assumes roles in the Incident Response (IR) command center. This is a high-pressure, timed scenario (“the boss battle”). They must perform initial incident response steps, communicate effectively, and contain the incident within the countdown. This room pulls together lessons from all previous rooms under a unifying challenge.

**Core Learning Objectives:**

* Familiarize with the steps of incident response: detection, reporting, containment, eradication, recovery, and lessons learned. Understand each team member might have a specific role in IR (like technical analyst, communicator, coordinator).

* Emphasize *immediate actions* when something is suspected: disconnect infected machines, contact IT/security, preserve evidence (don’t just wipe systems without analysis).

* Understand internal and external communication protocols: who to notify (IT, management, possibly customers or authorities depending on severity), and **not** to spread panic or unconfirmed info.

* The value of a post-incident review: documenting what happened, why, and how to prevent it next time (continuous improvement).

**Puzzle/Challenge Concepts:**

* **Timed Incident Simulation:** At the start, a timer (for example, 15 minutes) begins. The scenario is introduced: e.g., “Multiple employees report seeing a ransomware note on their screens. Systems are locking up.” The team must execute a series of actions in order. They get an interface with multiple panels (systems map, comms channel, incident log, etc.). They may have a checklist of tasks to complete before time runs out (if time hits zero, the “ransomware” spreads and game over). Tasks could include:

  1. Identify patient zero – the first infected machine (by analyzing logs or clues).

  2. Contain the spread – maybe a puzzle to isolate that machine (e.g., drag it off the network or click a “network quarantine” button).

  3. Initiate company incident response plan – e.g., fill out an incident report form with key details (what, when, who).

  4. Communication: choose a message to send to all staff (multiple-choice, e.g. instruct them to disconnect from network vs. ignore; the correct one is to instruct shutdown of certain services).

  5. If applicable, solve a quick technical sub-puzzle like “find the malware process and stop it” (presented as a simple terminal or task manager simulation where they must pick the malicious process name among others).

      Each subtask completed buys a little more time (pauses or adds minutes), mimicking how swift action can contain damage.

* **Team Role Assignment:** Optionally, assign roles at start: *Incident Commander* (leads and decides), *Technical Lead* (focus on technical containment), *Communications Lead* (drafts messages). While all players see the overall interface, certain parts are primarily controlled by one role – requiring trust and communication. For instance, only the Communications Lead can send the all-staff email, but needs input from others on what to say. This division ensures collaboration.

* **Evidence Preservation Puzzle:** After containment, one challenge is to gather evidence for analysis. The team might be shown a file system or log files and asked to identify and save important evidence (like the malware executable or event logs). Selecting correct items teaches what data is useful (e.g., system logs, memory dumps) and what’s not (e.g., they shouldn’t just delete everything).

* **Post-Incident Quiz:** Once the immediate incident is handled (or time expires), the game asks a few reflective questions: “What would you include in a lessons-learned report?” and gives options like (A) Blame the person who opened the phishing email, (B) Identify how to improve email filtering and training, (C) No action needed, it was unavoidable. The correct answers reinforce a blameless, improvement-focused approach.

**High-Stakes Atmosphere:** Use visuals and audio to heighten tension – perhaps an alert siren sounds initially (with option to mute for accessibility), and the UI flashes “INCIDENT IN PROGRESS”. A countdown clock visible to all keeps urgency. The puzzles are interconnected: e.g., if they fail to contain in time, a message “Ransomware spread\!” appears and they lose points or fail the mission. This creates a “do-or-die” feeling akin to a real cyber crisis. However, the game will allow multiple attempts or hints because the goal is learning. A dynamic hint system might drop suggestions (“Maybe isolate the infected host first\!”) if the team seems stuck for over a minute on a step.

**Victory Condition:** If the team completes all required tasks (containment, communication, evidence collection) within the time, the incident is “resolved”. They see an epilogue screen – e.g., “You stopped the attack\! Only 5 PCs were affected instead of the whole network.” They earn a **“Incident Commander”** badge. If they fail, the game still debriefs: “The ransomware spread. Key missed steps were X. Remember in a real incident to act fast and communicate.” In either case, the final room ends with a **summary of all lessons from all rooms**, tying it all together: passwords, phishing, data protection, etc., all contributed to either causing or preventing incidents. Each team member also receives a **Certificate of Completion** automatically, acknowledging they finished the training (with potentially a timestamp, score, and the organization’s name).

**Note:** The final room being a team boss fight encourages replayability – teams might redo it to improve their outcome. The system can have variations of the incident scenario (ransomware, data breach, etc.) to keep it fresh on replays or for yearly training updates.

**Overall Escape Room Design Principles:**

All rooms follow these guiding principles:

* *Narrative & Realism:* Each puzzle is embedded in a story that mirrors real situations (albeit in a gamified form). This increases knowledge transfer to real behavior .

* *Increasing Difficulty:* Rooms 1–2 are simpler introduction (personal practices like passwords, phishing), rooms 3–5 intermediate (broader org practices), room 6 is advanced (holistic application). This progression scaffolds learning.

* *Hint System:* Available in each room (possibly via a “Hint” button that gives a subtle clue). Use an adaptive hint system that tracks time on puzzle; if too long, automatically suggest a hint. Hints incur a small point penalty to discourage overuse but prevent getting stuck .

* *Feedback and Learning Points:* Whenever a puzzle is solved or a mistake made, show a brief explanation. The game accumulates “learning points” which the user can review at the end . This ensures educational content is explicitly delivered, not just implied.

* *Multi-language Support:* All textual content in puzzles and narratives will be translatable. We plan to support English initially, with others (French, Spanish, etc.) via content files so organizations can train in native languages .

* *Room Completion Criteria:* Each room must be fully completed to unlock the next. Admins can override to allow skipping if needed, but default flow is linear. Upon completing a room, the user (or team) sees a results screen with score, time, and a list of objectives learned. They also perhaps get a specific badge for that room (e.g., “Phishing Phenom” for Room 2 if perfect score).

**Acceptance Criteria (Game Design):**

Each room will have specific acceptance tests to ensure they meet requirements:

* All puzzles in a room must align with stated learning objectives (reviewed by a cybersecurity subject-matter expert).

* It must be **impossible** to bypass a learning point; e.g., guessing an answer should still trigger the explanation of why that’s the answer.

* The hint system must reduce frustration: ensure at least 90% of beta testers can complete each room without external help, using hints if necessary.

* Team rooms must remain solvable if 1 or 2 members disconnect (i.e., not require a specific person’s input exclusively – others can take over roles if needed).

* The final room must enforce the role-based collaboration (tested by having teams confirm each member had an active task to do).

* All rooms must record detailed telemetry (time on puzzle, mistakes made) for analytics.

The game design above provides a blueprint for developers and content creators to implement the interactive cybersecurity challenges. Next, we layer on the **gamification system** that ties these rooms together into a cohesive, motivating experience.

# **Gamification System**

To drive engagement and reward continued participation, CyberSafe Escape implements a robust gamification framework. This system adds points, achievements, levels, and competitive elements that overlay the core training. The design follows best practices in gamification for learning: providing clear goals, feedback, a sense of progression, and social recognition . All gamification elements are carefully tuned to *support* learning (not distract), and are optional for users who prefer to not publicize their performance (privacy settings will allow opting out of leaderboards etc.).

The key components of the gamification system include:

## **Points & Scoring System**

**Point Structure:** Points are the basic reward currency. Users earn points for completing puzzles, rooms, and various activities:

* **Puzzle Completion:** Each puzzle within a room yields points. For example, correctly solving a puzzle might give \+100 points. More complex puzzles can give more (e.g., final room puzzles \+200 each). Partial credit is possible: if a puzzle has multiple parts or if a user needed hints, points could be reduced accordingly.

* **Accuracy Bonus:** If a puzzle is solved with no mistakes (e.g., no incorrect attempts), bonus points are awarded (e.g., \+20% for perfect accuracy). Conversely, multiple wrong attempts might reduce points (to discourage random guessing).

* **Time Bonus:** Finishing a room quickly yields a bonus. For instance, each minute remaining on the clock could add \+10 points. This encourages efficiency but is balanced so rushing isn’t more important than learning. (We ensure even if a user takes the full time but eventually solves, they still get substantial points; time bonus is an extra, not the core.)

* **Collaboration Bonus:** In team rooms, if the team demonstrates good collaboration (e.g., all members participated as tracked by actions or if they use the voting tool effectively), award extra points to each. Also, completing a team room gives every member a team completion bonus.

* **Streaks:** If a user solves several puzzles in a row without hints or errors, a “streak multiplier” temporarily increases their point gains (for example, a combo multiplier x1.1 for 3 in a row, x1.2 for 5 in a row, etc.). This resets if they use a hint or fail a puzzle. This mechanic adds game-like excitement and rewards consistent focus.

* **Daily Challenges:** The system can present a daily mini-question (outside the main rooms, like a trivia or quick puzzle) to earn small points (say 50 points) to keep engagement up between major sessions. Points earned here feed into their total score.

**Point Balancing:** Points will be calibrated such that completing all six rooms with average performance yields a baseline (say \~10,000 points). Achieving near perfect runs with bonuses might yield up to \~15,000. This gives headroom for improvements and ensures that differences in performance reflect in scores (for leaderboard purposes).

**Uses of Points:**

* Points contribute to **leveling up** (see Progression System below).

* They determine positions on certain leaderboards (individual points leaderboard).

* They can be used as internal “currency” to unlock cosmetic features, if any (for example, customizing their avatar or virtual environment background in future enhancements). However, in MVP, points are primarily a feedback and competition mechanism, not for in-game purchases.

**Acceptance Criteria (Points):**

* The system must record points in real-time as users complete tasks, and display feedback like “+50 points” on the UI after a correct action (positive reinforcement).

* It should prevent point farming by repeating trivial actions – points are tied to unique completions or meaningful achievements (e.g., no points for repeating an already passed room unless it’s a formal replay for a better score).

* Must have configurable difficulty profiles: e.g., an “Easy mode” for novices might award more hints but fewer points, whereas “Hard mode” could give a scoring multiplier for those seeking challenge.

* Ensure that point totals cannot overflow or become negative (data validation) and are safely stored (likely as an integer in the database, see Data Model).

## **Badge & Achievement System**

Badges are **visual achievements** that users earn for reaching specific milestones or demonstrating skills. We will design a rich array of 30–50 badges to recognize various accomplishments, providing short-term goals and bragging rights. Badges have a title, an icon, and a description of what it took to earn them. They appear in the user’s profile “trophy case” and a notification is shown when earned.

**Achievement Categories & Examples:**

* **Completion Badges:** for finishing content.

  * *Room Completion:* e.g., “Fortress Conqueror” badge for finishing Room 1, “Phish Finder” for Room 2, etc. (6 badges, one per room, likely Must-have).

  * *Entire Game:* “Escape Artist” badge for completing all 6 rooms (Must-have). Also a Platinum variant if done without any hints perhaps.

* **Performance/Mastery Badges:** rewarding high achievement.

  * *High Score:* “Sharp Shooter – Scored 90%+ in all quizzes/puzzles in a room” or “Puzzle Perfection – completed a room with zero mistakes”.

  * *Speed:* “Fast Escaper – finished a room with over 5 minutes remaining” or “Speedrunner – finished the entire game under X minutes total”.

  * *No Hints:* “Solo Solver – completed a room without using hints” (could be one per room or one overall if all rooms no hints).

  * *Streaks:* “On a Roll – solved 5 puzzles consecutively with no errors”.

* **Collaboration Badges:** for team dynamics.

  * “Team Player – participated in a team room and contributed (spoke or acted) at least 5 times.”

  * “Leadership – led your team to success by initiating key actions” (this might be detected by who clicked the most objectives or perhaps if roles are assigned, the Incident Commander on a successful mission gets a badge).

  * “Flawless Team – your team completed a room with zero mistakes” (rare/legendary category).

  * “Helper – used the in-game chat to give a helpful hint to a teammate (and solved puzzle thereafter).”

* **Frequency & Consistency Badges:** to encourage regular engagement.

  * “Daily Learner – completed a training activity or logged in 5 days in a row” (streak badge).

  * “Marathon – spent at least 2 hours in the training overall” (shows dedication).

  * “Comeback – improved your score on a room by re-playing it” (for those who retry to do better).

* **Special Challenge Badges:** fun or secret achievements to surprise users and encourage exploration (these act as “Easter eggs”).

  * “Eagle Eye – spotted all 5 clean desk violations in Room 3 in under 30 seconds.”

  * “Polite Communicator – always used the reporting feature instead of just deleting phishing emails in Room 2” (if multiple ways to solve exist).

  * “Bug Bounty – clicked on a hidden clickable (e.g., a poster on the wall that gives a security tip)” – encourages curiosity.

  * Seasonal or event-based badges: e.g., if we run a special scenario in Cybersecurity Awareness Month, participants get a limited edition badge. (This is future, but architecture should allow adding badges easily.)

**Badge Tiers:** We can classify badges by rarity or tier: common (earned by most, e.g. completion badges), uncommon (good performance), rare (excellent performance or hidden). Possibly visually differentiate them (color border or star rating). This way, truly exceptional users can stand out. For example, “Incident Commander” badge for Room 6 could have a normal version for completing and a “Legendary Incident Commander” if completed with maximum score under time, etc.

**Team vs Individual Badges:** Some badges are individual (awarded per user when criteria met), even if achieved in team context. Others could be team badges (meaningful for group achievement, but since users ultimately have their own accounts, a “team badge” would effectively just be identical badges given to each member of a team when together they do something). We could list team achievements on a team page if persistent teams exist, but in our system teams are session-based except for possibly persistent grouping. So likely badges are tied to users. However, a concept of “Team of the Month” could exist on leaderboards rather than a badge.

**Badge Management:** Admins can enable/disable certain badges via settings if desired (some organizations might not want competitive aspects too highlighted). By default, all badges are enabled . Badges are not awarded retroactively if they were disabled and later enabled – only actions going forward count .

**Notification & Display:**

* When a badge is earned, the user sees a pop-up: e.g., “🏅 Congratulations\! You earned the **Phish Finder** badge: Identified all phishing emails correctly.”

* On their dashboard, a “Badges” tab shows all earned badges and greyed-out placeholders for those not yet earned (teasing goals to strive for). The badge description tells how to earn it, unless it’s a secret badge (those might be hidden until achieved to surprise users).

* Optionally, integrate with email or Slack: user could get a congratulatory email or Slack message when a significant badge is earned (configurable).

**Acceptance Criteria (Badges):**

* Each badge has a **unique identifier**, name, description, icon, and criteria that can be evaluated by the system (see Data Model for Achievements).

* The system must evaluate badge criteria either in real-time (e.g., after completing a room, check all applicable badges) or via a periodic process (e.g. end of session award calculation). This includes aggregating data (like “all rooms done without hints”).

* Users can view which badges they have and which they haven’t – for unearned badges, the system should show either a hint or remain hidden if secret.

* Must ensure badges cannot be falsely triggered (for example, if a user repeats a room multiple times, they shouldn’t get multiple of the same badge; each badge is awarded once maximum per user).

* Leaderboards should optionally show a count of badges for each user as an additional prestige metric.

## **Progression & Leveling System**

To give a sense of long-term progression beyond just immediate points, we implement an experience (XP) and level system. Users “level up” their profile as they engage with training, indicating mastery over time and unlocking new content or bragging rights.

**Experience Points (XP):** XP is closely tied to points but could be a separate scale to fine-tune leveling. For simplicity, we might set 1 XP \= 1 point in early phases. Or differentiate: points might fluctuate with bonuses each session, whereas XP could be more linear (e.g., certain actions always give fixed XP). We’ll likely use points as XP for now to avoid confusion – i.e., total points accumulated contributes to leveling.

**Leveling Mechanics:**

* Define a level curve, e.g., Level 1 starts at 0 XP (basically upon registration), reaching Level 2 at 500 XP, Level 3 at 1500 XP, etc., increasing thresholds in a semi-exponential curve so higher levels require significantly more points (to stretch out progression for engaged users). Possibly cap at Level 10 or 20 for first version, or keep open-ended with no hard cap.

* As users complete training (all rooms) in one cycle, they might be around level 5-6. If they redo training or do additional challenges, they can climb higher. This allows ongoing engagement even after main content is done (especially if we add content updates, daily challenges, etc.).

* Each level could have a title (for flavor). For example: Level 1 “Newbie”, Level 5 “Cyber Apprentice”, Level 10 “Security Warrior”, Level 20 “Cybersecurity Master”, etc. These titles show on their profile and maybe on leaderboards.

**Unlocks and Rewards:**

* While the main six rooms are unlocked sequentially by content completion (not by level), we can use levels to unlock **bonus content** or cosmetic features. For example, reaching level 5 might unlock a bonus challenge room or a “hard mode” version of a puzzle for extra practice (if available). Or it could simply be a mark of prestige if no extra content.

* If implementing a skill tree concept: perhaps let users specialize (e.g., focus on “Phishing Specialist” path vs “Password Guru”), but that might complicate initial scope. Instead, we can simulate a skill tree by granting special badges or titles for doing extra optional modules. For now, we will note the idea of skill paths as a *Could-have* if we add more content beyond the base game.

* **Prestige/Repeatability:** For organizations that require annual training, the platform can allow “prestige” levels on re-training. For example, after finishing all rooms, one could “reset” and do new scenarios the next year while keeping their previous level, or even adding a prestige badge indicating a second playthrough. This ensures the leveling system doesn’t stagnate after one completion.

**Team Progression:** If persistent teams exist (e.g., a class or department group), we might consider a team level (sum of member XP or average). But that could be more confusing than useful. More relevant is department/organization progress in admin analytics rather than gamified levels.

**Acceptance Criteria (Progression):**

* XP is correctly tallied for all activities and stored. Level-ups are triggered immediately when threshold is reached, with a visible notification (“Level Up\! You are now Level 5 – Security Specialist”).

* The level and XP needed for next level should be shown on user dashboard (progress bar).

* Ensure that the XP curve is bounded such that normal use (completing all tasks) gets a meaningful but not max level. We may test that an average user ends up \~Level 8 out of, say, 15 possible in a year.

* Level titles and any unlockable content should be documented and tested for proper unlocking. If no content unlock, at least the recognition (title change, maybe a new avatar border) should apply.

* The system should allow configuration of XP thresholds (perhaps an array in a config or DB) so we can adjust leveling difficulty without code changes, if balancing is needed after user feedback.

## **Leaderboards**

Leaderboards introduce a social competitive element, which can significantly boost engagement by leveraging users’ natural ambition to rank higher . We will include multiple types of leaderboards, while also providing *privacy controls* for users or organizations who opt out of competition (e.g., an individual can hide their name, or an admin can disable leaderboards in sensitive environments – these are important to avoid negative pressure).

**Leaderboard Types:**

* **Individual Leaderboards:**

  * *Global Individual (All-Time):* Ranks all users in an organization (or globally, though likely per organization instance) by total points or XP accumulated. This shows who has the highest overall score. Useful for, say, a company to see top performers.

  * *Periodic Leaderboards:* Daily, weekly, monthly resets showcasing who earned the most points in that period. This keeps competition fresh and encourages continuous activity (someone new can top a daily board even if overall they’re behind longtime users).

  * *By Room or Category:* Possibly a board for best performance in a specific room or specific metric (like fastest time for Phishing Waters, highest score in Password Fortress). This can encourage targeted improvement.

* **Team Leaderboards:** (for team performance)

  * *Best Teams (by score/time):* If persistent teams or departments are defined, rank teams by average score or fastest escape times. For example, a “Team Leaderboard” might list “Team Alpha – 5400 avg points” vs “Team Beta – 5300 avg”. This could drive inter-department competition in a company or inter-class competition in a school district.

  * *Team vs Team Challenges:* Possibly have an event where teams compete in real-time; the leaderboard updates live. (This is an advanced scenario outside core training, but architecture should allow posting scores via API so external competitions can feed the board).

* **Department/Class Leaderboards:** If user groups (like by department or class) are configured, show an aggregate leaderboard: e.g., which department has the highest completion rate or average score. This can motivate group accountability (e.g., sales vs engineering in a fun rivalry for awareness scores).

* **Organization Leaderboard (multi-tenant scenario):** If the platform is used across different organizations, we typically wouldn’t expose cross-organization comparisons in the product by default (for privacy and because different orgs might have different content sets). However, an *optional* global leaderboard (top 100 players globally) could exist if that’s desirable as a marketing/community feature. That would likely be a Could-have, and anonymized or opt-in.

**Leaderboard Privacy & Options:**

* By default, leaderboards within an organization show **display names** of users and possibly their avatar or anonymized name if privacy mode. Each user can choose in profile settings “Show me on leaderboards: Yes/No”. If No, they appear as “Anonymous” or not at all.

* Admins can enforce anonymity or disable leaderboards entirely via settings if it doesn’t fit their culture (e.g., some schools might worry about competition affecting self-esteem). In that case, the UI will hide the leaderboard tab.

* For those appearing, we ensure no sensitive info is shown – just name (or alias) and scores. Optionally allow use of aliases if users prefer not to use real names publicly.

**Leaderboard UI:**

* A “Leaderboards” section on the user dashboard shows tabs for the various boards (e.g., “This Week”, “All Time”, “Teams”). Users can scroll a list of top 10 or 20\. If the user isn’t in top N, we show “Your rank: 37th (1500 points)” at the bottom for context.

* Each entry might show rank, user name, level or badge icons, and the relevant score.

* Leaderboard data should update in near-real-time (we can update after each room completion or daily, but immediate feedback is more engaging – using WebSockets or polling to update the board when someone’s score changes significantly could be considered).

* Ensure the design is responsive: on smaller screens maybe only top 5 or a collapsed view.

**Acceptance Criteria (Leaderboards):**

* Leaderboards accurately reflect the sorted order of users by the chosen metric. Ties are handled consistently (either both get same rank or tie-broken by who reached it first, etc.).

* The system can handle a large number of users efficiently (maybe only load top 100 to client, but able to query a user’s rank among thousands via indexed DB queries).

* Privacy controls function: if a user opts out, their name and score do not show up (or shows as “Hidden User” if necessary to not re-rank everyone – simpler is to remove them entirely from that output).

* No PII beyond possibly names should appear; ensure usernames displayed obey any anonymity rules set by admin (some might want to display only first name \+ last initial, etc. – we could allow customization of display format).

* Leaderboards should be filterable by organization or group if needed (an admin at a district might want to view a particular school’s leaderboard, etc., if we support multi-level tenancy).

## **Streaks & Engagement Loops**

Building habit-forming positive routines is important for learning reinforcement. The platform will include features to encourage regular engagement:

* **Daily Login Streak:** If a user logs in and completes at least one activity (could be a daily challenge or a room) on consecutive days, they build a streak count. E.g., 5 days in a row might grant a small bonus (points or a minor badge like “5-day streak”). A UI element (fire icon or calendar) shows how many days in a row. Breaking the streak resets it. This leverages the “don’t break the chain” motivational technique common in language learning apps. We will keep streak goals moderate to avoid burnout (e.g., highlight up to 7-day streaks).

* **Weekly Challenges:** Each week, present an optional challenge scenario or quiz question outside the main rooms. For example, “This week’s challenge: Spot the phishing email in under 30 seconds” – a single quick puzzle. Completing it gives bonus points or a special “Weekly Challenge” badge. This content keeps users engaged post-main training and can be updated regularly by content admins (maybe a library of 52 challenges).

* **Quests or Missions:** Could group certain tasks into a mission. For example, a “Security Champion Mission” might say: complete all rooms with no hints this month, or get 3 colleagues to play a team room (social mission). These act like meta-achievements, possibly unlocking unique badges or more points.

* **Seasonal Events:** In line with real-world events like National Cybersecurity Awareness Month (October) or Data Privacy Day, run special event content or competitions. For example, an October event might pit departments against each other on who scores highest that month, with a trophy badge like “Awareness Month Champion 2026.” These events keep the content fresh yearly. (This is a Won’t for MVP but good to plan architecture to allow it).

* **Email/SMS Reminders** (if opted in): If a user hasn’t logged in for a while and their streak dropped, we can gently nudge via email: “You’re learning to be a cyber ninja\! Don’t miss today’s challenge to keep your streak.” These need to be used carefully to not annoy; likely an admin-controlled feature under notifications.

* **Rewards for Consistency:** In addition to streak badges, we may give accumulating minor rewards like “every 7-day streak gives 100 bonus points” or at month’s end, if you had at least say 20 days active, you get a big XP bonus or an achievement. This gives tangible incentives for regular practice.

* **Social Sharing (optional):** Allow users to share certain achievements externally (e.g., post their certificate or badge to LinkedIn or Twitter). While not exactly an engagement loop within the app, it can motivate users to earn those shareable accolades. For instance, a user who finishes the course could click “Share on LinkedIn: I just completed CyberSafe Escape training and earned the Incident Commander badge\!” – this not only rewards the user with peer recognition but also promotes the platform. Of course, this is optional and the content of the share should not reveal sensitive info (just a generic template).

**MoSCoW Prioritization for Gamification:**

* *Must-haves:* Points system, basic badges (completion and performance), leveling, individual leaderboard (at least all-time), basic streak tracking. These are core to initial engagement.

* *Should-haves:* Weekly challenges, team/department leaderboards, more extensive badge catalog, privacy toggles, daily login streak UI.

* *Could-haves:* Seasonal events, advanced missions/quests, social sharing features, skill trees.

* *Won’t-haves (for MVP):* Virtual economy or item store (beyond badges), overly complex skill specialization, anything that overshadows the training purpose (gamification is icing, not the cake).

**Acceptance Criteria (Engagement Loops):**

* Streaks: The system must correctly count consecutive days and reset. Also, handle different timezones (preferably streak is based on user’s local day or a fixed server day cut-off; we’ll document approach – likely based on org’s timezone or UTC).

* Challenges: If weekly challenges are enabled, they should automatically rotate or be set by admin. The content should load correctly on schedule.

* Leaderboards should reflect streak or challenge achievements where applicable (like a separate “highest streak” board if that’s wanted).

* Ensure that none of these engagement features compromise data privacy – e.g., emails only go to opted-in users, and sharing does not leak internal training data.

The gamification system is carefully integrated to *motivate* users without turning off those less competitive. By offering both individual and team rewards and maintaining an element of fun, it aims to sustain user interest over the training period and beyond.

# **Multiplayer & Collaboration Features**

Several rooms in CyberSafe Escape require real-time collaboration. The platform must support seamless multiplayer experiences where users can communicate and work together on puzzles. This section details how teams are formed, how real-time communication is achieved, collaborative mechanics during gameplay, and measures to ensure fairness and prevent cheating.

## **Team Formation**

**Team Size:** Based on game design, team rooms perform best with **2 to 6 players** . We will enforce a minimum of 2 for team rooms (if a user is alone, they can’t start a team room unless perhaps we allow a single-player version with AI teammates in the future, but not for MVP). Maximum 6 to avoid chaos and technical strain (more streams, etc.). Admins could configure max team size in settings if needed, but 6 is recommended default.

**Team Assembly Options:**

* **Pre-formed (Custom) Teams:** Users can create a team and invite specific people. For instance, an instructor can assign students to teams, or employees might form a team with their immediate coworkers. The UI allows creating a team lobby: one user “hosts” and others join via an invite link or by team name/ID. Team creator can optionally name the team.

* **Random Matchmaking:** Alternatively, if users don’t have a set team, the system can auto-assign them. For example, if 4 users want to do Room 2 around the same time, the system can group them. A “Find Team” button can place a user into a queue for a given room and auto-launch when enough players gather or a set wait time passes. This is useful in large organizations or schools where many might be online.

* **Scheduled Teams:** Admin or users can schedule a session for team rooms at a certain time, sending invites (particularly for training events). At that time, team members log in and the session starts. The platform should support scheduled games (maybe sending reminders).

* **Persistent Teams (Optional):** We might allow formal team registration (like a team stays together across sessions, with a team profile and history). For MVP, teams are likely ephemeral per session, but we will have groupings in admin for departments. If persistent teams are implemented, we’d store a team entity with members and track their joint achievements. This could be a Should-have if it boosts camaraderie (e.g., a class of 5 always works together in multiple rooms). The PRD will include a data model for teams accordingly.

**Team Lobby:** Once a team is formed (by invite or match), they enter a **Team Lobby** screen. Here:

* Members see who’s joined (names, avatars).

* They can test their video/audio connection (small talk or strategy chat before starting).

* A ready status indicator – each player clicks “Ready” when all set. The host can see who is ready. Possibly an auto-start when all ready or host can force start if, say, some aren’t interacting.

* If allowed, team settings could be adjusted here (maybe choose difficulty mode, or assign roles manually if the game supports pre-assignment).

* Team Name: if not already set, they could pick a fun name here, which might display on leaderboards. By default, something like “Team A1” can be auto-assigned.

**Joining Late or Reconnecting:** If a user disconnects mid-game (network issues), they should be able to rejoin the ongoing session (within a time window). The system will keep their state and allow re-entry to the room. New players generally cannot join mid-room once started (to avoid disrupting puzzles). So team formation is effectively locked once the room begins. If someone fails to join or drops early, the team can still proceed – puzzles can be solved by remaining members (should scale difficulty accordingly if possible, or just proceed with fewer). The UI might note “Player X disconnected” and possibly adjust as needed (for example, if roles were assigned, either reassign automatically or allow others to fill in).

**Team Persistence per Session:** The team exists for the duration of the session (one room playthrough). After completing the room, the team can choose to continue to the next team room together (flow back to a lobby for next room) – this encourages groups to stick through the whole game. Perhaps after finishing one team room, prompt “Continue with same team to next challenge?” If yes, keep team. If no (some leave), they can disband.

**Role of Admin in Teams:** Admins can have the ability to pre-assign teams for their users if desired (especially in education, a teacher might set who works with whom). The system could import team rosters or allow admin to create teams and send notifications to those users. This would be a nice feature for classroom management. If not initially, at least teacher can instruct students manually to group and use the invite link method.

**Acceptance Criteria (Team Formation):**

* Users can successfully create a team and invite others, or join a team by invite, with no more than X steps (should be very straightforward UX).

* The system prevents more than the max players from joining (the 7th user gets a “team full” message).

* Matchmaking should not leave people stranded: if using an auto-match queue, ensure that if after some time not enough players, either start with those present (if above min) or prompt to invite more.

* Lobby shows real-time updates when players join/leave. Starting the game should only happen when conditions are met (e.g., at least 2 players, everyone ready or host override after a grace period).

* Reconnection: Simulate a user drop – ensure they can rejoin (with perhaps a rejoin token or session ID) and synchronization occurs (their video reconnects, puzzle state updates).

## **Real-Time Communication**

A cornerstone of the multiplayer experience is robust real-time communication: video conferencing, audio, and text chat integrated into the game interface. This must work peer-to-peer or through a server reliably across common browsers (Chrome, Firefox, Edge, Safari) and networks (consider corporate firewalls).

**Video Chat (WebRTC):**

* Utilize **WebRTC** for peer-to-peer video/audio streams. Given up to 6 participants, a mesh P2P might be borderline (since each peer sends streams to 5 others, which is heavy). Instead, we plan to use a SFU (Selective Forwarding Unit) architecture with a media server for efficiency. Options: **Mediasoup**, **Janus**, or **LiveKit** are leading open-source SFUs. Research suggests Mediasoup offers high performance and flexibility for complex use cases , whereas Janus is mature and plugin-flexible, and LiveKit provides easy cloud or self-hosted solution. We lean toward **Mediasoup** for its low latency and strong track record in scalable group calls (sub-50ms latency at high loads vs Janus which can reach \~268ms under load) . Mediasoup allows us to write server-side in Node (or even use their TS client), aligning with our Node.js backend.

* Quality: We’ll aim for 720p video at 30fps as default for a good balance of clarity and bandwidth, with dynamic adjustment. WebRTC can adapt via bandwidth estimation (taking advantage of SFU to distribute simulcast streams of multiple resolutions). If network is poor, it’ll auto-drop to lower resolution.

* Features:

  * Mute/Unmute: Users can turn off their camera or mic via UI controls. Indicators show who is muted. Possibly auto-mute others when one is solving a puzzle requiring concentration (future improvement).

  * Active Speaker Detection: Highlight or bring to front the video of whoever is speaking, to make conversation easier (the SFU can send audio volume info, or use WebRTC’s tracks for that).

  * Layout: likely a grid of videos or a main video \+ thumbnails. Since teamwork is at most 6, a 2x3 grid is fine on desktop. On smaller screens, maybe switch to an active-speaker view.

  * Fallback: If video fails (due to firewall or low bandwidth), we at minimum keep audio. Our TURN servers ensure direct connectivity behind NAT. If even that fails, we encourage using the text chat.

**Audio Chat:**

* Delivered via the same WebRTC streams as video (each stream has audio). We ensure echo cancellation, noise suppression (WebRTC has built-in getUserMedia constraints for that). Provide a **Push-to-Talk** mode option: some users prefer not continuous open mic. Push-to-talk means their mic is only live when holding a certain key (we can allow configuring a key, or a button on UI). Alternatively, an open mic mode where it’s always on. This is user-configurable in settings or easily toggled (“Push-to-Talk mode On/Off”).

* Audio is crucial, arguably more than video for solving puzzles collaboratively. So if bandwidth is limited, we drop video first but keep audio (we can implement bandwidth detection: e.g., if packet loss high, temporarily stop sending video).

* Ensure compatibility: Use Opus codec (standard) for audio, VP8/VP9 or H.264 for video (H.264 might be needed for Safari compatibility). We’ll implement codec settings such that all major browsers interoperate.

**Text Chat:**

* In-game text messaging panel for each team. This is a real-time chat (could use WebSockets or WebRTC Data Channel – simpler to use WebSockets via our server given we already have that infra for puzzles).

* Chat supports basic features: send messages, see sender’s name, timestamp. We might include emojis or not at first. Possibly allow screenshot or file share? That could be abused (like sharing answers), so perhaps not allow file upload in chat to avoid leaking puzzle solutions easily – or if allowed for hints by design, with caution. Likely text-only and maybe image embed disabled for now.

* **Moderation:** Since chat content is user-generated, we plan a simple filter for common profanity or allow admins to review logs if needed (for school use, we want to ensure safe communications). Could integrate a list of banned words to censor/flag.

* Chat persists for the session; not saved long-term except maybe for audit (in case of harassment complaints, admin could retrieve chat transcript – to decide in privacy policy).

* Chat UI: likely a sidebar or toggleable panel alongside the game view. Should be usable while puzzles are on-screen (some can keep it open to coordinate, or hide it if not needed).

* Mention: Possibly allow @mention if needed, but with 6 people it’s manageable without advanced features.

**Integration in Interface:**

The game UI will incorporate video and chat without overshadowing puzzles: e.g., video feeds could appear in a corner or top bar during gameplay, and text chat as an overlay or side pane. We must ensure puzzles remain visible and usable. We may allow resizing or minimizing video if needed.

**Technical Implementation:**

* Use Socket.io or pure WebSocket for signaling (to establish WebRTC connections). The signaling channel will exchange SDP offers/answers and ICE candidates.

* A TURN server (and STUN) is required for NAT traversal. We will deploy a TURN (like coturn) on the server side (especially for corporate environments where direct P2P might fail).

* The media server (if using Mediasoup or LiveKit) will handle forwarding streams. It will require its own scaling considerations (if many concurrent teams, multiple SFU instances might be needed). Possibly one media server instance can handle many 6-person calls given optimization. We plan horizontally scaling SFU if needed (with routing logic or use a cloud SFU service if scaling beyond MVP).

* Browser compatibility: ensure WebRTC works on Chrome, Firefox, Edge, Safari (Safari needs H.264 by default, so either use H.264 codec or ensure Safari participants get H.264 while others might do VP8 – SFU can transcode or we enforce common codec to simplest route). Provide clear instructions to users to allow mic/camera permissions.

**Fallback Options:**

* If a user’s browser or device cannot do WebRTC (rare on modern devices, but e.g., an older IE or locked-down environment might not allow it), we should have at least a text-only mode so they can still participate via chat. Or encourage use of telephone dial-in (not planned for MVP, but could integrate a PSTN dial-in via a service like Twilio if needed for enterprise where some users are remote via phone). That’s likely out of scope unless strong need arises.

* If video fails mid-session due to network, automatically try to reconnect streams. If not, notify the user (“Connectivity issue, trying to reconnect…”). The game should be playable even if video is off; puzzles are collaborative but can be done with audio or text if needed.

* If the whole real-time service goes down (SFU crash), have a contingency: possibly auto-switch to peer-to-peer mesh as backup (if only 2-3 users, that’s fine). Or quickly restart media server and reconnect clients. We should design the client to handle reconnection logic gracefully (e.g., auto rejoin media on server failover).

**Security of Comms:**

* Use DTLS/SRTP encryption which is standard in WebRTC – all media is encrypted in transit. No recording by default (unless admin explicitly starts a recording service for later review, which we might not do initially).

* The signaling WS will be over WSS (TLS).

* Possibly implement an authentication token for joining calls so only invited users connect to the room ID (prevent random eavesdropping). The SFU will have an access control for room sessions.

**Acceptance Criteria (RTC):**

* Two or more users in a team can see/hear each other with \< 1 second latency and acceptable quality on typical broadband (tested e.g. with 4 participants on various browsers).

* If one user disables video, others see a placeholder avatar and still hear audio.

* Chat messages are delivered near-instantly (\<300ms typically) to all team members, including those who join late (maybe they see from that point on, not entire history to avoid confusion unless needed).

* The system can handle at least, say, 50 concurrent team sessions (scalability test) without quality degradation beyond acceptable (this is more load test).

* Push-to-talk mode: when enabled, microphone only transmits while holding designated key, verified by others not hearing when not pressed.

* All UI controls (mute, end call, send message) function and update state for everyone properly.

* Network test: simulate 20% packet loss or 500ms jitter on one user – video should downgrade or pause, audio perhaps choppy but system stays connected (i.e., resilient to poor networks).

* Browser compatibility test: 1 user on Safari, others on Chrome – all can communicate (ensuring codec negotiation works).

* No echo or feedback loops – verify we apply echo cancellation (especially if user has speakers).

* The chat should disallow script injection or styling that could break UI (i.e., sanitize messages to prevent any XSS).

## **Collaborative Mechanics**

Beyond communication, we must enable collaborative *puzzle-solving mechanics*. This includes synchronized views, shared actions, voting, role-based interactions, and help requests.

**Shared Puzzle Interfaces:**

* All team members should see puzzle states in sync. For example, in Room 2’s email sorting, when one player moves an email to the Phish bin, it should reflect on everyone’s screen in real-time. We’ll use WebSockets to broadcast state changes (or a state server that authoritative). Possibly implement a simple game state management on server to which clients connect and subscribe to updates.

* If multiple people can interact at once, we need to handle concurrency: e.g., locking an item when Player A is dragging it, to prevent Player B interfering (or allow both to drag different items concurrently, but then ensure consistency). We should design puzzles to minimize conflicting actions or implement transactional updates (like last action wins or merges logically). Testing specific puzzles for race conditions is needed.

* For complex tasks (like the detective board in Insider Threat), maybe only one can move clues at a time, or each gets personal view and a “sync” button. However, real-time share is preferred for immersion. We might implement a simple **operational transform** or conflict resolution logic for certain collab content (like Google Docs does for text – but our use cases are simpler).

* We will maintain an authoritative game state on the server for team rooms. Clients send actions (via WebSocket events), server updates state if valid and broadcasts to all clients. This ensures consistency and prevents cheating by client manipulation.

**Voting Systems:**

* Some decisions benefit from voting or consensus (like deciding which suspect is the insider). We’ll implement a voting mechanism where each user can cast a vote via their UI, and everyone sees the tally update in real-time. For example, “Who is the insider? (Alice, Bob, Charlie, Dana)” – each clicks their choice, and a vote count is shown. Once all votes are in (or a timer ends), the team can lock in the majority decision. If unanimous required, highlight when all agree. This ensures participation and an official way to make group decisions.

* For simpler cases, maybe a thumbs-up button when ready to proceed or if they agree on something. The system can show “5/5 ready” and then automatically proceed.

**Role Assignment & Coordination:**

* In the final room or others where roles exist, the system might assign roles randomly or let them choose in lobby. E.g., one is Commander, one is Analyst, etc. The UI then customizes some controls for them (the Commander might have a “big picture” map and communication console, the Analyst sees detailed logs). They must communicate findings to each other. This asymmetry forces cooperation.

* We will ensure any role-specific UIs still allow others some visibility so they’re not bored (e.g., maybe others see a summary of what the Analyst is doing, or the Analyst can broadcast a result into a shared area).

* If a role player disconnects, either allow reassigning that role to someone else on the fly or have a fallback (maybe the Commander UI becomes available to another if original leaves).

**Ask for Help System:**

* If a team is really stuck, beyond hints, they might want external help. We could incorporate a feature to call a **Game Master** or consult another team. However, since this is meant for self-paced training typically without a live moderator, we won’t have a human game master (though some competitor scenarios did that). Instead, “Ask for Help” could be a mechanic where they spend points or time to get a heavy hint or solve a piece. For example, a team can decide to sacrifice 100 points to reveal one answer or get a big hint. It’s a team vote maybe (majority decides to use it). That way, if all else fails, they can progress (important for training completion).

* Alternatively, an “Ask an Expert” button could ping an admin or show an FAQ if integrated, but that’s less fun.

* We can incorporate this as an extension of the hint system but requiring team consensus to use, so no one trigger-happy user can just use it without agreement.

**Screen Sharing:**

* Possibly allow one team member to share their screen within the game if needed (for example, if one is doing a complex analysis and others want to see how). But building a full screen-share in browser is complex (though WebRTC can capture display). Might be overkill since we can design puzzles to not need such external tools. Likely Won’t-have for MVP. Instead, ensure everything needed is within the game interface for all players.

**Collaborative UI Features:**

* Show cursors or highlights when someone is focusing on an element. E.g., if Player A hovers an email, maybe an icon or their colored cursor appears so others know “Alice is looking at that email”. This helps avoid everyone doing the same thing redundantly and fosters discussion (“I see you’re checking that link, I’ll check the other one”). We can assign each player a color and initials and use that to mark their interactions (could be a Could-have for polish).

* A shared notepad or whiteboard for jotting notes could help (especially in complex puzzle like insider threat). If time, implement a simple text area all can type in (with editing sync). Or ensure they could use the chat or pencil on puzzle surfaces (like marking clues as important).

**Anti-Cheat & Fairness:**

It’s important to maintain the integrity of the game so that users actually learn and do not just copy answers from others or from previous runs.

* **Randomized Puzzle Variations:** Key puzzle details (like the set of phishing emails, or the culprit in the insider scenario) should vary per session. We can have a pool of equivalent puzzles and randomly pick or shuffle content. For example, Room 2 could have 30 possible phishing email examples and each session gets 10 out of those, randomly. Similarly, the culprit in Room 5 could be randomized among the suspects by randomizing clues (ensuring consistency so there’s always exactly one correct suspect, but not always the same person). This prevents sharing static answers (“the insider is always Bob”) – instead, next team might have it be Alice.

* **Dynamic Codes or Solutions:** Where applicable, puzzles that require codes (like a password or an answer to a riddle) can be generated or rotated. E.g., the password cracking challenge might pick a different weak password from a list each time.

* **No straightforward Q\&A lists:** Avoid pure trivia that could be memorized; prefer interactive tasks. If quizzes exist, randomize question order and answer order.

* **Prevent Answer Sharing Across Sessions:** While we can’t stop people from telling others, we can reduce incentive by gamification (if someone just gives answers, the other person might get points but won’t understand – but some might do it anyway). If admin suspects widespread answer-sharing, they have the option to create new puzzles or use our variation pools. In graded environments (like a graded school exam scenario), an admin might schedule everyone to play at same time to avoid foreknowledge.

* **Time-based Lockouts:** Ensure that if someone failed or succeeded, they can’t immediately replay to farm points or get a better score without cooldown. Possibly if they fail a room, they can retry but with a small point penalty for retry or just no additional point gain for repeated success (points for a room might only count once per user, or the best of attempts). This prevents exploit of repeating an easy room for infinite points.

* **Monitoring/Analytics for Cheating:** The admin dashboard could flag suspicious behavior, e.g., if one user completes puzzles impossibly fast consistently (maybe they got answers externally). While difficult to automatically prove, we can log times and allow admins to intervene (e.g., require re-training).

**Fair Teamplay:**

* If one or two members dominate (solving everything), others might coast. We want to encourage involvement: e.g., awarding collaboration score when multiple people perform actions. Possibly design puzzles requiring multiple inputs (like each person gets part of a code).

* A “team member contribution” metric can be calculated (\# of actions or chat messages by each). The admin report will show if someone didn’t participate. The game could also gently enforce turn-taking in some puzzles (like each person is required to solve at least one sub-puzzle to proceed). But we tread carefully as forcing might frustrate. At least, highlight to players if someone hasn’t done anything: e.g., after puzzle 3, show “Reminder: let everyone contribute – so far John hasn’t had a turn.” This is soft nudging.

**Acceptance Criteria (Collaboration Mechanics):**

* State sync: in tests, any action (moving object, solving a part) is reflected on all team members’ screens within e.g. 200ms and consistently. No divergent states.

* No critical puzzle can be solved solely by one person if it’s meant for many (unless by design). If requiring multi-person input (like two keys turned simultaneously metaphorically), ensure that actually needs two different users to trigger (we can implement requiring two distinct client confirmations).

* Voting: all team members see vote counts update in real time, and result triggers correctly when criteria met (all voted or time up).

* Role flows: if roles are used, ensure role-specific UI is delivered properly to the right user and actions from one role reach others (e.g. if Analyst finds clue and clicks “share with team”, it pops up for all).

* Test anti-cheat randomization: run the same room multiple times – verify that puzzle content changes (and solution changes) in each run as intended.

* Ensure that random variations are all of equal difficulty and cover the learning point, to avoid luck of draw making one session unfairly harder.

* If a user tries to game the system (like disconnect and reconnect to maybe get an easier seed), ensure either the seed remains fixed per group or the reconnection doesn’t trigger a reseed that could be exploited.

* Confirm that repeating a room yields minimal extra points (if any) to not skew leaderboards. Possibly only the first completion counts to leaderboard, or use best score logic.

With these collaboration features in place, the platform facilitates effective team-based training that mirrors real-life cooperative security problem-solving, supported by reliable technology and fair game design.

# **Administrator Dashboard**

The Admin Dashboard is a critical component for **Alice (the training manager persona)** to manage users, configure training, and monitor outcomes. It provides oversight of the entire organization’s engagement with CyberSafe Escape. This section describes the features of the admin interface, including user management, detailed performance analytics at various levels, reporting tools, visualizations, and alert systems. All analytics respect user privacy settings and are aggregated appropriately for compliance.

## **User Management**

Administrators need intuitive tools to handle potentially thousands of users.

**User Onboarding & Provisioning:**

* **Manual Creation:** Admins can add a single user via a form (enter name, email, role, group, etc.). Useful for small additions or corrections.

* **Bulk Import:** Ability to import users in bulk using CSV files. The CSV template and instructions will be provided (e.g., columns: email, name, department, role, etc.). On upload, system validates entries (checks for duplicates, malformed emails) and then creates accounts (either setting a default password and prompting reset, or sending invite emails).

* **Directory Integration (LDAP/AD):** *Should-have for enterprise:* Integrate with Active Directory/LDAP to sync users. The admin can configure an LDAP connector or use an API to import from corporate directory. Possibly schedule daily sync to auto-add or deactivate users based on directory.

* **SSO Integration:** (Detailed in Integrations section) If SSO (SAML/OIDC) is used, user provisioning might be just-in-time (user logs in via SSO and their account auto-creates if not exist). The dashboard should reflect those accounts as well.

* **User Roles & Permissions:** Roles include at minimum: **Admin** (full access to dashboard), **Manager/Instructor** (some admin rights but maybe scoped to a group), **Standard User** (no admin rights). Admins can assign roles per user. Role differences: Admin can manage settings and all users; Manager can view reports for their team/department (if that concept exists) and manage those subset of users; Standard has only personal view. Roles enforcement is critical for data segmentation (especially in large orgs or multi-school scenarios).

* **User Groups:** Admin can create groups (such as departments, classes, or any logical grouping). Users have a “Group” or even multiple group membership. For instance, “Sales Dept” or “Class 10A”. These groups can be used in analytics filters and team assignments. Possibly hierarchical (School \-\> Class, Company \-\> Department \-\> Team). At least two levels would be nice (like an Organization field and a sub-group field). We’ll design data model accordingly.

* **User Detail Page:** Admin can click a user to see their profile: which training rooms completed, scores, badges earned, last login, etc. Also actions: reset password, deactivate user, resend activation email, edit info.

* **Activation/Deactivation:** If a user leaves or should no longer have access, admin can deactivate (soft-delete). The account stays in database (for record retention) but cannot log in. In compliance with data retention policies, perhaps after X period inactive, admin can choose to permanently delete (with appropriate warnings, given training records might be needed for compliance – but GDPR right to erasure must be honored if requested). The system might keep anonymized performance data after deletion for aggregate stats but remove personal identifiers.

* **SSO Roles Mapping:** If integrated with SSO, roles/groups could be mapped from SSO claims or a SCIM integration for provisioning (beyond MVP perhaps, but mention planning).

* **Audit Log for User Changes:** Any creation, deletion, or role change by an admin is logged (who did it, when, what changed) in an audit log (see Audit Logs data model). This ensures accountability – e.g., if someone gave themselves admin, it’s recorded.

**Active Directory/SSO Integration Example:** If integrated, an admin might not manually add at all, but the dashboard should still display all imported users and allow management actions on them (except perhaps password reset if SSO, since that’s external). If we implement SCIM (System for Cross-domain Identity Management) later, that would allow automatic provisioning/de-provisioning from the identity provider side.

**Acceptance Criteria (User Management):**

* Admin can successfully add and remove users via UI and see those changes reflected immediately (a new user appears in list, a deactivated user can no longer log in, etc.).

* Bulk import: uploading a valid CSV of, say, 100 new users results in those accounts being created and invite emails sent. Any errors (duplicate emails etc.) are clearly reported back so admin can fix and re-upload if needed.

* Group assignments: Admin can create/edit groups and assign users to them easily (perhaps in the CSV or via multi-select). Filtering by group on user list works.

* Role permissions: Verify that a Manager role admin can only see users in their group if that’s the restriction. And they cannot change settings meant only for full Admin. Also ensure a Standard user absolutely cannot access the admin dashboard URL at all. Use robust auth checks on backend and hide UI.

* Deactivation: A deactivated user cannot log in (the API returns appropriate error). If they are mid-training, what happens? (We may just block next login; if admin deactivates mid-game, that’s a corner case – likely not immediate boot, but subsequent actions fail – acceptable as it’s rare).

* Ensure compliance: Ability to export a user’s data on request (maybe an admin button “Export user data” to JSON/CSV for GDPR data access requests). Not explicitly asked, but likely needed for compliance.

* Password resets for local auth: Admin can trigger a reset email if user locked out (if not using SSO).

## **Performance Analytics**

The analytics portion provides detailed metrics on training performance, enabling identification of strengths, weaknesses, and compliance status.

We break metrics into levels:

### **Individual Performance Metrics**

For each user (or selected user), admins can view:

* **Completion Status:** Which rooms/modules have been completed. Possibly shown as a checklist or progress bar (e.g., “4/6 rooms completed”). If not completed, show if overdue (if there was a deadline).

* **Time to Completion:** How long the user took in each room (actual gameplay time). Compare with average or expected time. This helps spot if someone rushed (very fast might mean prior knowledge or guessing) or struggled (took too long or timed out).

* **Score/Accuracy:** The user’s scores per room (points earned vs possible). Perhaps provide a percentage or grade for each room. Also track number of hints used or errors made per room. For example: Room 1 – 85% score, 2 hints, main weak area: chose weak password first.

* **Attempt History:** If users can attempt rooms multiple times, log attempts. For example, “Attempt 1 on Apr 1: failed at puzzle 3\. Attempt 2 on Apr 3: completed.” This shows learning progression. Possibly only relevant if we allow retakes.

* **Knowledge/Skill Breakdown:** Based on puzzle performance, break down by topic. E.g., might say: *Phishing detection:* 90% (excelled), *Password security:* 70% (some improvement needed). This can be derived from which questions they missed or hints used. Essentially map puzzles to objectives, and aggregate for user.

* **Learning Velocity:** Measure how quickly the user progressed. E.g., time from registration to completion, or how spaced their training was. If someone does it all in one day vs over weeks – might be interesting metric. But more relevant is whether they met required timeline. We can note if they are behind schedule or ahead.

* **Comparative Rank:** Optionally show how this user compares to org average or percentile (e.g., John is in 80th percentile of scores). This can be sensitive; might be for admin eyes only, not for users. It helps admin see who are high/low performers.

* **Engagement Stats:** number of logins, days active, maybe contributions in team (e.g., chat messages sent, puzzles solved by the user in team contexts). This helps identify highly engaged vs passive learners.

* Possibly **risk score per user:** Could derive a “risk” or “readiness” score from their performance. For example, if they did poorly on phishing puzzles, that user might be at higher risk of falling for real phishing. Some training programs do have risk scoring. We could weight puzzle results by importance. Ultimately, an admin might tag a user “high risk needs follow-up training”.

The dashboard might present an *Individual Report* page summarizing all this. It can be used in one-on-one reviews, etc.

### **Team Performance Metrics**

For team-based sessions or persistent teams:

* **Team Collaboration Score:** We can create a metric from team sessions evaluating how well they collaborated. For example, factors: even participation (if one person did 90% actions, low collaboration score), communication (did they use chat/voice actively), successful coordination puzzles (like in final room if they performed roles correctly). We could present a score out of 100 or a qualitative “Excellent, Good, Poor”. This is tricky to quantify, but even simple metrics like “every member solved at least one puzzle” can indicate collaboration.

* **Completion Time vs Averages:** Show each team’s completion times in team rooms vs the global average time. Maybe the team had a record time in Phishing Waters compared to others.

* **Team Outcome Comparison:** For teams that repeated or multiple teams, see which team did better. E.g., a class had 5 teams go through the final room – compare their scores. This can identify which teams struggled, or foster friendly competition (teacher might reward best team).

* **Team Communication Effectiveness:** If we gather data like how much they communicated (and possibly sentiment analysis or number of hints requested), we might infer effective vs less effective teams. At minimum, show if a team needed a lot of hints vs none, as a proxy for synergy.

* **Team Member Contribution Balance:** Visualize each member’s contribution (like pie chart of actions). Ideally, balanced teams have roughly equal shares. If one slice is huge, that team had a carry – which might not be ideal. Admin can intervene (maybe in future sessions, encourage others to lead).

* **Persistent Teams Over Time:** If teams persist, track their progress as a unit: which rooms completed together, average score as a team improving or not. Possibly for something like a cybersecurity club that trains regularly as a team. But likely not needed if teams are mostly one-off for the training.

### **Organizational (Aggregate) Metrics**

At the highest level, give admins an overview of the whole organization’s readiness and identify groups that need attention.

* **Overall Security Readiness Score (0-100):** This is a composite index we create to summarize the organization’s training results. It could weigh completion rate, average scores, key topic mastery. For example, we could say 100 means everyone scored perfect on everything; 0 means no one did anything. Perhaps formula: 50% weight on % of users completed training, 50% on average performance among completers. If 80% completed and average score was 85%, maybe readiness \= (0.5*80 \+ 0.5*85\) \= 82.5. We can refine weighting. This gives leadership a quick number to track and set goals (like “We want a 90+ readiness score”).

* **Completion Rate:** Percentage of total target users who have completed all required modules. Also per-module completion (maybe Room 6 only 70% have done because some dropped off – indicates attrition or difficulty issues).

* **Average Scores by Module:** e.g., Avg score in Phishing \= 92%, in Data Dungeon \= 75%. This highlights content areas that collectively were weaker – maybe data handling was more challenging, signalling need for follow-up or content improvement.

* **Knowledge Area Weaknesses:** Similarly, aggregate by objective. Perhaps show a heat map of topics vs departments: e.g., “Phishing: Marketing 95% avg, Finance 60% avg” clearly Finance needs extra training on phishing. We can do per-group breakdown of each topic.

* **Benchmark vs Target:** Admin can set target goals (like “100% completion by Dec 31” or “Org readiness score 90 by year-end”). Dashboard can show progress vs these goals (like a KPI status: currently 75% complete, goal 100%).

* **Benchmark vs Industry:** If allowed and available (maybe in the future if multiple org data accessible in anonymized form), show how they rank relative to similar orgs. E.g., “Your 85 readiness is above industry average of 80” – this is a selling point but also motivator. We must ensure data privacy in doing this (only if opted in to share anonymized stats). Possibly out of MVP scope, but interesting.

* **Department/Group Comparison:** For each department or class, show key metrics (completion%, avg score). Possibly a table or bar chart. This allows internal benchmarking: which divisions are excelling, which lagging. e.g. “Engineering: 95% complete, Sales: 60% complete” – admin then knows to prod Sales management.

* **Trend Over Time:** If training is ongoing or repeated periodically, track improvement. E.g., compare this year vs last year’s performance, or track month-by-month new completions. Could show a time series graph of “% completed” climbing to 100% as deadline approaches. Or if doing continuous micro-trainings, track risk metrics trending downward ideally.

* **Compliance Metrics:** For regulated industries or schools, simply knowing how many have completed mandatory training by the deadline is crucial. We can highlight “Compliance rate: X% (Y out of Z required employees completed). Deadline: . Those pending: list of names.” And an easy way to contact them (maybe an email reminder link).

**Trending Performance:**

* A line chart could show, for example, average phishing knowledge score by quarter – ideally trending up after training. Or number of reported phishing test emails increasing after training (if integrated with phishing simulation data externally, that would be advanced integration).

* If platform is used continuously (with new content), show usage over time (active users per week, etc.) to gauge engagement.

**Risk Identification:**

* Identify *users or groups needing attention*. For instance: list bottom 5 performers (those who struggled most) so admin can arrange remedial training or support. Or highlight any group with completion \< certain threshold as risk (like a certain office location that hasn’t done training).

* If we have a “Risk score” per user, we can flag those above a threshold (meaning they might be likely to cause an incident). However, careful as labeling employees “risky” can be sensitive; this is for admin internal use, not to shame anyone. Possibly present it as “Needs additional training” category.

**Data Export:**

All these metrics should be exportable (discussed more under Reporting) so admins can include them in presentations or compliance audits.

**Acceptance Criteria (Analytics):**

* Dashboard home should load key stats quickly (\<5 seconds for main metrics). It might pre-aggregate data for performance (like nightly compute some stats) or use efficient DB queries.

* The overall readiness score formula and meaning should be clearly documented in UI (like a tooltip on how it’s calculated) to ensure transparency.

* Drill-down: Admin can click on a department from the org chart and see details just for that department (like filtering the whole dashboard by group). Similarly click on a room’s average score to see distribution or list of who failed that room etc.

* All metrics should update in real-time or near real-time as data comes in (maybe with a refresh or websockets). For example, if someone completes training, the completion % should increment. If not live, at least daily refresh.

* Check accuracy: simulate some users and completions in a test environment and see if sums and averages compute correctly.

* Privacy: If any group has very few users (like 1-2), be careful presenting data that might single them out in aggregate. Possibly ensure a group of 1 still just shows aggregate not identifying info. Since admin could just see user directly anyway, it’s not a big leak, but in cross-org benchmarking we should anonymize.

* Ensure sensitive metrics (like individual names in bottom 5\) are only visible to admins with permission, not broadly.

* The analytics should be visual where helpful: use graphs, heat maps, etc., but also allow numeric detail view.

## **Reporting Features**

The platform should make it easy for admins to generate reports for different stakeholders (managers, executives, auditors). Key reporting capabilities:

* **Automated Compliance Reports:** Pre-built report templates focusing on compliance stats. For example, a “Completion Compliance Report” that lists each user (or at least summary) and whether they completed the training by the deadline, plus overall completion %. This can be used to demonstrate compliance with policies or regulations (like an auditor might ask “show proof all employees did security training”). The report can include names of those who have not completed and date when they last accessed, etc. Possibly have a “generate certificate of completion list” or a letter attesting X% done.

* **Performance Summary Report:** Perhaps a nicely formatted PDF summarizing key performance metrics – overall score, breakdown by topic, improvement suggestions. Could be for internal execs to see the impact of the training program.

* **User Transcript:** Ability to output a single user’s full training record (all modules done, scores, badges). Good for HR files or if user moves departments, etc. Possibly accessible on user detail page (“Download Transcript PDF”). This is also akin to an educational transcript if used in a school for credit.

* **Custom Report Builder:** (Ambitious but beneficial) Admin can choose metrics and filters to build a custom report. For instance, they might want a report on “Phishing performance by location for Q1”. They select metric \= phishing score, dimension \= location, filter date range Q1, output chart and table. If a UI for that is complex, at least allow some flexible filters in existing reports and then export that subset. Perhaps we classify as Should-have.

* **Export Options:** All reports should be exportable to common formats: **PDF** for shareable docs (with charts and branding), **CSV/Excel** for data analysis externally. Possibly also JSON for integration or if they want to ingest into another BI tool.

* **Scheduled Reports:** Admin can schedule that certain reports be emailed to specific people periodically. For example, every Monday email the department heads a summary of their team’s progress. Or a monthly executive summary auto-sent to the CISO. The scheduling UI lets them pick report type, filter (if applicable, like by department), recipients, frequency. The system generates and emails PDF/CSV accordingly.

* **Real-time Dashboard vs Reports:** The admin UI itself is dynamic, but reports are snapshots. So if an admin needs a sign-off, they might freeze data as PDF. This is important for audit compliance (store that on this date, these were the stats). Could incorporate versioning or log of what reports were generated when and possibly store a copy if needed (or they save offline).

**Executive Summary Reports:** Possibly a one-pager focusing on high-level numbers, written summary and maybe a few charts. Perhaps include interpretation: e.g., “Overall, 95% of employees completed training with an average score of 88%. This is an improvement from last year’s 80%. Phishing awareness is high (average 92%), but data handling is an area of improvement (average 70%). Recommended next steps: refresher course on data privacy.” – This might be manually written by admin or we provide a template narrative. This is fancy (auto narrative generation), likely beyond scope but something to consider.

**Integration with LMS/HR:** Some might want data fed to external systems rather than static reports. That’s covered in Integrations via SCORM/xAPI and webhooks, but the reports feature is for human consumption.

**Acceptance Criteria (Reporting):**

* Admin can click “Generate Report” for each type, and within e.g. 10 seconds a downloadable file is produced (or an email is sent when ready if it’s heavy – but likely quick because data is mostly from our DB).

* The PDF should have proper formatting: company name or logo (maybe allow adding organization logo to reports), title, date, and nicely formatted tables/graphs. No cut-off text or messy layout.

* CSV exports contain all relevant columns clearly labeled, and no extraneous formatting (so they can pivot or analyze). Also handle commas and line breaks properly in CSV (maybe use quotes as needed).

* Scheduled emails: test that an email goes out at correct time with correct attachment or link. Also ensure secure sending – the email might contain sensitive training info, but generally not personal data beyond maybe names and performance. Use secure mail (TLS). Possibly allow PGP encryption for paranoid environments if needed (Could-have).

* The custom report builder if present: ensure it can handle at least common tasks, and that filters actually filter data correctly. If too complicated, ensure documentation or training for admin.

## **Dashboard Visualizations**

The admin dashboard will use visual elements to make data easy to interpret at a glance. We will include a variety of charts and graphs:

* **Heat Maps:** Useful for showing performance across two dimensions. For example, a heat map table of departments vs topic areas with color indicating average score. Red might indicate low scores (needs attention), green high (good). This quickly highlights problem areas . Another heat map could be time of day vs number of users training – showing usage patterns (maybe not crucial, but interesting).

* **Geographical Heat Map:** If data is across locations (if we have location info), show a map with shading per region on completion or risk. Possibly more relevant in large global companies or school districts.

* **Progress Tracking Charts:** A funnel or progress bar showing how far along the org is. E.g., a funnel with segments: “Registered \-\> Started training \-\> Completed 3 rooms \-\> Completed all”. Or simply a stacked bar: X% not started, Y% in progress, Z% completed. Also timeline chart showing completion over time (cumulative curve).

* **Leaderboards on Dashboard:** For admin quick view, maybe a widget showing current top 5 users or top team. This might be motivational if they share it (or for admin to gamify between departments).

* **Risk Matrix:** Perhaps plot groups on a matrix of impact vs likelihood based on training scores (this might be beyond straightforward metrics, but for example, group’s average score vs completion lateness could identify “high risk” group \= low scores & low participation). Could show like quadrant where top-right quadrant (low skill, low compliance) \= high risk.

* **Completion Funnel:** A funnel chart from total users down to completed. If some drop off at certain points, funnel shows where. Ideally, funnel should be narrow (not much drop-off). If there is a significant drop at e.g. Room 4 (everyone finishes 1-3 but many stop at 4), that’s actionable to adjust content difficulty or emphasize completing.

* **Time-Series Graphs:** For trending metrics. E.g., number of new badges earned per week, or average risk score each month. If the training is periodic, show improvement after each wave.

* **Pie/Donut Charts:** e.g., distribution of users by role completed vs not completed. Or breakdown of badge categories earned (like what % got the “Phish Master” badge vs not). This is more for interest.

* **Leaderboards Visual:** Possibly show department ranking in a bar chart – like sorted bars of average score by department.

* **Interactive Elements:** Charts can be clickable to filter or drill down. E.g., click on the “Phishing” bar in a topic chart to filter whole dashboard to phishing-related metrics. (This could be advanced, but some interactivity is nice).

* **Pivot table style view:** For data geeks, maybe a table that they can sort by any metric, like listing all departments or all users with columns of interest. But likely they’ll export for deep analysis.

**Design & Clarity:**

The visuals should use clear color schemes (accessible colors for colorblind – ensure patterns or labels beyond color). Possibly allow toggling between light/dark themes (since some will print or present).

Charts should have legends, axis labels, and tooltips on hover for details. Use consistent number formats (like percentages vs scores, etc.).

**Tech:** Use a robust charting library (e.g., D3.js, Chart.js, or Recharts) integrated into React dashboard. Ensure performance by aggregating data server-side if needed (don’t send thousands of user records to browser just to draw a summary chart).

We might precompute some metrics in the backend (particularly if heavy grouping needed – or use SQL queries effectively with indexes).

**Acceptance Criteria (Visualizations):**

* Each intended visualization renders correctly with test data. Colors are distinguishable, text is readable (e.g., not too small, rotates labels if needed).

* Verify some key scenarios: If one group’s score is extremely low and others high, does the heatmap properly reflect it (without scaling issues)? If a group has no data, is it grey or skipped (should handle empty).

* Chart refresh: if new data arrives, charts update (maybe with a refresh button or auto). For MVP, maybe a refresh button for admin to refresh data.

* Exports: possibly allow admin to export chart as image (PNG) for reports. Not mandatory since they can screenshot or include in PDF reports.

* Tested for accessibility: screen readers might not convey charts well, but we should at least have an alternate text or summary. For WCAG compliance, provide textual summary of charts (like “Graph shows X and Y trending upward”). Possibly a hidden accessible table with the data behind each chart, so screen reader can read numbers.

* No heavy client lag: the dashboard should render within a couple seconds even with large data (if needed, limit initial data or use pagination for user lists etc.). Charts with thousands of points (maybe timeline with daily usage for 365 days \* user count) might be heavy; aggregate them first.

* Ensure confidentiality: If the admin is for one organization, make sure no data from another org could appear (multi-tenant isolation). That’s more backend, but vital.

## **Alert & Notification System**

Admins benefit from proactive alerts so they don’t have to constantly check the dashboard for issues. The system will generate alerts for important conditions:

* **Training Deadlines Approaching:** If an organization-wide deadline (or group-specific deadline) is within, say, 1 week and certain users haven’t completed, trigger an alert. “Alert: 25 employees have not completed training with 5 days left until deadline.” Possibly send via email to admin and highlight on dashboard (like a red notification banner).

* **Users Falling Behind:** If some users have not logged in or started training X days after assignment, alert admin so they can follow up. E.g., “10 users haven’t started Room 1 two weeks into the program.”

* **Unusual Performance Patterns:** This could be detecting if someone failed significantly (maybe a user failing repeatedly or taking an abnormally long time – could indicate either a struggling user or someone trying to cheat/trick the system). Example: “User John Doe attempted Room 2 five times without success” – maybe alert to offer them help. Or “Team Alpha took significantly longer than average to complete Room 4 (45 min vs avg 20)” indicating they struggled. These can highlight content difficulty or user need.

* **High Risk Individuals/Groups:** Based on thresholds admin sets (like if user score \< 60% in any key topic), mark them as needing attention. Alert might say “3 users scored below 60% on phishing – consider additional training.”

* **System Usage Alerts:** If adoption is low – e.g., 1 week after launch, only 20% of users have logged in – maybe alert admin that engagement is low, prompting perhaps a reminder campaign. Conversely, maybe an alert if a lot of users are using concurrently to make sure system scale is fine (maybe more for dev ops, though).

* **Achievement Alerts:** Could highlight positive achievements like “50% milestone reached – half of users completed the training” to celebrate internally. Or “Security readiness score improved by 10 points since last quarter” – good news for admin to share.

* **Compliance Warnings:** If any regulatory tie-ins, e.g., if a school has a requirement all staff do FERPA training by a date, and it’s not met, flash an alert. For corporate, maybe if they haven’t run a training in over a year, an alert that training is outdated.

* **System Alerts for Admin:** If integration fails (like SCORM export error or SSO issue), admin should see technical alerts (this might be more of an IT admin thing).

**Delivery of Alerts:**

* **Dashboard Notifications:** A bell icon or alert panel listing current alerts with severity (info/warning/critical). They can click to see details or mark as acknowledged.

* **Email Notifications:** For critical or time-sensitive ones (like deadline issues), send an email to admin or designated addresses (maybe security team distribution list). Ensure not to spam: possibly aggregate daily. Let admin configure which alerts they want via email.

* **Push Notifications:** If we have an admin mobile app or PWA, could push notify. Not a priority for MVP but possible if admin would like phone alerts.

* Possibly **Slack/MS Teams** integration: send alerts to a channel (tie into integration features, e.g., Slack webhook on certain events).

**Suggested Interventions:**

Along with alerts, provide suggestions if applicable. For example, an alert “25 users not started training” could have a one-click “Send Reminder Email to those users now” action. Or “schedule a makeup session with them.” If integrated with Slack, maybe a button to message them. We can automate some of these tasks to help admin act on alerts easily.

**Acceptance Criteria (Alerts):**

* Simulate scenarios (like a bunch of users incomplete near deadline) and ensure the system generates the correct alert at the right time.

* Verify that alerts clear when resolved (e.g., after those users finish, the alert should disappear or mark resolved). Possibly keep a log of past alerts.

* Admin can configure or dismiss alerts. If dismissed, they should not keep showing (until perhaps the situation worsens or resets).

* Email notifications are only sent for intended alerts and contain clear message and potentially a link to the dashboard for detail.

* No false alarms: tune thresholds carefully to avoid crying wolf. Possibly default values can be configured (like what constitutes “falling behind” – e.g., X days inactivity).

* Security: ensure the alerting mechanism doesn’t expose sensitive user info inadvertently in emails (maybe use user IDs or first name only in email if needed). But likely fine to include names since admin is authorized.

* Performance: The system should evaluate conditions maybe once a day or real-time triggers on events for alerts. Must not bog down with heavy computations. Use precomputed stats or triggers (like when a user passes deadline status, flag them directly instead of scanning all users constantly).

* Test that an admin can subscribe/unsubscribe to certain alerts and it works.

The Admin Dashboard thus provides comprehensive control and visibility: from managing users and teams to drilling into metrics and automating oversight via alerts and reports. It is designed to save administrators time while giving confidence that the training program is effective and meeting compliance requirements.

# **Technical Specification**

CyberSafe Escape’s technical architecture is a modern web application stack, emphasizing scalability, real-time interactivity, security, and maintainability. This section covers the chosen frontend and backend technologies, data models with schema details, API specifications, infrastructure, and security practices. All technical decisions are backed by best-practice research and geared toward a robust implementation.

## **Frontend Requirements**

The frontend is the client-facing web application that users (students/employees) and admins interact with. Key requirements and choices:

**Framework:** We will use **React 18+ with TypeScript**. React provides a component-based architecture well-suited to our interactive UI and dynamic content. TypeScript is essential for catching errors early and improving maintainability in a project of this size. React’s large ecosystem and community align with our needs for reliable libraries (WebRTC hooks, state management, etc.).

**State Management:** For complex state (game puzzle state syncing, user session, UI toggles), we considered Redux Toolkit vs Zustand vs Jotai, etc.

* We opt for **Redux Toolkit** as the primary global state store (Must-have) because it’s proven for large apps with predictability and powerful dev tooling (time-travel debugging etc.) . Our app has many pieces (auth, game state, chat messages, admin filters), which Redux can organize with slices. Redux Toolkit reduces boilerplate significantly compared to classic Redux, and can integrate with Redux Saga or Thunk for side effects if needed (like complex real-time flows).

* However, we will not overuse Redux for everything. Local UI state (e.g., a modal open/close) can use component state or Context. Also, for highly interactive but self-contained parts (like within a puzzle), we might use internal component state or a Zustand store scoped to that feature, to avoid performance overhead. Zustand is lightweight and could manage ephemeral game states easily with minimal re-renders . But introduction of multiple state libs can add complexity. We’ll primarily stick to Redux for consistency, using features like Redux’s createEntityAdapter for normalized data (e.g., users list) and perhaps Saga for WebSocket event handling (for real-time game events).

* If performance issues arise with Redux (e.g., too frequent updates for real-time positions in a puzzle), we may employ **Zustand** (Should-have) for that isolated portion, as it excels at fast updates with minimal boilerplate . Zustand allows direct mutation style which can be simpler for certain states (like drag-and-drop positions). Another alternative is React’s own context or Jotai for fine-grained atomic state (less likely needed). We document this so developers can choose the right tool per use-case.

**UI Component Library:** To accelerate development and ensure consistent, accessible components:

* We strongly lean towards **shadcn/ui**, a modern approach where you copy pre-built Tailwind \+ Radix-based components into your project. *Reason:* Shadcn.ui uses Radix UI primitives under the hood, which are unstyled but accessible (handling focus, ARIA, etc.) . Shadcn provides pre-styled components following Tailwind conventions, which we can fully customize since the code is in our project (no external dependency lock-in) . This fits our need to heavily theme the app to a “game” style while still having reliable underlying behavior. We won’t be constrained by a library’s theme if we want a unique look, because we can modify the component code.

* **Radix UI** itself (which shadcn uses) ensures our modals, menus, dialogs, etc., follow WAI-ARIA best practices out-of-the-box , helping us achieve WCAG compliance.

* We considered **Chakra UI** (a popular component lib) for its completeness and ease, but it might impose more design constraints and uses a style-system approach that’s less Tailwind-friendly. Chakra has excellent accessibility as well , so it’s not a bad choice. However, given we are already using Tailwind CSS (see Styling), shadcn/ui allows a seamless Tailwind workflow and tree-shaking (we only import components we use, keeping bundle lean) .

* Another considered library: **Mantine or MUI** for admin dashboard heavy components (tables, charts). We might use specific components from such libraries if needed (e.g., MUI DataGrid for a complex table) if shadcn lacks something, but prefer consistency. Possibly incorporate **TanStack Table** or similar for data grids if needed, wrapped in our styling.

**Styling:** **Tailwind CSS** will be our primary styling solution. Tailwind’s utility-first approach speeds up styling and ensures consistency (using a configured design system). It pairs well with component libs (shadcn’s components are in Tailwind). We’ll configure Tailwind with our design tokens: colors, fonts, etc. This yields rapid UI building and easy theming. We’ll enforce responsive design through Tailwind’s responsive variants (sm:, md:, etc.). We will also include a custom CSS if needed for unique game art styling, but try to do most via Tailwind classes for maintainability.

**Animations:** We want the UI to have game-like feedback (e.g., puzzle piece glides into place, confetti on success). We will use **Framer Motion** for React as our go-to animation library. Framer Motion is powerful yet easy for orchestrating complex animations and it integrates with React state nicely. For example, animate presence of modals or transitions between room UIs. We’ll ensure to use “prefers-reduced-motion” media query to disable non-essential animations for users who opt out (WCAG requirement). Also keep animations lightweight (no excessive flashing or anything that could trigger photosensitive issues).

**Real-Time Updates:** Use **Socket.io** (on client) or native WebSocket API with a wrapper for sending/receiving events. This is crucial for game state updates, chat messages, etc. We might prefer Socket.io because it offers reconnection logic and fallbacks out-of-the-box, making our life easier for maintaining persistent connections. The client will maintain a socket connection to the server for all game collaboration events.

**Browser Compatibility:** We target modern browsers: Chrome, Firefox, Edge, Safari – likely latest two versions (considering user base might not always auto-update, but within reason). We ensure polyfills for any features as needed (for example, WebRTC is supported in these, but if we use some new JS API, we might polyfill for older). We explicitly will test on Safari (for Mac and iPad if possible, given many school iPads) – ensure no reliance on features Safari doesn’t support (like WebRTC data channel is okay on Safari now, but specific codec differences we handle). For IE11, we do **not** support (its time has passed). If needed by any client, maybe Edge with IE mode but likely not needed for a new app.

**Responsive Design:** The application must work on desktop, tablet, and at least functionally on mobile. The training likely is easier on larger screens, but some may try on phones. We’ll design with mobile-first Tailwind approach. For complex team puzzles, mobile might be challenging, but at least the solo content should work. Maybe for team video chat, a phone screen is small to see video \+ puzzle. We might recommend using larger device for best experience but still not block mobile. Possibly produce a companion mobile app in future (Phase 5 mentions mobile app consideration). At minimum, ensure touch interactions work (draggable puzzles must be touch-friendly with onTouch events etc., not only mouse).

**Accessibility (WCAG 2.1 AA):**

We bake this into every component choice and design:

* Use semantic HTML and appropriate ARIA roles. E.g., the escape room content is interactive, but ensure navigation is logical (maybe use landmarks for main, etc.).

* Every interactive element (buttons, draggable items) must be keyboard accessible. That means providing focus styles (Tailwind can ensure focus visible styling or we implement via Radix which typically handles some), and making sure, for example, a puzzle that involves drag with mouse also has an alternate way (maybe using arrow keys to move selected item or a “Select & Place” button approach for screen readers – could be a non-trivial adaptation but at least ensure no absolute blockers).

* **Color Contrast:** Our color palette will be chosen to meet contrast guidelines (4.5:1 for normal text, 3:1 for large text). We’ll use tools to verify. Any text on background or UI elements must be tested. If our game uses color coding (like red vs green to indicate success/failure), we also use icons or text so colorblind users aren’t lost.

* **Alt Text:** All images (like any decorative images or icons) will have alt attributes. For key graphics (like maybe an image clue in a puzzle), alt text must convey the necessary info or we provide an equivalent description in text.

* **Screen Reader:** Ensure proper labeling of form fields, and dynamic content announcements. Possibly use aria-live regions for notifications (“Badge earned\!” might be announced). Also allow screen reader users to skip extraneous content (like a skip link to main content, and maybe an invisible text description for the game canvas). This is tricky: an escape room game is inherently visual/interactive, but we want at least partial screen reader playability. We might have to create an invisible logical outline of puzzles for screen readers. If fully making it playable via screen reader is too large, we ensure at least that they can complete the training via an alternate path (maybe a non-game linear quiz mode if disabled?). But since WCAG AA is required, likely we attempt to make all functions accessible. Radix’s accessible primitives help for typical UI, but custom game logic requires careful ARIA thinking.

* **Keyboard Navigation:** Everything (menu, game UI controls) reachable with Tab/Shift+Tab in a logical order. No keyboard trap (the user should never get stuck; if a custom component like a canvas for puzzle captures focus, ensure Esc or some key lets them exit).

* **Focus Management:** When modals open, focus should move inside; when closed, return to trigger. After an action like “next room” loads, focus maybe goes to heading of that page so screen reader reads it. We’ll use Radix dialog for modals (handles this) and manage focus via React refs for other transitions.

* **Captions/Transcripts:** For any video/audio content (like if intro tutorial has narration or final room has an alarm sound with spoken instructions), provide captions or at least a text equivalent. Could be in form of subtitles or a transcript panel.

* **Adjustable Text:** Support browser zoom (app should not break at 200% zoom). Use relative units in CSS as needed. Possibly a text-size setting if needed (Chakra has adjustable theme scale, but in Tailwind we rely on user zoom mostly).

* **Reduced Motion:** As mentioned, respect user setting for reduced motion – either disable non-essential animations or provide a toggle in settings too.

We may eventually seek WCAG 2.1 AA certification – which means an external audit. We should prepare by following all guidelines systematically (there are \~50 success criteria for AA). The frontend devs should use linter tools (eslint-plugin-jsx-a11y, Axe browser extension to test UI, etc.) regularly.

**Internationalization (i18n):** We plan multi-language support. Technically, we’ll implement using e.g. **i18next** or **react-intl** to manage translation strings. All UI text will be stored in resource files per language. For dynamic content, ensure text concatenation is avoid or properly parameterized for translation. Also consider locale differences (dates, numbers). Given languages like French later, we need easy switching. Possibly detect browser locale for default, and allow user to change language in profile. Also ensure fonts can handle special characters (choose a font with multi-language support). Right-to-left support (Arabic/Hebrew) might be beyond initial scope but keep in mind (if needed, apply dir=rtl styling flips, but for now just left-to-right languages).

**Frontend Build & Tooling:** Use Vite or CRA for building (likely Vite for speed). Ensure code splitting – load heavy admin components only when admin routes are accessed, etc., to optimize initial load for end-users. The game code might itself be chunked by room (maybe not necessary but possible if each room has lots of assets). Use caching and CDN for static assets.

**Testing (Frontend):** Write unit tests for important logic (like util functions), and integration tests for components with something like React Testing Library. Also end-to-end tests (using Playwright or Cypress) for critical flows (login, do a puzzle, admin view). This ensures quality and that all flows actually work as intended.

## **Backend Requirements**

The backend powers the application server and API, real-time communication, database interactions, and heavy business logic:

**Framework & Language:** **Node.js with TypeScript** will be used for the server side. Node allows use of one language across stack (JS/TS) and has excellent real-time handling (non-blocking, good for websockets). We consider using a web framework: either **Express** or **Fastify**.

* We prefer **Fastify** for its performance and modern plugin system. It’s known to be significantly faster than Express in HTTP throughput (which might matter as we scale) and has good TypeScript support. Fastify also has a growing ecosystem of plugins (for auth, validation, etc.) and is focusing on developer experience and speed.

* However, Express is extremely mature and widely known. Given our timeframe, either works. Fastify being a bit newer might have some learning curve, but for performance and future-proofing we lean Fastify (Should-have). If team familiarity is low, Express with middleware is fine (especially since real-time via websockets is separate). We’ll evaluate: likely Fastify for core API (foundation ready for high performance) . We will measure performance of early endpoints; if no big difference or if specific middleware needed only on Express, we reconsider. But going with **Fastify** aligns with a high-performance goal.

* We’ll use TypeScript on the backend as well, ensuring strong typing of models and API contracts.

**Architecture Style:** A mix of **RESTful APIs** and **WebSocket events**. REST for standard CRUD and transactional operations (user management, retrieving data, submitting final results). WebSockets (perhaps via Socket.io server) for push events (game state updates, chat messages, notifications). Possibly also consider **GraphQL** for certain parts (the prompt suggests GraphQL for dashboard queries as a consideration). GraphQL could be beneficial for the admin dashboard where complex filtering and joining might be needed (instead of multiple REST calls). But adding GraphQL increases complexity; we can likely satisfy with REST given known queries (especially if we design specific endpoints to return aggregated data). We will note GraphQL as a Could-have if the admin reporting needs become very dynamic. Perhaps initially do REST, and in Phase 4 or beyond, consider adding a GraphQL endpoint for flexible querying of analytics.

**Authentication:**

* **JWT (JSON Web Tokens)** for stateless auth on APIs. When users login (via our own system or SSO), backend issues a JWT (signed, with an expiry maybe 1 hour for access). We will use refresh tokens (longer-lived, stored httpOnly cookie or in secure storage) to renew sessions without re-login. This is a common approach for single-page apps. We must secure refresh tokens carefully (probably store in httpOnly cookie with secure flag to avoid XSS).

* Alternatively or additionally, for WebSockets, we might use the same JWT to authenticate the socket connection (like a query param or first message). If using Socket.io, it supports JWT auth in connection handshake.

* **OAuth2/OIDC**: For enterprise Google/Microsoft logins or SAML (covered later in Integrations). But from backend perspective, likely integrate with an OIDC library (passport.js or NextAuth or custom) to accept SSO tokens and still create a local JWT for session.

* **RBAC (Role-Based Access Control):** Implement middleware to check user’s role/permissions on each route. We’ll define scopes or simply roles like “admin” claim in JWT. For fine-grained, we might have permissions like training:write vs admin:manage\_users. Could implement as needed. But at least separate normal user vs admin endpoints with checks.

* Protect sensitive endpoints (e.g., admin ones should reject if not admin).

* **Password Hashing:** If we have our own login (non-SSO users), store hashed passwords (using bcrypt or argon2 for stronger security). Follow OWASP recommendations for password storage (unique salt per, strong iterations).

* **2FA (MFA):** Possibly allow admin accounts to enable 2FA (not in initial requirements, but as security measure, maybe Could-have later to protect admin logins).

* **Session Management:** Since we use JWT stateless, server doesn’t keep session in memory by default, which is good for scaling. But we need to blacklist invalidated tokens (like on password change or logout) – we can track token ID in a Redis store with TTL if needed. Or choose short expiration (1h) and rely on refresh tokens which can be invalidated server-side by storing their ID.

**Authorization (Access Control):**

* Implement logic like: users can only access their own data (e.g., /progress/me returns your progress or if admin, you can specify userId). Admin routes allow cross-user access.

* For multi-tenant (multiple organizations in one deployment), enforce organization isolation: user’s JWT will include org\_id, and any query filters by that. Even if someone tries to query other org’s user by ID, the backend should ensure no data leaks (like WHERE org\_id \= user.org\_id on queries).

* For roles like Manager who see subset, we’ll implement either scoping in JWT or check their group assignment and only return subordinate data. Could map manager \-\> a group in DB and in queries only show that group.

* Possibly, content creation management: if in future admins add puzzles or custom content, ensure only authorized can do that. For now, content static so not an issue.

**Real-Time Server:**

We’ll run a WebSocket server (likely integrated in same Node app using Socket.io or a separate process for better scaling). For ease, initially, run in same Node process as API (Socket.io can attach to Fastify server). We must handle events like:

* Team join/leave,

* Puzzle actions (from one client to others),

* Chat messages,

* Collaboration signals (like “user X is hovering on element Y” if we do that),

* Admin live alerts? (We might use WS to push an alert to admin dashboard as soon as triggered, rather than email).

   It should be event-driven. If volume is high, consider message queues or scaling out, but likely manageable since teams are relatively small groups. However, many teams concurrently means many WS connections; Node can handle many if not too heavy computations each.

For scale, if we go multi-server, we’ll need WS sticky sessions or using Socket.io adapter (like Redis pub/sub) to share events among servers. We can plan that with Redis as a backplane if needed (phase 5 scaling).

**Media Server (WebRTC):**

For video/audio, we plan to integrate a SFU:

* If using **Mediasoup**: We can include it as a Node library (Mediasoup server runs in same process or separate?) Usually, Mediasoup provides Node bindings to run its router and workers. We could run it within our Node backend process (with separate thread workers for media). This is technically complex but doable. Alternatively, a separate microservice for media might be cleaner (especially if scaling and managing different resource profiles for media vs logic). For MVP, perhaps integrate simply in Node app for fewer moving parts, then extract if needed.

* If using **LiveKit**: Could deploy LiveKit server (in Go or Rust) separately and use its REST/gRPC API from our Node to create rooms and tokens. That’s also viable, as LiveKit Cloud or self-host gives a lot out-of-box (client SDK available for React too). But that’s another service to manage.

* **Janus** or **Jitsi** could also be external services integrated.

   We choose **Mediasoup** due to performance and flexibility . It’s a proven library for building custom SFUs in Node. It gives us control to implement features like selective streams, and scale horizontally by adding more worker processes. We’ll need a TURN server anyway (could use coturn, easy to set up, or use some existing like Twilio’s but better own for privacy).

The backend will manage signaling for WebRTC:

* On team creation, backend can create a Mediasoup room and endpoints.

* When clients join, backend handles the WebRTC SDP exchange via the socket.

* It instructs Mediasoup to create transports, producers, consumers for each stream.

* It may also manage a SFU for data channel if needed (though Mediasoup doesn’t handle data channels, we’ll just use WS for data).

   This is complex, but many resources and we can cite performance: e.g., medooze, janus comparisons. Actually from \[17\], Mediasoup had very low latency and stable up to high participants. That suits our need well since we want minimal delay for good experience.

**Database:**

Primary database will be **PostgreSQL**. We choose Postgres for its reliability, relational structure (we have clearly relational data: users, teams, progress, etc.), and its ability to also store JSON for flexibility if needed (like storing puzzle attempts details). Postgres also supports advanced features like full-text search (if needed for content search) and can ensure transactional consistency for things like not double-issuing achievements.

We’ll design a normalized schema for core entities. Some tables may become large (e.g., analytics events logs) – for those, we might consider scaling or archiving strategies but Postgres can handle a few million rows easily on decent hardware. If heavy analytics queries slow things, we might consider indexing or moving aggregated data to a data warehouse later (Phase 5 scaling considerations, or using something like TimescaleDB for time series of events). But initially, Postgres is fine.

**Caching:**

We will introduce **Redis** as an in-memory cache and fast ephemeral data store. Use cases:

* Caching session data or JWT blacklist (though JWT is stateless, but refresh tokens or SSO state might be stored).

* Leaderboards: computing global leaderboards from DB every time could be heavy if many users. We can cache the sorted results in Redis and update incrementally as new scores come in (Redis sorted sets are great for leaderboards). E.g., each time a user gains points, also do ZINCRBY leaderboard userId. Then retrieving top N is quick.

* Caching frequently accessed data like list of puzzles definitions (could just be in memory as constant too).

* Real-time pub/sub: Socket.io can use Redis adapter to coordinate events between multiple Node instances.

* Rate limiting counters (like track IP or user requests to prevent abuse – Redis can handle atomic increments with expiry for rate limiting).

* Possibly use as a simple queue for background tasks if needed (though might use a proper message queue for heavy tasks, but Redis can do with list too).

**Search:**

If we want to allow searching users or content (like admin search user by name/email quickly even among thousands), Postgres can do index search on name or use text search. Might be sufficient. But if they want to search through text of learning content (maybe less likely as content is mostly puzzles not large text). Full-text search for admin maybe not critical.

We could consider **Elasticsearch** or similar if building a knowledge base search, but currently out of scope. So skip unless a need arises. If eventually huge logs and want to query (like “show me all user answers to that question”), maybe then, but manageable in SQL for now.

**Data Models:**

We define the schema for key entities. Here are the major tables with main fields (and relationships):

* **User** – stores user accounts.

  * id (UUID, primary key)

  * org\_id (UUID, references Organization table, or could be a tenant discriminator if multi-tenant in one DB)

  * email (string, unique within org, not null)

  * password\_hash (string, nullable if SSO user)

  * name (string, could split first/last or just full name)

  * role (enum: ‘user’, ‘manager’, ‘admin’)

  * group\_id (UUID, references Group table, nullable if not assigned or can have multiple via join table if needed many-to-many)

  * status (enum: ‘active’, ‘deactivated’, ‘pending’) – pending if invite sent but not accepted, for instance.

  * last\_login (timestamp)

  * created\_at, updated\_at (timestamps)

  * Additional: preferences (JSON for settings like opted out of leaderboard, language preference etc.)

  * Indexes: unique index on (org\_id, email). Index on role for admin queries.

  * *Acceptance criteria:* A user record is created on signup or import, password is stored as secure hash. Queries filtered by org as needed.

* **Organization** – if multi-tenant (like separate companies or school districts)

  * id (UUID pk)

  * name

  * settings (JSON for org-level config: e.g., training deadline, branding, etc.)

  * Possibly fields for integration settings (like SAML metadata, etc.)

  * Could track industry or type if needed for benchmarking.

  * For single-tenant deployment, this table can have just one entry and we treat org\_id mostly the same. But anticipating a SaaS usage where each client is an org.

* **Group** – for departments, classes, etc. We allow nested grouping possibly with a parent\_id if needed or just use type field. Perhaps simpler: use Group table for any grouping and a hierarchy.

  * id (UUID pk)

  * org\_id

  * name (like “Sales Dept” or “Grade 10 \- Class A”)

  * parent\_group\_id (nullable self-reference, e.g., parent “Sales Dept” might have subgroups “Sales Team 1, Team 2”)

  * manager\_id (nullable, user who manages this group) if we want to quickly link. Or have a separate join table user\_group with role. Might skip for now.

  * We can have an associative table user\_group for many-to-many user membership if needed (for simplicity, allow one primary group per user initially; but support multiple via join if needed by design).

  * *Use:* for admin filtering and possibly team assignment defaults.

* **TeamSession** – represents a team session that took a given room. Because teams are ephemeral each time they play, we log that session and the members.

  * id (UUID pk)

  * room\_id (which room scenario was played, maybe reference a Room table or just an enum or number 1-6)

  * started\_at, ended\_at

  * completed (boolean if they solved it)

  * score (numeric total team score for that room)

  * Maybe team\_name (string if they named themselves)

  * Possibly a composite unique constraint to ensure one session per team if persistent teams but since ephemeral, not needed.

  * Team membership: a separate table **TeamSessionMember** with session\_id, user\_id, role (if any role in that session), contribution\_score or actions count maybe.

* **GameSession / Progress** – track individual user progress. Could be a single table that tracks each user’s status in each room. Or separate for each attempt.

  * Perhaps **UserProgress** table:

    * user\_id, room\_id (composite pk or unique)

    * status (enum: ‘not\_started’, ‘in\_progress’, ‘completed’, ‘failed’)

    * score

    * time\_taken

    * hints\_used

    * completed\_at timestamp

    * This allows admin to query how each user did per room. We also capture incomplete state (if partial). If multiple attempts, we either update with latest or keep best. Possibly we keep only best result if requirement is just to pass, but might want to store attempts in separate log.

  * For storing details of each attempt, we can have a **UserRoomAttempt** table:

    * id, user\_id, room\_id, attempt\_number, score, completed boolean, started\_at, ended\_at. If incomplete an attempt might have ended when they quit. This is more data but can help see improvement on retry. Could be big if many attempts, but likely each user does at most a couple if at all. We can combine with UserProgress (progress could just use the last attempt or best attempt linking).

* **Room (Content)** – Could have a table listing rooms (1-6) with metadata:

  * id (like 1,2,… or UUID but enumeration is fine)

  * name, description, is\_team bool, time\_limit etc.

  * Possibly store objectives or content pointers, but actual puzzles logic might be coded or stored in JSON elsewhere. We might not need a DB table if content is mostly static and coded, but having it allows dynamic updates or enabling/disabling a room.

* **Puzzle** – if we break down each room into puzzles and want to store definitions in DB (for easy editing or AB testing content). For MVP, puzzles might be hardcoded or config files rather than DB, unless we build a level editor for admins to change content (which they requested ability for custom content in Section 7). In Phase 4, custom content management suggests storing content in DB.

  * Could have Puzzle table with fields like: id, room\_id, type (e.g., multiple-choice, sorting, interactive), content (JSON or text depending on type), solution (expected answer or logic), points (point value). Additional could be difficulty.

  * If puzzles are complex interactive, storing solution logic might not be trivial in DB; we might store just some parameters and code references. But at least quizzes can be fully DB-driven (question text, options, correct answer). Others like a network maze could be parameterized by a JSON map structure stored here.

* **Achievement/Badge**:

  * id (UUID or code), name, description, category, icon (maybe a filename or enum of built-in icons), criteria (maybe a code or JSON logic definition? Or we just hardcode logic in code and have this table for metadata for display). Possibly secret boolean if hidden until earned.

  * We might not let admins create badges easily because criteria logic is code. But we list them in DB to allow enabling/disabling as mentioned . Admin might toggle a flag here to disable a badge.

  * **UserAchievement** join table: user\_id, achievement\_id, earned\_at. Possibly include context like if team, team id, or other relevant info.

* **Leaderboard**:

  * We might not store a static table of leaderboard because it’s derivable from User’s total points or similar. But for speed, we might maintain a **UserScore** table with cumulative points and rank. Actually, that could just be a column in User (like user.total\_points). But since points can change regularly, maybe better to compute on the fly summing from progress and achievements. However, if we have various sources (points from daily challenges), easier to just increment a user.points field.

  * We’ll implement user.total\_points (which includes everything) and user.level maybe, to avoid heavy recalculation each time. Keep it updated via triggers or logic whenever an event gives points.

  * Team leaderboards could be computed from team session results or average of user scores by group; we might not store a physical table for that, just compute when needed, or maintain a GroupScore table that aggregates user points by group for quick access.

* **Analytics Events**:

  * Possibly a table to log granular events, e.g., EventLog: id, user\_id, event\_type, timestamp, details (JSON). Could log things like “completed puzzle X”, “used hint”, “opened the app”, etc. This raw event data can be used for deeper analysis if needed. However, storing every puzzle action might be too much. Perhaps log only major events (room completed, badge earned).

  * Another approach: log specifically security-relevant actions for audit (like a user answered a question wrong about phishing – maybe not needed at event-level). Instead, we rely on summary in progress table.

  * If wanting to do interesting analysis (like which puzzle question is most missed), event logs or a table for question responses could be useful. For quiz-type puzzles, we could have **QuestionResponse**: user\_id, puzzle\_id, selected\_answer, correct (bool), time\_taken. That’s a lot of detail but can help content improvement. Not sure if needed in initial scope, but maybe include for future analytics.

* **AuditLog**:

  * Specifically to track admin actions and important system changes (security requirement). Fields: id, timestamp, admin\_user\_id, action, target\_type, target\_id, details. E.g., “ADMIN Alice deleted user Bob”. Keep these for security audits (especially if dealing with compliance, SOC2 expects auditable changes).

  * Also log maybe user login attempts (successful or failed) could be separate or here with action \= 'login\_failed' etc., to detect potential account brute force (we will also have rate limiting to mitigate).

All tables will have proper foreign keys and cascading rules (e.g., if a user is deleted, perhaps their progress and events should also delete or at least anonymize, per GDPR right to deletion). Or we do soft-delete for audit but removal on request means truly purge PII – we could keep aggregate data but not tie to name.

We should create database **indexes** on fields used in queries:

* user\_id foreign keys in progress and achievements,

* organization filtering,

* etc.

   Leaderboards might need an index on total\_points DESC for quick retrieval or use the cached approach with Redis.

We will also consider **database migrations** (likely use a tool like Prisma Migrate, TypeORM, or Flyway) to version control schema changes.

## **API Specification**

We enumerate key API endpoints with method, URL, request/response and some semantics. All endpoints will be under a base like /api/v1/ (versioning from the start to allow evolving without breaking clients).

**Auth Endpoints:**

* POST /api/v1/auth/register – Register a new user (for self-signup scenarios, though in enterprise often admin adds users or SSO, so this might be mostly for maybe small org usage or not at all for enterprise version). Request: JSON { name, email, password, org\_code? }. Response: 201 created or error (email exists). Might require email verification step (send email with token). If so, then also an endpoint like GET /api/v1/auth/verify-email?token=....

* POST /api/v1/auth/login – User login with email & password. Request: { email, password }. Response: 200 with JSON containing JWT access token and refresh token (if using token approach) or set httpOnly cookies for them. Also include user profile info (name, role) for client convenience. Errors: 401 if bad creds.

* POST /api/v1/auth/refresh – to use refresh token to get new access. If refresh token is in cookie, server can read it, or if we do in body. Likely keep it in cookie for security. Response: new JWT.

* POST /api/v1/auth/logout – maybe just client-side delete tokens, but we can have an endpoint to invalidate refresh token (e.g., by adding to blacklist in DB/Redis).

* GET /api/v1/auth/saml/redirect and POST /api/v1/auth/saml/callback – if SSO SAML used, the typical endpoints. Similarly for OAuth (Google, OIDC) might have /oauth/google redirect and callback. These would be configured per org. On success, create or find user, issue our tokens and redirect user to app.

**User & Group Management (Admin):**

* POST /api/v1/users – (Admin only) Create a new user (e.g., invite). Request: JSON with name, email, role, group, etc. Response: created user object (without password, since either random password emailed or link). Could generate an activation link.

* GET /api/v1/users – List users (Admin or Manager sees subset). Supports query params like group\_id=... or status=. Paginates if many users (like limit & offset or cursor). Response: list of user objects with summary info (id, name, email, role, status, group). Possibly include progress overview (like % completed) if we want to show in user list – or that might be separate query. Could have embed param.

* GET /api/v1/users/{id} – Get detailed profile (Admin can fetch anyone, User can fetch only self via /me alias). Response: user object including maybe progress, badges, etc., or those might be separate endpoints. Maybe not include everything by default to keep it smaller (client can call specific endpoints for progress or achievements).

* PUT /api/v1/users/{id} – Update user (Admin can update anything: name, role, group, status). Also can be used by user to update their own profile (just name, preferences). We’ll enforce fields based on who calls – e.g., normal user cannot change their role or active status obviously.

* DELETE /api/v1/users/{id} – Deactivate or delete user. Likely we do soft deletion (set status=deactivated) unless admin explicitly requests full deletion (maybe via query param or separate endpoint because that’s destructive in training records). If GDPR deletion is needed, maybe DELETE /users/{id}?purge=true. But careful with compliance logs, probably better to scramble personal data rather than remove entire record that might break referential integrity. We’ll decide policy: likely mark as deleted and remove personal info fields.

* POST /api/v1/users/{id}/reset-password – Admin triggered reset: generates a reset link emailed. Could also allow admin to set a new password (but generally sending link is more secure).

* GET /api/v1/groups – List groups (admin). Possibly include membership counts.

* POST /api/v1/groups – Create group (with parent optional, manager assignment etc.).

* PUT /api/v1/groups/{id} – Edit group (rename, reassign parent or manager).

* DELETE /api/v1/groups/{id} – Remove group (probably need to handle moving users out or require empty group deletion).

For user self-service:

* GET /api/v1/profile or /api/v1/users/me – current user profile (server can extract user ID from auth token, return user info, might include their progress summary, etc.).

* PUT /api/v1/profile – user updating own settings (like toggling leaderboard opt-out, language).

**Progress & Content Endpoints:**

* GET /api/v1/rooms – List available training rooms and status. This can return for logged-in user: each room with metadata (name, description, isLocked or not for them). E.g., if they haven’t done previous, maybe front can lock next but backend could also enforce prerequisites. Possibly include user’s score if completed, or attempts.

* GET /api/v1/rooms/{id} – Get content of a room or start a room. This might initiate a game session for solo. If puzzles are delivered via API, this returns the puzzle data (like JSON of questions, initial state). Or we might have all that in front-end code. For more dynamic, we can fetch puzzle definitions from API. For now, maybe minimal needed (the actual game might be coded in front). But if content in DB, this is where it comes.

* POST /api/v1/rooms/{id}/start – Maybe create a session record (especially for team? For solo might not need server to create, could implicitly track when first puzzle loaded).

* POST /api/v1/rooms/{id}/submit – Submit results for a solo room (when completed). Include maybe answers or just final score if logic done in client (but for integrity, better to send answers for server to verify and compute score server-side to avoid cheating). For quizzes, server can check answers. For interactive puzzles, might trust client if it’s complex to verify, but ideally each puzzle solved event could be verified. This might be quite complex to do for all puzzles, possibly beyond initial. At least at room completion, mark it done and record metrics.

* Response: indicate success, maybe reward points, any badge triggered. The server can compute if this completion triggers a badge (like “completed all rooms”), then create that user achievement. So response might contain new badges earned as well.

* **Team endpoints:**

  * Actually, for teams, much is via WebSocket once inside a room (real-time events). But to form a team:

  * POST /api/v1/teams – Create a team session for a specific room. Request: { room\_id, member\_ids? } – if an admin pre-assigning. Or if user initiating, maybe no members, they get team code. Response: { team\_id, join\_code or something if invite via code, or list of members if any initial (like themselves as leader) }.

  * POST /api/v1/teams/{id}/invite – Possibly to send invites. Or simpler, share join code out-of-band.

  * POST /api/v1/teams/{id}/join – Endpoint to join if user has code or link (though if using WebSocket for live join, might not need separate REST except to fetch initial state maybe).

  * GET /api/v1/teams/{id} – to poll team status (members, ready state) if needed, but could also be event-driven.

  * POST /api/v1/teams/{id}/start – to signal server all ready and game starting. Actually likely triggered via WS event from leader’s client. But could do REST to trigger server to emit start event to all.

  * POST /api/v1/teams/{id}/result – after team finishes, to submit final result to server for recording (score, completion, who was in team, etc.). Could also be triggered by server if it monitors the puzzle events. But an explicit end call is clear.

**Gameplay Real-time (WebSocket):**

These aren’t HTTP endpoints but just to mention:

* WS event: puzzle\_action – client \-\> server to broadcast a user’s action (like moved piece, selected answer). Server will optionally validate (if doing answer checking) or just relay to others and track for state.

* WS event: chat\_message – client \-\> server, then server broadcasts to others in same team.

* WS event: team\_update – various events like user joined, left, ready toggled.

* WS event: hint\_request – if hint system maybe, client asks server for a hint. Server can either send a prepared hint (if hints are static or computed) or simply log that they used a hint. Possibly also track hint usage in DB.

* All such events will include some context (team id, user id, etc.). Using Socket.io rooms, we can let server know which team room socket is in and broadcast accordingly.

**Admin Analytics Endpoints:**

* GET /api/v1/admin/stats/overview – Returns top-level metrics: total users, % completed, overall score, etc., plus maybe recent alerts. This populates the dashboard home.

* GET /api/v1/admin/stats/completion – Maybe more detailed breakdown: list each group with completion %, or each room with stats. Could be combined in overview but might break into multiple endpoints to keep payloads smaller. Alternatively, GraphQL would allow querying many related metrics in one go. If REST, either have multiple endpoints or one big “report” endpoint that returns a nested JSON of various stats. Possibly better to have separate endpoints that the front-end calls in parallel (since front-end can do parallel requests easily). E.g., stats/by-group, stats/by-room, etc.

* GET /api/v1/admin/users?filter=needs\_attention – Possibly an endpoint to get list of users who haven’t completed or scored low (for quick access from a “needs attention” alert). Or incorporate as filter in normal user list.

* GET /api/v1/admin/reports/compliance – maybe generates on the fly or triggers a background job to compile PDF, etc. If quick, can return base64 or link. Possibly better to just have front-end compile the needed data from endpoints and let user download CSV via front-end. But if they want nicely formatted PDF, server might use a template (like using ReportLab or headless browser printing an HTML template). We could also precompute compliance in DB so it’s quick to retrieve who’s incomplete.

* For specifics: GET /api/v1/admin/users/{id}/progress – detailed progress of one user, if not included in user info. Or GET /api/v1/admin/groups/{id}/stats for group-specific.

* GET /api/v1/admin/leaderboard/user – returns top N users by points (maybe filtering by group if param given).

* GET /api/v1/admin/leaderboard/team – if team leaderboards, similar.

* GET /api/v1/admin/alerts – list current alerts (with details). Possibly with an action field if any.

* POST /api/v1/admin/alerts/{id}/dismiss – to mark as addressed.

* POST /api/v1/admin/actions/remind – an endpoint to send reminders (maybe not needed if auto, but if admin clicks a button “remind all pending”, it calls an API that sends emails).

**Integration Endpoints:**

* GET /api/v1/admin/scorm/package – if admin wants a SCORM package of the training to upload to an LMS. Possibly generate a SCORM 1.2 zip on the fly. Or static if prebuilt. If dynamic content might need generate. Or it could be prepared offline. But something to consider.

* POST /api/v1/xapi/statement – if we receive xAPI statements from external or send out? Actually, if we act as an LRS, but likely we will emit xAPI statements to an LRS, not receive. So maybe we’ll have config to send xAPI out.

* Webhook endpoints for events (like when user completes training, we might call an HR system). We can allow admin to configure a webhook URL, and we’ll POST events to it. If so:

  * POST /api/v1/admin/integrations/webhook – to set the URL and which events. Not exactly a data retrieval endpoint, more config.

**Rate Limiting & Security**:

We plan to implement **rate limiting** on certain endpoints:

* Auth endpoints (login, register, password reset) – to mitigate brute force. E.g., max 5 attempts per 5 minutes per IP or per account. Implementation by a middleware (like express-rate-limit or a custom using Redis to count attempts).

* Public endpoints (if any like verify email) should also be limited.

* Possibly file downloads or reports to avoid spamming.

   For most user-authenticated GETs, maybe not needed if we trust our front-end usage, but to avoid abuse (some user script hitting our API repeatedly), a general limit like 100 requests per minute per token is fine, adjustable. The overhead to check IP or user in Redis is small and worth the safety.

**API Versioning:**

We use /api/v1 prefix now. If we introduce breaking changes, we’ll add v2 endpoints and keep v1 for backwards compatibility if needed. We will version at a coarse level (the whole API version), unless some clients pinned differently. But since likely we control client and server (monolithic release), not as big an issue. For third-party integration (SCORM/xAPI), those are standard so versioning separate.

**Error handling:**

Use proper HTTP codes: 400 for bad requests (with error detail in JSON), 401 for unauthorized (invalid token or no token), 403 for forbidden (no permission), 404 for not found (like user id not exists or not in your org), 409 for conflicts (like email exists on create), 500 for server errors.

We’ll create a consistent error response format: e.g., {error: "USER\_NOT\_FOUND", message: "User not found"} so client can i18n or handle specific errors. Possibly include a field for validation errors.

**API Security**:

All APIs will require HTTPS (our server will be behind SSL termination or we run with TLS). For internal cluster, still fine. We add CSRF protection for any state-changing requests if we use cookies for auth. If we go pure JWT in header, CSRF is less concern (since an attacker script can’t read user’s JWT from localStorage if using that, but storing in localStorage has XSS risk. If storing in cookie, then need CSRF token because cookie auto-sent). We likely use the JWT in an Authorization header from client JS – which is not automatically sent, so CSRF not directly an issue. So we can skip CSRF tokens if no cookies. But if we do refresh token in cookie, for refresh endpoint we either require sending a separate csrf token or we mark refresh route to only accept if header X-Requested-With or something (security by obscurity). Better approach: have refresh token only accessible by our domain JS (not HttpOnly), but that’s less secure. Alternatively, do a rotation scheme. Possibly easier: for now, we store access and refresh in memory on client (React state or localstorage). That has risk if XSS. To mitigate, we heavily avoid XSS by sanitizing all inputs (like chat messages etc.). It’s trade-off. Possibly we’ll go with JWT in memory (not even localStorage) to minimize persistent XSS risk. If user closes browser, they’d need to login again, maybe acceptable for security. Or use sessionStorage (clears on tab close). For now, let’s say either use memory or localStorage for tokens and be very vigilant on XSS prevention.

**Input Validation & Sanitization:**

We will validate all incoming data: use a library like Yup or Zod or class-validator for request bodies. For example, ensure emails are valid format on register, passwords meet complexity (maybe at least 8 chars, etc.), IDs are proper UUID format to avoid injection. Even though using parameterization in DB queries, still good to validate to catch mistakes.

Sanitize outputs as needed: e.g., user names could have special chars – we might allow most since we display as text (we will not allow HTML tags in names to avoid any injection in UI). Possibly strip any script tags or similar if they input them.

Use helmet (for HTTP headers security – though that’s mostly on sending responses: set CSP, HSTS, etc).

**Encryption & Sensitive Data:**

* All comms over TLS (HTTPS/WSS).

* Passwords hashed as said, no storage of plain.

* Other sensitive fields: if we stored something like secret answers or personal data, we might encrypt at rest too. For now, maybe not needed beyond DB encryption on disk and controlling access. But if storing things like user’s personal ID or address (likely not in this context), we’d consider encryption at field level.

* Ensure encryption keys for JWT (the secret to sign tokens) and others are stored securely (in environment variables or key vault, not in code repo).

* Media streams: WebRTC is encrypted by design (SRTP). If we recorded any content, ensure it’s stored securely.

## **Infrastructure**

Now how we deploy all this:

**Hosting Environment:**

We likely deploy on a cloud (AWS, GCP, or Azure). Let’s pick **AWS** for concreteness with common services:

* **Web App & API Hosting:** Possibly use containerized deployment (Docker \+ Kubernetes/ECS). Or simpler, a Node server on EC2. But since real-time and scaling, container is better. We could use **AWS ECS (Fargate)** for simplicity (serverless containers) or **AWS EKS (Kubernetes)** for more control if needed. Since timeline might not allow heavy K8s ops, Fargate/ECS can run a few tasks easily. Alternatively, use a PaaS like **Heroku or Render** for quicker deployment, but for enterprise product, likely AWS/Azure.

* For MVP, perhaps a single server VM could handle moderate usage (e.g., 100 concurrent users), but for scale and reliability, go container or cluster. We’ll design as if scaling.

**Scaling Strategy:**

* Horizontal scaling for stateless parts: We can run multiple instances of Node API servers behind a load balancer. JWT auth means no server session to share, which is good. We do need to handle WebSocket scaling (use Socket.io with Redis adapter so all instances can broadcast to correct user rooms). Alternatively, sticky sessions to one server for WS, but that reduces balancing effectiveness. Better to have all instances sub to a Redis pub/sub for events (so one user’s action on instance A can be forwarded to teammates on instance B). Socket.io’s official adapter does that, using Redis. We’ll implement that if multi-instance.

* The media server part (SFU) might be heavier on CPU. We can run one SFU instance per Node process, but ideally separate them? Possibly, run SFU in its own cluster (like separate service), and coordinate via our API. For simplicity, maybe each Node instance includes an SFU worker (Mediasoup) and handles media for any calls whose team connected to that instance. If one instance gets overloaded with too many calls, that’s an issue – we might need to distribute teams across instances. That might require an orchestrator or at least simplistic approach: e.g., when a team is created, assign it to the server with least load. That’s complex for MVP. Instead, maybe run one instance that handles all media (vertical scaling: give it more CPU & not run other tasks on it) and others handle general API. That requires routing communications between them. Possibly outside scope for initial. We might assume moderate usage that one decent machine with med iasoup can handle all calls simultaneously (Mediasoup can do hundreds of participants on a good server, given our calls small group, it’s fine). So not split for now. Document that if we need to scale, we can spin up more SFUs and have a rendezvous service to assign new calls to free SFU.

* **Database**: Use Amazon RDS for Postgres. Start with single instance, maybe enable Multi-AZ for failover. As usage grows, scale vertically (bigger instance) or add read replicas if certain read-heavy operations (like leaderboards queries) can go to replica. But careful if heavy writes for real-time events – might need to monitor. Possibly separate the analytical loads from main DB by using replicas or separate db for event logs.

* **CDN**: All static assets (images, CSS, JS bundles) should be on a CDN (like AWS CloudFront or Azure CDN). If we deploy front-end as static (React SPAs can be static if all interactions via API), we can host static on S3 bucket \+ CloudFront. Or if SSR needed (not really, mostly SPA), then Node serves but that’s fine. But simpler: separate UI static hosting decoupled from API (especially as we plan restful and an admin single-page too). So likely host front-end on S3/CloudFront or Netlify/Vercel for convenience, and backend on separate (or even can use Next.js for SSR if we wanted, but no need). We’ll treat them separate now.

* **TURN servers**: For WebRTC, need at least one STUN (we can use Google’s for dev) and a TURN for when direct peer connection fails (like symmetric NAT or corporate firewalls allowing only 443). We can deploy coturn on an EC2 or use a service (like Twilio’s ICE servers). Better control to run our own on AWS with UDP/443 and TCP/443 ports open. Possibly multi-region if global use to reduce latency connecting to TURN. If many media flows relay through TURN (if P2P fails), that’s heavy on bandwidth, so monitor usage. But our SFU ironically will handle relay anyway; TURN is still needed for initial contact or if a client cannot reach SFU directly, maybe less an issue if SFU is on global reachable. But corporate behind proxy might still need TURN as fallback to route media to SFU.

* **Monitoring & Logging**: Use a service like **AWS CloudWatch** for logs and metrics, or integrate **Datadog** / **NewRelic** for deeper APM (especially to monitor Node event loop, DB queries). We want to catch performance issues early. Logging: use structured logs (JSON) with context (request ID, user id for admin actions, etc.) so can trace an issue. For Node, libraries like Winston or Pino for logging. Possibly integrate an error tracking tool (Sentry) for front and back to catch exceptions with stack traces.

* **Backup**: Set daily automated backups of Postgres (RDS can do snapshots). Also backup Redis data if any critical (though mostly ephemeral, not needed backup). If we have user uploaded content at some point, ensure store in S3 and versioning.

**Video Infrastructure:**

* As discussed, use TURN for NAT traversal. Possibly have region-based SFU to reduce latency if global (like an instance in US, EU, Asia, and have clients connect to nearest). That requires orchestrating which SFU to use (maybe embed region code in team ID or user chooses nearest region). That’s advanced, probably overkill if majority user base in one geo. We note it in scalability though.

* Might use a managed service for video to offload complexity if timeline is tight. E.g., **LiveKit Cloud** or Twilio Video. But that adds cost. If timeline/skill on WebRTC is a risk, a quick way: use Twilio’s JS SDK, they handle the SFU. But that could be pricey with usage. The PRD suggests open source (Mediasoup, Janus, etc.) likely to avoid cost. We’ll stick to Mediasoup self-hosted.

* Ensure the media servers have enough bandwidth and close to users. Use AWS regions accordingly. Possibly deploy SFU nodes behind a separate subdomain (like media.cysafe.com) if needed.

**Security (Infra):**

* Use AWS security groups to restrict ports: Only expose necessary (443 for web, maybe 10000-20000 UDP for WebRTC if needed, or route through 443 with TURN/TCP if needed for those behind firewall).

* Keep backend instances in private subnets behind an Application Load Balancer that terminates SSL. Only ALB in public subnet. Use WAF (Web Application Firewall) on ALB to filter common attacks (AWS WAF has rules for SQLi, XSS patterns).

* Encrypt data at rest: Enable RDS encryption, and any stored files (S3) encryption.

* Regularly update dependencies (schedule npm audit or dependabot).

* Conduct a penetration test (likely after development, out-of-scope for now but plan for it, perhaps a requirement in compliance).

* Logging in production: avoid logging sensitive info (like no full JWTs or passwords in logs, etc.).

* If heavy on sensitive PII, consider secrets management for API keys integrated properly (like AWS Secrets Manager for SAML certs or email SMTP creds etc.).

## **Security Requirements (Application Security)**

As a cybersecurity training platform, it’s imperative we follow strong security practices (“dogfooding” – we should exemplify security in our own product):

* **Input Validation & Sanitization:** On top of what we discussed, always validate lengths, types, allowed characters on server and client. Use central validation schemes (maybe Zod schemas that can be used both on front and backend with TypeScript for consistency). This prevents injection or weird input causing errors.

* **Prevent XSS:** All user-supplied content that is displayed (like user names, chat messages) must be escaped in the UI. React by default escapes content in JSX unless dangerouslySetHTML, so that’s good. If we ever use innerHTML (like maybe to render some formatted instructions) ensure the source is sanitized. Possibly incorporate a library like DOMPurify if needed for any rich text. Chat could allow some limited markdown? if so, need to sanitize output.

* **CSRF:** As said, probably use token approach to mitigate. If we do set cookies for refresh, implement a double submit cookie for CSRF or simply ensure all state-changing ops require a header that normal browsers include but not cross-site (like X-Requested-With). It’s a bit weaker, but fine when combining with CORS settings. Actually, also ensure we do not allow cross-origin requests except maybe from our front-end domain. We’ll configure CORS to only allow our domain origin for API, so third-party sites can’t call API directly with user cookies. That plus no JSONP or GET state changes covers CSRF largely.

* **SQL Injection:** Use parameterized queries / query builders or ORMs. If using an ORM like Prisma, TypeORM or Knex, they handle it. If raw SQL, always parameterize. Escape identifiers properly if needed. We will likely use an ORM for productivity. Prisma with PostgreSQL is an option (gives a nice schema \-\> TS types, and easy migrations). Or TypeORM if we need more dynamic queries. Prisma is quite nice for safe queries and has transaction API if needed. We’ll weigh: given complex queries for analytics, sometimes writing raw SQL might be easier, but Prisma allows raw too. We’ll likely use Prisma in dev for speed of dev and iterative changes.

* **Sensitive Data Exposure:** Hide any secrets in code (none should be in client obviously, and in server config only). Don’t return unnecessary data in APIs (like never return password hashes obviously, also maybe hide internal IDs if not needed externally, though not big deal if someone sees their own user id but still). For admin endpoints, ensure they only get what they need. Possibly mask certain PII in large reports (like if printing out a list of users, maybe email partially hidden if not needed, but likely needed to contact, so maybe not).

* **Access Control flaws:** We touched on RBAC. We must test that no lower-privilege user can access admin endpoints by changing URL or JWT. So any such attempt returns 403\. Use middleware widely. Also ensure things like a user cannot fetch another user’s progress by guessing ID (we check org and roles). Use random IDs (UUIDs) rather than incremental to reduce guessability as well.

* **Rate Limit / Bruteforce:** Already planning to mitigate brute force on login and API scraping by rate limit. Possibly add account lockout after X failed attempts on login for 5 minutes. But that can be abused for denial-of-service on accounts (someone could intentionally lock accounts by failing). So perhaps not lock but escalate captcha after too many fails. Captcha might be heavy for enterprise internal though, maybe skip. Rate limit should suffice (with user count known, an attacker can’t try more than, say, 5 attempts per 15 min per account, which is safe enough combined with strong password policy).

* **Audit Logging:** We have an audit log for admin changes and potentially logs for user important events. That helps detect misuse or if an admin account was compromised and did something.

* **Penetration Testing & QA:** We will plan for a security audit or pen-test by an external team once MVP is up (like using OWASP Top 10 as baseline). We can do internal checks with OWASP ZAP scanner, etc., as part of QA.

* **Encryption in Transit & Rest:** done via TLS and DB encryption. Additionally, consider encryption for sensitive fields: maybe we do have some personal data (names, maybe email considered personal). Usually not necessary to encrypt those in DB beyond disk encryption, but for things like maybe training feedback notes, not that sensitive. If we were storing something like exam results that are sensitive under FERPA, maybe consider extra encryption. But likely okay.

* **Dependencies:** Keep libraries updated (especially anything related to security like JWT lib, or express, etc. if vulnerabilities found). Monitor CVEs and patch promptly.

* **Server Hardening:** if using Node, not much OS-level stuff beyond updated OS, minimal installed software, configure firewall, etc. If containerizing, use minimal base image (like node:18-alpine) to reduce attack surface.

* **SOC2 Considerations:** This implies having proper access controls (we do), auditing, data retention policies, incident response plan, etc. Not directly code tasks but processes. For instance, storing logs securely, limiting developer access to prod data, etc. Out-of-scope for PRD details, but our design supports those controls (like audit log, etc.).

* **ISO 27001:** Similarly, mostly organizational processes but technical parts align (like secure development, encryption, backups, least privilege).

* If hosting on cloud, ensure only necessary ports open, DB not publicly accessible, principle of least privilege on IAM roles, etc.

**Scalability Considerations:**

We partly covered in infrastructure. Summarize strategy:

* **Horizontal scaling** for stateless web nodes behind LB. Ensure session statelessness (check). Use Redis for shared states (like socket coordination, leaderboards).

* **Database scaling**: vertical up to a point, then read replicas or partition by domain if necessary. We could partition by org if any one org become huge to isolate impact. But likely fine on one DB up to many thousands of users or more.

* Use of caching to offload DB for frequent reads (e.g., user profile often accessed – but that’s fast anyway; heavy ones like top leaderboards daily).

* **CDN** for static content (makes serving UI to globally distributed users faster).

* Possibly multi-region active-active for global usage (complex, not initial but consider in future: e.g., separate clusters per region writing to regional DB and syncing? Or simpler: one region active at a time if needed).

* **Microservices**: We keep monolith for MVP. But foresee possibly splitting out services: e.g., the real-time game server could be separate from the REST API (to scale independently), or splitting admin analytics processing into a background service that pre-computes metrics (if metrics queries become slow).

* **Asynchronous processing**: If some tasks are heavy (report generation, sending bulk emails), we’ll do them in background jobs via queue. Possibly use a library like Bull (Redis-backed queue) or a simple SQS with worker. E.g., schedule daily summary job that goes through large data – do not tie up main request threads, use background worker.

* Use metrics to find bottlenecks, then optimize – e.g., if DB CPU high, see which query and add index or caching. If Node loop lagging, see if heavy compute in it (maybe the encryption or generating PDF \- offload such tasks).

**Tooling and DevOps**:

* Use containerization (Dockerfiles for back and maybe front if SSR).

* CI/CD pipeline: run tests on push (GitHub Actions or Jenkins), build docker images, deploy to staging/prod.

* Environment config: use .env files or cloud secret stores for DB connection strings, JWT secret, SMTP credentials, etc.

* Code style: use ESLint, Prettier, etc., consistent style to reduce errors.

Finally, ensure that technical choices align with cross-functional aspects:

* **WCAG 2.1 AA** compliance influences front-end tech (Radix/Chakra for accessibility).

* **SCORM/xAPI** compliance implies maybe packaging content or sending xAPI statements (we might use a library or write code to output statements on events to an LRS or to capture them).

* Data retention and privacy influences how we do deletion and backups (like script to purge data older than X if needed).

---

At this point, we’ve outlined how the system will be built from front to back. Next, we will move onto user experience details, content framework, integrations, etc., given that the core tech stack and data design should support those.

# **User Experience & Interface**

The UX and UI design of CyberSafe Escape must cater to two distinct user experiences: the **learner experience** (students/employees going through the game) and the **admin experience** (managing and analyzing). We’ll detail key user flows and screen specifications for both, ensuring intuitive, engaging, and accessible interactions at each step. We also cover the visual design direction and how accessibility is woven into the UI.

## **User Flows**

Below are the primary user flows with step-by-step outlines:

### **1\. New User Onboarding (Learner)**

**Goal:** A first-time user signs up (or is invited) and prepares to start training.

1. **Registration/Invitation:** The user clicks an invitation link (from email) or navigates to the sign-up page (if self-registration allowed). They see a branded sign-up form. They provide required info (name, create password if needed) and accept terms. *(If SSO is enabled for their org, they might instead click “Login with Company SSO” and skip to step 3.)*

2. **Email Verification:** After submitting, if email verification is required, the UI informs “Check your email to verify account.” User clicks link in email to verify (calls backend). The account becomes active. (We could skip verification for invite links as they’re already trusted).

3. **Initial Login:** User logs in with credentials or SSO. On success, they are taken to a **Welcome screen**. If this is their first login, a short welcome message or tutorial pops up (maybe an overlay explaining where to go). They might be prompted to select their preferred language if multiple are available.

4. **Profile Setup (if needed):** Possibly prompt to upload an avatar or confirm profile details. This could be optional. They can also set preferences like enable/disable sound effects, toggle whether they want to appear on leaderboards (privacy setting). These options can also be changed later in a settings page, but surfacing once is good.

5. **Organization Join (if applicable):** If the user was not pre-associated with an org (like self sign-up scenario), they might need to join one via a code or selection. For example, a student enters a class code to join their class group. Or an employee picks their company from a list if allowed (not typical; usually admin invites so they’re already linked). We likely rely on invites to auto-join them to org and group, so skip manual join.

6. **Onboarding Tutorial:** A quick interactive tutorial may play: showing how to navigate the dashboard, how the escape rooms work. Possibly a “Tutorial Room 0” as described in competitor where they learn how to play (point-and-click, use hints, collaborate). We can implement a short guided demo puzzle. Alternatively, a guided tour overlay that highlights UI elements (“This is your progress map… click here to start first challenge”). For MVP, perhaps a static help page or short video. Should be skippable for those familiar.

7. **Ready to Start:** User lands on the **Learner Dashboard** or “Mission Select” screen where they see the available training rooms (likely presented as an interactive map or list of 6 rooms, Room 1 unlocked and others locked). From here, they proceed into Room 1\.

### **2\. Joining an Organization (if separate from onboarding)**

*(This flow might merge with above. But if needed separately, e.g., a student created an account on their own and later joins class.)*

1. User logs in to their account. Because they are not yet in an org, the UI shows a “Join your Organization” prompt.

2. They input an **organization code** or **email domain check**. E.g., if company uses domain, maybe just confirm their email domain matches. Or enter an invite code given by admin/teacher.

3. The system links their account to that organization and possibly to a specific group. Confirmation message shows “You have joined \[OrgName\]/\[Class\].”

4. Then they see the standard learner dashboard for that org with training content.

    *(We might skip this complexity by always requiring invite or SSO which auto-assigns org, thus no separate join step.)*

### **3\. Starting a Solo Room (Learner)**

**Goal:** User begins a single-player training room and completes it.

1. From the main dashboard or map, the user selects **Room 1: Password Fortress**. If other rooms are locked, they are visually indicated (could show a lock icon). Room 1 is highlighted as “Start here”.

2. **Room Intro Screen:** Upon selection, a screen appears with the room’s title, a brief scenario intro text (and maybe an image), estimated time, and learning objectives (so user knows what they’ll learn). There’s a “Start Room” button. Possibly also difficulty selection if we allow (e.g., normal vs hard mode), or a note if it’s timed.

3. User clicks “Start Room”. The screen transitions to the game interface for Room 1\. A timer might start (e.g., countdown from 10:00). The UI for puzzles appears.

4. **Puzzle Sequence:** The user engages with a series of puzzles in that room. For each:

   * Instructions are provided either in a side panel or at top. E.g., “Create a strong password to unlock the vault.”

   * The user interacts (types a password, or drags items, etc.). The UI gives immediate feedback if correct or not for tasks that need it, or allows submission.

   * If the user struggles for a certain time (say 30 seconds without progress), a **Hint button** pulses or a hint is suggested. If clicked, hint pops up (“Try a longer phrase”). The user uses it and continues.

   * The user completes the puzzle, we display a quick success indication (like a green check or “Correct\!” message). Possibly a short explanation overlay: e.g., “By using a passphrase, you greatly increased security. Great job\!” They click continue.

   * Move to next puzzle within room. Perhaps a progress indicator (like “Puzzle 2 of 4” in this room) so they know how far along.

5. **Room Completion:** After the final puzzle, if all are solved, show a **Room Complete screen**: “Congratulations\! You escaped the Password Fortress.” It shows their results: score (e.g., 180/200 points), time taken, number of hints used, maybe a few key takeaways in bullet points. It also lists any **badges earned** during this room (e.g., “Speedy Solver badge for finishing under 5 min”). Provide a *Continue* button.

   * If the user failed (e.g., ran out of time), show a message like “Time’s up\! You did not escape in time.” Still provide feedback and encourage retry (maybe allow them to retry immediately or after reviewing hints). We might not “fail” them completely; maybe allow them to continue but with lower score, but for learning sake it might be okay to let them through after multiple attempts, depending on design. Possibly require them to retry until success to mark complete. For now, better require success to count as completion, but with generous hint usage allowed.

6. **Post-room Reflection:** Optionally, we might include a short reflection or quiz after the action: e.g., “Which of the following is the best description of a strong password policy?” as a knowledge check. Could be part of puzzle or after summary. This helps reinforce.

7. **Return to Dashboard:** The user returns to the hub. Room 1 is now marked as completed (e.g., a checkmark or colored differently). Room 2 is now unlocked (if sequential unlocking). The user can either proceed to Room 2 or take a break. Their dashboard might now show their cumulative score, new level, etc.

8. At any time, user can exit a room early (pause/exit) – the flow should allow saving progress or at least restart from last puzzle when they come back. A *pause menu* might be accessible (with option “Leave Room” or “Resume”). If leaving mid-room, we warn unsaved progress might be lost unless we implement checkpoint saves per puzzle. Could mark as in-progress. Minimally, try to preserve completed puzzles so far by storing partial progress, so they don’t redo from scratch.

### **4\. Creating/Joining a Team (Multiplayer Room)**

**Goal:** A user (or admin) sets up a team for a multiplayer room, and members join, then start.

1. **Team Lobby Creation:** Suppose user has finished Room 1 and now sees Room 2: Phishing Waters is a team room. When they click “Start Room 2”, if they are not already in a team, they get options: “Create Team” or “Join Team”. Provide explanation that 2-5 players are needed.

   * If they choose Create: They become host. The UI shows a lobby screen with a unique **Team Code** (e.g., 4-6 letter code) and invite link. It instructs “Invite others to join using this code or link.” They may see a list of online friends or colleagues (if we have that concept) to directly invite (perhaps via an internal notification or just verbally share code if in same class).

   * If they choose Join: They input a code from a teammate who created one. Then they join that lobby. (Alternatively, if admin pre-assigns, they might see the team ready or auto-join it).

2. **Team Lobby UI:** Once in lobby, members’ avatars/names show up in a list or grid. Each member has a status indicator (not ready/ready). A text chat could be active here already to communicate (“We waiting for Alice?”). If video is an option in lobby, we might allow turning on video now to greet (maybe optional, often video in game starts when game starts, but could start here too).

   * The host can see a “Start” button (grayed out until minimum players present, e.g., at least 2). The host can also kick a member if needed (like if a stranger or someone causing trouble). Possibly also assign roles here if the game needs (Phishing Waters might not have roles, but final room will). If roles in this room, let them select or randomize roles now.

   * Others see “Waiting for host to start the game…”

   * If team is full or everyone needed is in, host clicks **Start Game**. If someone not ready, maybe confirmation.

   * If instead user used “Random Matchmaking”: the UI might show “Searching for teammates…” with a loader and optionally allow them to cancel. Once enough found, it transitions to a lobby with them. Possibly auto-start after 30s if a threshold players joined (to not wait indefinitely for a full group).

3. **Loading into Team Room:** On start, all members’ clients transition to the game interface of Room 2\. Maybe a countdown “Game starting in 3…2…1”. Then the scenario intro for the room is shown (like an opening narrative scene, e.g., a graphic of an email inbox with a narrator voice or text “Your team has 45 minutes to identify all phishing attempts…”). We might simultaneously show a tip like “Communication is key. Use the chat or voice to discuss with your team.”

4. Once the game begins, the UI will incorporate the **video chat windows** (likely small frames on side or top). The puzzle interface (like shared email inbox) is central. Everyone can interact according to game design.

5. **Collaboration in Gameplay:** As described earlier, all actions sync. Team might talk: “I’ll take the first five emails, you take the rest.” They sort, discuss via audio. If someone clicks a suspicious link, maybe an alert appears (we could even simulate consequences in the game, but that might be advanced, likely they just mark it).

   * The UI might show a team score or progress bar. Perhaps a list of tasks to complete together. Mark them checked as done. E.g., “1) Sort emails, 2\) Identify URL issues, 3\) Etc.”. This helps team coordinate if tasks are multi-step.

   * A hint system for team: any player can request a hint. It might appear to all or privately to requester? Likely to all to keep team on same page. Possibly require a team vote to use a hint (one of our designs), but maybe not necessary – any can click, or at least confirm.

   * Provide a way to pause if needed (maybe majority vote to pause the timer if absolutely needed – but in timed scenario, pausing might defeat purpose. Perhaps not allow pause in team to keep challenge, or allow if an emergency, up to design).

6. **Team Room Completion:** They finish all required puzzles/tasks in the room. Show a success message to all: e.g., big “Room Cleared\!” banner. Show team results: maybe just time taken and success (since points might be team-shared). If individuals had some stats (like who found most phish), could display fun breakdown (“Alice flagged 3 phish, Bob flagged 2”). Possibly give each a personal score contribution out of team total.

   * If they failed (time expired or tasks incomplete), show failure screen similarly (maybe “Your team failed to catch all phish in time – the company suffered a breach\!” with dramatization). Encourage retry or continue anyway with consequences? Possibly they must retry to proceed, or allow moving on but mark incomplete. Usually for mandatory training, they’d need to eventually succeed, so encourage re-run.

7. **Team Post-room:** They are then either disbanded back to individual dashboards or if the next room is also team-based, they could choose to continue together. E.g., after finishing Room 2, a prompt: “Stay with team for next challenge (Room 4)?” Because Room 3 is solo, they’d have to split anyway. Possibly just bring them to a summary page with option “Exit Team”.

   * They can chat a bit in summary (like “GG everyone\!”). Provide a button “Return to Dashboard” which ends the call and session.

   * The team session stats are logged in admin dashboard, and each user’s progress indicates they completed that room.

### **5\. Completing a Team Room with Collaboration**

*(This is basically covered in \#4 above with heavy focus on collaboration steps. But we can highlight roles if any)*

If a room like the final boss has assigned roles, the flow differs a bit:

* In the team lobby (before start), the system either auto-assigns or lets them pick roles: e.g., one is “Commander”, etc. The UI shows role descriptions so they understand duties. Everyone confirms they’re okay with roles. If a team member really wants a different role, they swap (maybe drag their name to a different role slot or use a dropdown to select a role if free).

* During gameplay, the interface for each role is slightly different (Commander sees overall view, etc.). They will need to communicate what they see. For example, an Analyst might get a log readout and say “I see malware on host X”, Commander has a map and must click quarantine on that host.

* The interface should visually reinforce roles (maybe color coding or badges on their video frames showing role). And possibly includes a quick reference of their tasks.

* Collaboration key: have maybe an “status board” widget that either auto-updates or players update (like Commander might check off tasks as done). That way all see progress.

* When roles actions interdepend, ensure the UI signals clearly (like Commander cannot press “Contain virus” until Analyst identifies which system, etc., so that triggers after an event from Analyst). We design puzzles accordingly.

* After finish, the roles might get specific feedback: e.g., “Commander’s decisions: good coordination, Analyst’s findings: found 4/5 clues,” etc., but keep it positive, we don’t want to single out blame. It’s for learning: if one role failed, presumably whole team fails.

### **6\. Viewing Progress and Achievements (Learner)**

**Goal:** User checks their own progress, sees earned badges, points, etc.

1. From dashboard, the user clicks on their **Profile/Progress** section. This might be a button like “View My Progress” or clicking their avatar corner which opens a profile modal.

2. **Progress Overview Screen:** This screen shows a summary: maybe a visual representation of the 6 rooms with checkmarks on completed ones and locks on upcoming. It might also show their overall score or grade so far (like 450/1000 points, Level 3). Possibly a gauge or “Security readiness: 80%” to give a sense.

3. It lists details per room: status (completed or not), score achieved, best time, last attempted date. If not completed, maybe a “Resume” button if they left in middle.

4. **Badges/Achievements Tab:** The user can switch to see all badges. It displays a grid of badge icons. Earned ones are in color, locked ones grayscale with hints how to earn. For each badge, user can click to read description. Possibly implement “share” from here (e.g., click share on a badge to brag on social media or copy image).

5. **Leaderboards Tab:** If user wants to see how they rank, a section may show the leaderboard snippet – e.g., “You are \#5 this week. Leader: John (5000pts) – You: 4200pts”. They might click to open full leaderboard page (which could overlay or separate page). There they can filter by timeframe or by friends (maybe a toggle for only within their group).

6. **Detailed Activity (Optional):** Could have a log of what they’ve done: e.g., “Jan 5: Completed Room 1, Jan 6: Earned Phish Finder badge, Jan 7: 5-day streak\!”. This timeline can motivate or allow them to reflect.

7. They can navigate back to main training screen from here.

### **7\. Admin Creating a Training Campaign**

**Goal:** An admin sets up the training program for their organization. (This might include scheduling if needed, content selection, etc.)

1. Admin logs into the Admin Dashboard. They go to a **Training/Campaigns** section. If the product is basically fixed content, they might not need to “create campaign”, just use the default. But let’s assume they can manage when training is rolled out.

2. They click “New Training Campaign”. Options appear: select content (maybe default “CyberSafe Escape \- 6 room course”), start date, due date, target audience (could be entire org or select groups). Possibly name the campaign (e.g., “2026 Annual Security Training”).

3. They configure settings: for instance, enforce sequential progression or allow any order, require minimum score or just completion, whether to allow hints or have a strict pass criteria. Also toggles for gamification elements (maybe some orgs want to disable leaderboards – they could do so here).

4. They hit “Create Campaign”. The system may send out notifications to target users (“You have been enrolled in CyberSafe Escape training, due by X date.”). Or admin can choose to send later.

5. The campaign appears in admin dashboard with status (0% completed initially). Admin can click into it to monitor specifically that campaign’s progress (similar metrics but filtered to that cohort/timeframe). This is helpful if they reuse the platform for multiple training cycles (like yearly).

6. If scheduling content release: maybe they want to release one room per week. If we support that, the campaign config could allow staggering (Room 1 available week1, etc.). Then the system automatically unlocks content on those dates. But initial probably not needed – though some educational uses might drip feed. For enterprise likely want all available to allow self-paced completion.

7. Admin might also configure reminders for campaign: e.g., send email reminder 1 week before due to those not done. The UI has checkboxes or fields for that.

8. Admin saves. Now the campaign is active. The users on their side, when they log in, see the training and due date clearly.

*(If an admin doesn’t have a concept of campaigns in MVP, they might just treat the default content as ongoing. But including campaign mgmt is a plus for scheduling and tracking by year.)*

### **8\. Admin Reviewing Organizational Performance**

**Goal:** Admin checks the dashboard to see how the whole org (and sub-groups) are doing.

1. Admin navigates to the **Dashboard Home**. Here they see high-level stats: e.g., “Overall Completion: 60% (120/200 users), Overall Score Avg: 85%, Predicted Risk: Medium”. They also see a deadline countdown if one is set (“10 days left to deadline”).

2. They scroll to see breakdown charts: maybe a bar chart by department completion (Ex: Sales 50%, Engineering 80%, HR 70%). They notice Sales is lagging. They click on “Sales” bar.

3. The interface drills into Sales department detail view. Stats now just for that group: maybe who’s done, average scores, etc. They see a list of all Sales users and their status or risk (some red icon for not started, green for completed). They identify specific people who are behind.

4. They might directly take action: maybe tick checkboxes next to those users and click “Send Reminder Email” (if we allow manual triggers in UI). Or at least they know to nudge that manager.

5. They switch to another tab of analytics: e.g., “Topic Mastery”. A heat map shows each topic (phishing, passwords, etc.) and the average score by department. They see that “Data Privacy” topic has low scores across many departments (like mostly orange/red) whereas “Phishing” is green. This indicates a universal weaker area. They decide maybe next month to send a supplemental lesson on Data Privacy or highlight it in communications.

6. They check **Leaderboard** maybe out of curiosity or to reward top performers. They open Leaderboard section and see Alice (from Engineering) is \#1 with 9800 points, Bob \#2, etc. They might share this info or give recognition. If some users opted out, they appear anonymized or not at all. That’s fine.

7. The admin then goes to **Reports**. They generate a Compliance Report as PDF. The UI asks for which campaign or date range; they choose “2026 Annual Training” and click Generate. A PDF download starts with a formatted report (or it opens in a new tab for preview). They save it for records.

8. They might schedule a report: They click “Schedule Report”, choose “Weekly Progress”, recipients (maybe themselves and some execs), and set frequency Monday 9am. The UI confirms scheduled.

9. Admin checks **Alerts** (maybe a bell icon with a red badge). There’s an alert: “20 users have not logged in yet (list)”. They click it, see detail and recommended action “Consider sending a reminder or reaching out to their managers.” They mark it as read since they just sent a reminder.

10. Content with the status, the admin logs out or navigates to other admin pages (like user management if they want to add someone).

**Other flows** like admin editing content (if allowed) or integrating tools might exist but are more advanced:

* If admin can customize puzzles, they’d go to a Content Manager, pick a puzzle, edit text or answers. That requires UI to edit and test puzzles \- probably beyond MVP, but maybe they can add new quiz questions at least.

* If admin adding new users: they go to Users page, click Add User or Import. That was covered in user mgmt endpoints, but UX wise: a modal or separate page with form fields, or an import wizard (upload CSV, mapping fields if needed, confirm results). After adding, those users get invite emails.

## **Screen-by-Screen Specifications**

We’ll outline each major screen’s purpose, elements, and behaviors:

### **Learner Interface Screens:**

**Landing/Marketing Page (pre-login):**

* Purpose: Public info about the product (for external or if open reg). Possibly not needed if distribution is internal, but maybe a generic homepage for the platform with product name, tagline, login form.

* Content: Logo, tagline (“CyberSafe Escape – Security training as an adventure”), perhaps a few illustrations or stats (“90% of attacks involve people – train to not be the weak link\!”), maybe testimonials.

* Prominent “Login” and if allowed, “Sign Up” buttons. Possibly organization-specific subdomains if each org gets its own login page (if customizing, but MVP can be single login form that detects org by email domain or user chooses from dropdown if necessary).

* Accessibility: ensure contrast and alt on images (like decorative images with empty alt or meaningful ones with alt).

**Login/Registration Screen:**

* Purpose: Authenticate user or create account.

* Elements:

  * Login: Email field, Password field, “Login” button. Possibly SSO options (if SAML/OIDC, show “Login with \[OrgName\] SSO” or Google/Microsoft buttons).

  * “Forgot Password” link leading to a reset flow.

  * If registration open: a “Sign up” link toggling to registration fields (Name, Email, Password, Confirm, Org code if needed, Accept TOS checkbox). Might be separate route or same with tabs.

  * Organization selection: if needed, could have the user enter an Org code or pick from a dropdown of known Orgs after email (some systems do: user enters email, if domain matches known SSO domain, it redirects them to SSO, else allow password login). If we implement domain-based SSO detection, the flow is dynamic (maybe out of MVP).

* UI: Keep it simple, with branding. Possibly background image of something cybersecurity or puzzle.

* Interactions: Form validation (e.g., email format, required fields). Error messages for invalid login (“Incorrect email or password”). If SSO is used, redirection flows.

* Accessibility: Label all fields clearly. Put focus on first field on load. Announce any error messages. Ensure tab order flows logically from email \-\> password \-\> login button, etc.

**Learner Dashboard (Post-login Home):**

* Purpose: Central hub for the learner to start/continue training and see overview.

* Key UI elements:

  * **Welcome Header:** greeting by name (“Welcome, Alice\!”) and maybe progress summary (“You have completed 2 of 6 rooms”). Possibly level and points (“Level 2 – 1500 XP”).

  * **Training Map or Menu:** A visual representation of the 6 rooms. Could be a stylized map (like rooms as nodes connected by a path). Or simply a list or grid of 6 cards. Each room card shows: Room number, title, whether it’s Solo/Team, maybe an icon or illustration for theme, a status indicator (Locked/Unlocked/Completed).

    * Completed ones clickable to review or replay (if allowed) – maybe a “Replay” option if we allow practice, but scores maybe not change or mark as repeated.

    * The next not done and unlocked has a prominent “Start” or “Resume” button.

    * Locked ones are not clickable except maybe to show “Complete previous room to unlock.”

  * **Achievements/Leaderboard Preview:** A side panel or section could show something like “Current Level and Points” with a progress bar to next level, maybe “Badges: 5/40 earned (View All)” and “Your Rank: 5th this month”. This gives a quick motivational glimpse.

  * **Announcements (if any):** Admin might push a note (like “Complete training by Oct 31 to avoid account lockout\!”). Could be shown as a banner or in a notifications widget.

  * **Navigation Menu:** Perhaps a top nav or sidebar (depending on layout). This could contain: Dashboard, My Progress, Leaderboard, Achievements, Help, (and Logout). Possibly chat or notifications icon as well if we want to unify messaging (if they have an inbox for system messages). For streamlined, maybe just a simple top bar with account dropdown.

* Placement: If focusing on the “game map” concept, that might take center. Achievements can be a sidebar or bottom section. On mobile, the map might be a vertical list due to width.

* Interactions: Clicking a room either starts it (if unlocked) or gives info if locked. Hover might show description or progress (for completed maybe shows score). Achievements preview clicking takes to full achievements page.

* Micro-animations: Possibly animate the next room unlocking (like a lock icon breaking or a glow). If they just earned new level when returning to dashboard, show a small pop-up (“Level Up\!”) for a moment.

* Responsive: On a small screen, might collapse achievements into an icon or separate tab of a bottom nav. The room list could be a simple vertical list with numbers or maybe a horizontal scroll of cards. Ensure all info still accessible (maybe hide decorative images on small screen if needed for space).

**Room Selection Hub (if separate from main dashboard):**

* If we decide to have a separate “mission select” UI distinct from a progress dashboard, it might be similar to above. Possibly integrated though. Let’s consider above as the hub.

**Solo Room Game Interface:**

* Purpose: Provide the interactive environment for puzzles in solo play.

* Layout Example (for Room 1):

  * A main area for the current puzzle. Could be a modal-like panel or a full-screen interactive element. E.g., a form for password entry or a mini-game canvas.

  * Instruction text prominently displayed near top (“Create a strong password for the vault.”). Possibly an info (“i”) icon to read more about why if user wants background.

  * Puzzle input controls: e.g., a text field and a “Test Strength” button, or draggable items, etc. These will vary puzzle to puzzle. We likely have a container that can swap different puzzle components.

  * Hint button at bottom or side. Possibly show number of hints available or if using a scoring penalty, mention it (“Hint (-10 pts)”).

  * Navigation: Perhaps arrows or a “Next” button for when puzzle solved to proceed, if it doesn’t auto-advance. Or if linear, auto-advance after a short delay. But a Next button allows user to read explanation before continuing.

  * Timer (if room timed) displayed at top corner. Use a clear format (mm:ss). When below certain threshold, maybe turn red or flash lightly. If a user is colorblind or not looking, also consider an audio cue (tick or alert) and a textual message “1 minute remaining\!” for screen readers.

  * A pause menu (maybe via an icon or ESC key). If clicked, bring up options: Resume, Leave Room (with confirm), Sound on/off toggles because some might want to mute game audio quickly, etc. Possibly volume slider if audio puzzles.

  * Visual theme: The interface might be stylized to the room theme (like Room1 might have a fortress background image or UI looks like a terminal for hacking scenario). But ensure readability of text (maybe semi-opaque background behind text if on image).

  * For accessibility: All interactive elements labeled and keyboard accessible. E.g., if it’s a drag-drop, provide a fallback like tabbing to item and pressing a key to select, then tab to target and press to drop (and announce via ARIA live “Item placed”). Not trivial but possible. At least allow a non-drag alternative, even if sequential actions.

  * Example for password puzzle: The UI could have a password input and an on-screen strength meter bar that updates as they type (with color and label like “Weak/Strong”). They press “Submit password” to attempt unlocking. If weak, maybe it warns or puzzle doesn’t accept and hints. If correct (met criteria), door “opens” animation.

**Team Lobby (Waiting Room) Screen:**

* Purpose: Stage where team members gather and prepare.

* Layout:

  * Center: Team info – e.g., Team Code, maybe a team name (editable by host).

  * Member list: Avatars or initials in a row or grid, with names. Host could have a star icon. Next to each name, a status dot (green if ready, grey if not). Possibly a ready checkbox they toggle or a button “Ready” by each except host.

  * Chat panel: On right side or bottom, a simple chat interface for text to coordinate. (In case voice not yet connected or cross-comm). Could also show a message “Tip: use Chrome for best video experience” if needed.

  * Controls: For host – Start Game button (disabled until conditions met). Also Kick buttons (like a small X by each member except host). For all – maybe a “Leave Team” button if they change mind (returns them to dashboard or previous state).

  * Video: If we enable video in lobby, could show small thumbnails of any member who turned camera on. Might not need until in game, but sometimes helpful to ensure it works. Could have a “Test Camera” feature maybe.

  * Role selection (if applicable): Could be drop-down next to each user where host can assign roles or they pick themselves. Or a separate “Assign Roles” section listing roles and dropdown to select user for each. Must handle duplicates nicely (like if one chosen for two, prevent).

  * Visual: Should match theme somewhat but this is a neutral UI element. Possibly theme it per room (Phishing could have an office background, etc.). But clarity is priority here.

  * Responsive: On mobile, maybe use a simpler view: list members vertically, chat as a toggle overlay, etc.

**Team Room Game Interface:**

* Purpose: Collaborative puzzle-solving environment with communication tools.

* Layout likely splits screen between **Puzzle workspace** and **Communication** panels.

  * Puzzle workspace: Could be similar to solo, but potentially larger or with multi-part interface. E.g., in Phishing email challenge: main area shows an inbox list and email preview panel. Everyone sees when one clicks an email to preview it (or each can individually? Ideally one shared cursor or selection to focus team). Might allow independent viewing by each but sync decisions. We’ll design so any action (marking phish) is team-wide.

  * Video/Audio: Possibly top-right or left area, floating windows for each user’s video. Could allow dragging them around or resizing, but typically a static grid in a corner. If screen space is a concern (like in a busy UI), might allow collapsing video to just audio or minimize to icons. Or user can individually toggle hide video panel if distraction.

  * Text Chat: Even with audio, text chat can be useful for posting links or if someone’s mic fails. Provide as a collapsible side panel or overlay. Possibly display on left side while video on top, puzzle in center-right. Or vice versa. Alternatively, bottom area could be split: left for chat messages (with scroll), right for an input box. Keep it visible if possible without overshadowing puzzle.

  * Team info HUD: Show timer and maybe team score. Possibly names of team members with an icon indicating their presence (like speaking indicator or if someone’s lagging connection). Could integrate an icon next to name if they raised a hand or something. Possibly a small indicator showing who currently has a hint window open or so if at all.

  * Role-specific UI: If roles, some parts of UI might only show to certain roles. E.g., if Commander has a separate control panel, other roles might not see that panel, or see a read-only version. We’ll need conditional rendering. Must ensure other roles are aware of relevant info via communication. E.g., Analyst sees a log and might have a “Share log snippet” button to send to team chat or broadcast on screen for all.

  * Shared components: If a puzzle requires multiple inputs at once (like two players turning keys), maybe UI shows two buttons that each must be held by different users. If one user tries to do both, maybe disabled; encourage teamwork.

  * Real-time feedback: If a member is doing an action, we might highlight it (e.g., if Bob is dragging an email to phishing folder, maybe that email row is highlighted in Bob’s color for others). Use small name tags or color outlines to avoid confusion.

  * Hint usage: If a team hint is used, show it to all (like a popup with hint text “Check email addresses carefully\!”). Everyone clicks OK or it times out. Deduct team points accordingly.

  * Accessibility: Similar concerns as solo, plus making sure any communication is also accessible (like ensure chat is reachable by keyboard, and video controls are accessible). If a hearing-impaired user in team, they might rely on chat if can’t hear audio; our design should allow that channel to be effective. Possibly consider adding an optional automatic caption for voice if tech allows (likely not MVP, but interesting future for accessibility).

  * Error states: If a user disconnects, UI might show ghost image or “X has disconnected, attempting to reconnect…”. If they don’t return, either team continues or maybe abort if critical. Should handle gracefully – maybe allow others to complete but mark in results one member absent. Or if just two and one leaves, maybe fail scenario or give chance to invite someone new (not likely mid-game though).

**Puzzle/Challenge Interfaces:**

We can’t detail each fully, but ensure variety:

* Sorting challenge: UI like dual lists or columns where items can be moved from one to another. Use clear visuals (cards with text and maybe icon, arrows to move, etc.).

* Matching game: could be draggable lines connecting items, or selection drop-down next to items.

* Multiple-choice quiz: simple radio buttons with styled options (maybe use custom styles for nice appearance). Provide feedback on select (like highlight green/red after answer if immediate feedback; or if at end, show which were wrong). Possibly allow changing answer until submit.

* Drag-and-drop UI: Make draggable items clearly draggable (use grab cursor icon on hover, outline). Drop targets highlight on potential drop. Keyboard alt: allow item selection via enter key and then arrow to move focus to target, etc.

* Timed simulation (like final room with tasks): maybe no single puzzle UI, but a dashboard with multiple widgets. E.g., left side has list of alerts (things happening), right side shows actions available (buttons like “Shut down server” etc.), bottom shows a log feed of events. The user in Commander role would have to click through these as they come. This is more like a small game UI inside. We design it as if it’s a specialized interface for IR, but ensure clarity (like highlight urgent items in red, a notification if something needs immediate attention, etc.).

* Riddle/clue solving: If any puzzle is like solving a code or cipher, ensure clues are viewable (maybe a “Clue” button to open an image or text). And an input to enter answer. Possibly allow attempts and tell if correct or not.

* Role-play scenario (like insider threat): Possibly present dialogues or evidence as interactive story. UI might show character avatars and their statements, and a notebook to piece clues. Could be more textual. Need to present multiple pieces of info – might use a tabbed interface (e.g., “Emails”, “Logs”, “Interviews” as tabs, each containing content to read). The team then has to choose from suspects. Provide an interface at end to pick suspect and reason (maybe a text they fill or choose from options of evidence).

**Results/Debrief Screen:**

* After each room, whether solo or team, present a debrief.

* Elements:

  * Big title (“Success” or “Incomplete”). Possibly image or trophy if success, or an encouraging message if not.

  * Summary stats: Score (with breakdown: base points, time bonus, hint penalty, etc.), Time taken, Accuracy (% puzzles solved correctly on first try, for example). For teams, show team score and maybe list each member’s points contributed or if we only give team points, then just one score. Could show ranking of team members by contribution subtly for fun (but might discourage team spirit, so maybe not in a blameful way).

  * Learning summary: List key learning objectives and mark if achieved or just list them as review. Or bullet points like “Remember: A strong password is at least 12 characters. MFA adds extra security.” Possibly one bullet per puzzle in that room to reinforce what that puzzle taught.

  * Badges Earned: If any new badges unlocked during that room, show them with an icon and name (maybe a small “New badge: Speedster\!”). This reinforces accomplishment.

  * Buttons: “Continue” (back to main map or to next room if unlocked). If user failed the room: buttons might be “Retry” and “Exit for now”. If they exit after failing, progress is not marked complete; the dashboard will still show incomplete. Possibly allow skipping? But since each room covers vital content, likely must retry until pass (with hints making it possible).

  * If it was final room and completed, maybe also mention “You will receive a Certificate by email” or have a button “View Certificate” which generates a PDF certificate with their name, date, etc.

  * UI should be celebratory on success: maybe confetti animation, or a sound (cheering, which can be toggled off if user disabled sounds). Also maybe a quote or fun fact about that topic as extra content.

  * Ensure that if user uses screen reader, they get the content of results too (should be standard text).

**Achievement Showcase (Page):**

* Purpose: Display all badges/achievements earned and available.

* Layout: Typically a grid of cards or icons. Possibly categorized by type (Completion, Performance, etc.). Could use tabs or filters to show categories.

* Each badge icon: if earned, full color; if not, greyed with a lock overlay or question mark if hidden. Hover or click reveals badge details. If not earned, maybe hint text like “Criteria: Complete all rooms” if we want to motivate (unless it’s secret then description might be “??? – keep playing to discover”).

* There might also be a section for “Points & Level”: show current level, XP, maybe next level milestone. Possibly provide a small explanation “Levels are achieved by earning XP from completing rooms and challenges. Higher levels unlock… (if any unlocks).”

* Possibly display streak if that’s gamified: like “Current streak: 3 days” somewhere.

* Visual: Gamified style, maybe trophy icons. Could show an avatar or something leveling up. Some systems have an avatar or character that evolves with level – could be nice but not required.

**Personal Progress Page:**

* Might be combined with Achievements or separate. It focuses on training progress.

* Could include charts or graphs: e.g., a radar/spider chart of their performance in different skill areas (phishing, passwords, etc.), highlighting strengths and weaknesses. Or a simple list with percentages.

* Provide recommendations: maybe text like “You might review the Data Dungeon content again for better mastery” if one area was low. Possibly link to extra resources if provided (like a PDF cheat-sheet on that topic).

* If this is too much, at least provide the breakdown in text.

* Also list any optional content or next steps: e.g., “You have completed the core training. Try the bonus challenge in the Extra section” if such exists.

**Leaderboard Views:**

* Possibly a full page for leaderboards that the user can scroll.

* Options: dropdown to select which leaderboard (daily/weekly/all-time, or my team vs global). If multiple dimensions, allow switching. Could also show separate tables one below another (like tabs or accordion for each category).

* Each entry: rank number, user name (or alias if privacy), points or whatever metric. Possibly also show their team or dept if that’s relevant and allowed (like “Alice \- Sales Dept \- 9500 pts”).

* If user is not in top N displayed, show their position at bottom (“You are \#45 with 3000 pts”). Possibly highlight the row of the user if they are visible in top 100 etc.

* For team leaderboards: list team name (or members if no set name), score or average. This could be on admin side more, but maybe for fun we show to all if it’s not sensitive. Or only to admins. Possibly avoid showing team details to general users to not cause internal rivalry issues unless it’s part of culture. We could restrict it.

**Admin Interface Screens:**

**Admin Dashboard Home:**

* Purpose: Provide at-a-glance organizational metrics.

* Layout: Typically a grid of summary cards and charts. For example:

  * Top row: Cards with key numbers (Total users, Completed %, Avg Score, Overall Risk Level, Active Campaigns count). Each card maybe color-coded (e.g., risk level card might be green/yellow/red based on value, or use icons). Possibly clickable to drill down.

  * Next section: Graphs. e.g., a bar chart of completion by department, or a line chart of completion rate over time as deadline approaches (like an S-curve).

  * Another chart: maybe a donut of training status (like X% completed, Y% in progress, Z% not started).

  * If multiple campaigns, perhaps separate each or filter by current campaign. Could have a filter dropdown at top (“Viewing: 2026 Annual Training”). If so, all stats reflect that selection.

  * Leaderboard snippet or top 5 performers list could be included for interest or to identify champions.

  * Alerts panel: maybe on the side or top if any critical. Or an icon near header. Could show count of unresolved alerts. Clicking shows a dropdown list or navigates to an Alerts page.

  * Possibly news or tips from vendor (some admin dashboards show product updates or recommended actions, but optional).

* Navigation: Admin likely has a sidebar menu or top menu separate from user UI. Items: Dashboard, Users, Teams/Groups, Analytics (with subpages like topics, leaderboards), Content (if any management), Integrations, Settings. We should ensure the admin navigation is clearly distinct from learner (maybe a different color scheme to differentiate admin mode vs user mode).

* Admin might impersonate a user to see what they see – not explicitly in requirements but some systems allow. Not necessary to detail now.

* The design should be clean and information-dense but not overwhelming. Use clear headings for sections and tooltips on metrics to explain (like “Overall Security Readiness: A weighted score out of 100 combining completion and assessment performance .”).

**Admin User Management Page:**

* A table of users. Columns: Name, Email, Role, Group, Status (Active/Deactivated/Pending), Last Login, Completion % (maybe a progress bar for each user’s training progress, so admin can quickly see who is lagging). Could also include risk score per user if computed.

* Above the table: filters (by group, by status, by role). Search bar to find a user by name/email quick.

* Buttons for actions: “Add User”, “Import Users”, maybe “Deactivate Selected”.

* When clicking a user row: either goes to a user detail page or opens a side panel/drawer with their info (for quicker access).

* **User Detail**: shows profile info, possibly allow editing fields (maybe inline on same page if not too heavy, or a separate form if needed). Also show that user’s progress (like small summary: X of Y modules done, with list or timeline of their activities, and badges). Admin could use this to discuss with user or troubleshoot. Could also have a “Impersonate login” if needed to debug (with proper security checks).

* Bulk Import UI: likely a modal or separate page that says “Upload CSV of users”. Provide a template download. On upload, show preview of how many rows, any errors flagged. Confirm and then either show success with count imported and failures if any with reasons.

* Make sure long lists can paginate or infinite scroll.

* Accessibility: the table should be navigable via keyboard (arrow keys, etc., or at least tabbing cell by cell, though that is tedious, might allow exporting for accessibility or have alternate views). Possibly allow the admin to export user list to CSV right there too (some might prefer Excel analysis).

**Admin Analytics Deep Dive Screens:**

Potentially separate pages: e.g., “By Group”, “By Topic”, “Trends”, depending on how we organize. Alternatively, one analytics page with tabs. For instance:

* **Group Performance Page:** A table or list of groups with key metrics per group (like each row: Group Name, \# of users, % completed, avg score, maybe worst topic for that group). Could incorporate small charts like sparkline in each row if showing trend per group. Clicking a group opens more detail as described earlier (maybe navigates to a group detail page).

* **Group Detail Page:** Title “Sales Department Performance”. Show group-specific metrics: completion rate, avg score, maybe average vs company average (like a small indicator if they are above or below company average). Possibly list top performers in that group (to encourage internal champion identification). Could have distribution chart of scores within the group (like a histogram of their scores).

* **Topic/Assessment Analysis Page:** Show each major learning objective or content area, with average score and maybe quartile. Could use bar charts. For example, a bar for “Phishing” \= 92%, “Passwords” \= 85%, “Privacy” \= 70%, etc. Color-coded maybe by thresholds. If a bar is clicked, maybe see which questions or puzzles contributed (like show that the Clean Desk puzzle had 50% pass rate). That might require we log question-level performance. If we have that, great insight. Or at least see which room correlates (e.g., privacy low because Data Dungeon puzzles were missed a lot). Might highlight that specific puzzles had high hint usage.

* **Time Trend Page:** If training spans time or done repeatedly, show progress over time. Possibly a timeline of cumulative completion percentage if relevant. If a campaign runs Jan to Mar, a chart from 0 to 100% by date. Also maybe before/after comparisons: if we had pre-training assessment (not mentioned, but some training does baseline quiz), then the improvement after training can be shown. We didn’t explicitly include a pre-test, but it’s something to consider for measuring learning outcome. If present, show “baseline vs final knowledge scores”.

* **Export/Printing**: Many admin might want to print charts to show bosses. Should ensure charts render nicely for printing (light backgrounds if dark mode etc., or provide an export image function). The scheduled reports presumably cover that as well.

**Admin Report Builder Screen:**

* If we implement custom reports: it might be a form UI where admin picks variables. Possibly a wizard: Step1 select type (user list, group summary, raw data, etc.), Step2 filters (like date range, group selection, min score threshold?), Step3 format (PDF or CSV, graph or table). This might be quite advanced UI, maybe postpone; could just offer preset reports with minor filters.

* At least have a section where all generated reports are listed for download (and maybe scheduled ones listed with next run time).

**Admin Settings Pages:**

* Possibly one for Integrations: e.g., a page to set up SSO (upload SAML metadata, etc.), configure Slack webhook (enter Slack webhook URL or API token, and select which alerts to send). Also SCORM settings (if they want to import our content to an LMS, we might allow them to download SCORM or send xAPI – might not require UI beyond a button “Download SCORM package”).

* Another for Gamification Settings: toggles to disable leaderboards or badges if company culture doesn’t want it. Or to enable/disable certain badges as per earlier mention (like maybe disable the “Fastest solver” badge if they worry it encourages rushing). This could be a simple list of checkboxes.

* Notification Settings: admin chooses how to get alerts (email frequency, etc.).

* Content Settings: if they want to add custom slide or message somewhere, might do here. (For instance, after final room, show a custom policy acknowledgment – some might want that. Could allow adding a custom final step or additional reading material link).

* The UI for settings is typically form inputs, toggles, file upload for logos (for white-labeling – maybe they can upload their company logo to display on user UI).

* Ensure a Save button and show “Settings saved” confirmation. Possibly some actions might require restart of something (if SSO added, instruct to test it).

**Visual Design Direction:**

* **Overall Aesthetic:** Professional yet playful. Since target includes enterprises, it shouldn’t look kiddie, but can still be gamified (like modern, flat design with vibrant accent colors, some game-like iconography). Perhaps a tech-futuristic theme (neon highlights, dark background for game sections like a “hacker” vibe) mixed with clean corporate UI for admin. We might use a dual theme: Learner interface might have darker immersive theme (like a game), Admin interface a lighter theme for clarity in data. Or allow theme switching (dark/light) in settings which also helps accessibility for some.

* **Color Palette:** Likely a primary brand color (maybe a blue or teal to connote security/trust, or something energetic like orange). Secondary colors for accent (greens for success, reds for fail). Use consistent colors for certain concepts (e.g., phish theme maybe uses ocean blue, password theme maybe uses steel gray, etc., but not too many). Keep high contrast for text on background. Use color in graphs carefully with patterns or labels.

* **Typography:** Use a clean sans-serif for UI (like Open Sans, Roboto, or similar) for readability. Possibly use a monospaced or stylized font in certain puzzle elements (like code or hacker-themed puzzles could display in a “console” font to set mood). Titles can be slightly more stylized or bold. All fonts sized accessibly (base maybe 16px \= 1em and scale from there).

* **Iconography:** Use icons to complement text (like a shield icon for security, trophy for achievements, etc.). Possibly custom icons for each room (e.g., a key for Password Fortress, a fishing hook for Phishing Waters). Achievements might have specific icons (star, lightning bolt for speed, etc.). Ensure they have alt/title for accessibility. Use a consistent icon set style (feather icons or FontAwesome or similar) to maintain cohesion.

* **Imagery:** We can incorporate some thematic illustrations for the storyline (like in intros, maybe a cartoon hacker for the narrative, etc.). But not too heavy to avoid distraction. Could use background images lightly blurred behind content to set mood (like an office background in phishing scenario, or a data center for network, etc.). But ensure content overlays have solid backgrounds for readability. Possibly use CSS blur or dark overlay.

* **Animation principles:** Keep animations meaningful and smooth. For example, when a puzzle is solved, an animation of a lock opening or confetti is rewarding. Use easing functions to make them feel polished. Avoid extremely flashy or continuous animations that might annoy (and provide reduced motion option).

* **Sound Design:** If using sound, be subtle: a soft ding for correct answer, an alert sound for last 10 seconds, maybe background ambience in some rooms (like faint office noise in phishing room). But default volumes low. Provide a mute all toggle. And caption any important audio (like if a puzzle has a voice call to simulate vishing, provide transcript text as well).

* **Consistency:** All common UI components (buttons, modals, inputs) should follow a style guide (size, color, hover states). Gamified elements like badges should share a style (maybe badge icons have a colored border, same shape).

* **Responsive Adaptations:** On small screens, probably use a single column layout for most things. For game, some puzzles may be very hard on phone; we might display a message “for best experience use larger screen” but still make it functional if possible (maybe vertical stack content that was side by side, scrollable). Possibly limit video chat on phone to audio or one video at a time to save space (like tap to see someone’s video). Use CSS flexbox/grid to reorder panels for mobile (e.g., chat might collapse under the puzzle area with a toggle to open).

**Loading and Error States:**

* Each major action should have feedback. E.g., when launching a room, show a loading spinner with a fun tip (“Loading Password Fortress… Did you know the most common password is ‘123456’?” which is a relevant fact). Use this time to educate or amuse, since loading might be a second or two (especially if heavy assets).

* If an error occurs (like server fails to load puzzle), show a friendly error with retry. For instance, “Oops, failed to connect to game. Check your internet or try again.” Maybe an error code for tech support. In team context, if someone’s connection fails, the others get a notice and maybe the game auto-pauses for a short time to allow reconnection.

* When saving data (like on form submission in admin), show a small spinner on button and then success toast (“User added successfully”).

* Use toast notifications or banners for ephemeral messages (like “Reminder email sent” as a brief toast). Ensure they are announced to screen readers (use alert roles).

* For validation errors, highlight fields in red and give specific messages. Focus on the first error field on submit failure.

**Misc Accessibility UI details:**

* Always indicate focus on interactive elements (use Tailwind’s focus:ring etc. to show outline). Possibly use a distinct high-contrast color for focus (like the standard outline or a brand color plus some glow for dark background).

* Provide skip links if page has consistent nav (like skip to content on dashboard if we have a nav menu repeated).

* On admin data tables, might allow toggling to a simplified view for screen reader (maybe a CSV download that they can open in Excel if their screen reader works better there, or an alternate list view).

* All buttons and icons should have tooltips or ARIA-label if icon-only. E.g., a trash icon for delete must have aria-label=“Delete user”.

* Ensure dynamic content updates are announced or at least easily findable. For example, if user filters in admin, the table refreshes – maybe better to announce “Filtered results updated”.

* Test keyboard navigation thoroughly: can a user go from login to finishing a puzzle using only keyboard? (May require adding key controls in puzzles, which we plan to do for drag-drops etc.)

* Provide textual alternatives for any graphical puzzle. This is perhaps the hardest. If a puzzle is inherently visual (like “Spot what’s wrong in this picture of a desk”), for a blind user we might need to provide an alternate question (“Which of the following is a security issue at a workstation?” with multiple choice answers gleaned from that picture). Perhaps a separate accessible mode that switches some puzzles to quiz form. This might be needed for full WCAG compliance. Possibly we include an Accessibility Mode toggle globally which if on, uses alternate content where needed (like no drag-drop but lists, etc.). It’s a lot of content duplication but important for those users. At minimum, do not lock them out.

This section ensures the front-end experience is well-defined for both learners and admins, covering typical usage and edge cases. Next, we address the content creation framework, integrations, compliance, and business context to complete the PRD.

# **Content Framework**

CyberSafe Escape’s effectiveness hinges on high-quality educational content. This section outlines how learning content is structured, managed, and updated in the platform.

## **Learning Content Types**

The platform will employ diverse content formats to cater to different learning preferences and reinforce key concepts. The types of content we’ll use include:

* **Interactive Puzzles & Simulations:** (Core content) These are the primary method of teaching in each room. Instead of static lessons, users learn by performing tasks and solving problems (already detailed per room in Game Design). This includes simulated email clients, drag-and-drop classification, mini-games, etc. Each interactive element is essentially content \+ functionality combined. They incorporate learning points contextually (e.g., an explanation pop-up after solving).

* **Instructional Videos:** Short videos can set context or explain concepts in engaging ways. For instance, at the start of each room (or campaign), a brief 1-2 minute video might introduce the theme/story and key ideas. Or a video could play after a puzzle as further explanation. We should keep videos short (under 3 minutes ideally ). If using videos, we must provide captions and maybe a transcript for accessibility. Videos can be cartoon animations (to keep fun) or real-life demos (like showing a real phishing example). Possibly we have one at the very end as a conclusion/wrap-up as well.

* **Knowledge Check Quizzes:** After some interactions or at certain points, a straightforward quiz question can reinforce knowledge. We integrate these as part of rooms or at end of room. For example, after Room 3, a quick 3-question quiz on data classification. Format: multiple-choice, true/false, or matching. They serve to ensure the user retains key facts (and can be reported for assessment results). In SCORM/xAPI context, these can map to scored questions.

* **Practical Exercises:** Some content might simulate actual practice, e.g., “Open a provided password manager and create an entry.” In an online context, we simulate within the game. But perhaps we also encourage real-life action: e.g., “Now, take a moment to enable MFA on your actual work account” (though outside our system). That might be beyond scope since we can’t verify, but we could mention as part of content or bonus tasks.

* **Scenario-based Simulations:** Particularly in team rooms, we create scenarios (like the Incident Response simulation, which is a type of scenario content). This overlaps with puzzles, but is more narrative-driven. We treat it as content that involves user decision-making (branching possibly). E.g., in IR, if they choose wrong containment action, scenario content changes (system announces the malware spread). These branching scenarios need to be written out and coded.

* **Reference Materials:** Possibly provide in-game or separate references, like a “Security Handbook” link with definitions. E.g., a glossary of terms (what is phishing, what is GDPR). Some learners might want to read more. We could include a side library accessible throughout (maybe a “Resources” button that opens a drawer with articles or cheat sheets). Also useful if someone is stuck, they could read hints or lessons. If these references are text content (or PDFs), ensure they can be updated easily (maybe stored as markdown or PDF in the system).

* **Interactive Tutorials:** A step-by-step guide that walks a user through something. For example, a mini-tutorial at the start showing how to play (like “click here, now do that”). This could be a guided overlay or a specific tutorial room as mentioned. It’s content in the sense of teaching how to use platform rather than security concept. We should have at least a quick tutorial overlay at first login.

* **Deep-dive optional content:** Some advanced users or curious ones might want more beyond basics. Perhaps after finishing, we unlock optional modules (like short lessons on specific threats). Or provide links to external content (like SANS reading, or NIST guidelines summarized). This optional learning concept is present in some systems . Could integrate with a “Library” where user can browse these on their own (like KnowBe4 has optional learning library). For MVP, maybe just a section in profile “Additional Resources” with some links.

* **Story Narrative:** Not a traditional content “type”, but we have narrative text and potentially character dialogues in some rooms (like Insider Threat Theater might have conversation transcripts as content). Writing these narrative elements is part of content creation. They should be engaging and realistic enough. It’s essentially script content to be displayed or voiced.

Each content piece (video, quiz, reference) should tie back to objectives and ideally be trackable (quizzes definitely track, video completions maybe optional to track if needed for SCORM completion measure, but not critical if not mandated). Interactive puzzles inherently track via their outcomes.

## **Content Versioning**

The content will evolve over time (new threats emerge, improvements, etc.), so we need strategies to update content without disrupting user progress:

* **Content IDs and Versions:** Each puzzle, quiz question, etc., will have an ID and a version number. The platform should allow multiple versions to exist if needed. E.g., “Phishing email puzzle v1.0”. If we update that puzzle (say change emails, or text) in a new release (v1.1), we should decide what happens to ongoing sessions or past records. Typically:

  * If a user is mid-way through old content when we update, ideally let them finish that attempt with the old content (so maybe we only roll out new version for new sessions). Achieved by not changing content definitions in the middle of a session. If using a DB, we could keep old version active for those in progress, but since sessions are short, probably not an issue. If update is at large scale (like between training cycles), easier.

  * After update, new sessions use new content.

  * For results tracking, if we changed the number of questions, etc., the completion criteria might change. We should ensure the modifications either don’t retroactively affect completed status or we handle conversion.

* **Backward Compatibility:** If we aim to maintain SCORM/xAPI, a major content change might require a new SCORM package version. But since our system is centralized, we can just deliver updates. However, enterprise might want consistency in a campaign – presumably, we wouldn’t drastically change content mid-campaign. Most likely content updates go into effect for the next campaign/training roll-out. For e.g., we run 2025 training and then update content for 2026 run.

* **A/B Testing** (optional advanced): Perhaps we want to test two versions of a puzzle to see which is more effective (like one style vs another). We could implement that by flagging content with variant labels and randomly assigning some users to variant A vs B. That requires tracking at user level which version they got (to not confuse them if they restart). Could be heavy, maybe not for MVP, but planning wise:

  * Achieved by content versioning and user assignments, maybe at org or user level as needed.

  * Use-case: testing a new gamified element. This is a could-have, not necessary initial.

* **Hot Fixes:** If a content error is found (like a typo or a question error), we should be able to update it quickly. Since content might be stored in DB or config files, we just change it. Minor textual changes likely not a problem. If it’s something that affected scoring, maybe re-evaluate scoring (if someone lost points due to a bad question, we might manually adjust or just accept it; or admin can decide to allow retake). Usually not automated.

* **Content Expansion:** We may add new rooms or bonus levels in future. The system design should ideally accommodate more modules. For example, perhaps in 2027 we add a “Ransomware Vault” bonus room. The PRD now is 6 fixed rooms, but making it data-driven (like a Room table as we have) means adding a room is possible. UI should maybe not hardcode the number 6, but for initial it’s fine.

* If new room added after a user finished everything, their completion % becomes less than 100 until they do new one. If it’s optional, we can mark optional. Should plan for that: possibly have concept of required vs optional modules. Could mark new ones optional for those who already have certificate. For new learners, include it.

* **Localization/Translation Versioning:** Content updates need to propagate to all languages. Use a workflow where original content changes flagged and translators update the localized text. We must ensure content management system (CMS) or process accounts for updating all languages consistently. For instance, if we store text in a resource file per language, updating English means the Spanish file has an outdated entry that needs translation. The system could default to English if no translation, but better track it. Possibly keep a language key list and have a translation pipeline (maybe outside the scope of the platform code, more process). But might consider using i18n frameworks that note missing keys.

## **Content Administration**

We should consider how an admin or content manager will manage the content:

* **Content Management Interface:** Possibly a back-end interface (could be admin UI if we grant content editing rights to certain roles) where they can:

  * Create or edit quiz questions (like add a question to a room’s quiz bank).

  * Edit text that appears in puzzles or intro/outro narratives.

  * Upload media (images, videos) that are used in content. E.g., update the phishing email examples by uploading new screenshots or text.

  * Manage hints (maybe input hint text for puzzles).

  * It’s somewhat like a mini-LMS authoring tool but specialized for our game. Building a full UI for it is heavy, might not be in initial scope unless they strongly need customizing.

  * Possibly schedule content availability (like they can hide certain content if not needed or sequence it, as part of campaign scheduling).

Given the timeframe, perhaps content updates are done by developers or via config files, not via admin UI at first. But the PRD suggests some customizing possible (the product claims adjustable environment to company guidelines ). That indicates we might allow customizing certain content bits to include company-specific info (like maybe in the final room communications, include the company’s incident response number, etc.). That means:

* Provide a UI or config to input company-specific references. E.g., an admin can fill in: “Company Security Email” and then the game puzzles or hints incorporate that (like in phishing room, the correct action might be “Report to security@company.com”, which might differ by org).

* Another example: if a company has a specific policy name or procedure (like they call their clean desk policy “Clear Desk Standard”), maybe allow them to insert such reference. We can do find-replace in content strings if we designate placeholders for such things.

* A simpler route: text customization might be a feature (like a dictionary of terms). But that’s a nice-to-have probably later.

**Content scheduling and expiration:**

* If content should only be active for a period (maybe if we license certain modules), we might want an end date to disable. Or if we do seasonal events (like a Halloween-themed bonus puzzle), we enable it for Oct then hide. Our content data model can have an is\_active and possibly available\_from / available\_until. The UI would then show/hide accordingly.

* For core content, likely always active. But if we produce new updated modules each year, maybe admin can choose which year’s scenario to use. Or keep both.

* Possibly, if an organization has multiple training tracks (like a basic and advanced), they could choose which modules to include in their campaign. For now, it’s one track for all. But thinking ahead, content admin might allow toggling modules (like if one org doesn’t care about insider threat, they skip room 5 – but probably not recommended as it’s important. But maybe some content more relevant to enterprise than K-12 and vice versa, e.g., data privacy (GDPR) might not be taught to K-12 kids, so a school admin might want to skip that room). We could allow them to mark a room optional or off. That should be considered: maybe have a default track and allow removing a module from a campaign if needed. Then the content not shown to users in that org campaign.

* **Custom Content Upload for Organizations:** The prompt suggests admin might want to add their own content. For example, a company might want to insert a slide about their specific policy or an extra quiz question about their internal procedures. We should support adding at least a page or a question:

  * Possibly after a room or at end, allow admin to define a “Custom Quiz” or info page. Perhaps in admin settings: “Add Custom Lesson”. They can input text, maybe a PDF attachment or a video URL, and optionally add a quiz.

  * Then for users in that org, after completing our 6 rooms, they’d get an extra section, or integrated within one of the rooms if specified.

  * Simpler: have a separate module slot reserved for custom content. E.g., a “Room 7: Company Specific Training” which by default is empty, and the admin can fill with whatever (like Q\&A about their policies). This would be treated like any other room for completion, just content is admin-provided.

  * Implementation: likely just static content with maybe a couple of quiz questions, not a whole interactive game (they won’t create puzzles, just upload static or small quiz). That’s acceptable because it covers compliance bits not in our game.

  * We’ll ensure any custom content still yields completion data (like if they have a quiz, record results).

**Workflow for updating content:**

* If it’s developer-driven, they’d update DB or code and deploy new version to all.

* If admin-driven minor customizing, they do via UI and it updates relevant DB entries flagged as custom for that org. For example, maybe a OrganizationContent table linking org and a content item override (like override text in hint or override a quiz question or add a slide).

* We’ll mention that potential in spec, but actual implementation maybe in Phase 4 (Enterprise custom content).

**Quality Assurance of Content:**

* All content changes should be tested thoroughly (especially puzzles which could have logic bugs). Perhaps maintain a staging mode where content creators preview the new version (like an admin can try the updated puzzle not yet pushed to users, maybe by setting a version flag).

* Provide ability to quickly fix typos via admin for surface content (like text in hints, question phrasing) to reduce need for dev deployments for trivial changes.

**Localization Considerations:**

* We’ll have to manage content translation. Possibly use an external service or some translation management tool. In-app, ensure content can load dynamic language packs.

* For custom org content, if org is multilingual (rare, usually each user uses one language), admin might need to provide translations for their custom bits too.

This covers how content is structured, varied, updated, and potentially managed by admins, ensuring longevity and adaptability of the training.

# **Integrations**

CyberSafe Escape is designed to integrate smoothly with enterprise and educational ecosystems. Key integration areas include authentication (SSO), learning management systems (LMS), communication tools, and HR systems. Here we outline how each integration should function and any standards to comply with:

## **Single Sign-On (SSO)**

Many organizations will require SSO so users can authenticate with existing credentials:

* **SAML 2.0 Support:** We will implement SAML 2.0 for federated SSO, as it’s common in enterprises. Our application will act as a *Service Provider (SP)*. Admins should be able to configure an Identity Provider (IdP) such as Azure AD, Okta, ADFS, OneLogin etc.

  * Provide an SP metadata file or details (Entity ID, ACS URL, required attributes) that admin can plug into their IdP. For instance, ACS (Assertion Consumer Service) URL might be https://app.cybersafeescape.com/auth/saml/acs and EntityID maybe cybersafeescape.com.

  * Support signing and encryption as needed (likely require IdP to sign assertions at least).

  * The attributes needed from IdP: unique identifier (NameID or email), perhaps first name, last name, and possibly group/department (could map to our Group assignment). If not provided, we can let admin manually map later or fill from CSV.

  * The flow: On hitting login, user could choose “Company SSO”. We either redirect them to IdP (based on perhaps subdomain or email domain detection) or present a discovery if multiple SSO configs. Once SAML response is posted back, we create/find user by NameID (like email) and log them in (issue our JWT). If a user doesn’t exist yet, auto-provision if allowed (just create account with role default user and association to org known from SSO context). Possibly assign to a Group if IdP sent a group/role attribute (mapping defined in config).

  * Must handle SLO (Single Logout) if required: not always used, but we can support if IdP requests logout, we clear session.

* **OAuth2 / OIDC Support:** Particularly for Google Workspace or Microsoft 365 integration:

  * Google OAuth: Many schools use Google accounts, so enabling “Login with Google” is useful. We’d use their OpenID Connect (which is built on OAuth2). Implementation: user clicks Google login, goes to Google consent, we get back an ID token with user info. Trust that (verify signature) and log user in / create account. We need to map Google domain to an organization to know where to put the user. Possibly domain name can key to an org (e.g., if their email is @school.edu and that domain is configured to org “School District 123”). So admin must pre-configure accepted domains. Alternatively, only allow Google sign-in for one domain by customizing the client keys per org. Could keep it simpler by requiring email domain match. If not match any known org, reject or create a new org if it’s a self-serve sign-up scenario (less likely in enterprise context).

  * Microsoft OIDC (Azure AD): Many enterprises have Azure AD which can do SAML or OIDC. OIDC with Azure AD can be simpler (just need tenant ID config). We’ll support if needed. The admin would provide their Tenant ID or Enterprise App config details, we use those to allow “Login with Microsoft” for that org. That flows similarly to Google.

  * Generic OIDC: Possibly support any OIDC provider (Okta has OIDC too). But SAML covers Okta as well.

  * The UI likely will show relevant buttons dynamically. E.g., if an org is configured for SSO, the login page after user enters email might show “Continue to SSO” or auto-redirect. Or if multiple (some companies allow either SSO or local accounts, in that case show both options).

  * Technical: Use passport.js or similar libraries to handle strategies, or implement manually given these are standard flows.

* **Active Directory/LDAP integration:** For on-prem AD that might not use SAML. Typically we’d prefer SAML/SSO rather than direct LDAP binds for a cloud app (since firewall issues). But maybe for some closed deployments (like on-prem installation at a school), they might want to connect to AD via LDAP. We could allow synchronizing users: e.g., admin enters LDAP connection info (server, base DN, credentials) and we fetch users or authenticate against it. This is complicated for a cloud-hosted multi-tenant scenario. Perhaps out-of-scope for initial (SAML covers AD via ADFS anyway). If needed, we could supply an on-prem AD sync utility that calls our API to create users. For now, we consider SAML solution primarily.

**Testing & Security for SSO:**

* We need to test SSO with major IdPs (Okta, Azure, Google).

* Use proper certificate management for SAML (admin will upload IdP signing cert, we store it). Possibly allow metadata XML upload to auto-configure.

* Ensure SSO bypasses password login to avoid confusion (or at least instruct users to use SSO if that’s policy).

* Also support scenario: one org might have both SSO and a few external accounts (like maybe contractors who don’t have AD accounts). We allow both, but admin might not want that for security. Could have a setting “Enforce SSO only”. If on, then the login page for that org basically only presents SSO option.

**Google Workspace integration:** (beyond login) They might want group sync from Google or something. Possibly out-of-scope, but at least login is covered by above.

## **LMS Integration**

Many enterprises track training in their LMS. We should ensure our platform can integrate or at least exchange data with LMSs:

* **SCORM 1.2 and 2004 Compliance:** The SCORM standard allows packaging e-learning content so it can be uploaded to an LMS and track completion.

  * We can create a SCORM package that either encapsulates a proxy to our game or at least marks completion. Possibly the SCORM package is a thin wrapper that launches our app in a new window and communicates back via SCORM API.

  * Option 1: **SCORM wrapper**: A SCORM 1.2 package that consists of an HTML/JS file which calls the SCORM API LMSInitialize and then redirects to our platform (maybe with an auth token or something to identify user). The user plays on our platform, and at the end, our platform can call back some endpoint or the SCORM API via the opened window. We might need to script that, or perhaps easier: our platform can call an external JavaScript function that is present in the SCORM wrapper window to set completion. Possibly an approach: The SCORM wrapper opens our game URL with an extra param that instructs the game to notify opener on completion (using window.postMessage, for example). On completion, game does window.opener.postMessage("completed", "\*"). The SCORM wrapper catches that message and then calls LMSSetValue("cmi.core.lesson\_status", "completed") etc., then LMSFinish.

  * We need to supply the SCORM to clients to upload. We should test it in some LMS (Moodle, SCORM Cloud, etc.).

  * SCORM 2004 is similar but has more tracking options (score, interactions). We might implement basic pass/fail and score reporting. For example, after finishing the 6 rooms, we can set a SCORM score (like percentage correct across quizzes or just 100 if finished). Our app would need to have that data to pass. Possibly easier to just mark complete if finished, and not worry about detailed scoring in SCORM, because our internal analytics do that. But some LMS might want a numeric score. We could define 100 as passed, 0 as not, or average quiz score as the score. Admin can decide if passing threshold needed (like they must get \>80 score to be considered passed in SCORM context). This we might need to allow. But likely if they complete all, they pass.

  * This approach allows the training to be launched from the LMS course list. Downside: user might have to login again in our app if SSO isn’t seamlessly integrated. Ideally, if LMS and our app share SSO (like both use SAML with same IdP), it might not prompt again, or we could accept an LMS-provided token. Some LMS allow passing user info via launch parameters (especially if using LTI, see below).

  * Document how to use: provide the package and a guide to admin to upload it as a SCO in their LMS and set up completion tracking.

* **xAPI (Tin Can) Support:** xAPI is newer and allows capturing granular learning records in an LRS (Learning Record Store). Many modern systems support it.

  * We can generate xAPI statements for key events: e.g., “Experienced module”, “Completed module”, “Answered question X correctly”, etc. If a customer has an LRS, they might want our platform to push statements to it. Possibly how:

    * Config: Admin enters an LRS endpoint, credentials (basic auth or OAuth), and maybe actor identification info. Then our system will send statements.

    * Alternatively, if their LMS is xAPI-enabled, it might launch our content via an xAPI Launch link with an endpoint & token, and our content must use that to send statements. There’s concept called “Tin Can launch”. Could implement if needed. Might be complex, but for completeness:

      * If launched from LMS, the LMS can provide an actor (the user), endpoint (LRS URL) and auth (token) to our content (through URL params or a JSON config). We then use an xAPI library to report statements to that endpoint.

      * Statement examples: “User X completed CyberSafe Escape training with score Y” (verb: “completed”, object: activity id for the course, result: score, success: true). We can also send intermediate statements like “passed room 1”, “earned badge Y” if of interest. But likely just pass/fail of whole thing and maybe individual module completions if they want. We should at least send one final statement for completion.

    * If not launched from LMS and admin just wants data in LRS, we can send via our side to their LRS whenever events happen. That requires stable connectivity and error handling (maybe queue and retry if LRS unreachable).

  * This integration should adhere to xAPI spec formatting. Use unique identifiers (maybe an IRI for our course, e.g., urn:x-cybersafeescape:training or a URL representing the content).

  * For simplicity, we might not do full xAPI in MVP, but it’s a must for enterprise nowadays to have some solution. If not immediate, note for Phase 4\. But at least plan the data: each room can be an Activity with an ID, the whole course is an Activity, etc.

* **LTI 1.3 (Learning Tools Interoperability):** LTI is common in academic LMS (Canvas, Blackboard, etc.) to embed external tools.

  * LTI 1.3 uses OIDC and JWT for launch. If we support LTI, a teacher can add our platform as an external tool in their LMS course.

  * When a student clicks it, the LMS will send a launch to us with a JWT (which includes user identity and context like course). We would need to trust that (validate signature with LMS public key) and create a session for that user.

  * Then we can either handle grade return via LTI if needed (for example, after completion, send a grade or completion status back to LMS gradebook).

  * LTI 1.3 is quite complex but becoming standard. If educational institutions are target, implementing LTI makes adoption easier. Could be in enterprise too if they have an LMS like Skillsoft or SumTotal that supports LTI.

  * In LTI, the notion of content packaging is different – it’s more like dynamic linking. But we could treat each room or entire set as one tool link. More likely they’d integrate entire course as one tool. Then usage: teacher sees which students clicked it. Grade return: we could send pass/fail or a score to LMS via IMS outcome service or line item.

  * Possibly out-of-scope for initial, but important for educational market. Mark as Phase 4 or Phase 5 if more specifically requested. But mention that architecture can accommodate (i.e., our platform can map LMS user to our user by some stable ID like LTI user ID or email).

  * LTI advantage: user doesn’t need separate login at all, and no separate packaging needed, it’s real-time. We should aim to have either SCORM or LTI to integrate seamlessly.

  * Implementing both SCORM and LTI might be heavy. Possibly do SCORM for corporate and LTI for schools if needed.

**Summary of LMS integration plan:**

Focus on:

* SCORM package for basic completion tracking.

* If possible small set of xAPI statements for those with LRS.

* LTI maybe later but mention feasibility.

We should provide support documentation and maybe a testing harness (like use SCORM Cloud to ensure our SCORM works, use an LTI test tool to ensure LTI).

## **Communication Tools Integration**

To increase engagement and embed training reminders in tools employees use daily:

* **Slack Integration:**

  * Use case: send notifications or allow certain interactions via Slack. Possibly:

    * Notify a user or a channel when a team is formed or when someone completes training, etc. More likely: remind users to complete training via Slack DM or mention.

    * Provide a Slack command or app where a user can check their status (“/cybersafe progress” returns a snippet).

  * Implementation: Slack has an API for sending messages (webhooks or Slack app). Simpler: allow admin to set up a Slack Incoming Webhook to a channel for notifications (like “\#security-awareness”). Then our system can POST a JSON message when triggers like “50% of company completed” or “Alice finished training with top score”. That covers broadcasting achievements or deadlines.

  * For individual DM reminders, Slack app would need to be installed and authorized per user. Possibly too complex for initial. Could do email for direct reminders instead.

  * However, Slack might allow an admin to send a message to specific user ID via API if the user authorized or if using an org app with appropriate scopes. That requires user mapping (our user \-\> Slack user id). Maybe using email match.

  * If time, a minimal approach: daily or weekly summary to a Slack channel, and a congratulatory message when training ends (like “Congrats to Alice for finishing CyberSafe Escape\! 🎉”).

  * Also Slack could be used to help team collaboration: e.g., if our platform issues a unique link to a team room, a team might share it in Slack to gather. Not exactly integration, but usage pattern. Could incorporate a “Share team code via Slack” button that opens a Slack message compose with that code (there is Slack deeplink or API for posting on user behalf if authorized, likely not needed).

  * Setup: Admin would provide Slack Webhook URL for channel notifications. We store it and push notifications accordingly. For more interactive Slack app, not in MVP.

* **Microsoft Teams Integration:**

  * Similar approach. Teams can receive webhook messages (Incoming Webhook connector). We can send a JSON card or simple text. Possibly format as an Adaptive Card with some info (like leaderboards top 3? maybe just keep it simple).

  * Alternatively, Teams bots could DM users, but again requires Azure bot setup and user mapping. Possibly beyond initial scope.

  * So minimal: support Teams channel webhook for reminders and announcements. Admin config by adding a Teams incoming webhook and inputting URL in our integration settings.

* **Email Notification System:**

  * Although not as “modern”, email remains fundamental. We’ll implement email notifications for:

    * Training assignments (when a campaign starts, each user gets an email “You have been enrolled, due date etc.”).

    * Reminders (maybe a week before due, and day of due if not completed).

    * Completion (send certificate or confirmation to user).

    * Admin alerts can go via email as well (like to admin if low completion or to manager if their team behind).

  * Use a mail service (like SendGrid or AWS SES) to send reliably. Templates for each scenario, perhaps customizable by admin (like add their logo or custom text).

  * Ensure to comply with any privacy, allow opting out if needed for optional notifications (not likely need since it’s internal communications).

  * Use ICS calendar invites? Possibly not needed, but for scheduled team sessions maybe send a calendar invite to team members (cool idea: if admin schedules a team training session at a time, send an Outlook/Google calendar event. This is deep though).

* Possibly integration with **Calendar** (like Outlook or Google Calendar) for reminders or scheduling: as above, maybe not initial.

The focus is Slack/Teams because that was specifically mentioned. We’ll implement at least a way to push notifications.

We must also ensure any integration respects data boundaries (like Slack messages shouldn’t reveal sensitive data beyond needed; e.g., not broadcasting quiz scores with names unless intended/explicitly configured). Usually these notifications are generic or praising.

## **HR/SIS Systems Integration**

Integration with HR (Human Resources) systems or SIS (Student Information Systems) primarily for user provisioning and tracking training completion in employee records:

* **API for User Provisioning:** If the company doesn’t want to manually add or CSV import users, they might want to automate via API. For example, when a new employee is added in HR system, they call our API to create user.

  * We could expose a REST API endpoint /api/v1/admin/provisionUser which, if given proper auth (like an API key or service account token), allows creation/updating of users. The HR system (like Workday, SAP SuccessFactors, etc.) could call that as part of onboarding flow.

  * Alternatively, implement **SCIM 2.0** (System for Cross-domain Identity Management), a standard for user provisioning. Many IdPs (Okta, Azure AD) support SCIM to sync users into apps. If we support SCIM, an admin can set up their IdP to push user info (create, update, deactivate) to our SCIM endpoint automatically. SCIM is quite involved but well-defined. Possibly a later feature, but mentionable. SCIM would allow e.g., Azure AD to automatically create accounts in our system for all users in a certain group.

  * For MVP, maybe a simple REST with a secret token might suffice for some integration, but SCIM is a Should for enterprise readiness.

* **Webhooks for completion events:** The HR system might want to know when someone completes the training to update their record. We can allow configuration of a webhook endpoint (like an HR system endpoint or a custom script) that we will POST to when a user completes training (with user ID/email and maybe result). Then they can mark training done in HR or maybe trigger awarding a certificate in their internal system.

  * Alternatively, some HR systems ingest xAPI or CSV. If not hooking directly, admin can export a completion report from our system (some do that manually).

  * But automated: definitely either email HR or webhook could do. Probably a generic webhook is better. We should secure it (maybe include a header with a signature or require HTTPS).

  * If multiple events needed, maybe allow selecting event types (like “completion”, “user created”, “user deactivated” etc). Minimally “completion”.

* SIS (Student Info Systems for K-12/higher ed):

  * They often want to integrate with Clever or ClassLink or similar for rostering and SSO. Possibly out-of-scope for initial, but mention:

  * Many schools use Clever, which does SSO and roster sync (similar to SCIM but educational context). If we consider K-12 as target, hooking into Clever would ease adoption. That might be a long-term integration.

  * For now, SIS integration might be just via CSV import of class rosters, which we already handle. Or an API if their SIS can call ours to add student accounts. But not focusing heavily on that in PRD except noting it’s possible.

* **Active Directory Sync** (if not via SSO):

  * Some might want a nightly job from AD to update our user list. This could be done via SCIM (Azure AD can do SCIM easily) or our API. If needed, we can provide a PowerShell script example connecting to our API, etc. It’s more an IT integration scenario.

* **Completion Certificates in HR**:

  * If needed, we can provide certificate PDFs automatically or via API to HR. Maybe not, likely HR just needs a flag. They might attach certificate in their system manually if needed.

Summarily, ensure our system can integrate into their user lifecycle:

* Onboard: user automatically created (via SCIM or API)

* Offboard: user deactivated or deleted when HR marks them left (via SCIM or API).

* Achievements: training completion recorded back in HR (via webhook or admin can download evidence).

We’ll mark SCIM and deep integration as could-haves; initial maybe manual or basic API.

Finally, we should mention our API can be used by customers to pull data if they want to integrate with BI tools:

* E.g., a GET /api/v1/reports/completion could be used by an internal dashboard. If we foresee that, we might allow API keys for such read-only access. It’s not explicitly in prompt, but often asked by enterprises. Possibly mention in passing that an API can allow retrieving raw data (like a list of who completed).

This covers how we connect with external systems, ensuring our platform fits into existing IT environments seamlessly.

# **Compliance & Privacy**

CyberSafe Escape must adhere to various data protection, accessibility, and security standards, especially given its target audiences. We outline compliance measures for data privacy laws, accessibility regulations, and security frameworks:

## **Data Privacy**

We handle personal information (names, emails, performance data) of users, so compliance with privacy laws is paramount:

* **GDPR (EU General Data Protection Regulation):**

  * Our platform will designate a data controller (likely the organization using it) and we act as a data processor in many cases (if hosted by us). We must enable organizations to fulfill data subject rights. Key points:

    * **Consent & Lawful Basis:** For employee training, typically lawful basis is legitimate interest or contractual requirement, but if we ever collect extra data (like optional profile fields), we may need consent. We will not collect more PII than necessary (name, email, maybe group). If any tracking beyond training performance, we inform users (via a privacy policy).

    * **Right to Access:** Users (or their org admin) can request all data we have on them. We’ll implement either an automated export or an admin function to compile user data . Likely, admin can click “Export User Data” to get a JSON or CSV of that user’s personal data (profile info, progress, achievements, etc.). Also, a user themselves via profile could request or auto-download their data, but maybe better to route through admin depending on tenancy.

    * **Right to Erasure (Right to be Forgotten):** If requested by a data subject (and no overriding need to keep the data), we must delete their personal data . Implementation: Admin can delete a user which will remove or anonymize their data. We’ll ensure deleting a user removes identifying info from our active DB. For audit logs or aggregate stats, we might anonymize (e.g., keep their results in aggregated form without name). Also if a student graduates or employee leaves, likely admin will deactivate and eventually delete them per retention policy. We’ll provide means to permanently delete on demand.

    * **Data Portability:** Provide user data in a commonly used format (JSON/CSV) so it can be transferred. Our export covers that.

    * **Data Minimization & Purpose Limitation:** We only store data needed for training. E.g., no sensitive personal identifiers (like no SSN, no home address, unless required, which it’s not). Only job-related minimal info (maybe department). We won’t use data for purposes outside training (like we won’t sell data, etc.). All usage is documented in privacy policy.

    * **Retention Policies:** Under GDPR, keep personal data only as long as necessary . We’ll allow organizations to configure retention (e.g., remove personal data after X years). Possibly have an automated purge of, say, user performance data after 2 years unless needed. But often companies want training records for compliance for some time. We’ll coordinate retention with them. Provide admin ability to purge old records (like all data older than 5 years) if they request.

    * **International Transfer:** If our system is global, GDPR requires appropriate safeguards for transferring EU data to US, etc. We’ll likely host data regionally if needed (like EU customers can choose EU server). If not initially, at least mention compliance via standard contract clauses or something. This is more legal than technical, but one technical measure: allow separate DB for EU to avoid transfer.

  * We’ll publish a Privacy Policy clearly stating what data is collected (name, contact, usage data), how it’s used (to deliver training and measure performance), and with whom it’s shared (maybe with the user’s employer/educational institution, not third parties except sub-processors like hosting providers).

  * Implement a cookie consent if needed (we might have cookies for session or tracking; for purely necessary ones like session, no consent needed beyond notice; if we had any marketing or optional cookies, we’d ask consent).

  * Appoint a Data Protection Officer or contact info in policy.

* **CCPA (California Consumer Privacy Act):**

  * Many requirements overlap with GDPR, but specifically:

    * Provide California consumers the right to know what personal data we collect and how it’s used (addressed via Privacy Policy disclosure).

    * Right to request deletion (we cover via our deletion process).

    * Right to opt-out of sale of data: We do not sell data, period, so that’s fine. We’ll explicitly state we don’t sell personal info . If we ever had a scenario akin to “sale” (like providing data to a third-party aside from processing), we would provide an opt-out link. Likely not applicable as our business model is subscription, not data monetization.

    * If user under 16, need opt-in to sale. Not relevant as we don’t sell.

    * We’ll treat “Do Not Sell” signals accordingly (should just be no effect since we don’t sell).

    * Ensure no discrimination if someone exercises rights (like if someone opts out of something, still let them use the service unless the data was strictly necessary).

  * Also CCPA requires a way to contact for requests (likely the admin of their org will handle it or they can contact us directly via support).

  * If we have users under 13 in CA (K-12 student), COPPA and additional parental consent issues come but usually schools can consent on parents’ behalf for education use. We’ll mention COPPA in context of FERPA perhaps.

* **FERPA (US Family Educational Rights and Privacy Act):**

  * If used in K-12 or universities, student educational records are protected. Our training performance data could be considered an educational record if schools use it in determining something about students. But likely it’s just an enrichment activity. Still:

    * We should allow that schools (which act as custodians of student data) have control. They likely need to get parental consent if minors use it, unless it’s considered a normal curricular activity.

    * We should sign agreements as needed and ensure we use student data only for the intended educational purpose, not for any other purpose.

    * If a parent requests to see or delete their child’s data, we must comply via the school. Possibly similar to GDPR for minors, but likely the school would request it and we comply.

    * Data security must be strong (which we have).

    * For minors, be extra cautious not to collect unnecessary personal data (like maybe we don’t even need full name, could use student ID or pseudonym as long as teacher can map it \- but names are fine typically).

  * Essentially, we must not disclose student performance or personal info to anyone except authorized school officials. So our analytics for a school environment would only be accessible to teachers/admins of that school, not public.

  * Possibly allow anonymized results if showcasing leaderboards in class, etc., but that’s at teacher’s discretion. The product should by default not share one student’s performance to other students (unless as part of team where they see each others interactions, which is collaborative not grade).

  * We likely should sign a FERPA compliance statement / school data privacy agreement (but that’s legal doc).

  * If integrated with school SIS, handle data accordingly and remove when no longer needed (like if student leaves, etc.).

* **Data Security & Breach Notification:** Not explicitly asked, but as part of compliance we should mention:

  * We’ll encrypt personal data in transit and at rest. If any sensitive fields (like passwords, obviously hashed, etc.).

  * We’ll have processes for detecting and responding to data breaches and will notify customers (the organizations) within a required timeframe (GDPR says 72 hours if serious).

  * We’ll log access to data for audit if needed (maybe not user-level access logs by default, but administrative access can be logged).

* **Data Hosting Location:** Some places require local data storage (like EU data not leaving EU, etc.). Possibly mention we can host in multiple regions to comply with data residency requirements of certain countries. If not initial, plan for it.

* **Right to Deletion Implementation:** We said we’ll either delete or anonymize. For example, if a user deletion request comes:

  * Remove their profile row or replace identifying fields with random and keep performance generic. The organization might still want aggregated results without the name. E.g., we could keep “User X completed training on date” but if name/email removed, it’s not personal data anymore. But in training context, likely they’d just remove record entirely since it’s not needed after they leave.

  * On deletion, ensure things like chat messages or team logs from that user either remove name (maybe replace with “Deleted User”) to not break history but remove identification. Similarly, in team result if one user is gone, either drop them from record or anonymize.

  * All these ensure that personal data is fully gone. We should also ensure any third-party processors (like if using analytics or error trackers with user info) also purge that. But ideally we don’t send PII to such if possible, or at least can delete it.

* **Data export capabilities:**

  * Provide admin ability to export all user data (like the whole org’s dataset) if they move away (data portability at org level).

  * Possibly provide user-level export if user requests, though likely they’d go through admin. But we could consider a “Download my data” button in profile that provides a zip of their info (could include certificate, list of answers, etc.). Up to us if needed.

All these steps ensure privacy compliance and build user trust.

## **Accessibility Compliance**

We have addressed many specific WCAG points in the UX section. To summarize and ensure thoroughness:

* **WCAG 2.1 AA Requirements:** We aim to adhere to all success criteria at Level A and AA. Some key ones and how we meet them:

  * **Perceivable:**

    * Provide text alternatives (SC 1.1.1): All images have alt text. All non-text content (icons, charts) have text or aria labels. Videos have captions (SC 1.2.2 for captions on pre-recorded audio) and transcripts if audio-only content (SC 1.2.1).

    * Create content that can be presented in different ways (SC 1.3.1 Info and Relationships): We structure pages with proper headings, lists, ARIA landmarks. Relationships like form labels are explicitly associated.

    * Ensure text is readable and distinguishable (SC 1.4.3 Contrast): We choose color schemes that meet 4.5:1 contrast for normal text . We will test all typical text/background combos.

    * Don’t rely on color alone (SC 1.4.1): Puzzles that highlight correct/incorrect with color will also use icons or text.

    * Allow resizing text up to 200% without loss of content (SC 1.4.4): Our responsive design accounts for zoom. We avoid fixed px widths that break layout at large zoom.

    * Provide alternatives for time-based media (SC 1.2.5 Audio Description for videos at AA if needed): If videos have important visual info not in audio, we might need audio description or ensure the narration covers it. Or at least provide a descriptive transcript. Possibly not heavy video usage so might manage with existing narration covering visuals.

    * Avoid content that causes seizures (SC 2.3.1): We will not have flashing content over 3 flashes/sec or high intensity. Any animations will be subtle or allow skip.

  * **Operable:**

    * Ensure all functionality is available from a keyboard (SC 2.1.1): We will test navigating through puzzles and interactive elements via keyboard only. If a particular game interaction is inherently mouse-driven, we must provide an equivalent (like alternative UI or a “skip puzzle” for disabled users possibly, though better to adapt it).

    * No keyboard trap (SC 2.1.2): Ensure focus can always be moved away (like closing modals easily).

    * Timing adjustable (SC 2.2.1): Timed rooms might be an issue. WCAG says for required activities under 20h, user should have a way to turn off or extend the time unless it’s essential. A countdown in a game might be considered essential for the challenge. But to be AA, we might need a setting to disable time limits for those who need (like an accessibility mode where timers are either turned off or significantly extended on request). Many serious games do not allow turning off time because it changes the experience, but for accessibility, offering an alternative is ideal. We could let admin or user set “Accessible mode: no time limits/hints not penalized” for those with disabilities. This might be done discreetly (like if user checks a box “I need more time”, then timeouts won’t cause failure). We’ll plan to have something like that to meet SC 2.2.1.

    * Pause/Stop/Hide (SC 2.2.2): Any moving or auto-updating info (like a ticker or blinking text) can be paused by user. We don’t plan on constant animations beyond game events. The timer is moving content but it’s essential; still, we at least let them pause the game as needed (except maybe in final scenario where realism is the challenge, but to be compliant might allow).

    * Navigable (SC 2.4.1 Bypass Blocks): We will have skip links for repetitive menus. Also a consistent navigation structure (2.4.5).

    * Focus Visible (SC 2.4.7): We’ll ensure custom CSS does not remove focus outlines; we will style them to be clearly visible (which we’ve committed to).

    * Page titles (SC 2.4.2): Each page/screen will have a descriptive \<title\> element (like “CyberSafe Escape \- Room 3: Data Dungeon” for the room page).

    * Descriptive headings and labels (SC 2.4.6): We’ll use clear headings for sections (like “Achievements”, “User List”, etc.) and labels on forms are explicit.

    * Focus order (SC 2.4.3): We’ll logically arrange DOM focus order to match visual flow.

  * **Understandable:**

    * Text is readable (SC 3.1.1 Language): We’ll set document lang attribute and appropriate changes if in other languages. Make sure the reading level is not overly complex. The content is technical by nature, but we will try to explain jargon or provide definitions (which aligns with training objectives anyway).

    * Consistent navigation (SC 3.2.3): Our menu and layout patterns remain consistent across modules. E.g., if the next button is at bottom-right in one room, it should be similarly placed in others.

    * Consistent identification (SC 3.2.4): Icons/buttons that repeat have same labels. E.g., a “hint” icon looks and labeled the same everywhere.

    * No unexpected context changes (SC 3.2.1/3.2.2): We don’t do things like auto-redirect or focus changes without user action. Starting a room is user-initiated. If a new window opens (like maybe for certificate PDF), we either warn or have it clearly an action.

  * **Robust:**

    * Standards-compliant HTML, proper use of ARIA where needed (only where HTML native isn’t sufficient). For example, if we make a custom component (like a tabbed interface or modal), ensure to add ARIA roles (role=“dialog” with aria-modal, focus management, etc. using something like Radix ensures this).

    * Compatibility with assistive tech (SC 4.1.2 Name, Role, Value): All UI controls should expose correct name/role. Eg. custom sliders or drag items will have aria roles and labels if needed.

* **Section 508 (US)** and **ADA**: WCAG 2.1 AA essentially covers Section 508 requirements since the refresh aligned them with WCAG. ADA (Americans with Disabilities Act) for public accommodations: if any of our clients are public institutions, meeting WCAG covers their obligations generally.

* **Testing for Accessibility:** We’ll conduct usability testing with screen reader (NVDA/JAWS for Windows, VoiceOver for Mac), keyboard-only testing, and tools like WAVE or Axe to catch issues. If possible, involve users with disabilities in beta testing to get feedback on game portions. Additionally, consider an accessibility audit by a third party to certify compliance (for marketing, that could be valuable, but later stage).

* **Accessibility Statement:** We’ll publish a statement on the app or site acknowledging our commitment, current status of compliance, and a contact for accessibility issues.

* **Ongoing process:** Each new feature/puzzle must be designed with accessibility in mind from the start to avoid major retrofits.

## **Security Compliance**

Large clients often require proof that our platform meets industry security standards and best practices:

* **SOC 2 Type II:** While SOC 2 is an auditing framework rather than technical spec, our product and processes should align with its trust principles: Security, Availability, Confidentiality, etc.

  * We will have internal controls like access management (ensuring only authorized staff can access production data), monitoring, logging, incident response plan, etc. Possibly beyond product scope, but e.g., our audit logs feature contributes to evidence for SOC2 (tracking admin actions).

  * We’ll maintain security documentation and undergo a SOC2 audit in the future to provide that assurance to clients. But in design: encryption, access controls (RBAC), and consistent monitoring which we’ve covered. Logging and alerting on anomalies can help with demonstrating controls.

  * Also regular vulnerability scanning and pen-tests as part of our process, as mentioned.

* **ISO 27001:** Similarly, that is an information security management standard. Many overlapping controls with SOC2. Implementation-wise, it’s more about policies and risk assessment, but from a product perspective: things like least privilege, secure development cycle, and making sure we have features for resilience (backups, etc. mentioned).

  * Ensure we could align with an ISMS if needed. Possibly out-of-scope to implement anything specifically in code aside from what’s already done (like encryption, logs).

* **NIST Framework alignment:** Since it’s a training product, maybe not directly relevant, but if asked, we can map our security controls to NIST CSF categories (Identify, Protect, Detect, Respond, Recover). E.g., data encryption covers Protect, monitoring covers Detect, etc.

* If any government clients, they might ask for FedRAMP (if SaaS to US govt) or similar. That would require more stringent measures (like certain crypto modules). Not needed unless targeting government specifically.

* **Penetration Testing Considerations:** We’ll plan to get a third-party pen-test (ethical hacking) done periodically (maybe before release or annually). Our development in line with OWASP Top 10 should mitigate common issues:

  * We have covered input validation (Injection), auth (Broken Auth), sensitive data (cryptography), XSS, etc.

  * Also will ensure secure config (no default passwords, proper headers like HSTS).

  * On deployment, lock down ports and admin interfaces.

  * Possibly bug bounty program in future for continuous security improvement.

* **Secure Coding and Code Review:** We’ll adopt practices like code reviews focusing on security, using static analysis tools (like SonarQube or npm audit and Snyk to catch vulnerable dependencies).

  * Use dependency management to keep libs updated (especially critical ones like Node frameworks, since known vulns come out).

* **Audit Trails:** Already mention audit log. Additionally, for compliance, maintain logs of user login attempts (for detect potential attacks, plus in enterprise they might want to review if a user actually did the training by them logging in).

  * Possibly allow exporting those logs if needed for forensic or compliance evidence.

* **Physical and Infrastructure Security:** If needed to mention: our cloud provider (AWS) covers physical, we ensure proper network security groups, etc. This is more devops but part of compliance to have documented.

In essence, our system is designed to meet high security and privacy standards required by enterprises and educational institutions, with features and processes in place to maintain compliance and trust.

# **Business Requirements**

Finally, we address the business context: how the product will be sold/priced, success metrics to measure its value, and competitor differentiation to ensure we build the right features to stand out.

## **Pricing Model Considerations**

We need a flexible pricing strategy that fits different types of customers (schools vs enterprises) and allows scaling:

* **Per-User Licensing:** A common approach in SaaS training. Charge a fee per active user per year (or per month).

  * For example, $X per employee/year for corporate. Or tiered pricing: e.g., $5/user/year if \<100 users, volume discounts for thousands.

  * Possibly differentiate user types: maybe admin accounts free or included, only count learners.

  * We must clarify what counts as an “active user” \- likely any user who is registered for training in that period.

  * This model is straightforward and aligns cost with usage. Enterprises often expect this.

* **Organization Tiers:** Offer tiered plans with different feature sets:

  * **Basic Tier:** Cheaper, includes core game content and basic reporting. Suitable for small businesses or maybe just a subset of features (maybe limited gamification or limited admin customization).

  * **Pro Tier:** Medium price, adds advanced features like custom content creation, integrations (SSO perhaps included here if we want to upsell, though SSO might be expected by all enterprise customers; maybe keep SSO in all paid tiers as it’s critical).

  * **Enterprise Tier:** Highest, includes full features: SSO, LMS integrations, advanced analytics, priority support, customization options, maybe on-prem deployment option if needed.

  * Possibly an **Education Tier** pricing: schools often have tighter budgets, maybe special pricing (like per-student per year or site license).

  * For K-12 maybe district license or based on number of schools.

* **Feature Gating:**

  * If using tiers, we need to decide which features to reserve for higher tiers:

    * Gamification maybe base for all (the whole product is gamified).

    * Perhaps **Advanced Analytics Dashboard** is Pro (Basic might just have simple completion reports, while Pro gives deeper metrics and custom reports).

    * **Integrations** like SCORM/xAPI, SSO could be in higher tier (though SSO is kind of a baseline expectation for any decent sized org; perhaps Basic for small clients might skip SSO? Unlikely they’d want to manage separate logins though. Could allow email login at basic, SSO at pro).

    * **Custom Content** definitely an enterprise feature.

    * **Dedicated Support/Training** often an enterprise feature (we include onboarding sessions, etc.).

    * Possibly **Multiplayer/team rooms** itself? But that’s core to the concept, not likely to remove.

    * Or number of teams or something? Probably not.

    * Possibly number of admin accounts allowed or sub-admin roles might be limited in base.

* **Education pricing model:**

  * Could be per student or per school.

  * K-12 might prefer a flat fee per school or per district for a year, to cover all their students, because counting each student might be cumbersome.

  * Or we could price by student count tiers (like up to 500 students \= $Y).

  * Also could have teacher accounts free.

  * Possibly lower price per user than corporate because budgets small.

* **Free or Freemium Element:**

  * Perhaps a limited free version for small teams or a demo (like up to 5 users free, or first room free) to drive adoption. E.g., a teacher can try with one class for free, or a company can pilot with 10 users for free.

  * Also consider free for certain categories (maybe nonprofit or small schools get discount).

  * But careful not to give away too much. Likely better to offer a time-limited trial rather than an indefinite free version (except for maybe a short demo game).

* **Trial Period:**

  * Typically offer a 14-day or 30-day free trial of full features, so prospective clients can pilot. We’ll need an easy way to sign up for trial and get a limited org environment. Possibly filled with sample users or they use with some real users.

  * For example, a company tries it with their IT team or a small group, see the engagement, then decide to purchase for all.

* **Feature-based Pricing vs Seat-based:**

  * If we think from gamification perspective, maybe not relevant. So seat-based is fine.

* **Renewal / Expansion:**

  * Provide value metrics to encourage renewal: e.g., show improvement in scores etc.

  * Possibly have an annual license model; expansions mid-year allowed if they add users (prorate).

* **The product might have two brand versions:**

  * One for corporate (CyberSafe Escape) and possibly a slightly tweaked for education (maybe branded differently if needed).

  * Pricing structures might differ slightly, but the product core is same, just how it’s packaged.

## **Success Metrics**

To evaluate if our product is successful (for both us as business and our clients’ objectives):

**User Engagement Metrics:**

* **Completion Rate:** Percentage of enrolled users who fully complete the training by a given time. High completion is crucial. E.g., target \> 90%. If our gamification works, we expect higher than traditional training (which might see, say, 70-80%). So one metric: difference in completion rate compared to previous non-gamified training.

* **Time to Completion:** How quickly do users finish after assignment? Possibly measure median days taken. If gamified, maybe quicker than normal (people don’t procrastinate as much).

* **Active Participation Rate:** e.g., in team rooms, measure how many users actively contributed (based on action count or speaking). If \> N actions by each \= engaged. Could present something like “85% of users actively participated in team challenges (as opposed to just observing)”.

* **Session Duration / Frequency:** Are users willingly spending more time in training (maybe exploring optional content)? E.g., average session length or total hours in platform. If they do extra credit puzzles or repeat puzzles for better score, indicates engagement beyond mandatory.

* **Retention of knowledge (if we had pre/post test):** Possibly measure knowledge gain. If initial baseline vs final test difference, that could be a metric. If not built-in, maybe measure improvements year over year for recurring users.

* **User Feedback:** Through surveys or ratings after training: e.g., ask “How enjoyable was this training vs others?” or NPS (Net Promoter Score) from users. High NPS or high satisfaction means success on engagement front.

* **Gamification usage:** e.g., what percentage of users collected at least one badge, or how many on average. Or usage of features like how many logins streaks we see, etc. If these numbers are high, indicates deep engagement.

**Learning Outcome Metrics:**

* **Quiz/Assessment Scores:** We have the performance scores for each user. We can average it out. If it’s high (like 85-90%), suggests users learned the material. If some topics low, that’s a measure to improve content.

* **Behavior Change metrics** (harder to get directly, but the idea is whether training reduced incidents):

  * For enterprise, they might look at metrics like phishing simulation results after training. If we can correlate: e.g., before training 20% clicked phishing, after training only 5% did. That’s a huge success metric. We should encourage clients to track that. Possibly integrate with their phishing test provider? Or at least ask them.

  * Another measure: number of security incidents or policy violations reported vs occurred. If training effective, maybe more reporting of suspicious things (meaning awareness increased).

  * Hard to measure in our platform alone, but the admin might feed in external metrics to see correlation.

**Business Metrics (for us, the vendor):**

* **Customer Retention Rate:** Do clients renew after year 1? If yes at high rates (target \>90%), it means they see value.

* **Expansion:** Clients expanding usage (increasing licenses or adopting in more departments). Or, new clients acquired per quarter (growth rate).

* **Usage Growth:** If a client originally used it for one department and next year entire company uses it (expansion revenue).

* **User Adoption within organizations:** Not just complete or not, but how many voluntarily engage beyond required (like optional challenges if provided). If we see e.g., 50% of users continued to take optional challenges after finishing mandatory content, that indicates success in creating a culture of continuous learning.

* **Engagement Compared to Traditional:** If any pilot or side-by-side, perhaps record that our training had X% higher completion or X% faster completion than previous approach (that’s a success story).

**Learning Efficacy Metrics (for internal improvement):**

* Track hint usage and puzzle attempts: if certain puzzles frequently require hints or many fail first attempt, then content might be too hard or unclear. We use that to refine.

* Balanced by wanting some challenge, but if e.g., 90% needed hints in Data classification puzzle, we should adjust that content or hint clarity.

* This is more product improvement than success, but indirectly success if content optimizes over time.

We should plan to share certain metrics with clients to prove ROI:

* Maybe an executive summary of outcomes: e.g., “Your employees’ average security awareness score improved from 70% to 90% through this program,” and “Team-based exercises uncovered collaboration improvements,” etc.

## **Competitive Analysis**

We consider key existing players and how to differentiate:

Major competitors in security awareness training:

* **KnowBe4:** The largest, known for phishing simulations and lots of video modules, some games but mostly traditional. They have gamification elements (badges, leaderboards as referenced ). But their content can be seen as less interactive (mostly quizzes, maybe some basic games).

  * Differentiation: Our fully immersive escape room style is unique. Many vendors do not have a continuous narrative interactive game. KnowBe4’s content is usually segmented videos and quizzes. So we offer a fresh approach that could be more engaging.

  * Also our team collaboration aspect stands out; most awareness training is individual. If any, maybe group discussion sessions but not interactive like ours.

  * We need to also cover basics as thoroughly as they do but in better packaging.

* **Proofpoint (formerly Wombat Security):** They have interactive modules with questions, some gamified elements, but again, not an integrated game storyline, more separate micro learning modules.

  * We differentiate by an integrated journey and fun factor.

  * Possibly they have more content variety (they cover many topics deeply). We should ensure ours covers enough breadth (we have core 6 topics).

* **Living Security:** They specifically have marketed cybersecurity escape room experiences (they do both in-person kit and virtual as per their site ).

  * So they are close competitor in concept. They might not have a self-service platform widely available; they often facilitated those events (like shipping puzzles, or a guided virtual session). They did mention an online plot “SecureIT\! and Gone Phishing” etc.

  * If they now have an on-demand platform, we need to outshine on user experience and analytics. Possibly Living Security focuses on team events, we can do both solo and team which covers more scenarios.

  * Also, if their solutions require scheduling a session led by a proctor vs ours is available anytime, that’s a plus for us. We need to check how automated theirs is. The blog indicated they invested a lot in design but maybe they deliver it as a service with their staff. Our product could be more scalable if it’s self-contained.

* **Phantom’s Lab:** From earlier reference , they have a platform with episodes, deepfake simulations, etc. They emphasize personalization and culture change. Possibly smaller competitor but interesting.

  * They have solutions (Game, E-learning microgames, and Team events). They tout realistic scenarios.

  * Differentiation: Could be tricky, they sound quite advanced (deepfakes). We might not have deepfakes initially. But we emphasize the collaborative gameplay and possibly a more comprehensive metrics dashboard (they didn’t mention analytics as much, they focus on behavior change marketing stats).

  * We might differentiate on ease of integration (like our LMS and SSO integration capability could be a selling point if theirs is lacking).

* **Circadence Project Ares:** It’s more of a cyber range for technical skill development (for IT/cyber professionals). Not direct competitor in awareness for general staff, but if someone wanted something gamey for that, they’d be not our target because it’s advanced technical content. So not direct competition for our market (ours is broad, not just IT).

* **Infosec IQ (Infosec Institute):** They have a training platform with modules, some games (they had something called Security IQ games, but likely simple).

  * They are well-known for content library. Our niche is specifically the escape room interactive approach.

  * We differentiate by methodology (hands-on puzzle vs watching a module).

  * Also maybe by focusing on the team building aspect, which traditional training neglects.

* **Others:** Ninjio (uses cartoons episodes), MediaPRO, etc. They often rely on video episodes. We differentiate by actual interactivity and problem-solving which fosters critical thinking and retention .

So key differentiation points to highlight:

* **Immersiveness & Fun:** Not just clicking next on slides or watching cartoon, but actively solving challenges in a cohesive game narrative. More likely to hold attention and be memorable . We can cite how games improve retention vs passive learning.

* **Team Collaboration:** Unique angle that security awareness can be a team sport. This also double-serves as team-building. Especially for remote teams, our platform provides an engaging way to interact (like a team event) while also learning. This adds value beyond just compliance \- it’s an experience.

* **Comprehensive Analytics & Insights:** Many training platforms provide completion stats and maybe quiz scores. We go further with detailed behavioral metrics (e.g., collaboration score, who needed help on what topics, etc.) enabling targeted follow-ups. If we implement readiness score and heat maps , that’s a sophisticated tool for CISOs to pinpoint risk areas.

* **Customization & Integration:** We aim to fit into existing flows \- supporting SSO, LMS integration (so they don’t have to manage separate systems, something not all newer gamified solutions do). Also allow customizing content to align with internal policies, which not all off-the-shelf training does.

* **Multi-language & Global readiness:** If we support multiple languages out-of-box, we can cater to global companies. Many competitors do have translations of their modules, so we should too to match them. We’ll mention our multi-language support for international offices.

* **Continuous Engagement vs One-time:** Our gamification loops (challenges, new content events, etc.) encourage ongoing learning beyond the annual requirement. Many programs are once-a-year. We can position that as building a security culture year-round (with, say, monthly mini challenges). That can be a differentiator if we include those events. If competitor content is static yearly, our dynamic approach stands out.

* **Ease of Use & Modern UI:** Some legacy awareness training have clunky UI (flash-based or outdated). We offer a modern, polished user experience akin to consumer games, which employees (especially younger ones) will appreciate.

We’ll still need to ensure our content meets compliance training needs (some security officers might worry “game” \= not serious enough). But we can counter that by referencing studies or numbers (like Phantom’s lab did with “60% engagement increase” ). We should gather any research or early pilot data to prove effectiveness.

Finally, emphasize any awards or recognition if we had (like the competitor had Secureworks challenge win , if we have something similar or plan to get some accolade, that helps credibility).

By focusing on these differentiators, we build features (like detailed analytics, robust integration, etc.) that support our unique selling points and handle any weaknesses (ensuring content quality so it’s not seen as shallow game without learning \- we’ve integrated real learning points to not be just trivial fun).

---

This completes our deep research PRD. The Implementation Roadmap is next, which will phase features with priorities.

# **Implementation Roadmap**

Developing CyberSafe Escape is a substantial undertaking. We will roll it out in phases to manage complexity and deliver value incrementally. Below is a phased timeline (assuming \~12 months total development) with milestones and prioritized features using the MoSCoW method (Must, Should, Could, Won’t for that phase):

**Phase 1: MVP (Months 1-3)** – Focus on core single-player experience and basic admin:

**Scope:**

* **Core Platform & Auth (Must):** Implement user login system (email/password and basic SSO for at least one IdP, e.g., Google OIDC for quick integration). User roles (user vs admin). Organization and group structure. JWT auth flows.

* **User Management (Must):** Admin can create users (manually & CSV import) and assign to groups. Basic profile management for users (update name, password).

* **Solo Room Content (Must):** Develop two fully functional solo rooms (Rooms 1 and 3 for example). These include all puzzles, hint system, scoring, and end-of-room feedback. Ensure these two cover different styles (one fundamental like passwords, one intermediate like data) to prove out engine versatility.

* **Game Engine & UI (Must):** Build the general framework for loading rooms and puzzles, handling user input, tracking puzzle state, and showing feedback. Implement common UI components: timer, hint button, puzzle navigation within room. Make it robust for reuse in later rooms.

* **Basic Progress Tracking (Must):** Mark rooms as complete when done, store scores. Show user their progress (e.g., dashboard progress bar or list).

* **Basic Gamification (Should):** Award points for puzzles solved, compute a total score. Implement leveling XP curve (even if just level calculation). Add 2-3 example badges (e.g., “Completed First Room”) to test achievement system. Can hardcode criteria initially. Full badge list can come later, but ensure system in place to add them.

* **Basic Admin Dashboard (Must):** Provide at least a simple admin view of who has completed what. E.g., a table of users with completion status and a summary count of completed users. This meets immediate compliance needs. More advanced analytics can wait.

* **UI/UX Polishing (Should):** Ensure the MVP screens (login, dashboard, room UI) are user-friendly and pass accessibility checks for basics (keyboard nav, labels, etc.). Possibly not fully WCAG AA yet, but no blockers.

* **Testing & Feedback (Must):** Conduct internal testing and maybe a small pilot with friendly users to catch issues in puzzle logic or usability.

* **Deliverables:** At end of Phase 1, we have a functional product where a user can log in, complete 2 rooms (covering core topics like passwords and data handling), and an admin can see that they did. This MVP can be used for demos or a pilot group.

**Phase 2: Collaboration (Months 4-5)** – Introduce multiplayer features and team content:

**Scope:**

* **Team Functionality (Must):** Implement team formation lobby system (create team, join via code). Include real-time syncing of lobby (list of members, ready status).

* **Real-time Communication (Must):** Integrate WebRTC for audio (Must) and video (Should) in team rooms. At least get audio working reliably across 3-5 peers using SFU. Test on major browsers. Text chat (Must) in team rooms and lobby.

* **Team Room Content (Must):** Develop two team-based rooms (Rooms 2 and 4 for example: Phishing Waters and Network Maze). Focus on implementing collaborative puzzle mechanics (shared inbox, voting, etc.). Ensure state synchronization via WebSockets for these.

* **Socket Server & Scalability (Must):** Have the basic socket server (likely integrated with main server for now) to handle game events. Ensure using proper rooms/channels for teams. Test concurrency with multiple teams in simulation.

* **Team Scoring & Leaderboards (Should):** Calculate team score in room and add to user’s points. Implement a basic leaderboard page (individual top scores – Could be by total points). Also possibly a team leaderboard if easy (maybe by fastest times in team rooms or by average score). If not now, move to next phase.

* **Enhanced Gamification (Should):** Add more badges especially related to team play (e.g., first team room completed). Implement streak tracking if not done (could do daily login streak now to boost engagement for pilot users).

* **Improved Admin Views (Should):** Show team room results in admin panel (like which teams completed and team scores, at least in a log or so). Not necessarily polished analytics, but ensure admin knows team performance too. Possibly list by group if needed.

* **Accessibility in Collaboration (Must):** Ensure text chat has screen reader support and that crucial info (like actions teammates take) is conveyed (maybe via ARIA live regions). Might not perfect but try to make team tasks somewhat accessible (if one user is on keyboard only, can they still participate? Perhaps yes via chat input if they can’t operate puzzle directly).

* **Stability & Bug Fixing (Must):** Multiplayer adds complexity, allocate time to test thoroughly (simulate slow network, dropouts, etc.). Fix any discovered issues from Phase 1 in core systems.

* **Outcome:** At end of Phase 2, the platform supports collaborative play – users can join teams and complete at least 2 team-oriented scenarios with voice chat. This is a big differentiator ready. We also now likely cover 4 out of 6 planned rooms. We could conceivably start on-boarding early adopter clients with nearly full content at this point (with the last two rooms and polish in next phase).

**Phase 3: Full Game (Months 6-7)** – Complete all planned content and flesh out gamification and analytics:

**Scope:**

* **Complete Rooms (Must):** Implement the remaining rooms: Room 5 (Insider Threat, team) and Room 6 (Incident Response, team final boss). These likely are complex (Room 6 especially with role mechanics). Ensure these are done and thoroughly tested. By now all 6 rooms are playable.

* **Finalize Gamification System (Must):** Roll out the full Points/XP leveling system as designed. Ensure points from all activities accumulate properly.

* **Achievement System (Must):** Implement all the planned badges (30-50). This includes creating logic checks for each (like triggers when conditions met). Provide an Achievements UI for users to view them (the trophy case). This can be heavy, but we can prioritize top ones first if needed.

* **Leaderboards (Must):** Fully implement individual leaderboards (daily/weekly/all-time toggles). Also a group/department leaderboard (if decided to include). Possibly team leaderboard if relevant (Should). Ensure privacy toggle is respected (if user opted out, hide their name or exclude them).

* **Advanced Analytics for Admin (Should):** Build out the admin dashboard with deeper analytics:

  * Individual detail pages (Should) to see per-user performance, including breakdown by topic.

  * Group comparison view (Must for an enterprise deliverable by this point). E.g., a chart or table showing each dept’s completion and avg score.

  * Visualizations like heat maps or charts for risk areas (Could, if time allows in these 2 months; might push some to next phase).

  * At least ensure admin can easily get counts (like how many incomplete, who specifically).

  * Possibly include basic report export (CSV of who hasn’t completed or overall results).

* **Compliance Reports (Should):** Provide ability for admin to download a completion report (PDF listing all users and statuses) as that might be needed at end of campaign. Or at least an Excel export of user statuses.

* **SCORM/xAPI Integration (Should):** Ideally by end of Phase 3, we have something for LMS. Mark as Should: Create a SCORM 1.2 package that communicates completion and score back. Test it on SCORM Cloud or a client LMS. If we can’t fully, ensure it’s in next phase. XAPI statements sending (Could if Phase 3 time allows; if not, Phase 4).

* **SSO & SAML (Must):** By now, to onboard big clients, we should support SAML SSO integration (and possibly simple AD/LDAP integration if needed by first clients). If we didn’t do in Phase 1 (only did Google), implement general SAML in this phase. Test with at least one IdP (Okta or Azure).

* **Mobile Responsiveness (Should):** Fine-tune CSS/UX to ensure it works on tablets and possibly phones. If any puzzle absolutely doesn’t work on phone, decide to block or provide a workaround (e.g., an alternate simplified UI). But try to make it functional on common devices because some employees might use iPads for training.

* **Accessibility Enhancements (Should/Must):** With all content complete, do a thorough audit. Fix any navigation or labeling issues now. If any puzzle is not accessible, decide on solution: e.g., provide an alternative method or let user skip and get credit via an alternate assessment. Because by product launch (phase 3 is basically launch-ready product), we want to be as close to WCAG AA as possible (some complex things like the exact timed incident might not fully meet 2.2.1 without a bypass, so implement that bypass \- e.g., a setting to disable the timer).

* **Beta Launch & Feedback (Must):** Perhaps engage a few pilot customers to run through full training and gather feedback/data. Use that to fix minor content issues or tune difficulty (maybe adjust time limits, more hints if needed, etc.). Also gather testimonial or case study data.

* **Hardening (Must):** Security testing, performance testing. E.g., simulate 100 concurrent players to see server load, tune if necessary (maybe increase Node cluster or identify slow queries).

* **Deliverables:** Phase 3 yields the full product with all main features implemented. We should be able to onboard general customers at this point. It’s likely now at end of month 7, we launch publicly or at least consider it GA. Gamification and analytics major parts are in place, making it compelling.

**Phase 4: Enterprise & Integration (Months 8-9)** – Focus on deep enterprise features and custom content:

**Scope:**

* **Single Sign-On Expansion (Must):** If not fully done, finalize SAML 2.0 for various providers, and possibly SCIM user provisioning (Should). Also add any other SSO (Azure AD OIDC etc if requested).

* **LMS Integration (Must):** Finalize SCORM and xAPI. Ensure SCORM package can be downloaded by admin (maybe a simple link that generates a SCORM zip with their org credentials baked in if needed). Test in at least one client environment. Implement LTI 1.3 (Should) if working with an academic pilot that requires it. If time is short, LTI could be Could or moved to Phase 5, focusing on SCORM first since it’s simpler packaging.

* **Advanced Reporting (Should):** Build a custom report builder UI or at least more choices (like filter by group, time range) and allow exporting those. Also automated scheduled reports (Could): admin can enter emails and schedule to send monthly progress summary etc. If not done now, can be in Phase 5 as it’s not critical for launch but nice add for enterprise.

* **Custom Content Management (Should):** Enable admin to add organization-specific info:

  * At minimum, allow them to input custom instructions or links (like “Our security policy link” appears at the end).

  * Possibly allow them to add one quiz question (like “What’s our internal emergency number?”). Implementation: an admin UI to create a question and answer choices, and we include it in an “Org Specific” module or at end of final room.

  * If ambition, allow uploading a PDF/slide that user must view at end to satisfy any internal training not covered by game.

  * The scope depends on demand; ensure structure to insert this content in user flow (like as Room 7 optional or integrated in certificate issuing process).

* **Multi-language Support (Must):** We should launch multi-language by now if targeting global companies. Implement i18n framework, translate at least to key languages (the prompt default includes Dutch, German, Italian, Spanish which one competitor offered ). Possibly use professional translators for content. Set up language toggle and ensure all UI strings externalized. This is a Must for broad adoption outside English-speaking. If timeline tight, maybe do 2 languages by Phase 4 (e.g., English and one other as proof) and rest in Phase 5 or after launch based on client demand.

* **Mobile App Consideration (Could):** Phase 4 mentions “Mobile app consideration”. Possibly evaluate whether to package as a Cordova/Capacitor or React Native app for iOS/Android. If many users are mobile-only (some industries with no PC, maybe retail staff?), an app might help. But web should suffice on mobile browsers now. We mark actual building native app as Won’t for now (unless a specific client requires it).

* **Performance Optimization (Must):** As users grow, ensure horizontal scaling is set. Maybe deploy across multiple servers/containers behind LB. Implement caching (if not done) for leaderboards (like use Redis sorted sets). Optimize any slow DB queries found in analytics or heavy writes (like maybe writing event logs – consider batch inserts or turning off some if too heavy).

* **Penetration Testing & Security Fixes (Must):** Have an external pen-test done (if not done in Phase 3\) and fix any vulnerabilities. Achieve a clean report that can be shared with prospects (this helps trust).

* **Compliance Documentation (Should):** Prepare documentation for compliance like a VPAT (Voluntary Product Accessibility Template) for 508/WCAG, and a security whitepaper referencing SOC2 principles, etc. This is not coding but part of making enterprise sales smoother.

* **Polish Enterprise Features (Should/Could):** e.g., allow custom branding (admin can add their logo so the platform shows that on login and dashboard – many enterprise want their branding). Could do this now to tick that box.

* **Interventions for Struggling Users (Could):** If time, implement minor features like automated nudge: e.g., if user fails a room twice, notify their manager or suggest them extra reading. Not critical, but an idea if base done early.

* **Outcome:** Phase 4 makes the product truly enterprise-ready: easier to integrate, localized, and customizable. After this, we should be able to satisfy complex org requirements and scale to large deployments.

**Phase 5: Scale and Feedback (Months 10-12)** – The final stretch focusing on performance at scale, mobile, and iterative improvements:

**Scope:**

* **Scalability & Load (Must):** At this point anticipate hundreds or thousands concurrently if a big org rolls it out all at once. Ensure infrastructure can auto-scale (set up auto-scaling groups or container replication) and test large loads (simulate e.g., 1000 concurrent players). Identify bottlenecks (maybe WS throughput or DB connections) and mitigate (could involve using multiple SFU servers, sharding DB reads, etc.).

* **Monitoring & DevOps (Must):** Set up advanced monitoring/alerting (if not already) so we know of any issues quickly in production. This includes performance metrics and user error tracking (maybe if many users fail the same puzzle, might alert content team).

* **Refinement Based on Feedback (Must):** By now we would have feedback from real clients:

  * If some content is too easy/hard, adjust puzzles (e.g., tweak time limits, add extra hints).

  * If admins request certain analytics data not present, add minor features (e.g., a new column or filter).

  * If any UI pain points identified, fix those.

  * Could also implement any highly requested feature that was out-of-scope earlier if feasible (like maybe some customers want to disable one of the rooms, so implement that toggle).

* **Mobile App (Could):** If decided, build a minimal wrapper for the web app as a mobile app (maybe to allow push notifications for reminders or just easier access). If not needed, skip.

* **Content Expansion (Could):** Possibly start developing new content beyond initial (like a 7th bonus scenario on a current event, or updating content with latest threats like deepfakes if not covered). This might be more continuous rather than a phase, but by month 12 we could have a plan for Year 2 content updates. Also incorporate seasonal events (maybe plan a Halloween-themed phish event for October as a surprise content drop to keep engagement).

* **Community & Competitive Features (Could):** If appropriate, maybe cross-org leaderboards for friendly competition (some companies might challenge others, though that can raise privacy issues so likely no unless in a controlled environment like a cybersecurity month event).

* **Evaluate New Tech:** For example, if by then a new WebRTC improvement or if we want to incorporate AI for hints or analysis (cool but not initial). Could plan future integration in backlog.

* **Quality and Stability (Must):** After expansions, test regressions, ensure everything still WCAG AA after changes (no breaking updates), finalize accessibility and possibly seek certification or at least external testing to confirm AA compliance.

* **Wrap up for official launch:** By end of Phase 5, we should have a stable v1.0 with all target features and quality. We’ll also gather case studies from pilot to support marketing (this is more business side).

* Possibly at this point also attempt formal compliance certifications (SOC2 audit should be in progress or done around 12-month mark if started earlier, WCAG compliance claim ready).

**MoSCoW Summary per Phase:**

* Phase1: Must: auth, 2 solo rooms, basic admin & tracking; Should: base gamification, polish; Won’t: team, advanced integration.

* Phase2: Must: team system, comms, 2 team rooms; Should: leaderboards, more gamification, admin improvements; Could: begin SCORM (maybe start early if needed for a pilot integration, but if not urgent, left).

* Phase3: Must: all rooms complete, full gamification, robust analytics base, SSO done; Should: SCORM, multi-language start; Could: maybe xAPI, etc.

* Phase4: Must: finalize SSO/LMS, localization, custom content for enterprise; Should: SCIM, scheduled reports, branding; Could: LTI, deeper Slack integration (if requested by first enterprise).

* Phase5: Must: performance & reliability for scale, incorporate feedback; Should: mobile app if needed, content updates; Could: new features from wish list.

Throughout phases, we’ll mark features that won’t be done (or deferred):

* e.g., We decided a native mobile app might be a Won’t for now unless strong demand (the responsive web should do).

* Perhaps advanced Slack bot DMing each user is a Won’t or later because email reminders suffice initially.

* Another potential Won’t: extremely fine-grained RBAC (like different admin roles with specific permissions) might not be needed early; one admin role may suffice, that could be refined later (like manager vs global admin, etc. we sort of have manager concept but might skip an elaborate permission matrix).

* If any extremely complex puzzle idea not working out, we may simplify it to meet timeline (like deepfake video in Room5 might be too advanced to implement convincingly, we might do a simpler simulation for MVP and improve later).

Finally, ensure documentation and testing before each launch phase. Possibly do a soft launch with friendly users after Phase3 and refine in Phase4 based on their input for an official public launch after Phase4.

We assign priorities to each backlog item accordingly in our tracking system so we maintain focus on must-haves.

---

The roadmap ensures we deliver critical functionality first (making the platform usable and demonstrating its unique value), then progressively add the refinements and enterprise features to meet our full PRD scope.

## **Appendices**

*(We include additional technical details like data models and API references that were developed during research, to support implementation.)*

**Data Model Entity Relationships (simplified):**

* *User* (UserID PK) —\< *UserProgress* \>— *Room* (RoomID PK)

  * (Also User —\< UserAchievement \>— Achievement, User —\< TeamSessionMember \>— TeamSession)

* *Organization* (OrgID PK) — 1—\* (Org has many Users, Groups, TeamSessions, etc.)

* *Group* (GroupID PK, OrgID FK, ParentGroupID self-FK) —\*— Users (a user has one primary group for now, stored in User.group\_id)

* *TeamSession* (TeamSessionID PK, OrgID FK, RoomID FK) —\*— TeamSessionMember (with UserID, Role, contributions)

* *Puzzle/Challenge* (PuzzleID PK, RoomID FK) — possibly for tracking fine-grain results or content definitions

* *Achievement* (AchvID PK, Name, Criteria etc.) — *UserAchievement* (User, Achv, date)

* *EventLog* (EventID, UserID, EventType, Timestamp, Details) for optional detailed tracking

* *LeaderboardEntry* could be virtual (computed from User.total\_points) rather than stored.

**Key API Endpoints Reference:**

*(Some examples for clarity, as cited in spec)*

* GET /api/v1/users?group={id} – returns list of users in group with fields: id, name, email, role, status, progress\_percent. 【No external citation needed; custom API】

* POST /api/v1/rooms/1/submit – request: { answers: \[...\] } (if applicable) \-\> response: { completed: true, score: 85, badgesEarned: \['Fast Solver'\], nextRoomUnlocked: 2 }.

* WS message 'team\_action': e.g., content: { teamId: "T123", action: "SORT\_EMAIL", emailId: 5, markedAs: "phishing" } – server broadcasts to team.

* GET /api/v1/admin/stats/overview – response: { totalUsers: 500, completedCount: 450, avgScore: 88, compRateByGroup: \[ {group: 'Sales', rate:0.9}, ...\] }.

*(Citations from our research used above have been preserved inline in the document, linking key evidence and examples that guided requirements.)*

