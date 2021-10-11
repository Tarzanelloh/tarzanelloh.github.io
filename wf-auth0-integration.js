let time = Date.now();

const printTimeElapsed = (message = '') => {
    const timeElapsed = "" + (Date.now() - time)
    console.log(`Time elapsed since page load: ${timeElapsed}ms ${message ? `(${message})` : ''}`)
}

// printTimeElapsed()

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

    const navigateToDashboardButton = document.querySelector('[auth0-dashboard]')
    if (navigateToDashboardButton) {
        navigateToDashboardButton.addEventListener('click', () => navigateToDashboard())
    }
}

const login = async () => {
    await auth0.loginWithRedirect({
        redirect_uri: window.location.origin + '/coders51-b'
    })
}

const isLoggedOut = () => {
    const invalidLogoutPaths = [
        '/coders51-b',
        '/home-profile'
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

const hasHomepage = (user) => {
    return !!getHomepage(user)
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

const updateUI = () => {
    const propertyMap = new Map([
        // ["members", isAuthenticated],
        ["loggedIn", isAuthenticated],
        ["hasHomepage", hasHomepage(user)]
    ])
    handleElementsVisibility(propertyMap);
    handleElementsVisibility(propertyMap, 'data-auth0-content');
    if (user) {
        populateAuth0Element(user, 'picture', 'srcset');
        injectAuth0Metadata(user, 'https://uhubs.co.uk/metadata');
        populateAuth0Element(user, 'name');
    }
    return;
}

const getElementsByAttribute = (attribute) => {
    const nodes = document.body.querySelectorAll(`[${attribute}]`);
    return Array.from(nodes);
}

const getElementsByAttributeValue = (attribute, value) => {
    const nodes = document.body.querySelectorAll(`[${attribute}="${value}"]`);
    return Array.from(nodes);
}

const handleElementsVisibility = (propertyMap, visibilityAttribute = 'data-ms-content') => {
    const elements = getElementsByAttribute(visibilityAttribute)
    elements.forEach(el => {
        let attributeVal = el.getAttribute(visibilityAttribute).trim();
        if (!isElementVisible(attributeVal, propertyMap)) {
            el.classList.add("d-none")
        } else {
            el.classList.remove("d-none")
            printTimeElapsed(`removed ${el.id}`)
        }
    })
}

const isElementVisible = (attributeVal, propertyMap) => {
    if (attributeVal) {
        const isNegation = attributeVal.charAt(0) === "!"
        if (isNegation) {
            attributeVal = attributeVal.substring(1)
        }
        if (propertyMap.has(attributeVal)) {
            const propValue = propertyMap.get(attributeVal)
            return !isNegation != !propValue
        }
    }
    return true
}

let auth0Init = false;
let domInit = false;
let domManipulated = false;
let auth0 = null;
let token = null;
let user = null;
let isAuthenticated = null;


const navigateToDashboard = () => {
    window.location.href = `home-profile/${getHomepage(user)}`
}


const configureClient = async () => {
    printTimeElapsed('configure client')
    auth0 = await createAuth0Client({
        domain: config.domain,
        client_id: config.clientId
    });
    printTimeElapsed('configure client end')
}

triggerDOMManipulation = () => {
    if (auth0Init && domInit && !domManipulated) {
        attachListeners()
        updateUI();
        domManipulated = true;
    }
}

const handleAuth0 = async () => {
    if (auth0) {
        return
    }
    await configureClient();

    // check for the code and state parameters
    const query = window.location.search;
    if (query.includes('code=') && query.includes('state=')) {

        // Process the login state
        await auth0.handleRedirectCallback();

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    isAuthenticated = await auth0.isAuthenticated();
    if (!isAuthenticated) {
        logout();
    } else {
        user = await auth0.getUser();
        if (isHomepage() && !isUserHomepage()) {
            window.location.href = hasHomepage(user) ? `home-profile/${user.app_metadata.homepage}` : '/coders51-a' 
        }
    }
    auth0Init = true;
    triggerDOMManipulation()
}

const isHomepage = () => {
    return window.location.includes('/home-profile/')
}

const isUserHomepage = (user) => {
    return window.location === `/home-profile/${user.app_metadata.homepage}`
}

const getHomepage = (user) => {
    if (!user) {
        return ""
    }
    const metadata = user && user['https://uhubs.co.uk/metadata']
    return  metadata && metadata.app_metadata && metadata.app_metadata.homepage
}

const bootstrapIntegration = () => {
    handleAuth0()
    window.onload = () => {
        domInit = true
        triggerDOMManipulation()
    }
}

bootstrapIntegration()