
import asyncio
import json
import os
import uuid
from typing import Dict, Any
from azure.identity import InteractiveBrowserCredential
from msgraph import GraphServiceClient
from msgraph.generated.models.application import Application
from msgraph.generated.models.spa_application import SpaApplication
from msgraph.generated.models.implicit_grant_settings import ImplicitGrantSettings
from msgraph.generated.models.service_principal import ServicePrincipal
from msgraph.generated.models.api_application import ApiApplication
from msgraph.generated.models.permission_scope import PermissionScope
from msgraph.generated.models.external_users_self_service_sign_up_events_flow import ExternalUsersSelfServiceSignUpEventsFlow
from msgraph.generated.models.on_authentication_method_load_start_external_users_self_service_sign_up import OnAuthenticationMethodLoadStartExternalUsersSelfServiceSignUp
# =============================================================================
# 1. CONFIGURATION
# =============================================================================

# Options: 'script' (use dictionary below) OR 'file' (load from .env/json)
DATA_SRC = 'script' 

# Options: 'SPA' (React/Vue/Next.js) OR 'WEB' (Python/Node/Go Backend)
PLATFORM_TYPE = 'SPA'

# IN-SCRIPT CONFIG (Used if DATA_SRC = 'script')
SCRIPT_CONFIG = {
    # Credentials for the Admin App that runs this script
    "TENANT_ID": "3941a9dd-5463-4cdc-b641-0db1621004fa",         
    # Not needed locally using azure cli
    # "CLIENT_ID": "e11df852-1343-481c-8dbb-ffb634351bd3",           
    # "CLIENT_SECRET": "b5Y8Q~vO1FMlWH5uSGbbQj4ecY_FaliMtGvD8cQL",  
    
    # The Subdomain for your External Tenant
    "TENANT_DOMAIN": "netabridge.onmicrosoft.com",

    # Project Details (The new customer-facing app you are creating)
    "PROJECT_TITLE": "IdealRing",
    "DISPLAY_NAME": "IdealRing External App",
    "REPLY_URLS": ["http://localhost:3000", "https://netabridge-mono-frontend.vercel.app"],

    # # Google Auth (Optional - leave empty if not using)
    # # You can configure this later by leaving it empty for now.
    # "GOOGLE_CLIENT_ID": "814850414952-qjgn7uuji90cc38bbtf3ghafljc3dug1.apps.googleusercontent.com",
    # "GOOGLE_CLIENT_SECRET": "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"
}
# =============================================================================
# 2. MAIN AUTOMATION LOGIC
# =============================================================================
async def main():
    print(f"🚀 Connecting to Tenant: {SCRIPT_CONFIG['TENANT_ID']}")
    print("---------------------------------------------------------")
    print("👉 A browser window will open.")
    print(f"👉 Please sign in with the account that is Admin for: {SCRIPT_CONFIG['TENANT_ID']}")
    print("---------------------------------------------------------")

    # A. AUTHENTICATION
    # We use InteractiveBrowserCredential to FORCE the correct tenant context.
    # We removed the 'smoke test' to reduce the number of popups.
    try:
        creds = InteractiveBrowserCredential(
            tenant_id=SCRIPT_CONFIG['TENANT_ID'],
            client_id="04b07795-8ddb-461a-bbee-02f9e1bf7b46" # Standard Azure CLI ID
        )
    except Exception as e:
        print(f"❌ Auth setup failed: {e}")
        return

    client = GraphServiceClient(creds, scopes=['https://graph.microsoft.com/.default'])

    # B. Create App Registration (SPA)
    print(f"--- 1. Creating App Registration (SPA) ---")
    
    # We define the App with just the redirect URIs.
    # Implicit settings are not strictly required for modern PKCE, 
    # but we can add them via patch if legacy support is needed.
    app_body = Application(
        display_name=SCRIPT_CONFIG['DISPLAY_NAME'],
        sign_in_audience="AzureADandPersonalMicrosoftAccount",
        spa=SpaApplication(
            redirect_uris=SCRIPT_CONFIG['REPLY_URLS']
        )
    )
    
    try:
        app_result = await client.applications.post(app_body)
        print(f"✅ App Created. ID: {app_result.app_id}")
    except Exception as e:
        print(f"❌ Failed to create app: {e}")
        return

    # C. Patch Identifier URI
    print("--- 2. Setting Identifier URI ---")
    uri = f"api://{app_result.app_id}"
    patch_body = Application(identifier_uris=[uri])
    await client.applications.by_application_id(app_result.id).patch(patch_body)
    print(f"✅ Identifier URI set: {uri}")

    # D. Expose Scope
    print("--- 3. Exposing 'access_as_user' Scope ---")
    scope_id = str(uuid.uuid4())
    permission_scope = PermissionScope(
        id=scope_id,
        admin_consent_description="Allows the app to access the api as the signed-in user.",
        admin_consent_display_name="Access as user",
        user_consent_description="Allow the application to access the api on your behalf.",
        user_consent_display_name="Access as user",
        is_enabled=True,
        type="User",
        value="access_as_user"
    )
    api_patch = Application(api=ApiApplication(oauth2_permission_scopes=[permission_scope]))
    await client.applications.by_application_id(app_result.id).patch(api_patch)
    print(f"✅ Scope 'access_as_user' created.")

    # E. Create Service Principal
    print("--- 4. Creating Service Principal ---")
    sp_body = ServicePrincipal(app_id=app_result.app_id)
    sp_result = await client.service_principals.post(sp_body)
    print(f"✅ Service Principal Created. ID: {sp_result.id}")

    # F. Create User Flow (Simplified)
    print("--- 5. Creating User Flow ---")
    flow_id = f"SignUpSignIn_{str(uuid.uuid4())[:8]}"
    
    # Simplified instantiation to avoid SDK TypeErrors. 
    # We just create the container; defaults (Email/Pass) usually apply.
    user_flow = ExternalUsersSelfServiceSignUpEventsFlow(
        display_name="Sign Up and Sign In (Auto)",
        description="Created by Python Script"
    )
    
    created_flow = None
    try:
        created_flow = await client.identity.authentication_events_flows.post(user_flow)
        print(f"✅ User Flow Created: {created_flow.display_name}")
    except Exception as e:
        print(f"⚠️  User Flow Note: {str(e).split('For more')[0]}")

    # G. Output
    print("\n⬇️  FRONTEND CONFIGURATION  ⬇️")
    subdomain = SCRIPT_CONFIG["TENANT_DOMAIN"].split('.')[0]
    authority_url = f"https://{subdomain}.ciam.login.microsoft.com/{SCRIPT_CONFIG['TENANT_ID']}"

    frontend_config = {
        "auth": {
            "clientId": app_result.app_id,
            "authority": authority_url,
            "knownAuthorities": [f"{subdomain}.ciam.login.microsoft.com"],
            "redirectUri": SCRIPT_CONFIG['REPLY_URLS'][0]
        },
        "api": {
            "scopes": [f"{uri}/access_as_user"]
        }
    }
    print(json.dumps(frontend_config, indent=2))
    print("---------------------------------------------")
    
    flow_name = created_flow.display_name if created_flow else "Sign Up"
    print(f"👉 FINAL MANUAL STEP: Link App to User Flow")
    print(f"   1. Go to Portal -> External Identities -> User flows")
    print(f"   2. Click '{flow_name}'")
    print(f"   3. Click 'Applications' -> Add Application")
    print(f"   4. Select: {SCRIPT_CONFIG['DISPLAY_NAME']}")
    print(f"   (Optional: Click 'Identity providers' to enable Google)")

if __name__ == "__main__":
    asyncio.run(main())