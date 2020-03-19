set -exo pipefail
yarn
yarn build
image=netless-agora-react-whiteboard
version=1.0.0

hash=$(git rev-parse --short HEAD)

docker build -f Dockerfile -t registry.cn-hangzhou.aliyuncs.com/white/$image:$version-$hash -t registry.cn-hangzhou.aliyuncs.com/white/$image:latest .
docker push registry.cn-hangzhou.aliyuncs.com/white/$image:$version-$hash
docker push registry.cn-hangzhou.aliyuncs.com/white/$image:latest

ssh k8s-site -tt "cd ~/k8s-site/demo/netless-agora-react-whiteboard && \
    kubectl apply -f deploy.yml && \
    kubectl patch deployment netless-agora-react-whiteboard -n demo --patch '{\"spec\": {\"template\": {\"metadata\": {\"annotations\": {\"version\": \"$version-$hash\"}}}}}'"
