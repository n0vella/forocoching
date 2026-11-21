import type { RuntimeRequest, RuntimeResponse } from "./types"

export async function sendRuntimeMessage<T extends RuntimeRequest>(
  message: T,
): Promise<RuntimeResponse<T["action"]>> {
  try {
    const response = (await chrome.runtime.sendMessage(message)) as
      | RuntimeResponse<T["action"]>
      | undefined

    if (!response) {
      return {
        ok: false,
        error: "No se recibió respuesta del proceso en segundo plano.",
      } as RuntimeResponse<T["action"]>
    }

    return response
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      error: `Error de comunicación con el background: ${detail}`,
    } as RuntimeResponse<T["action"]>
  }
}
