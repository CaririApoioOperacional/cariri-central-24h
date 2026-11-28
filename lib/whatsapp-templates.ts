import {Prisma} from "@prisma/client";
import {prisma} from "./prisma";
export type Template={key:string;label:string;group:string;body:string;enabled:boolean;variables:string[]};
const operational=["protocolo","estabelecimento","situacao","data_hora"];
const header="{marca}\nProtocolo: {protocolo}\nEstabelecimento: {estabelecimento}\nSituação: {situacao}\n";
const footer="\nA Central 24h permanece acompanhando o atendimento.\nRegistro: {data_hora}";
const make=(key:string,label:string,group:string,body:string,variables:string[]=[],enabled=true):Template=>({key,label,group,body,variables,enabled});
export const defaults:Template[]=[
make("GLOBAL","Automação geral","Configuração","","".split("").filter(Boolean),true),
make("BRAND","Identificação institucional","Configuração","CARIRI • CENTRAL 24h"),
make("SIGNATURE","Assinatura adicional","Configuração","CARIRI MONITORAMENTO • CENTRAL 24h",[],false),
make("MENU","Mensagem inicial","Recepção","{marca}\nComo podemos ajudar?\n1 Solicitação do cliente\n2 Sinal de alarme\n3 Evento de câmera\n4 Evento de equipamento\n5 Apoio da Central",["marca"]),
make("UNKNOWN_CONTACT","Contato não identificado","Recepção","Informe seu nome e estabelecimento para validação."),
make("OPTION_1","1 — Solicitação do cliente","Respostas rápidas","Informe, por favor, sua solicitação. Nossa Central dará continuidade ao atendimento."),
make("OPTION_2","2 — Sinal de alarme","Respostas rápidas","Informe o estabelecimento e, se possível, o local/setor onde ocorreu o acionamento do alarme."),
make("OPTION_3","3 — Evento de câmera","Respostas rápidas","Informe o estabelecimento e a câmera/local relacionado ao evento. Você também pode enviar imagem ou vídeo para análise da Central."),
make("OPTION_4","4 — Evento de equipamento","Respostas rápidas","Informe o estabelecimento, o equipamento e descreva o problema identificado."),
make("OPTION_5","5 — Apoio da Central","Respostas rápidas","Descreva o apoio necessário. Sua solicitação será direcionada à Central 24h."),
make("RECEIVED","Abertura do protocolo","Evolução do atendimento",header+"Atualização: Sua solicitação foi recebida e registrada pela Central 24h. O atendimento está sendo acompanhado por nossa equipe."+footer,["marca",...operational]),
make("DISPATCHED","Técnico acionado","Evolução do atendimento",header+"Atualização: Um Técnico Externo foi acionado para o atendimento. A Central 24h permanece acompanhando a ocorrência."+footer,["marca",...operational]),
make("EN_ROUTE","Técnico em deslocamento","Evolução do atendimento",header+"Atualização: O Técnico Externo está em deslocamento para o local do atendimento."+footer,["marca",...operational]),
make("ON_SITE","Chegada ao estabelecimento","Evolução do atendimento",header+"Atualização: O Técnico Externo chegou ao local e iniciou a verificação do evento."+footer,["marca",...operational]),
make("PROGRESS","Registro de andamento","Evolução do atendimento","{marca}\nProtocolo: {protocolo}\nEstabelecimento: {estabelecimento}\nNovo andamento registrado. A Central permanece acompanhando o atendimento.\nRegistro: {data_hora}",["marca",...operational]),
make("COMPLETED","Atendimento concluído","Evolução do atendimento",header+"Atualização: A verificação foi concluída. Consulte abaixo o resultado registrado no atendimento.\n{observacao}\nResultado: {resultado}\nAtendimento registrado e concluído pela Central 24h.\nRegistro: {data_hora}",["marca",...operational,"observacao","resultado"]),
make("RESULT_OK","Local sem alteração aparente","Resultados","A verificação no local foi concluída sem alteração aparente no momento da inspeção."),
make("RESULT_EQUIPMENT","Evento técnico / equipamento","Resultados","A verificação identificou situação relacionada a equipamento ou condição técnica. A Central registrou o resultado para acompanhamento."),
make("RESULT_RISK","Possível ocorrência delituosa","Resultados","Durante a verificação foram identificados indícios que podem estar relacionados a uma ocorrência. Por segurança, o Técnico Externo não realiza intervenção e a Central segue os procedimentos operacionais cabíveis."),
make("RESULT_GUIDED","Cliente orientado","Resultados","O atendimento foi concluído com orientação ao cliente conforme a situação verificada."),
make("TECHNICIAN","Acionamento do Técnico Externo","Equipe operacional","{marca}\nNovo acionamento: {protocolo}\nAcesse seu aplicativo operacional para consultar os detalhes e aceitar o atendimento.\nhttps://cariri24h.up.railway.app/tecnico",["marca","protocolo"])
];
type DB=Pick<Prisma.TransactionClient,"whatsAppTemplate">;
export async function loadTemplates(db:DB=prisma){const stored=await db.whatsAppTemplate.findMany();const map=new Map(stored.map(s=>[s.key,s]));return defaults.map(d=>{const s=map.get(d.key);return {...d,body:s?.body??d.body,enabled:s?.enabled??d.enabled,updatedBy:s?.updatedBy??null,updatedAt:s?.updatedAt??null};});}
export type Templates=Awaited<ReturnType<typeof loadTemplates>>;
export function renderTemplate(list:Templates,key:string,values:Record<string,string>={},opts:{preview?:boolean;signature?:boolean}={}){const t=list.find(x=>x.key===key);if(!t||(!opts.preview&&(!list.find(x=>x.key==="GLOBAL")?.enabled||!t.enabled)))return null;const brand=list.find(x=>x.key==="BRAND");const data:Record<string,string>={marca:brand?.enabled?brand.body:"",...values};let body=t.body.replace(/\{([a-z_]+)\}/g,(_,k)=>data[k]??"").split("\n").map(x=>x.trimEnd()).filter(Boolean).join("\n").trim();const sig=list.find(x=>x.key==="SIGNATURE");if(opts.signature!==false&&sig?.enabled&&sig.body.trim()&&body)body+="\n\n"+sig.body.trim();return body||null;}
export function sampleValues(){return {protocolo:"TESTE-0001",estabelecimento:"Estabelecimento de exemplo",situacao:"Atendimento de teste",data_hora:new Date().toLocaleString("pt-BR",{timeZone:"America/Fortaleza"}),observacao:"Observação: Verificação de exemplo.",resultado:"Resultado de exemplo"};}
export function renderEvent(list:Templates,e:{protocol:string;status:string;result?:string|null;site:{name:string}},kind:string){const labels:Record<string,string>={RECEIVED:"Aberto",DISPATCHED:"Técnico Externo acionado",EN_ROUTE:"Técnico Externo a caminho",ON_SITE:"Técnico Externo no local",COMPLETED:"Atendimento concluído",PROGRESS:"Em atendimento"};const results:Record<string,string>={"Local sem alteração aparente":"RESULT_OK","Evento técnico / equipamento":"RESULT_EQUIPMENT","Possível ocorrência delituosa":"RESULT_RISK","Cliente orientado":"RESULT_GUIDED"};const result=e.result?.trim()||"";const rk=results[result];const obs=result?(rk?renderTemplate(list,rk,{}, {signature:false}):"Resultado registrado pela equipe: "+result):null;return renderTemplate(list,kind,{protocolo:e.protocol,estabelecimento:e.site.name,situacao:labels[kind]||e.status,data_hora:new Date().toLocaleString("pt-BR",{timeZone:"America/Fortaleza"}),observacao:obs?"Observação: "+obs:"",resultado:result});}
