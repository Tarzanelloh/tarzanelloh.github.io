import injectScript from "./loader"

const externalJsResources = [
    "https://cdn.auth0.com/js/auth0-spa-js/1.18/auth0-spa-js.production.js", // Auth0
    "https://www.googletagmanager.com/gtag/js?id=AW-622346733", // Global site tag (gtag.js) - Google Ads: 622346733
    "https://platform-api.sharethis.com/js/sharethis.js#property=5f7c8849ef38dc0012de92a7&product=undefined", // ShareThis
    "https://addevent.com/libs/atc/1.6.1/atc.min.js" // AddEvent
]


const uhubsJsResources = [
    "amplitude-integration",
    "auth0-integration",
    "misc-integrations"
]

const uhubsCssResources = [
    "style-fixes"
]

function loadUhubsResource(head, resourceName, type = "js") {
    const resourceUrl = `./${resourceName}`
    switch (type) {
        case "js":
            injectScript(resourceUrl)
        case "css":
            loadCSSResource(resourceUrl)
    }
}

function loadAllResources() {
    externalJsResources.forEach(url => injectScript(url))
    uhubsJsResources.forEach(resourceName => loadUhubsResource(resourceName, "js"))
    uhubsCssResources.forEach(resourceName => loadUhubsResource(resourceName, "css"))
}

loadAllResources()
