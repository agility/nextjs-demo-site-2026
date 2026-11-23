import { convertToModelMessages, stepCountIs, streamText, type UIMessage } from 'ai'
import { validateAIEnvironment, validateAlgoliaEnvironment, getAIModel } from '@/lib/ai/providers'
import { createSearchTool } from '@/lib/ai/searchTool'
import { createContactCaptureTool } from '@/lib/ai/contactCaptureTool'
import { getAISearchConfig } from '@/lib/cms-content/getAISearchConfig'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Validate AI environment variables
    const { hasValidConfig } = validateAIEnvironment()
    if (!hasValidConfig) {
      console.error('Missing required AI environment variables')
      return Response.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      )
    }

    // Validate Algolia environment variables
    if (!validateAlgoliaEnvironment()) {
      console.error('Missing required Algolia environment variables')
      return Response.json(
        { error: 'Search service configuration error' },
        { status: 500 }
      )
    }

    const { messages }: { messages: UIMessage[] } = await req.json()

    if (!messages || messages.length === 0) {
      return Response.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    // Fetch AI configuration from Agility CMS
    const aiConfig = await getAISearchConfig({ locale: 'en-us' })

    // Check if AI search is enabled (this controls both search and agent)
    if (!aiConfig.showAISearch) {
      return Response.json(
        { error: 'AI assistant is currently disabled' },
        { status: 503 }
      )
    }

    // Get the AI model
    const model = getAIModel()
    if (!model) {
      console.error('Failed to initialize AI model')
      return Response.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      )
    }

    // Create the search tool
    const searchTool = createSearchTool()

    // Create the contact capture tool
    const contactTool = createContactCaptureTool(aiConfig.contactCaptureURL)

    // Use a more conversational system prompt for the agent mode
    const agentSystemPrompt = `You are a helpful AI assistant for this website. You can have natural conversations with users and help them find information.

Your capabilities:
- You can search the website for relevant content to answer questions
- You can capture contact information when users want to get in touch or request more information
- You can have general conversations about topics related to this website
- You provide helpful, accurate, and conversational responses
- You have access to search tools to find current information when needed

Your personality:
- Friendly and conversational
- Professional but approachable
- Helpful and informative
- Proactive in offering assistance

When responding:
1. Be conversational and natural in your tone
2. Use search when you need specific information from the website
3. When you use the search tool and find results, first provide a brief summary of what you found (e.g., "I found several helpful resources about [topic], including information on [key points]"), then present the detailed search results
4. After searching, synthesize the information into a clear, helpful response that directly addresses the user's question
5. If search results are empty or don't contain relevant information, provide a helpful and friendly response that:
   - Acknowledges that you searched but couldn't find specific information on that topic
   - Suggests alternative ways to help (e.g., "I'd be happy to help you with other questions about [website topic]")
   - Offers to help them contact someone if they need more detailed information
   - Remains positive and engaging rather than just saying "no results found"
6. Use the contact capture tool when users express interest in:
   - Getting in touch with the company
   - Requesting more information
   - Asking for a consultation or demo
   - Wanting to speak with someone
   - Expressing purchase intent
7. Provide clear and helpful answers
8. Ask follow-up questions when appropriate
9. Offer additional assistance or suggestions

Search Guidelines:
- When you search for information and get results, start by providing a helpful summary before showing the search results
- Always summarize the key points from the search results in your response
- Focus on the most relevant information that answers the user's specific question
- If multiple search results provide different perspectives, synthesize them into a cohesive response
- Cite or reference specific information from the search results when appropriate
- If the search doesn't find relevant results, respond with empathy and offer alternatives like:
  "I searched through the website but couldn't find specific information about [topic]. However, I'd be happy to help you with questions about [other relevant topics] or I can help you get in touch with someone who might have more details."

Remember: You represent this website, so maintain a professional yet friendly demeanor.`

    try {
      const result = await streamText({
        model: model,
        system: agentSystemPrompt,
        messages: convertToModelMessages(messages),
        tools: {
          search: searchTool,
          contactCapture: contactTool
        },
        temperature: aiConfig.temperature,
        maxOutputTokens: aiConfig.maxTokens,
        toolChoice: 'auto', // Let the model decide when to use tools
        // Without this the AI SDK stops after one step, so after a tool call the
        // model never gets a turn to answer. Same limit as /api/ai/search.
        stopWhen: stepCountIs(5),
      })

      return result.toUIMessageStreamResponse()

    } catch (aiError) {
      console.error('AI agent failed:', aiError)
      return Response.json(
        { error: 'AI assistant service is currently unavailable. Please try again later.' },
        { status: 503 }
      )
    }

  } catch (error) {
    console.error('Agent API error:', error)
    return Response.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}