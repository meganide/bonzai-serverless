import middy from "@middy/core"
import httpErrorHandler from "@middy/http-error-handler"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { HttpError } from "http-errors"

function jsonErrorHandler(): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> {
  return {
    onError: async (handler) => {
      const { error } = handler
      handler.response = {
        statusCode: (error as HttpError)?.statusCode ?? 500,
        body: JSON.stringify({
          success: false,
          message: error?.message || "Internal Server Error"
        })
      }
    }
  }
}

export const errorHandler = () => [httpErrorHandler(), jsonErrorHandler()]
