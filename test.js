injectScript("https://cdn.auth0.com/js/auth0-spa-js/1.18/auth0-spa-js.production.js").then(async () => {
    const config = {
        auth0: {
            domain: "uhubs-staging.eu.auth0.com",
            client_id: "RLaFcdBuvgXPws43E3iQkjYPCqMeR4Tq",
            cacheLocation: "localstorage",
            audience: "https://api.uhubs.co.uk"
        },
        backend: "https://api-staging.uhubs.co.uk"
    }
    auth0 = await createAuth0Client(config.auth0);
    console.log("hi from auth0?", auth0)
});