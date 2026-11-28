import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {prisma} from "../../../../lib/prisma";
import {session} from "../../../../lib/auth";
export async function POST(req:Request){
 const s=await session();if(!s)return NextResponse.json({error:"Entre novamente no sistema."},{status:401});
 if(req.headers.get("sec-fetch-site")==="cross-site")return NextResponse.json({error:"Acesso negado"},{status:403});
 const b=await req.json().catch(()=>null);
 if(!b||typeof b.currentPassword!=="string"||typeof b.newPassword!=="string"||b.newPassword!==b.confirmPassword||b.newPassword.length<12||Buffer.byteLength(b.newPassword)>72||Buffer.byteLength(b.currentPassword)>72)return NextResponse.json({error:"Confira as senhas. A nova senha deve ter ao menos 12 caracteres e até 72 bytes."},{status:400});
 const u=await prisma.staffUser.findUnique({where:{id:s.id}});
 if(!u?.active||!await bcrypt.compare(b.currentPassword,u.passwordHash))return NextResponse.json({error:"Senha atual incorreta."},{status:400});
 if(await bcrypt.compare(b.newPassword,u.passwordHash))return NextResponse.json({error:"Escolha uma senha diferente da atual."},{status:400});
 const changed=await prisma.staffUser.updateMany({where:{id:s.id,active:true,passwordHash:u.passwordHash},data:{passwordHash:await bcrypt.hash(b.newPassword,12)}});
 if(changed.count!==1)return NextResponse.json({error:"Senha alterada em outra sessão. Tente novamente."},{status:409});
 return NextResponse.json({ok:true});
}
