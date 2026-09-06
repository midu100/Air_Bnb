const { getProvider, LlmError } = require("./llmProviders")

// ====== The one place the app talks to a model
// Callers ask for a role (responder, classifier) rather than a model id, so a
// provider swap never leaks a vendor's model name into application code.

const RESPONDER = '@responder'
const CLASSIFIER = '@classifier'

class LlmNotConfiguredError extends Error {
    constructor(detail = 'No AI provider is configured') {
        super(detail)
        this.name = 'LlmNotConfiguredError'
        this.status = 503
        this.notConfigured = true
    }
}

const resolveConfig = () => {
    const id = process.env.AI_PROVIDER || 'gemini'
    const provider = getProvider(id)
    if (!provider) throw new LlmNotConfiguredError(`Unknown AI provider "${id}"`)

    const apiKey = id === 'gemini' ? process.env.GEMINI_API_KEY : process.env.ANTHROPIC_API_KEY
    if (!apiKey) throw new LlmNotConfiguredError(`No API key set for ${provider.label}`)

    return { provider, apiKey }
}

/** True when a key is present, so a route can answer honestly without a call. */
const isConfigured = () => {
    try {
        resolveConfig()
        return true
    } catch {
        return false
    }
}

const resolveModel = (provider, role) => {
    if (role === RESPONDER) return provider.models.responder
    if (role === CLASSIFIER) return provider.models.classifier
    return role
}

const chat = async ({ system, messages, tools, role = RESPONDER, signal }) => {
    const { provider, apiKey } = resolveConfig()

    const model = resolveModel(provider, role)
    if (!model) throw new LlmNotConfiguredError(`${provider.label} has no model for ${role}`)

    return provider.send({ apiKey, model, system, messages, tools, signal })
}

module.exports = { chat, isConfigured, resolveConfig, RESPONDER, CLASSIFIER, LlmNotConfiguredError, LlmError }
