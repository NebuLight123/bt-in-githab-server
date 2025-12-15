#!/bin/bash
wget -O mohist-1.20.1.jar https://dl.mohistmc.cn:41211/project/mohist/1.20.1/builds/273/
echo "java -jar mohist-1.20.1.jar" > run.sh
chmod +x run.sh
sudo ln -s run.sh ~/run_mc.sh
echo -e "#!/bin/bash \n sed -i.bak 's/online-mode=true/online-mode=false/' server.properties" > deb_mc_install_3.sh
chmod +x deb_mc_install_3.sh
echo 等待30喵后输入stop, 执行deb_mc_install_3.sh
./run.sh