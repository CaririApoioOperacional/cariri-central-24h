import {NextResponse} from "next/server";import {prisma} from "../../../lib/prisma";
export async function GET(){return NextResponse.json(await prisma.customer.findMany({include:{sites:true,contacts:true},orderBy:{createdAt:"desc"}}))}
export async function POST(req:Request){const b=await req.json();if(!b.name)return NextResponse.json({error:"Nome obrigatório"},{status:400});return NextResponse.json(await prisma.customer.create({data:{name:b.name}}),{status:201})}
