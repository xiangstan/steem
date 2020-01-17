# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

  config.vm.box="bento/ubuntu-16.04"
  config.vm.hostname = "steem.local"
  config.vm.define "steem.local"
  config.vm.provider :virtualbox do |vb|
    vb.name = "STEEM"
    vb.customize ['modifyvm', :id, '--memory', '2048']
  end
  config.vm.network "forwarded_port", guest: 80, host: 8092, host_ip: "127.0.0.1"
  config.vm.network :forwarded_port, guest:22, host: 2292, host_ip: "127.0.0.1", id: "ssh"
  config.vm.synced_folder ".", "/vagrant", type: "virtualbox"

  config.vm.provision "shell", inline: <<-SHELL
    apt update
    echo "Installing packages" 
    apt install -y software-properties-common
    add-apt-repository ppa:ondrej/php
    apt update
    apt install -y wget php7.3 php7.3-fpm nginx sendmail

    echo "Turning off NGINX caching in VirtualBox"
    sed -i 's/sendfile on/sendfile off/g' /etc/nginx/nginx.conf

    echo "Loading NGINX configuration"
    echo 'server {
        listen 80 default_server;
        listen [::]:80 default_server;
        root /var/www/public;
        index index.php index.html index.htm;
        server_name localhost;
        error_page 404 /404.php;
        location / {
                try_files $uri $uri/ @rewrite;
                if ($request_uri ~* ".(ico|gif|jpe?g|png)$") {
                        expires 30d;
                        access_log off;
                        add_header Pragma public;
                        add_header Cache-Control "public";
                        break;
                }
                if ($request_uri ~* ".(css|js)$") {
                        expires 7d;
                        access_log off;
                        add_header Pragma public;
                        add_header Cache-Control "public";
                        break;
                }
        }
        location @rewrite {
                rewrite ^ $uri.php last;
        }
        location ~ \\.php$ {
                include snippets/fastcgi-php.conf;
                fastcgi_pass unix:/run/php/php7.3-fpm.sock;
                fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                include fastcgi_params;
        }
        location ~* \\.(eot|otf|ttf|woff|woff2)$ {
                access_log      off;
                log_not_found   off;
                expires         max;
                add_header      Cache-Control "public";
                add_header      Access-Control-Allow-Origin *;
        }
}' > /etc/nginx/sites-enabled/default

    echo "Linking working directory to web root"
    rm -R /var/www
    ln -s /vagrant /var/www

    echo "Restarting NGINX"
    systemctl restart nginx.service

  SHELL
end
