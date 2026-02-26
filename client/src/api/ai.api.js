import {http} from './http.js';

export const aiApi={
    ask:(token,message)=>{
        return http('/api/ai/assistant',{
            method:'POST',
            token,
            body:{message},
        }

        )
    }
}