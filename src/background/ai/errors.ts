import { APICallError } from "ai"
import type { AIProviderId } from "../../shared/types"

export class AIConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AIConfigError"
  }
}

export function formatAIError(error: unknown, provider?: AIProviderId): string {
  if (error instanceof AIConfigError) {
    return error.message
  }

  if (APICallError.isInstance(error)) {
    const status = error.statusCode
    const rawMsg = extractApiMessage(error.responseBody) || error.message

    if (status === 401) {
      return `API Key inválida o no autorizada (401). Revisa tus credenciales.${rawMsg ? ` Detalle: ${rawMsg}` : ""}`
    }
    if (status === 403) {
      return `Acceso denegado (403). Tu API Key no tiene permisos para este modelo o región.${rawMsg ? ` Detalle: ${rawMsg}` : ""}`
    }
    if (status === 404) {
      return `Modelo o endpoint no encontrado (404). Comprueba el nombre del modelo y la URL.${rawMsg ? ` Detalle: ${rawMsg}` : ""}`
    }
    if (status === 429) {
      return `Límite de peticiones o cuota excedida (429). Espera un momento o revisa tu saldo.${rawMsg ? ` Detalle: ${rawMsg}` : ""}`
    }
    if (status && status >= 500) {
      return `Error temporal en el servidor del proveedor (${status}). Inténtalo de nuevo en unos segundos.`
    }
    return `Error del proveedor${status ? ` (${status})` : ""}: ${rawMsg}`
  }

  if (error instanceof DOMException && error.name === "TimeoutError") {
    return "Tiempo de espera agotado. El modelo tardó demasiado en responder; puedes aumentar el timeout en ajustes avanzados."
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return "Petición cancelada o tiempo de espera agotado."
  }

  if (error instanceof TypeError && /fetch|network/i.test(error.message)) {
    if (provider === "ollama") {
      return "No se pudo conectar con Ollama. Asegúrate de que está ejecutándose y que permite orígenes de extensión (variable OLLAMA_ORIGINS=*)."
    }
    if (provider === "lmstudio") {
      return "No se pudo conectar con LM Studio. Asegúrate de que el servidor local está iniciado y con CORS habilitado."
    }
    return `Error de red o CORS al conectar con el endpoint: ${error.message}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function extractApiMessage(responseBody?: string): string | null {
  if (!responseBody) return null
  try {
    const parsed = JSON.parse(responseBody) as Record<string, unknown>
    if (typeof parsed.message === "string") return parsed.message
    if (
      parsed.error &&
      typeof parsed.error === "object" &&
      typeof (parsed.error as Record<string, unknown>).message === "string"
    ) {
      return (parsed.error as Record<string, unknown>).message as string
    }
    if (typeof parsed.error === "string") return parsed.error
  } catch {
    // Non-JSON body
  }
  return responseBody.length > 200
    ? `${responseBody.slice(0, 200)}...`
    : responseBody
}
