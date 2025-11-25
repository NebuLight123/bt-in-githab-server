#!/bin/bash
sudo ufw allow 3001/tcp
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
sudo cp -f http_f home/awa/http_f
cd home/awa/http_f
npm init -y
npm install express cors fs-extra --save
node server.js
pm2 start server.js --name device-http-server
pm2 status
pm2 save