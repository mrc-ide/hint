FROM mrcide/node-20-docker:main

RUN apt-get install wget

RUN wget -qO - https://packages.adoptium.net/artifactory/api/gpg/key/public | apt-key add -
RUN add-apt-repository --yes https://packages.adoptium.net/artifactory/deb/
RUN apt-get update
RUN apt-get install temurin-11-jdk=11.0.20.1.0+1 -y

# Setup gradle
COPY ./src/gradlew /hint/src/
COPY ./src/gradle /hint/src/gradle/
WORKDIR /hint/src
RUN ./gradlew

# Pull in dependencies
COPY ./src/build.gradle /hint/src/
COPY ./src/settings.gradle /hint/src/
COPY ./src/config/ /hint/src/config/

RUN ./gradlew
RUN npm install codecov -g

# Install front-end dependencies
COPY ./src/app/static/package.json /hint/src/app/static/package.json
COPY ./src/app/static/package-lock.json /hint/src/app/static/package-lock.json
RUN npm ci --prefix=app/static

# Copy source
COPY . /hint
RUN ./gradlew :app:compileKotlin
