package br.com.caririmonitoramento.central24h

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.webkit.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

class MainActivity:AppCompatActivity(){
 private lateinit var web:WebView
 private val base="https://cariri-central-24h-production.up.railway.app"
 private val io=Executors.newSingleThreadExecutor()
 private val permissions=registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()){ startTrackingIfAllowed() }

 override fun onCreate(savedInstanceState:Bundle?){
  super.onCreate(savedInstanceState);setContentView(R.layout.activity_main)
  web=findViewById(R.id.web)
  CookieManager.getInstance().apply{setAcceptCookie(true);setAcceptThirdPartyCookies(web,false)}
  web.settings.apply{javaScriptEnabled=true;domStorageEnabled=true;databaseEnabled=true;allowFileAccess=false;allowContentAccess=true;setGeolocationEnabled(true)}
  web.webChromeClient=object:WebChromeClient(){
   override fun onGeolocationPermissionsShowPrompt(origin:String?,callback:GeolocationPermissions.Callback?){callback?.invoke(origin,true,false)}
  }
  web.webViewClient=object:WebViewClient(){
   override fun shouldOverrideUrlLoading(v:WebView?,r:WebResourceRequest?):Boolean{
    val u=r?.url?:return false
    if(u.scheme=="https"&&u.host=="cariri-central-24h-production.up.railway.app")return false
    startActivity(Intent(Intent.ACTION_VIEW,u));return true
   }
   override fun onPageFinished(v:WebView?,url:String?){
    super.onPageFinished(v,url)
    if(url?.contains("/tecnico")==true){requestOperationalPermissions()}else {stopService(Intent(this@MainActivity,LocationService::class.java));stopService(Intent(this@MainActivity,DispatchWatcher::class.java))}
   }
  }
  if(savedInstanceState==null)web.loadUrl("$base/login")
  checkForUpdate()
 }
 private fun checkForUpdate(){
  io.execute{
   try{
    val c=URL("$base/api/app-version").openConnection() as HttpURLConnection
    c.connectTimeout=8000;c.readTimeout=8000;c.setRequestProperty("Accept","application/json")
    if(c.responseCode!=200)return@execute
    val j=JSONObject(c.inputStream.bufferedReader().readText())
    val latest=j.optInt("versionCode",BuildConfig.VERSION_CODE)
    val apk=j.optString("apkUrl","")
    val name=j.optString("versionName","")
    if(latest>BuildConfig.VERSION_CODE&&apk.startsWith("https://"))runOnUiThread{offerUpdate(name,apk)}
   }catch(_:Exception){}
  }
 }
 private fun offerUpdate(version:String,url:String){
  AlertDialog.Builder(this).setTitle("Atualização CARIRI CENTRAL 24h")
   .setMessage("Nova versão $version disponível. A atualização será baixada agora e o Android solicitará a confirmação da instalação.")
   .setCancelable(false).setPositiveButton("ATUALIZAR"){_,_->downloadUpdate(url)}
   .setNegativeButton("DEPOIS",null).show()
 }
 private fun downloadUpdate(url:String){
  io.execute{
   try{
    val dir=File(cacheDir,"updates").apply{mkdirs()};val apk=File(dir,"CARIRI-CENTRAL-24h.apk")
    val c=URL(url).openConnection() as HttpURLConnection;c.instanceFollowRedirects=true;c.connectTimeout=15000;c.readTimeout=30000
    c.inputStream.use{input->apk.outputStream().use{out->input.copyTo(out)}}
    runOnUiThread{installUpdate(apk)}
   }catch(_:Exception){runOnUiThread{AlertDialog.Builder(this).setMessage("Não foi possível baixar a atualização. Tente novamente com conexão à internet.").setPositiveButton("OK",null).show()}}
  }
 }
 private fun installUpdate(apk:File){
  if(android.os.Build.VERSION.SDK_INT>=26&&!packageManager.canRequestPackageInstalls()){
   startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,Uri.parse("package:$packageName")))
   return
  }
  val uri=FileProvider.getUriForFile(this,"$packageName.files",apk)
  startActivity(Intent(Intent.ACTION_VIEW).setDataAndType(uri,"application/vnd.android.package-archive").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK))
 }
 private fun requestOperationalPermissions(){
  val p=mutableListOf<String>()
  if(ContextCompat.checkSelfPermission(this,Manifest.permission.ACCESS_FINE_LOCATION)!=PackageManager.PERMISSION_GRANTED)p+=Manifest.permission.ACCESS_FINE_LOCATION
  if(android.os.Build.VERSION.SDK_INT>=33&&ContextCompat.checkSelfPermission(this,Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)p+=Manifest.permission.POST_NOTIFICATIONS
  if(p.isNotEmpty())permissions.launch(p.toTypedArray()) else startTrackingIfAllowed()
 }
 private fun startTrackingIfAllowed(){
  if(ContextCompat.checkSelfPermission(this,Manifest.permission.ACCESS_FINE_LOCATION)==PackageManager.PERMISSION_GRANTED)
   ContextCompat.startForegroundService(this,Intent(this,LocationService::class.java))
  ContextCompat.startForegroundService(this,Intent(this,DispatchWatcher::class.java))
 }
 override fun onBackPressed(){if(web.canGoBack())web.goBack() else super.onBackPressed()}
 override fun onSaveInstanceState(out:Bundle){web.saveState(out);super.onSaveInstanceState(out)}
 override fun onRestoreInstanceState(state:Bundle){super.onRestoreInstanceState(state);web.restoreState(state)}
 override fun onDestroy(){io.shutdownNow();super.onDestroy()}
}
