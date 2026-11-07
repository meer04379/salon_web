/**
 * ==============================================================================
 * AUTO-GENERATE TRENDING SALON ARTICLE SCRIPT
 * Powered by Google Gemini AI
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

// 1. Resolve API Key from Environment
const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY environment variable is not set.');
  console.error('Please configure GEMINI_API_KEY in your GitHub Secrets or environment.');
  process.exit(1);
}
const MODEL_NAME = 'gemini-3.5-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

const ARTICLES_FILE_PATH = path.join(__dirname, '..', 'js', 'articles.js');

// Available specialists
const SPECIALISTS = [
  {
    name: 'Ayesha Malik',
    role: 'Senior Hair Artistry Lead',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    category: 'Haircare',
    serviceId: 'srv-2',
    serviceName: 'Organic Keratin Protein Infusion'
  },
  {
    name: 'Dr. Zara Alvi',
    role: 'Master Esthetician & Skin Specialist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    category: 'Skincare',
    serviceId: 'srv-5',
    serviceName: 'Serene HydraGlow Facial'
  },
  {
    name: 'Sana Mir',
    role: 'Celebrity Bridal & Glamour Artist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    category: 'Bridal Guide',
    serviceId: 'srv-8',
    serviceName: 'Royal Barat Signature Bridal Look'
  },
  {
    name: 'Fatima Noor',
    role: 'Certified Spa & Wellness Therapist',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=200&q=80',
    category: 'Spa & Wellness',
    serviceId: 'srv-10',
    serviceName: 'Aromatherapy Stress Relief Full Body Massage'
  }
];

const CURATED_IMAGES = {
  'Haircare': [
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80'
  ],
  'Skincare': [
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512290900672-1f5517f694e9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=1200&q=80'
  ],
  'Bridal Guide': [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=1200&q=80'
  ],
  'Spa & Wellness': [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
  ],
  'Nails & Care': [
    'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&q=80'
  ]
};

async function main() {
  console.log('✨ Starting Automated Trending Salon Article Generator...');

  if (!fs.existsSync(ARTICLES_FILE_PATH)) {
    console.error(`❌ Error: Could not find articles file at ${ARTICLES_FILE_PATH}`);
    process.exit(1);
  }

  const articlesFileContent = fs.readFileSync(ARTICLES_FILE_PATH, 'utf-8');

  // Extract existing titles to avoid duplication
  const existingTitles = [];
  const titleRegex = /title:\s*["']([^"']+)["']/g;
  let match;
  while ((match = titleRegex.exec(articlesFileContent)) !== null) {
    existingTitles.push(match[1]);
  }
  console.log(`📚 Existing articles found (${existingTitles.length}):\n- ${existingTitles.join('\n- ')}`);

  // Randomly pick a specialist to balance editorial perspective
  const specialist = SPECIALISTS[Math.floor(Math.random() * SPECIALISTS.length)];
  const categoryImages = CURATED_IMAGES[specialist.category] || CURATED_IMAGES['Skincare'];
  const coverImage = categoryImages[Math.floor(Math.random() * categoryImages.length)];

  // Current Month/Year
  const dateFormatted = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // System Prompt for Gemini
  const prompt = `
You are an expert beauty editor and luxury salon copywriter for "Serene Sanctuary Salon & Spa", a premier high-end beauty, bridal, and wellness sanctuary in Karachi, Pakistan (DHA Phase 6 / Clifton).

TASK:
Identify 1 fresh, highly trending, seasonal beauty/salon topic for 2026 relevant to women in Karachi (considering coastal climate, hard water, humidity, smog, Pakistani wedding seasons, modern aesthetic treatments like Japanese scalp detox, peptide barrier repair, chrome glazed nails, organic keratin gloss, or LED phototherapy).

The topic MUST NOT be any of these existing articles:
${existingTitles.map(t => `"${t}"`).join(', ')}

AUTHOR ASSIGNED:
Name: ${specialist.name}
Role: ${specialist.role}
Category: ${specialist.category}
Recommended Sanctuary Treatment: "${specialist.serviceName}" (ID: "${specialist.serviceId}")

OUTPUT FORMAT:
Return a single valid JSON object with the following exact keys:
{
  "id": "kebab-case-slug",
  "slug": "kebab-case-slug",
  "title": "Engaging Luxury Editorial Title (Max 70 chars)",
  "category": "${specialist.category}",
  "readTime": "5 min read",
  "date": "${dateFormatted}",
  "author": "${specialist.name}",
  "authorRole": "${specialist.role}",
  "authorAvatar": "${specialist.avatar}",
  "image": "${coverImage}",
  "excerpt": "Compelling 2-sentence summary hook explaining the problem and salon solution.",
  "featured": true,
  "serviceId": "${specialist.serviceId}",
  "serviceName": "${specialist.serviceName}",
  "content": "Rich HTML string containing: an opening <p class=\\"lead text-base sm:text-lg text-stone-700 leading-relaxed font-serif italic mb-6\\">, 3-4 distinct sections with <h3 class=\\"font-serif text-2xl font-bold text-stone-900 mt-6 mb-3\\">, descriptive paragraphs <p class=\\"text-stone-600 leading-relaxed mb-4\\">, a highlighted expert tip callout box <div class=\\"bg-[#FDF9F7] p-6 rounded-2xl border-l-4 border-[#C59B8E] my-6\\"><h4 class=\\"font-serif font-bold text-stone-900 text-lg mb-1\\">Expert Salon Tip from ${specialist.name}:</h4><p class=\\"text-stone-600 text-sm italic\\">...</p></div>, and an actionable conclusion connecting back to the salon's ${specialist.serviceName}."
}
`;

  console.log(`🤖 Requesting Gemini AI (${MODEL_NAME}) to write article by ${specialist.name} (${specialist.category})...`);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
    }

    const json = await response.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Empty response from Gemini API.');
    }

    const articleData = JSON.parse(rawText);
    console.log(`✅ Generated New Article: "${articleData.title}"`);

    // Check slug uniqueness
    if (existingTitles.includes(articleData.title)) {
      console.log('⚠️ Generated title was duplicate, exiting safely.');
      return;
    }

    // Insert article at the top of ARTICLES_DATA in js/articles.js
    // 1. Mark previous featured articles as false
    let updatedContent = articlesFileContent.replace(/featured:\s*true/g, 'featured: false');

    // 2. Find the array start `const ARTICLES_DATA = [`
    const arrayStartMatch = /const ARTICLES_DATA = \[\s*/.exec(updatedContent);
    if (!arrayStartMatch) {
      throw new Error('Could not find `const ARTICLES_DATA = [` in js/articles.js');
    }

    const insertIndex = arrayStartMatch.index + arrayStartMatch[0].length;
    const formattedArticleString = JSON.stringify(articleData, null, 2)
      .split('\n')
      .map(line => '  ' + line)
      .join('\n') + ',\n';

    const finalFileContent = 
      updatedContent.slice(0, insertIndex) + 
      formattedArticleString + 
      updatedContent.slice(insertIndex);

    fs.writeFileSync(ARTICLES_FILE_PATH, finalFileContent, 'utf-8');
    console.log(`🎉 Successfully injected new article into ${ARTICLES_FILE_PATH}!`);
    console.log(`📰 Title: ${articleData.title}`);
    console.log(`✍️ Author: ${articleData.author} (${articleData.authorRole})`);
    console.log(`🏷️ Category: ${articleData.category} | Read Time: ${articleData.readTime}`);

  } catch (err) {
    console.error('❌ Error during article generation:', err);
    process.exit(1);
  }
}

main();
