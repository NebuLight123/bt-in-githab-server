# TuringBlessing
sudo echo AwA
sudo apt update
sudo apt install -y curl moby-engine moby-cli moby-containerd
sudo docker version
sudo systemctl enable --now docker
sudo mkdir -p /etc/sing-box
sudo cp /config.json /etc/sing-box
docker run -d \
  -v /etc/sing-box:/etc/sing-box/ \
  --name=sing-box \
  --restart=always \
  ghcr.io/sagernet/sing-box \
  -p 4079:443
  -D /var/lib/sing-box \
  -C /etc/sing-box/ run
# TuringBlessing