import {NextResponse} from "next/server";import {prisma} from "../../../lib/prisma";
const phone=(v:string)=>String(v||"").replace(/\D/g,"");
export async function POST(req:Request){const b=await req.json();const p=phone(b.phone);if(!p||!b.customerId)return NextResponse.json({error:"WhatsApp e cliente obrigatórios"},{status:400});return NextResponse.json(await prisma.whatsAppContact.create({data:{phone:p,name:b.name||null,customerId:b.customerId,siteId:b.siteId||null,authorized:b.authorized!==false}}),{status:201})}
