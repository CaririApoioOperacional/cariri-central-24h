import {NextResponse} from "next/server";
import {createHmac,timingSafeEqual} from "crypto";

const verifyToken=()=>process.env.WHATSAPP_VERIFY_TOKEN||"";
const appSecret=()=>process.env.META_APP_SECRET||"";

export async function GET(req:Request){
  const u=new URL(req.url);
  const mode=u.searchParams.get("hub.mode");
  const token=u.searchParams.get("hub.verify_token");
  const challenge=u.searchParams.get("hub.challenge");
  if(mode==="subscribe"&&token&&challenge&&verifyToken()&&token===verifyToken()){
    return new Response(challenge,{status:200,headers:{"Content-Type":"text/plain"}});
  }
  return NextResponse.json({error:"Verificação recusada"},{status:403});
}

export async function POST(req:Request){
  const raw=await req.text();
  const secret=appSecret();
  if(secret){
    const supplied=req.headers.get("x-hub-signature-256")||"";
    const expected="sha256="+createHmac("sha256",secret).update(raw).digest("hex");
    const a=Buffer.from(supplied),b=Buffer.from(expected);
    if(a.length!==b.length||!timingSafeEqual(a,b)){
      return NextResponse.json({error:"Assinatura inválida"},{status:401});
    }
  }
  try{
    const body=JSON.parse(raw);
    // Nesta fase o endpoint confirma o recebimento oficial da Meta.
    // Nenhum atendimento é criado ou despachado automaticamente.
    // O processamento operacional será habilitado somente após vincular
    // o número de produção e validar os contatos autorizados da CARIRI.
    if(body?.object!=="whatsapp_business_account"){
      return NextResponse.json({received:true,ignored:true});
    }
    return NextResponse.json({received:true});
  }catch{
    return NextResponse.json({error:"Payload inválido"},{status:400});
  }
}
