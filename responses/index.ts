export function sendResponse(statusCode: number, response: any) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ success: true, ...response })
  }
}
