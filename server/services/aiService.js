import OpenAi from 'openai';
import ChatSession from '../models/ChatSession.js'
//////////////////on this design Ai remminded the last 3 conversation ////


const SYSTEM_MESSAGE = {
  role: "system",
  content: `
You are an AI assistant inside Split Expense AI, a full-stack expense sharing app.

App context:
- Users can create groups.
- Group creators/admins can invite members.
- Members can add shared expenses.
- Expenses can be split equally, by percentage, or by share.
- The app calculates group balances and shows who should pay whom.
- The app can record settlement payments when members pay each other outside the app.
- The app also supports receipt uploads, profiles, password reset, and group management.

How you should answer:
- If the user asks about this app, explain based on the Split Expense AI features above.
- If the user asks a general question, answer normally.
- Keep answers clear, practical, and beginner-friendly.
- Do not pretend you can directly change data unless the backend gives you that ability.
`,
};
const MAX_MESSAGES = 6;

export const generateAIResponse = async (userId , userMessage)=>{
    const openai = new OpenAi({apiKey:process.env.OPENAI_API_KEY});
    //find or create chat session 
    let session = await ChatSession.findOne({userId});
    if(!session) session = await ChatSession.create({userId })
      
     const historyOfConversation= session.messages.slice(-MAX_MESSAGES);
     const cleanupHistoryOfConversation= historyOfConversation.map((m)=>(
        {
        role:m.role,
        content:m.content
     }
    ))

    /////call OpenAI using system + history + new user message
    const response = await openai.responses.create({
        model:"gpt-4o-mini",
        input:[SYSTEM_MESSAGE, ...cleanupHistoryOfConversation,{role:'user',content:userMessage}],
        temperature: 0.7,
        max_output_tokens: 250
    });
    ///extracting text from response
    const reply = response.output[0].content[0].text;

    //save the user message and gpt response to Db inorder to be use for next comunication as remminder to gpt
    session.messages.push(
        {role:'user', content:userMessage},
        {role:'assistant',content:reply}
    )

    if(session.messages.length>MAX_MESSAGES){
        session.messages = session.messages.slice(-MAX_MESSAGES);
    }
    await session.save();

    return reply;
}
