const agentRunSchema = require("../models/agentRunSchema")
const { chat, RESPONDER, LlmNotConfiguredError } = require("./llmClient")
const { tools, toolSchemas } = require("./agentTools")

// ====== The agent loop
//
// A read runs immediately and its result feeds the next round. A write is
// validated, turned into a proposal and stopped — the model is told it is queued
// so it does not try again. The change only happens in executeProposal(), which
// validates the arguments a second time.
//
// Budgets exist so one question cannot run away with the API bill.
const MAX_ROUNDS = 5
const MAX_READS = 10
const MAX_PROPOSALS = 6

const SYSTEM = [
    'You are the business assistant inside a short, mid and long term rental platform.',
    'You are talking to a host about their own listings. You can only ever see their data.',
    '',
    'How to work:',
    '- Resolve a property name to an id with search_properties before any tool that needs one.',
    '- Answer performance questions from property_performance, never from memory or guesswork.',
    '- For "when should I run a promotion", use find_empty_dates: it reports the gaps and the',
    '  date a campaign must launch by to still reach guests booking that far ahead.',
    '- Quote real figures. If a tool returns nothing, say so rather than inventing a number.',
    '',
    'Making changes:',
    '- Every change you propose is queued for the host to confirm. Nothing happens until they do.',
    '- Propose confidently when the request is clear. Ask one short question when it is not.',
    '- After proposing, say plainly what you queued and that it needs their confirmation.',
    '- Do not call the same write tool twice for the same change.',
    '',
    'Style: be brief and concrete. Lead with the number or the recommendation, then the reason.',
].join('\n')

const runAgent = async ({ hostId, question, history = [] }) => {
    const run = await agentRunSchema.create({ host: hostId, question, reads: [], proposals: [] })

    // Prior turns give continuity without replaying every tool result
    const messages = [
        ...history.slice(-6).map((item) => ({
            role: item.role === 'assistant' ? 'assistant' : 'user',
            text: item.text,
        })),
        { role: 'user', text: question },
    ]

    const proposals = []
    let reads = 0
    let answer = ''

    try {
        for (let round = 0; round < MAX_ROUNDS; round++) {
            const reply = await chat({ system: SYSTEM, messages, tools: toolSchemas(), role: RESPONDER })

            if (reply.text) answer = reply.text

            const calls = reply.toolCalls || []
            if (!calls.length) break

            messages.push({ role: 'assistant', text: reply.text || '', toolCalls: calls })

            for (const call of calls) {
                const tool = tools[call.name]

                const respond = (result) => {
                    messages.push({ role: 'tool', toolName: call.name, toolResult: result })
                }

                if (!tool) {
                    respond({ error: `No tool named ${call.name}` })
                    continue
                }

                let args
                try {
                    args = tool.validate(call.args || {})
                } catch (error) {
                    respond({ error: error.message })
                    if (tool.kind === 'read') run.reads.push({ tool: call.name, args: call.args, ok: false, error: error.message })
                    continue
                }

                // ====== Write: capture it, never run it here
                if (tool.kind === 'write') {
                    if (proposals.length >= MAX_PROPOSALS) {
                        respond({ error: `Too many changes proposed in one turn (max ${MAX_PROPOSALS})` })
                        continue
                    }
                    const summary = tool.summary ? tool.summary(args) : `Run ${call.name}`
                    proposals.push({ tool: call.name, args, summary, status: 'proposed' })
                    respond({
                        queued: true,
                        summary,
                        note: 'Queued for the host to confirm — not applied yet. Do not call this tool again for the same change.',
                    })
                    continue
                }

                // ====== Read: run it now
                if (reads >= MAX_READS) {
                    respond({ error: `Read budget exhausted (max ${MAX_READS})` })
                    continue
                }
                reads++

                try {
                    const result = await tool.execute(hostId, args)
                    run.reads.push({ tool: call.name, args, ok: true })
                    respond(result)
                } catch (error) {
                    console.log(error)
                    run.reads.push({ tool: call.name, args, ok: false, error: error.message })
                    respond({ error: error.message })
                }
            }

            run.rounds = round + 1
        }

        run.answer = answer
        run.proposals = proposals
        await run.save()

        return { runId: String(run._id), answer, proposals: run.proposals, reads: run.reads.length, rounds: run.rounds }

    } catch (error) {
        console.log(error)
        run.error = error.message
        await run.save()
        if (error instanceof LlmNotConfiguredError) throw error
        throw error
    }
}

/**
 * Run one proposal the host has confirmed.
 *
 * The arguments are validated again here rather than trusted from the stored
 * run, so a tampered record cannot smuggle a different change through.
 */
const executeProposal = async ({ hostId, runId, index }) => {
    const run = await agentRunSchema.findOne({ _id: runId, host: hostId })
    if (!run) throw Object.assign(new Error('That conversation was not found'), { status: 404 })

    const proposal = run.proposals[index]
    if (!proposal) throw Object.assign(new Error('That change was not found'), { status: 404 })
    if (proposal.status !== 'proposed') throw Object.assign(new Error(`That change was already ${proposal.status}`), { status: 400 })

    const tool = tools[proposal.tool]
    if (!tool || tool.kind !== 'write') throw Object.assign(new Error('That change is no longer available'), { status: 400 })

    try {
        const args = tool.validate(proposal.args || {})
        const result = await tool.execute(hostId, args)
        proposal.status = 'confirmed'
        proposal.result = result
        proposal.decidedAt = new Date()
        await run.save()
        return { status: 'confirmed', summary: proposal.summary, result }
    } catch (error) {
        console.log(error)
        proposal.status = 'failed'
        proposal.error = error.message
        proposal.decidedAt = new Date()
        await run.save()
        throw Object.assign(new Error(error.message), { status: error.status || 400 })
    }
}

const declineProposal = async ({ hostId, runId, index }) => {
    const run = await agentRunSchema.findOne({ _id: runId, host: hostId })
    if (!run) throw Object.assign(new Error('That conversation was not found'), { status: 404 })

    const proposal = run.proposals[index]
    if (!proposal) throw Object.assign(new Error('That change was not found'), { status: 404 })
    if (proposal.status !== 'proposed') throw Object.assign(new Error(`That change was already ${proposal.status}`), { status: 400 })

    proposal.status = 'declined'
    proposal.decidedAt = new Date()
    await run.save()
    return { status: 'declined' }
}

module.exports = { runAgent, executeProposal, declineProposal, MAX_ROUNDS, MAX_READS, MAX_PROPOSALS }
