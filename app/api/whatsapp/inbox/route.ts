import {NextResponse} from "next/server";
import {session} from "../../../../lib/auth";
import {prisma} from "../../../../lib/prisma";
import {newProtocol} from "../../../../lib/protocol";
import {timingSafeEqual} from "crypto";
const categories:Record<string,string>={"1":"Solicitação do cliente","2":"Sinal de alarme","3":"Evento de câmera","4":"Evento de equipamento","5":"Apoio da Central"};
const menu="CARIRI • CENTRAL 24h\nComo podemos ajudar?\n1 Solicitação do cliente\n2 Sinal de alarme\n3 Evento de câmera\n4 Evento de equipamento\n5 Apoio da Central";
const digits=(x:string)=>x.replace(/\D/g,"");
function trusted(req:Request){const secret=process.env.WA_CONNECTOR_SECRET||"";const a=Buffer.from(req.headers.get("authorization")||"");const b=Buffer.from("Bearer "+secret);return !!secret&&a.length===b.length&&timingSafeEqual(a,b)}
export async function GET(){const s=await session();if(!s||!["ADMIN","CENTRAL","SUPERVISOR"].includes(s.role))return NextResponse.json({error:"Acesso negado"},{status:403});return NextResponse.json(await prisma.whatsAppInbox.findMany({orderBy:{createdAt:"desc"},take:100}))}
export async function POST(req:Request){
 if(!trusted(req))return NextResponse.json({error:"Acesso negado"},{status:403});
 const b=await req.json();if(typeof b.id!=="string"||!b.id||typeof b.phone!=="string"||typeof b.body!=="string")return NextResponse.json({error:"Dados inválidos"},{status:400});
 const phone=digits(b.phone);if(phone.length<10||phone.length>15)return NextResponse.json({error:"Número inválido"},{status:400});
 const body=b.body.slice(0,4000);const category=categories[body.trim()]||null;
 const contacts=await prisma.whatsAppContact.findMany({where:{authorized:true,customer:{active:true}},include:{customer:{include:{sites:true}}}});
 const matches=contacts.filter(c=>{const p=digits(c.phone);return p===phone||("55"+p===phone&&p.length<=11)});
 const c=matches.length===1?matches[0]:null;const siteId=c?.siteId&&c.customer.sites.some(s=>s.id===c.siteId)?c.siteId:c?.customer.sites.length===1?c.customer.sites[0].id:null;
 const prior=await prisma.whatsAppInbox.findFirst({where:{phone},orderBy:{createdAt:"desc"}});
 try{await prisma.whatsAppInbox.create({data:{externalId:b.id,phone,body,category,contactName:c?c.name||c.customer.name:null,siteId}})}catch(e:any){if(e?.code==="P2002")return NextResponse.json({reply:null});throw e}
 let reply:string|null=null;
 if(category)reply="CARIRI • CENTRAL 24h\nRecebemos sua seleção: "+category+". Informe o estabelecimento e os detalhes para análise da Central. Nenhum despacho foi confirmado.";
 else if(!prior||Date.now()-prior.createdAt.getTime()>86400000)reply=c?menu:menu+"\nInforme também seu nome e estabelecimento para validação.";
 return NextResponse.json({reply});
}
export async function PATCH(req:Request){const s=await session();if(!s||!["ADMIN","CENTRAL","SUPERVISOR"].includes(s.role))return NextResponse.json({error:"Acesso negado"},{status:403});const b=await req.json();try{const event=await prisma.$transaction(async tx=>{const m=await tx.whatsAppInbox.findUnique({where:{id:b.id}});if(!m||!m.siteId||m.eventId)throw Error("Mensagem sem vínculo válido ou já processada");const site=await tx.site.findUnique({where:{id:m.siteId},include:{customer:true}});if(!site?.customer.active)throw Error("Cliente inativo");const e=await tx.event.create({data:{protocol:newProtocol(),siteId:m.siteId,origin: m.category==="Sinal de alarme"?"ALARM":m.category==="Evento de câmera"?"CAMERA":m.category==="Evento de equipamento"?"EQUIPMENT":"CUSTOMER",description:[m.category,m.body].filter(Boolean).join(" — ")}});const claim=await tx.whatsAppInbox.updateMany({where:{id:m.id,eventId:null},data:{eventId:e.id}});if(claim.count!==1)throw Error("Mensagem já processada");await tx.audit.create({data:{eventId:e.id,action:"EVENT_CREATED_WHATSAPP",actor:s.name}});return e});return NextResponse.json(event)}catch(e:any){return NextResponse.json({error:e.message},{status:409})}}
