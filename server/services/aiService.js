import OpenAi from 'openai';
import ChatSession from '../models/ChatSession.js'
//////////////////on this design Ai remminded the last 3 conversation ////


const SYSTEM_MESSAGE ={role:'system', content:'You are a helpful assistant.'}
const MAX_MESSAGES = 6;

export const generateAIResponse = async (userId , userMessage)=>{
    const openai = new OpenAi({apiKey:process.env.OPENAI_API_KEY});
    //find or create chat session 
    let session = await ChatSession.findOne({userId});
    if(!session) session = await ChatSession.create({userId })

     const historyOfConversation= session.messages.slice(-MAX_MESSAGES);

    /////call OpenAI using system + history + new user message
    const response = await openai.responses.create({
        model:"gpt-4o-mini",
        input:[SYSTEM_MESSAGE, ...historyOfConversation,{role:'user',content:userMessage}],
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
