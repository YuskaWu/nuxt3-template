import z from 'zod'
import type { ApiSchema } from './types'

// Define API schema:
// 1. Must define "url" and 'method' attribute
// 2. Must define "response" zod schema which is the response json of API.
// 3. Must define "pathParams" zod schema if the API URL is dynamic.
// 4. Define "query" zod schema if the API support query string.
// 5. Define "payload" zod schema if the method is POST, PUT, DELETE or PATCH
// 6. The end of schema object need to append "as const satisfies ApiSchema" to constraint the type of schema object.

// URL support dynamic path syntax(see https://github.com/pillarjs/path-to-regexp), which will be compiled in useApi.ts
// useApi will use "pathParams" definition to compile API URL.

export default {
  // https://spoonacular.com/food-api/docs#Ingredient-Search
  searchIngredient: {
    url: '/food/ingredients/search',
    method: 'get',
    query: z.object({
      query: z.string(),
      addChildren: z.boolean().optional(),
      minProteinPercent: z.number().optional(),
      maxProteinPercent: z.number().optional(),
      minFatPercent: z.number().optional(),
      maxFatPercent: z.number().optional(),
      minCarbsPercent: z.number().optional(),
      maxCarbsPercent: z.number().optional(),
      metaInformation: z.boolean().optional(),
      intolerances: z.string().optional(),
      sort: z.string().optional(),
      sortDirection: z.string().optional(),
      language: z.string().optional(),
      offset: z.number().optional(),
      number: z.number().optional()
    }),
    response: z.object({
      result: z.array(
        z.object({
          id: z.number(),
          name: z.string(),
          image: z.string()
        })
      ),
      offset: z.number(),
      number: z.number(),
      totalResults: z.number()
    })
  },

  // https://spoonacular.com/food-api/docs#Get-Ingredient-Information
  getIngredientInfo: {
    // :id is a variable defined in pathParams attribute
    url: '/food/ingredients/:id/information',
    method: 'get',
    pathParams: z.object({
      id: z.number()
    }),
    payload: z.instanceof(FormData).optional(),
    query: z
      .object({
        amount: z.number().optional(),
        unit: z.string().optional()
      })
      .optional(),
    response: z.object({
      id: z.number(),
      original: z.string(),
      originalName: z.string(),
      name: z.string(),
      nameClean: z.string(),
      amount: z.number(),
      unit: z.string(),
      unitShort: z.string(),
      unitLong: z.string(),
      possibleUnits: z.array(z.string()),
      estimatedCost: z.object({
        value: z.number(),
        unit: z.string()
      }),
      consistency: z.string(),
      shoppingListUnits: z.array(z.string()),
      aisle: z.string(),
      image: z.string(),
      meta: z.array(z.instanceof(Object)),
      nutrition: z.object({
        nutrients: z.object({
          name: z.string(),
          amount: z.number(),
          unit: z.string(),
          percentOfDailyNeeds: z.number()
        }),
        properties: z.object({
          name: z.string(),
          amount: z.number(),
          unit: z.string()
        }),
        caloricBreakdown: z.object({
          percentProtein: z.number(),
          percentFat: z.number(),
          percentCarbs: z.number()
        }),
        weightPerServing: z.object({
          amount: z.number(),
          unit: z.string()
        })
      }),
      categoryPath: z.array(z.string())
    })
  }
} as const satisfies ApiSchema
