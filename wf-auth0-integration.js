let time = Date.now()

const printTimeElapsed = (message = '') => {
    const timeElapsed = "" + (Date.now() - time)
    time = Date.now()
    console.log(`Time elapsed since last call: ${timeElapsed}ms ${message ? `(${message})` : ''}`)
}

printTimeElapsed()

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
const configureClient = async () => {
    attachListeners();
    auth0 = await createAuth0Client({
        domain: config.domain,
        client_id: config.clientId
    });
}

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
    printTimeElapsed('start updateUI')
    const isAuthenticated = await auth0.isAuthenticated();
    // const isAuthenticated = true
    console.log({ isAuthenticated })
    if (!isAuthenticated) {
        logout();
    } else {
        //use full if you need to make requests using an auth0 token
        const token = await auth0.getTokenSilently();
        // const token = "Jl-jWylwZIGC6vZVwryLWKeLWtWFEHyT"

        const user = await auth0.getUser();
        printTimeElapsed('got auth0 data')
        // const user = {
        //     email: "lmenghini@coders51.com",
        //     email_verified: true,
        //     'https://coders51.com/roles': ['admin'],
        //     'https://uhubs.co.uk/metadata': {
        //         user: {
        //             'Member-page': "https://www.coders51.com/",
        //             'Signup Date': "September 5, 2021",
        //             company: "coders51",
        //             'first-name': "Luca",
        //             'job-title': "Human Machine Interface",
        //             'last-name': "Menghini",
        //             location: "Rovereto",
        //             mood: "adequate",
        //             performance: "Mostly adequate",
        //         },
        //         app: {
        //             role: 'Team member',
        //             'ms-uuid': "I'm just a simple Memberstack uuid"
        //         }
        //     },
        //     name: "lmenghini@coders51.com",
        //     nickname: "lmenghini",
        //     picture: "https://s.gravatar.com/avatar/b41daebfece6d659b089aa69c65ac7a5?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Flm.png",
        //     sub: "auth0|610cfc205ea8ba00697f977e",
        //     updated_at: "2021-09-27T16:49:40.854Z",
        // }
        console.log({ user, token });
        handleElementsVisibility(isAuthenticated);
        printTimeElapsed('after handleElementsVisibility')
        populateAuth0Element(user, 'picture', 'srcset');
        injectAuth0Metadata(user, 'https://uhubs.co.uk/metadata');
        populateAuth0Element(user, 'name');
        return;
    }
}


const handleElementsVisibility = (isAuthenticated) => {
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
    printTimeElapsed('postonload')
    console.log("Creating Auth0 client")
    await configureClient();
    console.log("Auth0 client successfully created")

    // check for the code and state parameters
    const query = window.location.search;
    if (query.includes('code=') && query.includes('state=')) {

        // Process the login state
        await auth0.handleRedirectCallback();

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    updateUI();
}

printTimeElapsed('preonload')
// window.onload = handleAuth0
// handleAuth0()
try {
    handleAuth0()
} catch (e) {
    console.log('documentonload')
    document.onload = handleAuth0
}
