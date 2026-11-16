# Enonic XP - Standard ID Provider

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/237105894f2b4e33a50d20da3cb86a91)](https://www.codacy.com/app/enonic/app-standardidprovider?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=enonic/app-standardidprovider&amp;utm_campaign=Badge_Grade)


Standard Id provider for Enonic XP Admin

## Default OAuth consent page

XP shows this app's consent page, for device login and the authorization code flow, to the users of
any id provider whose app has no consent page of its own, when the vhost also maps the `system` id
provider. To map `system` for that page alone, give it this app's `consent` flow and nothing else:

```properties
mapping.example.idProvider.oidc = default
mapping.example.idProvider.oidc.flows = login,logout,device,code
mapping.example.idProvider.system = enabled
mapping.example.idProvider.system.flows = consent
```

The page's assets are served under `/_/idprovider/system/` whatever the flows, while `system`'s login,
autologin (service accounts) and logout stay off on that vhost.
