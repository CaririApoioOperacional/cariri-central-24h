import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {prisma} from "../../../../lib/prisma";
import {createSession} from "../../../../lib/auth";
const attempts=new Map<string,{count:number;until:number}>();

export async function POST(req:Request){
  const ip=(req.headers.get("x-forwarded-for")||"unknown").split(",")[0].trim();const now=Date.now(),a=attempts.get(ip);if(a&&a.until>now&&a.count>=5)return NextResponse.json({error:"Muitas tentativas. Aguarde alguns minutos."},{status:429});if(a&&a.until<=now)attempts.delete(ip);
  const b=await req.json();
  const email=String(b.email||"").trim().toLowerCase();
  const password=String(b.password||"");
  const u=await prisma.staffUser.findUnique({where:{email}});

  if(!u||!u.active||!await bcrypt.compare(password,u.passwordHash)){const x=attempts.get(ip);attempts.set(ip,{count:(x?.count||0)+1,until:now+10*60*1000});return NextResponse.json({error:"Credenciais inválidas"},{status:401});}

  attempts.delete(ip);
  await createSession({id:u.id,name:u.name,email:u.email,role:u.role});
  return NextResponse.json({name:u.name,role:u.role});
}
