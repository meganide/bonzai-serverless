import { APIGatewayProxyResult } from "aws-lambda"

export function sendResponse(
  statusCode: number,
  response: any
): APIGatewayProxyResult {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(response)
  }
}
