# Build image
docker build . -t libs:latest

# Run image and assign id to variable
containerId=$(docker run -d -i libs:latest)

# Copy libs from docker to host
docker cp $containerId:var/task/lambda-processor-layer ./lambda-processor-layer

# Kill image
docker kill $containerId
docker rm $containerId
