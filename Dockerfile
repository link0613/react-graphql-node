#
# Athena Single Docker Environment for Development
#
# VERSION 0.1
#
FROM node:8-alpine

LABEL maintainer="Andrey Miroshnichenko <andrey.miroshnichenko@atlasgurus.com>"

RUN apk add --no-cache tini su-exec supervisor libc6-compat libzmq bash nginx apache2-utils openssl openjdk8-jre

ENV STACK 6.2.4

RUN mkdir -p /usr/local/lib \
	&& ln -s /usr/lib/*/libzmq.so.3 /usr/local/lib/libzmq.so

RUN apk add --no-cache -t .build-deps wget ca-certificates \
	&& set -x \
	&& cd /tmp \
	&& echo "Download Elastic Stack ======================================================" \
	&& echo "Download Elasticsearch..." \
	&& wget --progress=bar:force -O elasticsearch-$STACK.tar.gz https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-$STACK.tar.gz \
	&& tar -xzf elasticsearch-$STACK.tar.gz \
	&& mv elasticsearch-$STACK /usr/share/elasticsearch \
	&& echo "Download Logstash..." \
	&& wget --progress=bar:force -O logstash-$STACK.tar.gz \
	https://artifacts.elastic.co/downloads/logstash/logstash-$STACK.tar.gz \
	&& tar -xzf logstash-$STACK.tar.gz \
	&& mv logstash-$STACK /usr/share/logstash \
	&& echo "Download Kibana..." \
	&& wget --progress=bar:force -O kibana-$STACK.tar.gz https://artifacts.elastic.co/downloads/kibana/kibana-$STACK-linux-x86_64.tar.gz \
	&& tar -xzf kibana-$STACK.tar.gz \
	&& mv kibana-$STACK-linux-x86_64 /usr/share/kibana \
	&& echo "Configure [Elasticsearch] ===================================================" \
	&& for path in \
	/usr/share/elasticsearch/data \
	/usr/share/elasticsearch/logs \
	/usr/share/elasticsearch/config \
	/usr/share/elasticsearch/config/scripts \
	/usr/share/elasticsearch/plugins \
	/usr/share/elasticsearch/tmp \
	; do \
	mkdir -p "$path"; \
	done \
	&& echo "Configure [Logstash] ========================================================" \
	&& if [ -f "$LS_SETTINGS_DIR/logstash.yml" ]; then \
	sed -ri 's!^(path.log|path.config):!#&!g' "$LS_SETTINGS_DIR/logstash.yml"; \
	fi \
	&& echo "Configure [Kibana] ==========================================================" \
	# the default "server.host" is "localhost" in 5+
	&& sed -ri "s!^(\#\s*)?(server\.host:).*!\2 '0.0.0.0'!" /usr/share/kibana/config/kibana.yml \
	&& grep -q "^server\.host: '0.0.0.0'\$" /usr/share/kibana/config/kibana.yml \
	# usr alpine nodejs and not bundled version
	&& bundled='NODE="${DIR}/node/bin/node"' \
	&& apline_node='NODE="/usr/bin/node"' \
	&& sed -i "s|$bundled|$apline_node|g" /usr/share/kibana/bin/kibana-plugin \
	&& sed -i "s|$bundled|$apline_node|g" /usr/share/kibana/bin/kibana \
	&& rm -rf /usr/share/kibana/node \
	&& echo "Make Nginx SSL directory..." \
	&& mkdir -p /etc/nginx/ssl \
	&& rm /etc/nginx/conf.d/default.conf \
	&& echo "Create elstack user..." \
	&& adduser -DH -s /sbin/nologin elstack \
	&& chown -R elstack:elstack /usr/share/elasticsearch \
	&& chown -R elstack:elstack /usr/share/logstash \
	&& chown -R elstack:elstack /usr/share/kibana \
	&& echo "Make Athena application directories..." \
	&& mkdir -p /usr/share/athena \
	&& echo "Clean Up..." \
	&& rm -rf /tmp/* \
	&& apk del --purge .build-deps

# add our user and group first to make sure their IDs get assigned consistently, regardless of whatever dependencies get added
RUN addgroup -S rabbitmq && adduser -S -h /var/lib/rabbitmq -G rabbitmq rabbitmq

RUN apk add --no-cache \
# Bash for docker-entrypoint
		bash \
# Procps for rabbitmqctl
		procps \
# Erlang for RabbitMQ
		erlang-asn1 \
		erlang-hipe \
		erlang-crypto \
		erlang-eldap \
		erlang-inets \
		erlang-mnesia \
		erlang \
		erlang-os-mon \
		erlang-public-key \
		erlang-sasl \
		erlang-ssl \
		erlang-syntax-tools \
		erlang-xmerl

# get logs to stdout (thanks @dumbbell for pushing this upstream! :D)
ENV RABBITMQ_LOGS=- RABBITMQ_SASL_LOGS=-
# https://github.com/rabbitmq/rabbitmq-server/commit/53af45bf9a162dec849407d114041aad3d84feaf

ENV RABBITMQ_HOME /usr/share/rabbitmq

# gpg: key 6026DFCA: public key "RabbitMQ Release Signing Key <info@rabbitmq.com>" imported
ENV RABBITMQ_GPG_KEY 0A9AF2115F4687BD29803A206B73A36E6026DFCA

ENV RABBITMQ_VERSION 3.7.4
ENV RABBITMQ_GITHUB_TAG v3.7.4

RUN set -ex; \
	\
	apk add --no-cache --virtual .build-deps \
		ca-certificates \
		gnupg \
		libressl \
		xz \
	; \
	\
	wget -O rabbitmq-server.tar.xz.asc "https://github.com/rabbitmq/rabbitmq-server/releases/download/$RABBITMQ_GITHUB_TAG/rabbitmq-server-generic-unix-${RABBITMQ_VERSION}.tar.xz.asc"; \
	wget -O rabbitmq-server.tar.xz     "https://github.com/rabbitmq/rabbitmq-server/releases/download/$RABBITMQ_GITHUB_TAG/rabbitmq-server-generic-unix-${RABBITMQ_VERSION}.tar.xz"; \
	\
	mkdir -p "$RABBITMQ_HOME"; \
	tar \
		--extract \
		--verbose \
		--file rabbitmq-server.tar.xz \
		--directory "$RABBITMQ_HOME" \
		--strip-components 1 \
	; \
	rm -f rabbitmq-server.tar.xz*; \
	\
# update SYS_PREFIX (first making sure it's set to what we expect it to be)
	grep -qE '^SYS_PREFIX=\$\{RABBITMQ_HOME\}$' "$RABBITMQ_HOME/sbin/rabbitmq-defaults"; \
	sed -ri 's!^(SYS_PREFIX=).*$!\1!g' "$RABBITMQ_HOME/sbin/rabbitmq-defaults"; \
	grep -qE '^SYS_PREFIX=$' "$RABBITMQ_HOME/sbin/rabbitmq-defaults"; \
	\
	apk del --purge .build-deps

# set home so that any `--user` knows where to put the erlang cookie
ENV HOME /var/lib/rabbitmq

RUN mkdir -p /var/lib/rabbitmq /etc/rabbitmq /var/log/rabbitmq \
	&& chown -R rabbitmq:rabbitmq /var/lib/rabbitmq /etc/rabbitmq /var/log/rabbitmq \
	&& chmod -R 777 /var/lib/rabbitmq /etc/rabbitmq /var/log/rabbitmq

# add a symlink to the .erlang.cookie in /root so we can "docker exec rabbitmqctl ..." without gosu
RUN ln -sf /var/lib/rabbitmq/.erlang.cookie /root/
RUN ln -sf "$RABBITMQ_HOME/plugins" /plugins

ENV PATH $RABBITMQ_HOME/sbin:$PATH
ENV PATH /usr/share/elasticsearch/bin:$PATH
ENV PATH /usr/share/logstash/bin:$PATH
ENV PATH /usr/share/kibana/bin:$PATH
ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk

# forward request and error logs to docker log collector
RUN ln -sf /dev/stdout /var/log/nginx/access.log
RUN ln -sf /dev/stderr /var/log/nginx/error.log

# Add custom elasticsearch config
COPY docker/config/elastic /usr/share/elasticsearch/config
COPY docker/config/elastic/logrotate /etc/logrotate.d/elasticsearch

# Add custom logstash config
COPY docker/config/logstash/conf.d/ /etc/logstash/conf.d/
COPY docker/config/logstash/patterns/ /opt/logstash/patterns/
COPY docker/config/logstash/logstash.yml /etc/logstash/

# necessary for 5.0+ (overriden via "--path.settings", ignored by < 5.0)
ENV LS_SETTINGS_DIR /etc/logstash

# fixes mktemp issue in alpine
ENV ES_TMPDIR /usr/share/elasticsearch/tmp

# Add custom nginx config
COPY docker/config/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/config/nginx/kibana.conf /etc/nginx/conf.d/
COPY docker/config/nginx/app.conf /etc/nginx/conf.d/

# Add custom supervisor config
COPY docker/config/supervisord/supervisord.conf /etc/supervisor/

COPY build /usr/share/athena

# Add entrypoints
COPY docker/entrypoints/elastic-entrypoint.sh /
COPY docker/entrypoints/logstash-entrypoint.sh /
COPY docker/entrypoints/kibana-entrypoint.sh /
COPY docker/entrypoints/rabbitmq-entrypoint.sh /
COPY docker/entrypoints/nginx-entrypoint.sh /
COPY docker/entrypoints/node-entrypoint.sh /

VOLUME ["/usr/share/elasticsearch/data"]
VOLUME ["/etc/logstash/conf.d"]
VOLUME ["/var/lib/rabbitmq"]
VOLUME ["/etc/nginx"]

EXPOSE 80 88 8000 5601 9200 9300 4369 5672 15672

CMD ["/sbin/tini","--","/usr/bin/supervisord","-c", "/etc/supervisor/supervisord.conf"]
