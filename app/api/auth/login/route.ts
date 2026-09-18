import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {prisma} from "../../../../lib/prisma";
import {createSession} from "../../../../lib/auth";

export async function POST(req:Request){
  const b=await req.json();
  const email=String(b.email||"").trim().toLowerCase();
  const password=String(b.password||"");
  let u=await prisma.staffUser.findUnique({where:{email}});

  // Bootstrap de emergência: só funciona enquanto as variáveis ADMIN_* existirem
  // e apenas quando e-mail e senha informados coincidirem exatamente com elas.
  if(!u && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD &&
     email===process.env.ADMIN_EMAIL.trim().toLowerCase() &&
     password===process.env.ADMIN_PASSWORD){
    const passwordHash=await bcrypt.hash(password,12);
    u=await prisma.staffUser.upsert({
      where:{email},
      update:{name:process.env.ADMIN_NAME?.trim()||"Administrador",passwordHash,role:"ADMIN",active:true,technicianId:null},
      create:{name:process.env.ADMIN_NAME?.trim()||"Administrador",email,passwordHash,role:"ADMIN",active:true}
    });
  }

  if(!u||!u.active||!await bcrypt.compare(password,u.passwordHash))
    return NextResponse.json({error:"Credenciais inválidas"},{status:401});

  await createSession({id:u.id,name:u.name,email:u.email,role:u.role});
  return NextResponse.json({name:u.name,role:u.role});
}
