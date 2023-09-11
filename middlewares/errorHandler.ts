import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"

import middy from "@middy/core"
import httpErrorHandler from "@middy/http-error-handler"

function errorHandler(): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> {
  return {
    onError: async (handler) => {
      const { error } = handler
      handler.response = {
        statusCode: (error as any)?.statusCode ?? 500,
        body: JSON.stringify({
          success: false,
          message: error?.message || "Internal Server Error"
        })
      }
    }
  }
}

export const errorHandlers = [httpErrorHandler(), errorHandler()]
