// ====== One adapter per AI vendor, behind a single contract
// The platform holds the key for now and the provider is chosen by env, so
// swapping vendors later is one file and one variable, not a rewrite.
//
// Adapter contract:
//   send({ apiKey, model, system, messages, tools, signal })
//     -> { text: string, toolCalls: [{ id, name, args }] }
//
// `messages` is the neutral internal shape, translated by each adapter:
//   { role: 'user' | 'assistant' | 'tool',
//     text?: string,
//     toolCalls?: [{ id, name, args }],
//     toolName?: string, toolResult?: object }
//
// A tool is { name, description, parameters } with parameters as JSON Schema.

class LlmError extends Error {
    constructor(provider, status, detail) {
        super(`${provider}: ${detail}`)
        this.name = 'LlmError'
        this.provider = provider
        // Treat a bad key as 401 so a controller can say "not configured" honestly
        this.status = status === 401 || status === 403 ? 401 : 502
    }
}

// ====== Gemini
// Google's REST shape differs enough from everyone else's that it gets its own
// translation rather than pretending to be OpenAI-shaped.
const gemini = {
    id: 'gemini',
    label: 'Google Gemini',
    capabilities: { tools: true },
    // Overridable, because Google renames these more often than anyone
    models: {
        responder: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
        classifier: process.env.GEMINI_CLASSIFIER_MODEL || 'gemini-2.0-flash-lite',
    },

    async send({ apiKey, model, system, messages, tools, signal }) {
        const contents = []

        for (const message of messages) {
            if (message.role === 'tool') {
                contents.push({
                    role: 'user',
                    parts: [{
                        functionResponse: {
                            name: message.toolName,
                            // Gemini wants an object here, never a bare string
                            response: { result: message.toolResult },
                        },
                    }],
                })
                continue
            }

            const parts = []
            if (message.text) parts.push({ text: message.text })
            for (const call of message.toolCalls || []) {
                parts.push({ functionCall: { name: call.name, args: call.args || {} } })
            }
            if (!parts.length) continue

            contents.push({ role: message.role === 'assistant' ? 'model' : 'user', parts })
        }

        const body = {
            contents,
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
        }
        if (system) body.systemInstruction = { parts: [{ text: system }] }
        if (tools?.length) {
            body.tools = [{
                functionDeclarations: tools.map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters,
                })),
            }]
        }

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify(body),
            signal,
        })

        if (!response.ok) {
            const detail = await response.text().catch(() => '')
            throw new LlmError('gemini', response.status, detail.slice(0, 300))
        }

        const data = await response.json()
        const parts = data?.candidates?.[0]?.content?.parts || []

        const text = parts.filter((part) => part.text).map((part) => part.text).join('').trim()
        const toolCalls = parts
            .filter((part) => part.functionCall)
            .map((part, index) => ({
                id: `${part.functionCall.name}-${index}`,
                name: part.functionCall.name,
                args: part.functionCall.args || {},
            }))

        return { text, toolCalls }
    },
}

// ====== Anthropic
// Deliberately not implemented yet. When the premium key arrives this becomes a
// real adapter written against the official SDK - guessing at the request shape
// now would only have to be unpicked later.
const anthropic = {
    id: 'anthropic',
    label: 'Anthropic Claude',
    capabilities: { tools: true },
    models: { responder: null, classifier: null },
    async send() {
        throw new LlmError('anthropic', 501, 'The Anthropic adapter is not wired up yet. Set AI_PROVIDER=gemini.')
    },
}

const PROVIDERS = { gemini, anthropic }

const getProvider = (id) => PROVIDERS[id] || null

module.exports = { getProvider, PROVIDERS, LlmError }
