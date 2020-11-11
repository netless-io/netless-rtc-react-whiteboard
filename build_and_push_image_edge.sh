set -exo pipefail
yarn
yarn build
image=netless-agora-react-whiteboard
version=1.0.0

hash=$(git rev-parse --short HEAD)

docker build -f Dockerfile -t registry-dev.netless.link/demo/$image:$version-$hash -t registry-dev.netless.link/demo/$image:latest .
docker push registry-dev.netless.link/demo/$image:$version-$hash
docker push registry-dev.netless.link/demo/$image:latest

ssh k8s-company-dev -tt "kubectl patch deployment demo-rtc -n demo --patch '{\"spec\": {\"template\": {\"metadata\": {\"annotations\": {\"version\": \"$version-$hash\"}}}}}'"