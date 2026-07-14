import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are Leaf, the friendly AI tutor on the Branch learning platform.
You help students understand triangles, trigonometry, and geometry.
Keep answers short and encouraging, and use markdown formatting (bold, lists, inline math like sin(θ) = opposite / hypotenuse) where it helps.
Always ground your explanation in what the student is currently looking at, described below.
If the context describes a selected element, that element is what the student is asking about — treat its "about this selection" note as instructions for how to handle it.`;

export const POST: RequestHandler = async ({ request }) => {
	if (!env.ANTHROPIC_API_KEY) {
		return new Response('Missing ANTHROPIC_API_KEY — add it to the .env file and restart the dev server.', {
			status: 500
		});
	}

	const { messages, context } = (await request.json()) as {
		messages: { role: 'user' | 'assistant'; text: string }[];
		context: string;
	};

	const stream = client.messages.stream({
		model: 'claude-opus-4-8',
		max_tokens: 4096,
		thinking: { type: 'adaptive' },
		system: `${SYSTEM_PROMPT}\n\n${context}`,
		messages: messages.map((m) => ({ role: m.role, content: m.text }))
	});

	// Forward Claude's text as a plain text stream the client can read chunk by chunk.
	return new Response(
		new ReadableStream({
			async start(controller) {
				const encoder = new TextEncoder();
				try {
					for await (const event of stream) {
						if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
							controller.enqueue(encoder.encode(event.delta.text));
						}
					}
				} catch (err) {
					controller.enqueue(encoder.encode(`Leaf hit an error: ${err instanceof Error ? err.message : err}`));
				}
				controller.close();
			}
		}),
		{ headers: { 'content-type': 'text/plain; charset=utf-8' } }
	);
};
