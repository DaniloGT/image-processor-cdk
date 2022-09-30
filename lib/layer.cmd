REM Build image
docker build . -t libs:latest

REM Run image and assign id to variable
docker run -d -i libs:latest > tmpFile
set /p containerId= < tmpFile
del tmpFile

REM Copy libs from docker to host
docker cp %containerId%:var/task/lambda-processor-layer ./lambda-processor-layer

REM Kill image
docker kill %containerId%
docker rm %containerId%
