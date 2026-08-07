FROM prom/prometheus:latest

ARG SCRAPE_INTERVAL=5s
ARG API_TARGET=host.docker.internal:8081

COPY prometheus.tmpl.yml /tmp/prometheus.tmpl.yml

USER root
RUN sed -e "s|__SCRAPE_INTERVAL__|${SCRAPE_INTERVAL}|g" \
        -e "s|__API_TARGET__|${API_TARGET}|g" \
        /tmp/prometheus.tmpl.yml > /etc/prometheus/prometheus.yml \
    && rm /tmp/prometheus.tmpl.yml \
    && promtool check config /etc/prometheus/prometheus.yml
USER nobody
