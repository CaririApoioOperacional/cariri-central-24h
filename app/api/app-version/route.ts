import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export async function GET(){
 return NextResponse.json({
  versionCode:2,
  versionName:"1.0.1",
  apkUrl:"https://github.com/CaririApoioOperacional/cariri-central-24h/releases/latest/download/CARIRI-CENTRAL-24h.apk",
  required:false
 },{headers:{"Cache-Control":"no-store"}});
}
