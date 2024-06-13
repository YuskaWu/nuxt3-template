import type z from 'zod'

export type QuerySchema = z.ZodOptional<z.AnyZodObject> | z.ZodObject<z.ZodRawShape>
export type PathParamsSchema = z.ZodOptional<z.AnyZodObject> | z.ZodObject<z.ZodRawShape>
export type PayloadSchema = z.ZodOptional<z.AnyZodObject | z.ZodType<FormData, z.ZodTypeDef, FormData>> | z.ZodObject<z.ZodRawShape> | z.ZodType<FormData, z.ZodTypeDef, FormData>
export type ResponseSchema = z.ZodObject<z.ZodRawShape>

export type ApiSchema = {
  [key: string]: {
    url: string
    method: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'connect' | 'option' | 'trace' | 'head'
    query?: QuerySchema
    pathParams?: PathParamsSchema
    payload?: PayloadSchema
    response: ResponseSchema
  }
}
