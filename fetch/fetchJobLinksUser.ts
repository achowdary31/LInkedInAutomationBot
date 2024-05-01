import { ElementHandle, Page } from 'puppeteer';
import LanguageDetect from 'languagedetect';

import buildUrl from '../utils/buildUrl';
import wait from '../utils/wait';
import selectors from '../selectors';

const MAX_PAGE_SIZE = 7;
const languageDetector = new LanguageDetect();

async function getJobSearchMetadata({ page, location, keywords }: { page: Page, location: string, keywords: string }) {
  await page.goto('https://linkedin.com/jobs', { waitUntil: "load" });

  await page.type(selectors.keywordInput, keywords);
  await page.waitForSelector(selectors.locationInput, { visible: true });
  await page.$eval(selectors.locationInput, (el, location) => (el as HTMLInputElement).value = location, location);
  await page.type(selectors.locationInput, ' ');
  await page.$eval('button.jobs-search-box__submit-button', (el) => el.click());
  await page.waitForFunction(() => new URLSearchParams(document.location.search).has('geoId'));

  const geoId = await page.evaluate(() => new URLSearchParams(document.location.search).get('geoId'));

  const numJobsHandle = await page.waitForSelector(selectors.searchResultListText, { timeout: 5000 }) as ElementHandle<HTMLElement>;
  const numAvailableJobs = await numJobsHandle.evaluate((el) => parseInt((el as HTMLElement).innerText.replace(',', '')));

  return {
    geoId,
    numAvailableJobs
  };
};

interface PARAMS {
  page: Page,
  location: string,
  keywords: string,
  workplace: { remote: boolean, onSite: boolean, hybrid: boolean },
  jobTitle: string,
  jobDescription: string,
  jobDescriptionLanguages: string[]
};

/**
 * Fetches job links as a user (logged in)
 */
async function* fetchJobLinksUser({ page, location, keywords, workplace: { remote, onSite, hybrid }, jobTitle, jobDescription, jobDescriptionLanguages }: PARAMS): AsyncGenerator<[string, string, string]> {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
  const data = [
    
  ];

  let numSeenJobs = 0;
  let numMatchingJobs = 0;
  const fWt = [onSite, remote, hybrid].reduce((acc, c, i) => c ? [...acc, i + 1] : acc, [] as number[]).join(',');

  const { geoId, numAvailableJobs } = await getJobSearchMetadata({ page, location, keywords });

  const searchParams: { [key: string]: string } = {
    keywords,
    location,
    start: numSeenJobs.toString(),
    f_WT: fWt,
    f_AL: 'true'
  };

  if(geoId) {
    searchParams.geoId = geoId.toString();
  }

  const url = buildUrl('https://www.linkedin.com/jobs/search', searchParams);
  const jobTitleRegExp = new RegExp(jobTitle, 'i');
  const jobDescriptionRegExp = new RegExp(jobDescription, 'i');

  while (numSeenJobs < numAvailableJobs) {
    url.searchParams.set('start', numSeenJobs.toString());

    await page.goto(url.toString(), { waitUntil: "load" });

    
    await page.waitForSelector(`${selectors.searchResultListItem}:nth-child(${Math.min(MAX_PAGE_SIZE, numAvailableJobs - numSeenJobs)})`, { timeout: 5000 });

    const jobListings = await page.$$(selectors.searchResultListItem);

    for (let i = 0; i < Math.min(jobListings.length, MAX_PAGE_SIZE); i++) {
      try {
        const [link, title] = await page.$eval(`${selectors.searchResultListItem}:nth-child(${i + 1}) ${selectors.searchResultListItemLink}`, (el) => {
          const linkEl = el as HTMLLinkElement;

          linkEl.click();

          return [linkEl.href.trim(), linkEl.innerText.trim()];
        });

        // await page.waitForFunction(async (selectors) => {
        //   console.log('Checking if job description has loaded...');
        //   const hasLoadedDescription = !!document.querySelector<HTMLElement>(selectors.jobDescription)?.innerText.trim();
        //   console.log('Has loaded description:', hasLoadedDescription);
        //   console.log('Checking if job status has loaded...');
        //   const hasLoadedStatus = !!(document.querySelector(selectors.easyApplyButtonEnabled) || document.querySelector(selectors.appliedToJobFeedback));
        //   console.log('Has loaded status:', hasLoadedStatus);
        //   return hasLoadedStatus && hasLoadedDescription;
        // }, {}, selectors);
        
        const companyName = await page.$eval('.job-details-jobs-unified-top-card__company-name a', el => el.innerText.trim()).catch(()=> 'Unknown');
        const jobDescription = await page.$eval('#job-details', el => el.innerHTML);
        let emails = jobDescription.match(emailRegex) || [];
        let phones = jobDescription.match(phoneRegex) || [];
        if(emails.length!=0 || phones.length != 0)
        { 
          data.push([emails.toString(),phones.toString()])
        }

        const spanText = await page.evaluate(() => {
          const span = document.querySelector('.artdeco-inline-feedback__message');
          return span ? span.textContent : null; // Using .textContent instead of .innerText
        });
        let canApply = true;
        if (spanText != null) {

          if (spanText && spanText.includes('Applied')) {
            console.log('The span contains the word "applied".');
            canApply = false;
          } else {
            canApply = !!(await page.$(selectors.easyApplyButtonEnabled));
          }
        }
        else {
          canApply = !!(await page.$(selectors.easyApplyButtonEnabled));
        }
        if (jobDescription.toLowerCase().includes(('no c2c')) || jobDescription.toLowerCase().includes(('w2'))) {
          canApply = false;
          console.log("This is a w2 role" + companyName);
        }
        const jobDescriptionLanguage = languageDetector.detect(jobDescription, 1)[0][0];
        const matchesLanguage = jobDescriptionLanguages.includes("any") || jobDescriptionLanguages.includes(jobDescriptionLanguage);

        if (canApply && jobTitleRegExp.test(title) && jobDescriptionRegExp.test(jobDescription) && matchesLanguage) {
          numMatchingJobs++;

          yield [link, title, companyName];
        }
      } catch (e) {
        console.log(e);
       // await saveData(data);
      }
    }

    await wait(2000);

    numSeenJobs += jobListings.length;
  //  await saveData(data);
  }
}

async function saveData( data : String[][]){
  const ExcelJS = require('exceljs');
  const fs = require('fs');
  const filePath = './EmailsandPhonesApplied.xlsx';
  (
    async () => {
    const workbook = new ExcelJS.Workbook();
    if (fs.existsSync(filePath)) {
        await workbook.xlsx.readFile(filePath);
    } 

    const sheetName = 'Automation';
    let worksheet = workbook.getWorksheet(sheetName);

    if (!worksheet) {
        worksheet = workbook.addWorksheet(sheetName);
    }

    data.forEach(row => {
      worksheet.addRow(row);
  });
    
    await workbook.xlsx.writeFile(filePath);
})();
}

export default fetchJobLinksUser;
