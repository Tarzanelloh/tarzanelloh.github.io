let time = Date.now();

const printTimeElapsed = (message = '') => {
    const timeElapsed = "" + (Date.now() - time)
    time = Date.now()
    console.log(`Time elapsed since last call: ${timeElapsed}ms ${message ? `(${message})` : ''}`)
}

const config = {
    domain: "coders51.eu.auth0.com",
    clientId: "kAadazt98UyBLW8NrYtvxUIBoIhAKiOG"
}

const attachListeners = () => {
    const loginButton = document.querySelector('[auth0-login]')
    if (loginButton) {
        loginButton.addEventListener('click', () => login())
    }

    const logoutButton = document.querySelector('[auth0-logout]')
    if (logoutButton) {
        logoutButton.addEventListener('click', () => logout())
    }
}

let auth0 = null;
let token = null;
let isAuthenticated = false;
let user = null;
let windowLoaded = false

const login = async () => {
    await auth0.loginWithRedirect({
        redirect_uri: window.location.origin + '/coders51-b'
    })
}

const isLoggedOut = () => {
    const invalidLogoutPaths = [
        '/coders51-b',
    ];

    const currentLocation = window.location.pathname
    return invalidLogoutPaths.indexOf(currentLocation) == -1
}

const logout = (logoutPath = '/coders51-a') => {
    if (!isLoggedOut()) {
        auth0.logout({
            returnTo: window.location.origin + logoutPath
        });
    }
}

const populateAuth0Element = (data, key, domAttribute = 'innerText') => {
    const elements = getElementsByAttributeValue('data-auth0', key)
    elements.map(element => {
        if (element) {
            element[domAttribute] = data[key]
        }
    })
}

const injectAuth0Metadata = (user, domain) => {
    const metadata = user[domain];
    const user_metadata = metadata.user;
    const app_metadata = metadata.app;
    Object.keys(user_metadata).forEach(k => {
        populateAuth0Element(user_metadata, k);
    });
    Object.keys(app_metadata).forEach(k => {
        populateAuth0Element(app_metadata, k);
    });
}

const updateUI = async () => {
    isAuthenticated = await auth0.isAuthenticated();
    try {
        handleElementsVisibility(isAuthenticated);
    } catch (e) {
        console.error("BAU", e)
    }
    if (!isAuthenticated) {
        logout();
    } else {
        const user = await auth0.getUser();
        populateAuth0Element(user, 'picture', 'srcset');
        injectAuth0Metadata(user, 'https://uhubs.co.uk/metadata');
        populateAuth0Element(user, 'name');
        return;
    }
}


const handleElementsVisibility = (isAuthenticated) => {
    if (!windowLoaded) {
        return
    }
    const visibilityAttribute = 'data-ms-content'
    const elements = getElementsByAttribute(visibilityAttribute)
    elements.forEach(el => {
        let attributeVal = el.getAttribute(visibilityAttribute).trim();
        if (!isElementVisible(attributeVal, isAuthenticated)) {
            printTimeElapsed('login button removed')
            el.style.display = "none"
        }
    })
}

const isElementVisible = (attributeVal, isAuthenticated) => {
    if (attributeVal) {
        const isNegation = attributeVal.charAt(0) === "!"
        if (isNegation) {
            attributeVal = attributeVal.substring(1)
        }
        if (isLoggedInCondition(attributeVal)) {
            return isNegation ? !isAuthenticated : isAuthenticated
        }
    }
    return true
}

const isLoggedInCondition = (attributeVal) => {
    const potentialValues = [
        // "members",
        "loggedIn"
    ]
    return potentialValues.includes(attributeVal)
}

const getElementsByAttribute = (attribute) => {
    const nodes = document.body.querySelectorAll(`[${attribute}]`);
    return Array.from(nodes);
}

const getElementsByAttributeValue = (attribute, value) => {
    const nodes = document.body.querySelectorAll(`[${attribute}="${value}"]`);
    return Array.from(nodes);
}

const handleAuth0 = async () => {
    if (auth0) {
        return
    }
    auth0 = new Auth0Client({
        domain: config.domain,
        client_id: config.clientId
    });
    auth0.getTokenSilently().then(t => {
        token = t;
        const query = window.location.search;
        if (query.includes('code=') && query.includes('state=')) {
            // Process the login state
            // Use replaceState to redirect the user away and remove the querystring parameters
            auth0.handleRedirectCallback().then(_ => window.history.replaceState({}, document.title, window.location.pathname));
        }
        updateUI();
        }).catch(e => {
            console.error("Error while retrieving token:", e)
        })
}

const bootstrapIntegration = async () => {
    handleAuth0()
    window.onload = () => {
        windowLoaded = true
        handleElementsVisibility(isAuthenticated);
        attachListeners();
        handleAuth0();
    }
}

bootstrapIntegration()