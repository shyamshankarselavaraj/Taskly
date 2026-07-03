@echo off
cd /d E:\Projects\MyApp\android
echo Stopping gradle daemons...
gradlew.bat --stop > "%TEMP%\gradle-stop.txt" 2>&1
if exist "C:\Users\SHYAMSHANKAR\.gradle\caches\9.3.1\transforms" (
  rd /s /q "C:\Users\SHYAMSHANKAR\.gradle\caches\9.3.1\transforms"
  echo REMOVED
) else (
  echo MISSING
)
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
echo JAVA_HOME=%JAVA_HOME%
echo Running gradlew clean...
gradlew.bat clean --no-daemon --refresh-dependencies > "%TEMP%\gradle-clean.txt" 2>&1
echo Running gradlew app:installDebug...
gradlew.bat app:installDebug --no-daemon > "%TEMP%\gradle-install3.txt" 2>&1
echo DONE
