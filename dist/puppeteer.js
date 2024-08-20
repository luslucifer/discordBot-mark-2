"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crazyBrowser = crazyBrowser;
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
function crazyBrowser(brandN) {
    return __awaiter(this, void 0, void 0, function* () {
        const cookiesFilePath = 'cookies.json';
        const readData = fs_1.default.readFileSync('info.json', 'utf-8');
        const brandPageLink = 'https://creators.joinmavely.com/brands';
        const info = JSON.parse(readData);
        const browser = yield puppeteer_1.default.launch({ headless: false });
        const page = yield browser.newPage();
        try {
            // Load cookies if they exist
            const previousSession = fs_1.default.existsSync(cookiesFilePath);
            yield login(previousSession, page, info);
            if (previousSession) {
                const cookies = JSON.parse(fs_1.default.readFileSync(cookiesFilePath, 'utf-8'));
                yield page.setCookie(...cookies);
            }
            yield page.goto(brandPageLink, { waitUntil: 'networkidle2' });
            // Wait for the search input field to appear
            yield page.waitForSelector('input[placeholder="Search by brand name"]', { timeout: 10000 });
            const searchBrand = yield page.$('input[placeholder="Search by brand name"]');
            if (searchBrand) {
                yield searchBrand.type(brandN);
                yield searchBrand.press('Enter');
            }
            else {
                throw new Error('Search input not found');
            }
            // Wait for results to appear
            yield page.waitForFunction(() => document.querySelectorAll('p').length > 6, { timeout: 10000 });
            const links = yield page.evaluate(() => {
                // Get all <a> elements
                const elements = document.querySelectorAll('a');
                // Extract href attributes
                return Array.from(elements).map(element => element.getAttribute('href'));
            });
            // console.log(links.length)
            // Find the link matching the brand name
            const link = links.find(l => l && new RegExp(brandN, 'i').test(l)) || 'samir';
            // Enter the URL into the input field
            const urlCompact = yield page.$('input[placeholder="Enter URL to create a link"]');
            if (urlCompact) {
                yield urlCompact.type(link);
            }
            else {
                throw new Error('URL input field not found');
            }
            const submitBtn = yield page.$('button[type="submit"]');
            if (submitBtn) {
                yield submitBtn.click();
            }
            else {
                throw new Error('Submit button not found');
            }
            // Wait for the result and extract the final link
            yield page.waitForFunction(() => /https:\/\/mavely.app.link\/e\/[^]+/.test(document.body.innerText), { timeout: 100000 });
            const p = yield page.evaluate(() => {
                const pElements = document.querySelectorAll('p');
                // console.log(pElements.length)
                return Array.from(pElements).map(e => e.innerText);
            });
            console.log(' p tags length is ====');
            console.log(p.length);
            console.log(p);
            const finalLink = p.find(l => /https:\/\/mavely.app.link\/e\/[^]+/.test(l)) || '';
            console.log('final link  here ');
            console.log(finalLink);
            return finalLink;
        }
        catch (error) {
            console.error('Error occurred:', error);
            throw error;
        }
        finally {
            yield browser.close(); // Ensure the browser is closed
        }
    });
}
function login(previousSession, page, info) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!previousSession) {
                const email = yield page.$('#email');
                if (email) {
                    yield email.type(info.email);
                }
                else {
                    throw new Error('Email input not found');
                }
                const password = yield page.$('#password');
                if (password) {
                    yield password.type(info.password);
                }
                else {
                    throw new Error('Password input not found');
                }
                const signInButton = yield page.$('button[type="submit"]');
                if (signInButton) {
                    yield signInButton.click();
                    yield page.waitForNavigation({ waitUntil: 'networkidle2' }); // Wait for navigation to ensure login is complete
                }
                else {
                    throw new Error('Sign in button not found');
                }
                // Save cookies after login
                const cookies = yield page.cookies();
                fs_1.default.writeFileSync('cookies.json', JSON.stringify(cookies, null, 2));
            }
        }
        catch (error) {
        }
    });
}
// async function stoper(document:Document,tag:string,minimumNumber:number){
// }
// crazyBrowser('walmart').then(e => console.log(e))
