-- Forum Categories
CREATE TABLE IF NOT EXISTS forum_categories (
  id SERIAL PRIMARY KEY,
  name_key VARCHAR(100) NOT NULL,
  language VARCHAR(10) NOT NULL,
  category_type VARCHAR(50) NOT NULL,
  description_key VARCHAR(255),
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Forum Topics
CREATE TABLE IF NOT EXISTS forum_topics (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES forum_categories(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false NOT NULL,
  is_locked BOOLEAN DEFAULT false NOT NULL,
  is_hidden BOOLEAN DEFAULT false NOT NULL,
  view_count INTEGER DEFAULT 0 NOT NULL,
  reply_count INTEGER DEFAULT 0 NOT NULL,
  upvote_count INTEGER DEFAULT 0 NOT NULL,
  downvote_count INTEGER DEFAULT 0 NOT NULL,
  last_post_at TIMESTAMP,
  last_post_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Forum Posts
CREATE TABLE IF NOT EXISTS forum_posts (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT false NOT NULL,
  upvote_count INTEGER DEFAULT 0 NOT NULL,
  downvote_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Forum Votes
CREATE TABLE IF NOT EXISTS forum_votes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Forum Notifications
CREATE TABLE IF NOT EXISTS forum_notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Forum Moderators
CREATE TABLE IF NOT EXISTS forum_moderators (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  assigned_by INTEGER REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Forum Reports
CREATE TABLE IF NOT EXISTS forum_reports (
  id SERIAL PRIMARY KEY,
  reporter_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
  reason VARCHAR(50) NOT NULL,
  details TEXT,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL,
  resolved_by INTEGER REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Forum Rate Limits
CREATE TABLE IF NOT EXISTS forum_rate_limits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_count INTEGER DEFAULT 1 NOT NULL,
  window_start TIMESTAMP DEFAULT NOW() NOT NULL,
  window_end TIMESTAMP NOT NULL
);
