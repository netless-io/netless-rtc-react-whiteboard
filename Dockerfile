FROM openresty/openresty:centos
COPY ./build /usr/local/openresty/nginx/build
COPY ./nginx.conf /usr/local/openresty/nginx/conf/nginx.conf

CMD ["openresty"]

