const testcases = [
    {
        "id": 1,
        "testcaseName": "Insight, PII, Hash, AI API Key, API Key Disclosure in Response Body",
        "http":{
            "url": "https://api.example.com/v1/users",
            "method": "GET",
            "requestHeaders": `
                "Authorization": "Bearer 1234567890"
            `,
            "requestBody": "hello",
            "responseHeaders": `
                "Content-Type": "application/json"
            `,
            "responseBody": `
                <body>
                    <p>https://staging.example.com</p> // Insight - Staging Domain
                    <p>https://admin.example.com</p> // Insight - Admin Domain
                    <p>fd7b6de4-e8a5-11ef-9cd2-0242ac120002</p> // Insight - UUIDv1 still in use
                    <script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script> // Possible Detection - Script Served From Malicious Domain (polyfill)
                    <p>PANCARD: MLMPA1836G</p> // PII Disclosure - PANCARD
                    <p>RSA: -----BEGIN RSA PRIVATE KEY----- </p>
                    <p>DSA: -----BEGIN DSA PRIVATE KEY----- </p>
                    <p>PGP: -----BEGIN PGP PRIVATE KEY----- </p>
                    <p>ECDSA: -----BEGIN ECDSA PRIVATE KEY----- </p>
                    <p>HASH: $LM$1234567890123456</p> // HASH Disclosure - Lanman / DES
                    <p>HASH: $K4$1234567890123456</p> // HASH Disclosure - Kerberos AFS DES
                    <p>HASH: $2x$05$12345678901234567890123456789012345678901234567890123</p> // HASH Disclosure - OPENBSD BLOWFISH
                    <p>HASH: $2a$09$12345678901234567890123456789012345678901234567890123</p>// HASH Disclosure - Bcrypt & Scrypt
                    <p>HASH: $argon2i$v=19$m=16,t=2,p=1$c2Fkc2FkZHNhZA$/l4SDWxIJlcX6K1uAqJfTQ</p> // HASH Disclosure - Argon2i
                    <p>HASH: $argon2id$v=19$m=16,t=2,p=1$c2Fkc2FkZHNhZA$mGgHSjxUg5MCNKO85IdCcQ</p> // HASH Disclosure - Argon2id
                    // HASH Disclosure - NTLM old
                    <p>HASH: $NT$1234567890</p> // HASH Disclosure - NTLM new
                    <p>CHATGPT: sk-Tw7cG5c7bpOU4RjhzbhPP3BlbkFJAvbQkzFko7QwkMbx9UKk</p> // AI API Key Disclosure - CHATGPT
                    <p>HuggingFace: hf_0123456789012345678901234567890123</p>// AI API Key Disclosure - Hugging Face
                    // AI API Key Disclosure - Groq (TODO)
                    // AI API Key Disclosure - Anthropic (TODO)
                    // AI API Key Disclosure - OpenAI (TODO)
                    // AI API Key Disclosure - Google (TODO)
                    <p>xoxp-0123456789-0123456789-0123456789-abcdefgh// API Key Disclosure - Slack
                    // API Key Disclosure - Amazon MWS
                    // API Key Disclosure - AWS AppSync
                    // API Key Disclosure - Facebook Access Token
                    // API Key Disclosure - Facebook Oauth Token
                    <p>ghp_abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz// API Key Disclosure - Github
                    <p> heroku - abcdefab-abcd-efgh-ijkl-123456789012</p>// API Key Disclosure - Heroku
                    <p> Mailchimp - abcdef123456abcdef123456abcdef12-us12</p>// API Key Disclosure - Mailchimp
                    <p> Mailgun key - key-abcdef123456abcdef123456abcdef12</p>// API Key Disclosure - Mailgun
                    // API Key Disclosure - Paypal Braintree Access Token
                    // API Key Disclosure - Picatic
                    <p> Slack Service: https://hooks.slack.com/services/TABCDEFGHI/BACBDEFG/abcdefghijklmnopqrstuvwx</p> // API Key Disclosure - Slack Serivce webhook
                    <p> Slack Workflow: https://hooks.slack.com/workflows/TABCDEFGHI/AACBDEFG/0123456789012345678/abcdefghijklmnopqrstuvwx</p> // API Key Disclosure - Slack workflow webhook
                    <p> stripe: sk_live_abcdefghijklmnopqrstuvwxyz</p> // API Key Disclosure - Stripe
                    // API Key Disclosure - Stripe Restricted
                    // API Key Disclosure - Square Access Token
                    // API Key Disclosure - Square OAuth Secret
                    <p> telegram: 0123456789:abcdefghijklmnopqrstuvwxyz123456789</p> // API Key Disclosure - Telegram Bot Token
                    <p> twilio: SKabcdefghijklmnopqrstuvwxyz123456// API Key Disclosure - Twilio
                    // API Key Disclosure - Github Auth Creds
                    <p> AWS: ASIA1234567890ABCDEF// API Key Disclosure - AWS
                    // API Key Disclosure - Discord webhook (TODO)
                    // API Key Disclosure - GCP (TODO)
                    // API Key Disclosure - Azure (TODO)
                    // API Key Disclosure - DigitalOcean (TODO)
                </body>
            `
        },
        "assert": [
            "Insight - Staging Domain",
            "Insight - Admin Domain",
            "Insight - UUIDv1 still in use",
            "Possible Detection - Script Served From Malicious Domain (polyfill)",
            "PII Leak - PAN Card",
            "Private Key Disclosure - RSA",
            "Private Key Disclosure - SSH (DSA)",
            "Private Key Disclosure - PGP",
            "Private Key Disclosure - SSH (ECDSA)",
            "HASH Disclosure - Lanman / DES",
            "HASH Disclosure - Kerberos AFS DES",
            "HASH Disclosure - OPENBSD BLOWFISH",
            "HASH Disclosure - BCRYPT",
            "HASH Disclosure - SCRYPT",
            "HASH Disclosure - Argon2i",
            "HASH Disclosure - Argon2id",
            "HASH Disclosure - NTLM new",
            "HASH Disclosure - NTLM old",
            "AI API Key Disclosure - CHATGPT",
            "AI API Key Disclosure - Hugging Face",
            "API Key Disclosure - Slack",
            // "API Key Disclosure - Amazon MWS",
            // "API Key Disclosure - AWS AppSync",
            // "API Key Disclosure - Facebook Access Token",
            // "API Key Disclosure - Facebook Oauth Token",
            "API Key Disclosure - Github",
            "API Key Disclosure - Heroku",
            "API Key Disclosure - Mailchimp",
            "API Key Disclosure - Mailgun",
            //"API Key Disclosure - Paypal Braintree Access Token",
            // "API Key Disclosure - Picatic",
            "API Key Disclosure - Slack Service Webhook",
            "API Key Disclosure - Slack Workflow Webhook",
            "API Key Disclosure - Stripe",
            "API Key Disclosure - Telegram Bot Token",
            "API Key Disclosure - Twilio",
            //"API Key Disclosure - Github Auth Creds",
            "API Key Disclosure - AWS",
        ]
    },
    {
        "id": 2,
        "testcaseName": "Potential Sink, detection & insights in Request Url or header or response body",
        "http":{
            "url": "https://admin.example.com/v1/oauth/users?pretty=$filter&name={{7*7}}&file=helloworld&uuid=fd7b6de4-e8a5-11ef-9cd2-0242ac120002&response_type=token&redirect_uri=https://google.com",
            "method": "GET",
            "requestHeaders": `
                "Authorization": "Bearer 1234567890"
                "Surrogate-Control": "content=\"ESI/1.0"
            `,
            "requestBody": "",
            "responseHeaders": `
                "Content-Type": "application/json"
            `,
            "responseBody": `
                <html>
                    <head>
                        <meta http-equiv="refresh" content="0; url=https://google.com">
                        <title>hello</title>
                    </head>
                    <body>
                        <p>hello</p>
                        <p>https://staging.example.com</p> // Insight - Staging Domain
                    </body>
                </html>
            `
        },
        "assert": [
            "Possible Sink - NoSQL",
            "Possible Sink - SSTI",
            "Possible Sink - LFI in query params",
            "Possible Sink - SSI (in any input field)",
            "Possible Sink - Client Side Redirection (meta tag)",
            "Insight - Staging Domain",
            "Insight - UUIDv1 still in use",
            "Possible Detection - Oauth Implicit Flow being Utilised",
        ],
        "notassert": [
            "Insight - Admin Domain" // not assert not going to executed
        ]
    },
    {
        "id": 3,
        "testcaseName": "Potential Sink & Insight in Request body",
        "http":{
            "url": "https://stg.example.com/oauth/v1/users",
            "method": "POST",
            "requestHeaders": `
                "Authorization": "Bearer 1234567890"
            `,
            "requestBody": "pretty=$filter&name={{7*7}}&file=helloworld&uuid=fd7b6de4-e8a5-11ef-9cd2-0242ac120002",
            "responseHeaders": `
                "Content-Type": "application/json"
            `,
            "responseBody": `
                <html>
                    <head>
                        <title>hello</title>
                    </head>
                    <body>
                        <p>hello</p>
                        <p>https://admin.example.com</p> // Insight - Admin Domain
                    </body>
                </html>
            `
        },
        "assert": [
            "Possible Sink - NoSQL",
            "Possible Sink - SSTI",
            "Possible Sink - LFI in query params",
            "Insight - Admin Domain",
            "Insight - UUIDv1 still in use",
        ],
        "notassert": [
            "Insight - Staging Domain" // not assert not going to executed
        ]
    },
    {
        "id": 4,
        "testcaseName": "Potential Detection - CSRF",
        "http":{
            "url": "https://stg.example.com/v1/oauth/users/settings?redirect_uri=https://google.com&response_type=code&client_id=1234567890",
            "method": "POST",
            "requestHeaders": `
                "Authorization": "Bearer 1234567890"
            `,
            "requestBody": "email=test@example.com",
            "responseHeaders": `
                "Content-Type": "application/json"
            `,
            "responseBody": `
                <html>
                    <p>test@example.com</p>
                </html>
            `
        },
        "assert": [
            "Possible Detection - CSRF on email change",
            "Possible Detection - Oauth CSRF (state param missing)",
        ]
    },
]

export default testcases;