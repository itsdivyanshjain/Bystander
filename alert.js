const alertJson = {
    "Possible Sink - NoSQL":{ // Tested
        "variables": {
            "keywords": "\\$(filter|where|orderby|top|skip|count|search|format|select|expand|inlinecount|value|eq|ne|gt|lt|ge|le|and|or|not)"
        },
        "check": "keywords.test(requestBody) || keywords.test(requestUrl)",
        "severity": "Medium",
        "detectDuringTesting": false, // default is true
    },
    "Possible Sink - SSTI":{ // Tested
        "variables": {
            "keywords": "\\{\\{|\\$\\{|#\\{|@\\(|<%"
        },
        "check": "keywords.test(requestBody) || keywords.test(requestUrl)",
        "severity": "Medium",
        "detectDuringTesting": false,
    },
    "Possible Sink - LFI in query params": { // Tested
        "variables": {
            "keywords": "(\\?|&)(file|filename|path|dir|folder|log|config|backup|etc|temp|cache|template|include|source|document|root|upload|backup|config|database|storage|configuration|storage|backup|config|database|storage|configuration|storage|backup|config|database|storage|configuration|storage)="
        },
        "check": "keywords.test(requestUrl)",
        "severity": "Medium",
        "detectDuringTesting": true,
    },
    "Possible Sink - SSI (in any input field)":{
        "variables": {
            "keywords": "/Surrogate-Control:\\s+content=\"ESI/1\\.0\"/igm"
        },
        "check": "keywords.test(responseHeaders)",
        "severity": "Medium",
        "detectDuringTesting": true,
    },
    "Possible Insight - Staging Domain": {
        "variables": {
            "keywords": "(?!www\\.)([^.]+\\.)*[^.]+\\.[a-zA-Z]{2,}" // subdomain regex
        },
        "check": "keywords.test(responseBody) && keywords.test(new RegExp('staging|stg|dev|development|pre-?prod', 'igm'))",
        "severity": "Medium",
    },
    "Possible Insight - Admin Dashboard": {
        "variables": {
            "keywords": "(?!www\\.)([^.]+\\.)*[^.]+\\.[a-zA-Z]{2,}"
        },
        "check": "keywords.test(responseBody) && keywords.test(new RegExp('admin|adm|devops', 'igm'))",
        "severity": "Medium",
    },
    // "Possible Detection - ClickJacking" : {
    //     "variables": {
    //         "keywords": "x-frame-options|content-security-policy.*frame-"
    //     },
    //     "alertOncePerHost": true,
    //     "check": "keywords.test(responseHeaders)",
    //     "severity": "Medium",
    //     "include": ["html"]
    // },
    "Possible Detection - Polyfill takeover": {
        "variables": {
            "keywords": "script src=\"?http[s]?://.*(polyfill\\.io|bootcdn\\.net|bootcss\\.com|staticfile\\.net|staticfile\\.org|unionadjs\\.com|xhsbpza\\.com|union\\.macoms\\.la|newcrbpc\\.com).*"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Medium",
        "include": ["html"]
    },
    "Possible Detection - CSRF on email change": {
        "variables": {
            "keywords": "/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gm", // email regex,
            "url_contains": "/change/update/setting/igm",
            "token_not_contains": "/csrf|xsrf|token/igm",
            "password_not_contains": "/pass/"
        },
        "check": "keywords.test(requestBody) && url_contains.test(requestUrl) && !token_not_contains(requestBody) && !password_not_contains(requestBody)",
        "severity": "High",
        "include": ["html"]
    },
    // "PII Leak - Mastercard":{
    //     "variables": {
    //         "keywords": "5[1-5][0-9]{14}"
    //     },
    //     "check": "keywords.test(responseBody)",
    //     "severity": "Medium",
    //     "validator": "luhn"
    // },
    // "PII Leak - Rupaycard":{
    //     "variables": {
    //         "keywords": "6[0-9]{15}"
    //     },
    //     "check": "keywords.test(responseBody)",
    //     "severity": "Medium",
    //     "validator": "luhn"
    // },
    // "PII Leak - Visa Card":{
    //     "variables": {
    //         "keywords": "4[0-9]{15}"
    //     },
    //     "check": "keywords.test(responseBody)",
    //     "severity": "Medium",
    //     "validator": "luhn"
    // },
    // "PII Leak - American Express Card":{
    //     "variables": {
    //         "keywords": "3[47][0-9]{13}"
    //     },
    //     "check": "keywords.test(responseBody)",
    //     "severity": "High",
    //     "validator": "luhn"
    // },
    "PII Leak - PAN Card":{ // Tested
        "variables": {
            "keywords": "[A-Z]{5}[0-9]{4}[A-Z]{1}",
            "body_also_contains":"/pan\\s?(Card|number)/igm"
        },
        "check": "keywords.test(responseBody) && body_also_contains.test(responseBody)",
        "severity": "Medium",
    },
    "Private Key Disclosure - RSA":{
        "variables": {
            "keywords": "-----BEGIN RSA PRIVATE KEY-----"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "Private Key Disclosure - SSH (DSA)":{
        "variables": {
            "keywords": "-----BEGIN DSA PRIVATE KEY-----"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "Private Key Disclosure - PGP":{
        "variables": {
            "keywords": "-----BEGIN PGP PRIVATE KEY-----"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "Private Key Disclosure - SSH (ECDSA)":{
        "variables": {
            "keywords": "-----BEGIN ECDSA PRIVATE KEY-----"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "HASH Disclosure - Lanman / DES":{
        "variables": {
            "keywords": "\\$LM\\$[a-f0-9]{16}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "HASH Disclosure - Kerberos AFS DES":{
        "variables": {
            "keywords": "\\$K4\\$[a-f0-9]{16}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "HASH Disclosure - OPENBSD BLOWFISH":{
        "variables": {
            "keywords": "\\$2[abxy]\\$05\\$[a-zA-z0-9\\+\\-_./=]{53}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "HASH Disclosure - BCRYPT":{
        "variables": {
            "keywords": "\\$2a?\\$[0-9]{2}\\$[./0-9A-Za-z]{53}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "HASH Disclosure - SCRYPT":{
        "variables": {
            "keywords": "\\$2a?\\$[0-9]{2}\\$[./0-9A-Za-z]{53}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "HASH Disclosure - Argon2":{
        "variables": {
            "keywords": "\\$2a?\\$[0-9]{2}\\$[./0-9A-Za-z]{53}" // TODO:
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "HASH Disclosure - Argon2i":{
        "variables": {
            "keywords": "\\$2a?\\$[0-9]{2}\\$[./0-9A-Za-z]{53}" // TODO:
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "HASH Disclosure - NTLM old":{
        "variables": {
            "keywords": "\\$3\\$\\$[0-9a-f]{32}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "HASH Disclosure - NTLM new":{
        "variables": {
            "keywords": "\\$NT\\$[0-9a-f]{32}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High"
    },
    "AI API Key Disclosure - CHATGPT":{ // Tested
        "variables": {
            "keywords": "sk-[0-9a-zA-Z]{48}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "AI API Key Disclosure - Hugging Face":{
        "variables": {
            "keywords": "hf_[0-9a-zA-Z]{34,}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Slack":{
        "variables": {
            "keywords": "(xox[pboa]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32})"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Amazon MWS":{
        "variables": {
            "keywords": "amzn\\.mws\\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - AWS AppSync":{
        "variables": {
            "keywords": "x-amz-date|x-amz-security-token|x-amz-target|x-amz-content-sha256|x-amz-decoded-content-length|x-amz-user-agent|x-amz-user-agent-info|x-amz-user-agent-version|x-amz-user-agent-platform|x-amz-user-agent-device|x-amz-user-agent-browser|x-amz-user-agent-os|x-amz-user-agent-cpu|x-amz-user-agent-memory|x-amz-user-agent-storage|x-amz-user-agent-network|x-amz-user-agent-gpu"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Facebook Access Token":{
        "variables": {
            "keywords": "EAACEdEose0cBA[0-9A-Za-z]+"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Facebook Oauth Token":{
        "variables": {
            "keywords": "[fF][aA][cC][eE][bB][oO][oO][kK].{0,20}['|\"][0-9a-f]{32}['|\"]"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Github":{
        "variables": {
            "keywords": "[gG][iI][tT][hH][uU][bB].{0,20}['|\"][0-9a-zA-Z]{35,40}['|\"]"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Google (GCP) Service Account":{
        "variables": {
            "keywords": "\"type\": \"service_account\""
        },
        "check": "keywords.test(responseBody)",
        "severity": "Medium"
    },
    "API Key Disclosure - Heroku":{
        "variables": {
            "keywords": "[hH][eE][rR][oO][kK][uU].{0,20}[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Mailchimp":{
        "variables": {
            "keywords": "[0-9a-f]{32}-us[0-9]{1,2}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Mailgun":{
        "variables": {
            "keywords": "key-[0-9a-zA-Z]{32}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Paypal Braintree Access Token":{
        "variables": {
            "keywords": "access_token\\$production\\$[0-9a-z]{16}\\$[0-9a-f]{32}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Picatic":{
        "variables": {
            "keywords": "sk_live_[0-9a-z]{32}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Slack webhook":{ // TODO: need to improve this
        "variables": {
            "keywords": "https://hooks\\.slack\\.com/services/T[a-zA-Z0-9_]{8}/B[a-zA-Z0-9_]{8}/[a-zA-Z0-9_]{24}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Stripe":{
        "variables": {
            "keywords": "sk_live_[0-9a-z]{24}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Stripe Restricted":{
        "variables": {
            "keywords": "rk_live_[0-9a-z]{24}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Square Access Token":{
        "variables": {
            "keywords": "sq0atp-[0-9A-Za-z\\-_]{22}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Square OAuth Secret":{
        "variables": {
            "keywords": "sq0csp-[0-9A-Za-z\\-_]{43}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Telegram Bot Token":{
        "variables": {
            "keywords": "T[a-zA-Z0-9_]{8}/B[a-zA-Z0-9_]{8}/[a-zA-Z0-9_]{24}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Twilio":{
        "variables": {
            "keywords": "SK[a-zA-Z0-9_]{32}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - Github Auth Creds":{
        "variables": {
            "keywords": "https:\\/\\/[a-zA-Z0-9]{40}@github\\.com"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    },
    "API Key Disclosure - AWS":{
        "variables": {
            "keywords": "((?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16})"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical"
    }
}

export default alertJson;