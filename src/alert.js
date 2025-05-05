const alertJson = {
    "Possible Sink - NoSQL":{
        "variables": {
            "keywords": "\\$(filter|where|orderby|top|skip|count|search|format|select|expand|inlinecount|value|eq|ne|gt|lt|ge|le|and|or|not)\\b"
        },
        "check": "keywords.test(requestBody) || keywords.test(requestUrl)",
        "severity": "Medium",
        "detectDuringTesting": false, // default is true
        "include": ["html", "json"]
    },
    "Possible Sink - SSTI":{
        "variables": {
            "keywords": "\\{\\{|\\$\\{|#\\{|@\\(|<%"
        },
        "check": "keywords.test(requestBody) || keywords.test(requestUrl)",
        "severity": "Medium",
        "detectDuringTesting": false,
        "include": ["html", "json"]
    },
    "Possible Sink - LFI in query params": {
        "variables": {
            "keywords": "(\\?|&)(file|filename|path|dir|folder|log|config|backup|temp|cache|template|include|source|document|root|upload)="
        },
        "check": "keywords.test(requestUrl)",
        "severity": "Medium",
        "detectDuringTesting": true,
        "include": ["html", "json"]
    },
    "Possible Sink - SSI (in any input field)":{
        "variables": {
            "keywords": "/Surrogate-Control:\\s+content=\"ESI\\/1\\.0/gim"
        },
        "check": "keywords.test(responseHeaders)",
        "severity": "Medium",
        "detectDuringTesting": true,
        "include": ["html", "json"]
    },
    "Possible Sink - Client Side Redirection (meta tag)": { // could be utilised for csrf (samsite attribute doesn't affect here) when reflected url is found 
        "variables": {
            "keywords": "/<meta http-equiv=.*refresh.*content=.*?>/igm"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Medium",
        "include": ["html"]
    },
    // "Possible Sink - Client Side Path Traversal":{
    //     "variables": {
    //         "keywords": "/\\.\\.\\//igm"
    //     },
    //     "check": "keywords.test(requestUrl)",
    //     "severity": "Medium",
    // },
    "Insight - Staging Domain": {
        "variables": {
            "keywords": "/\\b(\\w+-?development|stg|staging|gitlab)((?!-)[A-Za-z0-9-]{0,63}(?<!-)\\.){2,}[A-Za-z]{2,6}\\b/igm" // subdomain regex
        },
        "check": "keywords.test(responseBody) && !keywords.test(requestUrl)",
        "severity": "Medium",
        "include": ["html","js"]
    },
    "Insight - Admin Domain": {
        "variables": {
            "keywords": "/\\b(\\w+-?admin|devops)((?!-)[A-Za-z0-9-]{0,63}(?<!-)\\.){2,}[A-Za-z]{2,6}\\b/igm" // subdomain regex
        },
        "check": "keywords.test(responseBody) && !keywords.test(requestUrl)",
        "severity": "Medium",
        "include": ["html","js"]
    },
    "Insight - UUIDv1 still in use": {
        "variables": {
            "keywords": "/[0-9a-f]{8}-[0-9a-f]{4}-11e[0-9a-f]{1}-[0-9a-f]{4}-[0-9a-f]{12}/igm"
        },
        "check": "keywords.test(requestUrl) || keywords.test(requestBody) || keywords.test(responseBody)",
        "severity": "Medium",
        "include": ["html","json"]
    },
    // "Insight - Possible response manipulation": {},
    "Possible Detection - ClickJacking" : {
        "variables": {
            "keywords": "/x-frame-options|content-security-policy.*frame-ancestors/igm"
        },
        "alertOncePerHost": true,
        "check": "!keywords.test(responseHeaders)",
        "severity": "Medium",
        "include": ["html"]
    },
    "Possible Detection - Script Served From Malicious Domain (polyfill)": {
        "variables": {
            "keywords": "script src=\"?http[s]?:\\/\\/.*(polyfill\\.io|bootcdn\\.net|bootcss\\.com|staticfile\\.net|staticfile\\.org|unionadjs\\.com|xhsbpza\\.com|union\\.macoms\\.la|newcrbpc\\.com).*"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Medium",
        "include": ["html"]
    },
    "Possible Detection - CSRF on email change": {
        "variables": {
            "keywords": "/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gm", // email regex,
            "url_contains": "/change|update|setting/igm",
            "token_not_contains": "/csrf|xsrf|token/igm",
            "password_not_contains": "/pass/"
        },
        "check": "keywords.test(requestBody) && url_contains.test(requestUrl) && !token_not_contains.test(requestBody) && !password_not_contains.test(requestBody)",
        "severity": "High",
        "include": ["html"]
    },
    "Possible Detection - Oauth CSRF (state param missing)": {
        "variables": {
            "keywords": "/state=/igm",
            "url_contains": "/oauth|authorize/igm",
            "oauth_redirect_uri": "/redirect_uri=/igm",
            "oauth_response_type": "/response_type=code/igm",
            "oauth_client_id": "/client_id=/igm",
        },
        "check": "url_contains.test(requestUrl) && oauth_redirect_uri.test(requestUrl) && oauth_response_type.test(requestUrl) && oauth_client_id.test(requestUrl) && !keywords.test(requestUrl)",
        "severity": "Low",
        "include": ["html"]
    },
    "Possible Detection - Oauth Implicit Flow being Utilised": {
        "variables": {
            "keywords": "/response_type=(token|access_?-?token)/igm",
            "url_contains": "oauth|authorize",
            "oauth_redirect_uri": "redirect_uri=",
        },
        "check": "url_contains.test(requestUrl) && oauth_redirect_uri.test(requestUrl) && keywords.test(requestUrl)",
        "severity": "High",
        "include": ["html"]
    },
    "Possible Detection - Oauth CSRF (state param missing)": {
        "variables": {
            "keywords": "/state=/igm",
            "url_contains": "/oauth|authorize/igm",
            "oauth_redirect_uri": "/redirect_uri=/igm",
            "oauth_response_type": "/response_type=code/igm",
            "oauth_client_id": "/client_id=/igm",
        },
        "check": "url_contains.test(requestUrl) && oauth_redirect_uri.test(requestUrl) && oauth_response_type.test(requestUrl) && oauth_client_id.test(requestUrl) && !keywords.test(requestUrl)",
        "severity": "Low",
        "include": ["html"]
    },
    "Possible Detection - Oauth Implicit Flow being Utilised": {
        "variables": {
            "keywords": "/response_type=(token|access_?-?token)/igm",
            "url_contains": "oauth|authorize",
            "oauth_redirect_uri": "redirect_uri=",
        },
        "check": "url_contains.test(requestUrl) && oauth_redirect_uri.test(requestUrl) && oauth_response_type.test(requestUrl) && !keywords.test(requestUrl)",
        "severity": "High",
        "include": ["html"]
    },
    // "Possible Detection - Open Redirect (DOM based)": {
    //     "variables": {
    //         "keywords": "window\\.location\\.href"
    //     },
    //     "check": "keywords.test(responseBody)",
    //     "severity": "High",
    //     "include": ["html"]
    // },
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
        "severity": "High",
        "include": ["html", "json"]
    },
    "Private Key Disclosure - SSH (DSA)":{
        "variables": {
            "keywords": "-----BEGIN DSA PRIVATE KEY-----"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High",
        "include": ["html", "json"]
    },
    "Private Key Disclosure - PGP":{
        "variables": {
            "keywords": "-----BEGIN PGP PRIVATE KEY-----"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High",
        "include": ["html", "json"]
    },
    "Private Key Disclosure - SSH (ECDSA)":{
        "variables": {
            "keywords": "-----BEGIN ECDSA PRIVATE KEY-----"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High",
        "include": ["html", "json"]
    },
    "HASH Disclosure - Lanman / DES":{
        "variables": {
            "keywords": "\\$LM\\$[a-f0-9]{16}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High",
        "include": ["html", "json"]
    },
    "HASH Disclosure - Kerberos AFS DES":{
        "variables": {
            "keywords": "\\$K4\\$[a-f0-9]{16}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High",
        "include": ["html", "json"]
    },
    "HASH Disclosure - OPENBSD BLOWFISH":{
        "variables": {
            "keywords": "\\$2[abxy]\\$05\\$[a-zA-z0-9\\+\\-_./=]{53}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High",
        "include": ["html", "json"]
    },
    "HASH Disclosure - BCRYPT":{
        "variables": {
            "keywords": "\\$2a?\\$[0-9]{2}\\$[./0-9A-Za-z]{53}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High",
        "include": ["html", "json"]
    },
    "HASH Disclosure - SCRYPT":{
        "variables": {
            "keywords": "\\$2a?\\$[0-9]{2}\\$[./0-9A-Za-z]{53}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "High",
        "include": ["html", "json"]
    },
    // "HASH Disclosure - Argon2":{
    //     "variables": {
    //         "keywords": "\\$2a?\\$[0-9]{2}\\$[./0-9A-Za-z]{53}" // TODO:
    //     },
    //     "check": "keywords.test(responseBody)",
    //     "severity": "High"
    // },
    "HASH Disclosure - Argon2i":{
        "variables": {
            "keywords": "^\\$argon2i\\$v=(?:16|19)\\$m=\\d{1,10},t=\\d{1,10},p=\\d{1,3}(?:,keyid=[A-Za-z0-9+/]{0,11}(?:,data=[A-Za-z0-9+/]{0,43})?)?\\$[A-Za-z0-9+/]{11,64}\\$[A-Za-z0-9+/]{16,86}$" // TODO: not working
        },
        "check": "keywords.test(responseBody)",
        "severity": "High",
        "include": ["html", "json"]
    },
    "HASH Disclosure - Argon2id":{
        "variables": {
            "keywords": "^\\$argon2id\\$v=(?:16|19)\\$m=\\d{1,10},t=\\d{1,10},p=\\d{1,3}(?:,keyid=[A-Za-z0-9+/]{0,11}(?:,data=[A-Za-z0-9+/]{0,43})?)?\\$[A-Za-z0-9+/]{11,64}\\$[A-Za-z0-9+/]{16,86}$" // TODO: not working  
        },
        "check": "keywords.test(responseBody)",
        "severity": "High",
        "include": ["html", "json"]
    },
    "HASH Disclosure - NTLM old":{
        "variables": {
            "keywords": "\\$3\\$\\$[0-9a-f]{32}" // TODO: not sure about validity of regex
        },
        "check": "keywords.test(responseBody)",
        "severity": "High",
        "include": ["html", "json"]
    },
    "HASH Disclosure - NTLM new":{
        "variables": {
            "keywords": "\\$NT\\$[0-9a-f]{32}" // TODO: not sure about validity of regex
        },
        "check": "keywords.test(responseBody)",
        "severity": "High",
        "include": ["html", "json"]
    },
    "AI API Key Disclosure - CHATGPT":{ // Tested
        "variables": {
            "keywords": "\\bsk-[0-9a-zA-Z]{48}\\b"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html","js"]
    },
    "AI API Key Disclosure - Hugging Face":{
        "variables": {
            "keywords": "\\bhf_[0-9a-zA-Z]{34,}\\b"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },

    "API Key Disclosure - Slack":{
        "variables": {
            "keywords": "\\b(xox[pbar]-[0-9]{10,13}-[0-9]{10,13}-[0-9]{10,13}-[a-z0-9]+)\\b"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    // "API Key Disclosure - Amazon MWS":{
    //     "variables": {
    //         "keywords": "\\bamzn\\.mws\\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\b"
    //     },
    //     "check": "keywords.test(responseBody)",
    //     "severity": "Critical",
    //     "include": ["html", "js"]
    // },
    // "API Key Disclosure - AWS AppSync":{
    //     "variables": {
    //         "keywords": "x-amz-date|x-amz-security-token|x-amz-target|x-amz-content-sha256|x-amz-decoded-content-length|x-amz-user-agent|x-amz-user-agent-info|x-amz-user-agent-version|x-amz-user-agent-platform|x-amz-user-agent-device|x-amz-user-agent-browser|x-amz-user-agent-os|x-amz-user-agent-cpu|x-amz-user-agent-memory|x-amz-user-agent-storage|x-amz-user-agent-network|x-amz-user-agent-gpu"
    //     },
    //     "check": "keywords.test(responseBody)",
    //     "severity": "Critical",
    //     "include": ["html", "js"]
    // },
    "API Key Disclosure - Facebook Access Token":{
        "variables": {
            "keywords": "\\bEAACEdEose0cBA[0-9A-Za-z]+\\b" // TODO: not sure about validity of regex
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    "API Key Disclosure - Facebook Oauth Token":{
        "variables": {
            "keywords": "\\b[fF][aA][cC][eE][bB][oO][oO][kK].{0,20}['|\"][0-9a-f]{32}['|\"]\\b" // TODO: not sure about validity of regex
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    "API Key Disclosure - Github":{
        "variables": {
            "keywords": "\\b((?:ghp|gho|ghu|ghs|ghr|github_pat)_[a-zA-Z0-9_]{36,255})\\b"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    // "API Key Disclosure - Google (GCP) Service Account":{
    //     "variables": {
    //         "keywords": "\"type\": \"service_account\""
    //     },
    //     "check": "keywords.test(responseBody)",
    //     "severity": "Medium",
    //     "include": ["js"]
    // },
    "API Key Disclosure - Heroku":{
        "variables": {
            "keywords": "\\b([0-9Aa-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\\b"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    "API Key Disclosure - Mailchimp":{
        "variables": {
            "keywords": "\\b[0-9a-f]{32}-us[0-9]{1,2}\\b"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    "API Key Disclosure - Mailgun":{
        "variables": {
            "keywords": "\\bkey-[0-9a-zA-Z]{32}\\b"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    "API Key Disclosure - Braintree Token":{ 
        "variables": {
            "keywords": "\\baccess_token\\$production\\$[0-9a-z]{16}\\$[0-9a-f]{32}\\b" // TODO: require strong regex
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    // "API Key Disclosure - Picatic":{
    //     "variables": {
    //         "keywords": "\\bsk_live_[0-9a-z]{32}\\b"
    //     },
    //     "check": "keywords.test(responseBody)",
    //     "severity": "Critical",
    //     "include": ["html", "js"]
    // },
    "API Key Disclosure - Slack Service Webhook":{ 
        "variables": {
            "keywords": "https:\\/\\/hooks\\.slack\\.com\\/services\\/T[a-zA-Z0-9]+\\/B[a-zA-Z0-9]+\\/[a-zA-Z0-9_]{23,25}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    "API Key Disclosure - Slack Workflow Webhook":{
        "variables": {
            "keywords": "https:\\/\\/hooks\\.slack\\.com\\/workflows\\/T[A-Z0-9]+\\/A[A-Z0-9]+\\/[0-9]{17,19}\\/[A-Za-z0-9]{23,25}"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    "API Key Disclosure - Stripe":{
        "variables": {
            "keywords": "\\b[rs]k_live_[0-9a-zA-Z]{20,247}\\b"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    "API Key Disclosure - Telegram Bot Token":{
        "variables": {
            "keywords": "\\b([0-9]{8,10}:[a-zA-Z0-9_-]{35})\\b"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    "API Key Disclosure - Twilio":{
        "variables": {
            "keywords": "\\b(SK[a-zA-Z0-9_]{32})|(AC[0-9a-f]{32})\\b"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    // "API Key Disclosure - Github Auth Creds":{
    //     "variables": {
    //         "keywords": "https:\\/\\/[a-zA-Z0-9]{40}@github\\.com"
    //     },
    //     "check": "keywords.test(responseBody)",
    //     "severity": "Critical",
    //     "include": ["html", "js"]
    // },
    "API Key Disclosure - AWS":{
        "variables": {
            "keywords": "\\b((?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16})\\b"
        },
        "check": "keywords.test(responseBody)",
        "severity": "Critical",
        "include": ["html", "js"]
    },
    // "Other Leak - S3 Bucket Url":{
    //     "variables": {
    //         "keywords": "/((s3:\\[a-zA-Z0-9-\.\\_]+)|((s3-|s3\.)?(.*)\.amazonaws\.com))/g",
    //         "skip_if_header_contains": "/image/png|image/jpeg|image/gif|image/webp|application/pdf|application/x-shockwave-flash/igm"
    //     },
    //     "check": "keywords.test(responseBody) && !skip_if_header_contains.test(responseHeaders)",
    //     "severity": "Critical"
    // }
}

export default alertJson;