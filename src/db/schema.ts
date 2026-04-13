import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  last_login: integer('last_login', { mode: 'timestamp' }),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  slug: text('slug').notNull().unique(),
  display_order: integer('display_order').default(0),
  imageUrl: text('image_url'),
  isFeatured: integer('is_featured', { mode: 'boolean' }).default(false),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  categoryId: text('category_id')
    .notNull()
    .references(() => categories.id),
  name: text('name').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  fabricante: text('fabricante'),
  oz: text('oz'),
  composicion: text('composicion'),
  ancho: text('ancho'),
  colores: text('colores', { mode: 'json' }).$type<string[]>().default([]),
  isOffer: integer('is_offer', { mode: 'boolean' }).default(false),
  season: text('season'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  display_order: integer('display_order').default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const siteContentLists = sqliteTable('site_content_lists', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // 'home_feature', 'b2b_benefit', 'b2b_client'
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'), // Lucide icon name
  displayOrder: integer('display_order').default(0),
});

export const siteSettings = sqliteTable('site_settings', {
  id: text('id').primaryKey(),
  heroTitle: text('hero_title').notNull().default('Telas por Mayor en Once'),
  heroSubtitle: text('hero_subtitle'),
  heroImageUrl: text('hero_image_url'),
  whatsappNumber: text('whatsapp_number'),
  instagramUrl: text('instagram_url'),
  facebookUrl: text('facebook_url'),
  tiktokUrl: text('tiktok_url'),
  address: text('address'),
  businessHours: text('business_hours'),
  contactEmail: text('contact_email'),
  aboutP1: text('about_p1'),
  aboutP2: text('about_p2'),
  commitmentText: text('commitment_text'),
  statsYears: text('stats_years'),
  statsCoverage: text('stats_coverage'),
  mapEmbedUrl: text('map_embed_url'),
  aiEnabled: integer('ai_enabled', { mode: 'boolean' }).default(true),
  aiTone: text('ai_tone').default('Profesional y directo'),
  aiKnowledge: text('ai_knowledge'),
  aiCallToAction: text('ai_call_to_action').default('Para pasarte la lista actualizada y el stock real de hoy, por favor escribinos a nuestro WhatsApp oficial:'),
  ctaTitle: text('cta_title').default('¿Buscás telas por mayor para tu próxima colección?'),
  ctaSubtitle: text('cta_subtitle').default('Nuestro equipo está listo para asesorarte. Escribinos por WhatsApp y recibí atención personalizada al instante.'),
  ctaButtonText: text('cta_button_text').default('Escribinos por WhatsApp'),
  ctaImageUrl: text('cta_image_url'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export const chatSessions = sqliteTable('chat_sessions', {
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  lastActive: integer('last_active', { mode: 'timestamp' }),
});

export const chatMessages = sqliteTable('chat_messages', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull().references(() => chatSessions.id),
  role: text('role').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const brands = sqliteTable('brands', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  imageUrl: text('image_url').notNull(),
  display_order: integer('display_order').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});
