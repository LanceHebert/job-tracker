"use client";
import { useEffect, useMemo, useRef } from "react";

export default function Clipper() {
  const bookmarklet = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const target = `${origin}/new`;
    const code = `(()=>{try{
      function tryDirect(d){
        try{ var ww=window.open(d,'_blank','noopener,noreferrer'); if(ww){ try{ww.opener=null;}catch(_){ } return true } }catch(_e){}
        return false
      }
      // Pre-open a blank tab synchronously to avoid popup blockers
      var w=window.open('', '_blank');
      if(w){ try{ w.opener=null; }catch(_e){} }
      function openDest(d){
        if(tryDirect(d)) return;
        if(w){ try{ w.location=d; return; }catch(_x){} }
        // Try anchor click with target _blank
        try{
          var a=document.createElement('a'); a.href=d; a.target='_blank'; a.rel='noopener';
          (document.body||document.documentElement).appendChild(a); a.click(); a.parentNode.removeChild(a);
          return;
        }catch(_y){}
        // Try form submit with target _blank (often allowed when user-initiated)
        try{
          var f=document.createElement('form'); f.action=d; f.method='GET'; f.target='_blank';
          (document.body||document.documentElement).appendChild(f); f.submit(); f.parentNode.removeChild(f);
          return;
        }catch(_z){}
        // Last resort: same-tab
        try{ location.assign(d); }catch(__){}
      }
      function text(sel){var el=document.querySelector(sel);return el?String(el.textContent||'').trim():''}
      function html(sel){var el=document.querySelector(sel);return el?String(el.innerText||el.textContent||'').trim():''}
      function textAll(sel){var list=document.querySelectorAll(sel), out=''; for(var i=0;i<list.length && i<4;i++){var t=String(list[i].innerText||list[i].textContent||'').trim(); if(t){out+= (out?' \u2022 ':'')+t}} return out}
      function fromJSONLD(){try{var scripts=document.querySelectorAll('script[type="application/ld+json"]');for(var i=0;i<scripts.length;i++){try{var d=JSON.parse(scripts[i].textContent||'{}');var arr=Array.isArray(d)?d:[d];for(var j=0;j<arr.length;j++){var n=arr[j];if(n && (n['@type']==='JobPosting'||(Array.isArray(n['@type'])&&n['@type'].indexOf('JobPosting')>-1)) && n.description){var tmp=document.createElement('div'); tmp.innerHTML=String(n.description); return tmp.innerText.trim()}}}catch(_){} } }catch(_e){} return ''}
      function getDesc(){
        var picks=[
          '#jobDescriptionText', '[data-testid*="JobDescriptionText"]', '.jobsearch-jobDescriptionText', // Indeed
          '.show-more-less-html__markup', '[data-test-id*="job-details"]', '[data-job-description]', // LinkedIn
          '.posting-description', '.section.page-full-width', // Lever
          '[data-automation-id="jobPostingDescription"]', // Workday
          '[data-testid*="job-description"]', // Ashby
          '.content [itemprop="description"]', '[itemprop="description"]', '.content .section', '.description'
        ];
        for(var k=0;k<picks.length;k++){var s=picks[k]; var h=html(s); if(h && h.length>60){
          // Trim boilerplate common on Indeed
          h=h.replace(/\s+Find jobs, Company reviews, Salaries.*$/i,'').trim();
          return h;
        }}
        var ld=fromJSONLD(); if(ld && ld.length>60) return ld;
        var fallback=textAll('article, main, [role="main"]'); if(fallback.length>120) return fallback;
        return '';
      }
      var body=(document.body && (document.body.innerText||''))||''; var lower=body.toLowerCase();
      var url=location.href; var source=location.hostname;
      function cleanTitle(t){ if(!t) return ''; t=t.replace(/\s+/g,' ').trim();
        // Drop obvious Indeed search headings
        if(/what/i.test(t)&&/where/i.test(t)) return '';
        if(/find jobs|company reviews|salaries/i.test(t)) return '';
        return t.length>200? t.slice(0,200): t;
      }
      function pickTitle(){
        var host=location.hostname;
        var picks=[];
        if(/indeed\./i.test(host)){
          picks.push('h1.jobsearch-JobInfoHeader-title');
          picks.push('#jobsearch-ViewjobPaneWrapper h1');
          picks.push('[data-testid*="JobInfoHeader-title"]');
          picks.push('[data-testid*="jobTitle"]');
        }
        // Generic fallbacks (LinkedIn, Ashby, etc.)
        picks.push('h1');
        picks.push('[data-test-id="top-card-layout__title"]');
        picks.push('[data-testid*="job-title"]');
        picks.push('[class*="jobTitle"]');
        for(var i=0;i<picks.length;i++){ var t=cleanTitle(text(picks[i])); if(t) return t }
        return cleanTitle(document.title||'');
      }
      var title=pickTitle();
      var company=text('[data-company],[data-test-company-name],[data-testid*="company"],a[href*="/company"],[class*="company"]')||'';
      var loc=text('[data-test-location],[data-testid*="location"],[class*="location"],[itemprop="jobLocation"]')||'';
      var salary=textAll('[data-testid*="salary"],[class*="salary"],[data-test*="salary"],[id*="salary"]');
      var remoteType=''; if(lower.indexOf('remote')>-1) remoteType='REMOTE'; else if(lower.indexOf('hybrid')>-1) remoteType='HYBRID'; else if(lower.indexOf('on-site')>-1||lower.indexOf('onsite')>-1||lower.indexOf('on site')>-1) remoteType='ONSITE';
      var desc=getDesc();
      function add(k,v){return v?('&'+k+'='+encodeURIComponent(v)):''}
      var dest='${target}?from=clipper'+add('title',title)+add('company',company)+add('location',loc)+add('salary',salary)+add('remoteType',remoteType)+add('url',url)+add('source',source)+add('description',desc);
      openDest(dest);
    }catch(e){alert('Clip failed: '+(e&&e.message?e.message:e))}})();`;
    return `javascript:${encodeURIComponent(code)}`;
  }, []);

  const linkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (linkRef.current) linkRef.current.setAttribute("href", bookmarklet);
  }, [bookmarklet]);

  return (
    <div className="min-h-screen p-6 sm:p-10">
      <div className="max-w-2xl mx-auto rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-3">Job Clipper</h1>
        <p className="text-sm text-slate-600 mb-4">Drag this button to your bookmarks bar. When on a job page, click it to prefill the Add Job form.</p>
        <a ref={linkRef} className="inline-block px-4 py-2 bg-black text-white rounded-md" href="#" onClick={(e)=>e.preventDefault()}>Save Job</a>
        <p className="text-xs text-slate-500 mt-2">Clicking here is disabled for security; use it from your bookmarks bar.</p>
      </div>
    </div>
  );
}


