npm install
npm run build
echo $1 > version
docker buildx build --platform=linux/arm64,linux/amd64 . -t gru.ocir.io/grw9f34bf5yo/mkns-web:latest --push

#git tag $1
#git push --tags
echo "Pushed $1"
