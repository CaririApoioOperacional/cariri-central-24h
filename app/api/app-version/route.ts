import {NextResponse} from "next/server";
export const dynamic="force-dynamic";
export async function GET(){
 return NextResponse.json({
  versionCode:4,
  versionName:"1.0.3",
  apkUrl:"https://github.com/CaririApoioOperacional/cariri-central-24h/releases/download/android-v1.0.3/CARIRI-CENTRAL-24h.apk",
  required:false
 },{headers:{"Cache-Control":"no-store"}});
}
