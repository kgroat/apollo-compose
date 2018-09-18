FROM node:8.11

ARG USER_UID

ENV APP_HOME=/app \
    NPM_CACHE_FOLDER=/home/.npm \
    EDITOR=vim

RUN apt-get update && \
    apt-get install -y sudo vim

RUN mkdir -p $NPM_CACHE_FOLDER

RUN npm config set cache $NPM_CACHE_FOLDER
RUN npm i -g npm@latest

RUN cat /etc/passwd | sed -e "/^node:/d" > /tmp/passwd ; \
    echo "node:x:${USER_UID}:$USER_UID:,,,:/home/node:/bin/bash" >> /tmp/passwd ;\
    cat /tmp/passwd > /etc/passwd ;\
    rm /tmp/passwd

RUN echo 'ALL ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

RUN mkdir -p $APP_HOME \
    && chown -R $USER_UID:$USER_UID $APP_HOME \
    && chmod 755 $APP_HOME

COPY ./docker-support/node-profile.sh /etc/profile.d/node-profile.sh

USER $USER_UID

RUN mkdir -p $APP_HOME/node_modules

WORKDIR $APP_HOME

COPY ./docker-support/node-entrypoint.sh /usr/local/bin/entrypoint.sh
ENTRYPOINT /usr/local/bin/entrypoint.sh
