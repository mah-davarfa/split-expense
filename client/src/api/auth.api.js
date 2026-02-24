import {http} from './http.js';

export default async function authApi(
    path,
     {method = 'POST',token, body={}}={}
    ) {
return http(
    path,
    {method,token,body,headers})
}