import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {prisma} from "../../../../lib/prisma";
import {createSession} from "../../../../lib/auth";
const attempts=new Map<string,{count:number;until:number}>();
const dummy=bcrypt.hashSync("invalid-account-placeholder",12);
export async function POST(req:Request){
 const b=await req.json().catch(()=>null);
 if(!b||typeof b.email!=="string"||typeof b.password!=="string"||b.email.length>254||Buffer.byteLength(b.password)>72)return NextResponse.json({error:"Credenciais inválidas"},{status:401});
 const email=b.email.trim().toLowerCase(),password=b.password;
 const ip=(req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();
 const key=ip+"|"+email,now=Date.now();
 for(const [k,v] of attempts)if(v.until<=now)attempts.delete(k);
 const a=attempts.get(key);
 if(a)await new Promise(r=>setTimeout(r,Math.min(4000,a.count*500)));
 const u=await prisma.staffUser.findUnique({where:{email}});
 const valid=await bcrypt.compare(password,u?.passwordHash||dummy);
 if(!u||!u.active||!valid){if(attempts.size<10000||attempts.has(key))attempts.set(key,{count:Math.min(8,(attempts.get(key)?.count||0)+1),until:Date.now()+600000});return NextResponse.json({error:"Credenciais inválidas"},{status:401});}
 attempts.delete(key);
 await createSession({id:u.id,name:u.name,email:u.email,role:u.role});
 return NextResponse.json({name:u.name,role:u.role});
}
