package org.imperial.mrc.modelserver.security

import org.pac4j.core.client.Clients
import org.pac4j.core.config.Config
import org.pac4j.http.credentials.authenticator.test.SimpleTestUsernamePasswordAuthenticator
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.ComponentScan
import org.springframework.context.annotation.Configuration
import org.pac4j.http.client.indirect.FormClient

@Configuration
@ComponentScan(basePackages = ["org.pac4j.springframework.web"])
class Pac4jConfig{
   @Bean
   fun config(): Config
   {
       val formClient = FormClient("/login", SimpleTestUsernamePasswordAuthenticator())

       val clients = Clients("/callback", formClient)
       return Config(clients)
   }
}