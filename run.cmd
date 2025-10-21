@echo off

echo Démarrage du build du backend et du frontend...
cd backend

call mvn clean package && (
    echo.
    echo ✅ Build réussi. Démarrage de l'application...
    java -jar target/squadify.jar
)

if errorlevel 1 (
    echo.
    echo ❌ ERREUR: La construction (mvn package) a echoue ou a ete interrompue.
)

echo.
pause