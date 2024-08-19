import puppeteer from 'puppeteer';
import fs from 'fs';
import { Page } from 'puppeteer';

interface Info {
    email: string;
    password: string;
}

export async function crazyBrowser(brandN: string): Promise<string> {
    const cookiesFilePath = 'cookies.json';
    const readData = fs.readFileSync('info.json', 'utf-8');
    const brandPageLink: string = 'https://creators.joinmavely.com/brands';
    const info: Info = JSON.parse(readData);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
        // Load cookies if they exist
        const previousSession = fs.existsSync(cookiesFilePath);
        await login(previousSession,page,info)

        if (previousSession) {
            const cookies = JSON.parse(fs.readFileSync(cookiesFilePath, 'utf-8'));
            await page.setCookie(...cookies);
        }

        await page.goto(brandPageLink, { waitUntil: 'networkidle2' });

        // Wait for the search input field to appear
        await page.waitForSelector('input[placeholder="Search by brand name"]', { timeout: 10000 });
        
        const searchBrand = await page.$('input[placeholder="Search by brand name"]');
        if (searchBrand) {
            await searchBrand.type(brandN);
            await searchBrand.press('Enter');
        } else {
            throw new Error('Search input not found');
        }

        // Wait for results to appear
        await page.waitForFunction(()=>document.querySelectorAll('p').length > 6,{timeout:10000});

        const links = await page.evaluate(() => {
            // Get all <a> elements
            const elements = document.querySelectorAll('a');
            // Extract href attributes
            return Array.from(elements).map(element => element.getAttribute('href'));
        });
        // console.log(links.length)

        // Find the link matching the brand name
        const link = links.find(l => l && new RegExp(brandN, 'i').test(l)) || 'samir';

        // Enter the URL into the input field
        const urlCompact = await page.$('input[placeholder="Enter URL to create a link"]');
        if (urlCompact) {
            await urlCompact.type(link);
        } else {
            throw new Error('URL input field not found');
        }

        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
            await submitBtn.click();
        } else {
            throw new Error('Submit button not found');
        }
 
        // Wait for the result and extract the final link
        await page.waitForFunction(() =>  /https:\/\/mavely.app.link\/e\/[^]+/.test(document.body.innerText), { timeout: 100000 });
        const p = await page.evaluate(() => {
            const pElements = document.querySelectorAll('p');
            // console.log(pElements.length)
            return Array.from(pElements).map(e => e.innerText);
        });
        console.log(' p tags length is ====')
        console.log(p.length)
        console.log(p)
        const finalLink = p.find(l => /https:\/\/mavely.app.link\/e\/[^]+/.test(l)) || '';
        console.log('final link  here ')
        console.log(finalLink)

        return finalLink; 

    } catch (error) {
        console.error('Error occurred:', error);
        throw error;
    } finally {
        await browser.close(); // Ensure the browser is closed
    }
}

async function login(previousSession: boolean, page: Page, info: Info) {
    try {
        
        if (!previousSession) {
            const email = await page.$('#email');
            if (email) {
                await email.type(info.email);
            } else {
                throw new Error('Email input not found');
            }
        
            const password = await page.$('#password');
            if (password) {
                await password.type(info.password);
            } else {
                throw new Error('Password input not found');
            }
        
            const signInButton = await page.$('button[type="submit"]');
            if (signInButton) {
                await signInButton.click();
                await page.waitForNavigation({ waitUntil: 'networkidle2' }); // Wait for navigation to ensure login is complete
            } else {
                throw new Error('Sign in button not found');
            }
        
            // Save cookies after login
            const cookies = await page.cookies();
            fs.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
        }
    } catch (error) {
        
    }
}

// async function stoper(document:Document,tag:string,minimumNumber:number){

// }
// crazyBrowser('walmart').then(e => console.log(e))