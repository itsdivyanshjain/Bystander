# Contributing to Bystander

## How to contribute
- You can add your own rules to detect other passive vulnerabilities, insights, pii leakage, etc. Just require to edit in `src/alert.js` file.
- You can also help in improving the current rules by validating the regex and reported alerts.
- You can also submit False Positive alerts as an issue, so that we can improve the rule.

## Adding your own rules
- For adding your own rules, you open `src/alert.js` file.
- You will find an object like below:
```js
const alertJson = {
    "Possible Sink - NoSQL":{
        "variables": {
            "keywords": "\\$(filter|where|orderby|top|skip|count|search|format|select|expand|inlinecount|value|eq|ne|gt|lt|ge|le|and|or|not)"
        },
        "check": "keywords.test(requestBody) || keywords.test(requestUrl)",
        "severity": "Medium",
        "detectDuringTesting": false, // default is true
        "include": ["html", "json"]
    },
    // add your own rule here (add rules to end of categories)
    "Rule Name": {
        "variables": {
            "keywords": "regex",
            "variableName1": "regex",
            "variableName2": "regex"
        },
        "check": `keywords.test(Context) && variableName1.test(Context) || variableName2.test(Context)`,
        "severity": "Medium",
        "detectDuringTesting": false,
        "include": ["html", "json"]
    }
}
```
- Each rule name required following keys:
    - `variables`: This is an object, where each key is a variable name, and value is a regex.
        - `keywords`: In this keywords variable is must, and it will be utilised for evidence evaluation.
        - `variableName1/variableName2` (optional): Those are meant for multiple condition evaluation.
    - `check`: This is a evaluation function which return boolean value, on basis of which alert will be generated.
        - string will be look a like in following manner: `keywords.test(Context) (Condition) variableName1.test(Context)`
        - Here, `keywords` and `variableName1` comes from `variables` key.
        - Context value can be `requestUrl`, `requestHeaders`, `requestBody`, `responseHeaders`, `responseBody`.
        - Condition will be like `&&` (and), `||` (or) operators.
        - Final value may looks like this: `keywords.test(requestUrl) && variableName1.test(requestBody) || variableName2.test(requestHeaders)`
    - `severity`: This is a string, and it should be one of the following: `Low`, `Medium`, `High`, `Critical`.
    - `detectDuringTesting` (optional): This is a boolean, and it indicates whether the rule should be detected during manual testing or not. Default is true.
    - `include` (optional): This is an array of strings, and it indicates the content types in which the rule should be applied. This range from `html`, `json`, `text`, `js`. Default is all.
    - `exclude` (optional): This is an array of strings, and it indicates the content types in which the rule should not be applied. This range from `html`, `json`, `text`, `js`. Default is none. Don't use simultaneously with `include` key.

### Testing your own rules
- After creating the rule, we require to test again certain check
- Open "src/testcases.js" and you'll find object like below:
```js
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
    }
```
- Each testcases having followin components:
    - `id`: unique id representing each testcase.
    - `testcaseName`: unique name representing each testcase.
    - `http`: This block represent a sample request and response against we're expecting alert (or intentionally not an alert) which having following keys `url`,`method`,`requestHeaders`,`requestBody`,`responseHeaders`,`responseBody`.
    - `assert`: This block represent Intended alert name.
    - `notassert`: This block represent Intended not required alert name.
- Note: if you're addind simple regex which test against response body you can check for example id:1 and try to add body in that id if possible, instead of creating whole new case.
- To test the `alert.js` regexes and script, run the following command: `node src/runTest.js` (node as binary required)