"use client";
import {FormEvent,useEffect,useState} from "react";
type Site={id:string;name:string;address?:string|null;latitude?:number|null;longitude?:number|null};
type Contact={id:string;phone:string;name?:string|null};
type C={id:string;name:string;active:boolean;sites:Site[];contacts:Contact[]};

export default function CustomerManager(){
 const [rows,setRows]=useState<C[]>([]),[name,setName]=useState("");
 const [customerId,setCustomerId]=useState(""),[siteName,setSiteName]=useState(""),[address,setAddress]=useState(""),[latitude,setLatitude]=useState(""),[longitude,setLongitude]=useState("");
 const [contactCustomer,setContactCustomer]=useState(""),[siteId,setSiteId]=useState(""),[phone,setPhone]=useState(""),[contactName,setContactName]=useState("");
 const load=async()=>{const r=await fetch("/api/customers");const d=await r.json();setRows(d);if(d[0]){setCustomerId(x=>x||d[0].id);setContactCustomer(x=>x||d[0].id)}};
 useEffect(()=>{void load()},[]);
 async function send(url:string,body:unknown){const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});if(!r.ok){const x=await r.json().catch(()=>({}));alert(x.error||"Não foi possível salvar");return false}await load();return true}
 async function addCustomer(e:FormEvent){e.preventDefault();if(await send("/api/customers",{name})){setName("")}}
 async function addSite(e:FormEvent){e.preventDefault();if(await send("/api/sites",{customerId,name:siteName,address,latitude,longitude})){setSiteName("");setAddress("");setLatitude("");setLongitude("")}}
 async function addContact(e:FormEvent){e.preventDefault();if(await send("/api/contacts",{customerId:contactCustomer,siteId:siteId||null,phone,name:contactName,authorized:true})){setPhone("");setContactName("")}}
 async function toggleCustomer(id:string,active:boolean){await fetch("/api/customers",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({id,active})});await load()} const sites=rows.find(x=>x.id===contactCustomer)?.sites||[];
 return <div className="admin-grid">
  <section><h3>Novo cliente</h3><form onSubmit={addCustomer} className="form"><input required value={name} onChange={e=>setName(e.target.value)} placeholder="Nome / razão social"/><button>Cadastrar cliente</button></form></section>
  <section><h3>Estabelecimento / local</h3><form onSubmit={addSite} className="form"><select required value={customerId} onChange={e=>setCustomerId(e.target.value)}><option value="">Selecione o cliente</option>{rows.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><input required value={siteName} onChange={e=>setSiteName(e.target.value)} placeholder="Nome do estabelecimento"/><input value={address} onChange={e=>setAddress(e.target.value)} placeholder="Endereço"/><div className="dispatch"><input inputMode="decimal" value={latitude} onChange={e=>setLatitude(e.target.value)} placeholder="Latitude (ex.: -7.2300)"/><input inputMode="decimal" value={longitude} onChange={e=>setLongitude(e.target.value)} placeholder="Longitude (ex.: -39.3100)"/></div><small>Informe latitude e longitude para habilitar a confirmação de chegada em perímetro de 100 m.</small><button>Cadastrar local</button></form></section>
  <section><h3>WhatsApp autorizado</h3><form onSubmit={addContact} className="form"><select required value={contactCustomer} onChange={e=>{setContactCustomer(e.target.value);setSiteId("")}}><option value="">Selecione o cliente</option>{rows.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select><select value={siteId} onChange={e=>setSiteId(e.target.value)}><option value="">Todos os locais do cliente</option>{sites.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select><input value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="Nome do contato"/><input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="WhatsApp com DDD"/><button>Autorizar WhatsApp</button></form></section>
  <section className="wide"><h3>Base cadastrada</h3><div className="list">{rows.map(c=><article key={c.id}><div className="row-between"><b>{c.name}</b><button className="mini" onClick={()=>toggleCustomer(c.id,!c.active)}>{c.active?"INATIVAR":"REATIVAR"}</button></div><small>{c.active?"ATIVO":"INATIVO"} • {c.sites.length} local(is) • {c.contacts.length} WhatsApp(s)</small>{c.sites.map(x=><small key={x.id}>• {x.name}{x.address?" — "+x.address:""}{x.latitude!=null&&x.longitude!=null?" • GPS configurado":""}</small>)}{c.contacts.map(x=><small key={x.id}>• WhatsApp {x.phone}{x.name?" — "+x.name:""}</small>)}</article>)}</div></section>
 </div>
}
