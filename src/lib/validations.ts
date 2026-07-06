import { z } from "zod"

export const customProductSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().nullable().optional(),
  price: z.coerce.number().min(0, "El precio debe ser un número positivo"),
  stock: z.coerce.number().min(0).default(1),
  category: z.string().nullable().optional(),
  images: z.array(z.string().url()).optional().default([])
})

export const saleCustomSchema = z.object({
  customProductId: z.number().int().positive(),
  quantity: z.coerce.number().int().positive(),
  salePrice: z.coerce.number().min(0),
  action: z.enum(["sell_available", "sell_reserved"]).optional(),
  notes: z.string().nullable().optional()
})

export const saleEditSchema = z.object({
  action: z.enum(["edit", "revert"]),
  salePrice: z.coerce.number().min(0).optional(),
  notes: z.string().nullable().optional()
})

export const locationSchema = z.object({
  name: z.string().min(1, "El nombre de la ubicación es requerido")
})
