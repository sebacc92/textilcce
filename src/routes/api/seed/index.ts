import type { RequestHandler } from '@builder.io/qwik-city';
import { getDb } from '../../../db/client';
import { products, categories } from '../../../db/schema';
import { eq } from 'drizzle-orm';

const productsToUpdate = [
  {
    id: "2ccdc881-189c-46ff-b4eb-5014697c85c1", // Batista
    fabricante: "CLADD", composicion: "65% Algodón 35% poliester", ancho: "1,50MTS", sublimar: false, estampar: true, bordar: true
  },
  {
    id: "0f428ffd-cdf6-4110-97df-34fb93740e5e", // Gabardina con Lycra CCE
    fabricante: "CCE", oz: "7", composicion: "97% ALGODÓN 3% ELASTANO", ancho: "1,55 MTS", sublimar: false, estampar: false, bordar: true
  },
  {
    id: "8ca08515-b8db-405d-800d-72e519fb0429", // Gabardina con Lycra Tecotex
    fabricante: "TECOTEX", oz: "7", composicion: "98% ALGODÓN 2% ELASTANO", ancho: "1,45 MTS", sublimar: false, estampar: false, bordar: true
  },
  {
    id: "70f4d525-8780-4a94-9f6e-ee39fbeece84", // Gabardina 6OZ
    fabricante: "TECOTEX", oz: "6", composicion: "100% ALGODÓN", ancho: "1,6 MTS", sublimar: false, estampar: false, bordar: true
  },
  {
    id: "b0c7ea2b-ec7b-411f-91d7-d63239a6332d", // Gabardina 8OZ
    fabricante: "TECOTEX", oz: "8", composicion: "100% ALGODÓN", ancho: "1,6 MTS", sublimar: false, estampar: false, bordar: true
  },
  {
    id: "2909737e-2578-4782-b4df-9a8ff75d0a04", // Frisa Algodón
    fabricante: "CLADD", composicion: "100% Algodón", ancho: "0,9MTS TUBULAR", rinde: "1,85MTS", complemento: "PUÑO REEB", sublimar: false, estampar: true, bordar: true
  },
  {
    id: "518a2f22-5b6e-4ed2-9230-1ca9f1aee220", // Frisa Peinada
    fabricante: "CLADD", composicion: "50% ALGODÓN 50% POLIESTER", ancho: "0,9MTS TUBULAR", rinde: "1,8MTS", complemento: "PUÑO MORLEY", sublimar: false, estampar: true, bordar: true
  },
  {
    id: "9e7a1c44-e01d-420d-8b79-f46d4075e4a0", // Deportivo Frizado (En el excel: FRISA DEPORTIVO)
    fabricante: "NACIONAL", composicion: "100% POLIESTER", ancho: "1,6MTS", rinde: "2.4MTS", complemento: "PUÑO DEPORTIVO", sublimar: true, estampar: false, bordar: true
  },
  {
    id: "63b5345a-c064-4ce1-a535-15d41f308547", // Rústico (En el excel: RUSTICO CARDADO LIVIANO)
    fabricante: "CLADD", composicion: "100% ALGODÓN", ancho: "0,9 tubular", rinde: "2,4 mts", sublimar: false, estampar: true, bordar: true
  }
];

const newProductsToInsert = [
  { name: "Fibrana Estampada Poplin", categoryName: "Otras Telas Planas", fabricante: null, composicion: "100% POPLIN", ancho: "1,55MTS", rinde: null, complemento: null, sublimar: false, estampar: false, bordar: false },
  { name: "Fibrana Estampada Rayon", categoryName: "Otras Telas Planas", fabricante: null, composicion: "100% RAYON", ancho: "1,55MTS", rinde: null, complemento: null, sublimar: false, estampar: false, bordar: false },
  { name: "Guardapolvo Importado CLADD", categoryName: "Telas Escolares", fabricante: "CLADD", composicion: "Poliéster 65% / Algodón 35%", ancho: "1,6 MTS", rinde: null, complemento: null, sublimar: false, estampar: true, bordar: true },
  { name: "Guardapolvo Importado IMPORTADA", categoryName: "Telas Escolares", fabricante: "IMPORTADA", composicion: "Poliéster 65% / Algodón 35%", ancho: "1,6 MTS", rinde: null, complemento: null, sublimar: false, estampar: true, bordar: true },
  { name: "Lienzo 20/20 CCE", categoryName: "Otras Telas Planas", fabricante: "CCE", composicion: "100% ALGODÓN", ancho: "1,6 MTS", rinde: null, complemento: null, sublimar: false, estampar: false, bordar: false },
  { name: "Pantalonero Nautico CCE", categoryName: "Otras Telas Planas", fabricante: "CCE", composicion: "100% ALGODÓN", ancho: "1,6 MTS", rinde: null, complemento: null, sublimar: false, estampar: false, bordar: false },
  { name: "Corderoy IMPORTADA", categoryName: "Otras Telas Planas", fabricante: "IMPORTADA", composicion: null, ancho: "1,6 MTS", rinde: null, complemento: null, sublimar: false, estampar: false, bordar: false },
  { name: "Pintorcito IMPORTADA", categoryName: "Telas Escolares", fabricante: "IMPORTADA", composicion: "100% POLIESTER", ancho: "1,5 MTS", rinde: null, complemento: null, sublimar: false, estampar: false, bordar: false },
  { name: "Jersey 24/1 Algodón Peinado CLADD", categoryName: "Telas de Punto", fabricante: "CLADD", composicion: "100% ALGODÓN", ancho: "0,9 tubular", rinde: "3,5MTS", complemento: "PUÑO REEB", sublimar: false, estampar: true, bordar: true },
  { name: "Morley Verano CLADD", categoryName: "Telas de Punto", fabricante: "CLADD", composicion: "Polyester", ancho: "1,65 MTS", rinde: "3,5 MTS", complemento: null, sublimar: false, estampar: false, bordar: false }
];

// Reutilizamos slugify básico
const slugify = (text: string) => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

export const onGet: RequestHandler = async ({ env, json }) => {
  const db = getDb(env);
  const logs: string[] = [];
  
  try {
    // 1. UPDATE EXISTING PRODUCTS
    logs.push("Starting updates for existing products...");
    
    // We execute them sequentially to trace errors, but they could be Promise.all
    for (const p of productsToUpdate) {
      await db.update(products).set({
        fabricante: p.fabricante,
        composicion: p.composicion,
        ancho: p.ancho,
        oz: (p as any).oz || null,
        rinde: (p as any).rinde || null,
        complemento: (p as any).complemento || null,
        sublimar: p.sublimar,
        estampar: p.estampar,
        bordar: p.bordar,
        updatedAt: new Date(),
      }).where(eq(products.id, p.id));
      
      logs.push(`Updated product ID: ${p.id}`);
    }

    // 2. FETCH OR CREATE CATEGORIES
    logs.push("Processing new categories...");
    const currentCategories = await db.select().from(categories);
    const categoryNameCache = new Map<string, string>(); // categoryName -> categoryId
    
    currentCategories.forEach(c => categoryNameCache.set(c.name.toLowerCase(), c.id));
    
    // Extract unique category names from payload
    const neededCategoryNames = [...new Set(newProductsToInsert.map(p => p.categoryName))];
    
    for (const catName of neededCategoryNames) {
      if (!categoryNameCache.has(catName.toLowerCase())) {
        const newCatId = crypto.randomUUID();
        const newSlug = slugify(catName);
        
        await db.insert(categories).values({
          id: newCatId,
          name: catName,
          slug: newSlug,
          isFeatured: false,
          display_order: 10,
        });
        
        categoryNameCache.set(catName.toLowerCase(), newCatId);
        logs.push(`Created new category: ${catName} (${newCatId})`);
      }
    }

    // 3. INSERT NEW PRODUCTS
    logs.push("Inserting new products...");
    for (const p of newProductsToInsert) {
      const catId = categoryNameCache.get(p.categoryName.toLowerCase());
      if (!catId) throw new Error(`Category not found for ${p.name}`);
      
      const newId = crypto.randomUUID();
      await db.insert(products).values({
        id: newId,
        name: p.name,
        categoryId: catId,
        fabricante: p.fabricante,
        composicion: p.composicion,
        ancho: p.ancho,
        rinde: p.rinde,
        complemento: p.complemento,
        sublimar: p.sublimar,
        estampar: p.estampar,
        bordar: p.bordar,
        isActive: true,
        isOffer: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      logs.push(`Inserted new product: ${p.name} (${newId})`);
    }

    json(200, { success: true, message: "Migration completed successfully", logs });
  } catch (err: any) {
    logs.push(`ERROR: ${err.message}`);
    json(500, { success: false, error: err.message, logs });
  }
};
