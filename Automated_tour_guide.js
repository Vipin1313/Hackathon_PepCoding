const puppy = require("puppeteer");
const fs = require('fs')

const source = "Delhi"; 
const destination = "Mumbai";
 
let trainResults = {};
let busResults = {};
let flightResult = {};

async function main1(browser) {
    let tabs = await browser.pages();
    let tab = tabs[0];
    await tab.goto("https://www.irctc.co.in/nget/train-search"); 
    await tab.click("body > app-root > app-home > div:nth-child(1) > app-header > p-dialog.ng-tns-c45-2 > div > div > div.ng-tns-c45-2.ui-dialog-content.ui-widget-content > div > form > div.text-center.col-xs-12 > button");    
    
    await tab.click("#origin > span > input");
    await tab.type("#origin > span > input",source);
    await tab.keyboard.press("ArrowDown");
    await tab.keyboard.press("Enter");

    await tab.click("#destination > span > input");
    await tab.type("#destination > span > input",destination);
    await tab.waitForTimeout(1000);
    await tab.keyboard.press("ArrowDown");
    await tab.keyboard.press("Enter");
    
    await tab.click("#jDate > span > input", {clickCount: 3})
    await tab.type("#jDate > span > input", "15/04/2021");
    await tab.keyboard.press("Enter");
    await tab.waitForTimeout(10000);

    const trains = await tab.evaluate(() => {
        const grabFromRow = (row, dataLoc) => {
            const ele=row.querySelector(dataLoc); // grab the TD
            if(ele){
                return ele.innerText.trim();
            }
        }
        // defining selector
        const TRAIN_ROW_SELECTOR = "div[class='ng-star-inserted']";
        // array to store data
        let data = [];

        const trainRows = document.querySelectorAll(TRAIN_ROW_SELECTOR);
        // looping over each team row
        for(const tr of trainRows){
                data.push({
                  Name: grabFromRow(tr, "div[class*='train-heading']"),
                  Travel_Time: grabFromRow(tr, "div[class*='line-hr']"),
                  Journey_Start_Time: grabFromRow(tr,"#divMain > div > app-train-list > div.col-sm-9.col-xs-12 > div > div.ng-star-inserted > div:nth-child(1) > div.form-group.no-pad.col-xs-12.bull-back.border-all > app-train-avl-enq > div.ng-star-inserted > div.white-back.no-pad.col-xs-12 > div:nth-child(9) > div:nth-child(1)"),
                  Journey_End_Time: grabFromRow(tr,"#divMain > div > app-train-list > div.col-sm-9.col-xs-12 > div > div.ng-star-inserted > div:nth-child(2) > div.form-group.no-pad.col-xs-12.bull-back.border-all > app-train-avl-enq > div.ng-star-inserted > div.white-back.no-pad.col-xs-12 > div:nth-child(9) > div.col-xs-4.pull-right > span"),
                  Fare: grabFromRow(tr, "span[class='pull-right ng-star-inserted']"),
                 })
        }
        return data
});

let uniqueArr = [];
var myMap = new Map();
    // loop through array
    for(let i of trains) {
        if(i != null && i != undefined && i.Name!=null && !myMap.has(i.Name)) {
            myMap.set(i.Name,i);
            uniqueArr.push(i);
        }
    }  
   
let ans =  JSON.stringify(uniqueArr, null, "\t");
trainResults=ans;
}    

async function main2(browser) {
   
    let tabs = await browser.pages();
    let tab = tabs[0];
    await tab.goto("https://www.redbus.in/"); 

    await tab.click("#src");
    await tab.type("#src",source);
    await tab.waitForTimeout(500);
    await tab.keyboard.press("Enter");

    await tab.click("#dest");
    await tab.type("#dest",destination);
    await tab.waitForTimeout(500);
    await tab.keyboard.press("Enter");

    await tab.click('#onward_cal');
    await tab.$eval('#onward_cal', el => el.value = '2021-04-15');
    await tab.click('#search_btn');

    await tab.waitForSelector(".clearfix.row-one",{visible: true});
    const buses = await tab.evaluate(() => {
        
        const grabFromRow = (row, dataLoc) => {
            const ele=row.querySelector(dataLoc); // grab the TD
            if(ele){
                return ele.innerText.trim();
            }
        }

        // defining selector
        const BUS_ROW_SELECTOR = ".clearfix.row-one";

        // array to store data
        let data = [];

        const busRows = document.querySelectorAll(BUS_ROW_SELECTOR);

        // looping over each team row
        let count = 0;
        for(const tr of busRows){
                count++;
                data.push({
                  Name: grabFromRow(tr, ".travels.lh-24.f-bold.d-color"),
                  Travel_Time: grabFromRow(tr, ".dur.l-color.lh-24"),
                  Journey_Start_Time: grabFromRow(tr,".dp-time.f-19.d-color.f-bold"),
                  Journey_End_Time: grabFromRow(tr,".bp-time.f-19.d-color.disp-Inline"),
                  Fare: grabFromRow(tr, "div.seat-fare span"),
                 })
                 if(count > 4)
                    break;
        }
        return data
});

let ans =  JSON.stringify(buses, null, "\t");
busResults=ans;

}

async function main3(browser) {
 
    let tabs = await browser.pages();
    let tab = tabs[0];
    await tab.goto("https://www.travolook.in/"); 
    await tab.waitForTimeout(2000);

    await tab.click("input.fly-from-input");
    await tab.type("input.fly-from-input",source);
    await tab.waitForTimeout(500);
    await tab.keyboard.press("ArrowDown");
    await tab.keyboard.press("Enter");

    await tab.waitForSelector("input.fly-to-input",{visible: true});
    await tab.click("input.fly-to-input");
    await tab.type("input.fly-to-input",destination);
    await tab.waitForTimeout(500);
    await tab.keyboard.press("ArrowDown");
    await tab.keyboard.press("ArrowDown");
    await tab.keyboard.press("Enter");

    await tab.$eval("#Fly_depdate", el => {
        el.type='visible';
        el.value = '2021-04-15'});
    await tab.waitForTimeout(1000);
    await tab.click("input[value='Search']");
    await tab.waitForSelector("div[class*='resultlist']:not([class*='offerdiv'])",{visible: true});
    
    const flights = await tab.evaluate(() => {
        const grabFromRow = (row, dataLoc) => {
            const ele=row.querySelector(dataLoc); // grab the TD
            if(ele){
                return ele.innerText.trim();
            }
        }

        // defining selector
        const FLIGHT_ROW_SELECTOR = "div[class*='resultlist']:not([class*='offerdiv'])";

        // array to store data
        let data = [];

        const flightRows = document.querySelectorAll(FLIGHT_ROW_SELECTOR);
        let count = 0;
        // looping over each team row
        for(const tr of flightRows){
            count++;
            console.log("2Last" + data.length);
                data.push({
                  Name: grabFromRow(tr, "div[class*='airline']>span"),
                  Travel_Time: grabFromRow(tr, "div[class*='timstop']>span"),
                  Journey_Start_Time: grabFromRow(tr,"b.text-right"),
                  Journey_End_Time: grabFromRow(tr,"b.text-left"),
                  Fare: grabFromRow(tr, "p.price.text-center"),
                 })
                 if(count > 4)
                    break;
        }
        return data
});

let ans = JSON.stringify(flights, null, "\t");
flightResult=ans;

}
async function main(){
    let browser = await puppy.launch({
        headless: false,
        defaultViewport: false,
        args: ["--start-maximized"]
    });
    await main1(browser);
    await main2(browser);
    await main3(browser);
    
        fs.writeFile('JourneyDetailsFinal.txt',"All Details", () => {});
        fs.appendFile('JourneyDetailsFinal.txt',trainResults, () => {});
        fs.appendFile('JourneyDetailsFinal.txt',busResults, () => {});
        fs.appendFile('JourneyDetailsFinal.txt',flightResult, () => {});
}

main();
