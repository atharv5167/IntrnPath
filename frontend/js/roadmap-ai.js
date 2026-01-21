/**
 * Roadmap AI Service
 * Uses Groq LLM API for real-time natural language understanding
 * to intelligently parse ANY user feedback and modify roadmaps dynamically
 */

class RoadmapAI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        this.model = 'llama-3.3-70b-versatile';
    }

    /**
     * Parse user feedback using Groq LLM with true NLU - understands ANY input
     * @param {string} userComment - Natural language feedback from user (any phrasing)
     * @param {Object} currentRoadmap - Current roadmap template structure
     * @param {string} userGoal - User's career goal (e.g., 'fullstack', 'backend')
     * @returns {Promise<Object>} - Structured changes to apply
     */
    async parseUserFeedback(userComment, currentRoadmap, userGoal) {
        const roadmapContext = this.buildRoadmapContext(currentRoadmap);

        // Advanced system prompt for true natural language understanding
        const systemPrompt = `You are an intelligent AI assistant for InternPath, a personalized developer learning platform. Your job is to understand what the user wants to change about their learning roadmap and return structured JSON changes.

CRITICAL: You must understand the user's INTENT from their natural language, even if it's:
- Casual or informal ("just skip the basics", "I'm good at JS")
- Contains typos or abbreviations ("i no react", "add k8s")
- Vague or general ("make it easier", "too long", "more practical stuff")
- Complex multi-part requests ("remove Angular, add Vue, and focus more on testing")
- Negations ("don't need HTML", "not interested in Angular")
- Questions that imply changes ("do I really need to learn CSS?")

CURRENT ROADMAP for ${userGoal} developer:
${roadmapContext}

YOUR TASK:
1. Analyze the user's message to understand their intent
2. Determine what changes they want (even if not explicitly stated)
3. Return structured JSON with specific actions

COMMON INTENTS TO RECOGNIZE:
- User knows something → action: skip (mark as known)
- User wants to add something → action: add (to appropriate phase)
- User wants to remove something → action: remove
- User wants more focus on something → action: emphasize
- User wants less of something → action: remove or de-prioritize
- User wants it shorter/faster → remove non-core skills
- User wants it easier → move advanced skills later or remove them
- User wants it harder → add advanced topics
- User mentions specific tech → look for matching skills

CRITICAL - LANGUAGE/STACK SWITCHING (FULL ROADMAP REGENERATION):
When user says they want to use a specific language/stack (e.g., "I want Python backend", "use JavaScript", "switch to Django"), 
you MUST provide a COMPLETE roadmap with skills properly distributed across ALL 4 phases using the "replaceRoadmap" field.

COMPLETE STACK TEMPLATES:

For "JavaScript/Node.js backend":
- Phase 1 (Foundations): JavaScript Fundamentals, Data Structures, Basic Algorithms, Object-Oriented Programming
- Phase 2 (Databases): SQL Fundamentals, PostgreSQL, MongoDB (NoSQL), Prisma ORM
- Phase 3 (API Development): REST API Design, Node.js & Express, Authentication (JWT, OAuth), GraphQL
- Phase 4 (DevOps): Git & Version Control, Docker Containers, CI/CD Pipelines, Cloud Deployment (AWS/GCP)

For "Python backend":
- Phase 1 (Foundations): Python Fundamentals, Data Structures, Basic Algorithms, Object-Oriented Programming
- Phase 2 (Databases): SQL Fundamentals, PostgreSQL, MongoDB (NoSQL), SQLAlchemy ORM
- Phase 3 (API Development): REST API Design, Django/Flask Framework, Authentication (JWT, OAuth), FastAPI
- Phase 4 (DevOps): Git & Version Control, Docker Containers, CI/CD Pipelines, Cloud Deployment (AWS/GCP)

For "Java backend":
- Phase 1 (Foundations): Java Fundamentals, Data Structures, Basic Algorithms, Object-Oriented Programming
- Phase 2 (Databases): SQL Fundamentals, PostgreSQL, MongoDB (NoSQL), Hibernate ORM
- Phase 3 (API Development): REST API Design, Spring Boot Framework, Authentication (JWT, OAuth), Microservices
- Phase 4 (DevOps): Git & Version Control, Docker Containers, CI/CD Pipelines, Cloud Deployment (AWS/GCP)

For "Go/Golang backend":
- Phase 1 (Foundations): Go Fundamentals, Data Structures, Basic Algorithms, Concurrency in Go
- Phase 2 (Databases): SQL Fundamentals, PostgreSQL, MongoDB (NoSQL), GORM ORM
- Phase 3 (API Development): REST API Design, Gin/Echo Framework, Authentication (JWT, OAuth), gRPC
- Phase 4 (DevOps): Git & Version Control, Docker Containers, CI/CD Pipelines, Cloud Deployment (AWS/GCP)

SKILLS REFERENCE (for individual additions):
Frontend: React, Angular, Vue, Svelte, TypeScript, Next.js, Tailwind, Testing, Webpack
Backend (JavaScript): Node.js, Express.js, NestJS, Fastify, Prisma ORM
Backend (Python): Python, Django, Flask, FastAPI, SQLAlchemy, Celery
Backend (Java): Java, Spring Boot, Maven, Gradle, JPA, Hibernate
Backend (Go): Go, Gin, Echo, GORM
Database: PostgreSQL, MongoDB, Redis, MySQL, SQLite
DevOps: Docker, Kubernetes, CI/CD, GitHub Actions, AWS, Azure, GCP, Terraform, Nginx
General: Git, Linux, Authentication, WebSockets, Microservices, System Design, REST API, GraphQL

RESPONSE FORMAT (return ONLY valid JSON, no markdown, no explanation):

For STACK SWITCHING requests (when user wants different language/framework for entire roadmap):
{
  "understood": true,
  "confidence": 0.9,
  "interpretation": "User wants to switch to [LANGUAGE] backend stack",
  "isStackSwitch": true,
  "replaceRoadmap": {
    "title": "Backend Developer",
    "phases": [
      {"name": "Phase 1: Programming Foundations", "icon": "💻", "skills": [...]},
      {"name": "Phase 2: Databases", "icon": "🗃️", "skills": [...]},
      {"name": "Phase 3: API Development", "icon": "🔌", "skills": [...]},
      {"name": "Phase 4: DevOps Basics", "icon": "🚀", "skills": [...]}
    ]
  },
  "changes": {"add": [], "remove": [], "emphasize": [], "skip": [], "reorder": []},
  "reasoning": "Complete roadmap regeneration for [LANGUAGE] stack"
}

Each skill in phases should have: {id, name, difficulty: "easy"|"medium"|"hard", duration: "X hours", resources: 1-5, core: true|false}

For REGULAR modification requests (add/remove individual skills):
{
  "understood": true,
  "confidence": 0.0-1.0,
  "interpretation": "Brief summary of what you understood the user wants",
  "isStackSwitch": false,
  "changes": {
    "add": [{"name": "Skill Name", "phase": 1-4}],
    "remove": ["skill_id_or_name"],
    "emphasize": ["skill_id_or_name"],
    "skip": ["skill_id_or_name"],
    "reorder": [{"skill": "skill_id", "toPhase": 1-4}]
  },
  "reasoning": "Why you made these specific changes"
}

If you truly cannot understand the request at all, return:
{
  "understood": false,
  "confidence": 0.0,
  "interpretation": "Explain what was confusing",
  "changes": {"add": [], "remove": [], "emphasize": [], "skip": [], "reorder": []},
  "suggestion": "Ask a clarifying question or suggest what they might mean"
}`;

        const userPrompt = `User's feedback: "${userComment}"

Analyze this feedback and return JSON changes. Remember:
- Understand the INTENT, not just keywords
- Handle informal/casual language naturally
- Make smart inferences when things are implied
- If they mention knowing something, skip it
- If they mention wanting something, add it if not present
- Be generous in interpretation - try to help the user`;

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                const error = await response.text();
                console.error('Groq API error:', error);
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            if (!content) {
                throw new Error('Empty response from API');
            }

            // Parse JSON from response (handle potential markdown code blocks)
            let jsonStr = content.trim();
            // Remove markdown code blocks if present
            jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

            const changes = JSON.parse(jsonStr);

            console.log('Groq AI interpreted:', changes.interpretation);
            console.log('Confidence:', changes.confidence);
            console.log('Is Stack Switch:', changes.isStackSwitch);
            console.log('Replace Roadmap:', changes.replaceRoadmap ? 'Yes (phases: ' + changes.replaceRoadmap?.phases?.length + ')' : 'No');
            console.log('Changes:', changes.changes);

            return changes;

        } catch (error) {
            console.error('RoadmapAI error:', error);
            return {
                understood: false,
                confidence: 0,
                interpretation: `AI processing failed: ${error.message}`,
                changes: { add: [], remove: [], emphasize: [], skip: [], reorder: [] },
                error: true,
                suggestion: 'Try rephrasing your request or be more specific about what you want to change.'
            };
        }
    }

    /**
     * Build human-readable context about current roadmap
     */
    buildRoadmapContext(roadmap) {
        if (!roadmap || !roadmap.phases) {
            return 'No roadmap available';
        }

        return roadmap.phases.map((phase, index) => {
            const skills = phase.skills.map(s => {
                let status = '';
                if (s.status === 'known' || s.skipped) status = ' [ALREADY KNOWN]';
                else if (s.core) status = ' [CORE]';
                return `  - ${s.name} (id: ${s.id})${status}`;
            }).join('\n');
            return `Phase ${index + 1}: ${phase.name}\n${skills}`;
        }).join('\n\n');
    }

    /**
     * Apply AI-suggested changes to roadmap template
     * @param {Object} template - Current roadmap template (will be modified)
     * @param {Object} aiResponse - Response from parseUserFeedback
     * @returns {Object} - Log of changes made
     */
    applyChanges(template, aiResponse) {
        const log = {
            added: [],
            removed: [],
            emphasized: [],
            skipped: [],
            reordered: [],
            replaced: false,
            errors: [],
            interpretation: aiResponse.interpretation || '',
            confidence: aiResponse.confidence || 0,
            reasoning: aiResponse.reasoning || ''
        };

        if (!aiResponse.understood || aiResponse.error) {
            log.errors.push(aiResponse.suggestion || 'Could not understand request');
            return log;
        }

        // Handle complete roadmap replacement for stack switching
        if (aiResponse.isStackSwitch && aiResponse.replaceRoadmap) {
            console.log('Stack switch detected - replacing entire roadmap');
            const newRoadmap = aiResponse.replaceRoadmap;

            // Replace all phases with the new roadmap
            if (newRoadmap.phases && newRoadmap.phases.length > 0) {
                template.title = newRoadmap.title || template.title;
                template.phases = newRoadmap.phases.map((phase, index) => ({
                    name: phase.name || `Phase ${index + 1}`,
                    icon: phase.icon || '📚',
                    skills: (phase.skills || []).map(skill => ({
                        id: skill.id || skill.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
                        name: skill.name,
                        difficulty: skill.difficulty || 'medium',
                        duration: skill.duration || '4 hours',
                        resources: skill.resources || 3,
                        core: skill.core !== undefined ? skill.core : true
                        // Don't mark as newlyAdded for full replacements to avoid green borders
                    }))
                }));

                log.replaced = true;
                log.added = template.phases.flatMap(p => p.skills.map(s => ({ name: s.name, phase: p.name })));
                return log;
            }
        }

        const changes = aiResponse.changes || {};

        // Handle additions
        if (changes.add && changes.add.length > 0) {
            changes.add.forEach(item => {
                const phaseIndex = (item.phase || 3) - 1;
                if (phaseIndex >= 0 && phaseIndex < template.phases.length) {
                    const newSkill = this.createSkillFromName(item.name);
                    // Check if skill already exists (case insensitive)
                    const exists = template.phases.some(p =>
                        p.skills.some(s => s.name.toLowerCase() === item.name.toLowerCase() ||
                            s.id.toLowerCase() === newSkill.id)
                    );
                    if (!exists) {
                        template.phases[phaseIndex].skills.push(newSkill);
                        log.added.push({ name: item.name, phase: phaseIndex + 1 });
                    }
                }
            });
        }

        // Handle removals (flexible matching)
        if (changes.remove && changes.remove.length > 0) {
            changes.remove.forEach(skillRef => {
                const lowerRef = skillRef.toLowerCase();
                template.phases.forEach(phase => {
                    const toRemove = phase.skills.filter(s =>
                        s.id.toLowerCase() === lowerRef ||
                        s.name.toLowerCase().includes(lowerRef) ||
                        lowerRef.includes(s.name.toLowerCase())
                    );
                    toRemove.forEach(s => log.removed.push(s.name));
                    phase.skills = phase.skills.filter(s =>
                        !s.id.toLowerCase().includes(lowerRef) &&
                        !s.name.toLowerCase().includes(lowerRef) &&
                        !lowerRef.includes(s.name.toLowerCase())
                    );
                });
            });
        }

        // Handle emphasis (mark as core, increase duration)
        if (changes.emphasize && changes.emphasize.length > 0) {
            changes.emphasize.forEach(skillRef => {
                const lowerRef = skillRef.toLowerCase();
                template.phases.forEach(phase => {
                    phase.skills.forEach(s => {
                        if (s.id.toLowerCase().includes(lowerRef) ||
                            s.name.toLowerCase().includes(lowerRef)) {
                            s.core = true;
                            s.duration = this.increaseDuration(s.duration);
                            s.emphasized = true;
                            log.emphasized.push(s.name);
                        }
                    });
                });
            });
        }

        // Handle skip (mark as already known)
        if (changes.skip && changes.skip.length > 0) {
            changes.skip.forEach(skillRef => {
                const lowerRef = skillRef.toLowerCase();
                template.phases.forEach(phase => {
                    phase.skills.forEach(s => {
                        if (s.id.toLowerCase().includes(lowerRef) ||
                            s.name.toLowerCase().includes(lowerRef)) {
                            s.status = 'known';
                            s.skipped = true;
                            log.skipped.push(s.name);
                        }
                    });
                });
            });
        }

        // Handle reordering
        if (changes.reorder && changes.reorder.length > 0) {
            changes.reorder.forEach(item => {
                const lowerSkill = (item.skill || '').toLowerCase();
                const targetPhase = (item.toPhase || 1) - 1;

                let movedSkill = null;
                template.phases.forEach(phase => {
                    const idx = phase.skills.findIndex(s =>
                        s.id.toLowerCase() === lowerSkill ||
                        s.name.toLowerCase().includes(lowerSkill)
                    );
                    if (idx !== -1) {
                        movedSkill = phase.skills.splice(idx, 1)[0];
                    }
                });

                if (movedSkill && targetPhase >= 0 && targetPhase < template.phases.length) {
                    template.phases[targetPhase].skills.push(movedSkill);
                    log.reordered.push(`${movedSkill.name} → Phase ${item.toPhase}`);
                }
            });
        }

        return log;
    }

    /**
     * Create a skill object from a name
     */
    createSkillFromName(name) {
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        return {
            id: id,
            name: name,
            difficulty: 'medium',
            duration: '4 hours',
            resources: 3,
            core: false,
            newlyAdded: true // Flag for UI highlighting
        };
    }

    /**
     * Increase skill duration
     */
    increaseDuration(duration) {
        const hours = parseInt(duration) || 4;
        return `${Math.min(hours + 2, 10)} hours`;
    }
}

// Export for use in other modules
window.RoadmapAI = RoadmapAI;
