import { getDb } from "./db";
import { forumCategories } from "../drizzle/schema";

const categories = [
  // Dutch categories
  { name_key: "forum.category.exams_tips", language: "nl", category_type: "exams_tips", description_key: "forum.category.exams_tips_desc", icon: "📝", sort_order: 1 },
  { name_key: "forum.category.experiences", language: "nl", category_type: "experiences", description_key: "forum.category.experiences_desc", icon: "💬", sort_order: 2 },
  { name_key: "forum.category.questions", language: "nl", category_type: "questions", description_key: "forum.category.questions_desc", icon: "❓", sort_order: 3 },
  
  // Arabic categories
  { name_key: "forum.category.exams_tips", language: "ar", category_type: "exams_tips", description_key: "forum.category.exams_tips_desc", icon: "📝", sort_order: 4 },
  { name_key: "forum.category.experiences", language: "ar", category_type: "experiences", description_key: "forum.category.experiences_desc", icon: "💬", sort_order: 5 },
  { name_key: "forum.category.questions", language: "ar", category_type: "questions", description_key: "forum.category.questions_desc", icon: "❓", sort_order: 6 },
  
  // English categories
  { name_key: "forum.category.exams_tips", language: "en", category_type: "exams_tips", description_key: "forum.category.exams_tips_desc", icon: "📝", sort_order: 7 },
  { name_key: "forum.category.experiences", language: "en", category_type: "experiences", description_key: "forum.category.experiences_desc", icon: "💬", sort_order: 8 },
  { name_key: "forum.category.questions", language: "en", category_type: "questions", description_key: "forum.category.questions_desc", icon: "❓", sort_order: 9 },
  
  // Turkish categories
  { name_key: "forum.category.exams_tips", language: "tr", category_type: "exams_tips", description_key: "forum.category.exams_tips_desc", icon: "📝", sort_order: 10 },
  { name_key: "forum.category.experiences", language: "tr", category_type: "experiences", description_key: "forum.category.experiences_desc", icon: "💬", sort_order: 11 },
  { name_key: "forum.category.questions", language: "tr", category_type: "questions", description_key: "forum.category.questions_desc", icon: "❓", sort_order: 12 },
];

async function seed() {
  console.log("Seeding forum categories...");
  const db = await getDb();
  
  for (const category of categories) {
    try {
      await db.insert(forumCategories).values(category);
      console.log(`✅ Added: ${category.language} - ${category.category_type}`);
    } catch (error: any) {
      if (error.code === '23505') { // Duplicate key
        console.log(`⏭️  Skipped (exists): ${category.language} - ${category.category_type}`);
      } else {
        console.error(`❌ Error adding ${category.language} - ${category.category_type}:`, error.message);
      }
    }
  }
  
  console.log("✅ Forum categories seeded!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
