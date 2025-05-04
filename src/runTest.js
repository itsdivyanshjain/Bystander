import testcases from './testcases.js';
import alertJson from './alert.js';

for (let testcase of testcases){

    var geval = eval; // https://stackoverflow.com/a/52231027

    geval(`var requestUrl = "${testcase.http.url}";`)
    geval(`var requestBody = "${testcase.http.requestBody}";`)
    geval("var requestHeaders = `"+testcase.http.requestHeaders+"`;")
    geval("var responseBody = `"+testcase.http.responseBody+"`;")
    geval("var responseHeaders = `"+testcase.http.responseHeaders+"`;")

    //geval(`console.log(requestUrl);`)
    // geval(`console.log(requestBody);`)
    // geval(`console.log(requestHeaders);`)
    // geval(`console.log(responseBody);`)
    // geval(`console.log(responseHeaders);`)
    //console.log(a);
    for (let alert in alertJson){
        // assign variables
        for (let variable in alertJson[alert].variables){
            //console.log("variable: ", alertJson[alert].variables[variable]);
            if (alertJson[alert].variables[variable].startsWith("/")) {
                // let flags_split = condition.variables[variable].split("/")
                // let flags = flags_split.pop();
                // let finalVariable = flags_split.join("/").slice(1)
                //console.log(`var ${variable} = '${alertJson[alert].variables[variable]}';`);
                //console.log("here 1")
                geval(`var ${variable} = ${alertJson[alert].variables[variable]};`);
                //geval(`var ${variable} = '${finalVariable}';`)
                // prepared_code = prepared_code.replaceAll(variable, condition.variables[variable]);
            } else {
                //continue
                //console.log(`var ${variable} = new RegExp(${alertJson[alert].variables[variable]}), 'gm';`)
                //console.log("here 2")
                geval(`var ${variable} = /${alertJson[alert].variables[variable]}/gm;`)
                //geval(`var ${variable} = new RegExp(${variable}), 'gm';`)
            }
            //console.log(eval(`${variable}`));
        }
        //console.log(alert);
        //geval(`console.log(keywords);`)
        //geval(`console.log(responseHeaders);`)
        let result = geval(alertJson[alert].check);
        //console.log(result);
        // TODO: if true get evidence 
        if (result) {
            if (testcase.assert.includes(alert)) {
                console.log(`Test case "${testcase.id}" succeed: ${alert}`)
            } else if (testcase.notassert && testcase.notassert.includes(alert)) {
                console.log(`Test case "${testcase.id}" failed: ${alert} `)
            } else {
                console.log(`Test case "${testcase.id}" extra alert: ${alert} `)
            }
        }
    }
    // geval(`console.log(requestUrl);`)
}