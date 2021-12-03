const authenticateParagon = () => {
    auth0.getIdTokenClaims().then(async (claims) => {
        await paragon.authenticate("bf511600-aa1b-40c5-b051-d5cd917defa1", claims.__raw)
    }).then(() => {
        paragon.connect("salesforce")
    })
}

const attachListenerToButton = (buttonId, cb) => {
    const button = document.getElementById(buttonId)
    if (button) {
        button.addEventListener('click', () => cb())
        return true
    } else {
        console.warn("No element found with id", buttonId)
        return false
    }
}

const onIntegrationPageNavigation = () => {
    setTimeout(() => {
        attachListenerToButton("integration-button", initIntegration)
    }, 500)
}

const initIntegration = () => {
    authenticateParagon()
}


const attachInterval = setInterval(() => {
    const success = attachListenerToButton("integration-side-button", onIntegrationPageNavigation)
    if (success) {
        clearInterval(attachInterval)
    }
}, 1500)


