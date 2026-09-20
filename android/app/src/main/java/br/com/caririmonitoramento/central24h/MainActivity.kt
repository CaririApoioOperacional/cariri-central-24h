package br.com.caririmonitoramento.central24h

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.webkit.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat

class MainActivity:AppCompatActivity(){
 private lateinit var web:WebView
 private val base="https://cariri-central-24h-production.up.railway.app"
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
    if(url?.contains("/tecnico")==true){requestOperationalPermissions()}else stopService(Intent(this@MainActivity,LocationService::class.java))
   }
  }
  if(savedInstanceState==null)web.loadUrl("$base/login")
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
 }
 override fun onBackPressed(){if(web.canGoBack())web.goBack() else super.onBackPressed()}
 override fun onSaveInstanceState(out:Bundle){web.saveState(out);super.onSaveInstanceState(out)}
 override fun onRestoreInstanceState(state:Bundle){super.onRestoreInstanceState(state);web.restoreState(state)}
}
