import { pgTable, uuid, varchar, text, integer, numeric, boolean, timestamp, date, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 180 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  passwordHash: varchar("password_hash", { length: 512 }).notNull(),
  userType: varchar("user_type", { length: 40 }).default("farmer").notNull(), // farmer|supplier|equipment_owner|dealer
  preferredLanguage: varchar("preferred_language", { length: 5 }).default("en").notNull(),
  state: varchar("state", { length: 80 }),
  district: varchar("district", { length: 80 }),
  taluka: varchar("taluka", { length: 80 }),
  village: varchar("village", { length: 80 }),
  pincode: varchar("pincode", { length: 10 }),
  avatarUrl: text("avatar_url"),
  isVerified: boolean("is_verified").default(false).notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  isSuspended: boolean("is_suspended").default(false).notNull(),
  licenceNo: varchar("licence_no", { length: 80 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar("token_hash", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  nameEn: varchar("name_en", { length: 120 }).notNull(),
  nameHi: varchar("name_hi", { length: 120 }).notNull(),
  nameMr: varchar("name_mr", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  icon: varchar("icon", { length: 40 }).default("sprout").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const listings = pgTable("listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  sellerId: uuid("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").default("").notNull(),
  listingType: varchar("listing_type", { length: 20 }).notNull(), // sell|rent|exchange|free|wanted
  price: numeric("price", { precision: 12, scale: 2 }).default("0").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unit: varchar("unit", { length: 40 }).default("piece").notNull(),
  condition: varchar("condition", { length: 20 }).default("new").notNull(), // new|used|refurbished
  brand: varchar("brand", { length: 120 }),
  model: varchar("model", { length: 120 }),
  mfgYear: integer("mfg_year"),
  state: varchar("state", { length: 80 }),
  district: varchar("district", { length: 80 }),
  taluka: varchar("taluka", { length: 80 }),
  village: varchar("village", { length: 80 }),
  pincode: varchar("pincode", { length: 10 }),
  images: jsonb("images").$type<string[]>().default([]).notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(), // active|paused|sold|removed
  views: integer("views").default(0).notNull(),
  // rental fields
  hourlyPrice: numeric("hourly_price", { precision: 12, scale: 2 }),
  dailyPrice: numeric("daily_price", { precision: 12, scale: 2 }),
  weeklyPrice: numeric("weekly_price", { precision: 12, scale: 2 }),
  securityDeposit: numeric("security_deposit", { precision: 12, scale: 2 }).default("0"),
  deliveryAvailable: boolean("delivery_available").default(false).notNull(),
  rentalTerms: text("rental_terms"),
  // exchange fields
  exchangeFor: varchar("exchange_for", { length: 300 }),
  // regulated product fields
  manufacturer: varchar("manufacturer", { length: 160 }),
  licenceDetails: varchar("licence_details", { length: 160 }),
  batchNo: varchar("batch_no", { length: 80 }),
  expiryDate: date("expiry_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("listings_type_idx").on(t.listingType),
  index("listings_status_idx").on(t.status),
  index("listings_seller_idx").on(t.sellerId),
  index("listings_category_idx").on(t.categoryId),
  index("listings_state_idx").on(t.state),
]);

export const wishlists = pgTable("wishlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("wishlist_unique").on(t.userId, t.listingId)]);

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: "set null" }),
  buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sellerId: uuid("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("conv_unique").on(t.listingId, t.buyerId, t.sellerId)]);

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversationId: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderId: uuid("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: "set null" }),
  buyerId: uuid("buyer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sellerId: uuid("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull(), // purchase|rental|exchange|free
  quantity: integer("quantity").default(1).notNull(),
  agreedPrice: numeric("agreed_price", { precision: 12, scale: 2 }).default("0").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending|accepted|rejected|completed|cancelled|disputed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const rentalRequests = pgTable("rental_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  listingId: uuid("listing_id").notNull().references(() => listings.id, { onDelete: "cascade" }),
  renterId: uuid("renter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  estimatedAmount: numeric("estimated_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  deposit: numeric("deposit", { precision: 12, scale: 2 }).default("0").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending|accepted|rejected|confirmed|active|completed|cancelled|disputed
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  transactionId: uuid("transaction_id").references(() => transactions.id, { onDelete: "set null" }),
  reviewerId: uuid("reviewer_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  revieweeId: uuid("reviewee_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isHidden: boolean("is_hidden").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("review_unique").on(t.transactionId, t.reviewerId)]);

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 40 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body"),
  link: varchar("link", { length: 300 }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  reporterId: uuid("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: "cascade" }),
  reason: varchar("reason", { length: 80 }).notNull(),
  details: text("details"),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 120 }).notNull(),
  targetType: varchar("target_type", { length: 40 }),
  targetId: varchar("target_id", { length: 80 }),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
