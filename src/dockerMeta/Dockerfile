
    FROM arm64v8/debian:latest

    USER root
    RUN apt-get update && apt-get install -y sudo curl unzip libgconf-2-4 scrot openjdk-11-jdk xvfb chromium x11vnc libxkbcommon-x11-0 ffmpeg procps 
    RUN apt-get install -y gnupg build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev libc6
    RUN apt-get install -y glib2.0-dev libexpat1-dev pkg-config libtiff5-dev libjpeg62-turbo-dev libgsf-1-dev
    COPY pin_nodesource /etc/apt/preferences.d/nodesource
    ADD xvfb-chromium /usr/bin/xvfb-chromium
    RUN ln -s /usr/bin/xvfb-chromium /usr/bin/google-chrome
    RUN ln -s /usr/bin/xvfb-chromium /usr/bin/chromium-browser 

   RUN curl -fsSL https://deb.nodesource.com/setup_15.x | bash -
   RUN apt-get install -y nodejs

   RUN curl -L https://github.com/libvips/libvips/releases/download/v8.10.6/vips-8.10.6.tar.gz | tar zx
   RUN ls
   #RUN tar xf vips-8.10.6
   WORKDIR /vips-8.10.6
   RUN ls
   RUN ./configure
   RUN make
   RUN make install
   RUN ldconfig   
    
   WORKDIR /usr/src/app
   COPY iocore.jar iocore.jar
   COPY eyes eyes
   WORKDIR /usr/src/app/eyes
   RUN node -v
   RUN npm install 
   WORKDIR /usr/src/app
   
   # 5945 is the VNC PORT 
   # 4567 is the IOCORE SERVER PORT 
   # 5943 is the DEV CUSTOM PORT 
   # 3000 is the VIDEO ANALYAZER PORT
   EXPOSE 5945 4567 3000 5943
   
   CMD tail -f /dev/null & node eyes/server.js
    
    