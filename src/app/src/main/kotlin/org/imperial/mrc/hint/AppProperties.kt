package org.imperial.mrc.hint

import org.springframework.stereotype.Component
import java.io.File
import java.io.FileNotFoundException
import java.net.URL
import java.util.*

interface AppProperties
{
    val adrANCSchema: String
    val adrARTSchema: String
    val adrPJNZSchema: String
    val adrPopSchema: String
    val adrShapeSchema: String
    val adrSurveySchema: String
    val adrVmmcSchema: String
    val adrOutputZipSchema: String
    val adrOutputSummarySchema: String
    val adrOutputComparisonSchema: String
    val adrDatasetSchema: String
    val adrUrl: String
    val apiUrl: String
    val applicationTitle: String
    val applicationUrl: String
    val emailMode: String
    val emailServer: String
    val emailPort: Int?
    val emailSender: String
    val emailUsername: String
    val emailPassword: String
    val exploreApplicationTitle: String
    val tokenIssuer: String
    val uploadDirectory: String
    val dbUser: String
    val dbPassword: String
    val dbUrl: String
    val issueReportUrl: String
    val supportEmail: String
    val oauth2ClientId: String
    val oauth2ClientSecret: String
    val oauth2ClientUrl: String
    val oauth2ClientAdrServerUrl: String
    val oauth2ClientAudience: String
    val oauth2ClientScope: String
    val oauth2LoginMethod: Boolean
}

//prevent auto-wiring of default Properties
class HintProperties : Properties()

@Component
class ConfiguredAppProperties(private val props: HintProperties = properties) : AppProperties
{
    override val adrANCSchema = propString("adr_anc_schema")
    override val adrARTSchema = propString("adr_art_schema")
    override val adrPJNZSchema = propString("adr_pjnz_schema")
    override val adrPopSchema = propString("adr_pop_schema")
    override val adrShapeSchema = propString("adr_shape_schema")
    override val adrSurveySchema = propString("adr_survey_schema")
    override val adrVmmcSchema = propString("adr_vmmc_schema")
    override val adrOutputZipSchema = propString("adr_output_zip_schema")
    override val adrOutputSummarySchema = propString("adr_output_summary_schema")
    override val adrOutputComparisonSchema = propString("adr_output_comparison_schema")
    override val adrDatasetSchema = propString("adr_schema")
    override val adrUrl = propString("adr_url")
    override val apiUrl = propString("hintr_url")
    override val applicationTitle = propString("application_title")
    override val applicationUrl = propString("application_url")
    override val emailMode = propString("email_mode")
    override val emailServer = propString("email_server")
    override val emailPort = propString("email_port").toIntOrNull()
    override val emailSender = propString("email_sender")
    override val emailUsername = propString("email_username")
    override val emailPassword = propString("email_password")
    override val exploreApplicationTitle = propString("explore_application_title")
    override val tokenIssuer = propString("token_issuer")
    override val uploadDirectory = propString("upload_dir")
    override val dbUser: String = propString("db_user")
    override val dbPassword: String = propString("db_password")
    override val dbUrl: String = propString("db_url")
    override val issueReportUrl: String = propString("issue_report_url")
    override val supportEmail: String = propString("support_email")
    override val oauth2ClientId: String = propString("oauth2_client_id")
    override val oauth2ClientSecret: String = propString("oauth2_client_secret")
    override val oauth2ClientUrl: String = propString("oauth2_client_url")
    override val oauth2ClientAudience: String = propString("oauth2_client_audience")
    override val oauth2ClientAdrServerUrl = propString("oauth2_client_adr_server_url")
    override val oauth2ClientScope = propString("oauth2_client_scope")
    override val oauth2LoginMethod = propString("oauth2_login_method").toBoolean()

    companion object
    {

        fun readProperties(configPath: String): HintProperties
        {
            return HintProperties().apply {
                load(getResource("config.properties").openStream())
                val global = File(configPath)
                if (global.exists())
                {
                    global.inputStream().use { load(it) }
                }
            }
        }

        var configPath = "/etc/hint/config.properties"
        val properties = readProperties(configPath)
    }

    private fun propString(propName: String): String
    {
        return props[propName].toString()
    }
}

fun getResource(path: String): URL
{
    val url: URL? = AppProperties::class.java.classLoader.getResource(path)
    if (url != null)
    {
        return url
    }
    else
    {
        throw FileNotFoundException("Unable to load '$path' as a resource steam")
    }
}
