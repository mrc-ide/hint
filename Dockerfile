FROM openjdk:8u121

RUN mkdir /static/public -p

COPY ./src/app/static/public /static/public
COPY ./src/app/templates /templates
COPY ./docker/entrypoint /entrypoint

ADD ./src/app/build/distributions/app-boot.tar /

ARG SPRING_PROFILES_ACTIVE
ENV SPRING_PROFILES_ACTIVE $SPRING_PROFILES_ACTIVE

# This path is needed for the eventual configuration
CMD mkdir -p /etc/hint

ENTRYPOINT ["/entrypoint"]
