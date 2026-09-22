import {defineConfig,chromium} from '@playwright/test';
import {existsSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
// Reuse provisioned browsers only; tests never download executables.
let executable=process.env.E2E_CHROMIUM_PATH;
if(!executable&&!existsSync(chromium.executablePath())&&process.env.LOCALAPPDATA){
  const cache=join(process.env.LOCALAPPDATA,'ms-playwright');
  if(existsSync(cache)) executable=readdirSync(cache).filter(n=>/^chromium-\d+$/.test(n)).sort((a,b)=>Number(b.split('-')[1])-Number(a.split('-')[1])).map(n=>join(cache,n,'chrome-win64','chrome.exe')).find(p=>existsSync(p));
}
export default defineConfig({testDir:'./tests',timeout:120000,expect:{timeout:20000},workers:1,retries:0,
  reporter:[['list'],['json',{outputFile:'../data/processed/frontend_e2e_report.json'}]],
  use:{baseURL:'http://127.0.0.1:5173',viewport:{width:1440,height:1050},
    launchOptions:executable?{executablePath:executable}:{},
    screenshot:'only-on-failure',trace:'retain-on-failure'}});
