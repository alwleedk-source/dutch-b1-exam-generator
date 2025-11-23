CREATE TABLE "text_ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"text_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "text_ratings_text_id_user_id_key" UNIQUE("text_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "texts" ADD COLUMN "average_rating" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "texts" ADD COLUMN "total_ratings" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "text_ratings" ADD CONSTRAINT "text_ratings_text_id_texts_id_fk" FOREIGN KEY ("text_id") REFERENCES "public"."texts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "text_ratings" ADD CONSTRAINT "text_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_text_ratings_text_id" ON "text_ratings" USING btree ("text_id");--> statement-breakpoint
CREATE INDEX "idx_text_ratings_user_id" ON "text_ratings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_text_ratings_rating" ON "text_ratings" USING btree ("rating");