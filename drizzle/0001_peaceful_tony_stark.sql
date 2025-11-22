CREATE TABLE "b1_dictionary" (
	"id" serial PRIMARY KEY NOT NULL,
	"word" varchar(255) NOT NULL,
	"translation_ar" text,
	"translation_en" text,
	"translation_tr" text,
	"definition_nl" text,
	"example_nl" text,
	"word_type" varchar(50),
	"frequency_rank" integer,
	"audio_url" text,
	"audio_key" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "b1_dictionary_word_unique" UNIQUE("word")
);
--> statement-breakpoint
CREATE TABLE "forum_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name_key" varchar(100) NOT NULL,
	"language" varchar(10) NOT NULL,
	"category_type" varchar(50) NOT NULL,
	"description_key" varchar(255),
	"icon" varchar(50),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_moderators" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"assigned_by" integer,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "forum_moderators_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "forum_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"notification_type" varchar(50) NOT NULL,
	"topic_id" integer,
	"post_id" integer,
	"from_user_id" integer,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"upvote_count" integer DEFAULT 0 NOT NULL,
	"downvote_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_rate_limits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action_type" varchar(50) NOT NULL,
	"action_count" integer DEFAULT 1 NOT NULL,
	"window_start" timestamp DEFAULT now() NOT NULL,
	"window_end" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_user_id" integer NOT NULL,
	"topic_id" integer,
	"post_id" integer,
	"reason" varchar(50) NOT NULL,
	"details" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"resolved_by" integer,
	"resolved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"upvote_count" integer DEFAULT 0 NOT NULL,
	"downvote_count" integer DEFAULT 0 NOT NULL,
	"last_post_at" timestamp,
	"last_post_user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forum_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"topic_id" integer,
	"post_id" integer,
	"vote_type" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "text_vocabulary" (
	"id" serial PRIMARY KEY NOT NULL,
	"text_id" integer NOT NULL,
	"vocabulary_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "vocabulary_text_id_idx";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "preferred_language" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "preferred_language" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vocabulary" ALTER COLUMN "text_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "exams" ADD COLUMN "staatsexamen_score" integer;--> statement-breakpoint
ALTER TABLE "texts" ADD COLUMN "formatted_html" text;--> statement-breakpoint
ALTER TABLE "texts" ADD COLUMN "text_type" varchar(50);--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "arabic_translation" text;--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "english_translation" text;--> statement-breakpoint
ALTER TABLE "translations" ADD COLUMN "turkish_translation" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "banned_by" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "vocabulary" ADD COLUMN "context" varchar(100);--> statement-breakpoint
ALTER TABLE "vocabulary" ADD COLUMN "dutchDefinition" text;--> statement-breakpoint
ALTER TABLE "vocabulary" ADD COLUMN "wordType" varchar(50);--> statement-breakpoint
ALTER TABLE "vocabulary" ADD COLUMN "sourceTextId" integer;--> statement-breakpoint
ALTER TABLE "forum_moderators" ADD CONSTRAINT "forum_moderators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_moderators" ADD CONSTRAINT "forum_moderators_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_notifications" ADD CONSTRAINT "forum_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_notifications" ADD CONSTRAINT "forum_notifications_topic_id_forum_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."forum_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_notifications" ADD CONSTRAINT "forum_notifications_post_id_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_notifications" ADD CONSTRAINT "forum_notifications_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_topic_id_forum_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."forum_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_posts" ADD CONSTRAINT "forum_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_rate_limits" ADD CONSTRAINT "forum_rate_limits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_topic_id_forum_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."forum_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_post_id_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_reports" ADD CONSTRAINT "forum_reports_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_category_id_forum_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."forum_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_topics" ADD CONSTRAINT "forum_topics_last_post_user_id_users_id_fk" FOREIGN KEY ("last_post_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_votes" ADD CONSTRAINT "forum_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_votes" ADD CONSTRAINT "forum_votes_topic_id_forum_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."forum_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forum_votes" ADD CONSTRAINT "forum_votes_post_id_forum_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "b1_dictionary_word_idx" ON "b1_dictionary" USING btree ("word");--> statement-breakpoint
CREATE INDEX "b1_dictionary_frequency_rank_idx" ON "b1_dictionary" USING btree ("frequency_rank");--> statement-breakpoint
CREATE INDEX "text_vocabulary_text_id_idx" ON "text_vocabulary" USING btree ("text_id");--> statement-breakpoint
CREATE INDEX "text_vocabulary_vocabulary_id_idx" ON "text_vocabulary" USING btree ("vocabulary_id");--> statement-breakpoint
CREATE UNIQUE INDEX "text_vocabulary_unique" ON "text_vocabulary" USING btree ("text_id","vocabulary_id");--> statement-breakpoint
CREATE INDEX "vocabulary_source_text_id_idx" ON "vocabulary" USING btree ("sourceTextId");--> statement-breakpoint
CREATE UNIQUE INDEX "vocabulary_word_context_unique" ON "vocabulary" USING btree ("dutchWord","context") WHERE "vocabulary"."context" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "translations" DROP COLUMN "arabicTranslation";--> statement-breakpoint
ALTER TABLE "translations" DROP COLUMN "englishTranslation";--> statement-breakpoint
ALTER TABLE "translations" DROP COLUMN "turkishTranslation";