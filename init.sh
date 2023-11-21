#!/bin/bash


envsubst < /usr/share/nginx/html/scripts/envs.template > /usr/share/nginx/html/scripts/envs.js

nginx -g "daemon off;"
