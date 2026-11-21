import type { AIModelInfo, AIProviderId } from "./types"

export type ProviderCategory = "cloud" | "aggregator" | "local" | "custom"

export interface AIProviderDefinition {
  id: AIProviderId
  name: string
  category: ProviderCategory
  description: string
  defaultEndpoint: string
  requiresApiKey: boolean
  showEndpointByDefault: boolean
  apiKeyPlaceholder: string
  apiKeyUrl?: string
  supportsModelDiscovery: boolean
  suggestedModels: AIModelInfo[]
}

export const AI_PROVIDERS: readonly AIProviderDefinition[] = [
  {
    id: "openai",
    name: "OpenAI",
    category: "cloud",
    description: "Modelos GPT-4o, GPT-4.1, o3 y o4-mini de OpenAI.",
    defaultEndpoint: "https://api.openai.com/v1",
    requiresApiKey: true,
    showEndpointByDefault: false,
    apiKeyPlaceholder: "sk-proj-...",
    apiKeyUrl: "https://platform.openai.com/api-keys",
    supportsModelDiscovery: true,
    suggestedModels: [
      { id: "gpt-4o-mini", name: "GPT-4o mini", description: "Rápido y económico (recomendado)" },
      { id: "gpt-4.1-nano", name: "GPT-4.1 nano", description: "Ultra rápido y muy barato" },
      { id: "gpt-4.1-mini", name: "GPT-4.1 mini", description: "Equilibrado" },
      { id: "gpt-4o", name: "GPT-4o", description: "Alta precisión" },
    ],
  },
  {
    id: "google",
    name: "Google Gemini",
    category: "cloud",
    description: "Modelos Gemini con capa gratuita generosa en Google AI Studio.",
    defaultEndpoint: "https://generativelanguage.googleapis.com/v1beta",
    requiresApiKey: true,
    showEndpointByDefault: false,
    apiKeyPlaceholder: "AIzaSy...",
    apiKeyUrl: "https://aistudio.google.com/apikey",
    supportsModelDiscovery: true,
    suggestedModels: [
      { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash-Lite", description: "Muy rápido y económico" },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", description: "Rápido y preciso (recomendado)" },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Rápido y estable" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", description: "Máxima calidad" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    category: "cloud",
    description: "Modelos Claude Haiku y Sonnet directamente desde la API de Anthropic.",
    defaultEndpoint: "https://api.anthropic.com/v1",
    requiresApiKey: true,
    showEndpointByDefault: false,
    apiKeyPlaceholder: "sk-ant-...",
    apiKeyUrl: "https://console.anthropic.com/settings/keys",
    supportsModelDiscovery: true,
    suggestedModels: [
      { id: "claude-3-5-haiku-latest", name: "Claude 3.5 Haiku", description: "Rápido y económico (recomendado)" },
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", description: "Alta precisión" },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    category: "aggregator",
    description: "Una sola API Key para acceder a cientos de modelos (incluso gratuitos).",
    defaultEndpoint: "https://openrouter.ai/api/v1",
    requiresApiKey: true,
    showEndpointByDefault: false,
    apiKeyPlaceholder: "sk-or-v1-...",
    apiKeyUrl: "https://openrouter.ai/keys",
    supportsModelDiscovery: true,
    suggestedModels: [
      { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", description: "Muy rápido y barato" },
      { id: "openai/gpt-4o-mini", name: "GPT-4o mini", description: "Equilibrado" },
      { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)", description: "Modelo gratuito" },
      { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek V3", description: "Excelente relación calidad/precio" },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    category: "cloud",
    description: "Inferencia ultrarrápida para Llama, Gemma y Qwen (incluye plan gratuito).",
    defaultEndpoint: "https://api.groq.com/openai/v1",
    requiresApiKey: true,
    showEndpointByDefault: false,
    apiKeyPlaceholder: "gsk_...",
    apiKeyUrl: "https://console.groq.com/keys",
    supportsModelDiscovery: true,
    suggestedModels: [
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", description: "Ultrarrápido (recomendado)" },
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile", description: "Mayor precisión" },
      { id: "gemma2-9b-it", name: "Gemma 2 9B", description: "Ligero y rápido" },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    category: "cloud",
    description: "Modelos DeepSeek Chat y Reasoner a muy bajo coste.",
    defaultEndpoint: "https://api.deepseek.com",
    requiresApiKey: true,
    showEndpointByDefault: false,
    apiKeyPlaceholder: "sk-...",
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
    supportsModelDiscovery: true,
    suggestedModels: [
      { id: "deepseek-chat", name: "DeepSeek Chat (V3)", description: "Rápido y económico (recomendado)" },
      { id: "deepseek-reasoner", name: "DeepSeek Reasoner (R1)", description: "Razonamiento avanzado" },
    ],
  },
  {
    id: "mistral",
    name: "Mistral AI",
    category: "cloud",
    description: "Modelos europeos Mistral Small, Ministral y Large.",
    defaultEndpoint: "https://api.mistral.ai/v1",
    requiresApiKey: true,
    showEndpointByDefault: false,
    apiKeyPlaceholder: "...",
    apiKeyUrl: "https://console.mistral.ai/api-keys/",
    supportsModelDiscovery: true,
    suggestedModels: [
      { id: "mistral-small-latest", name: "Mistral Small", description: "Rápido y económico (recomendado)" },
      { id: "ministral-8b-latest", name: "Ministral 8B", description: "Muy ligero" },
      { id: "mistral-large-latest", name: "Mistral Large", description: "Máxima capacidad" },
    ],
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    category: "cloud",
    description: "Modelos Grok de xAI.",
    defaultEndpoint: "https://api.x.ai/v1",
    requiresApiKey: true,
    showEndpointByDefault: false,
    apiKeyPlaceholder: "xai-...",
    apiKeyUrl: "https://console.x.ai/",
    supportsModelDiscovery: true,
    suggestedModels: [
      { id: "grok-3-mini", name: "Grok 3 Mini", description: "Rápido y económico (recomendado)" },
      { id: "grok-3", name: "Grok 3", description: "Alta capacidad" },
    ],
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    category: "local",
    description: "Ejecuta modelos en tu propio equipo sin API Key ni costes.",
    defaultEndpoint: "http://localhost:11434/v1",
    requiresApiKey: false,
    showEndpointByDefault: true,
    apiKeyPlaceholder: "No necesaria (opcional)",
    supportsModelDiscovery: true,
    suggestedModels: [
      { id: "llama3.2", name: "Llama 3.2", description: "Ligero y rápido en local" },
      { id: "qwen2.5:7b", name: "Qwen 2.5 7B", description: "Muy bueno con JSON y español" },
      { id: "gemma3:4b", name: "Gemma 3 4B", description: "Compacto y eficiente" },
      { id: "mistral", name: "Mistral 7B", description: "Clásico versátil" },
    ],
  },
  {
    id: "lmstudio",
    name: "LM Studio (Local)",
    category: "local",
    description: "Servidor local de LM Studio compatible con OpenAI.",
    defaultEndpoint: "http://localhost:1234/v1",
    requiresApiKey: false,
    showEndpointByDefault: true,
    apiKeyPlaceholder: "No necesaria (opcional)",
    supportsModelDiscovery: true,
    suggestedModels: [
      { id: "local-model", name: "Modelo cargado en LM Studio", description: "Pulsa 'Cargar modelos' para detectar el activo" },
    ],
  },
  {
    id: "custom",
    name: "Personalizado (OpenAI-compatible)",
    category: "custom",
    description: "Cualquier servidor compatible con la API de OpenAI (Together, Fireworks, vLLM, Perplexity, Azure, proxies...).",
    defaultEndpoint: "",
    requiresApiKey: false,
    showEndpointByDefault: true,
    apiKeyPlaceholder: "Opcional según el servidor",
    supportsModelDiscovery: true,
    suggestedModels: [],
  },
] as const

export const PROVIDER_CATEGORIES: { id: ProviderCategory; label: string }[] = [
  { id: "cloud", label: "Proveedores en la nube" },
  { id: "aggregator", label: "Agregadores" },
  { id: "local", label: "Local (en tu PC)" },
  { id: "custom", label: "Personalizado" },
]

export function getProviderDefinition(id: AIProviderId): AIProviderDefinition {
  return AI_PROVIDERS.find((p) => p.id === id) ?? AI_PROVIDERS[0]
}

export function inferProviderFromEndpoint(endpoint: string): AIProviderId {
  const normalized = endpoint.trim().toLowerCase()
  if (!normalized) return "openai"

  if (normalized.includes("api.openai.com")) return "openai"
  if (normalized.includes("anthropic.com")) return "anthropic"
  if (normalized.includes("generativelanguage.googleapis.com")) return "google"
  if (normalized.includes("openrouter.ai")) return "openrouter"
  if (normalized.includes("groq.com")) return "groq"
  if (normalized.includes("deepseek.com")) return "deepseek"
  if (normalized.includes("mistral.ai")) return "mistral"
  if (normalized.includes("api.x.ai")) return "xai"
  if (normalized.includes(":11434") || normalized.includes("ollama")) return "ollama"
  if (normalized.includes(":1234")) return "lmstudio"

  return "custom"
}
