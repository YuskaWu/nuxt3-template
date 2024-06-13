import z from 'zod'
import ingredient from './api.ingredient'
import recipe from './api.recipe'

export const API_SCHEMA = {
  ...ingredient,
  ...recipe
}

export type ApiNames = keyof typeof API_SCHEMA
export type ApiResponse = {
  [ApiName in ApiNames]: z.infer<typeof API_SCHEMA[ApiName]['response']>
}

// extract the inferred params type of Zod.
// omit 'method', 'url' and 'response' remains 'pathParams', 'query' and 'payload'.
type InferParams<ApiName extends ApiNames, ParamSchema = Omit<typeof API_SCHEMA[ApiName], 'method' | 'url' | 'response'>> = {
  -readonly [key in keyof ParamSchema]: ParamSchema[key] extends z.ZodType ? z.infer<ParamSchema[key]> : never
}

// ConvertToOptional is used to convert keys that can be undefined to optional
type ConvertToOptional<S, T> = { [K in keyof (S & T)]: (S & T)[K] }

// ApiParams is the type of parameter object which is required for calling specific API
export type ApiParams<ApiName extends ApiNames> = ConvertToOptional<{
  [key in keyof InferParams<ApiName> as undefined extends InferParams<ApiName>[key] ? never : key]: InferParams<ApiName>[key]
}, {
  [key in keyof InferParams<ApiName> as undefined extends InferParams<ApiName>[key] ? key : never]?: NonNullable<InferParams<ApiName>[key]>
}
>

export const errorResponseParser = z.object({
  code: z.number(),
  message: z.string(),
  status: z.string()
})
