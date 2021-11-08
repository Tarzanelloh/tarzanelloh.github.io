let time = Date.now();
// Hi this i fabio
class Auth0EventEmitter extends EventTarget {
    emit(event) {
        this.dispatchEvent(new Event(event))
    }
}
const auth0EventEmitter = new Auth0EventEmitter()

const printTimeElapsed = (message = '') => {
    const timeElapsed = "" + (Date.now() - time)
    console.log(`Time elapsed since page load: ${timeElapsed}ms ${message ? `(${message})` : ''}`)
}

const config = {
    domain: "uhubs-staging.eu.auth0.com",
    client_id: "RLaFcdBuvgXPws43E3iQkjYPCqMeR4Tq",
    cacheLocation: "localstorage",
    audience: "https://api.uhubs.co.uk"
}

const toggleAuth0DependantElements = (show) => {
    const elements = getElementsByAttribute('show-auth0')
    elements.forEach(el => {
        if (show) {
            el.classList.remove("d-none")
        } else {
            el.classList.add("d-none")
        }
    })
}

const attachListeners = () => {
    const loginButtons = document.querySelectorAll('[auth0-login]')
    loginButtons.forEach(lb => {
        lb.addEventListener('click', () => login())
    })

    const logoutButtons = document.querySelectorAll('[auth0-logout]')
    logoutButtons.forEach(lb => {
        lb.addEventListener('click', () => {
            auth0.logout({
                // returnTo: isLoggedOut() ? window.location.href : window.location.origin
                returnTo: window.location.origin
            });
        })
    })

    const navigateToDashboardButtons = document.querySelectorAll('[auth0-dashboard]')
    navigateToDashboardButtons.forEach(nb=> {
        nb.addEventListener('click', () => navigateToDashboard())
    })

    // START STUB
    // this should work as is with the custom attribute "auth0-submit-user-metadata"
   const submitUserMetadataButtons = document.querySelectorAll('[auth0-submit-user-metadata]')
   // submitUserMetadataButtons.forEach(sb => submitUserMetadata())
    submitUserMetadataButtons.forEach(sb => {
        sb.addEventListener('click', () => submitUserMetadata())
    })
    //document.getElementById('auth0-submit-user-metadata').addEventListener('click', () => submitUserMetadata())
    // END STUB
}

const login = async () => {
    await auth0.loginWithRedirect({
        appState: { target: window.location.href},
        redirect_uri: window.location.origin + '/redirecting'
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

const logout = (logoutPath = '/') => {
    if (!isLoggedOut()) {
        auth0.logout({
            returnTo: window.location.origin + logoutPath
        });
    }
}

// START STUB
// this is all semi pseudo code, you'll have to look the actual syntax up at MDN/w3schools/whatever works for you
const submitUserMetadata = () => {
    const firstNameFormValue = document.getElementById("auth0-first-name-form").value
    const lastNameFormValue = document.getElementById("auth0-last-name-form").value
    const jobTitleFormValue = document.getElementById("auth0-job-title-form").value
    const companyValue = document.getElementById("auth0-company-form").value
    // do the same for all forms: lastName, jobTitle, companyName etc.
    // when you have all your data in order, construct a new user metadata object made up of the new values and then merge it with the old metadata
    const newUserMetadata = { 
        first_name: firstNameFormValue, 
        last_name: lastNameFormValue,
        job_title: jobTitleFormValue,
        company: companyValue    
    } // etc. etc.
    // user is a global variable
    const oldUserMetadata = getMetadata(user)["user"]
    // actual syntax for object merge
    const finalUserMetadata = {...oldUserMetadata, ...newUserMetadata }
    // look up docs for auth0-spa-sdk.js in order to get the syntax right, this is a stub at best, I can't remember the actual syntax
    // auth0 is a global variable which holds the auth0 client which has already been initialized
    // the update should be done by PATCH I believe, so maybe we would not even need to merge with the old metadata
    console.log(finalUserMetadata)
    auth0.patchUserMetadata(user["user_id"], finalUserMetadata);
    //auth0.users.update_user_metadata(user["user_id"], finalUserMetadata)
}
// END STUB

// Update user metadata

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
    if (user_metadata) {
        Object.keys(user_metadata).forEach(k => {
            populateAuth0Element(user_metadata, k);
            populateAuth0Element(user_metadata, k, 'value');
        }); 
    }
    if (app_metadata) {
        Object.keys(app_metadata).forEach(k => {
            populateAuth0Element(app_metadata, k);
        });
    }
}

const updateUI = () => {
    const propertyMap = new Map([
        ["members", isAuthenticated],
        ["loggedIn", isAuthenticated],
        ["hasHomepage", hasHomepage(user)]
    ])
    handleElementsVisibility(propertyMap);
    handleElementsVisibility(propertyMap, 'data-auth0-content');
    if (user) {
        if (user['picture']) {
            populateAuth0Element(user, 'picture', 'srcset');
        }
        injectAuth0Metadata(user, 'https://uhubs.co.uk/metadata');
        populateAuth0Element(user, 'name');
        populateAuth0Element(user, 'sub');
        populateAuth0Element(user, 'email');
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
    auth0 = await createAuth0Client(config);
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
        const { appState } = await auth0.handleRedirectCallback();
        if (appState.target && appState.target != window.location.href) {
            window.location.href = appState.target
        }

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    isAuthenticated = await auth0.isAuthenticated();
    if (!isAuthenticated) {
        logout();
    } else {
        user = await auth0.getUser();
        // const newToken = await auth0.getTokenSilenty()
    }
    if (isHomepage() && !isUserHomepage(user)) {
        window.location.href = hasHomepage(user) ? `/home-profile/${getHomepage(user)}` : '/coders51-a' 
    }
    console.log(isAuthenticated, user)
    auth0EventEmitter.emit("ready")
    auth0Init = true;
    triggerDOMManipulation()
}

const isHomepage = () => {
    return window.location.href.includes('/home-profile/')
}

const isUserHomepage = (user) => {
    return window.location.href == `${window.location.protocol}//${window.location.host}/home-profile/${getHomepage(user)}`
}

const getHomepage = (user) => {
    if (!user) {
        return ""
    }
    const metadata = getMetadata(user)
    return metadata && metadata.app && metadata.app.homepage
}

const getMetadata = (u) => {
    return u && u['https://uhubs.co.uk/metadata']
}

const bootstrapIntegration = () => {
    window.onload = () => {
        toggleAuth0DependantElements(false)
        handleAuth0()
        toggleAuth0DependantElements(true)
        domInit = true
        triggerDOMManipulation()
    }
}

bootstrapIntegration()

// Amplitude Event properties code
var standardProperties
function computeStandardProperties() {
    if (user) {
        standardProperties = {
            'auth0_id': user.sub,
            'logged_in': true,
            'page': window.location.href
        }
        const msUuid = getMetadata(user)['app']['memberstack_id']
        if (msUuid) {
            standardProperties = Object.assign(standardProperties, { 'memberstack_id': msUuid})
        }
    } else {
        standardProperties = {
            'logged_in': false,
            'page': window.location.href
        }
    }
    return standardProperties
}

let auth0Ready = false
auth0EventEmitter.addEventListener("ready", () => {
    auth0Ready = true
})

window.getEventProperties = (properties) => {
    return new Promise((res, rej) => {
        const interval = setInterval(() => {
            if (auth0Ready) {
                window.clearInterval(interval)
                res(computeStandardProperties())
            }
        }, 200)
    })
}
