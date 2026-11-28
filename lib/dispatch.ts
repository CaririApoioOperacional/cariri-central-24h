import {Prisma} from "@prisma/client";
import {prisma} from "./prisma";
import {distanceKm,freshPosition,validCoordinates,GPS_FRESH_MS} from "./proximity";
import {notifyEvent,phoneNumber} from "./waha";
export class DispatchError extends Error {}
export async function assignDispatch(eventId:string,technicianId:string|null,actor:string){
 const automatic=!technicianId;
 for(let attempt=0;attempt<3;attempt++){
 try{
 const assigned=await prisma.$transaction(async tx=>{
 const e=await tx.event.findUnique({where:{id:eventId},include:{site:{include:{customer:true}}}});
 if(!e||e.status!=="OPEN"||!e.site.customer.active)throw new DispatchError("Protocolo indisponível para despacho.");
 if(await tx.dispatch.count({where:{eventId,status:{notIn:["COMPLETED","CANCELLED"]}}}))throw new DispatchError("Já existe um despacho ativo.");
 const eligible=await tx.technician.findMany({where:{active:true,available:true,staff:{is:{active:true,role:"TECHNICIAN"}},dispatches:{none:{status:{notIn:["COMPLETED","CANCELLED"]}}},...(automatic?{locationUpdatedAt:{gte:new Date(Date.now()-GPS_FRESH_MS)}}:{id:technicianId!})}});
 if(automatic&&!validCoordinates(e.site.latitude,e.site.longitude))return null;
 const ranked=automatic?eligible.filter(t=>freshPosition(t)).map(t=>({t,km:distanceKm(e.site.latitude!,e.site.longitude!,t.latitude!,t.longitude!)})).sort((a,b)=>a.km-b.km||a.t.id.localeCompare(b.t.id)):eligible.map(t=>({t,km:null}));
 const selected=ranked[0];if(!selected){if(automatic)return null;throw new DispatchError("Técnico indisponível ou sem usuário ativo.");}
 const claimed=await tx.technician.updateMany({where:{id:selected.t.id,active:true,available:true,...(automatic?{locationUpdatedAt:{gte:new Date(Date.now()-GPS_FRESH_MS)}}:{})},data:{available:false}});if(claimed.count!==1)throw new DispatchError("Disponibilidade alterada. Atualize e tente novamente.");
 const changed=await tx.event.updateMany({where:{id:eventId,status:"OPEN"},data:{status:"DISPATCHED"}});if(changed.count!==1)throw new DispatchError("Protocolo já despachado.");
 const d=await tx.dispatch.create({data:{eventId,technicianId:selected.t.id}});
 await tx.audit.create({data:{eventId,action:(automatic?"DISPATCH_AUTO: ":"DISPATCH_SENT: ")+selected.t.name+(selected.km!==null?" • "+selected.km.toFixed(2)+" km em linha reta":""),actor}});
 const phone=phoneNumber(selected.t.phone||"");
 if(/^\d{12,15}$/.test(phone)){await tx.whatsAppOutgoing.create({data:{dispatchId:d.id,eventId,phone,dedupKey:"dispatch:"+d.id,body:"CARIRI • CENTRAL 24h\nNovo acionamento: "+e.protocol+"\nAcesse seu aplicativo operacional para consultar os detalhes e aceitar o atendimento.\nhttps://cariri24h.up.railway.app/tecnico",status:"PENDING"}});}
 else await tx.audit.create({data:{eventId,action:"WHATSAPP_TECNICO_SEM_NUMERO_VALIDO",actor}});
 return {...d,technicianName:selected.t.name,distanceKm:selected.km};
 },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
 if(assigned)await notifyEvent(eventId,"DISPATCHED");return assigned;
 }catch(e:any){if(e?.code==="P2034"&&attempt<2)continue;throw e;}}
 return null;
}
export async function autoDispatch(eventId:string,actor:string){try{return await assignDispatch(eventId,null,actor);}catch{console.error("CARIRI: distribuição automática não concluída; verificar protocolo");return null;}}
