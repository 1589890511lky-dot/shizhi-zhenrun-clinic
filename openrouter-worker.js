const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, HTTP-Referer, X-Title'
};

export default {
    async fetch(request, env) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        if (request.method !== 'POST') {
            return jsonResponse({ error: 'Method not allowed' }, 405);
        }

        if (!env.OPENROUTER_API_KEY) {
            return jsonResponse({ error: 'Missing OPENROUTER_API_KEY' }, 500);
        }

        const payload = await request.json();

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://1589890511lky-dot.github.io/shizhi-zhenrun-clinic/',
                'X-Title': '时秩臻润智能客服'
            },
            body: JSON.stringify({
                model: payload.model || env.OPENROUTER_MODEL || 'openrouter/auto',
                messages: payload.messages,
                temperature: payload.temperature ?? 0.55,
                max_tokens: payload.max_tokens ?? 320
            })
        });

        const data = await response.text();
        return new Response(data, {
            status: response.status,
            headers: {
                ...corsHeaders,
                'Content-Type': response.headers.get('Content-Type') || 'application/json'
            }
        });
    }
};

function jsonResponse(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
        }
    });
}
