plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
 namespace="br.com.caririmonitoramento.central24h"
 compileSdk=35
 defaultConfig {
  applicationId="br.com.caririmonitoramento.central24h"
  minSdk=26
  targetSdk=35
  versionCode=1
  versionName="1.0.0"
 }
 compileOptions { sourceCompatibility=JavaVersion.VERSION_17; targetCompatibility=JavaVersion.VERSION_17 }
 kotlinOptions { jvmTarget="17" }
 buildFeatures { buildConfig=true }
 signingConfigs {
  create("production") {
   val keyPath=System.getenv("CARIRI_KEYSTORE_PATH")
   if(!keyPath.isNullOrBlank()) storeFile=file(keyPath)
   storePassword=System.getenv("CARIRI_KEYSTORE_PASSWORD")
   keyAlias=System.getenv("CARIRI_KEY_ALIAS")
   keyPassword=System.getenv("CARIRI_KEY_PASSWORD")
  }
 }
 buildTypes {
  release {
   isMinifyEnabled=false
   signingConfig=signingConfigs.getByName("production")
   proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"),"proguard-rules.pro")
  }
 }
}
dependencies {
 implementation("androidx.core:core-ktx:1.15.0")
 implementation("androidx.appcompat:appcompat:1.7.0")
 implementation("com.google.android.material:material:1.12.0")
 implementation("androidx.activity:activity-ktx:1.10.0")
 implementation("com.google.android.gms:play-services-location:21.3.0")
}
