import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';



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

// Additional profiles and social features
export const profiles = sqliteTable('profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).unique().notNull(),
  location: text('location'),
  bio: text('bio'),
  rating: real('rating').default(0),
  verified: integer('verified', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
});

export const follows = sqliteTable('follows', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  followerId: text('follower_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  followingId: text('following_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  status: text('status', { enum: ['pending', 'accepted', 'rejected'] }).default('pending').notNull(),
  createdAt: text('created_at').notNull(),
});

export const contacts = sqliteTable('contacts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ownerId: text('owner_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  contactUserId: text('contact_user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  createdAt: text('created_at').notNull(),
});

export const conversations = sqliteTable('conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  isGroup: integer('is_group', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull(),
});

export const conversationParticipants = sqliteTable('conversation_participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  lastReadMessageId: integer('last_read_message_id'),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
  senderId: text('sender_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  status: text('status', { enum: ['sent', 'delivered', 'read'] }).default('sent').notNull(),
  createdAt: text('created_at').notNull(),
});

export const services = sqliteTable('services', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ownerId: text('owner_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category'),
  price: integer('price').notNull(),
  priceUnit: text('price_unit', { enum: ['hour', 'day', 'session'] }).default('hour').notNull(),
  location: text('location'),
  images: text('images', { mode: 'json' }).default('[]'),
  availableDates: text('available_dates', { mode: 'json' }).default('[]'),
  isAvailable: integer('is_available', { mode: 'boolean' }).default(true).notNull(),
  createdAt: text('created_at').notNull(),
});

export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  serviceId: integer('service_id').references(() => services.id, { onDelete: 'cascade' }).notNull(),
  createdAt: text('created_at').notNull(),
});

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  serviceId: integer('service_id').references(() => services.id, { onDelete: 'cascade' }).notNull(),
  customerId: text('customer_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').notNull(),
  durationHours: integer('duration_hours').default(1).notNull(),
  totalPrice: integer('total_price').notNull(),
  status: text('status', { enum: ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'] }).default('pending').notNull(),
  createdAt: text('created_at').notNull(),
});