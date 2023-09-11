import z from "zod"
import { sendResponse } from "../responses/index.ts"

export async function validateSchema(
  schema: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>,
  body: any
) {
  try {
    await schema.parseAsync(body)
  } catch (error) {
    let err = error
    if (err instanceof z.ZodError) {
      err = err.issues.map((zodError) => zodError.message).join(" ")
    }
    return sendResponse(409, {
      success: false,
      message: err
    })
  }
}
