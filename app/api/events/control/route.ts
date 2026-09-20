import {NextResponse} from "next/server";import {prisma} from "../../../../lib/prisma";import {session} from "../../../../lib/auth";

export async function POST(req:Request){
 const s=await session();if(!s||!["ADMIN","CENTRAL","SUPERVISOR"].includes(s.role))return NextResponse.json({error:"Acesso negado"},{status:403});
 const b=await req.json();if(!b.eventId)return NextResponse.json({error:"Atendimento obrigatório"},{status:400});
 const e=await prisma.event.findUnique({where:{id:b.eventId},include:{dispatches:{where:{status:{notIn:["COMPLETED","CANCELLED"]}},orderBy:{createdAt:"desc"},take:1}}});
 if(!e)return NextResponse.json({error:"Atendimento não encontrado"},{status:404});
 if(["COMPLETED","CANCELLED"].includes(e.status))return NextResponse.json({error:"Atendimento já encerrado"},{status:409});
 const note=String(b.note||"").trim();
 if(b.action==="NOTE"){
  if(!["CUSTOMER","ALARM","CAMERA","EQUIPMENT","OPERATOR"].includes(String(b.kind||"")))return NextResponse.json({error:"Selecione o tipo do andamento"},{status:400});
  await prisma.audit.create({data:{eventId:e.id,action:"CENTRAL_PROGRESS: "+String(b.kind)+"|"+note,actor:s.name}});
  return NextResponse.json({ok:true});
 }
 if(b.action==="COMPLETE"){
  const result=String(b.result||"").trim();if(result.length<3)return NextResponse.json({error:"Informe o resultado/finalização"},{status:400});
  const d=e.dispatches[0];
  await prisma.$transaction(async tx=>{await tx.event.update({where:{id:e.id},data:{status:"COMPLETED",result}});
   if(d){await tx.dispatch.update({where:{id:d.id},data:{status:"COMPLETED",completedAt:new Date()}});await tx.technician.update({where:{id:d.technicianId},data:{available:true}})}
   await tx.audit.create({data:{eventId:e.id,action:"CENTRAL_COMPLETED: "+result,actor:s.name}});
  });
  return NextResponse.json({ok:true});
 }
 return NextResponse.json({error:"Ação inválida"},{status:400});
}