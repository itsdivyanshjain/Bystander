


<h1 align="center" id="welcome">Bystander: Passive Web Vulnerability Detection Tool<h1>
<p align="center"><img width="337" alt="demo" src="https://github.com/user-attachments/assets/42a22b8e-a8da-40d7-b65f-275c09ec5484" /><br></p>

## How it works
- Bystander is a chrome extension which monitors the network request and detect the potential web vulnerabilities, all on the user's browser. So, browse as usual and bystander will notify you if it detects any potential web vulnerabilities.

## What it can do
- Detect Actual Web Vulnerabilities like Open Redirect, CSRF, Clickjacking, etc.
- Detect Potential Code Sink's like XSS, SSTI, SSI etc.
- Detect API token leakage
- Detect Other Important PII leakage like Credit Card Number, Hash disclosure, etc.
- Look for Insights like staging domain, admin dashboard in frontend code and network traffic.

## How to use
- For now, download the github zip file or get it unpacked from git clone.
- Go to settings -> Extensions -> Enable Developer Mode.
- Click on "Load unpacked" and select the downloaded Bystander folder.
- Make sure to restart the browser after loading the extension. 
- Access the application normally and check the alert list in the popup.

## Features
- Testing Mode: This is required to be turned on when you're performing penetration testing so that it will not report certain alerts to avoid False Positive.
- Add your own rules: You can add your own rules to detect other passive vulnerabilities, insights, pii leakage, etc. Just require to edit in `alert.js` file.

## Warning
- This is still under development not even alpha version. So, there might be some bugs as well as false positives and negatives.
- If browser is getting crashed/hang after installing the extension, you can disable for time being until it's optimized.
- Severity of the alerts are tentative and it's meant as a weight of the alert but doesn't mean it's actually high/medium/low severity vulnerability.
