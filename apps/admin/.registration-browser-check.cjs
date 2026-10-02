const {chromium}=require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),assert=require('node:assert/strict');
const fixture=JSON.parse(fs.readFileSync('C:/Users/USER/.codex/attachments/dce976d0-bf07-4550-8018-d8ee2d723d42/Pasted text.txt','utf8'));
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try {
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let body;
  await page.route('**/api/worker/form/*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(fixture)}));
  await page.route('**/api/worker/create',r=>{body=r.request().postData();return r.fulfill({contentType:'application/json',body:'{"success":true}'});});
  await page.goto('http://localhost:3005/register?token=fixture');
  const church=page.getByRole('combobox').filter({hasText:'Saints Community Church Alagbado'});
  await church.waitFor();assert.equal(await church.isDisabled(),true);
  const fellowship=page.getByRole('combobox').filter({hasText:'Salolo Fellowship'});
  assert.equal(await fellowship.isDisabled(),true);
  await page.getByRole('combobox').filter({hasText:'Select a cell'}).click();
  assert.deepEqual(await page.getByRole('option').allTextContents(),fixture.data.churchInformation.cells.map(c=>c.name));
  await page.getByRole('option',{name:'Salolo Cell',exact:true}).click();
  await page.locator('#firstName').fill('Test');await page.locator('#lastName').fill('Registrant');await page.locator('#homeAddress').fill('Test address');
  await page.getByRole('combobox').filter({hasText:'Select gender'}).click();await page.getByRole('option',{name:'Male',exact:true}).click();
  await page.getByRole('combobox').filter({hasText:'Select a prayer group'}).click();await page.getByRole('option',{name:'Monday (evening)',exact:true}).click();
  await page.locator('#termsAccepted').click();await page.locator('#privacyAcknowledged').click();
  await page.getByRole('button',{name:'Submit',exact:true}).click();await page.waitForURL('**/completed');
  for(const [key,value] of [['church_id','10'],['fellowship_id','30'],['cell_id','11']]) assert.match(body,new RegExp('name="'+key+'"\\r\\n\\r\\n'+value+'\\r\\n'));
  assert.deepEqual(errors,[]);console.log('Exact payload: selected labels, all five cell options, and submitted IDs verified. No browser errors.');
  for(const mode of ['church-only','fixed-cell']) {
   const f=structuredClone(fixture);f.data.registrationScope.fellowship_id=null;
   f.data.churchInformation.fellowships.push({id:31,name:'Other Fellowship',church_id:10});
   f.data.churchInformation.cells.push({id:99,name:'Other Cell',church_id:10,fellowship_id:31});
   if(mode==='fixed-cell'){f.data.registrationScope.cell_id=11;f.data.churchInformation.cells=[f.data.churchInformation.cells[0]];}
   await page.unroute('**/api/worker/form/*');await page.route('**/api/worker/form/*',r=>r.fulfill({contentType:'application/json',body:JSON.stringify(f)}));
   await page.goto('http://localhost:3005/register?token='+mode);
   await page.getByRole('combobox').filter({hasText:'Select a fellowship'}).click();await page.getByRole('option',{name:'Other Fellowship',exact:true}).click();
   if(mode==='fixed-cell') {const cell=page.getByRole('combobox').filter({hasText:'Salolo Cell'});await cell.waitFor();assert.equal(await cell.isDisabled(),true);}
   else {await page.getByRole('combobox').filter({hasText:'Other Cell'}).waitFor();}
   console.log(mode+': fellowship selection and cell behavior verified.');
  }
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
