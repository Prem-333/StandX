import {useEffect,useRef,useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Check,ChevronDown,ChevronRight,ClipboardList,FileCheck2,FileText,FolderOpen,Globe2,Layers3,Link2,LoaderCircle,LockKeyhole,Plus,Search,Settings2,ShieldCheck,Sparkles,UploadCloud,X,AlertTriangle,Download} from 'lucide-react';
import {request,publicUrl} from './api';
import type {Allied,Evidence,Language,Report,Rule,Standard,Version} from './types';

const relationshipNames:Record<string,string>={TEST_METHOD_FOR:'Test methods',TERMINOLOGY_FOR:'Terminology',SAFETY_STANDARD_FOR:'Safety',INSTALLATION_STANDARD_FOR:'Installation',NORMATIVE_REFERENCE:'Normative references',UNTYPED_REFERENCE:'Other references · untyped',SAME_COMMITTEE:'Same committee · weak association'};
const categories=[['','Not specified'],['bright_steel_bars','Bright steel bars'],['laptop_notebook_tablet','Laptops / notebooks / tablets'],['gold_jewellery_artefacts','Gold jewellery / artefacts'],['silver_jewellery_artefacts','Silver jewellery / artefacts']];
const synthetic=(source:string)=>source==='synthetic_seed'||source==='synthetic';
const titleCase=(text:string)=>text.replaceAll('_',' ');

function Provenance({source}:{source:string}){return <span className={`badge ${synthetic(source)?'badge-demo':'badge-source'}`}>{synthetic(source)?'MOCK / SYNTHETIC':source==='bis_public_metadata_verified'?'BIS public metadata':'Source unverified'}</span>;}
function VersionBadge({version,source}:{version:Version;source:string}){
  if(version.status==='superseded')return <span className="badge badge-danger"><AlertTriangle size={13}/> Superseded{version.final_current_standard?` by ${version.final_current_standard}`:' · replacement unknown'}</span>;
  if(version.status==='withdrawn')return <span className="badge badge-danger"><AlertTriangle size={13}/> Withdrawn</span>;
  if(version.is_latest_revision===true)return <span className="badge badge-success"><Check size={13}/> Latest Version{synthetic(source)?' · fixture':''}</span>;
  return <span className="badge badge-neutral">Latest version unverified</span>;
}
function EvidenceList({items}:{items:Evidence[]}){return <div className="evidence-list">{items.map(item=><div key={item.record_id} className="evidence-row">
  <div className="flex flex-wrap items-center gap-2"><strong>{item.is_number}</strong><Provenance source={item.source}/></div>
  <div className="mt-1 text-xs text-muted">KB record <code>{item.record_id}</code>{item.fetched_at&&` · ${synthetic(item.source)?'Fixture date':'Fetched'} ${item.fetched_at.slice(0,10)}`}</div>
  {publicUrl(item.source_url)&&<a className="text-link mt-2 inline-flex items-center gap-1" href={publicUrl(item.source_url)} target="_blank" rel="noopener noreferrer">Public metadata source <Link2 size={12}/></a>}
  {item.snapshot_sha256&&<div className="mt-1 break-all text-[11px] text-muted">Snapshot SHA-256: {item.snapshot_sha256}</div>}
  {synthetic(item.source)&&<p className="mt-1 text-xs text-amber-900">Fixture only. No BIS standard or legal claim.</p>}
  </div>)}</div>;}

function Certification({rules}:{rules:Rule[]}){
  if(!rules.length)return <p className="text-xs text-muted">Certification applicability unknown · no verified mapping for this record.</p>;
  return <div className="space-y-2">{rules.map((rule,index)=><details className="rule" key={`${rule.id}-${index}`}>
    <summary><span className={`badge ${rule.stale||rule.requirement==='unknown'?'badge-neutral':rule.requirement==='mandatory'?'badge-mandatory':'badge-voluntary'}`}><ShieldCheck size={13}/>{rule.scheme==='HALLMARKING'?'Hallmark':rule.scheme} · {titleCase(rule.requirement)}</span><span className="text-xs text-muted">As verified {rule.as_verified_on}</span><ChevronDown size={14}/></summary>
    <div className="rule-body"><p className="font-medium">{rule.scheme_name||rule.scheme}</p><p className="mt-1">Category: {titleCase(rule.product_category)}</p>
    <p className="mt-2">{rule.stale?'Evidence is stale; verify the current rule.':rule.applies_to_supplied_context===null?'Product scope and exemptions still need review.':rule.applies_to_supplied_context===false?'Supplied scope does not match this rule; this does not establish an exemption.':'Supplied assertions match the rule; legal applicability still needs review.'}</p>
    <p className="mt-2">{rule.notice}</p>{rule.scope_note&&<p>{rule.scope_note}</p>}
    <p className="mt-2 break-words">Triggered by: {String(rule.trigger.value||rule.product_category)}{rule.trigger.record_id?` · KB record ${String(rule.trigger.record_id)}`:''}</p>
    {rule.missing_conditions?.map(c=><p key={c.description}>• {c.description}</p>)}
    {rule.evidence.map((e,i)=><p key={i} className="mt-2"><a href={publicUrl(e.url)} target="_blank" rel="noopener noreferrer" className="text-link">{e.locator} ↗</a><br/>{e.summary}</p>)}
    <details className="mt-3"><summary className="text-link">Complete rule and limitations</summary><pre className="json-block">{JSON.stringify(rule,null,2)}</pre></details>
    </div></details>)}</div>;
}

function AlliedGroups({groups}:{groups:Record<string,Allied[]>}){
  const populated=Object.entries(groups).filter(([,rows])=>rows.length);
  if(!populated.length)return <p className="text-xs text-muted">No evidenced allied standards in this KB snapshot.</p>;
  return <div className="allied-groups">{populated.map(([relation,rows])=><details key={relation} className="allied-group">
    <summary><Layers3 size={15}/><span>{relationshipNames[relation]||titleCase(relation)}</span><span className="count">{rows.length}</span><ChevronDown size={14}/></summary>
    <div className="allied-items">{rows.map(row=><div key={row.record_id} className="allied-item"><div className="flex flex-wrap items-center gap-2"><span className="standard-number">{row.is_number}</span><Provenance source={row.source}/></div><p className="mt-1 text-sm">{row.title}</p>
      <details className="mt-2"><summary className="text-link text-xs">Record citation & relationship evidence</summary><EvidenceList items={row.evidence}/><pre className="json-block">{JSON.stringify(row.evidence_path||[],null,2)}</pre></details>
    </div>)}</div></details>)}</div>;
}

function Feedback({item,reportId,apiKey}:{item:Standard;reportId:string;apiKey:string}){
  const [busy,setBusy]=useState(false),[saved,setSaved]=useState(''),[error,setError]=useState(''),[suggest,setSuggest]=useState(false),[number,setNumber]=useState('');
  const [alternative,setAlternative]=useState<{record:{record_id:string;is_number:string;title:string;source:string}}|null>(null);
  async function send(decision:'confirm'|'reject'|'correct',recordId=item.record_id){setBusy(true);setError('');try{
    await request('/v1/feedback',apiKey,{method:'POST',body:JSON.stringify({recommendation_id:reportId,decision,record_id:recordId,comment:decision==='correct'?`Suggested alternative to ${item.is_number} (${item.record_id})`:'Officer reviewed this candidate'})});
    setSaved(decision==='confirm'?'Marked correct':decision==='reject'?'Marked not relevant':'Alternative saved');setSuggest(false);
  }catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  async function lookup(event:FormEvent){event.preventDefault();setBusy(true);setError('');setAlternative(null);try{setAlternative(await request(`/v1/standards/${encodeURIComponent(number.trim())}`,apiKey));}catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  return <div className="feedback"><span className="text-xs text-muted">Was this useful?</span><div className="flex flex-wrap gap-1.5">
    <button className="feedback-button" disabled={busy||Boolean(saved)} onClick={()=>send('confirm')}><Check size={14}/>Correct</button>
    <button className="feedback-button" disabled={busy||Boolean(saved)} onClick={()=>send('reject')}><X size={14}/>Not relevant</button>
    <button className="feedback-button" disabled={busy||Boolean(saved)} onClick={()=>setSuggest(!suggest)}><Plus size={14}/>Suggest a different standard</button>
  </div>{saved&&<p className="feedback-success" role="status"><Check size={14}/>{saved} · feedback saved</p>}
  {suggest&&<div className="suggest-box"><form onSubmit={lookup}><label className="field-label" htmlFor={`alternative-${item.record_id}`}>Alternative IS number in the knowledge base</label><div className="flex gap-2"><input id={`alternative-${item.record_id}`} value={number} onChange={e=>{setNumber(e.target.value);setAlternative(null);}} placeholder="Enter an IS number" required/><button className="button button-secondary" disabled={busy}>Find</button></div></form>
  {alternative&&<div className="mt-3 space-y-2"><p className="text-sm"><strong>{alternative.record.is_number}</strong> · {alternative.record.title}</p><Provenance source={alternative.record.source}/><button className="button button-primary" disabled={busy} onClick={()=>send('correct',alternative.record.record_id)}>Save suggestion</button></div>}</div>}
  {error&&<p role="alert" className="error-inline">{error}</p>}</div>;
}

function StandardCard({item,index,reportId,apiKey}:{item:Standard;index:number;reportId:string;apiKey:string}){
  const version=item.version_status, exact=item.confidence_basis==='identifier_identity_only';
  return <article className="standard-card" aria-label={`Recommendation ${index+1}: ${item.is_number}`}>
    <div className="card-content"><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="rank-number">{String(index+1).padStart(2,'0')}</span><span className="standard-number">{item.is_number}</span></div><Provenance source={item.source}/></div>
    <h2 className="standard-title">{item.title}</h2><div className="flex flex-wrap items-center gap-2"><VersionBadge version={version} source={item.source}/>{!item.meets_confidence_threshold&&<span className="badge badge-review">Human review required</span>}</div>
    {item.warnings.map(w=><div key={w.code} className="hard-warning" role="alert"><AlertTriangle size={17}/><p>{w.message}</p></div>)}
    <div className="relevance"><span>{exact?'Exact identifier match':'Confidence · metadata relevance'}</span><div className="relevance-track"><div style={{width:`${Math.max(0,Math.min(100,item.score*100))}%`}}/></div><strong>{Math.round(item.score*100)}%</strong></div>
    <p className="text-xs text-muted">{exact?'Identity match only; applicability is not confirmed.':'Uncalibrated relevance score, not probability of correctness.'}</p>
    <p className="rationale">{item.rationale}</p>
    {item.matched_phrases?.length&&<p className="text-xs text-muted mb-4">Matched tender phrases: {item.matched_phrases.map(p=>p.phrase).join(' · ')}</p>}
    <div className="card-section"><h3 className="section-label">Certification requirements</h3><Certification rules={item.certification_requirements}/>
    {synthetic(item.source)&&item.certification?.schemes.map(s=><p key={s.id} className="mt-2 text-xs text-amber-900">MOCK / SYNTHETIC: {s.name} · {s.requirement} in fixture only. No legal effect.</p>)}</div>
    <div className="card-section"><h3 className="section-label">Allied standards</h3><AlliedGroups groups={item.allied_standards}/></div>
    <details className="evidence-details"><summary><Link2 size={14}/>Evidence & version history<ChevronDown size={14}/></summary><EvidenceList items={item.evidence}/>
      <dl className="version-grid"><div><dt>Amendments reported</dt><dd>{version.amendments_reported??'Unknown'}</dd></div><div><dt>Unresolved amendments</dt><dd>{version.unresolved_amendments??'Unknown'}</dd></div></dl>
      {version.supersession_path&&version.supersession_path.length>1&&<p className="text-xs break-words mt-3">Supersession chain: {version.supersession_path.join(' → ')}</p>}
    </details></div><Feedback item={item} reportId={reportId} apiKey={apiKey}/>
  </article>;
}

export default function App(){
  const [screen,setScreen]=useState<'input'|'results'>('input'),[text,setText]=useState(''),[language,setLanguage]=useState<Language>('en'),[tender,setTender]=useState(false),[file,setFile]=useState<File|null>(null),[dragging,setDragging]=useState(false),[busy,setBusy]=useState(false),[seconds,setSeconds]=useState(0),[error,setError]=useState(''),[report,setReport]=useState<Report|null>(null),[category,setCategory]=useState('');
  const [apiKey,setApiKey]=useState(''),[connection,setConnection]=useState(false),[connected,setConnected]=useState(false),[demo,setDemo]=useState(false),[proxyAuth,setProxyAuth]=useState(false),[ready,setReady]=useState(false);
  const [context,setContext]=useState<Record<string,boolean>>({});
  const inputRef=useRef<HTMLInputElement>(null),heading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{fetch('/demo-context').then(r=>r.json()).then(c=>{setDemo(c.demo);setProxyAuth(c.authenticated_proxy);setConnection(!c.authenticated_proxy);}).catch(()=>setConnection(true)).finally(()=>setReady(true));},[]);
  useEffect(()=>{if(!ready)return;let active=true;request('/v1/health',apiKey).then(()=>{if(active)setConnected(true);}).catch(()=>{if(active)setConnected(false);});return()=>{active=false;};},[apiKey,ready]);
  useEffect(()=>{if(!busy)return;setSeconds(0);const id=setInterval(()=>setSeconds(s=>s+1),1000);return()=>clearInterval(id);},[busy]);
  useEffect(()=>{if(screen==='results'){heading.current?.focus();window.scrollTo({top:0,behavior:'instant'});}},[screen]);
  function chooseFile(candidate?:File){if(!candidate)return;setError('');if(!/\.(pdf|docx)$/i.test(candidate.name)){setError('Choose a PDF or DOCX tender document.');return;}if(candidate.size>5*1024*1024){setError('The upload limit is 5 MiB. Choose a smaller document.');return;}setFile(candidate);}
  function sample(value:string,lang:Language='en',product=''){setText(value);setLanguage(lang);setCategory(product);setContext({});setFile(null);setTender(false);setError('');}
  async function submit(event:FormEvent){event.preventDefault();setError('');if(!file&&!text.trim()){setError('Paste a specification or upload a tender document.');return;}setBusy(true);try{
    let body:FormData|string;
    if(file){body=new FormData();body.append('file',file);body.append('top_k','5');body.append('language_hint',language);if(category)body.append('product_category',category);body.append('certification_context',JSON.stringify(context));}
    else body=JSON.stringify({text,language_hint:language,top_k:5,tender,product_category:category||null,certification_context:context});
    const result=await request<Report>('/v1/recommend',apiKey,{method:'POST',body});setReport(result);setScreen('results');setConnected(true);
  }catch(e){setError((e as Error).message);}finally{setBusy(false);}}
  function download(){if(!report)return;const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=`standards-report-${report.recommendation_id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <div className="app-shell"><a className="skip-link" href="#main">Skip to content</a><aside className="sidebar"><a href="#" className="brand" onClick={e=>{e.preventDefault();setScreen('input');}}><span className="brand-icon"><BookOpen size={23}/></span><span>Standards Desk<small>PROCUREMENT ASSISTANT</small></span></a>
    <div className="sidebar-section">WORKSPACE</div><nav aria-label="Main navigation"><button className={`nav-item ${screen==='input'?'active':''}`} onClick={()=>setScreen('input')} aria-current={screen==='input'?'page':undefined}><FileText size={18}/>New Specification<Plus size={16} className="ml-auto"/></button><button className={`nav-item ${screen==='results'?'active':''}`} disabled={!report} onClick={()=>setScreen('results')} aria-current={screen==='results'?'page':undefined}><ClipboardList size={18}/>Recommendations{report&&<span className="nav-count">{report.primary_standards.length}</span>}</button></nav>
    <div className="sidebar-note"><ShieldCheck size={20}/><h3>Evidence comes first.</h3><p>Every recommendation links to a knowledge-base record. Final procurement decisions stay with you.</p></div><div className="sidebar-bottom"><span className="local-dot"/><span>Local workspace<small>Models run on this device</small></span><LockKeyhole size={16}/></div></aside>
    <div className="workspace"><header className="topbar"><div className="breadcrumbs">Workspace <ChevronRight size={13}/><span>{screen==='input'?'New Specification':'Recommendations'}</span></div><div className="flex items-center gap-3"><button className="connection-button" onClick={()=>setConnection(!connection)} aria-expanded={connection}><span className={`status-dot ${connected?'online':''}`}/>{connected?'API connected':'Check connection'}<Settings2 size={14}/></button><span className="avatar" aria-label="Local procurement officer">PO</span></div></header>
    {demo&&<div className="demo-banner"><span className="badge badge-demo">DEMO WORKSPACE</span><span>Phase 2 sample includes <strong>MOCK / SYNTHETIC</strong> standards. Fixtures have no legal effect.</span></div>}
    {connection&&<section className="connection-panel" aria-label="Connection"><div><h2>Local API connection</h2><p className="text-xs text-muted">{proxyAuth?'The demo proxy supplies a temporary local key. It is never sent to the browser.':'Enter your API key. It stays in memory for this tab and is not saved to browser storage.'}</p></div>{!proxyAuth&&<label className="flex flex-1 items-center gap-3 text-sm">API key<input type="password" autoComplete="off" value={apiKey} onChange={e=>setApiKey(e.target.value)} /></label>}<button className="icon-button" onClick={()=>setConnection(false)} aria-label="Close connection settings"><X size={18}/></button></section>}
    <main id="main" className="main-content">
    <div className="page-heading"><div><p className="eyebrow">{screen==='input'?'TENDER WORKSPACE':'SPECIFICATION REVIEW'}</p><h1 ref={heading} tabIndex={-1}>{screen==='input'?'New Specification':'Recommendations'}</h1><p className="page-description">{screen==='input'?'Turn procurement requirements into an evidence-backed standards shortlist.':'Review standards, related requirements, and the evidence behind each match.'}</p></div>{screen==='results'&&<button className="button button-secondary" onClick={download}><Download size={16}/>Export evidence</button>}</div>
    {screen==='input'?<div className="content-grid"><form className="input-panel" onSubmit={submit} aria-busy={busy}>
      <div className="panel-heading"><div className="flex items-center gap-2"><FileText size={18}/><h2>Your specification</h2></div><span className="text-xs text-muted">01 / 02</span></div>
      <div className="panel-body"><div className="flex flex-wrap items-center justify-between gap-3 mb-4"><label htmlFor="specification" className="field-label mb-0">What are you procuring?</label><div className="language-toggle" role="group" aria-label="Input language">{([['en','English'],['hi','हिन्दी'],['hi-Latn','Hinglish']] as const).map(([code,label])=><button type="button" key={code} aria-pressed={language===code} onClick={()=>setLanguage(code)} disabled={busy}>{label}</button>)}</div></div>
      <textarea id="specification" lang={language==='hi'?'hi':'en'} value={text} disabled={Boolean(file)||busy} onChange={e=>setText(e.target.value)} maxLength={100000} placeholder={language==='hi'?'उत्पाद, सामग्री और उपयोग का विवरण लिखें…':language==='hi-Latn'?'Aapko kya procure karna hai? Product aur material ka detail likhiye…':'Describe the product, material, intended use, and any known IS references…'}/>
      <div className="flex justify-between items-center gap-3 mt-2"><span className="text-xs text-muted">{file?'The uploaded file will be used instead of pasted text.':'Product names and intended use help find better matches.'}</span><span className="text-xs text-muted tabular-nums">{text.length.toLocaleString()} / 100,000</span></div>
      <label className="checkbox-row mt-4"><input type="checkbox" checked={tender||Boolean(file)} disabled={Boolean(file)||busy} onChange={e=>setTender(e.target.checked)}/>This is a tender with multiple products or paragraphs</label>
      <div className="or-divider"><span>or upload a tender</span></div>
      <div className={`dropzone ${dragging?'dragging':''} ${file?'has-file':''}`} onDragOver={e=>{e.preventDefault();if(!busy)setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);if(!busy){if(e.dataTransfer.files.length>1)setError('Upload one tender document at a time.');else chooseFile(e.dataTransfer.files[0]);}}}>
        <input ref={inputRef} type="file" accept=".pdf,.docx" aria-label="Upload tender document" className="sr-only" tabIndex={-1} onChange={e=>{chooseFile(e.target.files?.[0]);e.target.value='';}} disabled={busy}/>
        {file?<><FileCheck2 size={27}/><div className="min-w-0"><strong className="break-all text-sm">{file.name}</strong><p className="text-xs text-muted mt-1">{(file.size/1024).toFixed(1)} KiB · ready to read locally</p></div><button type="button" className="icon-button" onClick={()=>setFile(null)} disabled={busy} aria-label="Remove uploaded file"><X size={18}/></button></>:<><span className="upload-icon"><UploadCloud size={23}/></span><p>Drag your document here, or <button type="button" className="text-link" disabled={busy} onClick={()=>inputRef.current?.click()}>browse files</button></p><p className="text-xs text-muted">PDF or DOCX · up to 5 MiB · selectable text required</p></>}
      </div>
      <details className="scope-options"><summary><Settings2 size={14}/>Certification scope (optional)<ChevronDown size={14}/></summary><label className="field-label mt-4" htmlFor="product-category">Product category — officer supplied</label><select id="product-category" value={category} disabled={busy} onChange={e=>{setCategory(e.target.value);setContext({});}}>{categories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><p className="text-xs text-muted mt-2">Only a small, dated category subset is mapped. An absent rule does not mean exempt.</p>
      {category&&<div className="mt-3 space-y-2">{[['domestic_supply','Domestic supply in India'],['exemption_claimed','An exemption is claimed'],...(category==='gold_jewellery_artefacts'?[['district_in_current_annexure','District is in the current gold-hallmarking annexure']]:[])].map(([key,label])=><label className="scope-field" key={key}>{label}<select value={key in context?String(context[key]):''} onChange={e=>setContext(c=>{const next={...c};if(e.target.value==='')delete next[key];else next[key]=e.target.value==='true';return next;})}><option value="">Not confirmed</option><option value="true">Yes</option><option value="false">No</option></select></label>)}</div>}</details>
      {error&&<div className="error-box" role="alert"><AlertTriangle size={18}/><p>{error}</p></div>}
      </div><div className="panel-footer"><p><LockKeyhole size={13}/>Local processing · metadata only</p><button className="button button-primary" disabled={busy||(!text.trim()&&!file)} type="submit">{busy?<><LoaderCircle size={17} className="animate-spin"/>Finding standards… {seconds}s</>:<>Find standards<ArrowRight size={17}/></>}</button></div>
      {busy&&<div className="loading-status" role="status">Reading your specification, checking the local knowledge base, and saving the evidence trail. Translation may take longer on the first query.</div>}
    </form><aside className="right-column"><section className="guide-panel"><span className="guide-icon"><Sparkles size={20}/></span><h2>A stronger tender starts<br/>with the right standard.</h2><p>Get a shortlist you can inspect, question, and trace back to its source.</p><ol className="guide-steps"><li><span>1</span><div><strong>Describe your requirement</strong><p>Paste text or upload your tender.</p></div></li><li><span>2</span><div><strong>Review the evidence</strong><p>Check versions, allied standards, and certification scope.</p></div></li><li><span>3</span><div><strong>Make the final call</strong><p>Confirm or correct each suggestion.</p></div></li></ol></section>
    <section className="sample-panel"><h2><FolderOpen size={16}/>Try a sample</h2><p>Use an existing KB record to explore the workflow.</p>
      {demo&&<button disabled={busy} onClick={()=>sample('IS-SEED-1001:2020')} className="sample-button"><span>Street-lighting fixture<small>MOCK / SYNTHETIC · superseded edition</small></span><ArrowRight size={15}/></button>}
      <button disabled={busy} onClick={()=>sample('IS 9550:2024','en','bright_steel_bars')} className="sample-button"><span>Bright steel bars<small>Verified metadata · ISI category rule</small></span><ArrowRight size={15}/></button>
      <button disabled={busy} onClick={()=>sample('लकड़ी की बेडसाइड मेज','hi')} className="sample-button"><span>Bedside table in Hindi<small>Local translation and retrieval</small></span><ArrowRight size={15}/></button>
    </section><p className="metadata-note"><BookOpen size={15}/>This workspace uses public metadata. It does not reproduce standards full text.</p></aside></div>:
    report&&<><div className="results-toolbar"><button className="text-link flex items-center gap-1" onClick={()=>setScreen('input')}><ArrowLeft size={15}/>Edit specification</button><span>{report.primary_standards.length} candidate{report.primary_standards.length===1?'':'s'} · {new Date(report.timestamp).toLocaleString()}</span></div>
    {report.synthetic_enabled&&!demo&&<div className="demo-banner mb-4">MOCK / SYNTHETIC results are enabled for this response. Fixtures have no legal effect.</div>}
    <div className={`decision-banner ${report.status.includes('review')||report.status==='ambiguous'?'needs-review':''}`} role="status"><ShieldCheck size={21}/><div><strong>{report.status.includes('review')||report.status==='ambiguous'?'Human review required':'An evidence-backed starting point'}</strong><p>{report.message}</p><p className="text-xs mt-1">All candidates require officer review; a score does not establish legal applicability.</p></div></div>
    <div className="content-grid results-grid"><div className="space-y-5">{report.primary_standards.length?report.primary_standards.map((item,i)=><StandardCard key={`${report.recommendation_id}-${item.record_id}`} item={item} index={i} reportId={report.recommendation_id} apiKey={apiKey}/>):<section className="empty-state"><Search size={32}/><h2>No candidates to show</h2><p>The local knowledge base did not produce a match. Try a product name, material, or a known IS number.</p><button className="button button-primary" onClick={()=>setScreen('input')}>Revise specification</button></section>}</div>
    <aside className="right-column"><section className="context-panel"><h2><FileText size={16}/>Your specification</h2><p className="original-text" lang={report.normalization.detected_language==='hi'?'hi':undefined}>{report.query_text}</p><div className="context-meta"><Globe2 size={13}/>{report.normalization.detected_language} · {titleCase(report.normalization.status)}</div>{report.normalization.normalized_text!==report.query_text&&<><h3 className="section-label mt-4">Used for retrieval</h3><p className="text-sm whitespace-pre-wrap">{report.normalization.normalized_text||'No English terms available.'}</p></>}{report.normalization.notices.map((notice,i)=><p key={i} className="notice-text">{notice}</p>)}</section>
      <section className="context-panel"><h2><ShieldCheck size={16}/>Category rules</h2><p className="text-xs text-muted mb-4">Dated mappings from the shortlisted records and any category you supplied.</p><Certification rules={report.certification_requirements}/></section>
      {report.extraction&&(report.extraction.manual_review_clauses.length>0||report.extraction.omitted_phrases.length>0)&&<section className="context-panel review-panel"><h2><AlertTriangle size={16}/>Tender coverage needs review</h2><p className="text-sm">Some clauses could not be resolved or exceeded the extraction limit.</p><details className="mt-3"><summary className="text-link">View unhandled clauses</summary><pre className="json-block">{JSON.stringify(report.extraction,null,2)}</pre></details></section>}
      <section className="audit-panel"><Link2 size={17}/><h2>Evidence trail saved</h2><p>Original input, scores, source records, and rule snapshots are recorded for review.</p><code>{report.recommendation_id}</code><button className="text-link mt-3 flex items-center gap-1" onClick={download}>Download full JSON<Download size={13}/></button></section>
    </aside></div></>}
    <footer className="page-footer"><span>Standards Desk · Procurement decision support</span><span>Human judgment. Traceable evidence.</span></footer>
    </main></div></div>;
}
