import {test,expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';

const screenshots=resolve('../data/processed/frontend_screenshots');mkdirSync(screenshots,{recursive:true});
let errors:string[]=[];
test.beforeEach(async({page})=>{
  errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(['127.0.0.1','localhost'].includes(url.hostname)||['data:','blob:'].includes(url.protocol))return route.continue();
    errors.push('Unexpected external request: '+url.origin);return route.abort();
  });
  await page.goto('/');await expect(page.getByRole('button',{name:/API connected/})).toBeVisible();
});
test.afterEach(()=>expect(errors).toEqual([]));
async function run(page:Page,text:string){
  await page.getByLabel('What are you procuring?').fill(text);
  const response=page.waitForResponse(r=>r.url().endsWith('/v1/recommend')&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Find standards',exact:true}).click();
  const result=await response;expect(result.status()).toBe(200);
  await expect(page.getByRole('heading',{name:'Recommendations',exact:true})).toBeVisible();return result.json();
}
test('desktop input, empty submit and keyboard-accessible language controls',async({page})=>{
  writeFileSync(resolve('../data/processed/frontend_browser_environment.json'),JSON.stringify({browser:page.context().browser()?.version(),node:process.version,external_browser_requests:'blocked; any attempt fails its test',api:'actual cached models and Phase 2 seed'},null,2));
  await expect(page.getByRole('button',{name:'Find standards',exact:true})).toBeDisabled();
  await expect(page.getByText('DEMO WORKSPACE',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'हिन्दी',exact:true}).click();
  await expect(page.getByRole('button',{name:'हिन्दी',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'English',exact:true}).click();
  await page.screenshot({path:resolve(screenshots,'new-specification.png'),fullPage:true});
});
test('synthetic supersession, all allied groups, citations, and confirm feedback',async({page})=>{
  const result=await run(page,'IS-SEED-1001:2020');
  const card=page.getByRole('article').first();
  expect(result.primary_standards[0].source).toBe('synthetic_seed');
  await expect(card.getByText('MOCK / SYNTHETIC',{exact:true}).first()).toBeVisible();
  await expect(card.getByText('Superseded by IS-SEED-1001:2024',{exact:true})).toBeVisible();
  for(const name of ['Test methods','Terminology','Safety','Installation']){
    await card.locator('.allied-group>summary').filter({hasText:name}).click();
    const group=card.locator('.allied-group').filter({has:page.locator('summary').filter({hasText:name})});
    await expect(group.locator('.allied-item').first()).toBeVisible();
  }
  await card.getByText('Evidence & version history',{exact:true}).click();
  await expect(card.getByText('seed-1001-2020',{exact:true})).toBeVisible();
  await page.screenshot({path:resolve(screenshots,'synthetic-recommendations.png'),fullPage:true});
  const feedback=page.waitForResponse(r=>r.url().endsWith('/v1/feedback'));
  await card.getByRole('button',{name:'Correct',exact:true}).click();expect((await feedback).status()).toBe(201);
  await expect(card.getByText('Marked correct · feedback saved')).toBeVisible();
});
test('not relevant and validated alternative feedback persist through API',async({page})=>{
  await run(page,'IS-SEED-1001:2024');let card=page.getByRole('article').first();
  await card.getByRole('button',{name:'Not relevant',exact:true}).click();await expect(card.getByText('Marked not relevant · feedback saved')).toBeVisible();
  await page.getByRole('button',{name:'Edit specification',exact:true}).click();await run(page,'IS-SEED-1001:2024');card=page.getByRole('article').first();
  await card.getByRole('button',{name:'Suggest a different standard'}).click();
  await card.getByLabel('Alternative IS number in the knowledge base').fill('IS-SEED-9999:2099');
  await card.getByRole('button',{name:'Find',exact:true}).click();await expect(card.getByRole('alert')).toContainText('not in the allowed KB');
  await card.getByLabel('Alternative IS number in the knowledge base').fill('IS 9550:2024');
  await card.getByRole('button',{name:'Find',exact:true}).click();
  const feedback=page.waitForResponse(r=>r.url().endsWith('/v1/feedback'));
  await card.getByRole('button',{name:'Save suggestion'}).click();const response=await feedback;expect(response.status()).toBe(201);expect(response.request().postDataJSON().record_id).toBe('bis-10');
  await expect(card.getByText('Alternative saved · feedback saved')).toBeVisible();
});
test('fixture latest version and withdrawal never appear as verified BIS claims',async({page})=>{
  await run(page,'IS-SEED-1001:2024');await expect(page.getByRole('article').first().getByText('Latest Version · fixture',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Edit specification',exact:true}).click();await run(page,'IS-SEED-1024:2024');
  await expect(page.getByRole('article').first().getByText('Withdrawn',{exact:true})).toBeVisible();
  await expect(page.getByRole('article').first().getByRole('alert')).toContainText('withdrawn');
});
test('verified standard preserves unknown currentness and dated ISI evidence',async({page})=>{
  await page.getByRole('button',{name:/Bright steel bars/}).click();await run(page,'IS 9550:2024');
  const card=page.getByRole('article').first();await expect(card.getByText('Latest version unverified',{exact:true})).toBeVisible();
  await expect(card.getByText('BIS public metadata',{exact:true}).first()).toBeVisible();
  await expect(card.getByText('ISI · mandatory',{exact:true})).toBeVisible();
  await card.locator('.rule>summary').click();await expect(card.getByText('Product scope and exemptions still need review.')).toBeVisible();
  await expect(card.getByText('As verified 2026-09-21')).toBeVisible();
  await page.screenshot({path:resolve(screenshots,'verified-recommendations.png'),fullPage:true});
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export evidence'}).click();expect((await download).suggestedFilename()).toContain('standards-report-');
});
test('CRS and voluntary Hallmark category rules render without claiming automatic applicability',async({page})=>{
  await page.getByText('Certification scope (optional)',{exact:true}).click();
  await page.getByLabel('Product category — officer supplied').selectOption('laptop_notebook_tablet');await run(page,'IS 6188:1988');
  await expect(page.getByText('CRS · mandatory',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Edit specification',exact:true}).click();
  await page.getByText('Certification scope (optional)',{exact:true}).click();
  await page.getByLabel('Product category — officer supplied').selectOption('silver_jewellery_artefacts');await run(page,'IS 6188:1988');
  await expect(page.locator('.badge-voluntary')).toContainText('voluntary');
});
test('Hindi and Hinglish use local translation and retain original audit text',async({page})=>{
  await page.getByRole('button',{name:'हिन्दी',exact:true}).click();let result=await run(page,'लकड़ी की बेडसाइड मेज');
  expect(result.normalization.status).toBe('translated');expect(result.normalization.original_text).toBe('लकड़ी की बेडसाइड मेज');
  await expect(page.locator('.original-text')).toContainText('लकड़ी की बेडसाइड मेज');
  await page.getByRole('button',{name:'Edit specification',exact:true}).click();await page.getByRole('button',{name:'Hinglish',exact:true}).click();
  result=await run(page,'wooden bedside table chahiye');expect(result.normalization.detected_language).toBe('hi-Latn');expect(result.normalization.status).toBe('translated');
});
test('DOCX drag-and-drop and PDF file picker reach the real tender API',async({page})=>{
  const bytes=readFileSync(resolve('../data/mock/phase9-tender.docx'));
  const transfer=await page.evaluateHandle(payload=>{const data=new DataTransfer();data.items.add(new File([new Uint8Array(payload)],'phase9-tender.docx',{type:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}));return data;},Array.from(bytes));
  await page.locator('.dropzone').dispatchEvent('drop',{dataTransfer:transfer});
  await expect(page.getByText('phase9-tender.docx',{exact:true})).toBeVisible();
  await expect(page.getByLabel('What are you procuring?')).toBeDisabled();
  let response=page.waitForResponse(r=>r.url().endsWith('/v1/recommend'));
  await page.getByRole('button',{name:'Find standards',exact:true}).click();let data=await (await response).json();expect(data.kind).toBe('tender');
  await page.getByRole('button',{name:'Edit specification',exact:true}).click();
  await page.getByRole('button',{name:'Remove uploaded file'}).click();
  await page.getByLabel('Upload tender document').setInputFiles(resolve('../data/mock/phase9-tender.pdf'));
  response=page.waitForResponse(r=>r.url().endsWith('/v1/recommend'));
  await page.getByRole('button',{name:'Find standards',exact:true}).click();data=await (await response).json();expect(data.kind).toBe('tender');expect(data.primary_standards.length).toBeGreaterThan(0);
});
test('invalid and oversized uploads are rejected before a recommendation request',async({page})=>{
  await page.getByLabel('Upload tender document').setInputFiles({name:'wrong.exe',mimeType:'application/octet-stream',buffer:Buffer.from('bad')});
  await expect(page.getByRole('alert')).toContainText('Choose a PDF or DOCX');
  await page.getByLabel('Upload tender document').setInputFiles({name:'large.pdf',mimeType:'application/pdf',buffer:Buffer.alloc(5*1024*1024+1)});
  await expect(page.getByRole('alert')).toContainText('upload limit');
});
test('loading, API failure and unknown-identifier empty states are explicit',async({page})=>{
  await page.route('**/v1/recommend',async route=>{await new Promise(r=>setTimeout(r,1000));await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({detail:'Test-only unavailable backend'})});});
  await page.getByLabel('What are you procuring?').fill('wooden table');await page.getByRole('button',{name:'Find standards',exact:true}).click();
  await expect(page.getByRole('button',{name:/Finding standards/})).toBeDisabled();await expect(page.getByRole('status')).toContainText('Reading your specification');
  await expect(page.getByRole('alert')).toContainText('Test-only unavailable backend');await page.unroute('**/v1/recommend');
  await run(page,'IS 999999:2099');await expect(page.getByRole('heading',{name:'No candidates to show'})).toBeVisible();
  await expect(page.getByText('no confident match — showing closest candidates for human review')).toBeVisible();
});
test('mobile input and results remain usable without horizontal overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  await page.screenshot({path:resolve(screenshots,'mobile-input.png'),fullPage:true});
  await run(page,'IS-SEED-1001:2020');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
  await expect(page.getByRole('article').first().getByText('Superseded by IS-SEED-1001:2024',{exact:true})).toBeVisible();
  await page.screenshot({path:resolve(screenshots,'mobile-results.png'),fullPage:true});
});
