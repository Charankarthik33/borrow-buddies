import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

// Users table - Core user profiles and authentication
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  displayName: text('display_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  avatar: text('avatar'),
  coverImage: text('cover_image'),
  bio: text('bio'),
  location: text('location'),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  verificationStatus: text('verification_status').notNull().default('none'),
  interests: text('interests', { mode: 'json' }),
  followersCount: integer('followers_count').default(0),
  followingCount: integer('following_count').default(0),
  trustScore: integer('trust_score').default(0),
  isPrivate: integer('is_private', { mode: 'boolean' }).default(false),
  allowMessages: integer('allow_messages', { mode: 'boolean' }).default(true),
  allowFollows: integer('allow_follows', { mode: 'boolean' }).default(true),
  joinDate: text('join_date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Posts table - Social posts and service listings
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  content: text('content'),
  postType: text('post_type').notNull(),
  media: text('media', { mode: 'json' }),
  hashtags: text('hashtags', { mode: 'json' }),
  mentions: text('mentions', { mode: 'json' }),
  likesCount: integer('likes_count').default(0),
  sharesCount: integer('shares_count').default(0),
  commentsCount: integer('comments_count').default(0),
  bookmarked: integer('bookmarked', { mode: 'boolean' }).default(false),
  location: text('location'),
  price: integer('price'),
  availability: text('availability'),
  duration: text('duration'),
  serviceCategory: text('service_category'),
  tags: text('tags', { mode: 'json' }),
  isListing: integer('is_listing', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Follows table - Social following relationships
export const follows = sqliteTable('follows', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  followerId: integer('follower_id').references(() => users.id),
  followingId: integer('following_id').references(() => users.id),
  createdAt: text('created_at').notNull(),
});

// Likes table - Post likes/reactions
export const likes = sqliteTable('likes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  postId: integer('post_id').references(() => posts.id),
  createdAt: text('created_at').notNull(),
});

// Comments table - Post comments
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  postId: integer('post_id').references(() => posts.id),
  content: text('content').notNull(),
  createdAt: text('created_at').notNull(),
});

// Messages table - Direct messaging between users
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  senderId: integer('sender_id').references(() => users.id),
  receiverId: integer('receiver_id').references(() => users.id),
  content: text('content').notNull(),
  messageType: text('message_type').notNull().default('text'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

// Bookings table - Service bookings and rentals
export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  renterId: integer('renter_id').references(() => users.id),
  providerId: integer('provider_id').references(() => users.id),
  postId: integer('post_id').references(() => posts.id),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalAmount: integer('total_amount').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});


// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});