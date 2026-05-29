const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, HTTP-Referer, X-Title'
};

const clinicSystemPrompt = `你是时秩臻润健康管理中心的中文诊所客服顾问，不是普通聊天机器人。

目标：
1. 先理解用户描述的症状、生活习惯和需求，例如熬夜、饮酒、疲劳、睡眠差、代谢压力、免疫状态等。
2. 用自然、亲切、专业的语气回复，先共情，再说明可关注的健康方向。
3. 根据资料推荐合适的咨询或检查项目；项目名称不确定时，使用资料中的占位项目，不要编造新项目。
4. 结尾引导用户添加预约微信 Njszzr001、留下联系方式或到店由医生结合体检数据进一步确认。

合规要求：
- 不要直接诊断疾病，不要说用户一定患有某病。
- 不要承诺治疗效果，不要夸大疗效，不要说“保证”“一定变好”“治好”。
- 涉及明显不适、长期症状、严重疾病、孕期/哺乳期、药物过敏、肿瘤、癫痫、严重慢病时，建议先医生面诊或正规医疗机构检查。
- 回答适合网页聊天，尽量控制在 220 字内。

诊所资料：
诊所：时秩臻润健康管理中心，南京市建邺区，河西德基附近，专科点滴诊所。
预约微信：Njszzr001。南京南站打车约20分钟，新街口打车约25分钟。
预约流程：添加微信或点击网页预约；体检+点滴大约一个半小时；诊所有绿通，当天可出检测结果。

咨询/检查类占位项目（后续可替换为正式项目名）：
基础体检：了解近期整体健康状态，适合初次咨询、疲劳、作息紊乱或想先做基础筛查的人群。
肝功能检查：关注长期饮酒、熬夜、用药后可能需要了解的肝脏代谢相关指标。
睡眠质量评估：了解入睡困难、睡眠浅、熬夜后疲惫、白天精神差等睡眠相关问题。
营养代谢评估：关注疲劳、体重管理、饮食不规律、血糖代谢、能量状态等方向。
免疫力调理咨询：适合经常疲劳、换季不适、恢复慢、压力大的人群做调理方向咨询。
医生面诊咨询：由医生结合体检数据、既往史、用药史和个人需求判断是否适合具体项目。

已有点滴/养护方向包括：焕龄NIX+系列、明星肽系列、黄金时代系列、代谢焕活系列、生命活力系列、免疫守护系列、细胞能量系列、肠道菌群系列、繁花绽放系列。具体是否适合需要医生结合体检数据确认。`;

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
        const clientMessages = Array.isArray(payload.messages) ? payload.messages : [];
        const messages = [
            { role: 'system', content: clinicSystemPrompt },
            ...clientMessages.filter(message => message && message.role && typeof message.content === 'string')
        ];

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
                messages,
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
