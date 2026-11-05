import { SparScenario, ScenarioCategory } from '../types/spar';

export const SCENARIO_CATEGORIES: { id: ScenarioCategory; label: string; description: string; icon: string }[] = [
  {
    id: 'bluff_expert',
    label: 'Bluff the Expert',
    description: 'Pretend you are an authority on a niche topic you know little about without getting exposed.',
    icon: 'Brain'
  },
  {
    id: 'defend_hot_take',
    label: 'Defend a Harmless Hot Take',
    description: 'Stand your ground on a spicy yet trivial opinion against witty skepticism.',
    icon: 'Flame'
  },
  {
    id: 'join_ongoing',
    label: 'Join Ongoing Banter',
    description: 'Jump into a mid-conversation debate smoothly without derailing the vibe or being awkward.',
    icon: 'Users'
  },
  {
    id: 'curveball_question',
    label: 'Handle Unexpected Questions',
    description: 'Navigate sudden high-stakes pivots, eccentric interview questions, and social ambushes.',
    icon: 'Sparkles'
  },
  {
    id: 'improv_story',
    label: 'Improvise a Consistent Story',
    description: 'Weave an impromptu explanation or alibi while keeping facts, timelines, and details straight.',
    icon: 'Layers'
  }
];

export const PRESET_SCENARIOS: SparScenario[] = [
  {
    id: 'deep-dish-mastery',
    category: 'bluff_expert',
    categoryLabel: 'Bluff the Expert',
    title: 'Chicago Deep Dish Pizza Aficionado',
    topic: 'Chicago Deep Dish Pizza Craft & Heritage',
    premise: 'You are at an artisanal culinary meetup in Chicago. A veteran local pizzaiolo overhears you claiming you make world-class authentic deep dish and questions your methods.',
    character: {
      name: 'Marco Rossi',
      role: 'Third-Generation Chicago Pizzaiolo',
      avatarSeed: 'marco-rossi',
      voiceName: 'Puck',
      personality: 'Passionate, opinionated, friendly but fiercely protective of authentic Chicago pizza traditions. Hates when people call it "casserole".',
      challengeStyle: 'Probes for dough hydration, cornmeal crust controversy, cheese placement order, and whether you par-bake your crust.'
    },
    difficulty: 'master',
    suggestedDurationSeconds: 90,
    initialMessage: 'Hold on a second, did I just hear you tell Dave you make authentic deep dish at home? As someone who has run a brick oven in Bridgeport for thirty years, I gotta ask: what dough fat are you using, and what is your oven temp?',
    sampleQuestions: [
      'What dough fat are you using and what is your oven temp?',
      'Wait, did you say you put the sauce under the cheese like a New York slice?',
      'Which Chicago spot do you think actually gets the crust edge right?'
    ],
    bluffKnowledgeHints: [
      'Authentic deep dish places cheese directly on the dough, toppings in the middle, chunky tomato sauce on top.',
      'Cornmeal in the crust is actually debated; traditionalists use coarse semolina or high-oil laminated dough.',
      'Baking takes 30-40 minutes in seasoned cast iron or steel cake pans at ~425-450°F.'
    ]
  },
  {
    id: 'vintage-horology',
    category: 'bluff_expert',
    categoryLabel: 'Bluff the Expert',
    title: 'Vintage Mechanical Watch Movements',
    topic: 'Swiss Mechanical Horology & Chronographs',
    premise: 'At a gallery opening, a high-end vintage watch dealer notices your wrist and starts quizzing your thoughts on manual-wind column-wheel chronographs.',
    character: {
      name: 'Julian Sterling',
      role: 'Vintage Horology Curator',
      avatarSeed: 'julian-sterling',
      voiceName: 'Charon',
      personality: 'Sophisticated, analytical, mildly skeptical, values mechanical ingenuity and patina.',
      challengeStyle: 'Presses on movement calibers, balance spring materials, beat frequencies, and servicing intervals.'
    },
    difficulty: 'adept',
    suggestedDurationSeconds: 90,
    initialMessage: 'Excuse me, I couldn’t help but notice how thoughtfully you were observing that piece. Most people just look at the dial brand, but true collectors look at the heartbeat. What is your stance on vintage column-wheel movements versus modern cam-actuated chronographs?',
    sampleQuestions: [
      'What is your stance on column-wheel vs cam-actuated movements?',
      'If you had to choose between high-beat 36,000 vph and classic 18,000 vph, where is your heart?',
      'How do you feel about unpolished cases with original patina?'
    ]
  },
  {
    id: 'specialty-coffee',
    category: 'bluff_expert',
    categoryLabel: 'Bluff the Expert',
    title: 'Third-Wave Coffee Extraction Specialist',
    topic: 'Pour-Over Dynamics & Fermentation Science',
    premise: 'A certified Q-grader barista catches you critiquing their pour-over ratio and challenges you on extraction yields.',
    character: {
      name: 'Maya Lin',
      role: 'Head Q-Grader & Roaster',
      avatarSeed: 'maya-lin',
      voiceName: 'Kore',
      personality: 'Curious, sharp-tongued, deeply scientific about brew variables, respects bold confidence.',
      challengeStyle: 'Asks about bloom agitation, particle distribution, channeling, and anaerobic natural process notes.'
    },
    difficulty: 'master',
    suggestedDurationSeconds: 90,
    initialMessage: 'I noticed you took one sip of that washed Ethiopian and raised your eyebrow. Come on, don\'t hold back—what did you diagnose in the cup? Over-extracted or channeling during the second pour?',
    sampleQuestions: [
      'What did you diagnose in the cup?',
      'What water composition and TDS do you dial in for light roasts?',
      'How much agitation do you give your bloom phase?'
    ]
  },
  {
    id: 'cereal-is-soup',
    category: 'defend_hot_take',
    categoryLabel: 'Defend a Harmless Hot Take',
    title: 'Cereal is Undeniably Cold Breakfast Soup',
    topic: 'Cereal is Culinary Soup',
    premise: 'You are at a brunch table and drop the claim that cereal with milk is technically a cold grain soup. Your friend refuses to let this blasphemy pass.',
    character: {
      name: 'Chloe Bennett',
      role: 'Passionate Brunch Companion',
      avatarSeed: 'chloe-bennett',
      voiceName: 'Zephyr',
      personality: 'Lively, expressive, incredulous, uses humor and common sense to challenge absurdity.',
      challengeStyle: 'Attacks definitions of broth, cooking processes, savory vs sweet norms, and gastronomic categories.'
    },
    difficulty: 'novice',
    suggestedDurationSeconds: 90,
    initialMessage: 'I am sorry, did you seriously just look me in the eye and say Cinnamon Toast Crunch in whole milk is soup? In what universe is sweetened dairy a soup broth? Defend this right now before I lose my mind!',
    sampleQuestions: [
      'In what universe is sweetened dairy a soup broth?',
      'If cereal is soup, does that mean pouring milk into a glass makes it soup?',
      'Name one respectable restaurant that serves cold sugar grain soup on their appetizer menu!'
    ]
  },
  {
    id: 'spoilers-are-good',
    category: 'defend_hot_take',
    categoryLabel: 'Defend a Harmless Hot Take',
    title: 'Spoilers Actually Enhance Movie Watching',
    topic: 'Plot Spoilers Elevate Cinematic Appreciation',
    premise: 'At a dinner with film buffs, you declare that knowing the ending beforehand makes a film 100% more enjoyable.',
    character: {
      name: 'Marcus Vance',
      role: 'Cinephile & Screenwriter',
      avatarSeed: 'marcus-vance',
      voiceName: 'Fenrir',
      personality: 'Dramatic, witty, values the sacred surprise of a third-act reveal.',
      challengeStyle: 'Challenges emotional impact, tension, director intention, and whether you just have low patience.'
    },
    difficulty: 'adept',
    suggestedDurationSeconds: 90,
    initialMessage: 'You cannot be serious. You actually prefer reading the final twist on Wikipedia before watching the movie? Doesn’t that completely assassinate the suspense and dramatic tension the director spent three years crafting?',
    sampleQuestions: [
      'Doesn’t that completely assassinate the suspense and tension?',
      'Would you read the final page of a mystery thriller first too?',
      'What is an example of a film that was actually better because you were spoiled?'
    ]
  },
  {
    id: 'join-remote-camaraderie',
    category: 'join_ongoing',
    categoryLabel: 'Join Ongoing Banter',
    title: 'The Office Camaraderie Debate',
    topic: 'Has Remote Work Killed Authentic Work Relationships?',
    premise: 'You step into the coffee bar where two colleagues are heatedly debating whether Slack and Zoom have permanently destroyed true work friendships. One notices you.',
    character: {
      name: 'Elena Rostova',
      role: 'Senior Product Lead',
      avatarSeed: 'elena-rostova',
      voiceName: 'Kore',
      personality: 'Direct, engaged, observant, tests whether newcomers can read the room and contribute value.',
      challengeStyle: 'Checks if you validate both sides, bring personal observation, or make generic clichés.'
    },
    difficulty: 'adept',
    suggestedDurationSeconds: 90,
    initialMessage: 'Oh perfect timing! We were just arguing over whether anyone actually makes genuine lifelong friends over Slack huddles anymore, or if remote work turned all of us into transactional avatars. Where do you stand on this?',
    sampleQuestions: [
      'Where do you stand on this?',
      'Have you actually formed a genuine friendship with someone you have never grabbed a coffee with in person?',
      'Isn’t virtual trivia just awkward forced fun though?'
    ]
  },
  {
    id: 'join-greatest-album',
    category: 'join_ongoing',
    categoryLabel: 'Join Ongoing Banter',
    title: 'The Greatest 2000s Album Argument',
    topic: 'Definitive Album of the 2000s Decade',
    premise: 'You join a circle at a party in mid-argument about whether hip-hop, indie rock, or pop defined the 2000s.',
    character: {
      name: 'Devon Cole',
      role: 'Music Producer & Record Collector',
      avatarSeed: 'devon-cole',
      voiceName: 'Puck',
      personality: 'High energy, passionate, easily excited by bold claims, allergic to boring safe answers.',
      challengeStyle: 'Probes for tracklist depth, cultural impact beyond radio singles, and production innovations.'
    },
    difficulty: 'master',
    suggestedDurationSeconds: 90,
    initialMessage: 'Hey! Join the circle! Brian here is claiming The Strokes’ \'Is This It\' is the undisputed pinnacle of the 2000s, and I’m saying Outkast’s \'Speakerboxxx/The Love Below\' completely eclipsed it. Settle this: what album from that decade actually reshaped music?',
    sampleQuestions: [
      'What album from that decade actually reshaped music?',
      'Are you judging by cultural impact or how the whole album flows without skipping tracks?',
      'Does that album still sound fresh today or does it feel dated?'
    ]
  },
  {
    id: 'curveball-invention-delete',
    category: 'curveball_question',
    categoryLabel: 'Handle Unexpected Questions',
    title: 'The Erasure Dilemma',
    topic: 'Deleting One Invention from Human History',
    premise: 'In the final round of an executive leadership interview, the chair leans back and hits you with an unexpected curveball test of first-principles thinking.',
    character: {
      name: 'Dr. Evelyn Ward',
      role: 'Executive Board Chair',
      avatarSeed: 'evelyn-ward',
      voiceName: 'Kore',
      personality: 'Composed, insightful, probes the second-order consequences of your answer.',
      challengeStyle: 'Tests for unintended ripple effects, ethical trade-offs, and intellectual courage.'
    },
    difficulty: 'grandmaster',
    suggestedDurationSeconds: 90,
    initialMessage: 'We have talked through your credentials, which are stellar. Now a different question: if you had the power to retroactively erase one single invention from human history without destroying civilization, what would it be and why?',
    sampleQuestions: [
      'What single invention would you erase and why?',
      'What is the catastrophic second-order consequence of erasing that invention?',
      'Doesn\'t that invention also solve an indispensable human need?'
    ]
  },
  {
    id: 'curveball-awkward-dinner',
    category: 'curveball_question',
    categoryLabel: 'Handle Unexpected Questions',
    title: 'The Overrated Virtue Query',
    topic: 'The Most Overrated Virtue in Society',
    premise: 'At an intimate dinner party of thinkers and artists, the eccentric host clinks their glass and points directly at you.',
    character: {
      name: 'Professor Arthur Vance',
      role: 'Eccentric Philosopher & Host',
      avatarSeed: 'arthur-vance',
      voiceName: 'Charon',
      personality: 'Theatrical, sharp, loves counter-intuitive perspectives, despises platitudes.',
      challengeStyle: 'Catches you if you give a cookie-cutter moral answer or dodge the controversy.'
    },
    difficulty: 'master',
    suggestedDurationSeconds: 90,
    initialMessage: 'Everyone talks endlessly about virtue—kindness, patience, loyalty. But tell me honestly: which traditionally praised human virtue do you believe has done the most quiet damage in modern society?',
    sampleQuestions: [
      'Which praised human virtue does the most quiet damage in modern society?',
      'Are you saying society would be healthier without it?',
      'How do you personally navigate that virtue in your daily life?'
    ]
  },
  {
    id: 'improv-penguin-in-the-van',
    category: 'improv_story',
    categoryLabel: 'Improvise a Consistent Story',
    title: 'The Penguin in Company Van 4',
    topic: 'Accounting for a Live Penguin in the Vehicle',
    premise: 'You are 45 minutes late returning the company delivery van. Your fleet manager opens the sliding side door and finds a live Magellanic penguin standing inside.',
    character: {
      name: 'Gary Kowalski',
      role: 'No-Nonsense Logistics Manager',
      avatarSeed: 'gary-kowalski',
      voiceName: 'Fenrir',
      personality: 'Stressed, practical, bewildered, demands a coherent chronological timeline of events.',
      challengeStyle: 'Pins down specific street names, times, interactions, and catches discrepancies in your story.'
    },
    difficulty: 'master',
    suggestedDurationSeconds: 90,
    initialMessage: 'Step out of the driver\'s seat right now. I don\'t want excuses about traffic. Why is there a live, tuxedo-wearing aquatic bird squawking between the pallet racks of Van Number 4? Start from when you left dispatch at 2:15 PM.',
    sampleQuestions: [
      'Why is there an aquatic bird squawking between the pallet racks?',
      'Wait, how did you get from Harbor Boulevard to the downtown warehouse in 12 minutes?',
      'Who signed off on loading this bird, and where are the documents?'
    ]
  },
  {
    id: 'improv-forgotten-pitch-deck',
    category: 'improv_story',
    categoryLabel: 'Improvise a Consistent Story',
    title: 'The Slide-Less Pitch Meeting',
    topic: 'Pitching an Impromptu Disruptive Logistics Company',
    premise: 'You sit down across from a prominent angel investor, your laptop dies completely, and you have to pitch your enterprise company from memory with zero slides.',
    character: {
      name: 'Samantha Reed',
      role: 'Tier-1 Angel Investor',
      avatarSeed: 'samantha-reed',
      voiceName: 'Zephyr',
      personality: 'Fast-paced, high expectations, listens for market sizing, unit economics, and competitive moat.',
      challengeStyle: 'Probes for customer acquisition cost, customer churn rates, and how you defend against incumbents.'
    },
    difficulty: 'adept',
    suggestedDurationSeconds: 90,
    initialMessage: 'Don’t worry about the dead screen—great founders don’t need bullet points. You have three minutes of my undivided attention. What is the acute customer pain, who is paying for the solution today, and why won’t the incumbents crush you in six months?',
    sampleQuestions: [
      'What is the acute customer pain and who pays today?',
      'What is your unit margin per transaction?',
      'What is your unfair distribution advantage that prevents copies?'
    ]
  }
];
