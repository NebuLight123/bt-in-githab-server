sudo echo AwA
sudo apt update
sudo apt install -y curl moby-engine moby-cli moby-containerd
sudo docker version
sudo systemctl enable --now docker
sudo mkdir -p /data/firefox/config
sudo mkdir -p /workspaces/bt-in-githab-serve/Firefox
sudo chmod 777 -R ~/awa
sudo docker run -d --name firefox \
-e TZ=Asia/Shanghai \
-e KEEP_APP_RUNNING=1 \
-e ENABLE_CJK_FONT=1 \
-p 5800:5800 \
-v /data/firefox/config:/config:rw \
-v /workspaces/bt-in-githab-serve/Firefox:/home/abc/awa:rw \
-e LANG=zh_CN.UTF-8 \
--shm-size 2g jlesage/firefox