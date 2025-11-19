CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"achievementType" varchar(100) NOT NULL,
	"achievementName" varchar(255) NOT NULL,
	"achievementDescription" text,
	"iconUrl" text,
	"currentProgress" integer DEFAULT 0 NOT NULL,
	"targetProgress" integer NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL,
	"completedAt" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"text_id" integer NOT NULL,
	"questions" text NOT NULL,
	"answers" text,
	"total_questions" integer NOT NULL,
	"correct_answers" integer,
	"score_percentage" integer,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"time_spent_minutes" integer,
	"status" varchar(50) DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"text_id" integer NOT NULL,
	"reported_by" integer NOT NULL,
	"report_type" varchar(50) NOT NULL,
	"level_issue_type" varchar(50),
	"content_issue_type" varchar(50),
	"details" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"reviewed_by" integer,
	"review_note" text,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "texts" (
	"id" serial PRIMARY KEY NOT NULL,
	"dutch_text" text NOT NULL,
	"title" varchar(255),
	"word_count" integer NOT NULL,
	"estimated_reading_minutes" integer NOT NULL,
	"min_hash_signature" text,
	"is_valid_dutch" boolean DEFAULT true NOT NULL,
	"detected_level" varchar(50),
	"level_confidence" integer,
	"is_b1_level" boolean DEFAULT true NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_by" integer NOT NULL,
	"source" varchar(50) DEFAULT 'paste' NOT NULL,
	"moderated_by" integer,
	"moderation_note" text,
	"moderated_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translations" (
	"id" serial PRIMARY KEY NOT NULL,
	"text_id" integer NOT NULL,
	"arabicTranslation" text,
	"englishTranslation" text,
	"turkishTranslation" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_vocabulary" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"vocabulary_id" integer NOT NULL,
	"status" varchar(50) DEFAULT 'new' NOT NULL,
	"correct_count" integer DEFAULT 0 NOT NULL,
	"incorrect_count" integer DEFAULT 0 NOT NULL,
	"last_reviewed_at" timestamp,
	"next_review_at" timestamp DEFAULT now() NOT NULL,
	"ease_factor" integer DEFAULT 2500 NOT NULL,
	"interval" integer DEFAULT 0 NOT NULL,
	"repetitions" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"open_id" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"login_method" varchar(64),
	"role" varchar(50) DEFAULT 'user' NOT NULL,
	"preferred_language" varchar(50) DEFAULT 'nl' NOT NULL,
	"total_exams_completed" integer DEFAULT 0 NOT NULL,
	"total_vocabulary_learned" integer DEFAULT 0 NOT NULL,
	"total_time_spent_minutes" integer DEFAULT 0 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_activity_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_signed_in" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_open_id_unique" UNIQUE("open_id")
);
--> statement-breakpoint
CREATE TABLE "vocabulary" (
	"id" serial PRIMARY KEY NOT NULL,
	"text_id" integer NOT NULL,
	"dutchWord" varchar(255) NOT NULL,
	"arabicTranslation" varchar(255),
	"englishTranslation" varchar(255),
	"turkishTranslation" varchar(255),
	"audioUrl" text,
	"audioKey" varchar(255),
	"exampleSentence" text,
	"difficulty" varchar(50),
	"frequency" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "achievements_user_id_idx" ON "achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "exams_user_id_idx" ON "exams" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "exams_text_id_idx" ON "exams" USING btree ("text_id");--> statement-breakpoint
CREATE INDEX "exams_status_idx" ON "exams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "reports_text_id_idx" ON "reports" USING btree ("text_id");--> statement-breakpoint
CREATE INDEX "reports_reported_by_idx" ON "reports" USING btree ("reported_by");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "texts_created_by_idx" ON "texts" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "texts_status_idx" ON "texts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "translations_text_id_idx" ON "translations" USING btree ("text_id");--> statement-breakpoint
CREATE INDEX "user_vocabulary_user_id_idx" ON "user_vocabulary" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_vocabulary_vocabulary_id_idx" ON "user_vocabulary" USING btree ("vocabulary_id");--> statement-breakpoint
CREATE INDEX "vocabulary_text_id_idx" ON "vocabulary" USING btree ("text_id");--> statement-breakpoint
CREATE INDEX "vocabulary_dutchWord_idx" ON "vocabulary" USING btree ("dutchWord");