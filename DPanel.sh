docker run -d --name dpanel --restart=always \
 -p 81:80 -p 4431:443 -p 8807:8080 -e APP_NAME=dpanel \
 -v /var/run/docker.sock:/var/run/docker.sock -v dpanel:/dpanel \
dpanel/dpanel:latest