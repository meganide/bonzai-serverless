import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

import middy from "@middy/core"

import createError from "http-errors"

import z from "zod"

export function schemaValidation(
  schema: z.AnyZodObject | z.ZodOptional<z.AnyZodObject>
): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> {
  return {
    before: async (handler) => {
      try {
        schema.parse(handler.event.body)
      } catch (error) {
        let err = error
        if (err instanceof z.ZodError) {
          err = err.issues[0].message
        }
        throw new createError.BadRequest(err as string)
      }
    }
  }
}
