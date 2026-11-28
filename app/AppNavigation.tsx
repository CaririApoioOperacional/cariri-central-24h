"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";
export default function AppNavigation(){
 const p=usePathname();const [role,setRole]=useState<string|null>(null);
 useEffect(()=>{let live=true;setRole(null);if(p==="/login")return;fetch("/api/auth/session",{cache:"no-store"}).then(async r=>r.ok?await r.json():null).then(s=>{if(live)setRole(s?.role||null)}).catch(()=>{});return()=>{live=false}},[p]);
 if(p==="/login"||!role||role==="TECHNICIAN"||!["ADMIN","CENTRAL","SUPERVISOR"].includes(role))return null;
 return <nav className="app-nav screen-only" aria-label="Módulos principais">{role==="ADMIN"&&<Link href="/admin" className={p.startsWith("/admin")?"nav-active":""} aria-current={p.startsWith("/admin")?"page":undefined}>ADM</Link>}<Link href="/central" className={p.startsWith("/central")?"nav-active":""} aria-current={p.startsWith("/central")?"page":undefined}>CENTRAL 24H</Link></nav>;
}
