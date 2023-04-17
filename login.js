import puppeteer from 'puppeteer';
import ExcelJS from 'exceljs';
import path, { resolve } from 'path';
import { authenticator } from 'otplib';
import { fileURLToPath } from 'url';
import key from 'ckey';

console.log('Accessing Seller Central...');

const signinUrl = 'https://sellercentral.amazon.com/home?mons_sel_dir_mcid=amzn1.merchant.d.AC52XPOS23A3N5BQHEM7N767DENA&mons_sel_mkid=ATVPDKIKX0DER&mons_sel_dir_paid=amzn1.pa.d.AC3YC5ZRR6GH2GJ6KJQ7MWY47WSA';
const browser = await puppeteer.launch({ headless: false, slowMo: 70 });
const page = await browser.newPage();
    
await page.goto(signinUrl);

const otpGenerator = (secretKey) => {
	const token = authenticator.generate(secretKey);
	return token;
}

const getAccount = (accKey) => {
    let accObj;
    const accConstantsArr = [
        { key: 'armsReach', email: key.ARMSREACH_USER, password: key.ARMSREACH_PASS, secretValue: key.ARMSREACH_TOKEN },
        { key: 'booyah', email: key.BOOYAH_USER, password: key.BOOYAH_PASS, secretValue: key.BOOYAH_TOKEN },
        { key: 'colgateMattress', email: key.COLGATEMATTRESS_USER, password: key.COLGATEMATTRESS_PASS, secretValue: key.COLGATEMATTRESS_TOKEN },
        { key: 'wonderfold', email: key.WONDERFOLD_USER, password: key.WONDERFOLD_PASS, secretValue: key.WONDERFOLD_TOKEN },
        { key: 'planToys', email: key.PLANTOYS_USER, password: key.PLANTOYS_PASS, secretValue: key.PLANTOYS_TOKEN },
        { key: 'gladlyFamily', email: key.GLADLYFAMILY_USER, password: key.GLADLYFAMILY_PASS, secretValue: key.GLADLYFAMILY_TOKEN },
        { key: 'safetyJoggerUS', email: key.SAFETYJOGGERUS_USER, password: key.SAFETYJOGGERUS_PASS, secretValue: key.SAFETYJOGGERUS_TOKEN },
        { key: 'safetyJoggerDE', email: key.SAFETYJOGGERDE_USER, password: key.SAFETYJOGGERDE_PASS, secretValue: key.SAFETYJOGGERDE_TOKEN },
        { key: 'sageSpoonfuls', email: key.SAGESPOONFULS_USER, password: key.SAGESPOONFULS_PASS, secretValue: key.SAGESPOONFULS_TOKEN }
    ];

    let accounts = accConstantsArr.map(items => {
        if(items.key === accKey){
            accObj = items;
        }
    })

    return accObj;
}

const signIn = async () => {
    let { email, password, secretValue } = await getAccount('wonderfold');

    try {
        if (await page.$('#ap_email') || await page.$('#ap_password')) {
            await page.type("#ap_email", email);
            await page.type("#ap_password", password);
            await page.click('#signInSubmit');
        }
    
        await page.$('#auth-mfa-otpcode')
        const otpCode = await otpGenerator(secretValue);
    
        await page.type('#auth-mfa-otpcode',otpCode);
        await page.click('#auth-signin-button');
    
        if (await page.$$('#picker-container > div > div.picker-body > div > div > div > div:nth-child(2) > button > div > div')) {
            await page.waitForSelector('#picker-container > div > div.picker-body > div > div > div > div:nth-child(2) > button > div > div');
            await page.click('#picker-container > div > div.picker-body > div > div > div > div:nth-child(2) > button > div > div');
            await page.waitForSelector('#picker-container > div > div.picker-body > div > div:nth-child(3) > div > div');
            await page.click('#picker-container > div > div.picker-body > div > div:nth-child(3) > div > div:last-of-type');
            await page.waitForSelector('#picker-container > div > div.picker-footer > div > button');
            await page.click('#picker-container > div > div.picker-footer > div > button');
        }

        console.log("Logged in...")
        return { browser }
    } catch (error) {
        await browser.close();
        console.log('Wrong credentials')
    }
}

signIn();

