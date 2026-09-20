const digits=(v:string)=>String(v||"").replace(/\D/g,"");
export function whatsappWebUrl(phone:string,body:string){const p=digits(phone);return "https://web.whatsapp.com/send?phone="+encodeURIComponent(p)+"&text="+encodeURIComponent(body)}
const statusLabel:Record<string,string>={OPEN:"Aberto",DISPATCHED:"Técnico Externo acionado",EN_ROUTE:"Técnico Externo a caminho",ON_SITE:"Técnico Externo no local",COMPLETED:"Atendimento concluído",CANCELLED:"Atendimento cancelado"};
const evolution:Record<string,string>={
 RECEIVED:"Sua solicitação foi recebida e registrada pela Central 24h. O atendimento está sendo acompanhado por nossa equipe.",
 DISPATCHED:"Um Técnico Externo foi acionado para o atendimento. A Central 24h permanece acompanhando a ocorrência.",
 EN_ROUTE:"O Técnico Externo está em deslocamento para o local do atendimento.",
 ON_SITE:"O Técnico Externo chegou ao local e iniciou a verificação do evento.",
 COMPLETED:"A verificação foi concluída. Consulte abaixo o resultado registrado no atendimento."
};
const resultText:Record<string,string>={
 "Local sem alteração aparente":"A verificação no local foi concluída sem alteração aparente no momento da inspeção.",
 "Evento técnico / equipamento":"A verificação identificou situação relacionada a equipamento ou condição técnica. A Central registrou o resultado para acompanhamento.",
 "Possível ocorrência delituosa":"Durante a verificação foram identificados indícios que podem estar relacionados a uma ocorrência. Por segurança, o Técnico Externo não realiza intervenção e a Central segue os procedimentos operacionais cabíveis.",
 "Cliente orientado":"O atendimento foi concluído com orientação ao cliente conforme a situação verificada."
};
type E={protocol:string;status:string;result?:string|null;site:{name:string}};
export function statusText(e:E){return messageText(e,e.status)}
export function messageText(e:E,kind:string){const result=e.result?.trim();const obs=kind==="COMPLETED"&&result?(resultText[result]||("Resultado registrado pela equipe: "+result)):"";return ["CARIRI MONITORAMENTO • CENTRAL 24h","Protocolo: "+e.protocol,"Estabelecimento: "+e.site.name,"Situação: "+(statusLabel[kind]||statusLabel[e.status]||e.status),"","Atualização: "+(evolution[kind]||"A Central 24h permanece acompanhando o atendimento."),obs?"Observação: "+obs:"",kind==="COMPLETED"&&result?"Resultado: "+result:"","",kind==="COMPLETED"?"Atendimento registrado e concluído pela Central 24h.":"A Central 24h permanece acompanhando o atendimento."].filter(Boolean).join("\n")}
